# Data Model: UI/UX Refinement Feature

**Date**: 2025-10-29  
**Phase**: Phase 1 - Design & Contracts  
**Related**: `research.md` (design decisions), `spec.md` (requirements)

---

## Entity Definitions

### 1. Tool Entity (Updated for Separation)

**Description**: Represents a distinct tool in the platform (formerly single Base64 tool, now split into Encode/Decode)

#### Base64 Encode Tool
```typescript
interface Base64EncodeTool extends Tool {
  id: 'base64-encode';
  name: 'Base64 Encode';
  icon: '🔤';
  category: 'Encoders';
  description: 'Convert text to Base64 encoding';
  keywords: ['base64', 'encode', 'btoa', 'rfc4648', 'urlsafe'];
  priority: 1;
  service: Base64EncodeService;
}
```

#### Base64 Decode Tool
```typescript
interface Base64DecodeTool extends Tool {
  id: 'base64-decode';
  name: 'Base64 Decode';
  icon: '🔤';
  category: 'Encoders';
  description: 'Convert Base64 to text';
  keywords: ['base64', 'decode', 'atob', 'rfc4648', 'urlsafe'];
  priority: 2;
  service: Base64DecodeService;
}
```

**Relationships**:
- Tool → ToolService (1:1) - Each tool has one service
- Tool → ToolContext (N:1) - Multiple tools managed by single context
- Tool → Sidebar (N:1) - Multiple tools displayed in sidebar

**Validation Rules**:
- `id` must be unique (enforced by ToolRegistry)
- `name` required, non-empty string (1-100 chars)
- `icon` must be single emoji or Lucide icon name
- `category` must be pre-defined enum value
- `priority` must be positive integer (used for sidebar sorting)

---

### 2. Theme Entity

**Description**: Represents the application's color scheme and visual style

```typescript
interface Theme {
  mode: 'light' | 'dark';
  name: string;
  colors: ThemeColors;
  isDarkMode: boolean;
}

interface ThemeColors {
  background: string;
  foreground: string;
  border: string;
  accent: string;
  success: string;
  error: string;
}

// Concrete implementations
const LIGHT_THEME: Theme = {
  mode: 'light',
  name: 'Light',
  isDarkMode: false,
  colors: {
    background: '#FFFFFF',
    foreground: '#111827',
    border: '#E5E7EB',
    accent: '#3B82F6',
    success: '#10B981',
    error: '#EF4444'
  }
};

const DARK_THEME: Theme = {
  mode: 'dark',
  name: 'Dark',
  isDarkMode: true,
  colors: {
    background: '#111827',
    foreground: '#F3F4F6',
    border: '#374151',
    accent: '#60A5FA',
    success: '#4ADE80',
    error: '#F87171'
  }
};
```

**Relationships**:
- Theme → ThemeToggle (1:N) - One theme at a time, toggle switches
- Theme → localStorage (1:1) - Theme persists to storage

