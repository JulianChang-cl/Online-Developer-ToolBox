# Feature 005 Tasks: UI Bug Fixes & Format Tools

**Feature**: UI Bug Fixes & Format Tools  
**Branch**: `005-ui-bugs-format-tools`  
**Status**: Ready for Implementation  
**Created**: 2025-10-31  
**Total Tasks**: 25 tasks (organized by user story)

---

## Quick Reference

| Phase | Description | Tasks | Est. Time |
|-------|-------------|-------|-----------|
| **Phase 1** | Setup & Type Definitions | T001-T002 | 20 min |
| **Phase 2** | Foundational Infrastructure | T003-T004 | 35 min |
| **Phase 3** | User Story 1 (P1: Auto-Clear) | T005-T007 | 30 min |
| **Phase 4** | User Story 2 (P1: Share UI) | T008-T011 | 45 min |
| **Phase 5** | User Story 3 (P2: JSON Validator) | T012-T016 | 90 min |
| **Phase 6** | User Story 4 (P2: JSON Minifier) | T017-T020 | 75 min |
| **Phase 7** | User Story 5 (P2: Sidebar Format) | T021-T022 | 25 min |
| **Phase 8** | Integration & Quality | T023-T025 | 65 min |
| **TOTAL** | | **25 tasks** | **360 min (6 hours)** |

---

## Phase 1: Setup & Type Definitions

### Setup

- [x] T001 Create feature branch `005-ui-bugs-format-tools` and update project structure

### Type Definitions

- [x] T002 Create TypeScript type definitions in `src/types/json-tools.ts` with interfaces for JSONValidationResult, JSONError, JSONValidatorState, JSONMinificationResult, JSONMinifierState

---

## Phase 2: Foundational Infrastructure

### Utilities

- [x] T003 Implement JSON validation utilities in `src/utils/json-utils.ts`: validateJSON(), extractLineNumber(), extractColumnNumber(), minifyJSON()
- [x] T004 Write utility tests in `tests/unit/json-utils.test.ts` (24 test cases covering valid/invalid JSON, line extraction, minification)

---

## Phase 3: User Story 1 - Auto-Clear Output When Input is Cleared (Priority: P1)

**Goal**: Automatically clear output field when user empties input field in all encoding tools

**Independent Test Criteria**: 
- ✓ Output field is empty when input field is cleared
- ✓ Applies consistently across Base64, Base16, Base32 tools
- ✓ Does not break existing tool functionality

**Implementation Tasks**:

- [x] T005 [P] [US1] Write contract tests in `tests/contracts/auto-clear.test.ts` (9 test cases: 3 per tool covering empty input, partial clear, character deletion)
- [x] T006 [P] [US1] Implement auto-clear handler in `src/components/tools/Base64Tool.tsx`: modify handleInput to clear output when input is empty
- [x] T007 [P] [US1] Implement auto-clear in `src/components/tools/Base16Tool.tsx` and `src/components/tools/Base32Tool.tsx` using same pattern

---

## Phase 4: User Story 2 - Improved Shareable Link UI Placement (Priority: P1)

**Goal**: Position Shareable Link URL to the right of Share button in sidebar

**Independent Test Criteria**:
- ✓ Share button and URL display without horizontal overflow on all screen sizes (320px-4K)
- ✓ Layout maintains visual balance on mobile/tablet/desktop
- ✓ Share functionality works identically across Chrome, Firefox, Safari, Edge

**Implementation Tasks**:

- [ ] T008 [US2] Write contract tests in `tests/contracts/share-ui.test.ts` (8 test cases: desktop layout, mobile wrapping, responsive breakpoints, visual alignment)
- [ ] T009 [US2] Refactor `src/components/SettingsSidebar.tsx` to move ShareButton from output panel to sidebar with right-side positioning
- [ ] T010 [US2] Update CSS in `src/components/SettingsSidebar.module.css` for responsive Share button + URL positioning with Tailwind utilities
- [ ] T011 [US2] Write responsive layout integration tests in `tests/integration/share-ui-responsive.test.tsx` (5 test cases for breakpoints)

---

## Phase 5: User Story 3 - JSON Validator Tool (Priority: P2)

**Goal**: Create dedicated JSON Validator tool with split-panel output showing validation status and error messages

**Independent Test Criteria**:
- ✓ Correctly identifies valid JSON 100% of the time
- ✓ Correctly identifies invalid JSON 100% of the time
- ✓ Displays line/column information for 95%+ of syntax errors
- ✓ Processes typical inputs (<1MB) in <100ms
- ✓ Auto-clears output when input is cleared

**Implementation Tasks**:

