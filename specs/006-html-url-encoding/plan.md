# Implementation Plan: HTML & URL Encoding Tools

**Branch**: `006-html-url-encoding` | **Date**: 2025-10-31 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-html-url-encoding/spec.md`  
**Status**: ✅ **COMPLETE** | **Completion Date**: 2025-11-03 | **Summary**: [COMPLETE.md](./COMPLETE.md)

---

## Summary

Add HTML entity encoding/decoding and URL percent encoding/decoding tools to the platform. These tools follow the established patterns from existing encoding tools (Base64, Base16, Base32, JSON), maintaining consistent 3-column layout, auto-update functionality, and sidebar navigation with "HTML" and "URL" groups.

**Technical Approach**:
- Use native JavaScript string manipulation (no external libraries)
- HTML encoding: String replacement with entity map for `<>&"'`
- URL encoding: `encodeURIComponent()` with RFC 3986 adjustments
- Follow exact component patterns from existing tools
- Contract-test-first development for all encoding logic

---

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)  
**Primary Dependencies**: React 18.2, Tailwind CSS 3.4, Vite 5.4.21, Jest 30+  
**Storage**: N/A (client-side only, no persistence)  
**Testing**: Jest with React Testing Library, contract tests mandatory  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), ES2020+  
**Project Type**: Web application (frontend only)  
**Performance Goals**: Encoding/decoding <50ms for 10KB input  
**Constraints**: No external encoding libraries, strict TypeScript mode, 80%+ test coverage  
**Scale/Scope**: 4 new tools (HTML Encode/Decode, URL Encode/Decode), ~1000 LOC total

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED (Initial + Post-Clarification Review)

**Clarifications Applied** (2025-10-31):
- Unicode handling: Pass through unchanged (no numeric encoding)
- Invalid URL sequences: Pass through with graceful continuation
- Malformed HTML entities: Strict semicolon requirement with pass-through

These clarifications simplify implementation and maintain consistency across error handling strategies.

### I. Code Quality Excellence ✅

**Compliance**:
- TypeScript strict mode enforced
- Self-documenting function names (e.g., `encodeHTMLEntities`, `decodePercentEncoding`)
- Inline documentation for encoding logic
- Cyclomatic complexity <10 per function (encoding is straightforward string operations)
- Linting enforced (existing CI pipeline)
- Pass-through error handling is simpler than error-throwing alternatives

**Justification**: Standard encoding operations are inherently low complexity. Entity maps and percent encoding are well-defined algorithms. Clarified pass-through behavior reduces edge case complexity.

---

### II. Testing Standards (Test-First Mandatory) ✅

**Compliance**:
- Contract tests MUST be written before implementation
- Minimum coverage: 8 tests per tool × 4 tools = 32 tests
- Test cases cover:
  - Basic encoding/decoding
  - Edge cases (empty input, special characters, Unicode)
  - Invalid input handling
  - Performance requirements (<50ms for 10KB)

**Test-First Workflow**:
1. Write contract test for HTML encoding (e.g., `<script>` → `&lt;script&gt;`)
2. Write contract test for Unicode pass-through (e.g., `你好` → `你好`)
3. Write contract test for malformed entity pass-through (e.g., `&lt` → `&lt`)
4. Write contract test for invalid URL sequence pass-through (e.g., `%ZZ` → `%ZZ`)
5. Verify tests fail
6. Implement encoding service
7. Tests pass
8. Refactor for clarity

---

### III. User Experience Consistency ✅

**Compliance**:
- Layout: Exact 3-column grid pattern from Base64/JSON tools
- Sidebar: "HTML" and "URL" groups following existing structure
- Auto-update: 200ms debounce (same as all other tools)
- Auto-clear: Empty input clears output (consistent behavior)
- Error handling: Pass-through strategy for invalid input (graceful, predictable)
- OutputField: Always visible with `showEmpty` prop

**Clarification Impact**: Pass-through error handling provides consistent behavior across all edge cases, matching user expectations from debugging tools.

**Consistency Checklist**:
- [ ] ToolOptions wrapper with Auto-Update toggle
- [ ] InputField with proper labels
- [ ] OutputField always visible
- [ ] CopyButton + ShareButton below output
- [ ] Grid: `1fr 2fr 2fr` columns
- [ ] State reset on tool switch

---

### IV. Performance Requirements ✅

**Compliance**:
- Target: <50ms for 10KB input (conservative, expect <10ms)
- Algorithm complexity: O(n) for both encoding and decoding
- No unnecessary allocations (direct string replacement)
- Performance test in contract test suite

**Optimization Strategy**:
- HTML encoding: Single pass with entity map lookup
- URL encoding: Use native `encodeURIComponent()` (optimized)
- Avoid regex where simple string operations suffice
- Profile if performance issues arise (unlikely for this domain)

---

## Project Structure

### Documentation (this feature)

