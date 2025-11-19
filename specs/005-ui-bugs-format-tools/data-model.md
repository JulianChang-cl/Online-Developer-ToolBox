# Phase 1: Data Model & Type Definitions

**Feature 005: UI Bug Fixes & Format Tools**

---

## Overview

This document defines all data structures, type definitions, and entity models required for Feature 005 implementation.

---

## 1. Core Type System

### 1.1 Tool State Model

```typescript
// src/types/tool-state.ts

/**
 * Generic tool state stored in localStorage and Context
 * Extended by specific tools (Base64ToolState, JSONValidatorState, etc.)
 */
export interface ToolState {
  input: string;
  [key: string]: unknown; // Tool-specific properties
}

/**
 * Complete context state for all tools
 */
export interface ContextState {
  tools: Record<string, ToolState>;
  settings: ContextSettings;
}

/**
 * Global settings persisted across tools
 */
export interface ContextSettings {
  darkMode: boolean;
  defaultFormat: 'base64' | 'base16' | 'base32' | 'json-validator' | 'json-minifier';
}
```

### 1.2 Bug Fix: Auto-Clear State

```typescript
/**
 * Tool input change handler pattern
 * - Auto-clears output when input becomes empty
 * - Applies to all tool types
 */
export type ToolInputHandler = (value: string) => void;

/**
 * Input handler helper (shared across tools)
 * Usage in tool components:
 *   const handler = createInputHandler(toolName, processor);
 *   handler('new input') // Auto-clears if empty
 */
export function createInputHandler(
  toolName: string,
  processor: (input: string) => any
): ToolInputHandler {
  return (value: string) => {
    // When input is empty, clear output
    // When input has content, process it
    const output = value === '' ? '' : processor(value);
    setState(toolName, { input: value, output });
  };
}
```

### 1.3 Bug Fix: Share Button UI State

```typescript
/**
 * ShareButton position and visibility
 * Moved from output panel to sidebar
 */
export interface ShareButtonPosition {
  location: 'sidebar' | 'output'; // 'sidebar' for Feature 005
  visibility: 'visible' | 'hidden';
  group: 'share-toggle'; // Grouped with share action
}

/**
 * Shared URL state
 */
export interface SharedLink {
  url: string;
  copiedAt: number; // Timestamp for "copied" confirmation
  toolName: string;
  toolState: ToolState;
}
```

---

## 2. JSON Tools Type System

### 2.1 JSON Validator

```typescript
// src/types/json-validator.ts

/**
 * JSON validation result
 * Returned by validateJSON() function
 */
export interface JSONValidationResult {
  valid: boolean;
  errors: JSONError[];
  formatted?: string; // Pretty-printed JSON if valid
}

/**
 * Single JSON parsing error with location info
 */
export interface JSONError {
  line: number;
  column: number;
  message: string;
  code: 'PARSE_ERROR' | 'SYNTAX_ERROR' | 'UNEXPECTED_TOKEN';
}

/**
 * JSON Validator tool state
 */
export interface JSONValidatorState extends ToolState {
  input: string;
  validation: JSONValidationResult | null;
}

/**
 * Extract line number from JSON.parse error
 * Example: "Unexpected token } at line 5, column 2"
 */
export function extractLineNumber(errorMessage: string): number {
  const match = errorMessage.match(/line (\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Extract column number from JSON.parse error
 */
export function extractColumnNumber(errorMessage: string): number {
  const match = errorMessage.match(/column (\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Validate JSON and extract error details
 * 
 * @param input - Raw JSON string
 * @returns Validation result with errors if invalid
 * 
 * @example
 * validateJSON('{"key": "value"}') // { valid: true, errors: [], formatted: '{\n  "key": "value"\n}' }
 * validateJSON('{invalid}') // { valid: false, errors: [{ line: 1, column: 2, message: '...' }], formatted: undefined }
 */
export function validateJSON(input: string): JSONValidationResult {
  if (!input || input.trim() === '') {
    return { valid: false, errors: [], formatted: undefined };
  }

  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    return { valid: true, errors: [], formatted };
  } catch (error) {
    const message = error instanceof SyntaxError ? error.message : String(error);
    return {
      valid: false,
      errors: [{
        line: extractLineNumber(message),
        column: extractColumnNumber(message),
        message: message.replace(/at line \d+.*/, '').trim(),
        code: 'PARSE_ERROR'
      }],
      formatted: undefined
    };
  }
}
```

