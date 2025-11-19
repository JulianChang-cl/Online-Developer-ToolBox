# API Contracts for Online Tools Platform

**Created**: 2025-10-28  
**Purpose**: Document expected input/output contracts for each tool

These contracts serve as the specification for tool services and are the basis
for contract tests. They document what each tool MUST do.

## Base64 Service Contract

**File**: `tests/contract/base64-contract.test.ts`

```typescript
interface Base64Contract {
  name: "Base64 Service";
  description: "Encode and decode text using Base64 format";
  
  testCases: [
    {
      id: "base64_encode_simple",
      name: "Encode simple ASCII text",
      operation: "encode",
      input: "Hello, World!",
      options: { variant: "standard", padding: true },
      expectedOutput: "SGVsbG8sIFdvcmxkIQ==",
      expectedTime: { max: 50 } // milliseconds
    },
    {
      id: "base64_decode_simple",
      name: "Decode standard Base64",
      operation: "decode",
      input: "SGVsbG8sIFdvcmxkIQ==",
      expectedOutput: "Hello, World!",
      expectedTime: { max: 50 }
    },
    {
      id: "base64_encode_empty",
      name: "Encode empty string",
      operation: "encode",
      input: "",
      expectedOutput: "",
      expectedTime: { max: 10 }
    },
    {
      id: "base64_decode_empty",
      name: "Decode empty string",
      operation: "decode",
      input: "",
      expectedOutput: "",
      expectedTime: { max: 10 }
    },
    {
      id: "base64_encode_special_chars",
      name: "Encode text with special characters",
      operation: "encode",
      input: "!@#$%^&*()",
      expectedOutput: "IUAjJCVeJiooKQ==",
      expectedTime: { max: 50 }
    },
    {
      id: "base64_encode_unicode",
      name: "Encode Unicode characters (emoji)",
      operation: "encode",
      input: "Hello 👋",
      expectedOutput: "SGVsbG8g8J+Viw==",
      expectedTime: { max: 50 }
    },
    {
      id: "base64_decode_invalid",
      name: "Decode invalid Base64 (odd length)",
      operation: "decode",
      input: "!!!invalid!!!",
      expectError: {
        code: "INVALID_BASE64",
        message: /invalid|malformed|incorrect/i
      }
    },
    {
      id: "base64_encode_large",
      name: "Encode 100KB input",
      operation: "encode",
      input: "x".repeat(100_000),
      expectedTime: { max: 50 }
      // Output should be ~133KB
    },
    {
      id: "base64_url_safe",
      name: "Encode URL-safe Base64",
      operation: "encode",
      input: "?>&<",
      options: { variant: "url-safe" },
      expectedOutput: "Pz4_PA==" // Note: - and _ instead of + and /
    }
  ]
}
```

## JSON Validator Service Contract

**File**: `tests/contract/json-validator-contract.test.ts`

```typescript
interface JsonValidatorContract {
  name: "JSON Validator Service";
  description: "Validate and format JSON text";
  
  testCases: [
    {
      id: "json_valid_simple",
      name: "Validate simple valid JSON",
      input: '{"name":"John","age":30}',
      expectedResult: { valid: true, errors: [] }
    },
    {
      id: "json_valid_array",
      name: "Validate valid JSON array",
      input: '[1,2,3,{"key":"value"}]',
      expectedResult: { valid: true, errors: [] }
    },
    {
      id: "json_valid_null",
      name: "Validate null value",
      input: 'null',
      expectedResult: { valid: true, errors: [] }
    },
    {
      id: "json_invalid_trailing_comma",
      name: "Reject trailing comma",
      input: '{"key":"value",}',
      expectedResult: {
        valid: false,
        errors: [{
          line: 1,
          column: 16,
          message: /trailing comma|unexpected/i
        }]
      }
    },
    {
      id: "json_invalid_single_quotes",
      name: "Reject single quotes",
      input: "{'key':'value'}",
      expectedResult: {
        valid: false,
        errors: [{ line: 1, column: 2 }]
      }
    },
    {
      id: "json_invalid_missing_quote",
      name: "Detect missing closing quote",
      input: '{"key: "value"}',
      expectedResult: {
        valid: false,
        errors: [{ line: 1 }]
      }
    },
    {
      id: "json_format_2space",
      name: "Format with 2-space indent",
      input: '{"a":1,"b":2}',
      options: { indent: 2 },
      expectedOutput: '{\n  "a": 1,\n  "b": 2\n}',
      expectedTime: { max: 100 }
    },
    {
      id: "json_format_4space",
      name: "Format with 4-space indent",
      input: '{"a":1}',
      options: { indent: 4 },
      expectedOutput: '{\n    "a": 1\n}',
      expectedTime: { max: 100 }
    },
    {
      id: "json_format_tabs",
      name: "Format with tab indent",
      input: '{"a":{"b":1}}',
      options: { indent: "tab" },
      expectedOutput: '{\n\t"a": {\n\t\t"b": 1\n\t}\n}',
      expectedTime: { max: 100 }
    },
    {
      id: "json_large",
      name: "Validate and format 1MB JSON",
      input: "[" + "{\"x\":1},".repeat(10_000) + "{\"x\":1}]",
      expectedTime: { max: 100 },
      expectedResult: { valid: true, errors: [] }
    }
  ]
}
```