```text
specs/006-html-url-encoding/
├── plan.md              # This file
├── research.md          # Phase 0 output (encoding algorithms, edge cases)
├── data-model.md        # Phase 1 output (service interfaces, types)
├── quickstart.md        # Phase 1 output (usage examples, developer guide)
├── contracts/           # Phase 1 output (API contracts, test specifications)
└── tasks.md             # Phase 2 output (NOT created yet)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/Tools/
│   │   ├── HTMLEncodeTool.tsx       # New: HTML Encode component
│   │   ├── HTMLDecodeTool.tsx       # New: HTML Decode component
│   │   ├── URLEncodeTool.tsx        # New: URL Encode component
│   │   └── URLDecodeTool.tsx        # New: URL Decode component
│   ├── services/
│   │   ├── html-encoder.ts          # New: HTML encoding service
│   │   └── url-encoder.ts           # New: URL encoding service
│   ├── tools/
│   │   └── index.ts                 # Modified: Register new tools + groups
│   ├── App.tsx                      # Modified: Add routing for 4 new tools
│   └── hooks/
│       └── useSidebarState.ts       # Modified: Add html/url to DEFAULT_STATE
└── tests/
    └── contract/
        ├── html-encoder.test.tsx    # New: HTML encoding contract tests
        └── url-encoder.test.tsx     # New: URL encoding contract tests
```

**Structure Decision**: Web application (frontend only). Follows existing pattern with components, services, and contract tests. No backend changes required as encoding is client-side.

---

## Complexity Tracking

> No constitution violations. All requirements align with existing standards.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

---

## Phase 0: Research & Design

**Objective**: Resolve all "NEEDS CLARIFICATION" items and document best practices.

### Research Tasks

1. **HTML Entity Encoding Best Practices**
   - Which entities are essential for XSS prevention?
   - Named vs numeric entities: when to use which?
   - Handling of Unicode characters (encode or pass through)?
   - Edge cases: nested entities, malformed entities

2. **URL Encoding RFC 3986 Compliance**
   - Unreserved characters: `-._~` must NOT be encoded
   - Reserved characters: `:/?#[]@!$&'()*+,;=` encoding rules
   - Space encoding: `%20` vs `+` (use `%20` for RFC 3986)
   - UTF-8 byte sequence encoding for non-ASCII

3. **Existing Tool Patterns Review**
   - Analyze Base64EncodeTool.tsx for layout structure
   - Extract ToolOptions pattern from JSON tools
   - Document Auto-Update implementation (200ms debounce)
   - Review sidebar state management for new groups

4. **Edge Case Catalog**
   - HTML: `&lt;` vs `&#60;` vs `&#x3C;` (all valid, which to output?)
   - URL: Invalid percent sequences (`%ZZ`, `%G0`)
   - Empty input, very long input (10KB+)
   - Unicode: emoji, CJK characters, RTL text

**Deliverable**: `research.md` with decisions documented

---

## Phase 1: Contracts & Data Model

**Objective**: Define interfaces, write contract tests, generate API contracts.

### Data Model

**Service Interfaces**:
```typescript
// html-encoder.ts
export interface HTMLEncoderService {
  encode(input: string): string
  decode(input: string): string
  validate(input: string): { valid: boolean; error?: string }
}

// url-encoder.ts  
export interface URLEncoderService {
  encode(input: string): string
  decode(input: string): string
  validate(input: string): { valid: boolean; error?: string }
}
```

**Entity Maps**:
```typescript
const HTML_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;'
}

const ENTITY_DECODE: Record<string, string> = {
  'lt': '<',
  'gt': '>',
  'amp': '&',
  'quot': '"',
  'apos': "'",
  '#39': "'"
}
```

### Contract Tests (32 minimum)

**HTML Encoder** (8 tests):
1. Encode basic entities: `<>&"'`
2. Decode named entities: `&lt;` → `<`
3. Decode numeric entities: `&#60;` → `<`, `&#x3C;` → `<`
4. Handle mixed entities and text
5. Unicode pass-through or encode
6. Empty input returns empty string
7. Invalid entity handling (malformed)
8. Performance: 10KB in <50ms

**URL Encoder** (8 tests):
1. Encode spaces: ` ` → `%20`
2. Encode reserved: `=&?` → `%3D%26%3F`
3. Do NOT encode unreserved: `A-Za-z0-9-._~`
4. UTF-8 encoding: `你好` → `%E4%BD%A0%E5%A5%BD`
5. Decode valid percent sequences
6. Handle invalid percent sequences (`%ZZ`)
7. Empty input returns empty string
8. Performance: 10KB in <50ms

**Component Behavior** (8 tests per tool type, 16 total):
- Auto-update triggers on input change
- Manual encode button when auto-update off
- Output always visible (showEmpty)
- Copy/Share buttons functional
- Empty input clears output
- State resets on tool switch
- Layout matches grid pattern
- Sidebar navigation works

### API Contracts

**Tool Definitions** (for `src/tools/index.ts`):
```typescript
{
  id: 'html-encode',
  name: 'Encode',
  description: 'Convert text to HTML entities',
  category: 'Encoders',
  priority: 9,
  path: '/html-encode'
}
// ... similar for html-decode, url-encode, url-decode
```