**Validation Rules**:
- `mode` must be 'light' OR 'dark' (enum, no 'system')
- `colors` must have all 6 required fields
- Color values must be valid hex codes (#RRGGBB format)

**Constraints**:
- Default theme on first load: LIGHT_THEME
- Only 2 valid themes (no 'system' or 'auto' mode)
- Theme change MUST persist to localStorage immediately

---

### 3. Tool Settings Entity (Base64-Specific Options)

**Description**: Configuration options for Base64 encode/decode operations

```typescript
interface Base64Settings {
  autoUpdate: boolean;        // Default: true
  inputEncoding: InputEncoding;
  format: Base64Format;
}

type InputEncoding = 'utf8' | 'ascii' | 'latin1';

interface InputEncodingOption {
  value: InputEncoding;
  label: string;
}

const INPUT_ENCODINGS: InputEncodingOption[] = [
  { value: 'utf8', label: 'UTF-8' },
  { value: 'ascii', label: 'ASCII' },
  { value: 'latin1', label: 'Latin-1 (ISO-8859-1)' }
];

type Base64Format = 'rfc4648' | 'urlsafe';

interface Base64FormatOption {
  value: Base64Format;
  label: string;
}

const BASE64_FORMATS: Base64FormatOption[] = [
  { value: 'rfc4648', label: 'RFC 4648 (standard)' },
  { value: 'urlsafe', label: 'URL-safe (no +/)' }
];
```

**Relationships**:
- Base64Settings → Base64EncodeService (1:1) - Options control encode behavior
- Base64Settings → Base64DecodeService (1:1) - Options control decode behavior
- Base64Settings → useTool hook (1:1) - Hook executes with these options

**Validation Rules**:
- `autoUpdate` must be boolean
- `inputEncoding` must be one of: 'utf8', 'ascii', 'latin1'
- `format` must be one of: 'rfc4648', 'urlsafe'

**Constraints**:
- `autoUpdate` defaults to `true` (enabled)
- `inputEncoding` defaults to 'utf8'
- `format` defaults to 'rfc4648'
- Settings are session-scoped (not persisted to localStorage)

---

### 4. Header Context Entity

**Description**: Manages header-level state (title, description) shared across components

```typescript
interface HeaderContext {
  title?: string;
  description?: string;
  setTitle: (title: string | undefined) => void;
  setDescription: (description: string | undefined) => void;
}

// Usage in tool component
interface HeaderState {
  // For Base64 Encode
  title: 'Base64 Encode';
  description: 'Convert text to Base64 encoding';
  
  // For Base64 Decode
  title: 'Base64 Decode';
  description: 'Convert Base64 to text';
}
```

**Relationships**:
- HeaderContext → Header component (1:1) - Header reads and displays
- HeaderContext → Tool components (N:1) - Multiple tools set title on mount
- HeaderContext → ToolContext (1:1) - Extends existing ToolContext

**Validation Rules**:
- `title` must be non-empty string (1-100 chars) or undefined
- `description` must be string (0-300 chars) or undefined

**Constraints**:
- `title` and `description` clear when tool changes
- Update happens in useEffect on tool mount
- Cleanup removes values on tool unmount

---

### 5. Execution Flow Entity

**Description**: Represents the state and flow of tool execution

```typescript
interface ExecutionFlow {
  toolId: 'base64-encode' | 'base64-decode';
  input: string;
  options: Base64Settings;
  state: ExecutionState;
  output?: string;
  error?: string;
  isExecuting: boolean;
  executionTime?: number;
}

type ExecutionState = 'idle' | 'validating' | 'executing' | 'success' | 'error';
```

**State Transitions**:
```
idle
  ↓ (user types or clicks button)
validating (input validation)
  ├→ error (invalid input) → [display error]
  ├→ idle (validation skipped)
  └→ executing (validation passed)
    ├→ success (execution succeeded) → [display output]
    └→ error (execution failed) → [display error]
```

**Key Behavior**:
- **With Auto-Update ON**:
  - State transitions: idle → validating → executing → success/error (200ms debounce)
  - Triggered on input/options change
- **With Auto-Update OFF**:
  - Remains in idle until button clicked
  - Button click triggers: idle → validating → executing → success/error

**Related Entities**:
- ExecutionFlow → useTool hook (1:1) - Hook manages flow state
- ExecutionFlow → Tool component (1:1) - Component renders based on state
- ExecutionFlow → ToolRegistry (N:1) - Registry executes tool

---

### 6. ToolOptions Component Settings Entity

**Description**: UI configuration for Settings accordion in tool content area

```typescript
interface ToolOptionsUIState {
  hasOptions: boolean;                    // Always true for Base64
  isExpanded: boolean;                    // True by default, user toggles
  optionsComponent: React.ComponentType;  // Base64OptionsComponent
}

// Component props
interface ToolOptionsProps {
  hasOptions: boolean;
  optionsComponent: React.ComponentType<ToolOptionsComponentProps>;
  options: Base64Settings;
  onOptionsChange: (options: Base64Settings) => void;
  onOptionChange: (key: keyof Base64Settings, value: any) => void;
  toolId: string;
}
```

**UI Behavior**:
- Accordion header: "Settings" (not "Options")
- Expanded by default (shows form fields)
- User can collapse/expand
- Form fields inside accordion:
  - Auto-Update toggle switch (checkbox + label)
  - Input Encoding dropdown
  - Format dropdown
  - Info text block (context-aware help)

**Relationships**:
- ToolOptionsUIState → Base64EncodeSettings (1:1)
- ToolOptionsUIState → Base64DecodeSettings (1:1)

---

### 7. Content Area Layout Entity

**Description**: Defines the responsive layout structure of tool content

```typescript
interface ContentAreaLayout {
  columns: LayoutColumn[];
  gaps: {
    columnGap: '16px';
    rowGap: '0px';
  };
  height: 'full';                         // Fills browser height
  padding: '0';                           // No top/bottom padding
}

interface LayoutColumn {
  name: 'Settings' | 'Input' | 'Output';
  width: 'calc(100% / 3)';                // 33.33% each
  components: string[];                  // Component names in column
  minHeight: 0;                           // Critical for flex/scroll
  overflow: 'auto';                       // If content exceeds height
}

// Desktop layout structure
const DESKTOP_LAYOUT: ContentAreaLayout = {
  columns: [
    {
      name: 'Settings',
      width: 'calc(100% / 3)',
      components: ['ToolOptions']
    },
    {
      name: 'Input',
      width: 'calc(100% / 3)',
      components: ['InputField', 'ExecuteButton']
    },
    {
      name: 'Output',
      width: 'calc(100% / 3)',
      components: ['OutputField', 'ActionButtons', 'ErrorDisplay']
    }
  ],
  gaps: { columnGap: '16px', rowGap: '0px' },
  height: 'full',
  padding: '0'
};
```

**CSS Classes Required**:
```css
.content-area {
  padding: 0;                 /* Remove top/bottom padding */
  height: calc(100vh - 56px); /* Fill browser minus header */
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  height: 100%;
  padding: 24px;              /* Padding inside grid, not on area */
}

.column {
  display: flex;
  flex-direction: column;
  min-height: 0;              /* Critical for flex children */
}

.input-field,
.output-field {
  flex: 1;                    /* Expand to fill column height */
  min-height: 200px;          /* Minimum for usability */
}
```

---

## State Management Architecture

### Context Hierarchy

```
App Root
├── ToolContext (existing, extended)
│   ├── selectedToolId: string
│   ├── headerTitle?: string (NEW)
│   ├── headerDescription?: string (NEW)
│   └── setters for all above
├── ThemeContext (if separate context, else in ToolContext)
│   ├── theme: 'light' | 'dark'
│   ├── setTheme: (theme) => void
│   └── colors: ThemeColors
└── ToastContext (existing, unchanged)
    ├── toasts: Toast[]
    ├── addToast: (message) => void
    └── removeToast: (id) => void
```

### Component State Flow

```
Header Component
├── Reads: headerTitle, headerDescription (from ToolContext)
├── Reads: theme (from ThemeContext)
├── Manages: none (presentational)
└── Actions: onThemeToggle()

Sidebar Component
├── Reads: selectedToolId, tools list (from ToolRegistry + ToolContext)
├── Manages: none
└── Actions: onToolSelect()

Base64EncodeTool Component
├── Reads: autoUpdate (session state)
├── Manages: localInput, localOptions, execution state
├── Sets: headerTitle, headerDescription (on mount)
├── Calls: execute() in useTool hook
└── Actions: handleInputChange(), handleOptionChange(), handleExecute()

ToolOptions Component
├── Reads: options (from parent)
├── Manages: none (controlled component)
└── Props: onOptionChange()
```

---

## Data Persistence Strategies

### localStorage Keys

```typescript
// Theme (persisted)
localStorage['theme'] // 'light' or 'dark'

// Settings (NOT persisted - session-scoped)
// Auto-update, Encoding, Format are held in component state only
// Intentional: User decisions reset on page reload
```

### Memory/Session Storage

```typescript
// useTool hook maintains
currentInput: string;      // In-memory during session
currentOptions: Settings;  // In-memory during session
executionState: State;     // In-memory during session

// On page reload: all reset to defaults
```

---

## Validation & Constraints

### Input Validation
- Base64 Encode input: Any string (0-10MB, configurable)
- Base64 Decode input: Valid Base64 string (RFC 4648 or URL-safe)

### Output Constraints
- Base64 Encode output: Valid Base64 (includes +, / or -, _ depending on format)
- Base64 Decode output: Decoded string in selected input encoding

### UI Constraints
- Header title: 1-100 characters
- Settings options: Only valid enum values
- Auto-update: Boolean only

### Performance Constraints
- Debounce delay: 200ms (fixed, not user-configurable)
- Max input size: 10MB (configurable, not in MVP)
- Execution timeout: 5s (configurable, not in MVP)

---

## Relationships Summary

```
┌─────────────────────────────────────────────────┐
│              Application State                   │
├─────────────────────────────────────────────────┤
│                                                   │
│  Theme ──────────┐                              │
│  (light/dark)    │                              │
│                  ↓                              │
│            Header Component                     │
│            (displays title)  ←─ HeaderContext   │
│                                (from Tool)      │
│                                                   │
│  ToolRegistry ──→ Sidebar ←─── ToolContext     │
│  (lists tools)    (displays)   (selectedId)    │
│       ↓                              ↓          │
│  Base64EncodeTool            Base64DecodeTool  │
│       │                              │          │
│       └──→ ToolOptions (Settings)    │         │
│       │    • Auto-Update toggle      │         │
│       │    • Input Encoding          │         │
│       │    • Format selection        │         │
│       │                              │         │
│       └──→ InputField ←── useTool hook         │
│       │    • On change               │         │
│       │    • Triggers execute() ────→│         │
│       │       (if auto-update ON)    │         │
│       │                              │         │
│       └──→ OutputField (displays result)       │
│            • Result or error                   │
│            • Copy button                       │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Summary of Changes to Existing Entities

### Tool Entity
- **Split**: 1 Base64 Tool → 2 separate tools (Encode, Decode)
- **Same Icon**: Both use 🔤
- **Different Services**: Separate service classes (with shared base)

### ToolContext (Extended)
- **Add**: `headerTitle`, `headerDescription` fields
- **Add**: `setHeaderTitle()`, `setHeaderDescription()` methods
- **Preserve**: All existing fields and methods

### Theme System (Refined)
- **Constraint**: Exactly 2 modes (light/dark, no 'system')
- **Default**: Light theme on first load
- **Persist**: To localStorage (existing behavior)

### Settings UI (Renamed & Enhanced)
- **Rename**: "Options" → "Settings" (terminology)
- **Add**: Auto-Update toggle (Boolean field)
- **Add**: Input Encoding dropdown (3 options)
- **Add**: Format dropdown (2 options)

### Content Area (Refined)
- **Remove**: Top/bottom padding (full-height layout)
- **Add**: CSS `min-height: 0` on columns (flex children)
- **Expand**: Columns to fill available height

---

**Status**: ✅ Phase 1 Data Model Complete  
**Next**: API Contracts / Quickstart