- [x] T012 [US3] Write contract tests in `tests/contracts/json-validator.test.ts` (22 test cases: valid JSON, invalid JSON, syntax errors, empty input, large inputs, edge cases)
- [x] T013 [US3] Create JSONValidatorTool component in `src/components/tools/JSONValidatorTool.tsx` with input field, split output panel
- [x] T014 [US3] Implement ValidationStatus sub-component in `src/components/tools/json-validator/ValidationStatus.tsx` (valid/invalid indicator with checkmark)
- [x] T015 [US3] Implement ErrorDetails sub-component in `src/components/tools/json-validator/ErrorDetails.tsx` (error message with line/column info)
- [ ] T016 [US3] Write component tests in `tests/component/json-validator.test.tsx` (15 test cases for component rendering, error display, accessibility)

---

## Phase 6: User Story 4 - JSON Minifier Tool (Priority: P2)

**Goal**: Create JSON Minifier tool that removes whitespace and displays size comparison

**Independent Test Criteria**:
- ✓ Minifies formatted JSON with 30%+ size reduction for typical inputs
- ✓ Minification is idempotent (already-minified JSON unchanged)
- ✓ Handles invalid JSON gracefully with error message
- ✓ Processes typical inputs (<1MB) in <100ms
- ✓ Auto-clears output when input is cleared

**Implementation Tasks**:

- [x] T017 [US4] Write contract tests in `tests/contracts/json-minifier.test.ts` (22 test cases: minification, idempotency, invalid JSON, empty input, large inputs, size comparison, statistics)
- [x] T018 [US4] Create JSONMinifierTool component in `src/components/tools/JSONMinifierTool.tsx` with input field, minified output, stats panel
- [x] T019 [US4] Implement MinificationStats sub-component (inline in JSONMinifierTool.tsx) displaying original size, minified size, bytes saved, reduction %
- [ ] T020 [US4] Write component tests in `tests/component/json-minifier.test.tsx` (15 test cases for component rendering, stats calculation, accessibility)

---

## Phase 7: User Story 5 - Format Tools Category and Organization (Priority: P2)

**Goal**: Add Format category to sidebar and organize JSON Validator & Minifier as discoverable tools

**Independent Test Criteria**:
- ✓ Format category appears in sidebar as expandable section
- ✓ JSON Validator and JSON Minifier listed under Format category
- ✓ Tools load with layout matching existing tools (sidebar, settings, input/output)
- ✓ Category integrates with existing tool registry system

**Implementation Tasks**:

- [ ] T021 [P] [US5] Update tool registry in `src/context/ToolContext.tsx` to add Format category and register JSONValidatorTool, JSONMinifierTool
- [ ] T022 [US5] Update `src/components/SettingsSidebar.tsx` to render Format category with expandable UI matching existing categories (Encoding, etc.)

---

## Phase 8: Integration & Quality Gates

### Integration Tests

- [ ] T023 [P] Write end-to-end workflow tests in `tests/integration/json-tools-workflows.test.tsx` (20 test cases: validate valid/invalid JSON, minify and share, cross-tool parameter isolation, auto-clear on all tools)

### Performance Tests

- [ ] T024 [P] Write performance tests in `tests/integration/performance-json-tools.test.ts` (8 test cases: JSON Validator <100ms, Minifier <100ms for 1MB input, split panel render <50ms, stats calc <10ms)

### Quality Verification

- [ ] T025 Final quality checks: verify `npm test` (525+ tests passing), `npm run lint` (0 errors), `npx tsc --noEmit` (TypeScript strict), `npm run build` (production build), update `README.md` with new tools

---

## Implementation Strategy

### MVP Scope (Recommended First Sprint)

**Phase 3 Only**: User Story 1 (Auto-Clear)
- Delivers immediate P1 value
- Establishes testing patterns
- Minimal risk, maximum ROI
- Delivers: T005-T007 (30 min)

### Incremental Delivery

1. **Increment 1** (Phases 1-4): Bugs + Utilities (2 hours)
   - T001-T004: Setup + Utilities (55 min)
   - T005-T011: Bug fixes (75 min)
   - **Value**: Critical UX bugs fixed, testing patterns established

2. **Increment 2** (Phase 5-6): New Tools (2.5 hours)
   - T012-T020: JSON Validator + Minifier (165 min)
   - **Value**: New tool category launched, workflows improved

3. **Increment 3** (Phases 7-8): Polish (1.5 hours)
   - T021-T025: Integration + Quality (90 min)
   - **Value**: Production-ready, all quality gates passed

### Parallel Opportunities

**After T004 (utilities ready)**:
- T006-T007 can be coded in parallel (auto-clear for 3 tools)
- T012-T016 can be written in parallel (JSON Validator tests + component)
- T017-T020 can be written in parallel (JSON Minifier tests + component)

**Independent tasks** (can start anytime):
- T005, T008: Contract tests (red-green-refactor pattern)
- T013-T015, T018-T020: Component implementations

