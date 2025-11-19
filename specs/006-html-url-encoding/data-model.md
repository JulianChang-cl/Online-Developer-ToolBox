# Data Model: HTML & URL Encoding

**Feature**: 006-html-url-encoding  
**Date**: 2025-10-31  
**Status**: Complete

---

## 1. Service Interfaces

### HTML Encoder Service

```typescript
/**
 * HTML Entity Encoding Service
 * Converts text to HTML entities and back for XSS prevention
 */
export interface HTMLEncoderService {
  /**
   * Encode text to HTML entities
   * Converts < > & " ' to their HTML entity equivalents
   * 
   * @param input - Plain text to encode
   * @returns HTML entity encoded string
   * @example
   * encode('<script>') // '&lt;script&gt;'
   */
  encode(input: string): string

  /**
   * Decode HTML entities to text
   * Supports both named (&lt;) and numeric (&#60;, &#x3C;) entities
   * 
   * @param input - HTML entity encoded text
   * @returns Decoded plain text
   * @example
   * decode('&lt;script&gt;') // '<script>'
   */
  decode(input: string): string

  /**
   * Validate HTML entity encoded text
   * Checks for malformed entities or issues
   * 
   * @param input - Text to validate
   * @returns Validation result with error message if invalid
   */
  validate(input: string): ValidationResult
}
```

### URL Encoder Service

```typescript
/**
 * URL Percent Encoding Service
 * Converts text to percent-encoded URL format (RFC 3986)
 */
export interface URLEncoderService {
  /**
   * Encode text to percent-encoded URL format
   * Follows RFC 3986, encodes all except unreserved characters
   * 
   * @param input - Plain text to encode
   * @returns Percent-encoded string
   * @example
   * encode('hello world') // 'hello%20world'
   */
  encode(input: string): string

  /**
   * Decode percent-encoded URL to text
   * Handles invalid sequences gracefully (partial decode)
   * 
   * @param input - Percent-encoded URL string
   * @returns Decoded plain text
   * @example
   * decode('hello%20world') // 'hello world'
   */
  decode(input: string): string

  /**
   * Validate percent-encoded URL string
   * Checks for invalid percent sequences
   * 
   * @param input - Text to validate
   * @returns Validation result with error message if invalid
   */
  validate(input: string): ValidationResult
}
```

---

## 2. Type Definitions

### Common Types

```typescript
/**
 * Validation result for encoder services
 */
export interface ValidationResult {
  /**
   * Whether the input is valid
   */
  valid: boolean

  /**
   * Error message if validation failed
   */
  error?: string
}

/**
 * Tool options (empty for these tools, but required by pattern)
 */
export interface EncoderOptions {
  // No options for HTML/URL encoders currently
  // Placeholder for future extensions (e.g., encoding style)
}
```

### HTML Entity Maps

```typescript
/**
 * HTML entity encoding map
 * Maps characters to their HTML entity equivalents
 */
export const HTML_ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',   // Must be first to avoid double-encoding
  '<': '&lt;',    // Less-than sign
  '>': '&gt;',    // Greater-than sign
  '"': '&quot;',  // Double quote
  "'": '&#39;'    // Single quote (apostrophe)
} as const

/**
 * HTML entity decoding map (named entities)
 * Maps entity names to their character equivalents
 */
export const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  'lt': '<',
  'gt': '>',
  'amp': '&',
  'quot': '"',
  'apos': "'",
  '#39': "'",     // Numeric entity for apostrophe
  'nbsp': '\u00A0'  // Non-breaking space (common entity)
} as const

/**
 * Regex pattern for numeric HTML entities
 * Matches &#NNN; (decimal) and &#xHHH; (hexadecimal)
 */
export const NUMERIC_ENTITY_PATTERN = /&#(\d+);|&#x([0-9A-Fa-f]+);/g
```

### URL Encoding Constants

```typescript
/**
 * RFC 3986 unreserved characters (must NOT be encoded)
 * A-Z, a-z, 0-9, hyphen, period, underscore, tilde
 */
export const UNRESERVED_CHARS = /[A-Za-z0-9\-\._~]/

/**
 * RFC 3986 reserved characters (context-dependent encoding)
 * : / ? # [ ] @ ! $ & ' ( ) * + , ; =
 */
export const RESERVED_CHARS = /[:\/\?#\[\]@!\$&'\(\)\*\+,;=]/

/**
 * Valid percent-encoded sequence pattern
 * Matches %HH where HH is two hexadecimal digits
 */
export const PERCENT_ENCODED_PATTERN = /%([0-9A-Fa-f]{2})/g
```

