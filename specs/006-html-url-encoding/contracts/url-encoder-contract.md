# Contract Specification: URL Encoder Service

**Service**: `urlEncoderService`  
**File**: `src/services/url-encoder.ts`  
**Test File**: `tests/contract/url-encoder.test.tsx`

---

## Service Contract

### Interface

```typescript
export interface URLEncoderService {
  encode(input: string): string
  decode(input: string): string
  validate(input: string): ValidationResult
}
```

---

## Method Contracts

### `encode(input: string): string`

**Purpose**: Convert text to percent-encoded URL format (RFC 3986)

**Contract Requirements**:

| Requirement | Input | Expected Output | Rationale |
|-------------|-------|-----------------|-----------|
| Space encoding | `hello world` | `hello%20world` | RFC 3986 (%20, not +) |
| Reserved chars | `name=value` | `name%3Dvalue` | Equals sign encoded |
| Multiple reserved | `?name=John&age=30` | `%3Fname%3DJohn%26age%3D30` | All reserved encoded |
| Unreserved NOT encoded | `Test-File_2024.txt` | `Test-File_2024.txt` | Hyphen, underscore, dot, tilde |
| Tilde preserved | `file~1.txt` | `file~1.txt` | RFC 3986 unreserved |
| At symbol | `user@domain.com` | `user%40domain.com` | @ is reserved |
| Slash | `path/to/file` | `path%2Fto%2Ffile` | Slash encoded (component mode) |
| UTF-8 encoding | `你好` | `%E4%BD%A0%E5%A5%BD` | Multi-byte UTF-8 |
| Emoji | `🚀` | `%F0%9F%9A%80` | 4-byte UTF-8 sequence |
| Empty string | `` (empty) | `` (empty) | No-op for empty |

**RFC 3986 Compliance**:
- **Unreserved** (MUST NOT encode): `A-Z a-z 0-9 - . _ ~`
- **Reserved** (MUST encode in component): `: / ? # [ ] @ ! $ & ' ( ) * + , ; =`
- **Percent encoding**: Uppercase hex digits (`%20` not `%2a`)
- **UTF-8**: Non-ASCII characters encoded as UTF-8 byte sequences

**Performance Contract**:
- 10KB input MUST complete in <50ms
- Algorithm complexity: O(n) (native encodeURIComponent)

---

### `decode(input: string): string`

**Purpose**: Convert percent-encoded URL back to text

**Contract Requirements**:

| Requirement | Input | Expected Output | Rationale |
|-------------|-------|-----------------|-----------|
| Basic decoding | `hello%20world` | `hello world` | Space decoding |
| Reserved chars | `name%3Dvalue` | `name=value` | Equals sign |
| Multiple sequences | `%3Fname%3DJohn` | `?name=John` | Multiple decodes |
| UTF-8 decoding | `%E4%BD%A0%E5%A5%BD` | `你好` | Multi-byte UTF-8 |
| Emoji decoding | `%F0%9F%9A%80` | `🚀` | 4-byte UTF-8 |
| Uppercase hex | `hello%2DWORLD` | `hello-WORLD` | Case-insensitive hex |
| Lowercase hex | `hello%2dworld` | `hello-world` | Case-insensitive hex |
| Empty string | `` (empty) | `` (empty) | No-op for empty |
| Reverses encode | `decode(encode(x))` | `x` | Lossless roundtrip |

**Edge Cases**:
- Invalid hex: `%ZZ` → pass through as `%ZZ` or throw
- Incomplete sequence: `%2` at end → pass through as `%2`
- Mixed valid/invalid: `valid%20text%ZZmore` → `valid text%ZZmore`
- Null byte: `%00` → `\0` (decode, let browser handle)

**Error Handling**:
```typescript
try {
  return decodeURIComponent(input)
} catch (error) {
  // Fallback: decode valid sequences, keep invalid
  return partialDecode(input)
}
```

**Performance Contract**:
- 10KB input MUST complete in <50ms
- Algorithm complexity: O(n) (native decodeURIComponent)

---

### `validate(input: string): ValidationResult`

