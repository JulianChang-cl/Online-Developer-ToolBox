# Component Contracts: Bug Fixes & Auto-Clear

**Feature 005: UI Bug Fixes & Format Tools**

---

## Contract 1: Auto-Clear Output When Input Empties

### Purpose
Ensure that when a user clears the input field (deletes all text), the output automatically clears instead of showing stale data. This contract applies to **all existing tools** (Base64, Base16, Base32) and **new tools** (JSON Validator, JSON Minifier).

### Preconditions
- User has typed text into the input field
- Tool has processed and displayed output

### Primary Flow

```
1. User selects all text in input (Ctrl+A)
2. User presses Delete/Backspace
3. Input value becomes ''
4. Output automatically clears to ''
5. Visual state: both input and output are empty
```

### Test Cases

#### T1.1: Simple Text Deletion
```typescript
// GIVEN: Input contains "Hello World"
// AND: Output shows "SGVsbG8gV29ybGQ=" (Base64 encoded)
// WHEN: User deletes all input
// THEN: Output should be empty string ""
// AND: Component re-renders with empty output

expect(screen.getByDisplayValue('SGVsbG8gV29ybGQ=')).not.toBeInTheDocument();
expect(screen.queryByDisplayValue('Hello World')).not.toBeInTheDocument();
```

#### T1.2: Whitespace-Only Input Does NOT Clear
```typescript
// GIVEN: Input contains "   " (three spaces)
// WHEN: User does not delete the spaces
// THEN: Output should still show processed result
// REASON: Whitespace-only is not considered "empty" for processing

const state = processor('   '); // Should process, not clear
expect(state.output).not.toBe('');
```

#### T1.3: Empty Input → User Types → Output Updates
```typescript
// GIVEN: Input is empty and output is empty
// WHEN: User types "test"
// THEN: Output should show processed "test"
// AND: Output should not be empty

expect(output).not.toBe('');
```

#### T1.4: Multiple Clear-Type-Clear Cycles
```typescript
// GIVEN: User types → deletes → types → deletes repeatedly
// WHEN: Each delete clears output
// THEN: Each type re-populates output

// Cycle 1: type
handleInput('a');
expect(output).not.toBe('');

// Cycle 1: delete
handleInput('');
expect(output).toBe('');

// Cycle 2: type
handleInput('b');
expect(output).not.toBe('');

// Cycle 2: delete
handleInput('');
expect(output).toBe('');
```

### Edge Cases

#### E1.1: Rapid Keystrokes
```typescript
// GIVEN: User types "test" very quickly
// WHEN: Each keystroke triggers handleInput
// THEN: Output should show final result after all keystrokes settle
// AND: No performance degradation

// Simulate rapid typing
handleInput('t');
handleInput('te');
handleInput('tes');
handleInput('test');

// All should process correctly
```

#### E1.2: Paste Then Delete
```typescript
// GIVEN: User pastes large JSON (1MB)
// WHEN: Output processes successfully
// AND: User then selects all and deletes
// THEN: Output should clear immediately

handleInput(largeJSON);
expect(output).not.toBe('');

handleInput('');
expect(output).toBe('');
```

#### E1.3: Copy Output, Then Clear Input
```typescript
// GIVEN: User clicks Copy on output
// WHEN: User clears input
// THEN: Clipboard still has copied value
// AND: Output clears in UI

copyToClipboard(output);
handleInput('');

expect(navigator.clipboard.readText()).resolves.toBe(previousOutput);
expect(screen.queryByDisplayValue(previousOutput)).not.toBeInTheDocument();
```

### Non-Functional Requirements

- **Performance**: No noticeable delay when clearing output (<10ms)
- **Accessibility**: Screen reader announces output cleared
- **Browser Compatibility**: Works in Chrome, Firefox, Safari, Edge (last 2 versions)

### Implementation Notes

- Apply check in tool's `handleInput` function
- Pattern: `const output = value === '' ? '' : processor(value);`
- Test in all existing tools (Base64, Base16, Base32)
- Test in new tools (JSON Validator, JSON Minifier)

---

## Contract 2: Shareable Link UI Positioning

### Purpose
Ensure the ShareButton is positioned visually near the Share action (in the sidebar), not separated from it by the output panel. This improves UX consistency and makes the share feature discoverability better.

### Preconditions
- User has entered text in a tool
- Tool has generated shareable URL

### Primary Flow

```
1. User clicks "Share" toggle in sidebar
2. ShareButton appears next to/below Share toggle
3. ShareButton is visually associated with Share action
4. User clicks ShareButton to copy URL
5. Toast shows "Copied!" confirmation
6. URL is in clipboard
```

### Visual Specification

```
BEFORE (Bug):
┌─────────────────┐
│  [Input]        │
│  [Output]       │ ← Output panel in middle
│  [Share Button] │ ← Button separated, confusing
└─────────────────┘

AFTER (Fixed):
┌──────────────────────────┐
│ Sidebar:                 │
│  ☑ Share                 │
│  [Copy URL Button]  ← HERE (grouped)
├──────────────────────────┤
│  [Input]                 │
│  [Output]                │
└──────────────────────────┘
```

### Test Cases

#### T2.1: ShareButton Position in Sidebar
```typescript
// GIVEN: Tool component rendered
// WHEN: Share toggle is clicked
// THEN: ShareButton should appear in sidebar

const shareButton = screen.getByRole('button', { name: /copy.*url/i });
const sidebar = screen.getByTestId('settings-sidebar');

expect(sidebar).toContainElement(shareButton);
```