### 2.2 JSON Minifier

```typescript
// src/types/json-minifier.ts

/**
 * JSON minification result with statistics
 */
export interface JSONMinificationResult {
  minified: string;
  originalSize: number;
  minifiedSize: number;
  saved: number; // bytes
  percent: number; // percentage saved (0-100)
  error?: string; // If minification fails
}

/**
 * JSON Minifier tool state
 */
export interface JSONMinifierState extends ToolState {
  input: string;
  result: JSONMinificationResult | null;
  showDiff: boolean; // Toggle for diff view
}

/**
 * Minify JSON by removing whitespace
 * 
 * @param input - JSON string (formatted or unformatted)
 * @returns Minified JSON with size statistics
 * 
 * @example
 * minifyJSON('{"key":  "value"}')
 * // { minified: '{"key":"value"}', originalSize: 19, minifiedSize: 15, saved: 4, percent: 21 }
 */
export function minifyJSON(input: string): JSONMinificationResult {
  if (!input || input.trim() === '') {
    return {
      minified: '',
      originalSize: 0,
      minifiedSize: 0,
      saved: 0,
      percent: 0
    };
  }

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    const originalSize = input.length;
    const minifiedSize = minified.length;
    const saved = originalSize - minifiedSize;
    const percent = Math.round((saved / originalSize) * 100);

    return {
      minified,
      originalSize,
      minifiedSize,
      saved,
      percent,
      error: undefined
    };
  } catch (error) {
    const message = error instanceof SyntaxError ? error.message : String(error);
    return {
      minified: '',
      originalSize: input.length,
      minifiedSize: 0,
      saved: 0,
      percent: 0,
      error: `Invalid JSON: ${message}`
    };
  }
}

/**
 * Calculate diff between original and minified JSON
 * Returns array of lines with change markers
 */
export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

export function calculateDiff(
  original: string,
  minified: string
): DiffLine[] {
  // Simple diff implementation for JSON display
  // More sophisticated diff can use external library if needed
  const originalLines = original.split('\n');
  const minifiedLines = minified.split('\n');
  
  return [
    ...originalLines.map((line, i) => ({
      type: 'removed' as const,
      content: line,
      lineNumber: i + 1
    })),
    ...minifiedLines.map((line, i) => ({
      type: 'added' as const,
      content: line,
      lineNumber: i + 1
    }))
  ];
}
```

---

## 3. Component Props & Contracts

### 3.1 Shared Input Component

```typescript
// src/components/ui/TextAreaInput.ts

export interface TextAreaInputProps {
  /** Current input value */
  value: string;
  
  /** Called when user types */
  onChange: (value: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Read-only mode for output display */
  readOnly?: boolean;
  
  /** Character limit (optional) */
  maxLength?: number;
  
  /** Autosize height based on content */
  autoGrow?: boolean;
  
  /** CSS class for styling */
  className?: string;
}

export function TextAreaInput(props: TextAreaInputProps): JSX.Element;
```

### 3.2 JSON Validator Component

```typescript
// src/components/tools/JSONValidatorTool.ts

export interface JSONValidatorToolProps {
  // No external props needed - state from context
}

/**
 * Main JSON Validator component
 * - Input: TextArea for JSON
 * - Output: Split panel (status + errors)
 * - Auto-clear output when input empties
 * - Share button in sidebar
 */
export function JSONValidatorTool(props: JSONValidatorToolProps): JSX.Element;

/**
 * Validation status display (left panel)
 * Shows checkmark or error indicator
 */
export interface ValidationStatusProps {
  validation: JSONValidationResult | null;
  showFormatted?: boolean;
}

export function ValidationStatus(props: ValidationStatusProps): JSX.Element;

/**
 * Error details display (right panel)
 * Shows error list with line/column info
 */
export interface ErrorDetailsProps {
  validation: JSONValidationResult | null;
  showLineNumbers?: boolean;
}

export function ErrorDetails(props: ErrorDetailsProps): JSX.Element;

/**
 * Split output panel container
 * Two-column layout (50/50)
 */
export interface SplitOutputProps {
  left: JSX.Element;
  right: JSX.Element;
  gap?: 'sm' | 'md' | 'lg'; // Tailwind gap sizes
}

export function SplitOutput(props: SplitOutputProps): JSX.Element;
```