## Encryption Service Contract

**File**: `tests/contract/encryption-contract.test.ts`

```typescript
interface EncryptionContract {
  name: "Encryption Service";
  description: "Encode text using various encryption/encoding methods";
  
  testCases: [
    {
      id: "hex_encode_ascii",
      name: "Hex encode ASCII text",
      operation: "hex",
      action: "encode",
      input: "Hello",
      expectedOutput: "48656c6c6f"
    },
    {
      id: "hex_decode_hex",
      name: "Hex decode to text",
      operation: "hex",
      action: "decode",
      input: "48656c6c6f",
      expectedOutput: "Hello"
    },
    {
      id: "hex_uppercase",
      name: "Hex encode with uppercase",
      operation: "hex",
      action: "encode",
      input: "test",
      options: { uppercase: true },
      expectedOutput: "74657374"
    },
    {
      id: "hex_with_spacing",
      name: "Hex encode with colon spacing",
      operation: "hex",
      action: "encode",
      input: "AB",
      options: { spacing: ":" },
      expectedOutput: "41:42"
    },
    {
      id: "caesar_shift_3",
      name: "Caesar cipher with shift 3",
      operation: "caesar",
      action: "encode",
      input: "Hello",
      options: { shiftAmount: 3 },
      expectedOutput: "Khoor"
    },
    {
      id: "caesar_decode",
      name: "Caesar cipher decode (reverse shift)",
      operation: "caesar",
      action: "decode",
      input: "Khoor",
      options: { shiftAmount: 3 },
      expectedOutput: "Hello"
    },
    {
      id: "rot13_encode",
      name: "ROT13 encoding",
      operation: "rot13",
      action: "encode",
      input: "abcxyz",
      expectedOutput: "nopklm"
    },
    {
      id: "rot13_reversible",
      name: "ROT13 is reversible",
      operation: "rot13",
      action: "encode",
      input: "nopklm",
      expectedOutput: "abcxyz"
    },
    {
      id: "url_encode",
      name: "URL encode special characters",
      operation: "url",
      action: "encode",
      input: "hello world?key=value",
      expectedOutput: "hello%20world%3Fkey%3Dvalue"
    },
    {
      id: "url_decode",
      name: "URL decode percent encoding",
      operation: "url",
      action: "decode",
      input: "hello%20world",
      expectedOutput: "hello world"
    }
  ]
}
```

## Theme & Storage Contract

**File**: `tests/contract/storage-contract.test.ts`

```typescript
interface StorageContract {
  name: "Storage Service";
  description: "Persist user preferences and state to localStorage";
  
  testCases: [
    {
      id: "storage_set_theme",
      name: "Set theme preference",
      action: "setTheme",
      input: "dark",
      expectedResult: { success: true }
    },
    {
      id: "storage_get_theme",
      name: "Get stored theme preference",
      prerequisites: ["storage_set_theme"],
      action: "getTheme",
      expectedOutput: "dark"
    },
    {
      id: "storage_theme_persistence",
      name: "Theme persists across page reload",
      action: "persistence",
      steps: [
        { action: "setTheme", value: "dark" },
        { action: "reloadPage" },
        { action: "getTheme", expectedOutput: "dark" }
      ]
    },
    {
      id: "storage_get_missing_theme",
      name: "Get theme when not set returns null",
      action: "getTheme",
      expectedOutput: null
    },
    {
      id: "storage_set_preferences",
      name: "Store user preferences",
      action: "setPreferences",
      input: { autoUpdate: true, fontSize: "large" },
      expectedResult: { success: true }
    },
    {
      id: "storage_get_preferences",
      name: "Retrieve stored preferences",
      prerequisites: ["storage_set_preferences"],
      action: "getPreferences",
      expectedOutput: { autoUpdate: true, fontSize: "large" }
    },
    {
      id: "storage_quota_exceeded",
      name: "Handle localStorage quota exceeded",
      action: "setPreferences",
      input: { largeData: "x".repeat(10_000_000) },
      expectError: { code: "QUOTA_EXCEEDED_ERR" },
      expectedBehavior: "Graceful error handling"
    },
    {
      id: "storage_disabled",
      name: "Handle localStorage disabled",
      setup: { disableStorage: true },
      action: "setTheme",
      expectedBehavior: "Falls back to memory storage or returns error"
    }
  ]
}
```

