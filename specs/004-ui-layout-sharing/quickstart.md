# Quickstart Guide: UI Layout Refinement & Shareable Links

**Phase 1: Design Output**  
**Status**: Complete | **Date**: October 30, 2025

## Overview

This guide provides the fastest path to implementing Feature 004. Start here if you're diving into the code.

---

## What We're Building

Three interconnected features:

1. **Multi-Open Sidebar Groups**: Refactor sidebar to allow simultaneous expansion of Base64, Base16, Base32 groups
2. **Consistent 20/40/40 Layout**: Apply proven layout pattern from Base16/Base32 to Base64 tools
3. **Shareable Links with URL Parameters**: Generate URLs that preserve input & settings for sharing

**Expected Time to Implement**: 4-6 hours (based on Feature 003 complexity)

---

## Key Technical Decisions

### 1. Sidebar State Management
- **What**: Use custom `useSidebarState` hook to manage group expand/collapse
- **Why**: Clean separation of concerns; hook manages state, component renders
- **Where**: `src/hooks/useSidebarState.ts` (NEW)
- **Pattern**: `const [state, toggleGroup] = useSidebarState()`
- **Storage**: localStorage for persistence across sessions

### 2. Layout Pattern
- **What**: Reuse Tailwind CSS grid from Base16/Base32 (proven pattern)
- **Where**: Apply to Base64 Encode/Decode in `src/components/Tools/Base64*.tsx`
- **CSS**: `grid grid-cols-5` with column spans: Settings(1) + Input(2) + Output(2)
- **Behavior**: Independent vertical scrolling per column

### 3. URL Parameters
- **Format**: `?input={Base64}&input_encoding={encoding}&{tool_params}`
- **Strategy**: Input is Base64-encoded for safe transport; output NOT included
- **Service**: `src/services/urlParameters.ts` (NEW) - parse/generate
- **Service**: `src/services/shareLink.ts` (NEW) - generate complete URLs

### 4. Share Button
- **Component**: `ShareButton.tsx` (NEW) in `src/components/Tools/`
- **Behavior**: Button → dropdown with URL + copy icon
- **Feedback**: Toast notification on successful copy

### 5. Parameter Restoration
- **Hook**: Use React Router's `useSearchParams` in each tool component
- **Pattern**: On mount, extract URL params → validate → set tool state
- **Defaults**: Missing/invalid params use tool defaults (no error messages)

---

## Implementation Roadmap

### Phase 3: Sidebar Component Refactoring (Est. 30-45 min)

**Goal**: Multi-open sidebar groups

**Files to Create**:
- `src/hooks/useSidebarState.ts` - State management hook

**Files to Modify**:
- `src/components/Layout/Sidebar.tsx` - Add group expand/collapse logic
- `src/components/Layout/AppLayout.tsx` - Pass state to Sidebar

**Key Tasks**:
1. Create `useSidebarState` hook with localStorage persistence
2. Refactor Sidebar to use new state management
3. Remove any accordion behavior (multi-open must work)
4. Add chevron icons with rotation
5. Verify text-only labels (no emoji/images)

**Tests**: Contract tests for sidebar group behavior

### Phase 4: URL Parameter Services (Est. 20-30 min)

**Goal**: URL parameter encoding/decoding infrastructure

**Files to Create**:
- `src/services/urlParameters.ts` - Parse and validate URL params
- `src/services/shareLink.ts` - Generate complete share URLs
- `src/types/tools.ts` - TypeScript types for all entities

**Key Tasks**:
1. Define URLParameters interface and TOOL_PARAMETERS config
2. Implement parameter encoding (input → Base64 → URL encoding)
3. Implement parameter validation and defaults
4. Create shareLink service to generate complete URLs
5. Export validation utilities for component use

**Tests**: Unit tests for encoding/decoding, edge case handling

### Phase 5: Base64 Layout Update (Est. 20-30 min)

**Goal**: Apply 20/40/40 layout to Base64 tools

**Files to Modify**:
- `src/components/Tools/Base64EncodeTool.tsx` - Layout CSS update
- `src/components/Tools/Base64DecodeTool.tsx` - Layout CSS update

**Key Tasks**:
1. Copy Tailwind grid pattern from Base16EncodeTool.tsx
2. Apply to Base64 Encode/Decode components
3. Update column widths to match 20/40/40 ratio
4. Ensure independent scrolling per column
5. Preserve all existing Base64 logic (input/output/encoding settings)

**Tests**: Integration tests verifying layout consistency across 6 tools

### Phase 6: Share Button Component (Est. 30-40 min)

**Goal**: Share button with dropdown and copy functionality

**Files to Create**:
- `src/components/Tools/ShareButton.tsx` - Share button component

