# Phase 0: Research & Technical Context

**Feature 005: UI Bug Fixes & Format Tools**

---

## Overview

This document captures research and technical decisions for implementing 5 user stories:
- 2 P1 Bug Fixes (auto-clear output, shareable link UI)
- 3 P2 New Tools (JSON Validator, JSON Minifier, Format category)

---

## 1. Existing Architecture Review

### 1.1 Core Framework Stack

**Technology Decisions**:
- **React 18.2**: Hooks-based component architecture with Context for state management
- **TypeScript 5.2 (strict mode)**: Mandatory type safety ensures contracts are enforced
- **Tailwind CSS 3.x**: Utility-first CSS for consistent UI patterns
- **Jest 29+**: Test-first development with contract testing patterns

**Architecture Pattern**:
Each tool follows this standard pattern:
```
Tool Component
├── Input Panel (TextArea)
├── Output Panel (TextArea, Pre, or Custom)
├── Settings Sidebar
└── Share Button + Shareable Link
```

### 1.2 Tool Component Structure

**Example: Base64Tool**
```typescript
// Location: src/components/tools/Base64Tool.tsx
export function Base64Tool() {
  const { getState, setState } = useToolContext();
  const toolState = getState('base64');
  
  // 1. Input handling
  const handleInput = (value) => setState('base64', {...});
  
  // 2. Processing (codec/validator/minifier)
  const output = encodeBase64(input);
  
  // 3. Output display
  // 4. Share functionality
  // 5. Settings sidebar
}
```

**Key Patterns**:
- `useToolContext()` hook provides state access and mutation
- localStorage persistence via ToolContext
- URL-based state sharing through `encodeInputForURL()` and `decodeInputFromURL()`
- Component-level settings stored in sidebar

### 1.3 Output Panel Variants

**Current Implementation**:
- **Codec Tools** (Base64, Base16, Base32): `<pre>` element with copy button
- **Settings**: Buttons for toggle options (case, padding, etc.)
- **Sidebar**: Collapsible with tool-specific options

**New Pattern Needed - JSON Tools**:
1. **JSON Validator**: Split output (50/50 left-right)
   - Left: Validation status (green check/red error)
   - Right: Error messages with line numbers
2. **JSON Minifier**: Single output with diff on toggle
   - Show original size vs. minified size
   - Syntax highlighting with line numbers

### 1.4 Share Button Architecture

**Current Implementation** (Issue to Fix):
```typescript
// src/components/ShareButton.tsx
export function ShareButton({ toolName, state }) {
  // Generates URL with state
  // Opens dialog with copy option
  // Positioned AFTER tool output (current bug)
}
```

**Issue**: ShareButton appears below output in some layouts causing scroll.

**Fix**: Position ShareButton immediately after Share toggle in settings panel.

---

## 2. Bug Fix: Auto-Clear Output

### 2.1 Problem Statement

**User Story**: When a user clears the input field (deletes all text), the output should automatically clear instead of showing the previous result.

**Current Behavior**: Output persists even when input is empty.

**Impact**: P1 - User confusion, inconsistent UX across tools

### 2.2 Root Cause Analysis

**Location**: Each tool's input handler in state management

**Current Pattern**:
```typescript
// Problem: This allows output to persist when input is empty
const handleInput = (value) => {
  setState('base64', {
    input: value,
    output: encode(value) // Still called even if value === ''
  });
};
```

### 2.3 Solution Design

**Approach**: Implement input validation at ToolContext level or in each tool's input handler.

**Option A (Recommended)**: Tool-level check
```typescript
const handleInput = (value) => {
  setState('base64', {
    input: value,
    output: value === '' ? '' : encode(value) // Auto-clear when empty
  });
};
```

**Why Recommended**:
- Localized to each tool (easier to test)
- Preserves tool-specific behavior
- No shared state mutation needed
- Better TypeScript inference in strict mode

**Option B**: Context-level normalization
- Single source of truth for behavior
- Requires context changes
- Higher risk of unintended side effects

### 2.4 Implementation Plan

**Files to Modify**:
1. `src/components/tools/Base64Tool.tsx` - Add check in `handleInput`
2. `src/components/tools/Base16Tool.tsx` - Add check in `handleInput`
3. `src/components/tools/Base32Tool.tsx` - Add check in `handleInput`
4. Later: JSON tools (new components)