### 3.3 JSON Minifier Component

```typescript
// src/components/tools/JSONMinifierTool.ts

export interface JSONMinifierToolProps {
  // No external props needed - state from context
}

/**
 * Main JSON Minifier component
 * - Input: TextArea for JSON
 * - Output: Minified JSON with size statistics
 * - Optional diff view toggle
 * - Auto-clear output when input empties
 * - Share button in sidebar
 */
export function JSONMinifierTool(props: JSONMinifierToolProps): JSX.Element;

/**
 * Statistics display (size comparison)
 */
export interface MinificationStatsProps {
  result: JSONMinificationResult;
  format?: 'compact' | 'detailed'; // inline vs. multi-line
}

export function MinificationStats(props: MinificationStatsProps): JSX.Element;

/**
 * Diff view toggle and display
 */
export interface DiffViewProps {
  original: string;
  minified: string;
  visible: boolean;
}

export function DiffView(props: DiffViewProps): JSX.Element;
```

### 3.4 Sidebar Enhancement

```typescript
// src/components/SettingsSidebar.ts

/**
 * Tool category for organization
 */
export type ToolCategory = 'Encoding' | 'Format';

export interface ToolCategoryConfig {
  name: ToolCategory;
  tools: string[]; // Tool IDs in category
  icon: string; // Icon name
  collapsible: boolean;
}

/**
 * Sidebar component (existing, no interface change)
 * Updates needed:
 * - Add Format category
 * - Reposition ShareButton to sidebar
 */
export interface SettingsSidebarProps {
  // Existing structure unchanged
}

/**
 * Share button group in sidebar
 * Positioned next to share toggle
 */
export interface ShareButtonGroupProps {
  toolName: string;
  toolState: ToolState;
}

export function ShareButtonGroup(props: ShareButtonGroupProps): JSX.Element;
```

---

## 4. Context API Extensions

### 4.1 Tool Context Updates

```typescript
// src/context/ToolContext.ts (extensions)

/**
 * Tool registry for all available tools
 * Determines category and component
 */
export interface ToolRegistration {
  id: string;
  name: string;
  category: ToolCategory;
  component: React.ComponentType<any>;
  defaultState: ToolState;
}

/**
 * Register new tools in context
 * Called during initialization
 */
export function registerTool(tool: ToolRegistration): void;

/**
 * Get all tools in a category
 */
export function getToolsByCategory(category: ToolCategory): ToolRegistration[];

/**
 * Get tool state with auto-clear functionality
 * Ensures output clears when input empties
 */
export function getToolStateWithAutoClears(toolId: string): ToolState;
```

### 4.2 State Mutation Patterns

```typescript
/**
 * Pattern for tool input handlers with auto-clear
 * 
 * Usage in tool components:
 * 
 * const { getState, setState } = useToolContext();
 * const state = getState('json-validator');
 * 
 * const handleInput = (value: string) => {
 *   // Auto-clear output when input empties
 *   const validation = value === '' ? null : validateJSON(value);
 *   setState('json-validator', {
 *     input: value,
 *     validation
 *   });
 * };
 */

export interface ToolStateUpdate<T extends ToolState> {
  input?: string;
  [key: string]: unknown;
}

export function createAutoClears<T extends ToolState>(
  processor: (input: string) => any
): (value: string) => T {
  return (value: string) => {
    return {
      input: value,
      [processor.name]: value === '' ? null : processor(value)
    } as T;
  };
}
```

---