**Files to Modify**:
- Each tool component (Base64/16/32 Encode/Decode) - Add ShareButton
- `src/components/Tools/Base64EncodeTool.tsx` - Use shareLink service
- `src/components/Tools/Base16EncodeTool.tsx` - Use shareLink service
- `src/components/Tools/Base32EncodeTool.tsx` - Use shareLink service

**Key Tasks**:
1. Create ShareButton component with:
   - Click to toggle dropdown visibility
   - Display generated URL in dropdown
   - Copy icon that uses `navigator.clipboard.writeText()`
   - Toast notification on copy success
2. Integrate useShareLink hook to generate URLs
3. Add ShareButton to each tool's layout
4. Test on all 6 tools

**Tests**: Contract tests for Share URL generation, component interaction tests

### Phase 7: URL Parameter Restoration (Est. 30-40 min)

**Goal**: Load tool state from URL parameters

**Files to Modify**:
- Each tool component (Base64/16/32 Encode/Decode) - Add useSearchParams logic
- `src/App.tsx` - Ensure React Router is configured correctly

**Key Tasks**:
1. In each tool component mount (useEffect):
   - Extract URL parameters via useSearchParams
   - Validate and decode parameters
   - Apply to tool state (input, inputEncoding, toolSpecificSettings)
   - Re-compute output
2. Handle edge cases:
   - Missing parameters → use defaults
   - Invalid Base64 → treat as missing
   - Unknown encoding → default to utf-8
3. Verify round-trip: input → URL → page load → same input

**Tests**: Contract tests for parameter restoration, full round-trip tests

### Phase 8: Integration & Verification (Est. 30-45 min)

**Goal**: Verify all features work together

**Key Tasks**:
1. Test all 6 encoding tools with sidebar navigation
2. Test share link generation for each tool
3. Test URL parameter restoration in new browser sessions
4. Verify layout consistency across all tools
5. Test edge cases:
   - Long inputs (1000+ chars)
   - Special characters and Unicode
   - Multiple groups expanded simultaneously
   - Very long share URLs
6. Verify success criteria:
   - SC-001: Navigate between tools in <3 clicks ✓
   - SC-002: Consistent 20/40/40 layout across all tools ✓
   - SC-003: Share URL round-trip within 5 seconds ✓
   - SC-004: Sidebar width <20% of screen ✓
   - SC-005: 95% of URLs successfully pre-populate tool ✓
   - SC-006: Layout consistency verified ✓

**Tests**: End-to-end tests covering all user stories

---

## Testing Strategy

### Contract Tests (Phase 1 Design Output)
- **Sidebar**: Multi-open functionality, group toggle, persistence
- **Share Link**: URL generation, parameter encoding
- **URL Parameters**: Round-trip preservation, restoration, edge cases

### Unit Tests (During Implementation)
- Sidebar state hook behavior
- URL parameter validation
- Share button interaction
- Individual component rendering

### Integration Tests (Before Phase 8)
- Sidebar navigation → tool loading
- Share flow → copy → open in new tab
- Layout consistency across tools
- URL parameter round-trip

### Manual Testing (Phase 8)
- All 6 tools with sidebar navigation
- Long inputs and special characters
- Share button copy-paste workflow
- Layout at multiple viewport sizes

---

## Code Examples

### Using useSidebarState Hook

```typescript
// In AppLayout.tsx
import { useSidebarState } from '../hooks/useSidebarState';

export function AppLayout() {
  const [sidebarState, toggleGroup] = useSidebarState();
  
  return (
    <div className="flex h-screen">
      <Sidebar 
        state={sidebarState} 
        onToggleGroup={toggleGroup} 
      />
      <main className="flex-1">{/* tool content */}</main>
    </div>
  );
}
```

### Generating Share URL

```typescript
// In ShareButton.tsx
import { useShareLink } from '../hooks/useShareLink';

export function ShareButton({ toolId, input, inputEncoding, settings }) {
  const { generateShareLink } = useShareLink();
  
  const handleShare = () => {
    const url = generateShareLink(toolId, { input, inputEncoding, ...settings });
    // Open dropdown, display URL
  };
  
  return <button onClick={handleShare}>Share</button>;
}
```

### Restoring State from URL

```typescript
// In Base64EncodeTool.tsx
import { useSearchParams } from 'react-router-dom';
import { validateURLParameters } from '../services/urlParameters';

export function Base64EncodeTool() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [inputEncoding, setInputEncoding] = useState('utf-8');
  
  useEffect(() => {
    // Extract and validate parameters
    const params = Object.fromEntries(searchParams);
    const validated = validateURLParameters(params);
    
    // Apply to state
    if (validated.input) {
      try {
        const decoded = atob(validated.input);
        setInput(decoded);
      } catch (e) {
        setInput(''); // Invalid Base64, use default
      }
    }
    
    setInputEncoding(validated.input_encoding);
  }, [searchParams]);
  
  // ... rest of component
}
```