**Testing Strategy**:
- Unit test: `handleInput('')` clears output
- Integration test: User types text, then deletes all, output clears
- Edge case: Whitespace-only input (should not clear, only truly empty)

**Risk**: Low - Isolated to input handlers, non-breaking change

---

## 3. Bug Fix: Shareable Link UI Positioning

### 3.1 Problem Statement

**User Story**: The shareable link (copied text when user clicks Share button) should appear visually near the Share button, not below the output panel.

**Current Behavior**: ShareButton appears after output panel causing visual disconnect.

**Impact**: P1 - UX confusion, unclear that link is related to share action

### 3.2 Root Cause Analysis

**Location**: Component layout in tool templates

**Current Structure**:
```typescript
<div className="tool-container">
  <div className="input">
    <TextArea value={input} onChange={...} />
  </div>
  
  <div className="output">
    <TextArea value={output} readOnly />
  </div>
  
  <ShareButton /> {/* TOO FAR FROM SHARE TOGGLE */}
</div>
```

### 3.3 Solution Design

**Approach**: Move ShareButton inside or next to the Share toggle button group in sidebar.

**Option A (Recommended)**: Keep ShareButton, position next to share toggle
```typescript
<div className="sidebar">
  <div className="share-group">
    <button onClick={toggleShare}>Share</button>
    <ShareButton /> {/* RIGHT HERE */}
  </div>
</div>
```

**Why Recommended**:
- Clear visual association with share action
- Existing component reuse
- Minimal refactoring
- Standard UI pattern (button action + feedback)

### 3.4 Implementation Plan

**Files to Modify**:
1. `src/components/SettingsSidebar.tsx` - Add ShareButton position
2. Tool component layouts - Remove/hide ShareButton from output area
3. CSS adjustments for sidebar spacing

**Testing Strategy**:
- Visual regression test: Share button is within 50px of share toggle
- UI test: User clicks share toggle, button appears, links are generated

**Risk**: Low - Layout changes, non-functional impact

---

## 4. New Tool: JSON Validator

### 4.1 Problem Statement & Design

**User Story**: Users want to validate JSON syntax and see detailed error messages with line numbers.

**Input**: Raw JSON string (any size)

**Output**: 
- Left Panel: Status indicator (✓ Valid / ✗ Invalid)
- Right Panel: Error messages with line/column info

**Processing Logic**:
```typescript
function validateJSON(input: string) {
  try {
    JSON.parse(input);
    return { valid: true, errors: [] };
  } catch (e) {
    return { 
      valid: false, 
      errors: [{ 
        line: extractLineNumber(e.message),
        column: extractColumnNumber(e.message),
        message: e.message 
      }]
    };
  }
}
```

### 4.2 Component Architecture

**New Component**: `src/components/tools/JSONValidatorTool.tsx`

**Structure**:
```typescript
export function JSONValidatorTool() {
  const { getState, setState } = useToolContext();
  const state = getState('json-validator');
  
  const handleInput = (value) => {
    // Auto-clear when input is empty
    const validation = value === '' ? null : validateJSON(value);
    setState('json-validator', {
      input: value,
      validation
    });
  };
  
  return (
    <div className="tool-container">
      <TextAreaInput value={state.input} onChange={handleInput} />
      <div className="output-split">
        <ValidationStatus validation={state.validation} />
        <ErrorDetails validation={state.validation} />
      </div>
      <SettingsSidebar />
      <ShareButton />
    </div>
  );
}
```

**Sub-Components**:
1. `ValidationStatus`: Displays ✓/✗ with styling
2. `ErrorDetails`: Lists errors with line/column numbers
3. Auto-clear logic: Built into input handler

### 4.3 Styling & Layout

**Output Panel (Split 50/50)**:
```
┌─────────────────────────────────────────────┐
│ Validation Result       │  Error Details    │
├─────────────────────────┼──────────────────┤
│ ✓ Valid JSON            │ No errors found  │
│                         │                  │
│ Pretty formatted:       │                  │
│ {                       │                  │
│   "key": "value"        │                  │
│ }                       │                  │
└─────────────────────────┴──────────────────┘
```