## 5. Data Flow Diagrams

### 5.1 Auto-Clear Flow

```
User Input (text)
        ↓
  Is input empty?
    ↙       ↘
  YES       NO
   ↓         ↓
Clear    Process
Output   & Store
   ↓      ↓
  Save   Save
 State  State
   ↓     ↓
Render with empty output
        ↓
Render with processed output
```

### 5.2 JSON Validator Flow

```
User Pastes JSON
        ↓
 handleInput(json)
        ↓
   validateJSON()
   (JSON.parse)
        ↓
    Success?
   ↙        ↘
  YES       NO
   ↓         ↓
✓Valid   ✗Invalid
Show    Extract:
Pretty  - Line #
Print  - Column #
      - Error msg
   ↓         ↓
setState  setState
   ↓         ↓
   Split Output Rendered
  (Status | Errors)
        ↓
   Share & Copy
```

### 5.3 JSON Minifier Flow

```
User Pastes JSON
        ↓
 handleInput(json)
        ↓
  minifyJSON()
  (parse + stringify)
        ↓
 Calculate Stats:
 - Original size
 - Minified size
 - Bytes saved
 - % reduction
        ↓
   setState
        ↓
  Output Rendered
(Stats + Minified JSON)
        ↓
  Toggle Diff View
        ↓
   Share & Copy
```

### 5.4 Share Button Flow

```
User Clicks Share
        ↓
ShareButton Position: Sidebar
        ↓
Generate URL with
encodeInputForURL()
        ↓
Copy to Clipboard
        ↓
Show "Copied!" Toast
        ↓
URL expires after
sharing session
```

---

## 6. Storage Model

### 6.1 localStorage Schema

```typescript
/**
 * localStorage key structure for tools
 * Format: 'onlinetoolbox:tool:{toolId}'
 */

// Example: Base64 tool state
localStorage['onlinetoolbox:tool:base64-encode'] = JSON.stringify({
  input: 'Hello World',
  output: 'SGVsbG8gV29ybGQ='
});

// Example: JSON Validator state
localStorage['onlinetoolbox:tool:json-validator'] = JSON.stringify({
  input: '{"key": "value"}',
  validation: {
    valid: true,
    errors: [],
    formatted: '{\n  "key": "value"\n}'
  }
});

// Example: JSON Minifier state
localStorage['onlinetoolbox:tool:json-minifier'] = JSON.stringify({
  input: '{\n  "key": "value"\n}',
  result: {
    minified: '{"key":"value"}',
    originalSize: 25,
    minifiedSize: 15,
    saved: 10,
    percent: 40
  },
  showDiff: false
});

// Global settings
localStorage['onlinetoolbox:settings'] = JSON.stringify({
  darkMode: true,
  defaultFormat: 'json-validator'
});
```

### 6.2 URL Encoding Schema

```typescript
/**
 * URL parameters for sharing tool state
 * Format: ?tool={toolId}&input={encodedInput}&settings={encodedSettings}
 */

// Example: Share JSON Validator
// ?tool=json-validator&input=eyJrZXkiOiAidmFsdWUifQ==

/**
 * encodeInputForURL() - existing function, used as-is
 * Encodes state as URL-safe base64
 */

/**
 * decodeInputFromURL() - existing function, used as-is
 * Decodes URL parameters back to state
 */
```

---

## 7. Edge Cases & Null Handling

### 7.1 JSON Validation Edge Cases

| Input | Behavior | Result |
|-------|----------|--------|
| `''` (empty) | No validation | `{ valid: false, errors: [] }` |
| `'   '` (whitespace) | Treat as empty | `{ valid: false, errors: [] }` |
| `'null'` | Valid JSON | `{ valid: true, errors: [], formatted: 'null' }` |
| `'{invalid}'` | Parse error | `{ valid: false, errors: [{...}] }` |
| `'{"nested": {"deep": [1,2,3]}}'` | Complex valid | `{ valid: true, errors: [], formatted: '...' }` |

### 7.2 JSON Minifier Edge Cases

