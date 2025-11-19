# Data Model & Domain Objects: UI Layout Refinement & Shareable Links

**Phase 1: Design**  
**Status**: Complete | **Date**: October 30, 2025

## Overview

This document defines the domain objects and data structures needed for Feature 004. The data model is intentionally minimal—most state is UI state (sidebar groups, tool settings) rather than persistent domain state.

---

## Domain Objects

### 1. ToolGroup

Represents a collapsible group of related encoding tools in the sidebar.

```typescript
interface ToolGroup {
  /** Unique identifier for the group (e.g., "base64", "base16", "base32") */
  id: string;
  
  /** Display name shown in sidebar (e.g., "Base64 Encoding") */
  name: string;
  
  /** List of tool items in this group */
  items: ToolItem[];
  
  /** Whether this group is currently expanded (UI state) */
  isExpanded?: boolean;
}
```

**Storage**: UI state (not persisted); managed by `useSidebarState` hook

---

### 2. ToolItem

Represents a single encoding/decoding tool that can be navigated to.

```typescript
interface ToolItem {
  /** Unique identifier (e.g., "base64_encode", "base32_decode") */
  id: string;
  
  /** Display name (e.g., "Encode", "Decode") */
  name: string;
  
  /** URL path to tool page (e.g., "/base64_encode") */
  path: string;
  
  /** Parent group ID */
  groupId: string;
}
```

**Storage**: Configuration (static, loaded at startup); defined in `src/tools/index.ts`

---

### 3. ToolSettings

Represents the current configuration/state of a specific encoding tool.

```typescript
interface ToolSettings {
  /** Tool identifier (e.g., "base64_encode") */
  toolId: string;
  
  /** Current input text */
  input: string;
  
  /** How the input should be interpreted: 'utf-8' | 'ascii' | 'latin-1' */
  inputEncoding: 'utf-8' | 'ascii' | 'latin-1';
  
  /** Tool-specific settings (varies by tool) */
  toolSpecificSettings: Record<string, any>;
  
  /** Computed output (read-only, derived from input and settings) */
  output?: string;
}

// Example instances:
// Base64 Encode: { toolId: 'base64_encode', input: 'Hello', inputEncoding: 'utf-8', output: 'SGVsbG8=' }
// Base32 Decode with padding: { toolId: 'base32_decode', input: 'JBSWY3DPEBLW64TMMQQQ======', inputEncoding: 'utf-8', toolSpecificSettings: { padding: true }, output: 'Hello World' }
```

**Storage**: UI state (component local state); URL parameters serialize this for sharing

---

### 4. ShareLink

Represents a generated shareable URL containing all tool state as query parameters.

```typescript
interface ShareLink {
  /** The complete URL including domain and parameters */
  url: string;
  
  /** Tool identifier for reference */
  toolId: string;
  
  /** When this share link was generated (for optional analytics) */
  generatedAt: Date;
  
  /** The original settings that generated this link */
  settings: ToolSettings;
}
```

**Storage**: Not persisted; generated on demand via `useShareLink` hook

---

### 5. URLParameters

Represents the query parameters serialized in a shareable link.

```typescript
interface URLParameters {
  /** Input text encoded in Base64 (to handle special characters safely) */
  input: string;
  
  /** Input encoding format */
  input_encoding: 'utf-8' | 'ascii' | 'latin-1';
  
  /** Tool-specific parameters (e.g., padding, format) */
  [key: string]: string | boolean | number;
}

// Example:
// {
//   input: "SGVsbG8gV29ybGQ=",           // Base64-encoded "Hello World"
//   input_encoding: "utf-8",
//   padding: "false"                     // Base32-specific setting
// }
```

**Serialization Format**: URL query string
```
?input=SGVsbG8gV29ybGQ%3D&input_encoding=utf-8&padding=false
```

**Storage**: URL string only; no database or localStorage required

---

## State Management

### Sidebar State (UI State)

