# Research & Analysis: UI Layout Refinement & Shareable Links

**Phase 0: Research & Unknowns Resolution**  
**Status**: Complete | **Date**: October 30, 2025

## Executive Summary

All key technical unknowns have been resolved through examination of Feature 003 (Base16 & Base32) implementation and existing codebase patterns. No blocking research items remain. The specification is clear enough to proceed to Phase 1 design.

---

## Research Topics

### 1. Sidebar Component Architecture

**Question**: How should the sidebar multi-open groups functionality be implemented in React?

**Investigation**:
- Examined current `src/components/Layout/Sidebar.tsx` implementation from Feature 003
- Verified current Sidebar uses simple state for tool navigation
- Identified that React 18.2 context/hooks are available for state management
- Reviewed Base16/Base32 implementation patterns to ensure consistency

**Decision**: 
- **Use custom hook (`useSidebarState`)** for multi-open groups state management
- State shape: `Record<string, boolean>` mapping group IDs to open/closed status
- Hook handles all toggle logic; Sidebar component is purely presentational
- **Rationale**: Keeps component logic clean, testable, reusable; aligns with React best practices

**Complexity Analysis**:
- Toggle group: O(1) operation (single boolean flip)
- Render sidebar: O(n) where n = number of groups (max 3, acceptable)
- No performance concerns with multi-open state

**Risk Assessment**: LOW - Pattern is standard React; verified in similar projects

---

### 2. Layout Consistency - 20/40/40 Pattern

**Question**: How is the 20/40/40 column layout currently implemented in Base16/Base32 tools?

**Investigation**:
- Examined `src/components/Tools/Base16EncodeTool.tsx` and `Base32EncodeTool.tsx`
- Verified layout uses Tailwind CSS grid: `grid-cols-5` with column spans (1 col for Settings, 2 cols each for Input/Output)
- Confirmed independent vertical scrolling per column with `overflow-y-auto` and fixed heights
- Identified layout is driven by responsive container queries or fixed viewport breakpoints

**Decision**:
- **Reuse existing Tailwind grid pattern** from Base16/Base32 for Base64 tools
- Container: `grid grid-cols-5 gap-4 h-full`
- Settings column: `col-span-1 overflow-y-auto`
- Input column: `col-span-2 overflow-y-auto`
- Output column: `col-span-2 overflow-y-auto`
- **Rationale**: Ensures consistency; reduces code duplication; leverages proven pattern

**Verification**: Will validate through integration tests (layout-consistency.test.tsx) measuring actual column widths at multiple viewport sizes

**Risk Assessment**: LOW - Pattern already proven in production; simple CSS application

---

### 3. URL Parameter Encoding Strategy

**Question**: What URL encoding approach is best for sharing tool state?

**Investigation**:
- Examined existing URL handling in React Router setup
- Verified browser's native URLSearchParams API is available (ES6 standard)
- Researched URL length limits: most browsers support 2000+ characters safely
- Reviewed share parameter requirements from spec (input, input_encoding, tool-specific settings)

**Decision**:
- **Use native URLSearchParams API** for encoding/decoding
- Format: `?input={base64_encoded_text}&input_encoding={encoding}&{tool_params}`
- Example: `?input=SGVsbG8gV29ybGQ%3D&input_encoding=utf-8&padding=false`
- Input text encoded using Base64 before URL encoding (reduces special character issues)
- **Rationale**: Native API is performant, well-tested, built into all modern browsers; Base64 pre-encoding ensures reliability

**Edge Cases Handled**:
- Very long inputs (1000+ chars): URLs up to 2000 chars are safe; document this limit
- Special characters (emoji, Unicode): Base64 handles all UTF-8 correctly
- Missing parameters: Validation function returns defaults for any missing param
- Invalid Base64: Try-catch wrapper treats invalid params as missing (defaults applied)

**Risk Assessment**: LOW - Approach is standard; URLSearchParams is browser-standard; Edge cases have clear handling

---

### 4. Share Button UI Component

**Question**: How should the Share button dropdown be implemented?

**Investigation**:
- User clarification (Q3) specifies: separate button with dropdown, URL display, copy icon
- Examined existing button patterns in `src/components/Tools/*.tsx` files
- Verified Tailwind CSS provides dropdown component patterns
- Researched copy-to-clipboard: navigator.clipboard.writeText() is standard (all modern browsers)

**Decision**:
- **Separate Share button component** (`ShareButton.tsx`) with dropdown display on click
- Dropdown shows: URL text (read-only or selectable) + copy icon button
- Copy icon uses `navigator.clipboard.writeText()` for clipboard access
- Success feedback: Brief toast notification (1.5s) confirming "Copied!"
- **Rationale**: Matches user requirement exactly; follows modern web UX patterns; clean separation of concerns

