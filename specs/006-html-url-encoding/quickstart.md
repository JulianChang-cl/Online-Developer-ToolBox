# Quickstart: HTML & URL Encoding Tools

**Feature**: 006-html-url-encoding  
**For**: Developers implementing or using the HTML/URL encoding tools  
**Time**: 15-minute read, 3-hour implementation

---

## Overview

This guide shows you how to implement and use the HTML and URL encoding tools following the established patterns in the codebase.

**What You'll Build**:
- HTML Encode/Decode tools (XSS prevention)
- URL Encode/Decode tools (RFC 3986 compliant)
- 4 new sidebar items in "HTML" and "URL" groups
- 32+ contract tests ensuring correctness

**What You'll Learn**:
- Test-first development (TDD) workflow
- Service layer pattern
- Component layout consistency
- Tool registration and routing

---

## Prerequisites

```bash
# Ensure development environment is ready
node --version  # v18+ required
npm install     # Install dependencies

# Verify existing tools work
npm test        # Should see 88+ tests passing
npm run dev     # Start dev server
```

**Required Knowledge**:
- TypeScript basics (interfaces, types)
- React hooks (useState, useEffect)
- Jest testing framework
- HTML entities and URL encoding concepts

---

## Phase 1: Services (Test-First)

### Step 1.1: Write HTML Encoder Contract Tests (RED)

```bash
# Create test file
touch tests/contract/html-encoder.test.tsx
```

```typescript
// tests/contract/html-encoder.test.tsx
import { describe, it, expect } from '@jest/globals'
import { htmlEncoderService } from '../../src/services/html-encoder'

describe('HTML Encoder Contract Tests', () => {
  describe('encode()', () => {
    it('should encode < > & " \' to HTML entities', () => {
      const input = `<>&"'`
      const expected = `&lt;&gt;&amp;&quot;&#39;`
      
      const result = htmlEncoderService.encode(input)
      
      expect(result).toBe(expected)
    })

    it('should prevent XSS by encoding script tags', () => {
      const input = `<script>alert('XSS')</script>`
      const expected = `&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;`
      
      const result = htmlEncoderService.encode(input)
      
      expect(result).toBe(expected)
      expect(result).not.toContain('<script>')
    })

    it('should pass through Unicode characters unchanged', () => {
      const input = `你好 世界 🌍`
      
      const encoded = htmlEncoderService.encode(input)
      
      expect(encoded).toBe(input)
    })

    it('should handle empty input gracefully', () => {
      expect(htmlEncoderService.encode('')).toBe('')
    })
  })

  describe('decode()', () => {
    it('should decode named HTML entities', () => {
      const input = `&lt;div&gt;`
      const expected = `<div>`
      
      const result = htmlEncoderService.decode(input)
      
      expect(result).toBe(expected)
    })

    it('should decode numeric entities (decimal and hex)', () => {
      expect(htmlEncoderService.decode('&#60;')).toBe('<')
      expect(htmlEncoderService.decode('&#x3C;')).toBe('<')
    })

    it('should handle malformed entities gracefully', () => {
      expect(htmlEncoderService.decode('&lt')).toBe('&lt')
      expect(htmlEncoderService.decode('&unknown;')).toBe('&unknown;')
    })

    it('should handle empty input gracefully', () => {
      expect(htmlEncoderService.decode('')).toBe('')
    })
  })

  describe('Performance', () => {
    it('should encode 10KB input in <50ms', () => {
      const largeInput = '<script>'.repeat(1250)  // ~10KB
      
      const start = performance.now()
      const result = htmlEncoderService.encode(largeInput)
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(50)
      expect(result).toContain('&lt;script&gt;')
    })
  })
})
```

```bash
# Run tests - they should FAIL (RED)
npm test -- html-encoder
# Expected: Cannot find module '../../src/services/html-encoder'
```

### Step 1.2: Implement HTML Encoder Service (GREEN)

```bash
# Create service file
touch src/services/html-encoder.ts
```

```typescript
// src/services/html-encoder.ts

/**
 * HTML entity encoding map
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',   // Must be first
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

/**
 * Named entity decoding map
 */