```typescript
// Managed by: useSidebarState hook
// Shape: Record<groupId, isExpanded>
interface SidebarState {
  base64: boolean;   // false = collapsed, true = expanded
  base16: boolean;
  base32: boolean;
}

// Example:
const [sidebarState, toggleGroup] = useSidebarState();
// { base64: true, base16: false, base32: true }
// User clicks Base16 group → toggleGroup('base16')
// Result: { base64: true, base16: true, base32: true } (multi-open allowed)
```

### Tool State (UI State)

```typescript
// Managed by: Component state (useState in tool components)
// Example for Base64EncodeTool:
const [input, setInput] = useState('');
const [inputEncoding, setInputEncoding] = useState<'utf-8' | 'ascii' | 'latin-1'>('utf-8');
const [output, setOutput] = useState('');

// When user enters input, output is re-computed automatically
useEffect(() => {
  try {
    const encoded = btoa(input); // Simplified; real version handles encoding
    setOutput(encoded);
  } catch (e) {
    setOutput('Error: Invalid input for this encoding');
  }
}, [input, inputEncoding]);
```

### Share State (Transient)

```typescript
// Managed by: useShareLink hook + local component state
// Share button state: isOpen (dropdown visible or not)
interface ShareButtonState {
  isOpen: boolean;
  generatedUrl?: string;
  copiedRecently?: boolean; // For "Copied!" feedback
}
```

---

## Data Flow Diagrams

### User Navigation (Sidebar)

```
User clicks sidebar item
  ↓
Toggle group expand/collapse (if clicking group header)
  ↓
Update SidebarState via useSidebarState hook
  ↓
Sidebar component re-renders with new group visibility
  ↓
User clicks tool item (Base64 Encode)
  ↓
Navigate via React Router to /base64_encode
  ↓
Base64EncodeTool component mounts
  ↓
Parse URL parameters (if any) via useSearchParams
  ↓
Restore tool state from URL or use defaults
  ↓
Render tool UI with Settings/Input/Output layout
```

### Share Action (Generate & Copy URL)

```
User enters input & configures settings in tool
  ↓
User clicks Share button
  ↓
ShareButton dropdown appears
  ↓
useShareLink hook generates URL:
  - Serialize current tool state
  - Encode input text as Base64
  - Build query string with input_encoding + tool-specific params
  - Return complete URL: {domain}/tool.html?input={encoded}&...
  ↓
Dropdown displays generated URL + copy icon
  ↓
User clicks copy icon
  ↓
URL copied to clipboard via navigator.clipboard.writeText()
  ↓
Toast notification confirms "Copied!"
  ↓
User shares URL (email, chat, etc.)
```

### URL Parameter Restoration (Open Shared Link)

```
User opens shared URL in new browser tab
  ↓
React Router navigates to tool page
  ↓
Tool component mounts
  ↓
useSearchParams hook extracts query parameters:
  - input = "SGVsbG8="
  - input_encoding = "utf-8"
  - padding = "false" (if applicable)
  ↓
Validate parameters:
  - Decode input from Base64
  - Validate input_encoding is known value
  - Validate tool-specific params
  ↓
Apply to component state:
  - setInput(decodedInput)
  - setInputEncoding(input_encoding)
  - setToolSpecificSetting('padding', false)
  ↓
Output re-computed automatically via useEffect
  ↓
Tool displays with all settings restored
```

---

## Type Definitions (TypeScript)

All types should be defined in `src/types/tools.ts`:

```typescript
// src/types/tools.ts

export interface ToolGroup {
  id: string;
  name: string;
  items: ToolItem[];
  isExpanded?: boolean;
}

export interface ToolItem {
  id: string;
  name: string;
  path: string;
  groupId: string;
}

export interface ToolSettings {
  toolId: string;
  input: string;
  inputEncoding: 'utf-8' | 'ascii' | 'latin-1';
  toolSpecificSettings: Record<string, any>;
  output?: string;
}

export interface ShareLink {
  url: string;
  toolId: string;
  generatedAt: Date;
  settings: ToolSettings;
}

export interface URLParameters {
  input: string;
  input_encoding: string;
  [key: string]: string | boolean | number;
}

export interface SidebarState {
  [groupId: string]: boolean;
}

export interface ShareButtonState {
  isOpen: boolean;
  generatedUrl?: string;
  copiedRecently?: boolean;
}
```

