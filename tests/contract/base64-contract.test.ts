/**
 * Contract Tests for Base64 Encoder/Decoder
 *
 * These tests define the contract that the Base64 service must fulfill.
 * Following TDD: Write tests FIRST, ensure they FAIL, then implement.
 *
 * Contract Requirements:
 * 1. Encode simple text to Base64
 * 2. Decode Base64 to plain text
 * 3. Detect and report invalid Base64
 * 4. Support URL-safe variant encoding
 * 5. Handle large inputs (100KB) within 50ms
 * 6. Handle edge cases: empty input, special characters, unicode
 */

import { describe, it, expect } from '@jest/globals'
import { base64Service } from '@/services/base64'

describe('Base64 Service Contract Tests', () => {
  describe('Basic Encoding', () => {
    it('should encode simple text to Base64', async () => {
      const result = await base64Service.execute('Hello, World!', {
        operation: 'encode',
        variant: 'standard',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('SGVsbG8sIFdvcmxkIQ==')
      expect(result.executionTime).toBeDefined()
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('should encode empty string', async () => {
      const result = await base64Service.execute('', {
        operation: 'encode',
        variant: 'standard',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('')
    })

    it('should encode text with special characters', async () => {
      const result = await base64Service.execute('Hello@#$%^&*()', {
        operation: 'encode',
        variant: 'standard',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(typeof result.data).toBe('string')
    })

    it('should encode unicode characters', async () => {
      const result = await base64Service.execute('Hello 世界 🌍', {
        operation: 'encode',
        variant: 'standard',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(typeof result.data).toBe('string')
    })
  })

  describe('Basic Decoding', () => {
    it('should decode Base64 to plain text', async () => {
      const result = await base64Service.execute('SGVsbG8sIFdvcmxkIQ==', {
        operation: 'decode',
        variant: 'standard',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello, World!')
    })

    it('should decode empty string', async () => {
      const result = await base64Service.execute('', {
        operation: 'decode',
        variant: 'standard',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('')
    })

    it('should decode Base64 with special characters result', async () => {
      // First encode to get the correct Base64
      const encoded = await base64Service.execute('Hello@#$%^&*()', {
        operation: 'encode',
        variant: 'standard',
      })

      const result = await base64Service.execute(encoded.data!, {
        operation: 'decode',
        variant: 'standard',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello@#$%^&*()')
    })

    it('should decode Base64 with unicode result', async () => {
      const encoded = await base64Service.execute('Hello 世界 🌍', {
        operation: 'encode',
        variant: 'standard',
      })

      const decoded = await base64Service.execute(encoded.data!, {
        operation: 'decode',
        variant: 'standard',
      })

      expect(decoded.success).toBe(true)
      expect(decoded.data).toBe('Hello 世界 🌍')
    })
  })

  describe('Invalid Input Handling', () => {
    it('should return error for invalid Base64', async () => {
      const result = await base64Service.execute('Invalid@Base64!', {
        operation: 'decode',
        variant: 'standard',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Invalid')
    })

    it('should return error for malformed Base64', async () => {
      const result = await base64Service.execute('SGVsbG8=!@#', {
        operation: 'decode',
        variant: 'standard',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('URL-safe Variant', () => {
    it('should encode using URL-safe variant (no +/=)', async () => {
      const result = await base64Service.execute('Hello, World!', {
        operation: 'encode',
        variant: 'urlsafe',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      // URL-safe should not contain + or /
      expect(result.data).not.toContain('+')
      expect(result.data).not.toContain('/')
    })

    it('should decode URL-safe variant', async () => {
      const encoded = await base64Service.execute('Hello, World!', {
        operation: 'encode',
        variant: 'urlsafe',
      })

      const decoded = await base64Service.execute(encoded.data!, {
        operation: 'decode',
        variant: 'urlsafe',
      })

      expect(decoded.success).toBe(true)
      expect(decoded.data).toBe('Hello, World!')
    })

    it('should handle text that produces + and / in standard encoding', async () => {
      const text = 'subjects?_d=1'

      const standardResult = await base64Service.execute(text, {
        operation: 'encode',
        variant: 'standard',
      })

      const urlsafeResult = await base64Service.execute(text, {
        operation: 'encode',
        variant: 'urlsafe',
      })

      expect(standardResult.success).toBe(true)
      expect(urlsafeResult.success).toBe(true)
      expect(standardResult.data).not.toBe(urlsafeResult.data)
    })
  })

  describe('Performance Requirements', () => {
    it('should handle large input (100KB) within 50ms', async () => {
      // Generate 100KB of text
      const largeText = 'A'.repeat(100 * 1024)

      const startTime = performance.now()
      const result = await base64Service.execute(largeText, {
        operation: 'encode',
        variant: 'standard',
      })
      const endTime = performance.now()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(endTime - startTime).toBeLessThan(50)
    })

    it('should decode large Base64 (100KB) within 50ms', async () => {
      // Generate 100KB of text and encode it
      const largeText = 'A'.repeat(100 * 1024)
      const encoded = await base64Service.execute(largeText, {
        operation: 'encode',
        variant: 'standard',
      })

      const startTime = performance.now()
      const result = await base64Service.execute(encoded.data!, {
        operation: 'decode',
        variant: 'standard',
      })
      const endTime = performance.now()

      expect(result.success).toBe(true)
      expect(result.data).toBe(largeText)
      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  describe('Round-trip Consistency', () => {
    it('should maintain data integrity through encode-decode cycle', async () => {
      const originalText = 'The quick brown fox jumps over the lazy dog 🦊'

      const encoded = await base64Service.execute(originalText, {
        operation: 'encode',
        variant: 'standard',
      })

      const decoded = await base64Service.execute(encoded.data!, {
        operation: 'decode',
        variant: 'standard',
      })

      expect(decoded.success).toBe(true)
      expect(decoded.data).toBe(originalText)
    })

    it('should maintain data integrity for URL-safe variant', async () => {
      const originalText = 'subjects?_d=1&foo=bar'

      const encoded = await base64Service.execute(originalText, {
        operation: 'encode',
        variant: 'urlsafe',
      })

      const decoded = await base64Service.execute(encoded.data!, {
        operation: 'decode',
        variant: 'urlsafe',
      })

      expect(decoded.success).toBe(true)
      expect(decoded.data).toBe(originalText)
    })
  })

  describe('Validation', () => {
    it('should validate empty input for encode operation', () => {
      const result = base64Service.validate('', {
        operation: 'encode',
        variant: 'standard',
      })

      expect(result.valid).toBe(true)
    })

    it('should validate non-empty input for encode operation', () => {
      const result = base64Service.validate('Hello', {
        operation: 'encode',
        variant: 'standard',
      })

      expect(result.valid).toBe(true)
    })

    it('should validate empty input for decode operation', () => {
      const result = base64Service.validate('', {
        operation: 'decode',
        variant: 'standard',
      })

      expect(result.valid).toBe(true)
    })

    it('should validate valid Base64 for decode operation', () => {
      const result = base64Service.validate('SGVsbG8sIFdvcmxkIQ==', {
        operation: 'decode',
        variant: 'standard',
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('Default Options', () => {
    it('should provide default options', () => {
      const options = base64Service.getDefaultOptions()

      expect(options).toBeDefined()
      expect(options.operation).toBe('encode')
      expect(options.variant).toBe('standard')
    })
  })
})
