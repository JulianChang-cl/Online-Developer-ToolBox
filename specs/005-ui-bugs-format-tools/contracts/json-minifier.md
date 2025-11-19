# Component Contracts: JSON Minifier Tool

**Feature 005: UI Bug Fixes & Format Tools**

---

## Contract 5: JSON Minifier Component

### Purpose
Define the contract for the JSON Minifier tool component, which minifies JSON by removing whitespace and displays size comparison statistics.

### Component Specification

```typescript
/**
 * JSONMinifierTool Component
 * 
 * Responsibility: Minify JSON and show statistics
 * Input: Any JSON (formatted or unformatted)
 * Output: Minified JSON with size comparison
 * 
 * Features:
 * - Real-time minification as user types
 * - Auto-clear output when input empties
 * - Size comparison (original vs. minified)
 * - Percentage saved calculation
 * - Optional diff view toggle
 * - Share button integration
 */

interface JSONMinifierToolProps {
  // No props required - uses ToolContext for state
}

export function JSONMinifierTool(props: JSONMinifierToolProps): JSX.Element;
```

### Input Contract

```typescript
// Input: TextArea with these properties:
// - value: string (any JSON)
// - onChange: triggered on every keystroke
// - placeholder: "Paste your JSON here..."
// - readOnly: false
// - autoGrow: true (optional, for large JSON)

interface TextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  autoGrow?: boolean;
}
```

### Output Contract

#### T5.1: Minified Output Display
```typescript
// GIVEN: Input is formatted JSON with whitespace
// WHEN: Component renders
// THEN: Output should show minified JSON (no unnecessary whitespace)

const input = `{
  "key": "value",
  "nested": {
    "array": [1, 2, 3]
  }
}`;

const expected = '{"key":"value","nested":{"array":[1,2,3]}}';

render(<JSONMinifierTool />);
await userEvent.type(inputField, input);

expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
```

#### T5.2: Size Statistics Display
```typescript
// GIVEN: Minified JSON output generated
// WHEN: Component renders
// THEN: Should display size comparison:
//   - Original size: X bytes
//   - Minified size: Y bytes
//   - Bytes saved: Z
//   - Percent saved: W%

const input = `{
  "a": 1,
  "b": 2
}`;

render(<JSONMinifierTool />);
await userEvent.type(inputField, input);

expect(screen.getByText(/original size:/i)).toBeInTheDocument();
expect(screen.getByText(/\d+ bytes/)).toBeInTheDocument();

expect(screen.getByText(/minified size:/i)).toBeInTheDocument();
expect(screen.getByText(/\d+ bytes/)).toBeInTheDocument();

expect(screen.getByText(/bytes saved:/i)).toBeInTheDocument();
expect(screen.getByText(/\d+%/)).toBeInTheDocument(); // Percentage
```

#### T5.3: Accurate Size Calculation
```typescript
// GIVEN: Input and minified output
// WHEN: Size statistics are calculated
// THEN: Math should be correct:
//   - Original size = input.length (in bytes)
//   - Minified size = minified.length (in bytes)
//   - Saved = original - minified
//   - Percent = Math.round((saved / original) * 100)

const input = '{"a":1}'; // 7 bytes
const minified = '{"a":1}'; // 7 bytes (already minified)

expect(originalSize).toBe(7);
expect(minifiedSize).toBe(7);
expect(saved).toBe(0);
expect(percent).toBe(0);

const input2 = '{ "a" : 1 }'; // 11 bytes
const minified2 = '{"a":1}'; // 7 bytes
const expectedSaved = 4;
const expectedPercent = Math.round((4 / 11) * 100); // 36%

expect(originalSize).toBe(11);
expect(minifiedSize).toBe(7);
expect(saved).toBe(expectedSaved);
expect(percent).toBe(expectedPercent);
```

#### T5.4: Empty Input
```typescript
// GIVEN: Input is empty string ''
// WHEN: Component renders
// THEN: Output should be empty/hidden
// AND: Statistics should be hidden or zero

const input = '';
render(<JSONMinifierTool />);

expect(screen.queryByDisplayValue(/./)).not.toBeInTheDocument(); // Empty output
expect(screen.queryByText(/original size/i)).not.toBeInTheDocument();
```

#### T5.5: Invalid JSON Handling
```typescript
// GIVEN: Input is invalid JSON '{invalid}'
// WHEN: Component attempts to minify
// THEN: Should display error message
// AND: Should not show minified output
// AND: Statistics should not appear

const input = '{invalid}';
render(<JSONMinifierTool />);
await userEvent.type(inputField, input);

expect(screen.getByText(/invalid json|error/i)).toBeInTheDocument();
expect(screen.queryByText(/original size/i)).not.toBeInTheDocument();
```

### Component Behavior Contract

#### T5.6: Auto-Clear on Input Empty
```typescript
// GIVEN: Input contains JSON and output shows minified result
// WHEN: User clears all input
// THEN: Output should clear automatically
// AND: Statistics should disappear

await userEvent.type(inputField, '{"valid": "json"}');
expect(screen.getByText(/original size/i)).toBeInTheDocument();

await userEvent.clear(inputField);
expect(screen.queryByText(/original size/i)).not.toBeInTheDocument();
```

