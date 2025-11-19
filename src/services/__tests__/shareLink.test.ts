/**
 * Tests for Share Link Service
 * 
 * Contract: Generate shareable URLs with Base64-encoded input and settings
 */

import { generateShareURL, buildQueryString } from '../shareLink'
import type { ToolSettings } from '@/types/tools'

describe('shareLink Service', () => {
  describe('generateShareURL', () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'

    it('should generate URL for Base64 Encode tool', () => {
      const settings: ToolSettings = {
        toolId: 'base64-encode',
        input: 'Hello World',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'RFC 4648' },
      }

      const url = generateShareURL(settings)

      expect(url).toContain(`${baseUrl}/base64-encode`)
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')
      expect(url).toContain('format=RFC%204648')
    })

    it('should generate URL for Base32 tool with padding', () => {
      const settings: ToolSettings = {
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { padding: true },
      }

      const url = generateShareURL(settings)

      expect(url).toContain('/base32-encode')
      expect(url).toContain('input=')
      expect(url).toContain('padding=true')
    })

    it('should encode input as Base64', () => {
      const settings: ToolSettings = {
        toolId: 'base16-encode',
        input: 'Hello',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)
      const urlObj = new URL(url)
      const inputParam = urlObj.searchParams.get('input')

      expect(inputParam).toBeTruthy()
      // Should be Base64-encoded "Hello"
      expect(atob(inputParam!.replace(/-/g, '+').replace(/_/g, '/'))).toContain('Hello')
    })

    it('should handle empty input', () => {
      const settings: ToolSettings = {
        toolId: 'base64-encode',
        input: '',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('/base64-encode')
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')
    })

    it('should handle special characters in input', () => {
      const settings: ToolSettings = {
        toolId: 'base64-encode',
        input: 'Hello & Goodbye! @#$%',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)
      
      expect(url).toContain('input=')
      expect(url).not.toContain('&Goodbye') // Should be encoded, not literal &
    })

    it('should handle Unicode characters', () => {
      const settings: ToolSettings = {
        toolId: 'base64-encode',
        input: 'Hello 世界 😂',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)
      
      expect(url).toContain('input=')
      // URL should be valid
      expect(() => new URL(url)).not.toThrow()
    })

    it('should include tool-specific settings', () => {
      const settings: ToolSettings = {
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'ascii',
        toolSpecificSettings: {
          padding: false,
          uppercase: true,
        },
      }

      const url = generateShareURL(settings)

      expect(url).toContain('padding=false')
      expect(url).toContain('uppercase=true')
    })

    it('should handle long inputs efficiently', () => {
      const longInput = 'A'.repeat(1000)
      const settings: ToolSettings = {
        toolId: 'base64-encode',
        input: longInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('input=')
      expect(url.length).toBeGreaterThan(1000)
      expect(url.length).toBeLessThan(3000) // Should still be reasonable
    })
  })

  describe('buildQueryString', () => {
    it('should build query string from parameters', () => {
      const params = {
        input: 'SGVsbG8=',
        input_encoding: 'utf-8',
        format: 'RFC 4648',
      }

      const queryString = buildQueryString(params)

      expect(queryString).toContain('input=SGVsbG8')
      expect(queryString).toContain('input_encoding=utf-8')
      expect(queryString).toContain('format=RFC%204648')
    })

    it('should handle boolean values', () => {
      const params = {
        input: 'test',
        padding: true,
        enabled: false,
      }

      const queryString = buildQueryString(params)

      expect(queryString).toContain('padding=true')
      expect(queryString).toContain('enabled=false')
    })

    it('should handle numeric values', () => {
      const params = {
        input: 'test',
        maxLength: 100,
        count: 0,
      }

      const queryString = buildQueryString(params)

      expect(queryString).toContain('maxLength=100')
      expect(queryString).toContain('count=0')
    })

    it('should URL-encode special characters', () => {
      const params = {
        input: 'Hello World!',
        message: 'A & B',
      }

      const queryString = buildQueryString(params)

      expect(queryString).not.toContain(' ') // Spaces should be encoded
      expect(queryString).toContain('%20') // Space encoding
      expect(queryString).toContain('%26') // & encoding
    })

    it('should handle empty object', () => {
      const params = {}

      const queryString = buildQueryString(params)

      expect(queryString).toBe('')
    })

    it('should skip undefined values', () => {
      const params = {
        input: 'test',
        undefined_param: undefined,
        valid_param: 'value',
      }

      const queryString = buildQueryString(params)

      expect(queryString).toContain('input=test')
      expect(queryString).toContain('valid_param=value')
      expect(queryString).not.toContain('undefined_param')
    })

    it('should skip null values', () => {
      const params = {
        input: 'test',
        null_param: null,
        valid_param: 'value',
      }

      const queryString = buildQueryString(params)

      expect(queryString).not.toContain('null_param')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long query strings', () => {
      const settings: ToolSettings = {
        toolId: 'base64-encode',
        input: 'X'.repeat(2000),
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      // Should still generate a valid URL
      expect(() => new URL(url)).not.toThrow()
    })

    it('should handle tool ID with special characters', () => {
      const settings: ToolSettings = {
        toolId: 'base64-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('/base64-encode')
    })

    it('should generate consistent URLs for same input', () => {
      const settings: ToolSettings = {
        toolId: 'base64-encode',
        input: 'Consistent Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'RFC 4648' },
      }

      const url1 = generateShareURL(settings)
      const url2 = generateShareURL(settings)

      expect(url1).toBe(url2)
    })

    it('should generate different URLs for different inputs', () => {
      const settings1: ToolSettings = {
        toolId: 'base64-encode',
        input: 'Input 1',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const settings2: ToolSettings = {
        toolId: 'base64-encode',
        input: 'Input 2',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      }

      const url1 = generateShareURL(settings1)
      const url2 = generateShareURL(settings2)

      expect(url1).not.toBe(url2)
    })
  })
})
