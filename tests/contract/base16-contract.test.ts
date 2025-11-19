/**
 * Base16 (Hex) Encoding Service Contract Tests
 *
 * Validates that Base16 encode/decode services meet contract requirements:
 * - Encode produces lowercase hexadecimal output
 * - Decode accepts case-insensitive input
 * - Whitespace tolerance in decode input
 * - Proper error handling for invalid inputs
 */

import { describe, it, expect } from '@jest/globals'
import { base16EncodeService } from '@/services/base16-encode'
import { base16DecodeService } from '@/services/base16-decode'

describe('Base16 Service Contract', () => {
  describe('Base16 Encode', () => {
    it('should encode "Hello" to "48656c6c6f" (lowercase hex)', async () => {
      const result = await base16EncodeService.execute('Hello')
      expect(result.success).toBe(true)
      expect(result.data).toBe('48656c6c6f')
    })

    it('should encode UTF-8 text correctly', async () => {
      const result = await base16EncodeService.execute('Hello 世界')
      expect(result.success).toBe(true)
      // "Hello " = 48656c6c6f20, "世界" (UTF-8) = e4b896e7958c
      expect(result.data).toBe('48656c6c6f20e4b896e7958c')
    })

    it('should encode empty string to empty string', async () => {
      const result = await base16EncodeService.execute('')
      expect(result.success).toBe(true)
      expect(result.data).toBe('')
    })

    it('should encode ASCII text correctly', async () => {
      const result = await base16EncodeService.execute('ABC', { inputEncoding: 'ASCII' })
      expect(result.success).toBe(true)
      expect(result.data).toBe('414243')
    })

    it('should reject non-ASCII text with ASCII encoding', async () => {
      const result = await base16EncodeService.execute('café', { inputEncoding: 'ASCII' })
      expect(result.success).toBe(false)
      expect(result.error).toContain('non-ASCII')
    })
  })

  describe('Base16 Decode', () => {
    it('should decode "48656c6c6f" to "Hello"', async () => {
      const result = await base16DecodeService.execute('48656c6c6f')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should accept case-insensitive input (uppercase)', async () => {
      const result = await base16DecodeService.execute('48656C6C6F')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should accept case-insensitive input (mixed case)', async () => {
      const result = await base16DecodeService.execute('48656c6C6F')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should tolerate whitespace (spaces)', async () => {
      const result = await base16DecodeService.execute('48 65 6c 6c 6f')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should tolerate whitespace (newlines)', async () => {
      const result = await base16DecodeService.execute('48\n65\n6c\n6c\n6f')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should tolerate mixed whitespace', async () => {
      const result = await base16DecodeService.execute('48 65\n6c 6c 6f')
      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
    })

    it('should reject invalid hex characters', async () => {
      const result = await base16DecodeService.execute('48G5')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid')
    })

    it('should reject odd number of hex digits', async () => {
      const result = await base16DecodeService.execute('486')
      expect(result.success).toBe(false)
      expect(result.error).toContain('even number')
    })

    it('should decode empty string to empty string', async () => {
      const result = await base16DecodeService.execute('')
      expect(result.success).toBe(true)
      expect(result.data).toBe('')
    })
  })

  describe('Base16 Roundtrip', () => {
    it('should successfully encode then decode UTF-8 text', async () => {
      const original = 'Hello World'
      const encoded = await base16EncodeService.execute(original)
      expect(encoded.success).toBe(true)

      const decoded = await base16DecodeService.execute(encoded.data!)
      expect(decoded.success).toBe(true)
      expect(decoded.data).toBe(original)
    })

    it('should successfully encode then decode special characters', async () => {
      const original = '!@#$%^&*()'
      const encoded = await base16EncodeService.execute(original)
      expect(encoded.success).toBe(true)

      const decoded = await base16DecodeService.execute(encoded.data!)
      expect(decoded.success).toBe(true)
      expect(decoded.data).toBe(original)
    })
  })
})
