# Implementation Quickstart Guide

**Feature 005: UI Bug Fixes & Format Tools**

---

## Quick Reference

This guide helps developers quickly understand the architecture and start implementing Feature 005.

---

## 1. Project Setup

### Prerequisites
```bash
# Verify Node.js and npm
node --version  # v18+
npm --version   # v9+

# Navigate to project
cd d:\PlayGround\Online\ ToolBox

# Install dependencies (if needed)
npm install
```

### Key Commands
```bash
# Run tests
npm test

# Run linter
npm run lint

# Build project
npm run build

# Format code
npm run format
```

---

## 2. Architecture Quick Overview

### Technology Stack
- **Framework**: React 18.2 with Hooks
- **Language**: TypeScript 5.2 (strict mode)
- **Styling**: Tailwind CSS 3.x
- **Testing**: Jest 29+ with React Testing Library
- **State Management**: React Context (ToolContext)

### File Structure
```
src/
├── components/
│   ├── tools/              # Individual tool components
│   │   ├── Base64Tool.tsx
│   │   ├── Base16Tool.tsx
│   │   ├── Base32Tool.tsx
│   │   ├── JSONValidatorTool.tsx    ← NEW
│   │   └── JSONMinifierTool.tsx     ← NEW
│   ├── ui/                 # Shared UI components
│   │   ├── TextAreaInput.tsx
│   │   ├── ShareButton.tsx
│   │   └── SettingsSidebar.tsx
│   └── ToolContext.tsx     # State management
├── types/
│   ├── tool-state.ts       # General types
│   ├── json-validator.ts   ← NEW
│   └── json-minifier.ts    ← NEW
└── utils/
    ├── json-utils.ts       ← NEW
    └── other utilities

tests/
├── unit/                   # Function unit tests
├── component/              # Component tests
├── contracts/              # Contract tests (TDD starting point)
│   ├── json-validator.test.ts    ← START HERE
│   ├── json-minifier.test.ts     ← START HERE
│   └── ui-bugs.test.ts           ← START HERE
└── integration/            # Full user journey tests
```

---

## 3. Implementation Workflow

### Step 1: Write Contract Tests (TDD Phase)
Before writing any implementation code, write **failing tests** that define the contract.

**Example - Auto-Clear Contract Test**:
```typescript
// tests/contracts/ui-bugs.test.ts

describe('Auto-Clear Output Contract', () => {
  it('should clear output when input is empty', () => {
    // GIVEN: Input contains text and output shows result
    render(<Base64Tool />);
    const input = screen.getByDisplayValue('');
    
    // WHEN: User types text
    await userEvent.type(input, 'Hello');
    expect(screen.getByDisplayValue(/SGVs/)).toBeInTheDocument();
    
    // WHEN: User clears input
    await userEvent.clear(input);
    
    // THEN: Output should clear
    expect(screen.queryByDisplayValue(/SGVs/)).not.toBeInTheDocument();
  });
});
```

**Run the test** (it should FAIL initially):
```bash
npm test -- tests/contracts/ui-bugs.test.ts --watch
```

### Step 2: Implement Feature
Implement the minimum code needed to pass the test.

**Example - Auto-Clear Implementation**:
```typescript
// src/components/tools/Base64Tool.tsx

const handleInput = (value: string) => {
  // Auto-clear when input is empty
  const output = value === '' ? '' : encodeBase64(value);
  setState('base64', {
    input: value,
    output
  });
};
```

### Step 3: Run Tests
Verify the contract test now passes:
```bash
npm test -- tests/contracts/ui-bugs.test.ts
```

### Step 4: Refactor & Polish
Make the code clean and well-documented:

```typescript
/**
 * Handle input changes with auto-clear
 * - Clears output when input becomes empty
 * - Processes input when text is present
 * 
 * @param value The new input value
 */
const handleInput = (value: string) => {
  // Auto-clear logic: only process non-empty input
  const output = value === '' ? '' : encodeBase64(value);
  
  setState('base64', { input: value, output });
};
```

### Step 5: Run Full Suite
Ensure no regressions:
```bash
npm test      # All tests
npm run lint  # No lint errors
npm run build # Production build succeeds
```

---

## 4. Common Patterns

### Pattern 1: Input Handler with Auto-Clear

**Use this pattern in all tool components:**

```typescript
const handleInput = (value: string) => {
  // When input is empty, clear output
  // When input has content, process it
  const output = value === '' ? '' : processor(value);
  
  setState(toolId, {
    input: value,
    output // or tool-specific property
  });
};
```

### Pattern 2: Tool Component Structure

**All tools follow this template:**

```typescript
export function MyTool() {
  const { getState, setState } = useToolContext();
  const state = getState('my-tool');
  
  const handleInput = (value: string) => {
    // Auto-clear logic here
  };
  
  return (
    <div className="tool-container">
      {/* Input */}
      <TextAreaInput 
        value={state.input}
        onChange={handleInput}
        placeholder="Enter input..."
      />
      
      {/* Output */}
      <div className="output">
        {state.output && (
          <TextAreaOutput value={state.output} readOnly />
        )}
      </div>
      
      {/* Sidebar with Share button */}
      <SettingsSidebar>
        {/* Tool-specific settings */}
      </SettingsSidebar>
    </div>
  );
}
```