| Input | Behavior | Result |
|-------|----------|--------|
| `''` (empty) | No processing | `{ minified: '', originalSize: 0, minifiedSize: 0, saved: 0, percent: 0 }` |
| `'{"a":1}'` (already minified) | Return as-is | `{ minified: '{"a":1}', originalSize: 8, minifiedSize: 8, saved: 0, percent: 0 }` |
| Large JSON (1MB) | Process normally | Calculate stats, performance <100ms |
| Invalid JSON | Show error | `{ error: 'Invalid JSON: ...' }` |

### 7.3 Auto-Clear Edge Cases

| Action | Input Change | Output Behavior |
|--------|--------------|-----------------|
| User types 'a' | '' → 'a' | Output shows processed result |
| User deletes all | 'a' → '' | Output clears to '' |
| User selects all & deletes | 'text' → '' | Output clears |
| User pastes then deletes | '' → 'text' → '' | Output shows result, then clears |
| Rapid keystrokes | Multiple changes | Debouncing handled at component level |

---

## 8. Performance Targets

### 8.1 Latency Budget

| Operation | Target | Notes |
|-----------|--------|-------|
| JSON.parse (1KB) | <1ms | Native JS, baseline |
| JSON.parse (100KB) | <10ms | Still native, acceptable |
| validateJSON (1KB) | <5ms | Includes error extraction |
| minifyJSON (1KB) | <5ms | Parse + stringify |
| minifyJSON (100KB) | <50ms | Within 100ms budget |
| Component render | <50ms | React 18 optimized |
| State update | <10ms | localStorage write |

### 8.2 Memory Budget

| Item | Limit | Rationale |
|------|-------|-----------|
| JSON input | Unlimited | Browser can handle MB-scale strings |
| Validation result | < 100KB | Error array size, typical files |
| Cached minified JSON | < 500KB | Single copy in memory |
| Component state | < 10KB | Normal tool state size |

### 8.3 Rendering Efficiency

```typescript
/**
 * Optimization: Memoize error list component
 * Prevents re-render if validation result unchanged
 */
export const ErrorDetails = memo(
  (props: ErrorDetailsProps) => {...},
  (prev, next) => prev.validation === next.validation
);

/**
 * Optimization: Defer diff view calculation
 * Only compute when user toggles diff view
 */
const [showDiff, setShowDiff] = useState(false);
const diff = useMemo(
  () => showDiff ? calculateDiff(input, minified) : [],
  [showDiff, input, minified]
);
```

---

## 9. Integration Points

### 9.1 Context API Integration

```typescript
// How new tools register with context

// In ToolContext initialization:
const tools: ToolRegistration[] = [
  {
    id: 'json-validator',
    name: 'JSON Validator',
    category: 'Format',
    component: JSONValidatorTool,
    defaultState: { input: '', validation: null }
  },
  {
    id: 'json-minifier',
    name: 'JSON Minifier',
    category: 'Format',
    component: JSONMinifierTool,
    defaultState: { input: '', result: null, showDiff: false }
  }
];
```

### 9.2 Share Button Integration

```typescript
// ShareButton moved to sidebar, near share toggle

// In SettingsSidebar:
<div className="share-group">
  <button onClick={toggleShare}>Share</button>
  <ShareButton 
    toolName={currentTool}
    toolState={getState(currentTool)}
  />
</div>
```

### 9.3 Category Integration

```typescript
// Sidebar renders categories dynamically

// In Sidebar component:
const categories: ToolCategory[] = ['Encoding', 'Format'];

{categories.map(category => (
  <ToolCategory key={category} category={category} />
))}
```

---

## 10. Migration Path

### 10.1 Breaking Changes
- **None**: No existing APIs modified, only extensions

### 10.2 Backward Compatibility
- ✅ Existing tools unaffected
- ✅ Share button refactoring transparent to users
- ✅ Auto-clear applied consistently (non-breaking fix)

### 10.3 Data Migration
- ✅ No migration needed (new tools, new localStorage keys)
- Existing tool states preserved as-is

---

**Next Steps**: Create component contracts and implementation quickstart in following documents.
