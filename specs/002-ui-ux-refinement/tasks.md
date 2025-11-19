# Implementation Tasks: UI/UX Refinement for Desktop-Primary Experience

**Feature**: 002-ui-ux-refinement  
**Version**: 1.0.0  
**Date**: 2025-10-29  
**Status**: Ready for Execution  
**Estimated Duration**: 2.5-3.5 hours  
**Phase**: Phase 2 Implementation

---

## Executive Summary

This document defines all implementation tasks for the UI/UX refinement feature. Tasks are organized by **implementation phase** and can be executed **sequentially or in parallel** where noted.

**Key Objectives**:
1. Separate Base64 tool into Encode and Decode (2 sidebar items)
2. Move tool title from content area to header
3. Add auto-update toggle with manual Encode/Decode button
4. Add input encoding (3 options) and format (2 options) dropdowns
5. Implement full-height responsive layout (no padding gaps)
6. Rename "Options" to "Settings" throughout UI
7. Update branding to "Online Developer Tools"
8. Simplify theme to light/dark only (light by default)

**Task Format**: All tasks follow strict checklist format with ID, priority, story labels, and file paths.

---

## Dependency Graph

```
Phase 1 (Foundation)
├── T001: Service Layer Refactoring (base64-base.ts, encode.ts, decode.ts)
├── T002: Tool Registration (tools/index.ts)
└── T003: Context Extension (ToolContext.tsx)
    └─ BLOCKS: All subsequent phases

Phase 2 (Header & Navigation)
├── T004: Header Component Update (Header.tsx)
├── T005: ThemeToggle Simplification (ThemeToggle.tsx)
└── T006: Branding Updates (App.tsx, public/index.html)
    └─ DEPENDS ON: Phase 1 (context extension)
    └─ PARALLEL: Can run with Phase 1

Phase 3 (Tool Separation)
├── T007: [P] Create Base64EncodeTool (Base64EncodeTool.tsx)
├── T008: [P] Create Base64DecodeTool (Base64DecodeTool.tsx)
├── T009: [P] Create Base64EncodeOptions (Base64EncodeOptions.tsx)
└── T010: App Router Update (App.tsx)
    └─ DEPENDS ON: T002 (tool registration), T003 (context)
    └─ PARALLEL: T007, T008, T009 can run in parallel

Phase 4 (Settings Enhancement)
├── T011: [P] Update ToolOptions Component (ToolOptions.tsx)
├── T012: [P] Add Auto-Update Toggle Logic (Base64EncodeOptions.tsx)
├── T013: [P] Add Input Encoding Dropdown (Base64EncodeOptions.tsx)
├── T014: [P] Add Format Dropdown (Base64EncodeOptions.tsx)
└── T015: Add Manual Encode/Decode Button (Base64EncodeTool.tsx, Base64DecodeTool.tsx)
    └─ PARALLEL: T011, T012, T013, T014 can run in parallel
    └─ DEPENDS ON: T007, T008, T009 (tool components created)

Phase 5 (Layout Refinement)
├── T016: [P] Remove Content Area Padding (Globals.css or Tailwind config)
├── T017: [P] Implement Full-Height Grid Layout (Layout.tsx or App.tsx)
├── T018: [P] Add min-h-0 Fix to Column Components (InputField.tsx, OutputField.tsx, ToolOptions.tsx)
└── T019: Responsive Testing (manual verification)
    └─ PARALLEL: T016, T017, T018 can run in parallel
    └─ DEPENDS ON: T007, T008 (tool components created)

Phase 6 (Cross-Cutting Concerns)
├── T020: Auto-Update Integration (useTool hook integration)
├── T021: localStorage Theme Persistence (ThemeToggle.tsx)
├── T022: Tool Navigation & State Management (App.tsx)
└── T023: Error Handling & Edge Cases (all components)

Phase 7 (Testing & Verification)
├── T024: Build Verification (npm run build)
├── T025: TypeScript Verification (npx tsc --noEmit)
├── T026: Unit Tests Verification (npm test)
├── T027: Manual Testing Checklist (14-item checklist)
├── T028: Visual Regression Testing (browser verification)
└── T029: Final Bug Fixes & Polish (iteration as needed)
```

---

## Phase 1: Foundation & Service Layer Refactoring

**Goal**: Establish architecture for dual tool system with shared service patterns  
**Dependencies**: None (foundation phase)  
**Tests**: Contract tests from `contracts/components.md` (optional, TDD approach)  
**Duration**: ~30 minutes  