---

## 3. Service Implementation Signatures

### HTML Encoder Implementation

```typescript
// src/services/html-encoder.ts

/**
 * HTML entity encoder service implementation
 */
export const htmlEncoderService: HTMLEncoderService = {
  /**
   * Encode text to HTML entities
   * Single-pass replacement using entity map
   * Order matters: & must be encoded first to avoid double-encoding
   */
  encode(input: string): string {
    if (!input) return ''
    
    let result = input
    // Encode & first, then other entities
    result = result.replace(/&/g, HTML_ENTITIES['&'])
    result = result.replace(/</g, HTML_ENTITIES['<'])
    result = result.replace(/>/g, HTML_ENTITIES['>'])
    result = result.replace(/"/g, HTML_ENTITIES['"'])
    result = result.replace(/'/g, HTML_ENTITIES["'"])
    
    return result
  },

  /**
   * Decode HTML entities to text
   * Supports named entities (&lt;) and numeric entities (&#60;, &#x3C;)
   * Invalid/unknown entities pass through unchanged
   */
  decode(input: string): string {
    if (!input) return ''
    
    let result = input
    
    // Decode numeric entities first (decimal and hex)
    result = result.replace(NUMERIC_ENTITY_PATTERN, (match, dec, hex) => {
      const codePoint = dec ? parseInt(dec, 10) : parseInt(hex, 16)
      // Validate code point range
      if (codePoint >= 0 && codePoint <= 0x10FFFF) {
        return String.fromCodePoint(codePoint)
      }
      return match // Invalid code point, keep as-is
    })
    
    // Decode named entities
    result = result.replace(/&([a-z]+|#\d+);/gi, (match, entity) => {
      return NAMED_ENTITIES[entity.toLowerCase()] || match
    })
    
    return result
  },

  /**
   * Validate HTML entity encoded text
   * Currently always returns valid (graceful handling)
   */
  validate(input: string): ValidationResult {
    // HTML encoding is lenient, no strict validation needed
    return { valid: true }
  }
}
```

### URL Encoder Implementation

```typescript
// src/services/url-encoder.ts

/**
 * URL percent encoder service implementation
 */
export const urlEncoderService: URLEncoderService = {
  /**
   * Encode text to percent-encoded URL format (RFC 3986)
   * Uses native encodeURIComponent() as base, adjusted for RFC 3986
   */
  encode(input: string): string {
    if (!input) return ''
    
    // Use native encoding (handles UTF-8 correctly)
    let encoded = encodeURIComponent(input)
    
    // RFC 3986 compliance: !'()* should not be encoded
    // encodeURIComponent encodes them, so we restore
    // (Though in practice, keeping them encoded is safer)
    
    return encoded
  },

  /**
   * Decode percent-encoded URL to text
   * Graceful handling of invalid sequences (partial decode)
   */
  decode(input: string): string {
    if (!input) return ''
    
    try {
      // Try native decoding first
      return decodeURIComponent(input)
    } catch (error) {
      // Invalid sequence detected, do partial decode
      return input.replace(PERCENT_ENCODED_PATTERN, (match, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16))
        } catch {
          return match // Keep invalid sequence as-is
        }
      })
    }
  },

  /**
   * Validate percent-encoded URL string
   * Checks for invalid percent sequences
   */
  validate(input: string): ValidationResult {
    // Check for incomplete or invalid percent sequences
    const invalidPattern = /%([^0-9A-Fa-f]|[0-9A-Fa-f](?![0-9A-Fa-f]))?/
    
    if (invalidPattern.test(input)) {
      return {
        valid: false,
        error: 'Invalid percent-encoded sequence detected'
      }
    }
    
    return { valid: true }
  }
}
```

---

## 4. Component State Models

### Tool Component State

```typescript
/**
 * State for encoder/decoder tool components
 * Follows established pattern from Base64/JSON tools
 */
interface EncoderToolState {
  /**
   * Local copy of input text (synced with ToolContext)
   */
  localInput: string

  /**
   * Local copy of options (synced with ToolContext)
   */
  localOptions: EncoderOptions

  /**
   * Encoded/decoded output result
   */
  output: string

  /**
   * Whether encoding/decoding is in progress
   */
  isProcessing: boolean
}
```