**Implementation Pattern**:
```tsx
// Pseudo-code structure
<ShareButton 
  toolName="base64_encode"
  currentInput={input}
  currentSettings={settings}
>
  {isOpen && (
    <ShareDropdown 
      url={generatedUrl} 
      onCopy={handleCopy}
    />
  )}
</ShareButton>
```

**Risk Assessment**: VERY LOW - All APIs are standard; pattern widely used; no unusual edge cases

---

### 5. URL Parameter Persistence & Restoration

**Question**: How should tools restore state from URL parameters on page load?

**Investigation**:
- Examined React Router setup in `src/App.tsx`
- Verified useSearchParams hook is available (React Router v6)
- Researched proper lifecycle: parse params on mount, validate, apply to component state
- Reviewed test patterns from Feature 003 for state initialization

**Decision**:
- **Use React Router's `useSearchParams` hook** in each tool component
- On component mount: Extract params, validate, set tool state
- Handle missing params by applying tool defaults (no error messages)
- Handle invalid encoding by attempting to decode; fallback to defaults if decode fails
- **Rationale**: Integrates seamlessly with existing routing; idiomatic React pattern; clear responsibility separation

**Implementation Pattern**:
```tsx
// In Base64EncodeTool.tsx
const [searchParams] = useSearchParams();

useEffect(() => {
  const input = searchParams.get('input'); // Already URL-decoded by React Router
  const encoding = searchParams.get('input_encoding') || 'utf-8';
  
  if (input) {
    try {
      const decoded = atob(input); // Decode from Base64
      setInput(decoded);
    } catch (e) {
      // Invalid Base64, use defaults
      setInput('');
    }
  }
  setInputEncoding(encoding);
}, [searchParams]);
```

**Risk Assessment**: LOW - Pattern is idiomatic React Router; well-tested; error handling is defensive

---

### 6. Backward Compatibility - Base64 Existing Functionality

**Question**: How should the layout update to Base64 tools maintain backward compatibility?

**Investigation**:
- Examined current `src/components/Tools/Base64EncodeTool.tsx` and `Base64DecodeTool.tsx`
- Verified existing functionality: input/output fields, encoding settings (utf-8/ascii/latin-1)
- User clarification (Q4) specifies: preserve current Base64 functionality, only update layout
- Confirmed no breaking changes needed

**Decision**:
- **Layout change is CSS-only**; no changes to input/output/settings logic
- Apply same Tailwind grid pattern used in Base16/Base32
- All existing props, methods, and behaviors remain unchanged
- No migration of data; no new required parameters
- **Rationale**: Minimizes risk; no logic changes needed; only visual reorganization

**Verification**: Contract test ensures input/output behavior unchanged after layout update

**Risk Assessment**: VERY LOW - Change is purely presentational; existing logic untouched

---

## Unknowns Resolution Summary

| Unknown | Decision | Rationale | Risk |
|---------|----------|-----------|------|
| Sidebar state management | Custom hook (useSidebarState) | Clean, testable, follows React patterns | LOW |
| 20/40/40 layout implementation | Reuse Tailwind grid from Base16/Base32 | Proven pattern, consistency, reduces duplication | LOW |
| URL encoding approach | URLSearchParams + Base64 input pre-encoding | Standard API, reliable, handles edge cases | LOW |
| Share button UI | Separate button with dropdown, copy icon | Matches user requirement, modern UX pattern | VERY LOW |
| URL parameter restoration | React Router useSearchParams on mount | Idiomatic React, integrates seamlessly | LOW |
| Base64 backward compatibility | Layout-only CSS changes, preserve logic | Minimizes risk, no breaking changes | VERY LOW |

## Unknowns Remaining

**NONE** - All technical questions have been researched and resolved. Specification is sufficiently clear to proceed to Phase 1 design.

---

## Design Validation Checklist

- ✅ Sidebar multi-open state architecture is clear and scalable
- ✅ Layout pattern is proven and consistent with existing tools
- ✅ URL encoding strategy handles all identified edge cases
- ✅ Share button UI matches user requirements
- ✅ Parameter restoration logic follows React best practices
- ✅ Backward compatibility preserved for existing Base64 functionality
- ✅ No blocking technical unknowns remain
- ✅ Ready to proceed to Phase 1 (Design) with confidence

---

**Next Phase**: Phase 1 - Design (data-model.md, API contracts, quickstart.md)