**Purpose**: Validate percent-encoded URL string

**Contract Requirements**:

| Requirement | Input | Expected | Rationale |
|-------------|-------|----------|-----------|
| Valid encoding | `hello%20world` | `{ valid: true }` | Correct format |
| Invalid hex | `test%ZZ` | `{ valid: false, error: '...' }` | Non-hex characters |
| Incomplete | `test%2` | `{ valid: false, error: '...' }` | Missing second hex digit |
| No encoding | `hello world` | `{ valid: true }` | Plain text allowed |
| Empty | `` (empty) | `{ valid: true }` | Empty is valid |

**Validation Logic**:
```typescript
// Invalid pattern: % followed by non-hex or incomplete hex
const invalidPattern = /%([^0-9A-Fa-f]|[0-9A-Fa-f](?![0-9A-Fa-f]))?/

if (invalidPattern.test(input)) {
  return {
    valid: false,
    error: 'Invalid percent-encoded sequence detected'
  }
}

return { valid: true }
```

---

## Test Specifications

### Minimum Test Coverage (8 tests)

#### Test 1: Basic Space Encoding
```typescript
it('should encode spaces as %20 (not +)', () => {
  const input = 'hello world test'
  const expected = 'hello%20world%20test'
  
  const result = urlEncoderService.encode(input)
  
  expect(result).toBe(expected)
  expect(result).not.toContain('+')  // RFC 3986 uses %20
})
```

#### Test 2: Reserved Character Encoding
```typescript
it('should encode reserved characters', () => {
  const testCases = [
    { input: 'name=value', expected: 'name%3Dvalue' },
    { input: 'a&b', expected: 'a%26b' },
    { input: 'path/to/file', expected: 'path%2Fto%2Ffile' },
    { input: 'user@domain', expected: 'user%40domain' },
    { input: 'a?b', expected: 'a%3Fb' }
  ]
  
  testCases.forEach(({ input, expected }) => {
    expect(urlEncoderService.encode(input)).toBe(expected)
  })
})
```

#### Test 3: Unreserved Characters NOT Encoded
```typescript
it('should NOT encode unreserved characters', () => {
  const input = 'Test-File_2024.txt~backup'
  
  const result = urlEncoderService.encode(input)
  
  // Unreserved: A-Z, a-z, 0-9, -, ., _, ~
  expect(result).toBe(input)
  expect(result).toContain('-')
  expect(result).toContain('_')
  expect(result).toContain('.')
  expect(result).toContain('~')
})
```

#### Test 4: UTF-8 Encoding
```typescript
it('should encode non-ASCII characters as UTF-8 byte sequences', () => {
  // Chinese characters
  expect(urlEncoderService.encode('你好')).toBe('%E4%BD%A0%E5%A5%BD')
  
  // Emoji (4-byte UTF-8)
  expect(urlEncoderService.encode('🚀')).toBe('%F0%9F%9A%80')
  
  // Mixed ASCII and UTF-8
  expect(urlEncoderService.encode('Hello 你好'))
    .toBe('Hello%20%E4%BD%A0%E5%A5%BD')
})
```

#### Test 5: Basic Decoding
```typescript
it('should decode percent-encoded strings', () => {
  const testCases = [
    { input: 'hello%20world', expected: 'hello world' },
    { input: 'name%3Dvalue', expected: 'name=value' },
    { input: 'user%40domain.com', expected: 'user@domain.com' },
    { input: '%E4%BD%A0%E5%A5%BD', expected: '你好' },
    { input: '%F0%9F%9A%80', expected: '🚀' }
  ]
  
  testCases.forEach(({ input, expected }) => {
    expect(urlEncoderService.decode(input)).toBe(expected)
  })
})
```

#### Test 6: Invalid Sequence Handling
```typescript
it('should handle invalid percent sequences gracefully', () => {
  // Invalid hex characters
  const invalidHex = urlEncoderService.decode('test%ZZ')
  expect(invalidHex).toBeDefined()  // Should not throw
  
  // Incomplete sequence
  const incomplete = urlEncoderService.decode('test%2')
  expect(incomplete).toBeDefined()
  
  // Mixed valid and invalid
  const mixed = urlEncoderService.decode('valid%20text%ZZmore')
  expect(mixed).toContain('valid')
  expect(mixed).toContain('text')
})
```