---

## Success Criteria Checklist

### Functional ✅

- [ ] Auto-clear works on Base64, Base16, Base32 tools
- [ ] Share button positioned in sidebar to the right
- [ ] JSON Validator shows valid/invalid with error messages + line/column
- [ ] JSON Minifier shows minified output + size comparison
- [ ] Format category appears in sidebar with expandable UI
- [ ] All tools accessible from sidebar
- [ ] No breaking changes to existing tools

### Quality ✅

- [ ] All 525+ tests passing (101 new + 424 existing)
- [ ] 0 lint errors (npm run lint)
- [ ] TypeScript strict mode passing (npx tsc --noEmit)
- [ ] Production build succeeds (npm run build)
- [ ] Performance budgets met (<100ms JSON processing)
- [ ] 85%+ code coverage on new code
- [ ] Accessibility tests passing (keyboard nav, screen reader)

### Documentation ✅

- [ ] JSDoc comments on all new components
- [ ] README updated with new Format tools
- [ ] Contract test specifications detailed
- [ ] Performance targets documented
- [ ] Type definitions clear and self-documenting

---

## Test Count Summary

| Test Suite | Type | Count | Status |
|-----------|------|-------|--------|
| Contract: auto-clear | Contract | 9 | T005 |
| Contract: share-ui | Contract | 8 | T008 |
| Contract: json-validator | Contract | 22 | T012 |
| Contract: json-minifier | Contract | 20 | T017 |
| Unit: json-utils | Unit | 24 | T004 |
| Component: json-validator | Component | 15 | T016 |
| Component: json-minifier | Component | 15 | T020 |
| Integration: workflows | Integration | 20 | T023 |
| Integration: performance | Integration | 8 | T024 |
| **TOTAL NEW** | | **101** | |
| **EXISTING** | | **424** | Feature 004 |
| **GRAND TOTAL** | | **525+** | |

---

## Task Dependencies

```
T001 (Setup)
  ↓
T002 (Types)
  ├─→ T003 (Utilities) ─→ T004 (Tests)
  │        ↓
  │     T006-T007 (Base16, Base32 auto-clear)
  │     T013-T015 (Validator component)
  │     T018-T020 (Minifier component)
  │
  └─→ T005 (Auto-clear tests) ─→ T006 ─→ T007
       │
       ├─→ T008 (Share UI tests) ─→ T009 ─→ T010 ─→ T011
       │
       ├─→ T012 (Validator tests) ─→ T013 ─→ T014 ─→ T015 ─→ T016
       │
       ├─→ T017 (Minifier tests) ─→ T018 ─→ T019 ─→ T020
       │
       └─→ T021 (Registry) ─→ T022 (Sidebar)
               ↓
            T023-T024 (Integration + Performance)
               ↓
            T025 (Quality verification)
```

---

## Quick Start for Developers

### 1. Read Documentation (15 min)
- [ ] `quickstart.md` - Development workflow
- [ ] `data-model.md` - Type definitions
- [ ] `contracts/` - Test specifications

### 2. TDD Workflow (Per Task)
1. **RED**: Write failing contract test
2. **GREEN**: Implement feature to pass test
3. **REFACTOR**: Clean up code, ensure quality
4. **VERIFY**: Run full test suite

### 3. File Checklist
- [ ] Component created in `src/components/`
- [ ] Types defined in `src/types/`
- [ ] Utilities in `src/utils/`
- [ ] Tests in `tests/contracts/`, `tests/component/`, `tests/integration/`
- [ ] Styles use Tailwind CSS 3.x utilities (no custom CSS unless necessary)

### 4. Before Merging
```bash
npm test                 # All 525+ tests passing ✓
npm run lint            # 0 lint errors ✓
npx tsc --noEmit       # TypeScript strict ✓
npm run build          # Production build ✓
```

---

## File Creation Checklist

### Components (New)
- [ ] `src/components/tools/JSONValidatorTool.tsx`
- [ ] `src/components/tools/json-validator/ValidationStatus.tsx`
- [ ] `src/components/tools/json-validator/ErrorDetails.tsx`
- [ ] `src/components/tools/JSONMinifierTool.tsx`
- [ ] `src/components/tools/json-minifier/MinificationStats.tsx`

### Types (New)
- [ ] `src/types/json-tools.ts`

### Utilities (New)
- [ ] `src/utils/json-utils.ts`

### Tests (New)
- [ ] `tests/contracts/auto-clear.test.ts`
- [ ] `tests/contracts/share-ui.test.ts`
- [ ] `tests/contracts/json-validator.test.ts`
- [ ] `tests/contracts/json-minifier.test.ts`
- [ ] `tests/component/json-validator.test.tsx`
- [ ] `tests/component/json-minifier.test.tsx`
- [ ] `tests/integration/share-ui-responsive.test.tsx`
- [ ] `tests/integration/json-tools-workflows.test.tsx`
- [ ] `tests/integration/performance-json-tools.test.ts`
- [ ] `tests/unit/json-utils.test.ts`

