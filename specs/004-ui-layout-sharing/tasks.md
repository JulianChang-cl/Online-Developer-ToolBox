# Feature 004 Implementation Tasks: UI Layout Refinement & Shareable Links

**Feature Branch**: `004-ui-layout-sharing`  
**Created**: October 30, 2025  
**Tech Stack**: TypeScript 5.2 (strict), React 18.2, Tailwind CSS 3.x, Jest 29+, React Router  

---

## Overview

This document contains all implementation tasks for Feature 004, organized by user story in priority order. Each task is independently actionable and follows the strict checklist format for tracking.

**Total Tasks**: 47  
**User Stories**: 3 (all P1)  
**Phases**: 5 (Setup, Foundational, US1, US2, US3, Integration & Polish)

---

## User Story Dependencies & Completion Order

```
┌─────────────────────────────────────────────────────┐
│ Phase 1: Setup (Shared Infrastructure)              │
│ - Project structure validation                       │
│ - TypeScript types and interfaces                    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Phase 2: Foundational (Blocking Prerequisites)      │
│ - Sidebar state management (useSidebarState hook)   │
│ - URL parameter services (urlParameters.ts)         │
│ - Share link service (shareLink.ts)                 │
└─────────────────────────────────────────────────────┘
        ↓              ↓              ↓
   ┌────────┐    ┌────────┐    ┌────────┐
   │        │    │        │    │        │
   ↓        ↓    ↓        ↓    ↓        ↓
┌──────┐ ┌──────────┐ ┌──────────┐
│ US1: │ │ US2: 20/ │ │ US3: URL │
│ Multi│ │ 40/40    │ │ Share    │
│ Open │ │ Layout   │ │ Button   │
│ Sdbr │ │ Update   │ │ & Params │
└──────┘ └──────────┘ └──────────┘
   ↓         ↓          ↓
   └─────────┴──────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Phase Integration: All 3 User Stories Complete      │
│ - Full end-to-end testing                           │
│ - Performance validation                            │
│ - Cross-tool verification                           │
└─────────────────────────────────────────────────────┘
```

**Parallel Execution**: US1, US2, and US3 can be implemented in parallel after Phase 2 completes (they have no dependencies on each other).

---

## Phase 1: Setup & Infrastructure (Est. 15 min)

### Project Structure & Type Definitions

- [x] T001 Validate project structure matches plan.md (`src/components`, `src/services`, `src/hooks`, `src/types` directories)
- [x] T002 Create TypeScript types file `src/types/tools.ts` with ToolGroup, ToolItem, ToolSettings, ShareLink, URLParameters interfaces
- [x] T003 Create tool configuration in `src/tools/index.ts` with TOOL_GROUPS array (Base64, Base16, Base32 groups and items)
- [x] T004 Create tool parameters configuration in `src/tools/index.ts` with TOOL_PARAMETERS and DEFAULT_SETTINGS

---

## Phase 2: Foundational Services (Est. 45 min)

### Sidebar State Management

- [x] T005 [P] Create custom hook `src/hooks/useSidebarState.ts` for managing sidebar group expand/collapse state
  - Initialize all groups as collapsed (base64, base16, base32 = false)
  - Implement toggleGroup(groupId) function
  - Add localStorage persistence (key: 'sidebarState')
  - Return [state, toggleGroup] tuple
- [x] T006 [P] Write unit tests for `useSidebarState` hook covering: initial state, toggle operations, localStorage persistence, rapid toggles

### URL Parameter Services

- [x] T007 [P] Create `src/services/urlParameters.ts` service for parameter validation and parsing
  - Implement validateURLParameters(params) function
  - Handle Base64 decoding of input parameter
  - Validate input_encoding is 'utf-8' | 'ascii' | 'latin-1'
  - Return defaults for missing/invalid parameters
  - Export validation utilities
- [x] T008 [P] Write unit tests for URL parameter validation covering: valid parameters, missing parameters, invalid Base64, unknown encoding, type validation
- [x] T009 [P] Create `src/services/shareLink.ts` service for generating shareable URLs
  - Implement generateShareURL(toolId, settings) function
  - Base64-encode input text
  - Build query string with input_encoding and tool-specific parameters
  - Return complete URL including domain
  - Export service functions
- [x] T010 [P] Write unit tests for share link generation covering: URL format, Base64 encoding, parameter inclusion, edge cases (long inputs, special chars, Unicode)

---

## Phase 3: User Story 1 - Organized Sidebar Navigation (Est. 60 min)