#### Test 7: Empty Input
```typescript
it('should handle empty input gracefully', () => {
  expect(urlEncoderService.encode('')).toBe('')
  expect(urlEncoderService.decode('')).toBe('')
  expect(urlEncoderService.validate('')).toEqual({ valid: true })
})
```

#### Test 8: Performance
```typescript
it('should encode 10KB input in <50ms', () => {
  const largeInput = 'test=value&'.repeat(1000)  // ~10KB
  
  const start = performance.now()
  const result = urlEncoderService.encode(largeInput)
  const duration = performance.now() - start
  
  expect(duration).toBeLessThan(50)
  expect(result).toContain('%3D')  // Equals encoded
  expect(result).toContain('%26')  // Ampersand encoded
})
```

---

## Additional Test Cases (Optional)

### Test 9: Roundtrip Property
```typescript
it('should preserve text through encode/decode roundtrip', () => {
  const testCases = [
    'Hello, World!',
    'name=John Doe&age=30',
    'path/to/file.txt',
    '你好世界',
    'Test with 🚀 emoji'
  ]
  
  testCases.forEach(input => {
    const encoded = urlEncoderService.encode(input)
    const decoded = urlEncoderService.decode(encoded)
    expect(decoded).toBe(input)
  })
})
```

### Test 10: Case-Insensitive Hex Decoding
```typescript
it('should decode both uppercase and lowercase hex', () => {
  // Uppercase
  expect(urlEncoderService.decode('test%2DVALUE')).toBe('test-VALUE')
  
  // Lowercase
  expect(urlEncoderService.decode('test%2dvalue')).toBe('test-value')
  
  // Mixed
  expect(urlEncoderService.decode('%2a%2A')).toBe('**')
})
```

### Test 11: Complex Query String
```typescript
it('should encode/decode complex query strings', () => {
  const input = 'search=hello world&filter=type:document&sort=date'
  
  const encoded = urlEncoderService.encode(input)
  const decoded = urlEncoderService.decode(encoded)
  
  expect(encoded).toContain('%20')  // Space
  expect(encoded).toContain('%3D')  // Equals
  expect(encoded).toContain('%26')  // Ampersand
  expect(encoded).toContain('%3A')  // Colon
  expect(decoded).toBe(input)
})
```

### Test 12: Validation
```typescript
it('should validate percent-encoded strings', () => {
  // Valid
  expect(urlEncoderService.validate('hello%20world')).toEqual({ valid: true })
  expect(urlEncoderService.validate('plain text')).toEqual({ valid: true })
  expect(urlEncoderService.validate('')).toEqual({ valid: true })
  
  // Invalid
  expect(urlEncoderService.validate('test%ZZ').valid).toBe(false)
  expect(urlEncoderService.validate('test%2').valid).toBe(false)
  expect(urlEncoderService.validate('test%').valid).toBe(false)
})
```

---

## RFC 3986 Compliance Matrix

### Unreserved Characters (MUST NOT Encode)

| Character Set | Characters | Encoded? | Test |
|---------------|------------|----------|------|
| Uppercase letters | A-Z | ❌ No | `ABC` → `ABC` |
| Lowercase letters | a-z | ❌ No | `xyz` → `xyz` |
| Digits | 0-9 | ❌ No | `123` → `123` |
| Hyphen | `-` | ❌ No | `a-b` → `a-b` |
| Period | `.` | ❌ No | `file.txt` → `file.txt` |
| Underscore | `_` | ❌ No | `test_file` → `test_file` |
| Tilde | `~` | ❌ No | `~user` → `~user` |

### Reserved Characters (MUST Encode in Component)

