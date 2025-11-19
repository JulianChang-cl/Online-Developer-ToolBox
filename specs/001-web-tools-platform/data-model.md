# Data Model & Architecture: Online Tools Platform

**Created**: 2025-10-28  
**Feature**: `001-web-tools-platform`

## Core Data Models

### Tool Registry

Each tool in the platform is registered with metadata describing its capabilities.

```typescript
interface Tool {
  id: string;                    // Unique identifier: "base64", "json-validator", etc.
  name: string;                  // Display name: "Base64 Encode/Decode"
  category: "encoding" | "validation" | "encryption" | "conversion";
  description: string;           // Brief description of what tool does
  icon: string;                  // Icon name or emoji
  shortcut?: string;             // Keyboard shortcut (e.g., "Ctrl+B")
  defaultOptions: ToolOptions;   // Default settings for this tool
  service: ToolService;          // Reference to service implementation
}

interface ToolOptions {
  [key: string]: string | number | boolean;
  // Examples:
  // { operation: "encode", format: "standard" }
  // { indentation: 2, validate: true }
}
```

### Tool Execution Contract

Every tool exposes a consistent interface for execution.

```typescript
interface ToolService {
  execute(input: string, options: ToolOptions): ToolResult;
  validate(input: string): ValidationResult;
  getMetadata(): ToolMetadata;
}

interface ToolResult {
  success: boolean;
  output?: string;
  error?: ToolError;
  executionTime: number;        // milliseconds
  inputSize: number;            // bytes
  outputSize: number;           // bytes
  metadata?: Record<string, any>;
}

interface ToolError {
  code: string;                  // "INVALID_BASE64", "JSON_SYNTAX_ERROR", etc.
  message: string;               // User-friendly error message
  details?: {
    line?: number;
    column?: number;
    context?: string;            // Snippet of problematic input
  };
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

interface ToolMetadata {
  version: string;
  supportedOperations: string[];
  options: OptionDefinition[];
}

interface OptionDefinition {
  name: string;
  type: "select" | "toggle" | "number" | "text";
  label: string;
  defaultValue: any;
  values?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
}
```

### Execution Result & UI State

```typescript
interface ExecutionState {
  toolId: string;
  input: string;
  options: ToolOptions;
  result: ToolResult | null;
  loading: boolean;
  error: ToolError | null;
  lastExecuted: Date | null;
  isDirty: boolean;              // Input changed since last execution
}

interface ShareableState {
  toolId: string;
  input: string;
  options: ToolOptions;
  timestamp: number;
  version: string;               // For backward compatibility
}
```

### User Preferences & Theme

```typescript
interface UserPreferences {
  theme: "light" | "dark" | "auto";
  autoUpdate: boolean;
  defaultFormat?: string;
  recentTools: string[];         // Last 5 tools accessed
  favoriteTools: string[];       // User-marked favorites
  copyFeedbackDuration: number;  // Milliseconds, default 2000
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;          // Reduce spacing for power users
}

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
  };
}
```

## Tool Specifications

### 1. Base64 Encode/Decode Tool

```typescript
// Service: base64.ts
interface Base64Options extends ToolOptions {
  operation: "encode" | "decode";
  variant: "standard" | "url-safe";
  lineBreaks?: boolean;          // RFC 2045 line breaks at 76 chars
  padding?: boolean;             // Include or strip padding
}

// Example execution:
const result = base64Service.execute(
  "Hello, World!",
  { operation: "encode", variant: "standard", padding: true }
);
// Output: "SGVsbG8sIFdvcmxkIQ=="

// Error handling:
// Invalid Base64 input → INVALID_BASE64 error with corrected input suggestion
// Non-UTF8 bytes → ENCODING_ERROR with note about raw bytes
```

### 2. JSON Validator & Formatter

```typescript
interface JsonValidatorOptions extends ToolOptions {
  indent: 2 | 4 | "tab";
  sortKeys?: boolean;
  stripWhitespace?: boolean;
}

// Example execution:
const result = jsonService.execute(
  '{"name":"John","age":30}',
  { indent: 2, sortKeys: false }
);
// Output: (formatted with 2-space indent)
// {
//   "name": "John",
//   "age": 30
// }

// Validation with error reporting:
// Returns { valid: false, errors: [{ line: 1, column: 5, message: "..." }] }
```

### 3. Encryption/Encoding Tool