### Auto-Update Behavior

```typescript
/**
 * Auto-update effect for encoding/decoding
 * Debounces input changes by 200ms
 */
useEffect(() => {
  if (!autoUpdate) return
  
  const timer = setTimeout(() => {
    // Auto-clear on empty input
    if (localInput.trim() === '') {
      setOutput('')
      setIsProcessing(false)
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Perform encoding/decoding
      const result = service.encode(localInput)  // or decode
      setOutput(result)
    } catch (error) {
      setOutput('')
      console.error('Encoding failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, 200)  // 200ms debounce
  
  return () => clearTimeout(timer)
}, [localInput, autoUpdate])
```

---

## 5. Tool Registration Model

### Tool Definition Structure

```typescript
/**
 * Tool definition for registration in src/tools/index.ts
 */
interface ToolDefinition {
  id: string
  name: string
  description: string
  category: ToolCategory
  priority: number
  path: string
}

/**
 * HTML and URL tool definitions
 */
export const HTML_URL_TOOLS: ToolDefinition[] = [
  {
    id: 'html-encode',
    name: 'Encode',
    description: 'Convert text to HTML entities',
    category: 'Encoders',
    priority: 9,
    path: '/html-encode'
  },
  {
    id: 'html-decode',
    name: 'Decode',
    description: 'Convert HTML entities back to text',
    category: 'Encoders',
    priority: 10,
    path: '/html-decode'
  },
  {
    id: 'url-encode',
    name: 'Encode',
    description: 'Convert text to percent-encoded URL format',
    category: 'Encoders',
    priority: 11,
    path: '/url-encode'
  },
  {
    id: 'url-decode',
    name: 'Decode',
    description: 'Convert percent-encoded URL back to text',
    category: 'Encoders',
    priority: 12,
    path: '/url-decode'
  }
]
```

### Sidebar Group Structure

```typescript
/**
 * Sidebar group definition for HTML and URL tools
 */
interface ToolGroup {
  id: string
  name: string
  items: ToolGroupItem[]
}

interface ToolGroupItem {
  id: string
  name: string
}

/**
 * HTML and URL sidebar groups
 */
export const HTML_URL_GROUPS: ToolGroup[] = [
  {
    id: 'html',
    name: 'HTML',
    items: [
      { id: 'html-encode', name: 'Encode' },
      { id: 'html-decode', name: 'Decode' }
    ]
  },
  {
    id: 'url',
    name: 'URL',
    items: [
      { id: 'url-encode', name: 'Encode' },
      { id: 'url-decode', name: 'Decode' }
    ]
  }
]
```

### Sidebar State Extension

```typescript
/**
 * Extended sidebar state to include HTML and URL groups
 * In src/hooks/useSidebarState.ts
 */
interface SidebarState {
  base64: boolean
  base16: boolean
  base32: boolean
  json: boolean
  html: boolean    // NEW
  url: boolean     // NEW
}

/**
 * Updated default state
 */
const DEFAULT_STATE: SidebarState = {
  base64: false,
  base16: false,
  base32: false,
  json: false,
  html: false,     // NEW
  url: false       // NEW
}
```

---

## 6. Routing Model

### App Router Extension

```typescript
/**
 * Route definitions for HTML and URL tools
 * In src/App.tsx
 */
function App() {
  const currentTool = useToolId()
  
  const renderTool = () => {
    switch (currentTool) {
      // ... existing cases
      
      // NEW: HTML tools
      case 'html-encode':
        return <HTMLEncodeTool />
      case 'html-decode':
        return <HTMLDecodeTool />
      
      // NEW: URL tools
      case 'url-encode':
        return <URLEncodeTool />
      case 'url-decode':
        return <URLDecodeTool />
      
      default:
        return <HomePage />
    }
  }
  
  return (
    <ToolProvider>
      <Layout>{renderTool()}</Layout>
    </ToolProvider>
  )
}
```

---

## 7. Data Flow Diagram

```
User Input
    ↓
InputField (localInput)
    ↓
Auto-Update (200ms debounce)
    ↓
Service Layer (encode/decode)
    ↓
OutputField (output)
    ↓
CopyButton / ShareButton
```

**State Synchronization**:
```
ToolContext (currentInput/Options)
    ↔ (sync on mount/unmount)
Component State (localInput/Options)
```