**Sidebar Groups**:
```typescript
{
  id: 'html',
  name: 'HTML',
  items: [
    { id: 'html-encode', name: 'Encode' },
    { id: 'html-decode', name: 'Decode' }
  ]
},
{
  id: 'url',
  name: 'URL',
  items: [
    { id: 'url-encode', name: 'Encode' },
    { id: 'url-decode', name: 'Decode' }
  ]
}
```

**Deliverables**:
- `data-model.md` with interfaces and types
- `contracts/` with OpenAPI-style specifications
- `quickstart.md` with usage examples
- Update `.github/copilot-instructions.md` with new tools

---

## Phase 2: Implementation Tasks

**Note**: Detailed tasks will be generated by `/speckit.tasks` command. This is a high-level preview.

### Task Groups

**T001-T004: HTML Encoder Service** (45 min)
- T001: Write contract tests (Red)
- T002: Implement encode function (Green)
- T003: Implement decode function (Green)
- T004: Refactor and optimize

**T005-T008: URL Encoder Service** (45 min)
- T005: Write contract tests (Red)
- T006: Implement encode function (Green)
- T007: Implement decode function (Green)
- T008: Refactor and optimize

**T009-T012: HTML Components** (45 min)
- T009: HTMLEncodeTool component with layout
- T010: HTMLDecodeTool component
- T011: Component tests (optional)
- T012: Verify layout consistency

**T013-T016: URL Components** (45 min)
- T013: URLEncodeTool component with layout
- T014: URLDecodeTool component
- T015: Component tests (optional)
- T016: Verify layout consistency

**T017-T020: Integration** (1 hour)
- T017: Register tools in `src/tools/index.ts`
- T018: Add routing in `App.tsx`
- T019: Update sidebar state management
- T020: Browser testing and verification

**T021-T024: Quality Assurance** (30 min)
- T021: Run all tests (npm test)
- T022: TypeScript compilation check
- T023: Lint verification
- T024: Production build success

---

## Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 0: Research | 1 hour | research.md |
| Phase 1: Design | 1 hour | data-model.md, contracts/, quickstart.md |
| Phase 2: Implementation | 3 hours | Services + Components + Tests |
| Integration | 1 hour | Tool registration + Routing + Sidebar |
| QA & Testing | 30 min | All tests pass + Build success |
| **Total** | **6.5 hours** | Full feature complete |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| URL encoding not RFC 3986 compliant | Low | Medium | Study RFC, test against known implementations |
| HTML entity coverage incomplete | Low | Low | Start with essential entities, document limitations |
| Layout inconsistency | Medium | High | Copy exact pattern from Base64EncodeTool.tsx |
| Sidebar state issues (html/url groups) | Low | Medium | Follow json group pattern exactly |
| Performance regression | Very Low | Low | Test with 10KB input, optimize if needed |
| Test coverage below 80% | Low | Medium | Write contract tests first (TDD), verify coverage |

---

## Success Criteria

**Phase 0 Complete**: ✅
- [x] All NEEDS CLARIFICATION items resolved
- [x] research.md documents HTML entity strategy
- [x] research.md documents URL encoding RFC compliance
- [x] Edge cases cataloged with handling decisions

**Phase 1 Complete**: ✅
- [x] data-model.md defines service interfaces
- [x] contracts/ contains test specifications (html-encoder-contract.md, url-encoder-contract.md)
- [x] quickstart.md shows usage examples
- [x] Agent context updated (.github/copilot-instructions.md)

**Clarifications Applied** (2025-10-31):
- [x] Unicode pass-through (no numeric encoding)
- [x] Invalid URL sequences pass through gracefully
- [x] Malformed HTML entities require strict semicolon

**Phase 2 Complete**: ✅
- [ ] 32+ contract tests written and passing
- [ ] 4 service implementations complete
- [ ] 4 tool components following layout pattern
- [ ] Sidebar shows HTML and URL groups
- [ ] TypeScript compilation clean (0 errors)
- [ ] Lint clean (0 errors)
- [ ] Production build successful
- [ ] Browser verification complete

---

## Next Steps

✅ **Phase 0 Complete**: research.md with all technical decisions  
✅ **Phase 1 Complete**: data-model.md, contracts/, quickstart.md, agent context updated  
✅ **Clarifications Complete**: 3 critical ambiguities resolved (Unicode, URL errors, HTML malformed)

**Ready for Phase 2: Implementation**

Use `/speckit.tasks` to generate detailed implementation tasks, or follow `quickstart.md` for manual implementation.

**Command to continue**:
```bash
# Generate detailed Phase 2 task breakdown:
/speckit.tasks
```

---

**Status**: ✅ Phase 0 & Phase 1 Complete | ⏳ Phase 2 Pending  
**Blockers**: None  
**Dependencies**: Existing encoding tools (Base64, JSON) for pattern reference  
**Estimated Implementation Time**: 6.5 hours (services + components + integration + QA)
