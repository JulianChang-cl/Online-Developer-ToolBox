# Feature Specification: HTML & URL Encoding Tools

**Feature ID**: 006-html-url-encoding  
**Status**: Specification  
**Date Created**: October 31, 2025  
**Version**: 1.0

---

## Clarifications

### Session 2025-10-31

- Q: HTML Unicode encoding behavior (contradiction between Scenario 5 and Section 4.4) → A: Pass through Unicode unchanged - safer, smaller output, modern standard
- Q: URL decode invalid sequences behavior (ambiguous "error or pass through") → A: Pass through unchanged and continue decoding valid sequences (graceful)
- Q: HTML malformed entity handling (missing semicolon behavior) → A: Pass through unchanged - strict semicolon requirement

---

## 1. Overview

Add HTML entity encoding/decoding and URL (percent) encoding/decoding functionality to the Online Developer Tools platform. These tools follow the established UI/UX patterns from existing encoding tools (Base64, Base16, Base32, JSON), maintaining the unified 3-column layout (settings, input, output) and consistent state management.

---

## 2. Feature Description

### What is being built?

Four new encoding tools:
- **HTML Encode**: Convert text to HTML entities (escape special characters)
- **HTML Decode**: Convert HTML entities back to text (unescape)
- **URL Encode**: Convert text to percent-encoded URL format (RFC 3986)
- **URL Decode**: Convert percent-encoded URLs back to text

### Why it matters

Developers frequently need to:
- Safely display user content in HTML without XSS vulnerabilities
- Encode/decode URLs for APIs, query parameters, and routing
- Debug web applications that handle special characters
- Process data from forms, APIs, and web scraping

### In scope