### T001: Create Abstract Base64 Service Class

- [x] T001 Create abstract Base64Service base class in `src/services/base64-base.ts`
  - Extract common encode/decode logic from current Base64Service
  - Define abstract interface for `execute(input: string, options: Base64Options): Promise<ToolResult>`
  - Define abstract interface for `validate(input: string): ValidationResult`
  - Include shared utility functions (base64 character validation, format checking)
  - Include shared error handling and edge case logic
  - Add comprehensive JSDoc comments
  - **Acceptance Criteria**:
    - [ ] File created with 100-150 lines
    - [ ] Abstract class has `execute` and `validate` abstract methods
    - [ ] All shared utility functions extracted
    - [ ] No compilation errors (npx tsc --noEmit)

---

### T002: Create Base64 Encode Service

- [x] T002 Create Base64EncodeService in `src/services/base64-encode.ts`
  - Extend abstract Base64Service
  - Implement `execute(input: string, options: { inputEncoding, format }): Promise<ToolResult>`
    - inputEncoding: 'UTF-8' | 'ASCII' | 'Latin-1'
    - format: 'RFC 4648' | 'URL-safe'
  - Implement `validate(input: string): ValidationResult`
  - Handle encoding type conversions before base64 encoding
  - Handle format variants (RFC 4648 standard vs URL-safe Base64)
  - Test cases: empty string, special chars, different encodings
  - **Acceptance Criteria**:
    - [ ] File created with 60-80 lines
    - [ ] Constructor calls `super()`
    - [ ] `execute` method supports all 3 inputEncoding + 2 format combinations
    - [ ] Returns consistent ToolResult shape with { success, data, error }
    - [ ] No TypeScript errors

---

### T003: Create Base64 Decode Service

- [x] T003 Create Base64DecodeService in `src/services/base64-decode.ts`
  - Extend abstract Base64Service
  - Implement `execute(input: string, options: { inputEncoding, format }): Promise<ToolResult>`
    - inputEncoding: 'UTF-8' | 'ASCII' | 'Latin-1' (for output encoding)
    - format: 'RFC 4648' | 'URL-safe' (to recognize input format)
  - Implement `validate(input: string): ValidationResult` (check if valid base64)
  - Handle decoding with different output encodings
  - Handle both RFC 4648 and URL-safe Base64 formats as input
  - Test cases: invalid base64, padding issues, different output encodings
  - **Acceptance Criteria**:
    - [ ] File created with 60-80 lines
    - [ ] Constructor calls `super()`
    - [ ] `execute` method handles all input format + output encoding combinations
    - [ ] Validates input is valid Base64 before attempting decode
    - [ ] Returns consistent ToolResult shape
    - [ ] No TypeScript errors

---

### T004: Register Both Services in ToolRegistry

- [x] T004 Update `src/tools/index.ts` to register both services
  - Import Base64EncodeService and Base64DecodeService
  - Create two separate tool registrations:
    - Base64 Encode: id='base64-encode', icon='🔤', priority=1
    - Base64 Decode: id='base64-decode', icon='🔤', priority=2
  - Register in ToolRegistry
  - Remove old single Base64 tool registration (if exists)
  - Verify both tools are discoverable by ToolRegistry.getTool()
  - **Acceptance Criteria**:
    - [ ] Both services instantiated and registered
    - [ ] ToolRegistry.getTool('base64-encode') returns encode service
    - [ ] ToolRegistry.getTool('base64-decode') returns decode service
    - [ ] Tools appear in correct priority order
    - [ ] No compilation errors

---

### T005: Extend ToolContext with Header State

- [x] T005 Update `src/context/ToolContext.tsx` to add header state
  - Add two new fields to ToolContextType:
    - `headerTitle?: string`
    - `headerDescription?: string`
  - Add two setter functions:
    - `setHeaderTitle: (title: string | undefined) => void`
    - `setHeaderDescription: (desc: string | undefined) => void`
  - Update context provider to initialize and provide these fields/setters
  - Export new context for consumption in Header and Tool components
  - **Acceptance Criteria**:
    - [ ] Context interface updated with new fields
    - [ ] Provider component initializes new state
    - [ ] No compilation errors
    - [ ] New context values accessible via useContext(ToolContext)

---

## Phase 2: Header & Navigation Integration

**Goal**: Integrate tool titles into header, simplify theme, update branding  
**Dependencies**: Phase 1 (context extension)  
**Duration**: ~15 minutes  
**Note**: Can execute in parallel with Phase 1, but requires T005 completion  

