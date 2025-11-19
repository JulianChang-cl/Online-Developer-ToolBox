# Component Contracts: JSON Validator Tool

**Feature 005: UI Bug Fixes & Format Tools**

---

## Contract 4: JSON Validator Component

### Purpose
Define the contract for the JSON Validator tool component, which validates JSON syntax and displays errors with precise location information.

### Component Specification

```typescript
/**
 * JSONValidatorTool Component
 * 
 * Responsibility: Validate JSON input and display results
 * Input: Any text (will validate if valid JSON)
 * Output: Split panel with validation status and error details
 * 
 * Features:
 * - Real-time validation as user types
 * - Auto-clear output when input empties
 * - Error details with line/column numbers
 * - Syntax-highlighted formatted output
 * - Share button integration
 */

interface JSONValidatorToolProps {
  // No props required - uses ToolContext for state
}

export function JSONValidatorTool(props: JSONValidatorToolProps): JSX.Element;
```

### Input Contract

```typescript
// Input: TextArea with these properties:
// - value: string (any text)
// - onChange: triggered on every keystroke
// - placeholder: "Paste your JSON here..."
// - readOnly: false

interface TextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}
```

### Output Contract

#### T4.1: Valid JSON Display
```typescript
// GIVEN: Input is valid JSON '{"key": "value"}'
// WHEN: Component renders
// THEN: Output should show split panel:
//   LEFT: "✓ Valid JSON" with green styling
//   RIGHT: Pretty-printed formatted JSON

const input = '{"key": "value"}';
render(<JSONValidatorTool />);

// Left panel shows valid indicator
expect(screen.getByText(/✓.*valid/i)).toBeInTheDocument();
expect(screen.getByText(/✓.*valid/i)).toHaveClass('text-green-600');

// Right panel shows formatted JSON
const formatted = screen.getByDisplayValue(/{\s*"key":\s*"value"\s*}/);
expect(formatted).toBeInTheDocument();
```

#### T4.2: Invalid JSON Error Display
```typescript
// GIVEN: Input is invalid JSON '{invalid}'
// WHEN: Component validates
// THEN: Output should show:
//   LEFT: "✗ Invalid JSON" with red styling
//   RIGHT: Error message with line and column

const input = '{invalid}';
render(<JSONValidatorTool />);

// Left panel shows error indicator
expect(screen.getByText(/✗.*invalid/i)).toBeInTheDocument();
expect(screen.getByText(/✗.*invalid/i)).toHaveClass('text-red-600');

// Right panel shows error details
expect(screen.getByText(/line 1, column 2/i)).toBeInTheDocument();
expect(screen.getByText(/unexpected token/i)).toBeInTheDocument();
```

#### T4.3: Multiple Errors
```typescript
// GIVEN: Input has multiple JSON errors
// WHEN: Validation runs
// THEN: All errors should be displayed with locations

const input = `{
  "key1": "value"  // Missing comma
  "key2": "value"
}`;

// Should show first/primary error with line/column
expect(screen.getByText(/line \d+, column \d+/)).toBeInTheDocument();
```

#### T4.4: Empty Input
```typescript
// GIVEN: Input is empty string ''
// WHEN: Component validates
// THEN: Output should be empty/hidden
// AND: No error message should show

const input = '';
render(<JSONValidatorTool />);

expect(screen.queryByText(/✓|✗/)).not.toBeInTheDocument();
expect(screen.queryByText(/error|invalid/i)).not.toBeInTheDocument();
```

### Component Behavior Contract

#### T4.5: Auto-Clear on Input Empty
```typescript
// GIVEN: Input contains JSON and output shows result
// WHEN: User clears all input
// THEN: Output should clear automatically

// User types JSON
await userEvent.type(input, '{"valid": "json"}');
expect(screen.getByText(/✓/)).toBeInTheDocument();

// User clears input
await userEvent.clear(input);
expect(screen.queryByText(/✓|✗/)).not.toBeInTheDocument();
```

#### T4.6: Real-Time Validation
```typescript
// GIVEN: Component renders
// WHEN: User types character by character
// THEN: Validation updates on each keystroke

await userEvent.type(input, '{');
expect(screen.getByText(/✗/)).toBeInTheDocument();

await userEvent.type(input, '"key"');
// Still invalid, but no error message yet (parsing continues)

await userEvent.type(input, ':');
// Still incomplete

await userEvent.type(input, '"value"}');
// Now valid
expect(screen.getByText(/✓/)).toBeInTheDocument();
```

#### T4.7: Formatted Output Preservation
```typescript
// GIVEN: Valid JSON input
// WHEN: Component displays formatted output
// THEN: Formatting should use 2-space indentation
// AND: Should be syntactically valid

const input = '{"nested":{"array":[1,2,3]}}';
const formatted = screen.getByDisplayValue(/formatted/);

const parsed = JSON.parse(formatted.value);
expect(parsed.nested.array).toEqual([1, 2, 3]);

// Check indentation (2 spaces)
expect(formatted.value).toMatch(/\n  "/); // 2 spaces
```

### Integration Contract

#### T4.8: Share Integration
```typescript
// GIVEN: Valid JSON displayed
// WHEN: User clicks Share button
// THEN: URL should contain JSON input
// AND: Shared URL should decode to original input

await userEvent.click(shareButton);
const url = await navigator.clipboard.readText();

expect(url).toContain('tool=json-validator');
expect(url).toContain('input=');

// Decode and verify
const params = new URLSearchParams(url.split('?')[1]);
const decodedInput = atob(params.get('input'));
expect(decodedInput).toEqual(originalInput);
```