- HTML entity encoding (named entities: &lt;, &gt;, &amp;, &quot;, &#39;)
- HTML entity decoding (both named and numeric entities)
- URL percent encoding (RFC 3986 compliant)
- URL percent decoding with error handling
- Unified 3-column layout (1fr 2fr 2fr grid)
- Auto-update toggle (ON by default with 200ms debounce)
- Auto-clear on empty input
- Copy and Share buttons
- Sidebar navigation with "HTML" and "URL" groups
- Contract tests for all encoding/decoding logic
- TypeScript strict mode compliance

### Out of scope

- Full HTML parsing/sanitization
- XML entity encoding (separate feature)
- URI component vs full URI encoding options
- Custom entity dictionaries
- Batch processing multiple URLs
- IDN (Internationalized Domain Names) encoding
- Base64 URL-safe variant (already covered in Base64 tools)

---

## 3. User Scenarios & Testing

### Scenario 1: HTML Content Safety
**Actor**: Web developer displaying user-generated content  
**Flow**:
1. User selects "HTML Encode" from sidebar
2. Pastes text containing: `<script>alert('XSS')</script>`
3. Auto-update immediately shows: `&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;`
4. Copies encoded result for safe HTML display
5. Switches to "HTML Decode" (input/output cleared)
6. Pastes encoded HTML entities
7. Sees original text restored

**Success**: Special characters encoded to HTML entities, state clears on tool switch

### Scenario 2: URL Parameter Encoding
**Actor**: API developer constructing query strings  
**Flow**:
1. User selects "URL Encode"
2. Enters parameter value: `name=John Doe&email=john@example.com`
3. Sees encoded result: `name%3DJohn%20Doe%26email%3Djohn%40example.com`
4. Copies encoded URL for API request
5. Later switches to "URL Decode"
6. Pastes percent-encoded URL from logs
7. Sees decoded readable text

**Success**: URL encoding follows RFC 3986, decoding handles all percent sequences

### Scenario 3: Layout Consistency
**Actor**: User navigating between tools  
**Flow**:
1. Views HTML Encode tool (layout: 3 columns with 1fr 2fr 2fr grid)
2. Observes same layout as Base64 Encode, JSON Validator
3. Settings panel on left with Auto-Update toggle
4. Input field center, Output field right
5. Copy and Share buttons below output

**Success**: Layout matches existing encoding tools exactly

### Scenario 4: Sidebar Organization
**Actor**: User browsing available tools  
**Flow**:
1. Opens sidebar navigation
2. Sees "HTML" group with sub-items:
   - Encode
   - Decode
3. Sees "URL" group with sub-items:
   - Encode
   - Decode
4. Groups appear alongside Base64, Base16, Base32, JSON groups
5. Clicking group expands/collapses items

**Success**: Sidebar structure matches existing pattern, groups are collapsible

### Scenario 5: Edge Cases
**Actor**: Developer testing tool robustness  
**Flow**:
1. HTML Encode with Unicode: `你好 🌍` → `你好 🌍` (passed through unchanged)
2. HTML Decode with mixed entities: `&lt;div&gt;` and `&#60;div&#62;` both work
3. URL Encode with spaces: `hello world` → `hello%20world`
4. URL Decode invalid sequences: `%ZZ` passes through unchanged (graceful handling)
5. Empty input clears output automatically

**Success**: Edge cases handled gracefully, no crashes or incorrect output

---

## 4. Technical Requirements

### 4.1 Architecture

**Component Structure** (follows existing pattern):
```
src/
├── components/Tools/
│   ├── HTMLEncodeTool.tsx       # HTML Encode component
│   ├── HTMLDecodeTool.tsx       # HTML Decode component
│   ├── URLEncodeTool.tsx        # URL Encode component
│   └── URLDecodeTool.tsx        # URL Decode component
├── services/
│   ├── html-encoder.ts          # HTML encoding service
│   └── url-encoder.ts           # URL encoding service
└── utils/
    └── encoding-utils.ts        # Shared encoding utilities (if needed)
```

**Tool Registration** (in `src/tools/index.ts`):
```typescript
// HTML Tools
{ id: 'html-encode', name: 'Encode', category: 'Encoders', priority: 9 }
{ id: 'html-decode', name: 'Decode', category: 'Encoders', priority: 10 }

// URL Tools  
{ id: 'url-encode', name: 'Encode', category: 'Encoders', priority: 11 }
{ id: 'url-decode', name: 'Decode', category: 'Encoders', priority: 12 }
```

**Sidebar Groups** (in `src/tools/index.ts`):
```typescript
TOOL_GROUPS = [
  // ... existing groups (base64, base16, base32, json)
  { id: 'html', name: 'HTML', items: [
    { id: 'html-encode', name: 'Encode' },
    { id: 'html-decode', name: 'Decode' }
  ]},
  { id: 'url', name: 'URL', items: [
    { id: 'url-encode', name: 'Encode' },
    { id: 'url-decode', name: 'Decode' }
  ]}
]
```

### 4.2 Service Contracts

**HTML Encoder Service**:
```typescript
interface HTMLEncoderService {
  encode(input: string): string
  decode(input: string): string
  validate(input: string): { valid: boolean; error?: string }
}
```

**URL Encoder Service**:
```typescript
interface URLEncoderService {
  encode(input: string): string
  decode(input: string): string
  validate(input: string): { valid: boolean; error?: string }
}
```

### 4.3 Component Patterns

All components MUST follow the established pattern:

**Layout**:
- 3-column grid: `grid gap-4 h-full min-w-0 p-4` with `gridTemplateColumns: '1fr 2fr 2fr'`
- ToolOptions wrapper with Auto-Update toggle
- InputField with label
- OutputField always visible (with `showEmpty` prop)
- CopyButton + ShareButton below output

**State Management**:
- `localInput` and `localOptions` state
- Sync with ToolContext (currentInput, currentOptions)
- Auto-update with 200ms debounce
- Auto-clear on empty input
- Reset state on tool switch

**Auto-Update Logic**:
```typescript
useEffect(() => {
  if (!autoUpdate) return
  const timer = setTimeout(() => {
    // Perform encoding/decoding
  }, 200)
  return () => clearTimeout(timer)
}, [localInput, autoUpdate])
```

### 4.4 HTML Encoding Specification

**Named Entities** (minimum required):
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`
- `'` → `&#39;` or `&apos;`

**Unicode Handling**:
- Unicode characters (above U+007F) MUST be passed through unchanged (not encoded)
- Modern UTF-8 encoding handles these correctly; numeric entity encoding is unnecessary

**Decoding**:
- MUST handle both `&entity;` (named) and `&#NNN;` (numeric) with proper semicolon
- Invalid entities (e.g., `&unknown;`) MUST pass through unchanged
- Malformed entities (missing semicolon, e.g., `&lt`) MUST pass through unchanged
- Only decode entities with proper format: `&name;` or `&#digits;` or `&#xhex;`

### 4.5 URL Encoding Specification

**Percent Encoding** (RFC 3986):
- Unreserved characters (A-Z, a-z, 0-9, `-`, `_`, `.`, `~`) MUST NOT be encoded
- Reserved characters SHOULD be encoded as `%HH` (hex uppercase)
- Space MUST be encoded as `%20` (not `+`)
- UTF-8 byte sequences for non-ASCII characters

**Decoding**:
- `%HH` sequences decoded to characters
- Invalid sequences (e.g., `%ZZ`, `%G0`) MUST pass through unchanged (graceful handling)
- Incomplete sequences at end of string (e.g., `%2`) MUST pass through unchanged
- Continue decoding remaining valid sequences after encountering invalid ones

### 4.6 Performance

- Encoding/decoding MUST complete in <50ms for 10KB input
- No memory leaks during repeated operations
- Efficient string manipulation (avoid excessive allocations)

### 4.7 Testing Requirements

**Contract Tests** (minimum coverage):
- HTML Encode: Basic entities, Unicode pass-through, edge cases
- HTML Decode: Named entities, numeric entities, mixed, malformed (missing semicolon passes through)
- URL Encode: Unreserved, reserved, spaces, Unicode, special chars
- URL Decode: Valid percent sequences, invalid sequences, edge cases
- Performance: 10KB input within timeout

**Component Tests** (optional but recommended):
- Auto-update behavior
- Manual encode/decode button
- Copy/Share functionality
- Empty input handling

---

## 5. Acceptance Criteria

### Definition of Done

**Functional**:
- [ ] HTML Encode converts `<>&"'` to entities
- [ ] HTML Decode converts entities back to text
- [ ] URL Encode produces RFC 3986 compliant output
- [ ] URL Decode handles percent sequences correctly
- [ ] Auto-update works with 200ms debounce
- [ ] Auto-clear works on empty input
- [ ] Copy button copies output to clipboard
- [ ] Share button generates shareable URL

**UI/UX**:
- [ ] Layout matches Base64/JSON tools (3-column grid)
- [ ] Sidebar shows "HTML" group with Encode/Decode items
- [ ] Sidebar shows "URL" group with Encode/Decode items
- [ ] Groups are collapsible (expand/collapse behavior)
- [ ] OutputField always visible (shows empty state)
- [ ] Settings panel includes Auto-Update toggle

**Quality**:
- [ ] All contract tests pass (minimum 8 tests per tool)
- [ ] TypeScript compilation clean (strict mode)
- [ ] Lint passes with 0 errors
- [ ] Production build successful
- [ ] No performance regressions (encoding <50ms)

**Documentation**:
- [ ] Code comments explain encoding logic
- [ ] README updated with new tools (if applicable)
- [ ] Agent context updated with new technologies

---

## 6. Dependencies & Constraints

### Technical Dependencies

- **React 18.2**: Component framework
- **TypeScript 5.9.3**: Type safety (strict mode)
- **Vite 5.4.21**: Build tool
- **Jest 30+**: Testing framework
- **Tailwind CSS 3.4**: Styling

### External Libraries

**AVOID** external libraries for basic encoding. Use native JavaScript:
- HTML encoding: String replacement with entity map
- URL encoding: `encodeURIComponent()` with adjustments for RFC 3986
- URL decoding: `decodeURIComponent()` with error handling

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features allowed
- No IE11 support required

---

## 7. Non-Functional Requirements

### Security

- HTML encoding MUST prevent XSS when used correctly
- No evaluation of user input as code
- URL encoding MUST handle injection attack vectors

### Accessibility

- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatible

### Maintainability

- Follow existing code patterns exactly
- Clear separation of concerns (UI vs logic)
- Self-documenting variable names
- Inline comments for complex logic

---

## 8. Success Metrics

**User Metrics**:
- Tools accessible via sidebar navigation
- Users can encode/decode without errors
- Copy/Share functionality works as expected

**Technical Metrics**:
- 100% contract test pass rate
- TypeScript compilation: 0 errors
- Lint: 0 errors
- Build time: No significant increase (<5%)
- Runtime performance: Encoding <50ms for 10KB

**Quality Metrics**:
- Code review approval required
- Constitution compliance verified
- No regressions in existing tools

---

## 9. Timeline Estimate

**Phase 0: Research & Design** (1 hour)
- Review existing encoding tool patterns
- Design HTML/URL encoding algorithms
- Document edge cases and test scenarios

**Phase 1: Implementation** (3 hours)
- HTML encoding service + contract tests (45 min)
- HTML components (45 min)
- URL encoding service + contract tests (45 min)
- URL components (45 min)

**Phase 2: Integration** (1 hour)
- Sidebar registration (15 min)
- Tool routing (15 min)
- Testing & verification (30 min)

**Phase 3: Quality Assurance** (30 min)
- Browser testing
- Performance verification
- Documentation

**Total**: ~5.5 hours

---

## 10. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| URL encoding edge cases not RFC compliant | Medium | Study RFC 3986, test with known implementations |
| HTML entity coverage incomplete | Low | Start with common entities, expand if needed |
| Layout inconsistency with existing tools | High | Copy exact pattern from Base64/JSON tools |
| Sidebar state management issues | Medium | Follow existing json/base64 group patterns |
| Performance regression on large input | Low | Test with 10KB+ input, optimize if needed |

---

## 11. Open Questions

1. Should URL encoding provide "encode URI component" vs "encode full URI" option?
   - **Decision**: Start with component encoding (more common use case)
   
2. Should HTML encoding cover all HTML5 named entities or just basic set?
   - **Decision**: Basic set (`<>&"'`) initially, numeric fallback for others

3. Should we add "Format" options like "Uppercase hex" for URL encoding?
   - **Decision**: No - keep simple, use uppercase by default per RFC 3986

---

**Prepared by**: AI Assistant  
**Reviewed by**: [Pending]  
**Approved by**: [Pending]