#### T2.2: ShareButton Visual Proximity
```typescript
// GIVEN: Share toggle and ShareButton both visible
// WHEN: Measuring their positions
// THEN: Horizontal distance should be < 50px (same row or adjacent)

const shareToggle = screen.getByRole('button', { name: /share/i });
const shareButton = screen.getByRole('button', { name: /copy.*url/i });

const toggleRect = shareToggle.getBoundingClientRect();
const buttonRect = shareButton.getBoundingClientRect();

const horizontalDistance = Math.abs(toggleRect.right - buttonRect.left);
expect(horizontalDistance).toBeLessThan(50);
```

#### T2.3: ShareButton Click Generates URL
```typescript
// GIVEN: ShareButton is visible
// WHEN: User clicks ShareButton
// THEN: URL with tool state is generated
// AND: URL is copied to clipboard

await userEvent.click(shareButton);

const clipboardText = await navigator.clipboard.readText();
expect(clipboardText).toMatch(/\?tool=/);
expect(clipboardText).toMatch(/input=/);
```

#### T2.4: Toast Confirmation Appears
```typescript
// GIVEN: User clicks ShareButton
// WHEN: URL is copied to clipboard
// THEN: Toast message appears ("Copied!")
// AND: Toast disappears after 2 seconds

await userEvent.click(shareButton);

expect(screen.getByText(/copied/i)).toBeInTheDocument();

// Wait 2.5 seconds
await waitFor(
  () => expect(screen.queryByText(/copied/i)).not.toBeInTheDocument(),
  { timeout: 2500 }
);
```

### Edge Cases

#### E2.1: Mobile Responsive Layout
```typescript
// GIVEN: Mobile viewport (320px width)
// WHEN: ShareButton is rendered in sidebar
// THEN: Button should fit without wrapping
// AND: Should not overflow screen edge

render(<Tool />, { width: 320 });
const button = screen.getByRole('button', { name: /copy.*url/i });

const rect = button.getBoundingClientRect();
expect(rect.right).toBeLessThanOrEqual(320);
```

#### E2.2: Sidebar Collapse/Expand
```typescript
// GIVEN: Sidebar is collapsed
// WHEN: User expands sidebar
// THEN: ShareButton should remain visible
// AND: Position should not shift

// Collapse
await userEvent.click(toggleSidebarButton);
expect(screen.getByTestId('settings-sidebar')).toHaveClass('collapsed');

// Expand
await userEvent.click(toggleSidebarButton);
expect(screen.getByTestId('settings-sidebar')).not.toHaveClass('collapsed');
expect(shareButton).toBeVisible();
```

#### E2.3: URL Length Edge Case
```typescript
// GIVEN: Large input (10KB JSON)
// WHEN: User generates share URL
// THEN: URL might exceed 2KB limit
// AND: Should use short URL service or truncate appropriately

const largeInput = generateJSON(10000); // 10KB
await userEvent.click(shareButton);

const clipboardText = await navigator.clipboard.readText();
expect(clipboardText.length).toBeLessThanOrEqual(2048); // Reasonable limit
```

#### E2.4: Share Button Hidden Until Share Toggle
```typescript
// GIVEN: Component first renders
// WHEN: Share toggle is OFF
// THEN: ShareButton should not be visible

expect(screen.queryByRole('button', { name: /copy.*url/i })).not.toBeInTheDocument();

// WHEN: Share toggle is ON
// THEN: ShareButton should be visible

await userEvent.click(shareToggle);
expect(screen.getByRole('button', { name: /copy.*url/i })).toBeVisible();
```

### Non-Functional Requirements

- **Accessibility**: Button is keyboard accessible (Tab navigation)
- **Performance**: Click → Copy operation < 50ms
- **Security**: URL doesn't expose sensitive data unencoded
- **Consistency**: Same positioning across all tools

### Implementation Notes

- Refactor all tool components to move ShareButton to sidebar
- Update CSS to position button next to/below Share toggle
- Use consistent spacing (8px gap between toggle and button)
- Ensure button is visible only when Share is enabled

---

## Contract 3: Input Handler Pattern with Auto-Clear

### Purpose
Define the standard pattern that all tool input handlers must follow to ensure consistent auto-clear behavior across the codebase.

### Pattern Specification

```typescript
/**
 * Standard input handler pattern for all tools
 * 
 * Pattern: The processor function is called ONLY if input is not empty
 *          If input is empty, output is cleared immediately
 */
const handleInput = (value: string) => {
  // Auto-clear when input is empty
  const output = value === '' ? '' : processor(value);
  
  setState(toolName, {
    input: value,
    output // or toolState-specific property
  });
};
```

### Compliance Test

```typescript
// GIVEN: An input handler following the pattern
// WHEN: Input is cleared
// THEN: Output should be empty

// ✓ COMPLIANT
const handleInput = (v) => setState('tool', { 
  input: v, 
  output: v === '' ? '' : encode(v) 
});

// ✗ NON-COMPLIANT (processes even when empty)
const handleInput = (v) => setState('tool', { 
  input: v, 
  output: encode(v) // No check!
});

// ✗ NON-COMPLIANT (always clears)
const handleInput = (v) => setState('tool', { 
  input: v, 
  output: '' // Clears even for valid input!
});
```

---

**Contract Status**: Ready for test development

Each contract should be implemented as a test suite before writing production code.

See `/tests/contracts/` for test implementations.