#### T5.7: Real-Time Minification
```typescript
// GIVEN: Component renders
// WHEN: User types JSON character by character
// THEN: Minification updates on each keystroke
// AND: Size statistics recalculate

await userEvent.type(inputField, '{"a"');
// Incomplete JSON, should show error or no output

await userEvent.type(inputField, ': 1}');
// Now complete, should show minified
expect(screen.getByText(/original size/i)).toBeInTheDocument();
```

#### T5.8: Diff View Toggle
```typescript
// GIVEN: Component with minified JSON displayed
// WHEN: User clicks "Show Diff" toggle
// THEN: Diff view should appear showing:
//   - Original lines marked as "removed" (red background)
//   - Minified lines marked as "added" (green background)

await userEvent.click(showDiffToggle);
expect(screen.getByText(/diff view/i)).toBeInTheDocument();

// Original lines should be visible with removal styling
expect(screen.getByText(originalInput)).toHaveClass('line-removed');

// Minified lines should be visible with addition styling
expect(screen.getByText(minifiedOutput)).toHaveClass('line-added');
```

#### T5.9: Diff View Toggle OFF
```typescript
// GIVEN: Diff view is visible
// WHEN: User clicks "Show Diff" again to toggle OFF
// THEN: Diff view should disappear
// AND: Normal minified output should be shown

await userEvent.click(showDiffToggle); // Toggle ON
expect(screen.getByText(/diff view/i)).toBeInTheDocument();

await userEvent.click(showDiffToggle); // Toggle OFF
expect(screen.queryByText(/diff view/i)).not.toBeInTheDocument();
```

### Integration Contract

#### T5.10: Share Integration
```typescript
// GIVEN: Valid minified JSON displayed
// WHEN: User clicks Share button
// THEN: URL should contain original JSON input
// AND: Shared URL should decode to original input
// AND: When shared URL is loaded, tool shows minified output

await userEvent.click(shareButton);
const url = await navigator.clipboard.readText();

expect(url).toContain('tool=json-minifier');
expect(url).toContain('input=');

// Decode and verify
const params = new URLSearchParams(url.split('?')[1]);
const decodedInput = atob(params.get('input'));
expect(decodedInput).toEqual(originalInput);

// When loading via URL, tool auto-minifies
window.location.href = url;
// After navigation, minified output should be displayed
```

#### T5.11: Settings Sidebar Integration
```typescript
// GIVEN: Component rendered
// WHEN: Sidebar is visible
// THEN: Share button should be in sidebar
// AND: Show Diff toggle should be in sidebar settings

expect(screen.getByTestId('settings-sidebar')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /copy.*url/i })).toBeInTheDocument();
expect(screen.getByRole('button', { name: /show diff/i })).toBeInTheDocument();
```

### Performance Contract

#### T5.12: Minification Performance Budget
```typescript
// GIVEN: JSON input up to 1MB
// WHEN: Minification runs
// THEN: Should complete within 100ms

const largeJSON = generateJSON(1024 * 1024); // 1MB

const start = performance.now();
minifyJSON(largeJSON);
const duration = performance.now() - start;

expect(duration).toBeLessThan(100); // milliseconds
```

#### T5.13: Memory Efficiency
```typescript
// GIVEN: Multiple minification operations
// WHEN: Processing large JSON sequentially
// THEN: Memory should not accumulate (no leaks)

for (let i = 0; i < 100; i++) {
  minifyJSON(generateJSON(100000)); // 100KB each
}

// Memory should return to baseline after garbage collection
const afterMemory = performance.memory.usedJSHeapSize;
expect(afterMemory).toBeLessThan(baselineMemory * 1.5); // Allow 50% headroom
```

#### T5.14: Render Performance
```typescript
// GIVEN: Large statistics display
// WHEN: Component re-renders
// THEN: Should not cause layout shift or flicker

// Use performance observer to track:
// - First Contentful Paint < 50ms
// - Cumulative Layout Shift < 0.1
```

### Edge Cases Contract

#### T5.15: Already Minified JSON
```typescript
// GIVEN: Input is already minified
// WHEN: Minification runs
// THEN: Output should be identical to input
// AND: Percent saved should be 0%

const input = '{"a":1,"b":2}';
render(<JSONMinifierTool />);
await userEvent.type(inputField, input);

const output = screen.getByDisplayValue(input);
expect(output.value).toBe(input);
expect(screen.getByText(/0%/)).toBeInTheDocument();
```

#### T5.16: Deeply Nested JSON
```typescript
// GIVEN: Input with many levels of nesting
// WHEN: Minification runs
// THEN: Should preserve structure integrity
// AND: Minified output when parsed equals original parsed

const input = `{
  "level1": {
    "level2": {
      "level3": {
        "level4": [1, 2, 3]
      }
    }
  }
}`;

render(<JSONMinifierTool />);
await userEvent.type(inputField, input);

const minified = screen.getByDisplayValue(/\w+/);
const originalParsed = JSON.parse(input);
const minifiedParsed = JSON.parse(minified.value);

expect(minifiedParsed).toEqual(originalParsed);
```