```typescript
interface EncryptionOptions extends ToolOptions {
  method: "hex" | "caesar" | "rot13" | "url-encoding";
  shiftAmount?: number;          // For Caesar/ROT13
  uppercase?: boolean;           // For hex output
  spacing?: "" | " " | ":";      // For hex output
}

// Caesar Cipher:
// input: "Hello", shiftAmount: 3 → "Khoor"

// Hex encoding:
// input: "Hello", uppercase: true, spacing: ":" → "48:65:6C:6C:6F"
```

### 4. Converter Tools

```typescript
interface ConverterOptions extends ToolOptions {
  conversionType: "text-to-binary" | "text-to-unicode" | "timestamp-to-date";
  outputFormat?: string;
}

// Will be expanded based on usage feedback
```

## Architecture Patterns

### Tool Factory Pattern

All tools are created through a consistent factory:

```typescript
class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }

  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  execute(toolId: string, input: string, options: ToolOptions): ToolResult {
    const tool = this.getTool(toolId);
    if (!tool) throw new Error(`Tool not found: ${toolId}`);

    const startTime = performance.now();
    const result = tool.service.execute(input, options);
    result.executionTime = performance.now() - startTime;
    return result;
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }
}
```

### State Management Pattern

Simple Context-based state management for MVP:

```typescript
interface ToolContextValue {
  currentTool: Tool | null;
  executionState: ExecutionState;
  preferences: UserPreferences;
  
  selectTool(toolId: string): void;
  updateInput(input: string): void;
  updateOptions(options: ToolOptions): void;
  executeTool(): Promise<void>;
  generateShareLink(): string;
  updatePreferences(prefs: Partial<UserPreferences>): void;
}
```

### Storage Contract

```typescript
interface StorageService {
  // Theme
  setTheme(theme: "light" | "dark"): void;
  getTheme(): "light" | "dark" | null;

  // Preferences
  setPreferences(prefs: UserPreferences): void;
  getPreferences(): UserPreferences | null;

  // History (for future enhancement)
  addToHistory(execution: ExecutionState): void;
  getHistory(toolId?: string): ExecutionState[];
  clearHistory(): void;
}
```

## Contract Examples

### Base64 Service Contract

```json
{
  "service": "base64",
  "testCases": [
    {
      "name": "Encode simple text",
      "operation": "encode",
      "input": "Hello, World!",
      "options": { "variant": "standard", "padding": true },
      "expectedOutput": "SGVsbG8sIFdvcmxkIQ=="
    },
    {
      "name": "Decode standard Base64",
      "operation": "decode",
      "input": "SGVsbG8sIFdvcmxkIQ==",
      "expectedOutput": "Hello, World!"
    },
    {
      "name": "Handle invalid Base64",
      "operation": "decode",
      "input": "!!!invalid!!!",
      "expectError": "INVALID_BASE64"
    },
    {
      "name": "URL-safe variant",
      "operation": "encode",
      "input": "?>&<",
      "options": { "variant": "url-safe" },
      "expectedOutput": "Pz4_PA=="
    }
  ]
}
```

### JSON Validator Contract

```json
{
  "service": "jsonValidator",
  "testCases": [
    {
      "name": "Valid JSON",
      "input": "{\"key\": \"value\"}",
      "expectedResult": { "valid": true }
    },
    {
      "name": "Invalid JSON - missing quote",
      "input": "{\"key: \"value\"}",
      "expectedError": {
        "line": 1,
        "column": 6,
        "message": "Unterminated string"
      }
    },
    {
      "name": "Format with indentation",
      "input": "{\"a\":1,\"b\":2}",
      "options": { "indent": 2 },
      "expectedOutput": "{\n  \"a\": 1,\n  \"b\": 2\n}"
    }
  ]
}
```

## API/UI Boundary

### Input to Output Flow

```
User Input → Validation → Tool Service → Formatting → Display
    ↓
 Debounce (200ms) if auto-update enabled
    ↓
Error Boundary catches exceptions
    ↓
Result displayed with metadata (execution time, sizes)
```

### Error Handling Strategy

1. **Validation Error**: Caught before service execution, shown immediately
2. **Service Error**: Caught during execution, formatted with user guidance
3. **Unknown Error**: Logged to console, user sees generic error message
4. **Performance Warning**: If execution > 500ms, show warning about large input

## Future Extensibility

### Adding New Tools

1. Create service file: `src/services/newTool.ts`
2. Implement `ToolService` interface
3. Create contract tests
4. Create React component: `src/components/Tools/NewTool.tsx`
5. Register in `ToolRegistry`
6. Add to Sidebar navigation

This structure allows new tools to be added without modifying existing code.

