# Feature Specification: UI/UX Refinement for Desktop-Primary Experience

**Version**: 1.0.0  
**Date**: 2025-10-29  
**Status**: Ready for Planning  
**Feature Branch**: 002-ui-ux-refinement  
**Related Specs**: `001-web-tools-platform/spec.md` (base platform), `001-web-tools-platform/ui-design.md` (previous UI design)

---

## 1. Executive Summary

This feature refines the Online Developer Tools platform UI/UX for a desktop-primary experience. Key improvements include:
- **Full-height responsive layout** optimized for developer workflows
- **Separate tool pages** for Base64 Encode and Decode (sidebar now shows 2 items)
- **Enhanced controls** with auto-update toggle, Encode/Decode button, and format/encoding selectors
- **Header-integrated tool title** for reduced content area padding
- **Simplified theme system** (light/dark only, light by default)
- **Rebranding** from "Online Tools" to "Online Developer Tools"

**Outcome**: Developers experience a cleaner, more focused workflow with explicit control over auto-update behavior and clear separation of encode/decode operations.

---

## 2. User Scenarios & Testing

### Scenario 1: Developer Encodes Text (Auto-Update ON)
**Actor**: Backend developer  
**Goal**: Quickly encode sensitive data to Base64  
**Steps**:
1. Open app → Sidebar shows "Base64 Encode" and "Base64 Decode" items
2. Click "Base64 Encode"
3. Header displays: "Base64 Encode" (moved from content area)
4. Content area fills browser height (no padding at top/bottom)
5. Settings column shows: Auto-Update toggle (ON by default), Input Encoding dropdown, Format dropdown
6. Type text in Input column
7. Output appears automatically (200ms debounce)
8. Click Copy button → Result copied to clipboard
9. Close tool

**Success**: Output updates in real-time without manual button press; interface is clean and full-height

---

### Scenario 2: Developer Decodes with Auto-Update OFF
**Actor**: Frontend developer  
**Goal**: Decode Base64 string with fine-grained control  
**Steps**:
1. Click "Base64 Decode" in sidebar
2. Header displays: "Base64 Decode"
3. Toggle Auto-Update OFF (in Settings column)
4. Paste Base64 string in Input column
5. Click "Decode" button (now visible since auto-update is OFF)
6. Output appears after manual execution
7. Copy output to clipboard

**Success**: Manual control respected; Decode button appears when needed; clear UX feedback

---

### Scenario 3: User Switches Theme
**Actor**: Any user  
**Goal**: Switch between Light and Dark modes  
**Steps**:
1. Click theme toggle in header (Sun/Moon icon)
2. App immediately switches theme
3. Both light and dark modes render correctly
4. Theme persists on page reload

**Success**: Theme toggle responsive; only two modes available; light is default; persistence works

---

### Scenario 4: Developer Uses Format/Encoding Selectors
**Actor**: Security engineer  
**Goal**: Compare different Base64 format standards  
**Steps**:
1. In Settings column, Input Encoding dropdown shows options (e.g., "UTF-8", "ASCII")
2. Format dropdown shows: "RFC 4648", "URL-safe", etc.
3. Change Input Encoding → Output updates (if auto-update ON)
4. Change Format → Output updates accordingly
5. See real-time results for different configurations

**Success**: Dropdowns control tool behavior; selections persist during session; output reflects selections

---

## 3. Functional Requirements

### 3.1 Branding & Project Name
- **Req-001**: Update project name from "Online Tools" to "Online Developer Tools" across:
  - Header title/logo
  - Browser tab title (`<title>` tag)
  - Meta description
  - Sidebar header (if applicable)
- **Acceptance**: All references updated; no "Online Tools" text visible in UI

---

### 3.2 Theme System
- **Req-002**: Implement light/dark theme toggle with only two modes:
  - Light mode (default on first load)
  - Dark mode
  - Remove any "System" or "Auto" mode
- **Acceptance**: Theme toggle in header; only 2 modes; light is default; persists to localStorage

---

### 3.3 Tool Separation (Base64)
- **Req-003**: Split Base64 Tool into two separate tools with distinct pages:
  - "Base64 Encode" (toolId: `base64-encode`)
  - "Base64 Decode" (toolId: `base64-decode`)
  - Each tool has its own service implementation with identical signatures
- **Req-004**: Update ToolRegistry to register both tools
  - Sidebar shows both as separate items (with distinct icons/labels)
  - Clicking each navigates to distinct page