### T006: Update Header Component for Tool Title

- [x] T006 Modify `src/components/Layout/Header.tsx`
  - Read from ToolContext: `headerTitle`, `headerDescription`
  - Update JSX to display tool title if present:
    ```jsx
    {headerTitle && (
      <div className="tool-title-section">
        <h1>{headerTitle}</h1>
        {headerDescription && <p className="text-gray-600">{headerDescription}</p>}
      </div>
    )}
    ```
  - Update branding to "Online Developer Tools"
  - Ensure theme toggle displays Sun/Moon icons correctly
  - Add proper spacing between branding and tool title
  - **Acceptance Criteria**:
    - [ ] "Online Developer Tools" appears in header
    - [ ] Tool title displays when context value set
    - [ ] Tool title hidden when context value undefined
    - [ ] Tool description displays conditionally
    - [ ] Sun/Moon icons appear correctly

---

### T007: Simplify ThemeToggle to 2 Modes

- [x] T007 Update `src/components/Layout/ThemeToggle.tsx`
  - Remove "System" mode option (only light and dark)
  - Verify toggle switches between 'light' and 'dark' only
  - Update icon logic: light mode = Sun icon, dark mode = Moon icon
  - Ensure localStorage stores only 'light' or 'dark' (no 'system')
  - Set 'light' as default theme
  - Update any dropdown/menu UI if present (should be simple toggle button now)
  - **Acceptance Criteria**:
    - [ ] Only 2 theme modes available
    - [ ] Light is default
    - [ ] Toggle button works correctly
    - [ ] Icons update appropriately

---

### T008: Update Branding Across App

- [x] T008 Update branding in `src/App.tsx` and `public/index.html`
  - In App.tsx: Update any branding constants/strings
  - In public/index.html:
    - Update `<title>` to "Online Developer Tools"
    - Update meta description to mention developer tools
    - Update meta og:title and og:description if present
  - Search codebase for "Online Tools" references and update to "Online Developer Tools"
  - **Acceptance Criteria**:
    - [ ] Browser tab shows "Online Developer Tools"
    - [ ] No "Online Tools" text visible in UI
    - [ ] Meta tags updated correctly

---

## Phase 3: Component Separation & Tool Creation

**Goal**: Create separate Base64 Encode and Decode components  
**Dependencies**: Phase 1 (services, tool registration)  
**Duration**: ~20 minutes  
**Note**: T009, T010, T011 can execute in parallel  

### T009: Create Base64EncodeTool Component

- [x] T009 [P] Create Base64EncodeTool component in `src/components/Tools/Base64EncodeTool.tsx`
  - Follow same pattern as current Base64Tool
  - Use Base64EncodeService (from Phase 1)
  - On mount: Call `setHeaderTitle('Base64 Encode')` and `setHeaderDescription('Convert text to Base64')`
  - On unmount: Clear header state
  - Include:
    - InputField for text input
    - OutputField for encoded result
    - Base64EncodeOptions component for settings
    - CopyButton to copy output
  - Wire auto-update toggle to trigger execute() automatically
  - Wire manual "Encode" button to trigger execute() when auto-update OFF
  - **Acceptance Criteria**:
    - [ ] Component renders without errors
    - [ ] Header title/description set on mount
    - [ ] Auto-update toggle functional
    - [ ] Encode button appears when auto-update OFF
    - [ ] Output updates on input change (when auto-update ON)
    - [ ] Copy button works

---

### T010: Create Base64DecodeTool Component

- [x] T010 [P] Create Base64DecodeTool component in `src/components/Tools/Base64DecodeTool.tsx`
  - Mirror Base64EncodeTool but for decoding
  - Use Base64DecodeService
  - On mount: Call `setHeaderTitle('Base64 Decode')` and `setHeaderDescription('Convert Base64 to text')`
  - On unmount: Clear header state
  - Include:
    - InputField for Base64 input
    - OutputField for decoded result
    - Base64DecodeOptions component for settings
    - CopyButton to copy output
  - Wire auto-update and manual "Decode" button
  - **Acceptance Criteria**:
    - [ ] Component renders without errors
    - [ ] Header title/description set correctly
    - [ ] Decode button appears when auto-update OFF
    - [ ] Output updates on input change (when auto-update ON)
    - [ ] Copy button works

---

### T011: Create Base64EncodeOptions Component