const NAMED_ENTITIES: Record<string, string> = {
  'lt': '<',
  'gt': '>',
  'amp': '&',
  'quot': '"',
  'apos': "'",
  '#39': "'",
  'nbsp': '\u00A0'
}

/**
 * Numeric entity pattern
 */
const NUMERIC_ENTITY_PATTERN = /&#(\d+);|&#x([0-9A-Fa-f]+);/g

/**
 * HTML encoder service interface
 */
export interface HTMLEncoderService {
  encode(input: string): string
  decode(input: string): string
  validate(input: string): { valid: boolean; error?: string }
}

/**
 * HTML encoder service implementation
 */
export const htmlEncoderService: HTMLEncoderService = {
  encode(input: string): string {
    if (!input) return ''
    
    let result = input
    // Order matters: encode & first to avoid double-encoding
    result = result.replace(/&/g, HTML_ENTITIES['&'])
    result = result.replace(/</g, HTML_ENTITIES['<'])
    result = result.replace(/>/g, HTML_ENTITIES['>'])
    result = result.replace(/"/g, HTML_ENTITIES['"'])
    result = result.replace(/'/g, HTML_ENTITIES["'"])
    
    return result
  },

  decode(input: string): string {
    if (!input) return ''
    
    let result = input
    
    // Decode numeric entities first
    result = result.replace(NUMERIC_ENTITY_PATTERN, (match, dec, hex) => {
      const codePoint = dec ? parseInt(dec, 10) : parseInt(hex, 16)
      if (codePoint >= 0 && codePoint <= 0x10FFFF) {
        return String.fromCodePoint(codePoint)
      }
      return match
    })
    
    // Decode named entities
    result = result.replace(/&([a-z]+|#\d+);/gi, (match, entity) => {
      return NAMED_ENTITIES[entity.toLowerCase()] || match
    })
    
    return result
  },

  validate(input: string): { valid: boolean; error?: string } {
    return { valid: true }  // HTML encoding is lenient
  }
}
```

```bash
# Run tests - they should PASS (GREEN)
npm test -- html-encoder
# Expected: All 9 tests passing
```

### Step 1.3: URL Encoder (Same Process)

```bash
# Create test file
touch tests/contract/url-encoder.test.tsx
```

Follow same TDD process:
1. Write tests (see contracts/url-encoder-contract.md)
2. Run tests → RED
3. Implement service (use `encodeURIComponent`/`decodeURIComponent`)
4. Run tests → GREEN

---

## Phase 2: Components

### Step 2.1: HTML Encode Tool

```bash
# Create component file
touch src/components/Tools/HTMLEncodeTool.tsx
```

```typescript
// src/components/Tools/HTMLEncodeTool.tsx
import React, { useState, useEffect } from 'react'
import { useToolContext } from '../../context/ToolContext'
import { ToolOptions } from '../ToolOptions'
import { InputField } from '../InputField'
import { OutputField } from '../OutputField'
import { CopyButton } from '../CopyButton'
import { ShareButton } from '../ShareButton'
import { htmlEncoderService } from '../../services/html-encoder'

const TOOL_ID = 'html-encode'

/**
 * Options component for HTML Encode tool
 */
function HTMLEncodeOptions() {
  const { autoUpdate, toggleAutoUpdate } = useToolContext()
  
  return (
    <div className="space-y-4">
      {/* Auto-Update Toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="auto-update" className="text-sm font-medium">
          Auto-Update
        </label>
        <button
          id="auto-update"
          role="switch"
          aria-checked={autoUpdate}
          onClick={toggleAutoUpdate}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoUpdate ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoUpdate ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Info text */}
      <div className="text-sm text-muted-foreground">
        <p>Converts special characters to HTML entities:</p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>&lt; → &amp;lt;</li>
          <li>&gt; → &amp;gt;</li>
          <li>&amp; → &amp;amp;</li>
          <li>&quot; → &amp;quot;</li>
          <li>&apos; → &amp;#39;</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * HTML Encode Tool Component
 */
export function HTMLEncodeTool(): React.ReactElement {
  const {
    currentInput,
    currentOptions,
    setCurrentInput,
    updateOption,
    autoUpdate,
    setHeaderTitle,
    setHeaderDescription,
  } = useToolContext()

  const [localInput, setLocalInput] = useState(currentInput || '')
  const [localOptions, setLocalOptions] = useState(currentOptions || {})
  const [output, setOutput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Set header on mount
  useEffect(() => {
    setHeaderTitle('HTML Encode')
    setHeaderDescription('Convert text to HTML entities for safe HTML display')
    
    return () => {
      setHeaderTitle('')
      setHeaderDescription('')
    }
  }, [setHeaderTitle, setHeaderDescription])

  // Sync local state with context
  useEffect(() => {
    setLocalInput(currentInput || '')
  }, [currentInput])

  useEffect(() => {
    setLocalOptions(currentOptions || {})
  }, [currentOptions])

  // Auto-encode with debounce
  useEffect(() => {
    if (!autoUpdate) return

    const timer = setTimeout(() => {
      if (localInput.trim() === '') {
        setOutput('')
        setIsProcessing(false)
        return
      }

      setIsProcessing(true)

      try {
        const result = htmlEncoderService.encode(localInput)
        setOutput(result)
      } catch (error) {
        setOutput('')
        console.error('HTML encoding failed:', error)
      } finally {
        setIsProcessing(false)
      }
    }, 200)  // 200ms debounce

    return () => clearTimeout(timer)
  }, [localInput, autoUpdate])

  // Manual encode
  const handleEncode = () => {
    if (localInput.trim() === '') {
      setOutput('')
      return
    }

    setIsProcessing(true)

    try {
      const result = htmlEncoderService.encode(localInput)
      setOutput(result)
    } catch (error) {
      setOutput('')
      console.error('HTML encoding failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOptionChange = (key: string, value: unknown) => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    updateOption(key, value)
  }

  const handleInputChange = (value: string) => {
    setLocalInput(value)
    setCurrentInput(value)
  }

  return (
    <div className="grid gap-4 h-full min-w-0 p-4" style={{ gridTemplateColumns: '1fr 2fr 2fr' }}>
      {/* Settings Column */}
      <ToolOptions
        hasOptions={true}
        optionsComponent={HTMLEncodeOptions}
        options={localOptions}
        onOptionChange={handleOptionChange}
      />

      {/* Input Column */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <InputField
          id="html-encode-input"
          label="Input Text"
          value={localInput}
          onChange={handleInputChange}
          placeholder="Enter text to encode..."
        />
        {!autoUpdate && (
          <button
            onClick={handleEncode}
            className="btn btn-primary"
            disabled={isProcessing}
          >
            Encode
          </button>
        )}
      </div>

      {/* Output Column */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <OutputField
          id="html-encode-output"
          label="HTML Encoded"
          value={output}
          showEmpty={!isProcessing && !output}
        />
        {output && (
          <div className="flex gap-2">
            <CopyButton textToCopy={output} />
            <ShareButton toolId={TOOL_ID} input={localInput} options={localOptions} />
          </div>
        )}
      </div>
    </div>
  )
}
```

### Step 2.2: Other Components

Create similar components for:
- `HTMLDecodeTool.tsx` (use `htmlEncoderService.decode()`)
- `URLEncodeTool.tsx` (use `urlEncoderService.encode()`)
- `URLDecodeTool.tsx` (use `urlEncoderService.decode()`)

**Pattern is identical**, just change:
- Tool ID
- Service method
- Header title/description
- Info text in Options

---

## Phase 3: Integration

### Step 3.1: Register Tools

```typescript
// src/tools/index.ts

// Add imports
import { HTMLEncodeTool } from '../components/Tools/HTMLEncodeTool'
import { HTMLDecodeTool } from '../components/Tools/HTMLDecodeTool'
import { URLEncodeTool } from '../components/Tools/URLEncodeTool'
import { URLDecodeTool } from '../components/Tools/URLDecodeTool'
import { htmlEncoderService } from '../services/html-encoder'
import { urlEncoderService } from '../services/url-encoder'

// Add to tools array
export const tools: Tool[] = [
  // ... existing tools
  
  // HTML Tools
  {
    id: 'html-encode',
    name: 'Encode',
    description: 'Convert text to HTML entities',
    category: 'Encoders',
    priority: 9,
    path: '/html-encode',
    component: HTMLEncodeTool,
    service: htmlEncoderService
  },
  {
    id: 'html-decode',
    name: 'Decode',
    description: 'Convert HTML entities back to text',
    category: 'Encoders',
    priority: 10,
    path: '/html-decode',
    component: HTMLDecodeTool,
    service: htmlEncoderService
  },
  
  // URL Tools
  {
    id: 'url-encode',
    name: 'Encode',
    description: 'Convert text to percent-encoded URL format',
    category: 'Encoders',
    priority: 11,
    path: '/url-encode',
    component: URLEncodeTool,
    service: urlEncoderService
  },
  {
    id: 'url-decode',
    name: 'Decode',
    description: 'Convert percent-encoded URL back to text',
    category: 'Encoders',
    priority: 12,
    path: '/url-decode',
    component: URLDecodeTool,
    service: urlEncoderService
  }
]

// Add to TOOL_GROUPS
export const TOOL_GROUPS: ToolGroup[] = [
  // ... existing groups (base64, base16, base32, json)
  
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

// Add to DEFAULT_SETTINGS
export const DEFAULT_SETTINGS: Record<string, Record<string, unknown>> = {
  // ... existing settings
  'html-encode': {},
  'html-decode': {},
  'url-encode': {},
  'url-decode': {}
}

// Add to TOOL_PARAMETERS
export const TOOL_PARAMETERS: Record<string, string[]> = {
  // ... existing parameters
  'html-encode': ['input'],
  'html-decode': ['input'],
  'url-encode': ['input'],
  'url-decode': ['input']
}
```

### Step 3.2: Add Routing

```typescript
// src/App.tsx

// Add imports
import { HTMLEncodeTool } from './components/Tools/HTMLEncodeTool'
import { HTMLDecodeTool } from './components/Tools/HTMLDecodeTool'
import { URLEncodeTool } from './components/Tools/URLEncodeTool'
import { URLDecodeTool } from './components/Tools/URLDecodeTool'

// Add cases in renderTool()
function renderTool() {
  switch (currentTool) {
    // ... existing cases
    
    // HTML tools
    case 'html-encode':
      return <HTMLEncodeTool />
    case 'html-decode':
      return <HTMLDecodeTool />
    
    // URL tools
    case 'url-encode':
      return <URLEncodeTool />
    case 'url-decode':
      return <URLDecodeTool />
    
    default:
      return <HomePage />
  }
}
```

### Step 3.3: Update Sidebar State

```typescript
// src/hooks/useSidebarState.ts

interface SidebarState {
  base64: boolean
  base16: boolean
  base32: boolean
  json: boolean
  html: boolean     // ADD
  url: boolean      // ADD
}

const DEFAULT_STATE: SidebarState = {
  base64: false,
  base16: false,
  base32: false,
  json: false,
  html: false,      // ADD
  url: false        // ADD
}

// Update parser
const parsed = JSON.parse(stored)
return {
  base64: parsed.base64 ?? false,
  base16: parsed.base16 ?? false,
  base32: parsed.base32 ?? false,
  json: parsed.json ?? false,
  html: parsed.html ?? false,     // ADD
  url: parsed.url ?? false         // ADD
}
```

---

## Phase 4: Testing & Verification

### Step 4.1: Run All Tests

```bash
# Run all tests
npm test

# Expected output:
# Test Suites: 24 passed, 24 total
# Tests:       120 passed, 120 total (88 + 32 new)
```

### Step 4.2: TypeScript & Lint

```bash
# TypeScript compilation
npx tsc --noEmit
# Expected: No errors

# Lint
npm run lint
# Expected: No errors
```

### Step 4.3: Browser Testing

```bash
# Start dev server
npm run dev
# Open http://localhost:3001
```

**Manual Test Checklist**:
- [ ] Sidebar shows "HTML" and "URL" groups
- [ ] Click HTML → Encode opens tool
- [ ] Layout: 3 columns (Settings | Input | Output)
- [ ] Type `<script>` → see `&lt;script&gt;`
- [ ] Auto-update works (200ms delay)
- [ ] Toggle auto-update off → Encode button appears
- [ ] Click Encode button → updates output
- [ ] Clear input → output clears automatically
- [ ] Copy button works
- [ ] Share button generates URL
- [ ] Switch to HTML Decode → state resets
- [ ] Paste `&lt;div&gt;` → see `<div>`
- [ ] Repeat for URL Encode/Decode

### Step 4.4: Production Build

```bash
# Build for production
npm run build

# Expected output:
# ✓ built in XXXms
# dist/index.html                  X.XX kB
# dist/assets/index-XXXXXXXX.js    XXX.XX kB
```

---

## Usage Examples

### HTML Encoding

**Input**:
```html
<script>alert('XSS')</script>
```

**Output**:
```html
&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;
```

**Use Case**: Safely display user-generated content in HTML

---

### HTML Decoding

**Input**:
```html
&lt;div class=&quot;test&quot;&gt;Hello&lt;/div&gt;
```

**Output**:
```html
<div class="test">Hello</div>
```

**Use Case**: Parse HTML entities from logs or databases

---

### URL Encoding

**Input**:
```
name=John Doe&email=john@example.com
```

**Output**:
```
name%3DJohn%20Doe%26email%3Djohn%40example.com
```

**Use Case**: Encode query parameters for API requests

---

### URL Decoding

**Input**:
```
search%3Dhello%20world%26filter%3Dtype%3Adocument
```

**Output**:
```
search=hello world&filter=type:document
```

**Use Case**: Decode URLs from logs or debugging

---

## Troubleshooting

### Tests Failing

```bash
# Check service imports
grep -r "html-encoder" src/
grep -r "url-encoder" src/

# Re-run specific test
npm test -- html-encoder.test
```

### TypeScript Errors

```bash
# Check for missing types
npx tsc --noEmit --listFiles | grep html-encoder

# Verify interface exports
cat src/services/html-encoder.ts | grep "export"
```

### Layout Not Matching

```bash
# Compare with Base64EncodeTool.tsx
diff src/components/Tools/Base64EncodeTool.tsx src/components/Tools/HTMLEncodeTool.tsx

# Check grid columns
grep "gridTemplateColumns" src/components/Tools/HTMLEncodeTool.tsx
# Should be: '1fr 2fr 2fr'
```

### Sidebar Not Showing

```bash
# Verify TOOL_GROUPS registration
cat src/tools/index.ts | grep -A 10 "html"

# Check useSidebarState
cat src/hooks/useSidebarState.ts | grep "html"
# Should appear in DEFAULT_STATE and parser
```

---

## Next Steps

✅ **Phase 0**: Research complete  
✅ **Phase 1**: Contracts and data model defined  
🔄 **Phase 2**: Implementation (you are here)  
⏳ **Phase 3**: Quality assurance  
⏳ **Phase 4**: Documentation

**Commands**:
```bash
# Continue with detailed task breakdown
/speckit.tasks

# Or manually implement following this guide
npm test -- --watch  # TDD workflow
```

---

## Additional Resources

**Specifications**:
- [Feature Spec](./spec.md) - Full requirements
- [Implementation Plan](./plan.md) - Technical approach
- [Research Document](./research.md) - Encoding algorithms
- [Data Model](./data-model.md) - Interfaces and types
- [HTML Encoder Contract](./contracts/html-encoder-contract.md) - Test specifications
- [URL Encoder Contract](./contracts/url-encoder-contract.md) - Test specifications

**Reference Implementations**:
- `src/components/Tools/Base64EncodeTool.tsx` - Layout pattern
- `src/components/Tools/JSONValidatorTool.tsx` - ToolOptions usage
- `tests/contract/json-minifier.test.tsx` - Contract test example

**External References**:
- [HTML Entities](https://html.spec.whatwg.org/multipage/named-characters.html)
- [RFC 3986 (URI Generic Syntax)](https://www.rfc-editor.org/rfc/rfc3986)
- [encodeURIComponent MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)

---

**Questions?** Check the constitution file (`.specify/memory/constitution.md`) for coding standards and quality gates.

**Ready to code!** 🚀