## UI Component Contracts

**File**: `tests/contract/ui-contract.test.ts`

```typescript
interface UIComponentContract {
  name: "UI Component Contracts";
  description: "Component interaction and rendering specifications";
  
  components: [
    {
      name: "InputField",
      description: "Text input with optional validation",
      behavior: {
        onChange: "Calls onchange handler when user types",
        onClear: "Clears input when X button clicked",
        validation: "Shows error message if provided",
        accessibility: "Has label, ARIA attributes"
      }
    },
    {
      name: "OutputField",
      description: "Read-only text display with copy button",
      behavior: {
        readOnly: "User cannot directly edit",
        copy: "Copies content to clipboard on click",
        feedback: "Shows 'Copied!' confirmation for 2 seconds",
        selection: "Content selectable for manual copy"
      }
    },
    {
      name: "CopyButton",
      description: "Clipboard copy with feedback",
      behavior: {
        onClick: "Copies provided text to clipboard",
        feedback: "Shows 'Copied!' message for 2 seconds",
        keyboard: "Accessible via keyboard (Tab, Enter)"
      }
    },
    {
      name: "ThemeToggle",
      description: "Light/dark mode switch",
      behavior: {
        click: "Toggles theme between light and dark",
        persistence: "Theme preference saved to localStorage",
        instant: "Theme changes appear within 50ms (no flicker)",
        icon: "Shows sun/moon icon indicating current mode"
      }
    },
    {
      name: "Sidebar",
      description: "Tool navigation list",
      behavior: {
        display: "Shows all available tools with icons",
        selection: "Clicking tool loads it in main area",
        active: "Current tool highlighted distinctly",
        responsive: "Collapsible on mobile (<768px)"
      }
    }
  ]
}
```

## Tool Registry Contract

**File**: `tests/contract/tool-registry-contract.test.ts`

```typescript
interface ToolRegistryContract {
  name: "Tool Registry Service";
  description: "Central registry for managing all tools";
  
  testCases: [
    {
      id: "registry_register_tool",
      name: "Register a tool in the registry",
      action: "register",
      input: { id: "base64", name: "Base64", ...toolConfig },
      expectedResult: { success: true }
    },
    {
      id: "registry_get_tool",
      name: "Retrieve registered tool",
      prerequisites: ["registry_register_tool"],
      action: "getTool",
      input: "base64",
      expectedOutput: { id: "base64", name: "Base64", ... }
    },
    {
      id: "registry_execute_tool",
      name: "Execute tool through registry",
      prerequisites: ["registry_register_tool"],
      action: "execute",
      input: {
        toolId: "base64",
        input: "Hello",
        options: { operation: "encode" }
      },
      expectedOutput: {
        success: true,
        output: "SGVsbG8=",
        executionTime: { max: 100 }
      }
    },
    {
      id: "registry_list_tools",
      name: "List all registered tools",
      action: "listTools",
      expectedOutput: [
        { id: "base64", name: "Base64", ... },
        { id: "json-validator", name: "JSON Validator", ... },
        // ... more tools
      ]
    },
    {
      id: "registry_nonexistent_tool",
      name: "Handle requesting non-existent tool",
      action: "getTool",
      input: "nonexistent",
      expectError: { code: "TOOL_NOT_FOUND" }
    }
  ]
}
```

---

## How to Use These Contracts

### During Development

1. **Before Implementation**: Use contract as test specification
   ```bash
   npm test -- base64-contract.test.ts
   # Initially FAILS (Red)
   ```

2. **Implement Code**: Write service to pass contract tests
   ```typescript
   // Implement base64.ts to satisfy all contract test cases
   ```

3. **Verify Contract**: Run tests again
   ```bash
   npm test -- base64-contract.test.ts
   # Now PASSES (Green)
   ```

### Documentation

Contracts serve as executable documentation:
- Shows what each tool is expected to do
- Documents error conditions and edge cases
- Specifies performance requirements
- Provides test cases for regression prevention

### Future Tool Addition

When adding new tools in v2+:
1. Create contract specification
2. Write contract tests (FIRST)
3. Implement service to pass tests
4. No surprises - behavior is documented upfront

---

## Notes

- All timings in contracts are maximum thresholds for performance verification
- Error codes should match expected codes in tests
- Contract tests should NOT change after implementation (frozen spec)
- If contract needs updating, that's a MINOR version bump (per constitution)
- Keep contracts readable and maintainable for future developers

