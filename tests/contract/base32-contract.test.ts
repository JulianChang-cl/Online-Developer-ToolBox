/**
 * Base32 Service Contract Tests
 * 
 * Tests for Base32 encoding/decoding services following RFC 4648.
 * Verifies encode/decode roundtrip and format compliance.
 */

import { describe, it, expect } from '@jest/globals'
import { base32EncodeService } from '@/services/base32-encode'
import { base32DecodeService } from '@/services/base32-decode'

describe('Base32 Service Contract', () => {
  describe('Base32 Encode', () => {
    it('should encode "Hello" to "JBSWY3DP" (uppercase, no padding)', async () => {
      const result = await base32EncodeService.execute('Hello', { padding: false })
      if (!result.success) {
        console.log('Error:', result.error)
      }
      expect(result.success).toBe(true)
      expect(result.data).toBe('JBSWY3DP')
    })

    it('should encode "Hello" to "JBSWY3DP" (uppercase, with padding - already 8 chars)', async () => {
      const result = await base32EncodeService.execute('Hello', { padding: true })
      expect(result.success).toBe(true)
      // "Hello" encodes to exactly 8 characters, so no padding added
      expect(result.data).toBe('JBSWY3DP')
    })

    it('should encode "Hi" to "JBUQ====" (with padding)', async () => {
      const result = await base32EncodeService.execute('Hi', { padding: true })
      expect(result.success).toBe(true)
      expect(result.data).toBe('JBUQ====')
    })

    it('should encode UTF-8 text correctly', async () => {
      const result = await base32EncodeService.execute('Hello 👋', { padding: false })
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBeGreaterThan(0)
    })

    it('should encode empty string to empty string', async () => {
      const result = await base32EncodeService.execute('', { padding: false })
      expect(result.success).toBe(true)
      expect(result.data).toBe('')
    })

    it('should encode ASCII text correctly', async () => {
      const result = await base32EncodeService.execute('ABC', { inputEncoding: 'ASCII', padding: false })
      expect(result.success).toBe(true)
      expect(result.data).toBe('IFBEG')
    })

    it('should reject non-ASCII text with ASCII encoding', async () => {
      const result = await base32EncodeService.execute('Café', { inputEncoding: 'ASCII', padding: false })
      expect(result.success).toBe(false)
      expect(result.error).toContain('ASCII')
    })
  })

  describe('Base32 Decode', () => {
    it('should decode "JBSWY3DP" to "Hello" (no padding)', async () => {
      const result = await base32DecodeService.execute('JBSWY3DP')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should decode "JBUQ====" to "Hi" (with padding)', async () => {
      const result = await base32DecodeService.execute('JBUQ====')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hi')
    })

    it('should accept case-insensitive input (lowercase)', async () => {
      const result = await base32DecodeService.execute('jbswy3dp')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should accept case-insensitive input (mixed case)', async () => {
      const result = await base32DecodeService.execute('JbSwY3Dp')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should tolerate whitespace (spaces)', async () => {
      const result = await base32DecodeService.execute('JB SW Y3 DP')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should tolerate whitespace (newlines)', async () => {
      const result = await base32DecodeService.execute('JBSWY3\nDP')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should tolerate mixed whitespace', async () => {
      const result = await base32DecodeService.execute('JBSWY3 \n DP')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should reject invalid Base32 characters', async () => {
      const result = await base32DecodeService.execute('JBSWY1DP') // '1' is invalid
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid')
    })

    it('should decode empty string to empty string', async () => {
      const result = await base32DecodeService.execute('')
      expect(result.success).toBe(true)
      expect(result.data).toBe('')
    })

    it('should handle padding-optional decoding', async () => {
      const withPadding = await base32DecodeService.execute('JBUQ====')
      const withoutPadding = await base32DecodeService.execute('JBUQ')
      
      expect(withPadding.success).toBe(true)
      expect(withoutPadding.success).toBe(true)
      expect(withPadding.data).toBe('Hi')
      expect(withoutPadding.data).toBe('Hi')
    })
  })

  describe('Base32 Roundtrip', () => {
    it('should successfully encode then decode UTF-8 text', async () => {
      const original = 'Hello World'
      const encoded = await base32EncodeService.execute(original, { padding: true })
      expect(encoded.success).toBe(true)
      
      const decoded = await base32DecodeService.execute(encoded.data!)
      expect(decoded.success).toBe(true)
      expect(decoded.data).toBe(original)
    })

    it('should successfully encode then decode special characters', async () => {
      const original = 'Test@123!#'
      const encoded = await base32EncodeService.execute(original, { padding: false })
      expect(encoded.success).toBe(true)
      
      const decoded = await base32DecodeService.execute(encoded.data!)
      expect(decoded.success).toBe(true)
      expect(decoded.data).toBe(original)
    })
  })
})
