# Implementation Plan: Encoding Expansion (Base16 & Base32)

**Branch**: `003-encoding-expansion` | **Date**: October 29, 2025 | **Spec**: `specs/003-encoding-expansion/spec.md`
**Input**: Feature specification from `/specs/003-encoding-expansion/spec.md`

## Summary

Expand the Online Developer Tools platform with Base16 (hex) and Base32 encoding/decoding tools, extending the existing encoding toolkit. Four new services and components will follow the proven Base64Service abstract pattern, integrated into the unified 20/40/40 content layout. Technical approach: inherit existing architecture (service layer abstraction, component patterns, state management via ToolContext), apply RFC 4648 standards for Base32, implement format tolerance for hex input, and apply layout changes to all 6 encoding tools for consistency.

## Technical Context

**Language/Version**: TypeScript 5.2 (strict mode) | React 18.2
**Primary Dependencies**: React, Tailwind CSS 3.x, Jest 29+, Vite 5.2
**Storage**: N/A (in-memory state only, ToolContext manages I/O)
**Testing**: Jest 29+, React Testing Library
**Target Platform**: Web browser (Chrome 90+, Firefox 88+, Safari 14+, mobile-responsive)
**Project Type**: Single web application (React SPA)
**Performance Goals**: Build time <1.5s, bundle +<5KB gzipped, tool switching instant (<100ms)
**Constraints**: Build time maintained, TypeScript 0 errors, tests 130+ passing, layout proportions 20/40/40
**Scale/Scope**: 4 new services, 4 new components, 2 modified files (App.tsx, tools/index.ts), 20-30 new tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Code Quality Excellence
- **Requirement**: Self-documenting code with clear types, inline docs, cyclomatic complexity ≤10
- **Compliance**: 
  - ✅ Inherit Base64Service pattern (proven, well-documented abstract class)
  - ✅ Service methods follow naming convention: execute(), validate(), getDefaultOptions()
  - ✅ Component structure mirrors Base64EncodeTool/DecodeTool (self-evident naming)
  - ✅ RFC 4648 compliance documented in Base32Service
  - ✅ Hex validation logic straightforward (single char class check)
  - **Status**: PASS - no quality trade-offs required

### ✅ Principle II: Testing Standards (Test-First Mandatory)
- **Requirement**: Contract tests first, 80%+ code coverage, integration tests, edge cases
- **Compliance**:
  - ✅ Contract tests required for: hex encoding/decoding, Base32 encoding/decoding
  - ✅ Services inherit testable interface (execute/validate pattern proven in Base64)
  - ✅ Test vectors from RFC 4648 available for Base32 validation
  - ✅ Edge cases: odd hex lengths, padding validation, case-insensitive input
  - ✅ Integration tests for tool switching state reset
  - **Status**: PASS - no testing compromises

### ✅ Principle III: User Experience Consistency
- **Requirement**: Consistent UI patterns, error handling, responsive behavior
- **Compliance**:
  - ✅ All 6 encoding tools use identical 3-column layout (20/40/40 proportions)
  - ✅ Header integration same pattern as Base64 tools
  - ✅ Settings panel (auto-update, input encoding) matches existing tools
  - ✅ Error messages consistent with Base64 errors (same ToolResult<> wrapper)
  - ✅ Copy/Share buttons reuse existing components
  - **Status**: PASS - full consistency enforced

### ✅ Principle IV: Performance Requirements
- **Requirement**: Performance SLAs defined, algorithms analyzed, no N+1, memory leaks eliminated
- **Compliance**:
  - ✅ Encoding algorithms O(n) (linear, optimal for string operations)
  - ✅ No database queries (in-memory, ToolContext state only)
  - ✅ Debounce 200ms applied per tool (same as Base64)
  - ✅ Build time target <1.5s (currently 992ms, +5KB buffer available)
  - ✅ Memory profile: services are stateless singletons (no leaks)
  - **Status**: PASS - performance SLAs met, no regressions expected

**GATE STATUS**: ✅ **PASS** - All 4 principles satisfied, no violations, ready for Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-encoding-expansion/
├── plan.md                          # This file (Phase 0-1 output)
├── research.md                      # Phase 0 output (dependency research)
├── data-model.md                    # Phase 1 output (entity definitions)
├── quickstart.md                    # Phase 1 output (setup guide)
├── contracts/                       # Phase 1 output (API contracts, service interfaces)
│   ├── base16-service-contract.json
│   ├── base32-service-contract.json
│   └── tool-component-contract.json
├── spec.md                          # Feature specification
├── SPECIFICATION_SUMMARY.md         # Executive summary
└── checklists/
    └── requirements.md              # Quality validation checklist