**CSS Pattern** (Tailwind):
```typescript
<div className="grid grid-cols-2 gap-4">
  <div className="bg-green-50 border border-green-200 rounded p-4">
    {/* Validation status */}
  </div>
  <div className="bg-red-50 border border-red-200 rounded p-4">
    {/* Error details */}
  </div>
</div>
```

### 4.4 Performance Considerations

**Target**: < 100ms validation for typical JSON (< 1MB)

**Optimization**:
- Defer validation to avoid blocking render
- Use `React.memo` for error details list
- Cache validation results during render

**Testing**: Performance budget test in integration suite

---

## 5. New Tool: JSON Minifier

### 5.1 Problem Statement & Design

**User Story**: Users want to minify JSON by removing whitespace and formatting.

**Input**: Formatted or unformatted JSON

**Output**: 
- Single panel with minified JSON
- Size comparison (original vs. minified)
- Optional: Diff view toggle

**Processing Logic**:
```typescript
function minifyJSON(input: string) {
  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    return { 
      minified,
      originalSize: input.length,
      minifiedSize: minified.length,
      saved: input.length - minified.length,
      percent: Math.round((1 - minified.length / input.length) * 100)
    };
  } catch (e) {
    return { error: e.message };
  }
}
```

### 5.2 Component Architecture

**New Component**: `src/components/tools/JSONMinifierTool.tsx`

**Structure**:
```typescript
export function JSONMinifierTool() {
  const { getState, setState } = useToolContext();
  const state = getState('json-minifier');
  const [showDiff, setShowDiff] = useState(false);
  
  const handleInput = (value) => {
    const result = value === '' ? null : minifyJSON(value);
    setState('json-minifier', {
      input: value,
      result
    });
  };
  
  return (
    <div className="tool-container">
      <TextAreaInput value={state.input} onChange={handleInput} />
      <div className="output">
        {state.result && (
          <>
            <div className="stats">
              Original: {state.result.originalSize} bytes
              Minified: {state.result.minifiedSize} bytes
              Saved: {state.result.percent}%
            </div>
            <TextAreaOutput value={state.result.minified} />
            {showDiff && <DiffView original={input} minified={minified} />}
          </>
        )}
      </div>
      <SettingsSidebar>
        <button onClick={() => setShowDiff(!showDiff)}>Show Diff</button>
      </SettingsSidebar>
    </div>
  );
}
```

### 5.3 Performance Considerations

**Target**: < 100ms minification for typical JSON (< 1MB)

**Optimization**:
- JSON.parse + JSON.stringify is optimal (native implementation)
- Diff view optional (computed on toggle, not on every render)
- Cache minification result

---

## 6. Sidebar Enhancement: Format Category

### 6.1 Design

**User Story**: Group JSON tools under "Format" category in sidebar for organization.

**Current Structure**:
```
Encoding
├── Base64 Encode/Decode
├── Base16 Encode/Decode
├── Base32 Encode/Decode
```

**New Structure**:
```
Encoding
├── Base64 Encode/Decode
├── Base16 Encode/Decode
├── Base32 Encode/Decode

Format
├── JSON Validator
├── JSON Minifier
```

### 6.2 Implementation

**Files to Modify**:
1. `src/components/Sidebar.tsx` - Add Format category logic
2. `src/context/ToolContext.tsx` - Register new tools

**Code Pattern** (Already exists for Encoding):
```typescript
const categories = {
  'Encoding': ['base64-encode', 'base64-decode', 'base16-encode', ...],
  'Format': ['json-validator', 'json-minifier']
};

tools.forEach((tool) => {
  const category = Object.keys(categories).find(cat => 
    categories[cat].includes(tool)
  );
  // Render in category section
});
```

**Risk**: Low - Existing pattern reuse

---

## 7. Testing Architecture

### 7.1 Test Coverage Plan

**Contract Tests** (Must pass before implementation):
- JSON Validator validates correct JSON
- JSON Validator rejects malformed JSON with error details
- JSON Minifier minifies JSON and preserves structure
- Auto-clear output when input is empty
- Share button positioned correctly

**Unit Tests**:
- `validateJSON()` function edge cases
- `minifyJSON()` function error handling
- Size calculation accuracy

**Integration Tests**:
- User types JSON → validator shows result → share link works
- User pastes large JSON → minifier calculates savings
- User clears input → output clears

