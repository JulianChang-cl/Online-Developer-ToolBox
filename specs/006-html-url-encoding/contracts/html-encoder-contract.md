# Contract Specification: HTML Encoder Service

**Service**: `htmlEncoderService`  
**File**: `src/services/html-encoder.ts`  
**Test File**: `tests/contract/html-encoder.test.tsx`

---

## Service Contract

### Interface

```typescript
export interface HTMLEncoderService {
  encode(input: string): string
  decode(input: string): string
  validate(input: string): ValidationResult
}
```

---

## Method Contracts

### `encode(input: string): string`

**Purpose**: Convert text to HTML entities for safe HTML display

**Contract Requirements**:

| Requirement | Input | Expected Output | Rationale |
|-------------|-------|-----------------|-----------|
| Basic entities | `<script>` | `&lt;script&gt;` | XSS prevention |
| All 5 entities | `<>&"'` | `&lt;&gt;&amp;&quot;&#39;` | Complete entity set |
| Ampersand first | `&lt;` | `&amp;lt;` | Prevent double-encoding |
| Empty string | `` (empty) | `` (empty) | No-op for empty |
| Unicode pass-through | `你好` | `你好` | UTF-8 support |
| Emoji pass-through | `🚀` | `🚀` | Modern emoji support |
| Mixed content | `Hello <world>` | `Hello &lt;world&gt;` | Selective encoding |
| Idempotent | `encode(encode(x))` | Double-encoded | Not reversible without decode |

**Performance Contract**:
- 10KB input MUST complete in <50ms
- Algorithm complexity: O(n)
- No memory leaks

---

### `decode(input: string): string`

**Purpose**: Convert HTML entities back to text

**Contract Requirements**:

| Requirement | Input | Expected Output | Rationale |
|-------------|-------|-----------------|-----------|
| Named entities | `&lt;div&gt;` | `<div>` | Standard decoding |
| Numeric decimal | `&#60;div&#62;` | `<div>` | Numeric entity support |
| Numeric hex | `&#x3C;div&#x3E;` | `<div>` | Hex entity support |
| Mixed entities | `&lt;div&#62;` | `<div>` | Handles mixed formats |
| Unknown entity | `&unknown;` | `&unknown;` | Pass through unchanged |
| Malformed (no semicolon) | `&lt` | `&lt` | Lenient parsing |
| Nested encoding | `&amp;lt;` | `&lt;` | Single decode pass |
| Empty string | `` (empty) | `` (empty) | No-op for empty |
| Reverses encode | `decode(encode(x))` | `x` | Lossless for basic chars |

**Edge Cases**:
- Out-of-range code point: `&#9999999;` → pass through or clamp
- Invalid hex: `&#xZZZZ;` → pass through unchanged
- Partial entity: `&#` or `&#x` at end → pass through

**Performance Contract**:
- 10KB input MUST complete in <50ms
- Algorithm complexity: O(n)

---

### `validate(input: string): ValidationResult`

**Purpose**: Validate HTML entity encoded text (currently lenient)

**Contract Requirements**:

| Requirement | Input | Expected | Rationale |
|-------------|-------|----------|-----------|
| Always valid | Any string | `{ valid: true }` | Graceful handling |
| No strict validation | Malformed entities | `{ valid: true }` | User-friendly |

**Note**: HTML encoding is inherently lenient. Invalid entities are handled gracefully during decode.

---

## Test Specifications

### Minimum Test Coverage (8 tests)