- **Acceptance**: Sidebar displays 2 items; clicking each loads correct tool; navigation works

---

### 3.4 Header Integration
- **Req-005**: Move tool title from content area to header:
  - Tool title displays in header (e.g., "Base64 Encode" or "Base64 Decode")
  - Tool description (optional) displays below title in smaller text
  - Remove `<h1>` and description from ToolWrapper component
- **Acceptance**: Title visible in header; no title in content area; layout cleaner

---

### 3.5 Content Area Layout
- **Req-006**: Remove top/bottom padding from content area to maximize vertical space:
  - Content area fills browser height (minus header)
  - Sidebar maintains padding
  - 3-column grid expands vertically to use full height
  - Each column fills available height
- **Req-007**: All columns (Settings, Input, Output) expand to fill container height:
  - Settings accordion can be collapsed/expanded without height constraints
  - Input field resizable to full height of container
  - Output field resizable to full height of container
- **Acceptance**: Content area flush with bottom of screen; columns expandable; no wasted space

---

### 3.6 Settings Column Enhancements
- **Req-008**: Add "Auto-Update" toggle switch in Settings column:
  - Label: "Auto-Update"
  - Default: ON (enabled by default)
  - When ON: Output updates automatically (200ms debounce) as user types
  - When OFF: Output only updates when manual button pressed
  - Toggle persists during session (not persisted to localStorage)
- **Acceptance**: Toggle visible in Settings; works as specified; default is ON

---

### 3.7 Format/Encoding Selectors
- **Req-009**: Add "Input Encoding" dropdown selector in Settings column:
  - Options: UTF-8 (default), ASCII, Latin-1, others as needed
  - Label: "Input Encoding"
  - Selection affects how input is processed
  - Changes trigger auto-update if enabled
- **Req-010**: Add "Format" dropdown selector in Settings column:
  - Options: RFC 4648 (default), URL-safe, others
  - Label: "Format"
  - Selection affects output encoding
  - Changes trigger auto-update if enabled
- **Acceptance**: Both dropdowns visible; options functional; auto-update respects changes

---

### 3.8 Encode/Decode Button
- **Req-011**: Add manual Encode/Decode button:
  - Button visible only when Auto-Update is OFF
  - Label changes based on tool: "Encode" or "Decode"
  - Clicking executes tool with current input/options
  - Disabled when input is empty
  - Shows loading state during execution
- **Acceptance**: Button appears only when needed; executes correctly; proper state feedback

---

### 3.9 Terminology Updates
- **Req-012**: Change terminology throughout UI:
  - "Options" → "Settings" (in ToolOptions/accordion header)
  - Update all labels, help text, and UI strings accordingly
- **Acceptance**: All occurrences of "Options" replaced with "Settings"

---

## 4. Success Criteria

### User Experience
- **UX-001**: Developers can encode/decode Base64 in <10 seconds (including copying output)
- **UX-002**: Auto-Update toggle provides clear control over execution flow (observable change within 1s)
- **UX-003**: Tool title always visible in header; no confusion about active tool
- **UX-004**: Content area uses 100% of browser height (no vertical wasted space)

### Functionality
- **FUNC-001**: Auto-Update toggle defaults to ON and can be toggled OFF without errors
- **FUNC-002**: Manual Encode/Decode button executes correctly and respects input validation
- **FUNC-003**: Format/Encoding selectors change output within 200ms (auto-update debounce)
- **FUNC-004**: Both Base64 Encode and Decode tools function identically to current version but as separate pages

### Technical
- **TECH-001**: Theme system has exactly 2 modes (light/dark); no "System" mode
- **TECH-001a**: Light theme is default on first load (not system preference)
- **TECH-002**: All TypeScript code passes strict mode with 0 errors
- **TECH-003**: No console warnings or errors in browser DevTools
- **TECH-004**: Performance: Any option change reflects in output <200ms

### Visual/Design
- **VIS-001**: Header displays tool title consistently (same font size/weight as before)
- **VIS-002**: Settings/Input/Output columns expand to fill container height
- **VIS-003**: Theme toggle shows only Sun (light) and Moon (dark) icons
- **VIS-004**: "Online Developer Tools" branding visible in header
- **VIS-005**: No visual regression in existing components

---

## 5. Key Entities & Data Model