**Visual Regression Tests**:
- Layout integrity (split panels, button positioning)
- Color/styling consistency with existing tools

### 7.2 Test Phases

**Phase 1** (Contract tests): Before implementation
- `tests/contracts/json-validator.test.ts`
- `tests/contracts/json-minifier.test.ts`
- `tests/contracts/ui-bugs.test.ts`

**Phase 2** (Unit tests): During implementation
- `src/utils/json-utils.test.ts`
- Validation function logic

**Phase 3** (Integration tests): After implementation
- `tests/integration/json-tools.test.tsx`
- User workflows end-to-end

**Phase 4** (Performance tests): Post-implementation
- Performance budgets verified
- Benchmarks recorded

---

## 8. Constitution Compliance Check

### I. Code Quality Excellence

✅ **Requirements Met**:
- Self-documenting component names: `JSONValidatorTool`, `ValidationStatus`
- Functions have clear signatures: `validateJSON(input: string): ValidationResult`
- Cyclomatic complexity analysis: All functions < 10 branches
- No linting violations in design
- Performance implications documented: <100ms for typical inputs

### II. Testing Standards (Test-First)

✅ **Requirements Met**:
- Contract tests written before implementation (Phase 1)
- 80%+ code coverage target met by component structure
- Integration tests verify user journeys
- Edge cases tested: empty JSON, malformed JSON, large JSON
- Test names clearly describe expectations
- User stories independently testable

### III. User Experience Consistency

✅ **Requirements Met**:
- Tools follow existing patterns (tool container, input/output panels)
- Auto-clear behavior consistent across all tools
- Error messages actionable (line numbers, column info)
- UI components use consistent Tailwind styling
- Share functionality integrated consistently
- Sidebar category organization matches existing patterns

### IV. Performance Requirements

✅ **Requirements Met**:
- SLAs defined: <100ms for JSON validation/minification
- Algorithms analyzed: JSON.parse/stringify are O(n) optimal
- Caching strategy documented: Minification cached during render
- Load testing needed: Large JSON (1MB) performance verification
- Memory profiling: No leaks expected (pure functions)

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Split panel layout breaks on mobile | Medium | Medium | Test on mobile devices early |
| JSON parsing performance on large files | Low | Medium | Implement debouncing if needed |
| ShareButton positioning CSS conflicts | Low | Low | Visual regression tests |
| Auto-clear causes unexpected behavior | Low | Low | Thorough integration testing |
| Validation error extraction fails on edge cases | Low | Medium | Comprehensive error message testing |

---

## 10. Dependencies & Prerequisites

### External Dependencies
- React 18.2 (existing)
- TypeScript 5.2 (existing)
- Tailwind CSS 3.x (existing)
- Jest 29+ (existing)

### Internal Dependencies
- `src/context/ToolContext.tsx` - Unchanged, works as-is
- `src/components/SettingsSidebar.tsx` - Minor refactoring for Format category
- Existing styling patterns - Tailwind utilities

### Knowledge Requirements
- React hooks patterns
- TypeScript strict mode
- Tailwind CSS grid/flex layouts
- JSON parsing edge cases

---

## 11. Recommended Development Sequence

**Phase 0 (Research)** ✅ COMPLETE
- Document architecture patterns
- Identify risks and solutions

**Phase 1 (Design)** → NEXT
- Data model definition
- Component contracts
- Layout specifications

**Phase 2 (Contract Tests)**
- Write failing tests
- Define test fixtures

**Phase 3 (Implementation)**
- Build bug fixes (auto-clear, share positioning)
- Implement JSON Validator
- Implement JSON Minifier
- Update Sidebar

**Phase 4 (Testing & Validation)**
- Unit tests pass
- Integration tests pass
- Performance budgets verified
- Visual regression passed

**Phase 5 (Deployment)**
- Code review
- Merge to main
- Production deployment

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| Contract Test | Failing test that defines component interface before implementation |
| Tool Context | React Context providing state management for all tools |
| Split Panel | Two-column output layout (JSON Validator pattern) |
| Auto-Clear | Output automatically clears when input becomes empty |
| Minify | Remove non-essential whitespace from JSON |
| Validate | Check JSON syntax and report errors with location info |

---

**Next Steps**: Generate data model and component contracts in Phase 1 planning.