### Pattern 3: Utility Function (JSON Processing)

**Create pure functions for processing logic:**

```typescript
// src/utils/json-utils.ts

/**
 * Validate JSON and extract error details
 * 
 * @param input - Raw JSON string
 * @returns Validation result with errors if invalid
 */
export function validateJSON(input: string): JSONValidationResult {
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    
    return {
      valid: true,
      errors: [],
      formatted
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{
        line: extractLineNumber(error.message),
        column: extractColumnNumber(error.message),
        message: error.message
      }],
      formatted: undefined
    };
  }
}
```

### Pattern 4: Split Output Panel

**For JSON Validator with split panels:**

```typescript
<div className="grid grid-cols-2 gap-4">
  {/* Left Panel: Status */}
  <div className="bg-green-50 border border-green-200 rounded p-4">
    {validation?.valid ? (
      <div className="text-green-700">✓ Valid JSON</div>
    ) : (
      <div className="text-red-700">✗ Invalid JSON</div>
    )}
  </div>
  
  {/* Right Panel: Details */}
  <div className="bg-red-50 border border-red-200 rounded p-4">
    {validation?.errors?.map(error => (
      <div key={error.line} className="text-red-700">
        Line {error.line}, Column {error.column}: {error.message}
      </div>
    ))}
  </div>
</div>
```

---

## 5. Type Safety Checklist

### ✓ TypeScript Strict Mode

All code must pass: `npx tsc --noEmit`

**Checklist**:
- [ ] All function parameters have explicit types
- [ ] All return types are explicit
- [ ] No `any` types used
- [ ] All object properties are typed
- [ ] Error handling specifies error type

```typescript
// ✓ GOOD
function validateJSON(input: string): JSONValidationResult {
  try {
    // ...
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // ...
  }
}

// ✗ BAD - missing return type, any, no error handling
function validateJSON(input) {
  JSON.parse(input);
}
```

---

## 6. Testing Checklist

### For Each Feature

**Contract Tests** (Write first):
- [ ] ✓ Passing case (happy path)
- [ ] ✓ Error case (invalid input)
- [ ] ✓ Edge case (empty, very large)
- [ ] ✓ Integration (with context, share button)

**Unit Tests**:
- [ ] ✓ Pure function edge cases
- [ ] ✓ Error handling
- [ ] ✓ Type contracts

**Component Tests**:
- [ ] ✓ Renders correctly
- [ ] ✓ User interactions work
- [ ] ✓ State updates properly
- [ ] ✓ Accessibility (keyboard, screen reader)

**Integration Tests**:
- [ ] ✓ User workflow end-to-end
- [ ] ✓ Cross-component communication
- [ ] ✓ Share URL generation and loading
- [ ] ✓ localStorage persistence

```bash
# Run specific test file
npm test -- tests/contracts/json-validator.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 7. Performance Targets

### Speed Budget (p95 latency)

| Operation | Target | How to Test |
|-----------|--------|-----------|
| JSON.parse (< 1MB) | < 100ms | Use `performance.now()` in test |
| Component render | < 50ms | Use performance profiler |
| Share URL generation | < 50ms | Measure in integration test |
| localStorage write | < 10ms | Should be instant |

### Memory Budget

| Item | Limit | Rationale |
|------|-------|-----------|
| Tool state in memory | < 1MB | Single tool state |
| Cached results | < 10MB | Multiple tool states |
| Browser total | No strict limit | Trust browser management |

**Test Performance**:
```typescript
it('should validate JSON within performance budget', () => {
  const largeJSON = generateJSON(1024 * 1024); // 1MB
  
  const start = performance.now();
  validateJSON(largeJSON);
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(100);
});
```

---

## 8. Debugging Tips

### Common Issues

#### Issue: "Cannot find name 'useToolContext'"
**Solution**: Import from context
```typescript
import { useToolContext } from '../context/ToolContext';
```

#### Issue: Component not updating when input changes
**Solution**: Check if `setState` is called properly
```typescript
// ✓ Correct
setState('my-tool', { input: value, output: processed });

// ✗ Wrong - forgot to call setState
const output = processor(value);
```

#### Issue: TypeScript "Type is not assignable"
**Solution**: Check type definitions match
```typescript
// Ensure JSONValidatorState matches actual state
interface JSONValidatorState extends ToolState {
  input: string;
  validation: JSONValidationResult | null;
}
```

### Debugging Tools

```bash
# Check TypeScript errors
npx tsc --noEmit

# Run tests with verbose output
npm test -- --verbose

# Run single test
npm test -- -t "auto-clear"