### Tool Separation
```typescript
// Before: Single Base64 Tool
{
  id: 'base64',
  name: 'Base64 Encoder/Decoder',
  service: base64Service,
  operation: 'encode' | 'decode' // Toggled via UI
}

// After: Two Separate Tools
{
  id: 'base64-encode',
  name: 'Base64 Encode',
  service: base64EncodeService,
  operation: 'encode' // Fixed per tool
},
{
  id: 'base64-decode',
  name: 'Base64 Decode',
  service: base64DecodeService,
  operation: 'decode' // Fixed per tool
}
```

### Settings State
```typescript
interface Base64Settings {
  autoUpdate: boolean;        // Default: true
  inputEncoding: string;      // Default: 'utf8'
  format: 'rfc4648' | 'urlsafe' | string; // Default: 'rfc4648'
}
```

### Header Context
```typescript
interface HeaderContextType {
  title?: string;              // Tool name (e.g., "Base64 Encode")
  description?: string;        // Optional tool description
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
}
```

---

## 6. Assumptions

1. **Desktop-Primary Design**: Mobile responsiveness NOT required for this phase (all users assumed desktop)
2. **Theme Persistence**: Theme stored in localStorage, not in backend/database
3. **Session-Scoped Settings**: Auto-Update toggle, Format, Encoding selections persist during session only (not across browser close)
4. **Format Options**: Assume Base64 format options include RFC 4648 and URL-safe; other formats added as needed
5. **Input Encoding**: UTF-8 is primary; ASCII and Latin-1 available as fallbacks; UI shows 3-5 common options
6. **No Breaking Changes**: Existing Base64 functionality preserved; same output for same inputs
7. **Icon Availability**: Theme toggle icons (Sun/Moon) available in existing icon library (Lucide)
8. **Tool ID Convention**: New tools follow pattern: `{tool-family}-{operation}` (e.g., `base64-encode`, `base64-decode`)

---

## 7. Dependencies & Integration Points

### Component Dependencies
- **Header.tsx**: Must accept `title` and optional `description` props
- **ToolRegistry**: Must support registering 2 separate Base64 tools (currently 1)
- **App.tsx**: Must dynamically render different tool components based on `toolId`
- **Base64Service**: Create separate `Base64EncodeService` and `Base64DecodeService` classes
- **ToolContext**: Must manage `headerTitle` and `headerDescription` globally
- **useTool.ts**: No changes needed (already supports auto-update)

### File Changes Required
- `src/services/base64.ts` → Split into `base64-encode.ts` and `base64-decode.ts`
- `src/components/Tools/Base64Tool.tsx` → Split into `Base64EncodeTool.tsx` and `Base64DecodeTool.tsx`
- `src/components/Layout/Header.tsx` → Add title/description props and rendering
- `src/components/Common/ToolOptions.tsx` → Rename to "Settings" in UI; add Auto-Update toggle
- `src/tools/index.ts` → Register 2 tools instead of 1
- `src/context/ToolContext.tsx` → Add header title/description state
- `src/types/Tool.ts` → Update Tool interface if needed for separate encode/decode

### Configuration Changes
- `package.json`: Update project name in description (metadata only)
- `public/index.html`: Update `<title>` to "Online Developer Tools"
- `tailwind.config.js`: Ensure only 'light' and 'dark' modes (no 'system')

---

## 8. Out of Scope (Deferred)

The following are explicitly NOT included in this feature:
- Mobile responsive refinement (assumed desktop-primary for this round)
- Additional tools beyond Base64 (Phase 4+)
- Advanced encoding options (beyond UTF-8, ASCII, Latin-1)
- Keyboard shortcuts or hotkeys
- Accessibility enhancements (beyond current WCAG AA compliance)
- Unit/E2E tests (can be added post-implementation if needed)
- Documentation updates (will be done separately)

---

## 9. Testing Strategy

### Manual Testing Checklist
- [ ] Theme toggle switches between light/dark only (no system option)
- [ ] Light theme loads by default on first visit
- [ ] Theme persists on page reload
- [ ] Header displays "Online Developer Tools" branding
- [ ] Sidebar shows "Base64 Encode" and "Base64 Decode" as 2 separate items
- [ ] Clicking each navigates to correct tool
- [ ] Tool title appears in header (not in content area)
- [ ] Content area fills full browser height (no top/bottom padding)
- [ ] Auto-Update toggle defaults to ON
- [ ] Auto-Update ON: Output updates automatically while typing
- [ ] Auto-Update OFF: Output only updates when button clicked
- [ ] Encode/Decode button visible only when Auto-Update is OFF
- [ ] Input Encoding dropdown works and updates output
- [ ] Format dropdown works and updates output
- [ ] Settings renamed to "Settings" (not "Options")
- [ ] No console errors or warnings
- [ ] All form inputs functional
- [ ] Copy button works
- [ ] Share button works (if still active)