```

### Source Code (repository root - incremental changes)

```text
src/
├── services/
│   ├── base64-base.ts              # ✅ EXISTING - abstract base class (reuse pattern)
│   ├── base64-encode.ts            # ✅ EXISTING
│   ├── base64-decode.ts            # ✅ EXISTING
│   ├── base16-base.ts              # 🆕 NEW - abstract base (inherit pattern)
│   ├── base16-encode.ts            # 🆕 NEW - hex encoding service
│   ├── base16-decode.ts            # 🆕 NEW - hex decoding service
│   ├── base32-base.ts              # 🆕 NEW - abstract base (inherit pattern)
│   ├── base32-encode.ts            # 🆕 NEW - RFC 4648 encoding
│   └── base32-decode.ts            # 🆕 NEW - RFC 4648 decoding
│
├── components/
│   ├── Tools/
│   │   ├── Base64EncodeTool.tsx    # ✅ EXISTING
│   │   ├── Base64DecodeTool.tsx    # ✅ EXISTING
│   │   ├── Base16EncodeTool.tsx    # 🆕 NEW - 20/40/40 layout
│   │   ├── Base16DecodeTool.tsx    # 🆕 NEW - 20/40/40 layout
│   │   ├── Base32EncodeTool.tsx    # 🆕 NEW - 20/40/40 layout
│   │   └── Base32DecodeTool.tsx    # 🆕 NEW - 20/40/40 layout
│   │
│   ├── Common/
│   │   ├── InputField.tsx          # ✅ EXISTING (already updated for flex layout)
│   │   └── OutputField.tsx         # ✅ EXISTING (already updated for flex layout)
│   │
│   └── Layout/
│       └── Header.tsx              # ✅ EXISTING (already updated for tool title/desc)
│
├── tools/
│   └── index.ts                    # 📝 MODIFY - add 4 new tool registrations
│
└── App.tsx                          # 📝 MODIFY - add 4 new routing cases

tests/
├── contract/
│   ├── base16-contract.test.ts     # 🆕 NEW - service contract tests
│   └── base32-contract.test.ts     # 🆕 NEW - service contract tests
│
├── unit/
│   ├── services/
│   │   ├── base16-encode.test.ts   # 🆕 NEW - unit tests
│   │   ├── base16-decode.test.ts   # 🆕 NEW - unit tests
│   │   ├── base32-encode.test.ts   # 🆕 NEW - unit tests
│   │   └── base32-decode.test.ts   # 🆕 NEW - unit tests
│   │
│   └── components/
│       ├── Base16EncodeTool.test.tsx  # 🆕 NEW - component tests
│       ├── Base16DecodeTool.test.tsx  # 🆕 NEW - component tests
│       ├── Base32EncodeTool.test.tsx  # 🆕 NEW - component tests
│       └── Base32DecodeTool.test.tsx  # 🆕 NEW - component tests
│
└── integration/
    └── tool-switching.test.ts      # 🆕 NEW - state reset on switch