**Goal**: Multi-open collapsible sidebar groups with text-only labels (FR-001 to FR-007)

### Acceptance Scenarios
- ✓ Sidebar displays "Encoding" category with collapsed groups
- ✓ User can expand groups and see encoded/decoded items
- ✓ Multiple groups can be open simultaneously (multi-open, not accordion)
- ✓ No emoji or image icons visible (text-only)
- ✓ Visual chevron indicator shows collapsible state

### Implementation Tasks

- [x] T011 [US1] Refactor `src/components/Layout/Sidebar.tsx` to use useSidebarState hook for multi-open groups
  - Remove any existing accordion logic
  - Integrate useSidebarState hook
  - Add onClick handler to group headers calling toggleGroup
  - Conditionally render tool items based on expanded state
  - Do not update styling yet (CSS in next task)
- [x] T012 [P] [US1] Add chevron icons to sidebar group headers in `src/components/Layout/Sidebar.tsx`
  - Import chevron icon (right-pointing when collapsed, down-pointing when expanded)
  - Rotate/swap chevron based on isExpanded state
  - Add test-id attributes for testing
- [x] T013 [P] [US1] Remove all emoji/image icons from sidebar in `src/components/Layout/Sidebar.tsx`
  - Search for and remove all <img> tags
  - Remove any emoji characters from labels
  - Verify text-only labels for all items (Base64, Base16, Base32, Encode, Decode)
  - Validate no visual regressions in other areas
- [x] T014 [US1] Update `src/components/Layout/AppLayout.tsx` to pass sidebar state
  - Get useSidebarState from Sidebar component (or move to AppLayout if shared state needed)
  - Ensure state flows correctly to Sidebar component
  - Verify other layout elements still render correctly
- [x] T015 [P] [US1] Style sidebar to fit within 20% of screen width at 1440px in `src/components/Layout/Sidebar.tsx`
  - Measure current sidebar width
  - Calculate max-width: 20% of 1440px = 288px
  - Adjust Tailwind classes (w-1/5, max-w-xs, or similar)
  - Add overflow-y-auto for vertical scrolling when needed
- [x] T016 [P] [US1] Write integration tests for sidebar navigation in `tests/integration/sidebar-navigation.test.tsx`
  - Test sidebar displays all 3 groups collapsed on load
  - Test clicking group header expands/collapses group
  - Test multi-open: expand Base64, then Base16, Base64 should stay open
  - Test clicking tool item navigates to correct route
  - Test sidebar width constraint at 1440px
- [x] T017 [P] [US1] Contract test validation for sidebar functionality
  - Run sidebar.contract.test.ts scenarios against implementation
  - Verify all 19 scenarios pass (multi-open, toggle, persistence, rendering, icons, responsive)

---

## Phase 4: User Story 2 - Consistent Content Area Layout (Est. 45 min)

**Goal**: Apply 20/40/40 three-column layout to Base64 tools matching Base16/Base32 (FR-008 to FR-012)

### Acceptance Scenarios
- ✓ Base64 Encode uses 20/40/40 layout (Settings ~20%, Input ~40%, Output ~40%)
- ✓ Base64 Decode uses matching 20/40/40 layout
- ✓ Column proportions consistent across all 6 tools
- ✓ Columns remain visible at 1024px minimum viewport
- ✓ Each column scrolls independently (Settings, Input, Output)

### Implementation Tasks

- [x] T018 [US2] Examine Base16EncodeTool component (`src/components/Tools/Base16EncodeTool.tsx`) to extract 20/40/40 layout pattern
  - Identify CSS grid structure (expected: grid grid-cols-5)
  - Note column spans: Settings(col-span-1), Input(col-span-2), Output(col-span-2)
  - Identify scrolling behavior per column (overflow-y-auto)
  - Document pattern for reuse
- [x] T019 [US2] Apply 20/40/40 layout to `src/components/Tools/Base64EncodeTool.tsx`
  - Copy grid structure from Base16 tool
  - Update Settings column to col-span-1
  - Update Input column to col-span-2
  - Update Output column to col-span-2
  - Add overflow-y-auto to each column for independent scrolling
  - Preserve all existing Base64 encode logic (input/output computation, encoding settings)
  - Verify no breaking changes to input/output behavior
- [x] T020 [US2] Apply 20/40/40 layout to `src/components/Tools/Base64DecodeTool.tsx`
  - Mirror changes from Base64EncodeTool
  - Apply grid structure and column spans
  - Add independent scrolling per column
  - Preserve all existing Base64 decode logic
  - Verify no breaking changes