- [ ] T011 [P] Create Base64EncodeOptions component in `src/components/Tools/Base64EncodeOptions.tsx`
  - Display in "Settings" column (renamed from "Options")
  - Include three controls:
    1. **Auto-Update Toggle**: ON by default
       - Toggle switch with label "Auto-Update"
       - Calls `onOptionsChange({ autoUpdate: boolean })`
    2. **Input Encoding Dropdown**: Default 'UTF-8'
       - Options: 'UTF-8', 'ASCII', 'Latin-1'
       - Calls `onOptionsChange({ inputEncoding: string })`
    3. **Format Dropdown**: Default 'RFC 4648'
       - Options: 'RFC 4648', 'URL-safe'
       - Calls `onOptionsChange({ format: string })`
  - All dropdowns styled consistently with Tailwind
  - **Acceptance Criteria**:
    - [ ] Component renders three controls
    - [ ] Toggle switch works
    - [ ] Dropdowns functional
    - [ ] onChange callbacks fire with correct data

---

### T012: Create Base64DecodeOptions Component

- [ ] T012 [P] Create Base64DecodeOptions component in `src/components/Tools/Base64DecodeOptions.tsx`
  - Mirror Base64EncodeOptions but for decode
  - Include three controls:
    1. **Auto-Update Toggle**: ON by default
    2. **Input Format Dropdown**: Default 'RFC 4648'
       - Options: 'RFC 4648', 'URL-safe'
       - (For recognizing input format)
    3. **Output Encoding Dropdown**: Default 'UTF-8'
       - Options: 'UTF-8', 'ASCII', 'Latin-1'
       - (For output text encoding)
  - **Acceptance Criteria**:
    - [ ] Component renders three controls
    - [ ] All dropdowns functional

---

### T013: Update App Router to Route to New Tools

- [x] T013 Update `src/App.tsx` app routing logic
  - Update route handlers to render Base64EncodeTool or Base64DecodeTool
  - Route: /tools/base64-encode → Base64EncodeTool
  - Route: /tools/base64-decode → Base64DecodeTool
  - Update sidebar navigation to show 2 tools instead of 1
  - Verify tool selection updates active state in sidebar
  - **Acceptance Criteria**:
    - [ ] Navigation to base64-encode renders Base64EncodeTool
    - [ ] Navigation to base64-decode renders Base64DecodeTool
    - [ ] Sidebar shows 2 items with correct icons and names
    - [ ] Active tool highlighted in sidebar

---

## Phase 4: Settings & Options Enhancement

**Goal**: Implement all auto-update, encoding, and format controls  
**Dependencies**: Phase 3 (tool components created)  
**Duration**: ~30 minutes  
**Note**: T014, T015, T016, T017 can execute in parallel  

### T014: Rename "Options" to "Settings" Throughout

- [x] T014 [P] Update `src/components/Common/ToolOptions.tsx`
  - Rename component from ToolOptions to ToolSettings (optional, maintain ToolOptions for backwards compat)
  - Update JSX:
    - Change heading from "Options" to "Settings"
    - Update accordion title if present
    - Update any aria-labels and tooltips
  - Update all imports/references in tool components
  - **Acceptance Criteria**:
    - [ ] "Settings" text appears in UI
    - [ ] "Options" text removed
    - [ ] Component renders without errors

---

### T015: Wire Auto-Update Toggle to Execution

- [x] T015 [P] Update Base64EncodeTool.tsx and Base64DecodeTool.tsx
  - Wire auto-update toggle to control automatic execution
  - When auto-update ON:
    - Execution happens automatically (200ms debounce) on input/options change
    - "Encode"/"Decode" button hidden (or disabled)
  - When auto-update OFF:
    - No automatic execution
    - "Encode"/"Decode" button visible
    - Button triggers execute() when clicked
  - Use existing 200ms debounce from useTool hook
  - **Acceptance Criteria**:
    - [ ] Toggle controls auto-update behavior
    - [ ] Button visible only when auto-update OFF
    - [ ] Output updates correctly in both modes
    - [ ] 200ms debounce prevents excessive re-renders

---

### T016: Implement Input Encoding Dropdown

- [x] T016 [P] Update Base64EncodeOptions.tsx and Base64DecodeOptions.tsx
  - Dropdown onChange: Pass selected encoding to service
  - Encoding options: 'UTF-8', 'ASCII', 'Latin-1'
  - Service uses encoding when processing:
    - Encode: Convert text to chosen encoding before base64
    - Decode: Convert decoded bytes to chosen output encoding
  - Output updates immediately (if auto-update ON)
  - **Acceptance Criteria**:
    - [ ] Dropdown renders all 3 options
    - [ ] Selection changes output correctly
    - [ ] Output re-renders with new encoding