#### T5.17: Large Arrays
```typescript
// GIVEN: JSON with large array (10,000 elements)
// WHEN: Minification runs
// THEN: Should complete within budget
// AND: Size savings should be significant

const input = JSON.stringify({
  data: Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `item${i}` }))
}, null, 2);

const start = performance.now();
minifyJSON(input);
const duration = performance.now() - start;

expect(duration).toBeLessThan(100);
expect(percent).toBeGreaterThan(20); // Should save at least 20%
```

#### T5.18: Unicode and Special Characters
```typescript
// GIVEN: Input contains Unicode: {"name": "你好世界", "emoji": "🚀"}
// WHEN: Minification runs
// THEN: Should preserve all Unicode/special chars
// AND: Minified output should be valid JSON

const input = '{"name": "你好世界", "emoji": "🚀"}';
render(<JSONMinifierTool />);
await userEvent.type(inputField, input);

const minified = screen.getByDisplayValue(/\w+/);
const parsed = JSON.parse(minified.value);

expect(parsed.name).toBe("你好世界");
expect(parsed.emoji).toBe("🚀");
```

#### T5.19: String Values with Whitespace
```typescript
// GIVEN: JSON with string values containing spaces
// WHEN: Minified
// THEN: Internal string whitespace should be preserved
// AND: Only external formatting whitespace should be removed

const input = `{
  "message": "  hello   world  "
}`;

render(<JSONMinifierTool />);
await userEvent.type(inputField, input);

const minified = screen.getByDisplayValue(/\w+/);
const parsed = JSON.parse(minified.value);

expect(parsed.message).toBe("  hello   world  "); // Spaces preserved
```

#### T5.20: Empty Containers
```typescript
// GIVEN: Input with empty objects and arrays
// WHEN: Minified
// THEN: Empty containers should remain empty

const input = `{
  "empty_obj": {},
  "empty_array": [],
  "nested": {
    "also_empty": {}
  }
}`;

render(<JSONMinifierTool />);
await userEvent.type(inputField, input);

const minified = screen.getByDisplayValue(/\w+/);
const parsed = JSON.parse(minified.value);

expect(parsed.empty_obj).toEqual({});
expect(parsed.empty_array).toEqual([]);
expect(parsed.nested.also_empty).toEqual({});
```

### Accessibility Contract

#### T5.21: Screen Reader Announcements
```typescript
// GIVEN: Minification completes
// WHEN: User with screen reader is using tool
// THEN: Size statistics should be announced

await userEvent.type(inputField, validJSON);

const statusRegion = screen.getByRole('status');
expect(statusRegion).toHaveTextContent(/\d+ bytes saved/i);
expect(statusRegion).toHaveTextContent(/\d+%/i);
```

#### T5.22: Keyboard Navigation
```typescript
// GIVEN: Component is focused
// WHEN: User navigates with Tab key
// THEN: All interactive elements should be reachable

const input = screen.getByPlaceholderText(/paste.*json/i);
const shareButton = screen.getByRole('button', { name: /copy/i });
const diffToggle = screen.getByRole('button', { name: /show diff/i });
const copyOutput = screen.getByRole('button', { name: /copy.*output/i });

// Tab through all interactive elements
input.focus();
expect(input).toHaveFocus();

await userEvent.tab();
expect(shareButton).toHaveFocus();

await userEvent.tab();
expect(diffToggle).toHaveFocus();

await userEvent.tab();
expect(copyOutput).toHaveFocus();
```

---

## Sub-Component Contracts

### MinificationStats Component

```typescript
interface MinificationStatsProps {
  result: JSONMinificationResult;
  format?: 'compact' | 'detailed';
}

/**
 * WHEN: format is 'compact'
 * THEN: Should display in single line:
 *   "Original: X bytes | Minified: Y bytes | Saved: Z (W%)"
 */

/**
 * WHEN: format is 'detailed'
 * THEN: Should display in multi-line:
 *   Original Size: X bytes
 *   Minified Size: Y bytes
 *   Bytes Saved: Z
 *   Reduction: W%
 */

/**
 * WHEN: result.error exists
 * THEN: Should display error message in red
 * AND: Stats section should not appear
 */
```

### DiffView Component

```typescript
interface DiffViewProps {
  original: string;
  minified: string;
  visible: boolean;
}

/**
 * WHEN: visible is false
 * THEN: Component should not render
 */

/**
 * WHEN: visible is true
 * THEN: Should display two columns:
 *   LEFT: Original JSON lines (marked removed/red)
 *   RIGHT: Minified JSON lines (marked added/green)
 * AND: Line numbers should be visible
 */

/**
 * WHEN: Displaying diff
 * THEN: Each line should show:
 *   - Line number (1-indexed)
 *   - Modification marker (- or +)
 *   - Content
 */
```

---

**Contract Status**: Ready for test development

Implement these contracts as Jest test suites before writing component code.

See `/tests/contracts/json-minifier.test.ts` for test implementations.