- [x] T021 [P] [US2] Update `src/components/Layout/AppLayout.tsx` (or container) to ensure full viewport height for content area
  - Verify content area is 100% height
  - Ensure columns have adequate container height for scrolling
  - Test at viewport heights: 768px (min), 1080px, 1440px
- [x] T022 [P] [US2] Write integration tests for layout consistency in `tests/integration/layout-consistency.test.tsx`
  - Measure column widths on Base64 Encode at 1024px, 1440px, 1920px viewports
  - Verify Settings ~20%, Input ~40%, Output ~40% at each viewport
  - Repeat for Base64 Decode, Base16 Encode, Base16 Decode, Base32 Encode, Base32 Decode
  - Test independent scrolling per column
  - Test minimum viewport width (1024px) constraint
- [x] T023 [P] [US2] Contract test validation for layout functionality
  - Run layout scenarios from spec acceptance criteria
  - Verify all 5 scenarios pass (layout consistency, scrolling, viewport widths)

---

## Phase 5: User Story 3 - Shareable Links with URL Parameters (Est. 60 min)

**Goal**: Generate and share URLs with input/settings; restore state from URL parameters (FR-013 to FR-022)

### Acceptance Scenarios
- ✓ Share button generates URL with input (Base64-encoded) and encoding setting
- ✓ Share URL copied to clipboard with success feedback
- ✓ Opening shared URL pre-populates tool with original input and settings
- ✓ All 6 tools support sharing and parameter restoration
- ✓ Edge cases handled: long inputs, special characters, missing parameters

### Implementation Tasks

- [x] T024 [US3] Create ShareButton component `src/components/Common/ShareButton.tsx` with dropdown UI
  - Create button that toggles dropdown visibility on click
  - Dropdown displays generated URL in read-only or selectable text
  - Add copy icon button next to URL
  - Close dropdown on click elsewhere (click-outside handler)
  - Style consistently with other tool buttons
  - Created with full dropdown UI and clipboard functionality
- [x] T025 [P] [US3] Implement copy-to-clipboard functionality in `src/components/Common/ShareButton.tsx`
  - Use navigator.clipboard.writeText(url)
  - Add try-catch for clipboard API errors
  - Show success feedback (toast: "Copied!" for 1.5s) on successful copy
  - Show error feedback if copy fails
  - Implemented with success/error states and timeouts
- [x] T026 [P] [US3] Create `src/hooks/useShareLink.ts` hook for share link generation
  - Implement generateShareLink(toolId, settings) returning complete URL
  - Base64-encode input text
  - Include input_encoding parameter
  - Include tool-specific parameters (e.g., padding for Base32)
  - Exclude output field (re-compute on load)
  - Return complete URL string
  - Hook created, uses generateShareURL from shareLink service
- [x] T027 [US3] Integrate ShareButton into Base64EncodeTool (`src/components/Tools/Base64EncodeTool.tsx`)
  - Import ShareButton component
  - Add ShareButton to component UI (location: next to other tool buttons)
  - Pass current tool state to ShareButton (input, inputEncoding, toolSpecificSettings)
  - Test Share button generates correct URL for Base64 Encode
- [x] T028 [US3] Integrate ShareButton into Base64DecodeTool (`src/components/Tools/Base64DecodeTool.tsx`)
  - ShareButton already integrated (from Feature 003)
  - Updated to use new dropdown UI implementation
- [x] T029 [P] [US3] Integrate ShareButton into Base16 tools (`src/components/Tools/Base16EncodeTool.tsx` and `Base16DecodeTool.tsx`)
  - ShareButton already integrated (from Feature 003)
  - Updated to use new dropdown UI implementation
- [x] T030 [P] [US3] Integrate ShareButton into Base32 tools (`src/components/Tools/Base32EncodeTool.tsx` and `Base32DecodeTool.tsx`)
  - ShareButton already integrated (from Feature 003)
  - Updated to use new dropdown UI implementation
- [x] T031 [US3] Add URL parameter restoration to Base64EncodeTool (`src/components/Tools/Base64EncodeTool.tsx`)
  - Added URL parameter extraction using URLSearchParams
  - Integrated validateURLParameters and decodeInputFromURL services
  - Restores input, input_encoding, and format from URL on mount
  - URL restoration working for Base64 Encode tool
  - Set inputEncoding from parameter or default to 'utf-8'
  - Re-compute output after state is set
  - Handle missing/invalid parameters gracefully (use defaults)