---

### T017: Implement Format Dropdown

- [ ] T017 [P] Update Base64EncodeOptions.tsx and Base64DecodeOptions.tsx
  - Format dropdown onChange: Pass selected format to service
  - Encode format options: 'RFC 4648', 'URL-safe'
    - RFC 4648: Standard base64 with +/ characters
    - URL-safe: Replaces +/ with -_
  - Decode format options: 'RFC 4648', 'URL-safe' (recognizes input format)
  - Service uses format when processing
  - Output updates immediately
  - **Acceptance Criteria**:
    - [ ] Dropdown renders both formats
    - [ ] Selection changes output correctly
    - [ ] URL-safe format produces correct output

---

### T018: Add Manual Encode/Decode Button

- [ ] T018 Update Base64EncodeTool.tsx and Base64DecodeTool.tsx
  - Add button in tool component (or in options component)
  - Button label: "Encode" for Base64EncodeTool, "Decode" for Base64DecodeTool
  - Button visible only when auto-update OFF
  - On click: Call `execute(currentInput, currentOptions)`
  - Provide visual feedback (loading state, disabled during execution)
  - **Acceptance Criteria**:
    - [ ] Button appears when auto-update OFF
    - [ ] Button hidden when auto-update ON
    - [ ] Clicking button executes tool
    - [ ] Output updates after button click

---

## Phase 5: Layout & Full-Height Refinement

**Goal**: Remove padding gaps, implement full-height responsive layout  
**Dependencies**: Phase 3 (tool components)  
**Duration**: ~25 minutes  
**Note**: T019, T020, T021 can execute in parallel  

### T019: Remove Content Area Padding

- [x] T019 [P] Update CSS in relevant files to remove padding gaps
  - Inspect current content area container classes
  - Remove/reduce padding-top, padding-bottom on tool content area
  - Ensure no gap between header and content area
  - Check file: `src/App.tsx` (layout container), `src/components/Tools/` (tool components)
  - Use Tailwind classes: `p-0` instead of `p-4`, etc.
  - **Acceptance Criteria**:
    - [ ] No padding gap at top of content area
    - [ ] No padding gap at bottom
    - [ ] Content flows directly under header
    - [ ] Visual inspection confirms no gaps

---

### T020: Implement Full-Height Grid Layout

- [x] T020 [P] Update layout CSS to make content fill browser height
  - Modify `src/App.tsx` or main layout component
  - Use CSS Grid for 3-column layout (Input, Output, Settings)
  - Add `min-h-screen` to root container
  - Add `h-full` to grid container
  - Ensure each column grows to fill available height
  - Use `min-h-0` on each column to enable scrolling within (CSS Grid trick)
  - Test: Browser height 600px, 1200px, responsive widths
  - **Acceptance Criteria**:
    - [ ] Content area fills browser height
    - [ ] Columns equal height
    - [ ] No gaps above/below
    - [ ] Scrolls work if content overflows individual columns

---

### T021: Add min-h-0 to Column Components

- [x] T021 [P] Update column components with min-h-0
  - Apply `min-h-0` class to:
    - `src/components/Common/InputField.tsx` (input column)
    - `src/components/Common/OutputField.tsx` (output column)
    - `src/components/Common/ToolOptions.tsx` (settings column)
  - This CSS trick allows scrolling within grid items
  - Ensure overflow handling: `overflow-y-auto` for scrollable columns
  - **Acceptance Criteria**:
    - [ ] All columns have min-h-0 applied
    - [ ] Scrolling works if content overflows
    - [ ] Layout remains stable across breakpoints

---

### T022: Responsive Testing (Manual)

- [ ] T022 Manual browser testing of responsive layout
  - Test at breakpoints: 360px, 768px, 1024px, 1440px
  - Verify full-height on each:
    - [ ] Content fills browser height at 600px
    - [ ] Content fills browser height at 1200px
    - [ ] Content fills browser height at 2000px
    - [ ] No horizontal overflow
    - [ ] Columns maintain equal height
    - [ ] Text readable without horizontal scroll
  - Document any layout regressions

---

## Phase 6: Cross-Cutting Concerns

**Goal**: Integrate auto-update logic, persistence, error handling  
**Dependencies**: Phase 4 (options complete)  
**Duration**: ~20 minutes  

### T023: Auto-Update Integration with useTool Hook