```

**Structure Decision**: Single web application (React SPA) with incremental feature addition. Reuse existing directory structure and patterns (proven with Base64EncodeTool/DecodeTool). New services follow abstract factory pattern from Base64Service. New components inherit layout from Base64EncodeTool. Minimal modifications to existing files (App.tsx routing, tools/index.ts registration).

## Complexity Tracking

> **No violations of constitution principles - all principles PASS**

No table required. Feature is well-scoped and follows existing proven patterns.

---

## Phase 0: Outline & Research

*Goal: Resolve unknowns, establish best practices, document decisions*

### Research Tasks

#### T-R01: Hex Encoding/Decoding Implementation
- **Research**: UTF-8/ASCII/Latin-1 encoding for hex representation
- **Question**: How to handle multi-byte UTF-8 in hex form?
- **Decision**: Encode each byte individually (standard approach in crypto tools)
- **Alternative**: UTF-8 string → bytes → hex (no multi-byte consolidation)
- **Rationale**: Matches developer expectations in debugging scenarios

#### T-R02: RFC 4648 Base32 Compliance
- **Research**: RFC 4648 standard alphabet and padding rules
- **Question**: Case sensitivity, padding requirements, whitespace handling?
- **Decision**: Uppercase output, padding mandatory on encode, case-insensitive on decode, whitespace stripped on input
- **Alternative**: Case preservation (user preference), strict parsing
- **Rationale**: RFC 4648 canonical form improves interoperability (TOTP systems expect uppercase)

#### T-R03: Format Tolerance vs. Strictness
- **Research**: Balance between UX-friendly parsing and correctness
- **Question**: Accept "48 65 6c 6c 6f" vs "48656c6c6f" for hex?
- **Decision**: Accept both (whitespace, newlines, mixed casing - all stripped/normalized)
- **Alternative**: Strict format only
- **Rationale**: Users often copy-paste from logs with varying formats; flexibility improves UX without compromising correctness

#### T-R04: Layout Proportions CSS Implementation
- **Research**: CSS Grid techniques for maintaining 20/40/40 proportions
- **Question**: How to enforce column widths and full-height scrolling?
- **Decision**: CSS Grid with explicit `grid-template-columns: 0.2fr 0.4fr 0.4fr`, each column `flex: 1 min-h-0 overflow-y-auto`
- **Alternative**: Flexbox, manual pixel sizing, percentage widths
- **Rationale**: Grid provides better control, min-h-0 trick enables proper scrolling overflow without parent height constraints

#### T-R05: State Management on Tool Switch
- **Research**: How to detect tool switches and reset state appropriately
- **Question**: Where does state live? How to clear on switch?
- **Decision**: State lives in ToolContext (persisted per tool ID), reset triggered by useEffect(() => { reset() }, [toolId])
- **Alternative**: Reset in router, localStorage cleanup
- **Rationale**: ToolContext already manages per-tool state; component unmount/remount provides natural reset point

### Output: research.md

*Will be generated in Phase 0 execution documenting all findings*

---

## Phase 1: Design & Contracts

*Goal: Define data models, API contracts, establish quickstart guide*

### Data Model: Base16Service (Encoding)

```typescript
interface Base16EncodeService extends EncodingService {
  id: string = "base16-encode"
  name: string = "Base16 Encode"
  
  execute(input: {
    input: string
    options: { inputEncoding: "utf-8" | "ascii" | "latin-1" }
  }): ToolResult<string>
  // Returns lowercase hex string (e.g., "Hello" → "48656c6c6f")
  
  validate(input: string): ValidationResult
  // Validates non-empty string
  
  getDefaultOptions(): { inputEncoding: "utf-8" }
}
```

### Data Model: Base16Service (Decoding)

```typescript
interface Base16DecodeService extends EncodingService {
  id: string = "base16-decode"
  name: string = "Base16 Decode"
  
  execute(input: {
    input: string
    options: { inputEncoding: "utf-8" | "ascii" | "latin-1" }
  }): ToolResult<string>
  // Returns decoded text (e.g., "48 65 6c 6c 6f" → "Hello")
  
  validate(input: string): ValidationResult
  // Validates hex format (case-insensitive, whitespace allowed)
  
  getDefaultOptions(): { inputEncoding: "utf-8" }
}
```

### Data Model: Base32Service (Encoding)

```typescript
interface Base32EncodeService extends EncodingService {
  id: string = "base32-encode"
  name: string = "Base32 Encode"
  
  execute(input: {
    input: string
    options: { inputEncoding: "utf-8" | "ascii" | "latin-1" }
  }): ToolResult<string>
  // Returns RFC 4648 Base32 (uppercase, padded)
  // e.g., "Hello" → "JBSWY3DPEBLW64TMMQ======"
  
  validate(input: string): ValidationResult
  
  getDefaultOptions(): { inputEncoding: "utf-8" }
}
```

### Data Model: Base32Service (Decoding)

```typescript
interface Base32DecodeService extends EncodingService {
  id: string = "base32-decode"
  name: string = "Base32 Decode"
  
  execute(input: {
    input: string
    options: { inputEncoding: "utf-8" | "ascii" | "latin-1" }
  }): ToolResult<string>
  // Returns decoded text (e.g., "JBSWY3DPEBLW64TMMQ======" → "Hello")
  
  validate(input: string): ValidationResult
  // Validates RFC 4648 format (case-insensitive, padding flexible)
  
  getDefaultOptions(): { inputEncoding: "utf-8" }
}
```

### Data Model: Tool Component Props

```typescript
interface EncodingToolProps {
  autoUpdate: boolean
  headerTitle: string
  headerDescription: string
}