- [x] T032 [US3] Add URL parameter restoration to Base64DecodeTool (`src/components/Tools/Base64DecodeTool.tsx`)
  - Added URL parameter extraction and validation
  - Restores input and format from URL on mount
  - URL restoration working for Base64 Decode tool
- [x] T033 [P] [US3] Add URL parameter restoration to Base16 tools (`src/components/Tools/Base16EncodeTool.tsx` and `Base16DecodeTool.tsx`)
  - Added URL restoration to Base16EncodeTool (input, input_encoding)
  - Added URL restoration to Base16DecodeTool (input, input_encoding)
  - Parameter restoration working for both tools
- [x] T034 [P] [US3] Add URL parameter restoration to Base32 tools (`src/components/Tools/Base32EncodeTool.tsx` and `Base32DecodeTool.tsx`)
  - Added URL restoration to Base32EncodeTool (input, input_encoding, padding)
  - Added URL restoration to Base32DecodeTool (input, input_encoding)
  - Tool-specific padding parameter correctly restored
- [x] T035 [P] [US3] Write integration tests for share flow in `tests/integration/share-flow.test.tsx`
  - ✓ Created comprehensive test suite with 38 tests covering:
  - ✓ URL generation with encoded input for all 6 tools
  - ✓ URL parameter restoration (input, encoding, tool-specific settings)
  - ✓ Edge cases: long inputs, Unicode, special characters, malformed URLs
  - ✓ Contract validation: encoding/decoding round-trips, cross-tool consistency
  - ✓ All 38 tests passing
- [x] T036 [P] [US3] Contract test validation for share link functionality
  - ✓ Validated URL generation consistency across all encode/decode tools
  - ✓ Verified URL format specification (Base64-encoded input, key-value settings)
  - ✓ Tested encoding/decoding contracts (round-trip correctness)
  - ✓ Verified parameter preservation (tool-specific settings like padding)
  - ✓ All contract validation tests passing within share-flow.test.tsx

---

## Phase Integration & Cross-Story Verification (Est. 45 min)

### Complete Feature Testing

- [ ] T037 [P] Write end-to-end test for all 3 user stories in `tests/integration/feature-004-e2e.test.tsx`
  - Test: Navigate sidebar multi-open → all groups work independently ✓
  - Test: Layout consistency across all 6 tools (20/40/40) ✓
  - Test: Share link round-trip for each tool ✓
  - Test: Multiple shares with different inputs ✓
  - Test: Parameter restoration for all 6 tools ✓
- [ ] T038 [P] Validate success criteria in `tests/integration/success-criteria.test.tsx`
  - SC-001: Navigate tools in <3 clicks using sidebar groups ✓
  - SC-002: 20/40/40 layout consistent across all 6 tools at multiple viewports ✓
  - SC-003: Share URL round-trip within 5 seconds ✓
  - SC-004: Sidebar width <20% at 1440px ✓
  - SC-005: 95% of share URLs successfully pre-populate tool ✓
  - SC-006: Layout consistency verified (same structure on all tools) ✓
- [ ] T039 [P] Performance validation for all features
  - Measure sidebar toggle response time (<50ms target)
  - Measure URL generation time (<100ms target)
  - Measure page load time with URL parameters (<200ms additional latency target)
  - Measure layout reflow time on viewport resize (<200ms target)
  - Document any performance issues and optimization opportunities
- [ ] T040 [P] Test edge cases across all features
  - Long inputs (500+, 1000+ characters) - all tools ✓
  - Special characters and Unicode - all tools ✓
  - Missing URL parameters - all tools default correctly ✓
  - Invalid Base64 in URL - graceful fallback ✓
  - Multiple groups expanded simultaneously - sidebar handles correctly ✓
  - Very long share URLs (near 2000 char limit) ✓
  - Rapid sidebar toggles - state remains consistent ✓
- [ ] T041 [P] Cross-tool parameter compatibility testing
  - Generate share URLs from Base64, open in Base16, Base32 (should fail gracefully or redirect) ✓
  - Test parameter validation per tool (each tool only uses its parameters) ✓
  - Test tool-specific parameters don't interfere with base parameters ✓

---

## Phase Polish & Documentation (Est. 20 min)

### Code Quality & Documentation

- [ ] T042 Verify all new files follow TypeScript 5.2 strict mode requirements
  - Run `npm run lint` and verify no errors on new files
  - Check all functions have type annotations
  - Check all imports/exports are properly typed
  - Verify no `any` types except where documented