- [x] T023 Verify useTool hook integration with auto-update toggle
  - Base64EncodeTool and Base64DecodeTool use useTool hook
  - Hook respects autoUpdate parameter:
    - autoUpdate=true → automatic execution on input/options change (200ms debounce)
    - autoUpdate=false → only execute on manual button click
  - Verify debounce prevents excessive renders
  - Check for any memory leaks (cleanup on unmount)
  - **Acceptance Criteria**:
    - [ ] Auto-update works with toggle
    - [ ] 200ms debounce applied correctly
    - [ ] No excessive API calls
    - [ ] No memory leaks

---

### T024: localStorage Theme Persistence

- [x] T024 Update `src/components/Layout/ThemeToggle.tsx`
  - Save theme choice to localStorage key: 'app-theme'
  - On app load: Read from localStorage, default to 'light'
  - Retrieve on next visit
  - Ensure no flashing of wrong theme on page load
  - **Acceptance Criteria**:
    - [ ] Theme persists across page reloads
    - [ ] Default is light if first visit
    - [ ] localStorage key is 'app-theme'
    - [ ] No theme flash on load

---

### T025: Tool Navigation & State Management

- [ ] T025 Verify tool switching state management
  - Switching from Base64Encode to Base64Decode:
    - [ ] Input/output cleared or reset
    - [ ] Auto-update state reset to default (ON)
    - [ ] Header title updates immediately
    - [ ] Previous tool options not carried over
  - Switching back:
    - [ ] Tool state reset (fresh)
  - Verify no state pollution between tools

---

### T026: Error Handling & Edge Cases

- [ ] T026 Add/verify error handling in services and components
  - Base64EncodeService errors:
    - [ ] Invalid input encoding specified
    - [ ] Invalid format specified
    - [ ] Handle gracefully
  - Base64DecodeService errors:
    - [ ] Invalid Base64 input
    - [ ] Wrong format specified
    - [ ] Display user-friendly error message
  - UI error display:
    - [ ] Error appears in output area with red styling
    - [ ] Copy button disabled when error
    - [ ] Clear error when input changes
  - **Acceptance Criteria**:
    - [ ] All error cases handled
    - [ ] User-friendly messages displayed
    - [ ] UI remains stable during errors

---

## Phase 7: Testing & Verification

**Goal**: Verify all functionality, build, and visual correctness  
**Dependencies**: All phases complete  
**Duration**: ~45 minutes  

### T027: Build Verification

- [x] T027 Run production build
  - Execute: `npm run build`
  - Verify:
    - [ ] Build succeeds (exit code 0)
    - [ ] No errors in build output
    - [ ] dist/ folder created
    - [ ] All assets bundled correctly
  - If build fails: Debug and fix errors before proceeding

---

### T028: TypeScript Verification

- [x] T028 Check TypeScript compilation
  - Execute: `npx tsc --noEmit`
  - Verify:
    - [ ] 0 TypeScript errors
    - [ ] 0 TypeScript warnings (or document acceptable warnings)
  - If errors exist: Fix before proceeding

---

### T029: Unit Tests Verification

- [x] T029 Run test suite
  - Execute: `npm test -- --coverage`
  - Verify:
    - [ ] All tests pass (previous 106+ tests + any new tests)
    - [ ] No test failures
    - [ ] Coverage maintained (80%+)
  - If tests fail: Fix and re-run

---

### T030: Manual Testing Checklist (14 Items)

- [ ] T030 Execute manual testing checklist
  - **Branding (2 items)**:
    - [ ] Browser tab title shows "Online Developer Tools"
    - [ ] Header displays "Online Developer Tools" branding
  - **Tool Separation (3 items)**:
    - [ ] Sidebar shows 2 tools: "Base64 Encode" and "Base64 Decode"
    - [ ] Both tools use same emoji icon (🔤)
    - [ ] Clicking each tool navigates to correct page
  - **Header Integration (2 items)**:
    - [ ] Header shows "Base64 Encode" when on encode tool
    - [ ] Header shows "Base64 Decode" when on decode tool
  - **Auto-Update (3 items)**:
    - [ ] Auto-Update toggle ON by default
    - [ ] Output updates automatically when typing (with toggle ON)
    - [ ] "Encode"/"Decode" button appears only when toggle OFF
  - **Settings (2 items)**:
    - [ ] Settings column shows: Auto-Update toggle, Input Encoding dropdown, Format dropdown
    - [ ] Dropdowns update output correctly
  - **Layout (2 items)**:
    - [ ] Content fills full browser height (no gaps)
    - [ ] Three columns (Input, Output, Settings) equal height
  - **Theme (1 item)**:
    - [ ] Theme toggle switches light/dark (2 modes only, no System mode)

