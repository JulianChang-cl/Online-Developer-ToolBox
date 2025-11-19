/**
 * Tests for URL Parameters Service
 * 
 * Contract: Validate and parse URL parameters for shareable tool links
 */

import { validateURLParameters, decodeInputFromURL } from '../urlParameters'

describe('urlParameters Service', () => {
  describe('validateURLParameters', () => {
    describe('Valid Parameters', () => {
      it('should validate complete valid parameters', () => {
        const params = {
          input: 'SGVsbG8=', // Base64 for "Hello"
          input_encoding: 'utf-8',
        }

        const result = validateURLParameters(params)

        expect(result.input).toBe('SGVsbG8=')
        expect(result.input_encoding).toBe('utf-8')
      })

      it('should accept ascii encoding', () => {
        const params = {
          input: 'dGVzdA==',
          input_encoding: 'ascii',
        }

        const result = validateURLParameters(params)
        expect(result.input_encoding).toBe('ascii')
      })

      it('should accept latin-1 encoding', () => {
        const params = {
          input: 'dGVzdA==',
          input_encoding: 'latin-1',
        }

        const result = validateURLParameters(params)
        expect(result.input_encoding).toBe('latin-1')
      })

      it('should pass through tool-specific parameters', () => {
        const params = {
          input: 'dGVzdA==',
          input_encoding: 'utf-8',
          padding: 'true',
          format: 'RFC 4648',
        }

        const result = validateURLParameters(params)
        expect(result.padding).toBe('true')
        expect(result.format).toBe('RFC 4648')
      })
    })

    describe('Missing Parameters', () => {
      it('should use empty string for missing input', () => {
        const params = {
          input_encoding: 'utf-8',
        }

        const result = validateURLParameters(params)
        expect(result.input).toBe('')
      })

      it('should default to utf-8 for missing input_encoding', () => {
        const params = {
          input: 'SGVsbG8=',
        }

        const result = validateURLParameters(params)
        expect(result.input_encoding).toBe('utf-8')
      })

      it('should handle completely empty parameters object', () => {
        const params = {}

        const result = validateURLParameters(params)
        expect(result.input).toBe('')
        expect(result.input_encoding).toBe('utf-8')
      })
    })

    describe('Invalid Base64 Input', () => {
      it('should use empty string for invalid Base64', () => {
        const params = {
          input: 'not-valid-base64!!!',
          input_encoding: 'utf-8',
        }

        const result = validateURLParameters(params)
        expect(result.input).toBe('')
      })

      it('should use empty string for malformed Base64', () => {
        const params = {
          input: 'SGVs=', // Invalid padding
          input_encoding: 'utf-8',
        }

        const result = validateURLParameters(params)
        expect(result.input).toBe('')
      })
    })

    describe('Invalid Encoding Values', () => {
      it('should default to utf-8 for unknown encoding', () => {
        const params = {
          input: 'SGVsbG8=',
          input_encoding: 'unknown-encoding',
        }

        const result = validateURLParameters(params)
        expect(result.input_encoding).toBe('utf-8')
      })

      it('should default to utf-8 for numeric encoding value', () => {
        const params = {
          input: 'SGVsbG8=',
          input_encoding: 123,
        }

        const result = validateURLParameters(params)
        expect(result.input_encoding).toBe('utf-8')
      })

      it('should default to utf-8 for empty string encoding', () => {
        const params = {
          input: 'SGVsbG8=',
          input_encoding: '',
        }

        const result = validateURLParameters(params)
        expect(result.input_encoding).toBe('utf-8')
      })
    })

    describe('Type Coercion', () => {
      it('should handle boolean parameters as strings', () => {
        const params = {
          input: 'dGVzdA==',
          input_encoding: 'utf-8',
          padding: true, // Boolean instead of string
        }

        const result = validateURLParameters(params)
        expect(result.padding).toBe(true)
      })

      it('should handle numeric parameters', () => {
        const params = {
          input: 'dGVzdA==',
          input_encoding: 'utf-8',
          maxLength: 100,
        }

        const result = validateURLParameters(params)
        expect(result.maxLength).toBe(100)
      })
    })
  })

  describe('decodeInputFromURL', () => {
    it('should decode valid Base64 input', () => {
      const encoded = 'SGVsbG8sIFdvcmxkIQ==' // "Hello, World!"
      const result = decodeInputFromURL(encoded)
      expect(result).toBe('Hello, World!')
    })

    it('should handle URL-safe Base64 characters', () => {
      const encoded = 'c3ViamVjdHM_X2Q9MQ' // "subjects?_d=1" (URL-safe)
      const result = decodeInputFromURL(encoded)
      expect(result).toBe('subjects?_d=1')
    })

    it('should handle empty string', () => {
      const result = decodeInputFromURL('')
      expect(result).toBe('')
    })

    it('should return empty string for invalid Base64', () => {
      const result = decodeInputFromURL('invalid!!!base64')
      expect(result).toBe('')
    })

    it('should handle Unicode characters', () => {
      const encoded = '8J+Ygg==' // "😂" emoji
      const result = decodeInputFromURL(encoded)
      expect(result).toBe('😂')
    })

    it('should handle special characters', () => {
      const encoded = 'SGVsbG8gV29ybGQhICQlXiYqKCk=' // "Hello World! $%^&*()"
      const result = decodeInputFromURL(encoded)
      expect(result).toBe('Hello World! $%^&*()')
    })

    it('should handle very long inputs', () => {
      const longText = 'A'.repeat(1000)
      const encoded = btoa(longText)
      const result = decodeInputFromURL(encoded)
      expect(result).toBe(longText)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null parameters gracefully', () => {
      const params = {
        input: null,
        input_encoding: null,
      }

      const result = validateURLParameters(params)
      expect(result.input).toBe('')
      expect(result.input_encoding).toBe('utf-8')
    })

    it('should handle undefined parameters gracefully', () => {
      const params = {
        input: undefined,
        input_encoding: undefined,
      }

      const result = validateURLParameters(params)
      expect(result.input).toBe('')
      expect(result.input_encoding).toBe('utf-8')
    })

    it('should preserve unknown tool-specific parameters', () => {
      const params = {
        input: 'dGVzdA==',
        input_encoding: 'utf-8',
        customParam1: 'value1',
        customParam2: 42,
        customParam3: false,
      }

      const result = validateURLParameters(params)
      expect(result.customParam1).toBe('value1')
      expect(result.customParam2).toBe(42)
      expect(result.customParam3).toBe(false)
    })
  })
})