---

## File Structure Summary

### New Files (Phase 1 Design Output)
```
src/
├── hooks/
│   ├── useSidebarState.ts (State management for sidebar groups)
│   └── useShareLink.ts (Share link generation logic)
├── services/
│   ├── urlParameters.ts (Parameter validation and parsing)
│   └── shareLink.ts (Complete URL generation)
├── types/
│   └── tools.ts (TypeScript interfaces for all entities)
└── components/
    └── Tools/
        └── ShareButton.tsx (Share button with dropdown)

specs/004-ui-layout-sharing/
├── plan.md (This document + implementation details)
├── data-model.md (Domain objects and data structures)
├── research.md (Technical decisions and rationale)
├── contracts/ (Contract test specifications)
└── quickstart.md (This file)
```

### Modified Files
```
src/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx (Add multi-open groups, refactor state)
│   │   └── AppLayout.tsx (Pass sidebar state)
│   └── Tools/
│       ├── Base64EncodeTool.tsx (Layout update, parameter restoration)
│       ├── Base64DecodeTool.tsx (Layout update, parameter restoration)
│       ├── Base16EncodeTool.tsx (Add ShareButton)
│       ├── Base16DecodeTool.tsx (Add ShareButton)
│       ├── Base32EncodeTool.tsx (Add ShareButton)
│       └── Base32DecodeTool.tsx (Add ShareButton)
└── tools/
    └── index.ts (Add TOOL_GROUPS config if needed)
```

---

## Success Indicators

### After Phase 3 (Sidebar)
- ✅ Sidebar displays 3 collapsible groups (Base64, Base16, Base32)
- ✅ Can expand all 3 groups simultaneously (multi-open works)
- ✅ Groups persist in localStorage across sessions
- ✅ Contract tests for sidebar passing

### After Phase 4 (URL Services)
- ✅ urlParameters service validates and parses parameters
- ✅ shareLink service generates complete URLs
- ✅ Unit tests for parameter encoding/decoding passing

### After Phase 5 (Base64 Layout)
- ✅ Base64 tools use 20/40/40 layout matching Base16/Base32
- ✅ All 6 tools have consistent column proportions
- ✅ Layout tests passing

### After Phase 6 (Share Button)
- ✅ Share button visible on all 6 tools
- ✅ Dropdown displays generated URL with copy icon
- ✅ Copy to clipboard works with success feedback

### After Phase 7 (Parameter Restoration)
- ✅ Opening shared URL pre-fills tool with input and settings
- ✅ Round-trip works: input → URL → page load → same input
- ✅ All parameters (input_encoding, tool-specific) restored correctly

### After Phase 8 (Integration)
- ✅ All 6 success criteria validated
- ✅ All acceptance scenarios passing
- ✅ Manual testing complete
- ✅ Ready for production merge

---

## Common Pitfalls to Avoid

1. **Accordion Behavior**: Don't auto-close groups when opening another—multi-open is required
2. **Output in URL**: Never include output in share parameters—compute fresh on load
3. **Icon Removal**: Ensure sidebar is text-only—remove all emoji and image icons
4. **Layout Cascade**: Don't change Base16/Base32 layout—only update Base64 to match
5. **Parameter Validation**: Always validate and default gracefully—never crash on missing/invalid params
6. **URL Length**: Monitor URL lengths to stay under 2000 chars for typical inputs
7. **Copy Feedback**: Ensure user knows copy was successful—use toast or visual confirmation

---

## When You Get Stuck

1. **Sidebar State**: Check `useSidebarState.ts` implementation in Phase 3; localStorage may not persist correctly
2. **Share URL Generation**: Verify `shareLink.ts` correctly Base64-encodes input; test encoding manually
3. **Parameter Restoration**: Use browser DevTools → Network tab to inspect actual query parameters
4. **Layout Mismatch**: Compare Base64 CSS with Base16 CSS—may need to adjust column spans
5. **Copy Icon**: Verify `navigator.clipboard.writeText()` works; may need try-catch for clipboard errors

---

## Next Steps

1. Review data model (`data-model.md`) for TypeScript types
2. Review research (`research.md`) for technical decisions
3. Review contracts (`contracts/`) for test specifications
4. Begin Phase 3: Sidebar refactoring (start with `useSidebarState` hook)
5. Follow implementation roadmap sequentially
6. Run contract tests as each phase completes

---

**Ready to Code**: All design decisions made. Proceed to Phase 2 (Task Decomposition) for detailed task list.