---

### T031: Visual Regression Testing

- [ ] T031 Manual browser verification of visual correctness
  - Compare UI against design specifications in `ui-design.md`
  - Check at multiple breakpoints:
    - [ ] Desktop 1440px (primary)
    - [ ] Tablet 768px
    - [ ] Mobile 360px
  - Verify:
    - [ ] Spacing consistent (no padding gaps)
    - [ ] Colors correct (light and dark themes)
    - [ ] Icons display correctly (Sun/Moon, emoji tools)
    - [ ] Text readable, font sizes appropriate
    - [ ] Button states (hover, active, disabled)
    - [ ] Dropdown styling consistent
    - [ ] Copy button visible and styled correctly
  - Document any visual discrepancies

---

### T032: Functional Testing - Encode Tool

- [ ] T032 Test Base64 Encode tool
  - **Basic Encoding**:
    - [ ] Type text in input → Output auto-updates (auto-update ON)
    - [ ] Output is valid Base64
    - [ ] Copy button copies correct text
  - **Auto-Update Toggle**:
    - [ ] Turn OFF → Encode button appears
    - [ ] Turn ON → Encode button disappears
  - **Input Encoding**:
    - [ ] Select UTF-8 → Output correct
    - [ ] Select ASCII → Output correct
    - [ ] Select Latin-1 → Output correct
  - **Format**:
    - [ ] Select RFC 4648 → Output uses +/ chars
    - [ ] Select URL-safe → Output uses -_ chars
  - **Edge Cases**:
    - [ ] Empty input → Empty output (or error message)
    - [ ] Very long text → No crashes
    - [ ] Special Unicode characters → Handled correctly

---

### T033: Functional Testing - Decode Tool

- [ ] T033 Test Base64 Decode tool
  - **Basic Decoding**:
    - [ ] Paste Base64 in input → Output auto-updates (auto-update ON)
    - [ ] Output is correct text
    - [ ] Copy button works
  - **Auto-Update Toggle**:
    - [ ] Turn OFF → Decode button appears and works
    - [ ] Turn ON → Decode button disappears
  - **Input Format**:
    - [ ] RFC 4648 format → Decodes correctly
    - [ ] URL-safe format → Decodes correctly
  - **Output Encoding**:
    - [ ] UTF-8 output → Correct
    - [ ] ASCII output → Correct (or error if not ASCII-compatible)
    - [ ] Latin-1 output → Correct
  - **Edge Cases**:
    - [ ] Invalid Base64 → Error message
    - [ ] Empty input → Empty output
    - [ ] Padding issues → Handled

---

### T034: Cross-Tool State Management

- [ ] T034 Test state between tool switches
  - Start encoding text:
    - [ ] Auto-Update ON
    - [ ] Settings configured
  - Switch to Decode tool:
    - [ ] Input cleared
    - [ ] Output cleared
    - [ ] Auto-Update reset to ON
    - [ ] Settings reset to defaults
  - Switch back to Encode:
    - [ ] State reset (fresh)
    - [ ] No data from previous session
  - Verify no state pollution

---

### T035: Final Bug Fixes & Polish

- [ ] T035 Fix any issues found during testing
  - Document all bugs found
  - Prioritize by severity:
    - [ ] Critical (crashes, data loss): Fix immediately
    - [ ] Major (incorrect output): Fix before launch
    - [ ] Minor (UI tweaks): Optional for MVP
  - Re-test after fixes
  - Iterate until all critical/major bugs resolved

---

## Task Summary

**Total Tasks**: 35 implementation tasks  
**Phases**: 7 phases (Foundation, Header, Components, Settings, Layout, Cross-Cutting, Testing)  

### Tasks by Phase

| Phase | Task IDs | Count | Est. Duration | Parallelizable |
|-------|----------|-------|---------------|-----------------|
| 1: Foundation | T001-T005 | 5 | 30 min | T002, T003 parallel |
| 2: Header | T006-T008 | 3 | 15 min | After T005 complete |
| 3: Components | T009-T013 | 5 | 20 min | T009, T010, T011, T012 parallel |
| 4: Settings | T014-T018 | 5 | 30 min | T014, T015, T016, T017 parallel |
| 5: Layout | T019-T022 | 4 | 25 min | T019, T020, T021 parallel |
| 6: Cross-Cutting | T023-T026 | 4 | 20 min | T023, T024, T025, T026 parallel |
| 7: Testing | T027-T035 | 9 | 45 min | Mostly sequential |