interface EncodingToolState {
  input: string
  output: string | null
  error: string | null
  options: { inputEncoding: "utf-8" | "ascii" | "latin-1" }
  loading: boolean
}

interface EncodingToolLayout {
  settingsColumn: "20%"
  inputColumn: "40%"
  outputColumn: "40%"
  gapSize: "1rem"
  padding: "1rem"
  fullHeight: true
  scrollPerColumn: true
}
```

### API Contracts

*Will be generated in Phase 1 execution to `/contracts/` directory*

- `base16-service-contract.json` - encode/decode service interface
- `base32-service-contract.json` - RFC 4648 compliance definitions
- `tool-component-contract.json` - component layout and props interface

### Quickstart Guide

*Will be generated in Phase 1 execution as `quickstart.md`*

---

## Phase 2: Task Breakdown & Implementation Order

*Goal: Break work into testable, deliverable chunks*

### Phase 2.1: Service Layer (6 new services, ~90 lines total)

#### S-01: Create Base16Service abstract base class
- File: `src/services/base16-base.ts`
- Dependencies: None (pure implementation)
- Tests: base16-contract.test.ts (T01-T05)
- Estimated: 20 min
- Success: Service compiles, abstract methods defined

#### S-02: Implement Base16EncodeService
- File: `src/services/base16-encode.ts`
- Dependencies: base16-base.ts
- Tests: base16-encode.test.ts (T06-T12)
- Estimated: 15 min
- Success: Hex encoding correct for UTF-8/ASCII/Latin-1, lowercase output

#### S-03: Implement Base16DecodeService
- File: `src/services/base16-decode.ts`
- Dependencies: base16-base.ts
- Tests: base16-decode.test.ts (T13-T19)
- Estimated: 15 min
- Success: Hex decoding handles case-insensitive, whitespace-tolerant input

#### S-04: Create Base32Service abstract base class
- File: `src/services/base32-base.ts`
- Dependencies: None (pure implementation)
- Tests: base32-contract.test.ts (T20-T24)
- Estimated: 15 min
- Success: Service compiles, RFC 4648 methods stubbed

#### S-05: Implement Base32EncodeService
- File: `src/services/base32-encode.ts`
- Dependencies: base32-base.ts
- Tests: base32-encode.test.ts (T25-T31)
- Estimated: 20 min
- Success: RFC 4648 encoding correct, uppercase output, proper padding

#### S-06: Implement Base32DecodeService
- File: `src/services/base32-decode.ts`
- Dependencies: base32-base.ts
- Tests: base32-decode.test.ts (T32-T38)
- Estimated: 20 min
- Success: RFC 4648 decoding correct, handles case-insensitive and padding variants

**Phase Total: ~105 minutes** | **Tests: 38 unit tests**

### Phase 2.2: Component Layer (4 new components, ~1000 lines total)

#### C-01: Create Base16EncodeTool component
- File: `src/components/Tools/Base16EncodeTool.tsx`
- Dependencies: Base16EncodeService, ToolContext, InputField, OutputField
- Tests: Base16EncodeTool.test.tsx (T39-T45)
- Estimated: 25 min
- Success: 20/40/40 layout, auto-update works, settings persist per tool

#### C-02: Create Base16DecodeTool component
- File: `src/components/Tools/Base16DecodeTool.tsx`
- Dependencies: Base16DecodeService, ToolContext, InputField, OutputField
- Tests: Base16DecodeTool.test.tsx (T46-T52)
- Estimated: 20 min
- Success: Same layout as encode, error handling for invalid hex

#### C-03: Create Base32EncodeTool component
- File: `src/components/Tools/Base32EncodeTool.tsx`
- Dependencies: Base32EncodeService, ToolContext, InputField, OutputField
- Tests: Base32EncodeTool.test.tsx (T53-T59)
- Estimated: 25 min
- Success: RFC 4648 output visible, padding correct in UI

#### C-04: Create Base32DecodeTool component
- File: `src/components/Tools/Base32DecodeTool.tsx`
- Dependencies: Base32DecodeService, ToolContext, InputField, OutputField
- Tests: Base32DecodeTool.test.tsx (T60-T66)
- Estimated: 20 min
- Success: Same layout, handles RFC 4648 input variants

**Phase Total: ~90 minutes** | **Tests: 28 component tests**

### Phase 2.3: Integration (2 modified files, ~20 lines total)

#### I-01: Update tools/index.ts with new tool registrations
- File: `src/tools/index.ts` (modify existing)
- Changes: Add 4 tool objects (base16-encode, base16-decode, base32-encode, base32-decode) with priorities 3-6
- Dependencies: Service exports
- Tests: Tool registry loads all 6 tools
- Estimated: 5 min
- Success: Tools appear in sidebar with correct order

#### I-02: Update App.tsx routing for new tools
- File: `src/App.tsx` (modify existing)
- Changes: Add 4 cases in renderTool() switch statement
- Dependencies: Component imports
- Tests: Navigation to each tool works without errors
- Estimated: 5 min
- Success: Clicking tool in sidebar renders correct component

#### I-03: State reset integration test
- File: `tests/integration/tool-switching.test.ts` (new)
- Verify: Input/output clear when switching tools, header updates
- Estimated: 15 min
- Success: Tool switching state management validated

**Phase Total: ~25 minutes** | **Tests: 1 integration test, 6 routing tests**

### Phase 2.4: Verification & Polish (testing, build, TypeScript)

#### V-01: Run TypeScript check
- Command: `npx tsc --noEmit`
- Estimated: 2 min
- Success: 0 errors

#### V-02: Run test suite
- Command: `npm test`
- Estimated: 3 min
- Success: 130+ tests passing (106 existing + 24 new encoding)

#### V-03: Run production build
- Command: `npm run build`
- Estimated: 2 min
- Success: Build time <1.5s, bundle size within constraints

#### V-04: Manual layout verification at 3 breakpoints
- Breakpoints: 1024px, 1440px, 1920px
- Verify: 20/40/40 proportions maintained, no horizontal scroll, columns scroll independently
- Estimated: 10 min

#### V-05: Manual tool switching verification
- Flow: Base16 Encode → Base16 Decode → Base32 Encode → Base32 Decode
- Verify: State resets, header updates, no console errors
- Estimated: 5 min

**Phase Total: ~22 minutes** | **Validation complete**

---

## Summary Statistics

| Category | Count | Estimated Time |
|----------|-------|-----------------|
| **Services** | 6 new (base16×2, base32×2 + bases) | 105 min |
| **Components** | 4 new tool components | 90 min |
| **Tests** | 24 new test suites (contract + unit + integration) | 50 min (auto-run) |
| **Integration** | 2 file modifications + 1 integration test | 25 min |
| **Verification** | TypeScript, build, layout, manual | 22 min |
| **TOTAL** | 36 deliverables | ~4.5 hours (parallel possible) |
| **Expected Outcome** | 4 new tools, 20/40/40 layout, 130+ tests passing | Production-ready |

---

## Files to Create/Modify

### CREATE (10 files)
- `src/services/base16-base.ts` - abstract base
- `src/services/base16-encode.ts` - encoding service
- `src/services/base16-decode.ts` - decoding service
- `src/services/base32-base.ts` - abstract base
- `src/services/base32-encode.ts` - encoding service
- `src/services/base32-decode.ts` - decoding service
- `src/components/Tools/Base16EncodeTool.tsx`
- `src/components/Tools/Base16DecodeTool.tsx`
- `src/components/Tools/Base32EncodeTool.tsx`
- `src/components/Tools/Base32DecodeTool.tsx`

### MODIFY (2 files)
- `src/tools/index.ts` - tool registration
- `src/App.tsx` - routing

### TESTS (8+ files)
- `tests/contract/base16-contract.test.ts`
- `tests/contract/base32-contract.test.ts`
- `tests/unit/services/base16-encode.test.ts`
- `tests/unit/services/base16-decode.test.ts`
- `tests/unit/services/base32-encode.test.ts`
- `tests/unit/services/base32-decode.test.ts`
- `tests/unit/components/Base16EncodeTool.test.tsx`
- `tests/unit/components/Base16DecodeTool.test.tsx`
- `tests/unit/components/Base32EncodeTool.test.tsx`
- `tests/unit/components/Base32DecodeTool.test.tsx`
- `tests/integration/tool-switching.test.ts`

---

## Success Definition

✅ Feature is complete when:
1. All 4 new services compile and pass contract tests
2. All 4 new components render with 20/40/40 layout
3. All 6 encoding tools navigate without errors
4. State resets properly on tool switches
5. TypeScript: 0 errors
6. Tests: 130+ passing
7. Production build: <1.5s
8. Layout verified at 3 breakpoints
9. Manual TOTP scenario works end-to-end

**Next Command**: Run `update-agent-context.ps1` to register Phase 1 plan