### Acceptance Testing
- **AT-001**: User can complete encode workflow in <10 seconds
- **AT-002**: Auto-Update toggle provides observable control (visual feedback)
- **AT-003**: Both encode and decode tools render and function correctly
- **AT-004**: Theme switching feels responsive (<100ms visual change)

---

## 10. Clarifications Needed

### Question 1: Tool Separation - Same Icon or Different?
**Context**: Base64 Encode and Base64 Decode will appear as 2 separate items in sidebar

**What we need to know**: Should both items use the same icon (🔤) or different icons (↗️ for encode, ↙️ for decode)?

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | Same icon (🔤) for both | Cleaner UI, but slight visual ambiguity; users rely on label |
| B | Different icons (↗️ encode, ↙️ decode) | Clear visual distinction; uses more icon library; easier at-a-glance |
| Custom | Provide specific icon choice | [Please specify which icons from Lucide or other library] |

**Your choice**: _[Awaiting response]_

---

### Question 2: Input Encoding Options - How Many?
**Context**: Settings column includes "Input Encoding" dropdown with multiple character encoding options

**What we need to know**: How many encoding options should be provided? Should it include legacy/rare encodings?

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | 3 common options: UTF-8, ASCII, Latin-1 | Simplest; covers 95% of use cases |
| B | 5-7 options including UTF-16, UCS-2, others | More comprehensive; slightly complex dropdown |
| C | Dynamic: Start with 3, add more based on user feedback | Lean approach; risk of incomplete MVP |
| Custom | Provide specific list of encodings needed | [Please list exact encoding options] |

**Your choice**: _[Awaiting response]_

---

### Question 3: Format Options - Custom Formats?
**Context**: Settings column includes "Format" dropdown with Base64 variants

**What we need to know**: Should we support only RFC 4648 and URL-safe, or include additional custom formats?

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | 2 formats only: RFC 4648 (standard), URL-safe | Simplest; covers 99% of developer needs |
| B | 3+ formats: RFC 4648, URL-safe, Base32, etc. | More comprehensive but adds complexity |
| C | Start with 2, add more based on user requests | MVP-focused; deferred formats to Phase 4 |
| Custom | Specify exact formats needed | [Please list required formats] |

**Your choice**: _[Awaiting response]_

---

## 11. Definition of Done

✅ Feature is complete when:
1. [ ] All functional requirements (Req-001 through Req-012) implemented
2. [ ] All success criteria (UX-001 through VIS-005) met
3. [ ] TypeScript builds without errors (npx tsc --noEmit = clean)
4. [ ] Dev server runs without warnings (npm run dev)
5. [ ] Manual testing checklist: 15/15 passed
6. [ ] No console errors in browser DevTools
7. [ ] Theme toggle shows only light/dark (no system option)
8. [ ] Tool titles in header functional
9. [ ] Content area fills full height
10. [ ] Both Base64 tools render correctly
11. [ ] Auto-Update toggle works as specified
12. [ ] Settings renamed from "Options" throughout
13. [ ] Project name updated to "Online Developer Tools"
14. [ ] All changes committed to feature branch

---

## 12. Implementation Roadmap

**Phase A: Setup & Infrastructure** (30 min)
- Create Base64 Encode/Decode service classes
- Update ToolRegistry to register both tools
- Create separate tool components

**Phase B: Header Integration** (20 min)
- Add title/description props to Header
- Update ToolContext with header state
- Integrate in App.tsx

**Phase C: Settings Enhancements** (30 min)
- Add Auto-Update toggle
- Add Input Encoding dropdown
- Add Format dropdown
- Update ToolOptions → "Settings" naming

**Phase D: Layout Refinement** (15 min)
- Remove content area padding
- Expand columns to full height
- Show/hide Encode/Decode button

**Phase E: Branding & Theme** (10 min)
- Update project name to "Online Developer Tools"
- Ensure theme toggle has only 2 modes
- Set light as default

**Phase F: Testing & Polish** (15 min)
- Manual testing checklist
- Bug fixes
- Final verification

**Total Estimated Time**: ~2 hours

---

**Next Steps**: Respond to the 3 clarification questions above, then proceed to `/speckit.plan` for detailed implementation plan.