**Grand Total**: ~2.5-3.5 hours for complete implementation

---

## Execution Strategies

### Strategy 1: Sequential (Safest for first-time implementation)
1. Complete T001-T005 (Foundation)
2. Complete T006-T008 (Header)
3. Complete T009-T013 (Components)
4. Complete T014-T018 (Settings)
5. Complete T019-T022 (Layout)
6. Complete T023-T026 (Cross-Cutting)
7. Complete T027-T035 (Testing & Verification)

**Estimated Time**: 3-3.5 hours  
**Risk**: Low (dependencies respected)  
**Best For**: First implementation or team training

### Strategy 2: Parallel Execution (Faster)
**Parallel Groups**:
- **T001-T005**: Foundation (30 min)
  - T002 & T003 can run in parallel
- **T006-T008**: After T005 (15 min)
- **T009-T013**: Parallel after T005-T008 (20 min)
  - T009, T010, T011, T012 can run in parallel
- **T014-T018**: Parallel after T009-T013 (30 min)
  - T014, T015, T016, T017 can run in parallel
- **T019-T022**: Parallel after T009-T013 (25 min)
  - T019, T020, T021 can run in parallel
- **T023-T026**: Parallel (20 min)
- **T027-T035**: Sequential testing (45 min)

**Estimated Time**: 2.5-3 hours  
**Risk**: Medium (requires careful task sequencing)  
**Best For**: Teams with multiple developers

### Strategy 3: MVP Scope (Minimum for launch)
**MVP Tasks** (achieves all requirements):
- T001-T005: Foundation ✅
- T006-T008: Header ✅
- T009-T013: Components ✅
- T014-T018: Settings ✅
- T019-T022: Layout ✅ (at least T019, T020)
- T023-T026: Cross-Cutting ✅ (at least T023, T024)
- T027-T034: Testing (core tests)

**Estimated Time**: 2.5 hours  
**Deliverable**: Fully functional UI/UX refinement

**Polish/Polish Tasks** (optional, post-MVP):
- Additional visual refinements
- Performance optimizations
- Additional error handling edge cases

---

## Success Criteria

✅ **All requirements met when**:
1. [ ] 2 tools in sidebar (Encode, Decode) - **T009, T010, T013**
2. [ ] Tool title in header - **T006**
3. [ ] Auto-update toggle (ON by default) - **T015**
4. [ ] Encode/Decode button (visible when OFF) - **T018**
5. [ ] Input encoding dropdown (3 options) - **T016**
6. [ ] Format dropdown (2 options) - **T017**
7. [ ] Full-height layout (no padding) - **T019, T020, T021**
8. [ ] Settings column instead of Options - **T014**
9. [ ] "Online Developer Tools" branding - **T008**
10. [ ] Light/dark theme (light default, 2 modes) - **T007, T024**
11. [ ] TypeScript clean (npx tsc --noEmit) - **T028**
12. [ ] Build succeeds (npm run build) - **T027**
13. [ ] Tests pass (npm test) - **T029**
14. [ ] All 14-item manual checklist passes - **T030**

---

## Implementation Notes

- **Test-First (Optional)**: Contract tests from `contracts/components.md` can be implemented before code (TDD approach)
- **Incremental**: After Phase 3 (T009-T013), entire tool is functional - early testing possible
- **Rollback**: Each phase can be rolled back independently if needed
- **Documentation**: Update README or docs with new tool structure after T009-T013
- **Performance**: Monitor bundle size in T027 (build phase)
- **Accessibility**: Ensure new components pass accessibility checks

---

## Quick Reference

**Spec Documents**: See `/specs/002-ui-ux-refinement/`
- `spec.md` - Requirements and user scenarios
- `data-model.md` - Entity definitions
- `contracts/components.md` - Component APIs and test contracts
- `research.md` - Design decisions and rationale
- `IMPLEMENTATION_PLAN.md` - High-level plan
- `quickstart.md` - Step-by-step quickstart guide

**Key Files to Create**: 6 new service/component files  
**Key Files to Modify**: 7 existing files  
**Total Estimated Duration**: 2.5-3.5 hours  
**Phases**: 7 (Foundation → Header → Components → Settings → Layout → Cross-Cutting → Testing)

---

**End of Tasks Document**