### Modified (Existing)
- [ ] `src/components/tools/Base64Tool.tsx` (add auto-clear)
- [ ] `src/components/tools/Base16Tool.tsx` (add auto-clear)
- [ ] `src/components/tools/Base32Tool.tsx` (add auto-clear)
- [ ] `src/components/SettingsSidebar.tsx` (add Format category, reposition Share button)
- [ ] `src/context/ToolContext.tsx` (register new tools)
- [ ] `src/components/SettingsSidebar.module.css` (responsive styling)
- [ ] `README.md` (document new tools)

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Auto-clear breaks existing tools | Low | High | Comprehensive contract tests (T005), verify all tools before T011 |
| Mobile layout breaks | Medium | Medium | Early responsive testing (T010-T011), multiple breakpoints |
| JSON parsing performance issues | Low | Medium | Performance tests (T024) with 1MB inputs, debounce if needed |
| Share button CSS conflicts | Low | Low | Visual regression tests, isolated CSS modules |
| Type safety gaps | Low | Low | TypeScript strict mode enforced (T025) |

---

## Deployment Checklist

- [ ] All 525+ tests passing
- [ ] npm run lint: 0 errors
- [ ] npx tsc --noEmit: 0 errors  
- [ ] npm run build: Success
- [ ] Performance budgets met
- [ ] Code review approved
- [ ] Manual testing: Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive (320px-4K)
- [ ] Accessibility check (keyboard, screen reader)
- [ ] README updated
- [ ] git commit with meaningful message
- [ ] Create PR and merge to main

---

## Next Steps

1. **Immediate** (Start Here):
   - [ ] Read `quickstart.md` (15 min)
   - [ ] Run `npm test` to establish baseline (424 passing)
   - [ ] Begin Phase 1: T001-T002 (setup + types)

2. **Phase 3 (Quick P1 Win)**:
   - [ ] T005: Write auto-clear contract tests (RED ❌)
   - [ ] T006-T007: Implement auto-clear in tools (GREEN ✅)
   - [ ] Verify all tests pass

3. **Phases 4-8 (Continue)**:
   - [ ] Follow task dependency graph
   - [ ] Use parallel opportunities to accelerate
   - [ ] Run quality checks after each phase

4. **Sign-Off**:
   - [ ] All tasks complete
   - [ ] All tests passing
   - [ ] Quality gates passed
   - [ ] Ready for deployment

---

## Task Assignment Recommendations

**For Single Developer**: Follow sequential order (Phase 1 → 8) with parallel opportunities

**For Two Developers**:
- **Dev 1**: Phases 3-4 (Bug fixes) + Phase 7 (Sidebar registration)
- **Dev 2**: Phases 5-6 (New tools) after Dev 1 completes Phase 2

**For Three+ Developers**:
- **Dev 1**: Phases 1-2 (Setup + Utilities)
- **Dev 2**: Phases 3-4 (Bug fixes) in parallel
- **Dev 3**: Phases 5-6 (New tools) in parallel
- **Dev 1**: Phases 7-8 (Integration + Quality) after utilities ready

---

## Document References

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `spec.md` | User stories + requirements | Start of project |
| `plan.md` | Implementation strategy + timeline | Before Phase 1 |
| `quickstart.md` | Developer quick-start guide | Before coding |
| `research.md` | Architecture + decisions | Technical questions |
| `data-model.md` | Type definitions + data flows | Before T002 |
| `contracts/bug-fixes.md` | Auto-clear + Share UI specs | Before T005, T008 |
| `contracts/json-validator.md` | Validator specifications | Before T012 |
| `contracts/json-minifier.md` | Minifier specifications | Before T017 |
| `PLANNING_COMPLETE.md` | Project summary | Project overview |

---

## Status Tracking

- [ ] Phase 1: Setup & Types (T001-T002)
- [ ] Phase 2: Utilities (T003-T004)
- [ ] Phase 3: Auto-Clear (T005-T007)
- [ ] Phase 4: Share UI (T008-T011)
- [ ] Phase 5: JSON Validator (T012-T016)
- [ ] Phase 6: JSON Minifier (T017-T020)
- [ ] Phase 7: Sidebar Format (T021-T022)
- [ ] Phase 8: Integration & Quality (T023-T025)
- [ ] **✅ COMPLETE**: All phases done, ready for deployment

---

**Created**: 2025-10-31  
**Version**: 1.0.0  
**Status**: Ready for Implementation ✅

**Next Command**: Developers start with T001 and follow Phase 1 instructions. Use this checklist to track progress through all 25 tasks.
