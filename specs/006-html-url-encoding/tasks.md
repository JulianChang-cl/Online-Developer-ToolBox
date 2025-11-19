# Tasks: HTML & URL Encoding Tools

**Input**: Design documents from `/specs/006-html-url-encoding/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  
**Tests**: Contract tests REQUIRED per TDD mandate (Constitution II)

**Organization**: Tasks grouped by user story to enable independent implementation and testing

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- File paths use `frontend/` prefix per project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - no code changes needed, existing structure sufficient

- [x] T001 Verify TypeScript 5.9.3 strict mode configuration in tsconfig.json
- [x] T002 Verify React 18.2, Tailwind CSS 3.4, Vite 5.4.21, Jest 30+ dependencies
- [x] T003 Review existing tool patterns (Base64EncodeTool.tsx, JSONValidatorTool.tsx)

**Status**: ✅ Setup complete - project structure already established

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core encoding services that ALL user stories depend on

**⚠️ CRITICAL**: Services MUST be complete with passing tests before ANY component work begins

### HTML Encoder Service (TDD)

- [ ] T004 [P] Write contract test: Basic entity encoding (`<>&"'`) in `tests/contract/html-encoder.test.tsx`
- [ ] T005 [P] Write contract test: XSS prevention (`<script>` → `&lt;script&gt;`) in `tests/contract/html-encoder.test.tsx`
- [ ] T006 [P] Write contract test: Unicode pass-through (`你好` → `你好`) in `tests/contract/html-encoder.test.tsx`
- [ ] T007 [P] Write contract test: Named entity decoding (`&lt;` → `<`) in `tests/contract/html-encoder.test.tsx`
- [ ] T008 [P] Write contract test: Numeric entity decoding (`&#60;` → `<`) in `tests/contract/html-encoder.test.tsx`
- [ ] T009 [P] Write contract test: Malformed entity pass-through (`&lt` → `&lt`) in `tests/contract/html-encoder.test.tsx`
- [ ] T010 [P] Write contract test: Empty input handling in `tests/contract/html-encoder.test.tsx`
- [ ] T011 [P] Write contract test: Performance 10KB < 50ms in `tests/contract/html-encoder.test.tsx`
- [ ] T012 Verify all HTML encoder tests FAIL (RED phase)
- [ ] T013 Implement HTML_ENTITIES map in `frontend/src/services/html-encoder.ts`
- [ ] T014 Implement NAMED_ENTITIES decode map in `frontend/src/services/html-encoder.ts`
- [ ] T015 Implement encode() function in `frontend/src/services/html-encoder.ts`
- [ ] T016 Implement decode() function with named entities in `frontend/src/services/html-encoder.ts`
- [ ] T017 Implement decode() numeric entity support (&#NNN; and &#xHHH;) in `frontend/src/services/html-encoder.ts`
- [ ] T018 Implement validate() function (lenient) in `frontend/src/services/html-encoder.ts`
- [ ] T019 Verify all HTML encoder tests PASS (GREEN phase)
- [ ] T020 Refactor HTML encoder for clarity and performance (REFACTOR phase)

### URL Encoder Service (TDD)

- [ ] T021 [P] Write contract test: Space encoding (`" "` → `%20`) in `tests/contract/url-encoder.test.tsx`
- [ ] T022 [P] Write contract test: Reserved char encoding (`=&?` → `%3D%26%3F`) in `tests/contract/url-encoder.test.tsx`
- [ ] T023 [P] Write contract test: Unreserved NOT encoded (`A-Za-z0-9-._~`) in `tests/contract/url-encoder.test.tsx`
- [ ] T024 [P] Write contract test: UTF-8 encoding (`你好` → `%E4%BD%A0%E5%A5%BD`) in `tests/contract/url-encoder.test.tsx`
- [ ] T025 [P] Write contract test: Emoji encoding (`🚀` → 4-byte UTF-8) in `tests/contract/url-encoder.test.tsx`
- [ ] T026 [P] Write contract test: Invalid sequence pass-through (`%ZZ` → `%ZZ`) in `tests/contract/url-encoder.test.tsx`
- [ ] T027 [P] Write contract test: Empty input handling in `tests/contract/url-encoder.test.tsx`
- [ ] T028 [P] Write contract test: Performance 10KB < 50ms in `tests/contract/url-encoder.test.tsx`
- [ ] T029 Verify all URL encoder tests FAIL (RED phase)
- [ ] T030 Implement encode() using encodeURIComponent in `frontend/src/services/url-encoder.ts`
- [ ] T031 Implement decode() with try-catch for invalid sequences in `frontend/src/services/url-encoder.ts`
- [ ] T032 Implement validate() checking for invalid percent sequences in `frontend/src/services/url-encoder.ts`
- [ ] T033 Verify all URL encoder tests PASS (GREEN phase)
- [ ] T034 Refactor URL encoder for clarity (REFACTOR phase)

**Checkpoint**: ✅ Foundation ready - both encoding services implemented with 16+ passing tests

---

## Phase 3: User Story 1 - HTML Content Safety (Priority: P1) 🎯 MVP

**Goal**: Web developer can encode/decode HTML entities for XSS prevention

**Independent Test**: Paste `<script>alert('XSS')</script>` → see `&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;`, copy result, switch to decode, paste, see original

### Implementation for User Story 1

- [ ] T035 [P] [US1] Create HTMLEncodeTool component skeleton in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T036 [P] [US1] Create HTMLDecodeTool component skeleton in `frontend/src/components/Tools/HTMLDecodeTool.tsx`
- [ ] T037 [US1] Implement HTMLEncodeTool state management (localInput, output, isProcessing) in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T038 [US1] Implement auto-update with 200ms debounce in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T039 [US1] Implement 3-column grid layout (1fr 2fr 2fr) in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T040 [US1] Add ToolOptions with Auto-Update toggle in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T041 [US1] Add InputField with proper label in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T042 [US1] Add OutputField (always visible, showEmpty) in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T043 [US1] Add CopyButton + ShareButton below output in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T044 [US1] Integrate htmlEncoderService.encode() in `frontend/src/components/Tools/HTMLEncodeTool.tsx`
- [ ] T045 [US1] Implement HTMLDecodeTool (mirror encode structure) in `frontend/src/components/Tools/HTMLDecodeTool.tsx`
- [ ] T046 [US1] Integrate htmlEncoderService.decode() in `frontend/src/components/Tools/HTMLDecodeTool.tsx`
- [ ] T047 [US1] Add state reset on tool switch for both HTML tools
- [ ] T048 [US1] Register html-encode tool in `frontend/src/tools/index.ts` (id: 'html-encode', name: 'Encode', category: 'Encoders', priority: 9)
- [ ] T049 [US1] Register html-decode tool in `frontend/src/tools/index.ts` (id: 'html-decode', name: 'Decode', category: 'Encoders', priority: 10)
- [ ] T050 [US1] Add HTML group to TOOL_GROUPS in `frontend/src/tools/index.ts` (id: 'html', name: 'HTML', items: [html-encode, html-decode])
- [ ] T051 [US1] Add html: false to DEFAULT_STATE in `frontend/src/hooks/useSidebarState.ts`
- [ ] T052 [US1] Add routing for /html-encode in `frontend/src/App.tsx`
- [ ] T053 [US1] Add routing for /html-decode in `frontend/src/App.tsx`

**Checkpoint**: User Story 1 complete - HTML Encode/Decode functional, sidebar shows HTML group, XSS protection verified

---

## Phase 4: User Story 2 - URL Parameter Encoding (Priority: P2)

**Goal**: API developer can encode/decode URL parameters following RFC 3986

**Independent Test**: Enter `name=John Doe&email=john@example.com` → see `name%3DJohn%20Doe%26email%3Djohn%40example.com`, copy, decode, verify original

### Implementation for User Story 2

- [ ] T054 [P] [US2] Create URLEncodeTool component skeleton in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T055 [P] [US2] Create URLDecodeTool component skeleton in `frontend/src/components/Tools/URLDecodeTool.tsx`
- [ ] T056 [US2] Implement URLEncodeTool state management (localInput, output, isProcessing) in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T057 [US2] Implement auto-update with 200ms debounce in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T058 [US2] Implement 3-column grid layout (1fr 2fr 2fr) in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T059 [US2] Add ToolOptions with Auto-Update toggle in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T060 [US2] Add InputField with proper label in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T061 [US2] Add OutputField (always visible, showEmpty) in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T062 [US2] Add CopyButton + ShareButton below output in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T063 [US2] Integrate urlEncoderService.encode() in `frontend/src/components/Tools/URLEncodeTool.tsx`
- [ ] T064 [US2] Implement URLDecodeTool (mirror encode structure) in `frontend/src/components/Tools/URLDecodeTool.tsx`
- [ ] T065 [US2] Integrate urlEncoderService.decode() in `frontend/src/components/Tools/URLDecodeTool.tsx`
- [ ] T066 [US2] Add state reset on tool switch for both URL tools
- [ ] T067 [US2] Register url-encode tool in `frontend/src/tools/index.ts` (id: 'url-encode', name: 'Encode', category: 'Encoders', priority: 11)
- [ ] T068 [US2] Register url-decode tool in `frontend/src/tools/index.ts` (id: 'url-decode', name: 'Decode', category: 'Encoders', priority: 12)
- [ ] T069 [US2] Add URL group to TOOL_GROUPS in `frontend/src/tools/index.ts` (id: 'url', name: 'URL', items: [url-encode, url-decode])
- [ ] T070 [US2] Add url: false to DEFAULT_STATE in `frontend/src/hooks/useSidebarState.ts`
- [ ] T071 [US2] Add routing for /url-encode in `frontend/src/App.tsx`
- [ ] T072 [US2] Add routing for /url-decode in `frontend/src/App.tsx`

**Checkpoint**: User Story 2 complete - URL Encode/Decode functional, sidebar shows URL group, RFC 3986 compliance verified

---

## Phase 5: User Story 3 - Layout Consistency (Priority: P3)

**Goal**: User sees consistent 3-column layout across all tools

**Independent Test**: Open HTML Encode, Base64 Encode, JSON Validator - verify identical layout (settings left, input center, output right, same grid proportions)

### Verification for User Story 3

- [ ] T073 [P] [US3] Verify HTMLEncodeTool grid matches Base64EncodeTool (1fr 2fr 2fr)
- [ ] T074 [P] [US3] Verify HTMLDecodeTool grid matches Base64DecodeTool (1fr 2fr 2fr)
- [ ] T075 [P] [US3] Verify URLEncodeTool grid matches Base64EncodeTool (1fr 2fr 2fr)
- [ ] T076 [P] [US3] Verify URLDecodeTool grid matches Base64DecodeTool (1fr 2fr 2fr)
- [ ] T077 [P] [US3] Verify ToolOptions panel placement matches existing tools
- [ ] T078 [P] [US3] Verify OutputField always visible (showEmpty prop) matches JSON tools
- [ ] T079 [P] [US3] Verify CopyButton + ShareButton placement matches existing tools
- [ ] T080 [US3] Browser test: Compare layout side-by-side with Base64 tool (visual verification)

**Checkpoint**: User Story 3 complete - Layout consistency verified across all encoding tools

---

## Phase 6: User Story 4 - Sidebar Organization (Priority: P3)

**Goal**: User can navigate HTML and URL tools via sidebar groups

**Independent Test**: Open sidebar, see HTML group (collapsible), see URL group (collapsible), click to expand/collapse, click items to navigate

### Verification for User Story 4

- [ ] T081 [P] [US4] Verify HTML group appears in sidebar with correct name
- [ ] T082 [P] [US4] Verify HTML group contains Encode and Decode items
- [ ] T083 [P] [US4] Verify URL group appears in sidebar with correct name
- [ ] T084 [P] [US4] Verify URL group contains Encode and Decode items
- [ ] T085 [P] [US4] Verify groups appear alongside Base64, Base16, Base32, JSON groups
- [ ] T086 [P] [US4] Test expand/collapse behavior for HTML group
- [ ] T087 [P] [US4] Test expand/collapse behavior for URL group
- [ ] T088 [US4] Browser test: Navigate all 4 tools via sidebar, verify routing works

**Checkpoint**: User Story 4 complete - Sidebar navigation fully functional for HTML and URL tools

---

## Phase 7: User Story 5 - Edge Cases (Priority: P3)

**Goal**: Tools handle edge cases gracefully (Unicode, malformed input, invalid sequences, empty input)

**Independent Test**: 
1. HTML Encode `你好 🌍` → verify unchanged (pass-through)
2. HTML Decode `&lt` → verify unchanged (malformed)
3. URL Decode `%ZZ` → verify unchanged (invalid hex)
4. All tools: empty input → empty output

### Verification for User Story 5

- [ ] T089 [P] [US5] Test HTML Encode with Unicode (`你好 🌍` → `你好 🌍`)
- [ ] T090 [P] [US5] Test HTML Encode with emoji (`🚀` → `🚀`)
- [ ] T091 [P] [US5] Test HTML Decode with mixed entities (`&lt;div&gt;` and `&#60;div&#62;`)
- [ ] T092 [P] [US5] Test HTML Decode with malformed entity (`&lt` → `&lt`)
- [ ] T093 [P] [US5] Test URL Encode with spaces (`hello world` → `hello%20world`)
- [ ] T094 [P] [US5] Test URL Decode with invalid hex (`%ZZ` → `%ZZ`)
- [ ] T095 [P] [US5] Test URL Decode with incomplete sequence (`%2` → `%2`)
- [ ] T096 [P] [US5] Test all 4 tools with empty input (output clears automatically)
- [ ] T097 [US5] Browser test: Verify no crashes with extreme input (100KB text)

**Checkpoint**: User Story 5 complete - All edge cases handled gracefully, no crashes

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance and documentation

- [ ] T098 [P] Run all contract tests (expect 88 existing + 16 new = 104 total passing)
- [ ] T099 [P] Run TypeScript compilation: `npx tsc --noEmit` (expect 0 errors)
- [ ] T100 [P] Run lint: `npm run lint` (expect 0 errors)
- [ ] T101 Run production build: `npm run build` (expect success)
- [ ] T102 Verify performance: Test 10KB input in all 4 tools (< 50ms)
- [ ] T103 [P] Update README.md with HTML/URL tools (if applicable)
- [ ] T104 Verify agent context already updated (`.github/copilot-instructions.md`)
- [ ] T105 Run quickstart.md validation checklist (15+ manual tests)
- [ ] T106 Browser cross-compatibility test (Chrome, Firefox, Safari, Edge)
- [ ] T107 Accessibility audit (keyboard navigation, screen reader compatibility)

**Checkpoint**: ✅ Feature complete - All 5 user stories implemented, tested, and verified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Already complete - existing project structure sufficient
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
  - HTML Encoder Service (T004-T020): 17 tasks, ~1.5 hours
  - URL Encoder Service (T021-T034): 14 tasks, ~1 hour
  - **Total**: 31 tasks, ~2.5 hours
- **User Stories (Phase 3-7)**: ALL depend on Foundational completion
  - Can proceed in parallel if team capacity allows
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (HTML Content Safety)**: Can start after Foundational - No dependencies on other stories
- **US2 (URL Parameter Encoding)**: Can start after Foundational - No dependencies on other stories
- **US3 (Layout Consistency)**: Depends on US1 + US2 (verification phase)
- **US4 (Sidebar Organization)**: Depends on US1 + US2 (verification phase)
- **US5 (Edge Cases)**: Depends on US1 + US2 (testing phase)

### Within Each User Story

- **Foundational**: Tests FIRST (T004-T011, T021-T028) → Implementation (T013-T020, T030-T034) → Verify tests pass
- **US1**: Skeleton components parallel (T035, T036) → Encode tool (T037-T044) → Decode tool (T045-T046) → Registration (T047-T053)
- **US2**: Skeleton components parallel (T054, T055) → Encode tool (T056-T063) → Decode tool (T064-T066) → Registration (T067-T072)
- **US3-US5**: All verification tasks can run in parallel within each phase

### Parallel Opportunities

**Foundational Phase**:
- All HTML encoder contract tests (T004-T011) can run in parallel - 8 tasks
- All URL encoder contract tests (T021-T028) can run in parallel - 8 tasks
- Both test suites can be written simultaneously by different developers

**User Story 1**:
- Component skeletons (T035, T036) can run in parallel - 2 tasks
- After encode tool complete, decode tool can proceed independently

**User Story 2**:
- Component skeletons (T054, T055) can run in parallel - 2 tasks
- After encode tool complete, decode tool can proceed independently

**User Story 3**:
- All verification tasks (T073-T079) can run in parallel - 7 tasks

**User Story 4**:
- All verification tasks (T081-T087) can run in parallel - 7 tasks

**User Story 5**:
- All test tasks (T089-T096) can run in parallel - 8 tasks

**Polish Phase**:
- Tests, TypeScript, lint (T098-T100) can run in parallel - 3 tasks
- Documentation updates (T103, T104) can run in parallel - 2 tasks

---

## Parallel Example: Foundational Phase (Most Critical)

```bash
# Write all HTML encoder contract tests in parallel:
T004: "Write contract test: Basic entity encoding in tests/contract/html-encoder.test.tsx"
T005: "Write contract test: XSS prevention in tests/contract/html-encoder.test.tsx"
T006: "Write contract test: Unicode pass-through in tests/contract/html-encoder.test.tsx"
T007: "Write contract test: Named entity decoding in tests/contract/html-encoder.test.tsx"
T008: "Write contract test: Numeric entity decoding in tests/contract/html-encoder.test.tsx"
T009: "Write contract test: Malformed entity pass-through in tests/contract/html-encoder.test.tsx"
T010: "Write contract test: Empty input handling in tests/contract/html-encoder.test.tsx"
T011: "Write contract test: Performance 10KB < 50ms in tests/contract/html-encoder.test.tsx"

# Then verify tests fail (T012), implement service (T013-T020), verify tests pass (T019)

# Simultaneously, write all URL encoder contract tests in parallel:
T021-T028 (same pattern)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. **Complete Phase 1**: ✅ Already done (existing project structure)
2. **Complete Phase 2**: Foundational services with TDD (T004-T034) - ~2.5 hours
3. **Complete Phase 3**: HTML Encode/Decode (T035-T053) - ~1.5 hours
4. **Complete Phase 4**: URL Encode/Decode (T054-T072) - ~1.5 hours
5. **STOP and VALIDATE**: Test both stories independently
6. **Deploy/Demo**: Core encoding functionality ready

**MVP Scope**: 72 tasks, ~5.5 hours, delivers core HTML and URL encoding tools

### Incremental Delivery

1. **Foundation** (Phase 2) → Services tested and working - ~2.5 hours
2. **MVP** (Phase 3-4) → HTML + URL tools functional - ~3 hours
3. **Verification** (Phase 5-7) → Layout, sidebar, edge cases - ~1 hour
4. **Polish** (Phase 8) → Documentation, QA, optimization - ~30 min

**Total**: 107 tasks, ~7 hours (vs. 6.5 hour estimate in plan - tracking ~8% over)

### Parallel Team Strategy

With 2 developers:

1. **Together**: Complete Phase 1 (already done) + Phase 2 Foundational (~2.5 hours)
2. **Split**:
   - Developer A: Phase 3 (HTML tools) - ~1.5 hours
   - Developer B: Phase 4 (URL tools) - ~1.5 hours
3. **Together**: Phases 5-8 verification and polish (~1.5 hours)

**Team Timeline**: ~5.5 hours total (vs. 7 hours sequential)

---

## Task Summary

| Phase | Tasks | Parallel Tasks | Estimated Time |
|-------|-------|----------------|----------------|
| Phase 1: Setup | 3 (✅ complete) | 0 | 0 hours |
| Phase 2: Foundational | 31 | 16 | 2.5 hours |
| Phase 3: US1 (HTML) | 19 | 2 | 1.5 hours |
| Phase 4: US2 (URL) | 19 | 2 | 1.5 hours |
| Phase 5: US3 (Layout) | 8 | 7 | 30 min |
| Phase 6: US4 (Sidebar) | 8 | 7 | 30 min |
| Phase 7: US5 (Edge Cases) | 9 | 8 | 30 min |
| Phase 8: Polish | 10 | 5 | 30 min |
| **TOTAL** | **107** | **47** | **~7 hours** |

**Parallel Opportunities**: 44% of tasks can run in parallel (47/107)

**MVP Scope**: 72 tasks (Phases 2-4), ~5.5 hours

**Independent Test Criteria**:
- ✅ US1: XSS script encoding/decoding roundtrip
- ✅ US2: URL query string encoding/decoding roundtrip
- ✅ US3: Side-by-side layout comparison with Base64 tool
- ✅ US4: Sidebar navigation to all 4 tools
- ✅ US5: Unicode pass-through, invalid input graceful handling

---

## Notes

- **TDD Mandatory**: Tests written first, verified to fail, then implementation (Constitution II)
- **[P] Marker**: 47 tasks can run in parallel (different files, no dependencies)
- **[Story] Labels**: US1-US5 map to scenarios in spec.md
- **Constitution Compliance**: All 4 principles verified in plan.md
- **Clarifications Applied**: Unicode pass-through, graceful error handling, strict semicolons
- **File Paths**: All paths use `frontend/` prefix per project structure
- **Checkpoints**: Each phase ends with independent verification
- **Incremental Value**: Each user story adds testable functionality
- **No Blockers**: All technical decisions resolved in research.md