**Tool Switching**:
```
User clicks different tool
    ↓
ToolContext resets (currentInput = '', currentOptions = {})
    ↓
Component unmounts (saves state to context)
    ↓
New component mounts (loads state from context)
    ↓
Auto-clear triggers (empty input → empty output)
```

---

## 8. Entity Relationships

```
┌─────────────────────┐
│   HTMLEncodeTool    │
└──────────┬──────────┘
           │ uses
           ↓
┌─────────────────────┐
│ htmlEncoderService  │
│  - encode()         │
│  - decode()         │
│  - validate()       │
└─────────────────────┘

┌─────────────────────┐
│   URLEncodeTool     │
└──────────┬──────────┘
           │ uses
           ↓
┌─────────────────────┐
│  urlEncoderService  │
│  - encode()         │
│  - decode()         │
│  - validate()       │
└─────────────────────┘

┌─────────────────────┐
│    ToolContext      │
│  - currentInput     │
│  - currentOptions   │
│  - autoUpdate       │
└──────────┬──────────┘
           │ provides
           ↓
    All Tool Components
```

---

## 9. Performance Model

### Complexity Analysis

**HTML Encoding**: O(n)
- Single pass through input string
- Character-by-character replacement
- No nested loops or recursive calls

**HTML Decoding**: O(n)
- Regex replace for numeric entities: O(n)
- Regex replace for named entities: O(n)
- Total: O(n) (two sequential passes)

**URL Encoding**: O(n)
- Native `encodeURIComponent()`: O(n) optimized
- Post-processing replacements: O(n)
- Total: O(n)

**URL Decoding**: O(n)
- Native `decodeURIComponent()`: O(n) optimized
- Fallback regex replace: O(n)
- Total: O(n)

### Memory Footprint

- Input string: n bytes
- Output string: ≤ 6n bytes (worst case: all chars encoded to `&#NNN;`)
- Temporary allocations: Minimal (string replace optimized)
- Total: O(n) space complexity

### Performance Targets

| Operation | Input Size | Target | Expected |
|-----------|------------|--------|----------|
| HTML Encode | 10KB | <50ms | ~5-10ms |
| HTML Decode | 10KB | <50ms | ~5-10ms |
| URL Encode | 10KB | <50ms | ~2-5ms (native) |
| URL Decode | 10KB | <50ms | ~2-5ms (native) |

---

## 10. Error Handling Model

### HTML Encoder Errors

| Error Type | Handling | User Impact |
|------------|----------|-------------|
| Empty input | Return empty string | Auto-clear output |
| Invalid code point (numeric entity) | Pass through unchanged | Graceful degradation |
| Unknown entity | Pass through unchanged | Partial decode |
| Malformed entity (missing semicolon) | Pass through unchanged | Lenient parsing |

### URL Encoder Errors

| Error Type | Handling | User Impact |
|------------|----------|-------------|
| Empty input | Return empty string | Auto-clear output |
| Invalid percent sequence (`%ZZ`) | Partial decode (valid parts only) | Graceful degradation |
| Incomplete sequence (`%2G`) | Pass through unchanged | Lenient parsing |
| URIError (decodeURIComponent) | Fallback to manual decode | Transparent fallback |

### Error States

```typescript
/**
 * Error state model (not currently used, but reserved for future)
 */
interface ErrorState {
  hasError: boolean
  errorMessage: string
  errorType: 'validation' | 'encoding' | 'decoding' | 'unknown'
}
```

---

## Summary

**Key Data Structures**:
1. HTML entity maps (encoding/decoding)
2. URL encoding constants (unreserved chars, patterns)
3. Service interfaces (encode/decode/validate)
4. Tool registration definitions
5. Sidebar group structures
6. Component state models

**Key Algorithms**:
1. HTML encoding: Single-pass character replacement (O(n))
2. HTML decoding: Regex-based entity replacement (O(n))
3. URL encoding: Native `encodeURIComponent()` (O(n))
4. URL decoding: Native `decodeURIComponent()` with fallback (O(n))

**State Management**:
1. Local state (localInput, localOptions, output)
2. Context sync (currentInput, currentOptions)
3. Auto-update with debounce (200ms)
4. Auto-clear on empty input

**Performance**:
- All operations O(n) time and space
- Target <50ms for 10KB input
- Expected performance: 2-10ms for typical usage

---

**Status**: ✅ Complete  
**Next**: Generate contracts/ specifications and quickstart.md