| Character | Hex | Encoded | Test |
|-----------|-----|---------|------|
| Space | %20 | ✅ Yes | ` ` → `%20` |
| `!` | %21 | ✅ Yes | `!` → `%21` |
| `#` | %23 | ✅ Yes | `#` → `%23` |
| `$` | %24 | ✅ Yes | `$` → `%24` |
| `&` | %26 | ✅ Yes | `&` → `%26` |
| `'` | %27 | ✅ Yes | `'` → `%27` |
| `(` | %28 | ✅ Yes | `(` → `%28` |
| `)` | %29 | ✅ Yes | `)` → `%29` |
| `*` | %2A | ✅ Yes | `*` → `%2A` |
| `+` | %2B | ✅ Yes | `+` → `%2B` |
| `,` | %2C | ✅ Yes | `,` → `%2C` |
| `/` | %2F | ✅ Yes | `/` → `%2F` |
| `:` | %3A | ✅ Yes | `:` → `%3A` |
| `;` | %3B | ✅ Yes | `;` → `%3B` |
| `=` | %3D | ✅ Yes | `=` → `%3D` |
| `?` | %3F | ✅ Yes | `?` → `%3F` |
| `@` | %40 | ✅ Yes | `@` → `%40` |
| `[` | %5B | ✅ Yes | `[` → `%5B` |
| `]` | %5D | ✅ Yes | `]` → `%5D` |

---

## Error Handling Contract

### No Exceptions for Valid Encoding

**Requirement**: Service MUST NOT throw exceptions for encoding any string

```typescript
// All valid inputs
urlEncoderService.encode('any string here')  // Works
urlEncoderService.encode('')  // Works
urlEncoderService.encode('special chars: !@#$%^&*()')  // Works
```

### Graceful Decoding Fallback

**Requirement**: Decoding MUST handle invalid sequences gracefully

```typescript
// Invalid sequences should not crash
urlEncoderService.decode('%ZZ')        // Graceful: pass through or partial decode
urlEncoderService.decode('test%2')     // Graceful: pass through incomplete
urlEncoderService.decode('%')          // Graceful: pass through lone %
urlEncoderService.decode('%00')        // Decode null byte (browser handles)
```

### Validation Provides Feedback

**Requirement**: Validation MUST explain why input is invalid

```typescript
const result = urlEncoderService.validate('test%ZZ')

expect(result.valid).toBe(false)
expect(result.error).toBeDefined()
expect(result.error).toContain('Invalid percent-encoded sequence')
```

---

## Integration Contract

### Usage in Components

```typescript
// URLEncodeTool.tsx
import { urlEncoderService } from '../services/url-encoder'

function URLEncodeTool() {
  const [output, setOutput] = useState('')
  
  useEffect(() => {
    if (!autoUpdate) return
    
    const timer = setTimeout(() => {
      if (localInput.trim() === '') {
        setOutput('')
        return
      }
      
      // Use service
      const result = urlEncoderService.encode(localInput)
      setOutput(result)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [localInput, autoUpdate])
  
  // ...
}
```

### Service Export

```typescript
// src/services/url-encoder.ts
export const urlEncoderService: URLEncoderService = {
  encode(input: string): string {
    if (!input) return ''
    return encodeURIComponent(input)
  },
  
  decode(input: string): string {
    if (!input) return ''
    try {
      return decodeURIComponent(input)
    } catch (error) {
      // Fallback for invalid sequences
      return partialDecode(input)
    }
  },
  
  validate(input: string): ValidationResult {
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

## Success Criteria

**Contract Compliance**:
- [ ] All 8 minimum tests pass
- [ ] Encode follows RFC 3986 (unreserved NOT encoded)
- [ ] Decode handles UTF-8 multi-byte sequences
- [ ] Empty input returns empty output
- [ ] Invalid sequences handled gracefully (no crashes)
- [ ] Performance: 10KB in <50ms
- [ ] Validation detects invalid sequences
- [ ] Roundtrip property: `decode(encode(x)) === x`

**Quality Gates**:
- [ ] TypeScript strict mode passes
- [ ] Lint passes with 0 errors
- [ ] Code coverage ≥80%
- [ ] All tests pass in CI/CD

---

**Status**: Contract Defined  
**Implementation**: Pending  
**Test-First**: Required (write tests before implementation)
