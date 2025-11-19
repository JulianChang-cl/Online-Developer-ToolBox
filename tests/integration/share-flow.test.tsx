/**
 * Integration tests for Shareable Links (User Story 3)
 * 
 * Tests complete share-and-restore flow:
 * 1. ShareButton generates valid URLs with parameters
 * 2. Tools restore input and settings from URL parameters
 * 3. URL encoding/decoding contract validation
 * 4. Edge cases (long inputs, Unicode, special characters)
 */

import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Base64EncodeTool } from '../../src/components/Tools/Base64EncodeTool'
import { Base64DecodeTool } from '../../src/components/Tools/Base64DecodeTool'
import { Base32EncodeTool } from '../../src/components/Tools/Base32EncodeTool'
import { ToolProvider } from '../../src/context/ToolContext'
import { generateShareURL } from '../../src/services/shareLink'
import { validateURLParameters, decodeInputFromURL, encodeInputForURL } from '../../src/services/urlParameters'

// Helper to render components with ToolProvider
function renderWithProvider(component: React.ReactElement) {
  return render(<ToolProvider>{component}</ToolProvider>)
}

describe('Share Flow Integration Tests', () => {
  // Mock window.location for URL generation
  beforeAll(() => {
    delete (window as { location?: unknown }).location
    ;(window as { location: Partial<Location> }).location = {
      origin: 'http://localhost',
    } as Location
  })

  // Mock clipboard API
  const writeTextMock = jest.fn()
  beforeEach(() => {
    writeTextMock.mockClear()
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })
  })

  describe('T035: ShareButton URL Generation', () => {
    it('should generate valid URL with encoded input for Base64 Encode', () => {
      const settings = {
        toolId: 'base64-encode',
        input: 'Hello World',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: { format: 'RFC 4648' },
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')
      expect(url).toContain('format=RFC')
    })

    it('should generate valid URL with all tool-specific settings for Base64 Encode', () => {
      const settings = {
        toolId: 'base64-encode',
        input: 'Test input',
        inputEncoding: 'ascii' as const,
        toolSpecificSettings: {
          format: 'URL-safe',
        },
      }

      const url = generateShareURL(settings)

      expect(url).toContain('input_encoding=ascii')
      expect(url).toContain('format=URL-safe')
    })

    it('should generate valid URL with format setting for Base64 Decode', () => {
      const settings = {
        toolId: 'base64-decode',
        input: 'SGVsbG8=',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: { format: 'RFC 4648' },
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base64-decode')
      expect(url).toContain('input=')
      expect(url).toContain('format=RFC')
    })

    it('should generate valid URL with input encoding for Base16 Encode', () => {
      const settings = {
        toolId: 'base16-encode',
        input: 'Test',
        inputEncoding: 'latin-1' as const,
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base16-encode')
      expect(url).toContain('input_encoding=latin-1')
    })

    it('should generate valid URL for Base16 Decode', () => {
      const settings = {
        toolId: 'base16-decode',
        input: '48656C6C6F',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base16-decode')
      expect(url).toContain('input=')
    })

    it('should generate valid URL with padding for Base32 Encode', () => {
      const settings = {
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: { padding: true },
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base32-encode')
      expect(url).toContain('padding=true')
    })

    it('should generate valid URL without padding for Base32 Encode', () => {
      const settings = {
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: { padding: false },
      }

      const url = generateShareURL(settings)

      expect(url).toContain('padding=false')
    })

    it('should generate valid URL for Base32 Decode', () => {
      const settings = {
        toolId: 'base32-decode',
        input: 'KRSXG5A=',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base32-decode')
      expect(url).toContain('input=')
    })

    it('should handle empty input correctly', () => {
      const settings = {
        toolId: 'base64-encode',
        input: '',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
    })

    it('should encode special characters correctly', () => {
      const settings = {
        toolId: 'base64-encode',
        input: 'Hello & Goodbye < > " \' /',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      // URL should not contain raw special characters
      expect(url).not.toContain('&Goodbye')
      expect(url).not.toContain('<')
      expect(url).not.toContain('>')
    })

    it('should encode Unicode correctly', () => {
      const settings = {
        toolId: 'base64-encode',
        input: '你好世界 🌍',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: {},
      }

      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      // Should be Base64 encoded
      expect(url).not.toContain('你好')
      expect(url).not.toContain('🌍')
    })
  })

  describe('T035: URL Parameter Restoration', () => {
    it('should restore input from URL for Base64 Encode', () => {
      // Simulate URL with parameters
      const originalInput = 'Hello World'
      const encodedInput = encodeInputForURL(originalInput)
      const searchParams = `?input=${encodedInput}&input_encoding=utf-8`

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Input should be restored
      waitFor(() => {
        const textarea = screen.getByRole('textbox', { name: /text to encode/i })
        expect(textarea).toHaveValue(originalInput)
      })
    })

    it('should restore input encoding from URL for Base64 Encode', () => {
      const originalInput = 'Test'
      const encodedInput = encodeInputForURL(originalInput)
      const searchParams = `?input=${encodedInput}&input_encoding=ascii`

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Check if ASCII encoding is selected (this would require finding the select element)
      waitFor(() => {
        const select = screen.getByRole('combobox', { name: /input encoding/i })
        expect(select).toHaveValue('ASCII')
      })
    })

    it('should restore format from URL for Base64 Encode', () => {
      const originalInput = 'Test'
      const encodedInput = encodeInputForURL(originalInput)
      const searchParams = `?input=${encodedInput}&format=URL-safe`

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Check if URL-safe format is selected
      waitFor(() => {
        const formatButtons = screen.getAllByRole('button')
        const urlSafeButton = formatButtons.find(btn => btn.textContent?.includes('URL-safe'))
        expect(urlSafeButton).toHaveAttribute('data-selected', 'true')
      })
    })

    it('should restore input from URL for Base64 Decode', () => {
      const originalInput = 'SGVsbG8gV29ybGQ='
      const encodedInput = encodeInputForURL(originalInput)
      const searchParams = `?input=${encodedInput}`

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64DecodeTool />)

      waitFor(() => {
        const textarea = screen.getByRole('textbox', { name: /input text/i })
        expect(textarea).toHaveValue(originalInput)
      })
    })

    it('should restore padding from URL for Base32 Encode', () => {
      const originalInput = 'Test'
      const encodedInput = encodeInputForURL(originalInput)
      const searchParams = `?input=${encodedInput}&padding=false`

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base32EncodeTool />)

      // Check if padding is disabled
      waitFor(() => {
        const paddingCheckbox = screen.getByRole('checkbox', { name: /padding/i })
        expect(paddingCheckbox).not.toBeChecked()
      })
    })

    it('should handle missing input parameter gracefully', () => {
      const searchParams = '?input_encoding=utf-8'

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Should render without crashing
      expect(screen.getByRole('textbox', { name: /text to encode/i })).toBeInTheDocument()
    })

    it('should handle invalid Base64 input gracefully', () => {
      const searchParams = '?input=invalid!!!base64&input_encoding=utf-8'

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Should render with empty input (invalid Base64 is rejected)
      const textarea = screen.getByRole('textbox', { name: /text to encode/i })
      expect(textarea).toHaveValue('')
    })
  })

  describe('T036: Contract Validation', () => {
    it('should validate URL parameters correctly for valid input', () => {
      const params = {
        input: encodeInputForURL('Hello'),
        input_encoding: 'utf-8',
        format: 'RFC 4648',
      }

      const validated = validateURLParameters(params)

      expect(validated.input).toBeTruthy()
      expect(validated.input_encoding).toBe('utf-8')
      expect(validated.format).toBe('RFC 4648')
    })

    it('should reject invalid input encoding', () => {
      const params = {
        input: encodeInputForURL('Hello'),
        input_encoding: 'invalid-encoding',
      }

      const validated = validateURLParameters(params)

      // Should fall back to default utf-8
      expect(validated.input_encoding).toBe('utf-8')
    })

    it('should handle missing input gracefully', () => {
      const params = {
        input_encoding: 'utf-8',
      }

      const validated = validateURLParameters(params)

      expect(validated.input).toBe('')
      expect(validated.input_encoding).toBe('utf-8')
    })

    it('should preserve tool-specific boolean parameters', () => {
      const params = {
        input: encodeInputForURL('Test'),
        padding: 'true',
      }

      const validated = validateURLParameters(params)

      expect(validated.padding).toBe('true')
    })

    it('should encode and decode input correctly (round-trip)', () => {
      const originalInput = 'Hello World! 你好世界 🌍'
      const encoded = encodeInputForURL(originalInput)
      const decoded = decodeInputFromURL(encoded)

      expect(decoded).toBe(originalInput)
    })

    it('should handle empty input encoding/decoding', () => {
      const encoded = encodeInputForURL('')
      const decoded = decodeInputFromURL(encoded)

      expect(encoded).toBe('')
      expect(decoded).toBe('')
    })

    it('should handle long input encoding/decoding', () => {
      const longInput = 'A'.repeat(10000)
      const encoded = encodeInputForURL(longInput)
      const decoded = decodeInputFromURL(encoded)

      expect(decoded).toBe(longInput)
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('should handle special characters in input', () => {
      const specialInput = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./'
      const encoded = encodeInputForURL(specialInput)
      const decoded = decodeInputFromURL(encoded)

      expect(decoded).toBe(specialInput)
    })

    it('should handle newlines and whitespace', () => {
      const inputWithWhitespace = 'Line 1\nLine 2\r\nLine 3\tTabbed'
      const encoded = encodeInputForURL(inputWithWhitespace)
      const decoded = decodeInputFromURL(encoded)

      expect(decoded).toBe(inputWithWhitespace)
    })

    it('should handle Unicode emoji correctly', () => {
      const emojiInput = '😀 😃 😄 😁 🎉 🌟 ✨'
      const encoded = encodeInputForURL(emojiInput)
      const decoded = decodeInputFromURL(encoded)

      expect(decoded).toBe(emojiInput)
    })

    it('should handle mixed language text', () => {
      const mixedInput = 'English 中文 日本語 한국어 Русский العربية'
      const encoded = encodeInputForURL(mixedInput)
      const decoded = decodeInputFromURL(encoded)

      expect(decoded).toBe(mixedInput)
    })
  })

  describe('T035: Edge Cases', () => {
    it('should handle URL with no parameters', () => {
      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: '',
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Should render normally with empty input
      expect(screen.getByRole('textbox', { name: /text to encode/i })).toHaveValue('')
    })

    it('should handle malformed URL parameters', () => {
      const searchParams = '?input=&input_encoding=&format='

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Should render without crashing
      expect(screen.getByRole('textbox', { name: /text to encode/i })).toBeInTheDocument()
    })

    it('should handle very long input in URL', () => {
      const longInput = 'A'.repeat(5000)
      const encoded = encodeInputForURL(longInput)
      const searchParams = `?input=${encoded}`

      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: searchParams,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Should handle long input gracefully
      waitFor(() => {
        const textarea = screen.getByRole('textbox', { name: /text to encode/i })
        expect(textarea).toHaveValue(longInput)
      })
    })

    it('should handle URL-safe Base64 encoding', () => {
      const input = 'Test input with special chars'
      const encoded = encodeInputForURL(input)
      
      // URL-safe Base64 should not contain +, /, or =
      expect(encoded).not.toContain('+')
      expect(encoded).not.toContain('/')
      expect(encoded).not.toContain('=')
    })

    it('should decode URL-safe Base64 correctly', () => {
      // Manually create URL-safe Base64
      const urlSafeBase64 = 'SGVsbG8gV29ybGQ' // "Hello World" without padding
      const decoded = decodeInputFromURL(urlSafeBase64)

      expect(decoded).toBe('Hello World')
    })
  })

  describe('T036: Cross-Tool Consistency', () => {
    it('should generate consistent URL format across all encode tools', () => {
      const input = 'Test'
      const inputEncoding = 'utf-8' as const

      const base64Url = generateShareURL({
        toolId: 'base64-encode',
        input,
        inputEncoding,
        toolSpecificSettings: {},
      })

      const base16Url = generateShareURL({
        toolId: 'base16-encode',
        input,
        inputEncoding,
        toolSpecificSettings: {},
      })

      const base32Url = generateShareURL({
        toolId: 'base32-encode',
        input,
        inputEncoding,
        toolSpecificSettings: {},
      })

      // All URLs should have same structure
      expect(base64Url).toContain('input=')
      expect(base16Url).toContain('input=')
      expect(base32Url).toContain('input=')

      expect(base64Url).toContain('input_encoding=utf-8')
      expect(base16Url).toContain('input_encoding=utf-8')
      expect(base32Url).toContain('input_encoding=utf-8')
    })

    it('should generate consistent URL format across all decode tools', () => {
      const input = 'SGVsbG8='
      const inputEncoding = 'utf-8' as const

      const base64Url = generateShareURL({
        toolId: 'base64-decode',
        input,
        inputEncoding,
        toolSpecificSettings: {},
      })

      const base16Url = generateShareURL({
        toolId: 'base16-decode',
        input,
        inputEncoding,
        toolSpecificSettings: {},
      })

      const base32Url = generateShareURL({
        toolId: 'base32-decode',
        input,
        inputEncoding,
        toolSpecificSettings: {},
      })

      // All URLs should have same structure
      expect(base64Url).toContain('input=')
      expect(base16Url).toContain('input=')
      expect(base32Url).toContain('input=')
    })

    it('should use same encoding function across all tools', () => {
      const input = 'Hello World'
      
      // Encode once
      const encoded1 = encodeInputForURL(input)
      const encoded2 = encodeInputForURL(input)
      const encoded3 = encodeInputForURL(input)

      // Should produce identical results
      expect(encoded1).toBe(encoded2)
      expect(encoded2).toBe(encoded3)
    })

    it('should validate parameters consistently across all tools', () => {
      const params = {
        input: encodeInputForURL('Test'),
        input_encoding: 'utf-8',
      }

      // Validate multiple times
      const validated1 = validateURLParameters(params)
      const validated2 = validateURLParameters(params)

      expect(validated1).toEqual(validated2)
    })
  })
})