- [ ] T043 Add inline documentation to all service functions in `src/services/urlParameters.ts` and `src/services/shareLink.ts`
  - Document parameters, return types, and purpose
  - Include examples for complex functions
  - Document any edge case handling
- [ ] T044 Add JSDoc comments to all React components
  - Document component props with types
  - Document component purpose and usage
  - Add examples for complex components (ShareButton, Sidebar)
- [ ] T045 Update project README if necessary
  - Add note about Feature 004: Sidebar reorganization, layout update, shareable links
  - Document new hooks and services
  - Update any relevant navigation documentation
- [ ] T046 Run full test suite and fix any issues
  - Run `npm test` on entire project
  - Verify no regressions in existing features (Feature 003)
  - Verify all new tests pass
  - Achieve ≥80% coverage on new/modified code
- [ ] T047 Final quality check and build verification
  - Run `npm run build` and verify no errors
  - Check bundle size impact (+480 bytes from Feature 003 as baseline)
  - Verify no console errors in production build
  - Test on multiple browsers if applicable
  - Mark feature as ready for merge

---

## Task Dependencies & Parallel Execution Strategy

### Dependency Graph

```
Phase 1 (T001-T004)
    ↓
Phase 2 (T005-T010) [BLOCKING for all user stories]
    ↓
    ├─ US1 Phase (T011-T017) [Independent]
    ├─ US2 Phase (T018-T023) [Independent, can start after Phase 2]
    └─ US3 Phase (T024-T036) [Independent, can start after Phase 2]
         ↓
    Integration Phase (T037-T041) [Wait for all US to complete]
         ↓
    Polish Phase (T042-T047) [Final cleanup]
```

### Parallel Execution Examples

**After Phase 2 completes, team can split into 3 parallel tracks**:

**Track 1 - Sidebar (US1)**:
- Developer A: T011-T017 (Sidebar refactoring, styling, testing, validation)
- Estimated: 60 min
- Can proceed in parallel with Track 2 & 3

**Track 2 - Layout (US2)**:
- Developer B: T018-T023 (Layout updates to Base64, testing, validation)
- Estimated: 45 min
- Can proceed in parallel with Track 1 & 3

**Track 3 - Sharing (US3)**:
- Developer C: T024-T036 (Share button, URL services, integration across 6 tools)
- Estimated: 60 min
- Can proceed in parallel with Track 1 & 2

**Sync Point**: After all 3 tracks complete, merge features and run Integration Phase (T037-T041).

---

## MVP Scope (Minimum Viable Product)

**Recommended starting point**: Complete the following for MVP, then iterate with full feature:

### MVP Tasks Only
- T001-T004: Setup & types ✓
- T005-T010: Foundational services ✓
- T011-T017: US1 - Multi-open sidebar ✓
- T037-T041: Integration & testing ✓
- T042-T047: Polish ✓

**MVP Excludes**: 
- T018-T023: US2 Layout update (can be Phase 2 later)
- T024-T036: US3 Sharing (can be Phase 2 later)

**MVP Benefit**: 
- Delivers core navigation improvement immediately
- Test sidebar functionality before adding other features
- Reduced risk and faster feedback cycle
- Can add sharing and layout in follow-up

**MVP Timeline**: ~2 hours (Setup 15m + Foundational 45m + US1 60m + Integration 20m + Polish 20m)

---

## Execution Checklist

### Before Starting Implementation
- [ ] Review spec.md and all clarifications integrated
- [ ] Review plan.md technical context and decisions
- [ ] Review data-model.md domain objects
- [ ] Review quickstart.md code patterns
- [ ] Review contract specifications in contracts/

### During Implementation
- [ ] Update tasks as completed (check off [T00X])
- [ ] Run tests after each phase completes
- [ ] Commit progress regularly to branch `004-ui-layout-sharing`
- [ ] Verify no regressions in Feature 003 tools

### After Each Phase
- [ ] Run relevant contract tests
- [ ] Run integration tests for that phase
- [ ] Verify success criteria if applicable
- [ ] Document any issues or blockers

### Before Merge
- [ ] All 47 tasks checked off ✓
- [ ] All tests passing (npm test) ✓
- [ ] Build successful (npm run build) ✓
- [ ] No console errors ✓
- [ ] Performance targets met ✓
- [ ] Success criteria validated ✓
- [ ] Feature ready for production ✓

---

**Status**: Ready for Phase 1 Implementation  
**Next Step**: Begin with T001 (Project Structure Validation)