# Debug in browser
# 1. Run: npm test
# 2. Press 'd' for debugger
# 3. Open chrome://inspect in Chrome
```

---

## 9. File Checklist for Implementation

### Bug Fixes (P1)

**Auto-Clear Fix**:
- [ ] `tests/contracts/ui-bugs.test.ts` - Contract test
- [ ] `src/components/tools/Base64Tool.tsx` - Updated handleInput
- [ ] `src/components/tools/Base16Tool.tsx` - Updated handleInput
- [ ] `src/components/tools/Base32Tool.tsx` - Updated handleInput
- [ ] `tests/integration/ui-bugs.test.tsx` - Integration test

**Share Button UI Fix**:
- [ ] `tests/contracts/ui-bugs.test.ts` - Contract test (positioning)
- [ ] `src/components/SettingsSidebar.tsx` - Move ShareButton
- [ ] `src/components/ui/ShareButton.tsx` - Update styling
- [ ] `tests/integration/ui-bugs.test.tsx` - Integration test

### New Tools (P2)

**JSON Validator**:
- [ ] `src/types/json-validator.ts` - Type definitions
- [ ] `src/utils/json-utils.ts` - validateJSON() function
- [ ] `tests/contracts/json-validator.test.ts` - Contract test
- [ ] `src/components/tools/JSONValidatorTool.tsx` - Main component
- [ ] `src/components/ui/ValidationStatus.tsx` - Sub-component
- [ ] `src/components/ui/ErrorDetails.tsx` - Sub-component
- [ ] `tests/component/json-validator.test.tsx` - Component tests
- [ ] `tests/integration/json-tools.test.tsx` - Integration test

**JSON Minifier**:
- [ ] `src/types/json-minifier.ts` - Type definitions
- [ ] `src/utils/json-utils.ts` - minifyJSON() function
- [ ] `tests/contracts/json-minifier.test.ts` - Contract test
- [ ] `src/components/tools/JSONMinifierTool.tsx` - Main component
- [ ] `src/components/ui/MinificationStats.tsx` - Sub-component
- [ ] `src/components/ui/DiffView.tsx` - Sub-component
- [ ] `tests/component/json-minifier.test.tsx` - Component tests
- [ ] `tests/integration/json-tools.test.tsx` - Integration test

**Sidebar Enhancement**:
- [ ] `src/components/Sidebar.tsx` - Add Format category
- [ ] `src/context/ToolContext.tsx` - Register new tools

---

## 10. Git Workflow

### Feature Branch
```bash
# Create feature branch (if using version control)
git checkout -b feature/005-ui-bugs-format-tools

# Make incremental commits
git add src/components/tools/JSONValidatorTool.tsx
git commit -m "feat: Add JSON Validator component"

git add tests/contracts/json-validator.test.ts
git commit -m "test: Add JSON Validator contract tests"
```

### Push & Code Review
```bash
# Push to remote
git push origin feature/005-ui-bugs-format-tools

# Create PR in GitHub
# Ensure:
# - All tests pass
# - No lint errors
# - TypeScript strict mode passes
# - Performance budgets met
```

---

## 11. Deployment Checklist

Before merging to main:

- [ ] ✅ All 5 contract tests passing
- [ ] ✅ All unit tests passing (80%+ coverage)
- [ ] ✅ All integration tests passing
- [ ] ✅ `npm run lint` - 0 errors
- [ ] ✅ `npx tsc --noEmit` - 0 errors
- [ ] ✅ `npm run build` - Success
- [ ] ✅ Performance tests passing (< 100ms)
- [ ] ✅ Manual testing on Chrome, Firefox, Safari
- [ ] ✅ Accessibility check (keyboard + screen reader)
- [ ] ✅ Mobile responsive check
- [ ] ✅ Code review approved
- [ ] ✅ No breaking changes to existing tools

---

## 12. Helpful Resources

### Architecture References
- `specs/005-ui-bugs-format-tools/research.md` - Technical research
- `specs/005-ui-bugs-format-tools/data-model.md` - Data types & structures
- Constitution.md - Code quality standards

### Component Examples
- `src/components/tools/Base64Tool.tsx` - Reference implementation
- `src/components/SettingsSidebar.tsx` - Sidebar patterns
- `tests/component/base64.test.tsx` - Testing patterns

### External Docs
- [React 18 Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 13. Key Contact Points

### Questions About...

**Requirements**: See `specs/005-ui-bugs-format-tools/spec.md`
**Data Types**: See `specs/005-ui-bugs-format-tools/data-model.md`
**Component Contracts**: See `specs/005-ui-bugs-format-tools/contracts/`
**Testing**: See test files in `tests/contracts/` and `tests/integration/`
**Architecture**: See existing tools in `src/components/tools/`
**Code Quality**: See `constitution.md`

---

## Next Steps

1. **Read** `specs/005-ui-bugs-format-tools/spec.md` for full requirements
2. **Read** `specs/005-ui-bugs-format-tools/data-model.md` for type definitions
3. **Review** `specs/005-ui-bugs-format-tools/contracts/bug-fixes.md` for test structure
4. **Write** first contract test in `tests/contracts/ui-bugs.test.ts`
5. **Implement** auto-clear in existing tools (quick P1 win)
6. **Verify** `npm test` passes
7. **Proceed** to JSON tools implementation

---

**Ready to start? Begin with auto-clear bug fix - it's the quickest P1 win and establishes the pattern for all tools!**