---

## Configuration Data

### Tool Configuration

Located in `src/tools/index.ts` (existing file, to be extended):

```typescript
export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'base64',
    name: 'Base64',
    items: [
      { id: 'base64_encode', name: 'Encode', path: '/base64_encode', groupId: 'base64' },
      { id: 'base64_decode', name: 'Decode', path: '/base64_decode', groupId: 'base64' },
    ],
  },
  {
    id: 'base16',
    name: 'Base16',
    items: [
      { id: 'base16_encode', name: 'Encode', path: '/base16_encode', groupId: 'base16' },
      { id: 'base16_decode', name: 'Decode', path: '/base16_decode', groupId: 'base16' },
    ],
  },
  {
    id: 'base32',
    name: 'Base32',
    items: [
      { id: 'base32_encode', name: 'Encode', path: '/base32_encode', groupId: 'base32' },
      { id: 'base32_decode', name: 'Decode', path: '/base32_decode', groupId: 'base32' },
    ],
  },
];

// Tool-specific parameter definitions for URL serialization
export const TOOL_PARAMETERS: Record<string, string[]> = {
  base64_encode: ['input', 'input_encoding'],
  base64_decode: ['input', 'input_encoding'],
  base32_encode: ['input', 'input_encoding', 'padding'],
  base32_decode: ['input', 'input_encoding', 'padding'],
  base16_encode: ['input', 'input_encoding'],
  base16_decode: ['input', 'input_encoding'],
};
```

### URL Parameter Defaults

```typescript
export const DEFAULT_SETTINGS: Record<string, Partial<ToolSettings>> = {
  base64_encode: {
    toolId: 'base64_encode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  base32_decode: {
    toolId: 'base32_decode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: { padding: true },
  },
  // ... other tools
};
```

---

## Validation Rules

### Input Validation

1. **Input text**: Accept any UTF-8 string; max length 2000 characters (to keep URLs under limit)
2. **Input encoding**: Only accept 'utf-8', 'ascii', 'latin-1'; default to 'utf-8' if missing
3. **Tool-specific settings**: Validate type and range per tool (e.g., padding is boolean)

### URL Parameter Validation

```typescript
// In urlParameters.ts service
export function validateURLParameters(params: Record<string, any>): URLParameters {
  const validated: URLParameters = {
    input: '',
    input_encoding: 'utf-8',
  };

  // Validate input: must be valid Base64
  if (params.input) {
    try {
      atob(params.input); // Will throw if invalid Base64
      validated.input = params.input;
    } catch {
      // Invalid Base64 → use empty string default
      validated.input = '';
    }
  }

  // Validate input_encoding
  if (['utf-8', 'ascii', 'latin-1'].includes(params.input_encoding)) {
    validated.input_encoding = params.input_encoding;
  }

  // Validate tool-specific params
  if (typeof params.padding === 'string') {
    validated.padding = params.padding === 'true' ? 'true' : 'false';
  }

  return validated;
}
```

---

## Database Schema

**N/A** - No persistent storage required. All state is UI state or transient (share links are not stored).

---

## Summary

- **Minimal data model**: Only what's needed for sidebar organization, tool state, and URL parameters
- **UI state only**: No persistent domain state; sidebar expand/collapse is client-side only
- **Type-safe**: All structures defined in TypeScript with strict mode
- **Validation**: Input and URL parameters validated before use
- **No database**: Share links are stateless URLs; no backend storage required

---

**Next Phase**: Phase 1 - API Contracts & Quickstart