#### Test 1: Basic Entity Encoding
```typescript
it('should encode < > & " \' to HTML entities', () => {
  const input = `<>&"'`
  const expected = `&lt;&gt;&amp;&quot;&#39;`
  
  const result = htmlEncoderService.encode(input)
  
  expect(result).toBe(expected)
})
```

#### Test 2: XSS Prevention
```typescript
it('should prevent XSS by encoding script tags', () => {
  const input = `<script>alert('XSS')</script>`
  const expected = `&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;`
  
  const result = htmlEncoderService.encode(input)
  
  expect(result).toBe(expected)
  expect(result).not.toContain('<script>')
})
```

#### Test 3: Decode Named Entities
```typescript
it('should decode named HTML entities', () => {
  const input = `&lt;div class=&quot;test&quot;&gt;Hello&lt;/div&gt;`
  const expected = `<div class="test">Hello</div>`
  
  const result = htmlEncoderService.decode(input)
  
  expect(result).toBe(expected)
})
```

#### Test 4: Decode Numeric Entities
```typescript
it('should decode numeric HTML entities (decimal and hex)', () => {
  const decimalInput = `&#60;div&#62;`
  const hexInput = `&#x3C;div&#x3E;`
  const expected = `<div>`
  
  expect(htmlEncoderService.decode(decimalInput)).toBe(expected)
  expect(htmlEncoderService.decode(hexInput)).toBe(expected)
})
```

#### Test 5: Unicode Pass-Through
```typescript
it('should pass through Unicode characters unchanged', () => {
  const input = `你好 世界 🌍`
  
  const encoded = htmlEncoderService.encode(input)
  const decoded = htmlEncoderService.decode(encoded)
  
  expect(encoded).toBe(input)  // No encoding for Unicode
  expect(decoded).toBe(input)  // Roundtrip
})
```

#### Test 6: Empty Input
```typescript
it('should handle empty input gracefully', () => {
  expect(htmlEncoderService.encode('')).toBe('')
  expect(htmlEncoderService.decode('')).toBe('')
})
```

#### Test 7: Malformed Entity Handling
```typescript
it('should handle malformed entities gracefully', () => {
  // Missing semicolon
  expect(htmlEncoderService.decode('&lt')).toBe('&lt')
  
  // Unknown entity
  expect(htmlEncoderService.decode('&unknown;')).toBe('&unknown;')
  
  // Invalid numeric
  expect(htmlEncoderService.decode('&#ZZZ;')).toBe('&#ZZZ;')
})
```

#### Test 8: Performance
```typescript
it('should encode 10KB input in <50ms', () => {
  const largeInput = '<script>'.repeat(1250)  // ~10KB
  
  const start = performance.now()
  const result = htmlEncoderService.encode(largeInput)
  const duration = performance.now() - start
  
  expect(duration).toBeLessThan(50)
  expect(result).toContain('&lt;script&gt;')
})
```

---

## Additional Test Cases (Optional)

### Test 9: Roundtrip Property
```typescript
it('should preserve text through encode/decode roundtrip', () => {
  const testCases = [
    'Hello, World!',
    '<div>Content</div>',
    'Test "quotes" & symbols',
    "Single 'quotes' work"
  ]
  
  testCases.forEach(input => {
    const encoded = htmlEncoderService.encode(input)
    const decoded = htmlEncoderService.decode(encoded)
    expect(decoded).toBe(input)
  })
})
```

### Test 10: Ampersand Encoding Order
```typescript
it('should encode ampersand first to avoid double-encoding', () => {
  const input = '&lt;'  // Already contains entity
  const encoded = htmlEncoderService.encode(input)
  
  // Should encode to &amp;lt; (not &amp;amp;lt;)
  expect(encoded).toBe('&amp;lt;')
  
  // Decoding should give back original
  const decoded = htmlEncoderService.decode(encoded)
  expect(decoded).toBe('&lt;')
})
```

### Test 11: Mixed Entity Types
```typescript
it('should decode mixed entity types in same string', () => {
  const input = `&lt;div&#62;Hello&#x21;&lt;/div&gt;`
  const expected = `<div>Hello!</div>`
  
  const result = htmlEncoderService.decode(input)
  
  expect(result).toBe(expected)
})
```

### Test 12: Large Numeric Entities
```typescript
it('should handle large numeric entities', () => {
  // Chinese character (U+4E00)
  expect(htmlEncoderService.decode('&#20000;')).toBe('一')
  
  // Emoji (U+1F680)
  expect(htmlEncoderService.decode('&#128640;')).toBe('🚀')
  
  // Out of range (should pass through or handle gracefully)
  const outOfRange = htmlEncoderService.decode('&#9999999;')
  expect(outOfRange).toBeDefined()
})
```

---

## Error Handling Contract

### No Exceptions Thrown

**Requirement**: Service MUST NOT throw exceptions for any input

| Scenario | Input | Expected Behavior |
|----------|-------|-------------------|
| Null/undefined | `null` | Treat as empty string |
| Invalid code point | `&#9999999;` | Pass through or clamp |
| Malformed entity | `&lt` | Pass through unchanged |
| Partial entity | `&#` at end | Pass through unchanged |

### Graceful Degradation

**Principle**: Invalid input should be handled gracefully without crashing

```typescript
// All of these should work without throwing
htmlEncoderService.encode(undefined!)  // Handled as empty
htmlEncoderService.decode('&&#;')      // Malformed, pass through
htmlEncoderService.decode('&#x;')      // Invalid hex, pass through
```

---

## Integration Contract

### Usage in Components

```typescript
// HTMLEncodeTool.tsx
import { htmlEncoderService } from '../services/html-encoder'

function HTMLEncodeTool() {
  const [output, setOutput] = useState('')
  
  useEffect(() => {
    if (!autoUpdate) return
    
    const timer = setTimeout(() => {
      if (localInput.trim() === '') {
        setOutput('')
        return
      }
      
      // Use service
      const result = htmlEncoderService.encode(localInput)
      setOutput(result)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [localInput, autoUpdate])
  
  // ...
}
```

### Service Export

```typescript
// src/services/html-encoder.ts
export const htmlEncoderService: HTMLEncoderService = {
  encode(input: string): string {
    // Implementation
  },
  
  decode(input: string): string {
    // Implementation
  },
  
  validate(input: string): ValidationResult {
    return { valid: true }
  }
}
```

---

## Success Criteria

**Contract Compliance**:
- [ ] All 8 minimum tests pass
- [ ] Encode handles all 5 essential entities
- [ ] Decode supports named and numeric entities
- [ ] Empty input returns empty output
- [ ] Unicode characters preserved
- [ ] Performance: 10KB in <50ms
- [ ] No exceptions thrown for any input
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