#### T4.9: Settings Sidebar Integration
```typescript
// GIVEN: Component rendered
// WHEN: Sidebar is visible
// THEN: Share button should be in sidebar
// AND: Other tool-specific settings should appear

expect(screen.getByTestId('settings-sidebar')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /copy.*url/i })).toBeInTheDocument();
```

### Performance Contract

#### T4.10: Validation Performance Budget
```typescript
// GIVEN: JSON input up to 1MB
// WHEN: Validation runs
// THEN: Should complete within 100ms

const largeJSON = generateJSON(1024 * 1024); // 1MB

const start = performance.now();
validateJSON(largeJSON);
const duration = performance.now() - start;

expect(duration).toBeLessThan(100); // milliseconds
```

#### T4.11: Render Performance
```typescript
// GIVEN: Large error list
// WHEN: Component re-renders
// THEN: Should not cause layout shift or flicker

// Use performance observer to track metrics
// Ensure First Contentful Paint < 50ms after input
```

### Edge Cases Contract

#### T4.12: Null JSON Value
```typescript
// GIVEN: Input is literal 'null'
// WHEN: Validation runs
// THEN: Should be valid JSON (null is valid)

const input = 'null';
render(<JSONValidatorTool />);
expect(screen.getByText(/✓.*valid/i)).toBeInTheDocument();
```

#### T4.13: JSON with Comments (Invalid in Standard JSON)
```typescript
// GIVEN: Input is JSON with comments
// WHEN: Validation runs
// THEN: Should be invalid (comments not part of JSON spec)

const input = `{
  // This is a comment
  "key": "value"
}`;

render(<JSONValidatorTool />);
expect(screen.getByText(/✗.*invalid/i)).toBeInTheDocument();
```

#### T4.14: Unicode and Special Characters
```typescript
// GIVEN: Input contains Unicode: '{"name": "你好世界"}'
// WHEN: Validation runs
// THEN: Should be valid JSON
// AND: Formatted output should preserve Unicode

const input = '{"name": "你好世界"}';
render(<JSONValidatorTool />);

expect(screen.getByText(/✓/)).toBeInTheDocument();
expect(screen.getByDisplayValue(/你好世界/)).toBeInTheDocument();
```

#### T4.15: Very Long Single Line
```typescript
// GIVEN: Input is valid JSON on single very long line
// WHEN: Formatted, output should break into multiple lines
// THEN: Formatted output should have proper line breaks

const input = '{"a":1,"b":2,"c":3,"d":4,"e":5}';
const formatted = screen.getByDisplayValue(/formatted/);

expect(formatted.value.split('\n').length).toBeGreaterThan(1);
```

### Accessibility Contract

#### T4.16: Screen Reader Announcements
```typescript
// GIVEN: Validation result updates
// WHEN: User with screen reader is using tool
// THEN: Status changes should be announced

// Valid JSON
await userEvent.type(input, '{"key": "value"}');
expect(screen.getByRole('status')).toHaveTextContent(/valid/i);

// Invalid JSON
await userEvent.clear(input);
await userEvent.type(input, '{invalid}');
expect(screen.getByRole('status')).toHaveTextContent(/invalid|error/i);
```

#### T4.17: Keyboard Navigation
```typescript
// GIVEN: Component is focused
// WHEN: User navigates with Tab key
// THEN: All interactive elements should be reachable

const input = screen.getByPlaceholderText(/paste.*json/i);
const shareButton = screen.getByRole('button', { name: /copy/i });
const copyButton = screen.getByRole('button', { name: /copy.*output/i });

// Tab from input to share button
input.focus();
expect(input).toHaveFocus();

await userEvent.tab();
expect(shareButton).toHaveFocus();

await userEvent.tab();
expect(copyButton).toHaveFocus();
```

---

## Sub-Component Contracts

### ValidationStatus Component

```typescript
interface ValidationStatusProps {
  validation: JSONValidationResult | null;
  showFormatted?: boolean;
}

/**
 * WHEN: validation is null
 * THEN: Component should not render anything
 */

/**
 * WHEN: validation.valid is true
 * THEN: Should display green checkmark (✓)
 * AND: Optionally show formatted JSON below
 */

/**
 * WHEN: validation.valid is false
 * THEN: Should display red X (✗)
 * AND: Display "Invalid JSON" message
 * AND: Show count of errors
 */
```

### ErrorDetails Component

```typescript
interface ErrorDetailsProps {
  validation: JSONValidationResult | null;
  showLineNumbers?: boolean;
}

/**
 * WHEN: validation is null
 * THEN: Component should render empty
 */

/**
 * WHEN: validation.errors is empty array
 * THEN: Should display "No errors found"
 */

/**
 * WHEN: validation.errors contains items
 * THEN: Should display each error as:
 *   "Line X, Column Y: [error message]"
 * AND: Each error should be visually distinct
 */
```

### SplitOutput Component

```typescript
interface SplitOutputProps {
  left: JSX.Element;
  right: JSX.Element;
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * WHEN: Component renders
 * THEN: Should display two panels side-by-side
 * AND: Each panel should be 50% width
 * AND: Gap between panels should match specified size
 */

/**
 * WHEN: Viewport is mobile (<640px)
 * THEN: Should stack panels vertically
 * AND: Each panel should be full width
 */
```

---

**Contract Status**: Ready for test development

Implement these contracts as Jest test suites before writing component code.

See `/tests/contracts/json-validator.test.ts` for test implementations.
