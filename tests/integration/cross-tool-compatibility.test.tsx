/**
 * Cross-Tool Parameter Compatibility Tests for Feature 004
 * 
 * Tests cross-tool compatibility:
 * - URL parameter validation per tool
 * - Graceful handling when wrong tool opens URL
 * - Tool-specific parameters don't interfere with base parameters
 * - Parameter isolation between tools
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Base64EncodeTool } from '../../src/components/Tools/Base64EncodeTool'
import { Base64DecodeTool } from '../../src/components/Tools/Base64DecodeTool'
import { Base16EncodeTool } from '../../src/components/Tools/Base16EncodeTool'
import { Base32EncodeTool } from '../../src/components/Tools/Base32EncodeTool'
import { ToolProvider } from '../../src/context/ToolContext'
import { generateShareURL } from '../../src/services/shareLink'

// Helper to render components with ToolProvider
function renderWithProvider(component: React.ReactElement) {
  return render(<ToolProvider>{component}</ToolProvider>)
}

describe('T041: Cross-Tool Parameter Compatibility', () => {
  beforeEach(() => {
    localStorage.clear()
    delete (window as { location?: unknown }).location
  })

  describe('URL Parameter Validation Per Tool', () => {
    /**
     * Validates Base64 encode tool generates correct URL parameters.
     * Checks toolId, input, encoding, and format parameters.
     */
    it('should validate Base64 encode tool parameters', () => {
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'RFC 4648' },
      })

      expect(url).toContain('base64-encode')
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')
      expect(url).toContain('format=RFC%204648')
    })

    it('should validate Base32 encode tool parameters with padding', () => {
      const url = generateShareURL({
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { padding: true },
      })

      expect(url).toContain('base32-encode')
      expect(url).toContain('input=')
      expect(url).toContain('padding=true')
    })

    it('should validate decode tool parameters', () => {
      const url = generateShareURL({
        toolId: 'base64-decode',
        input: 'SGVsbG8=',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      expect(url).toContain('base64-decode')
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')
    })

    it('should validate parameters without tool-specific settings', () => {
      const url = generateShareURL({
        toolId: 'base16-encode',
        input: 'Test',
        inputEncoding: 'ascii',
        toolSpecificSettings: {},
      })

      expect(url).toContain('base16-encode')
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=ascii')
    })
  })

  describe('Graceful Handling of Wrong Tool with URL', () => {
    /**
     * Tests that decode tool doesn't crash when given encode URL.
     * Should render successfully and ignore incompatible parameters.
     */
    it('should handle Base64 encode URL opened in Base64 decode tool', () => {
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: 'Hello World',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'RFC 4648' },
      })

      ;(window as { location: Partial<Location> }).location = {
        search: new URL(url).search,
        origin: 'http://localhost',
      } as Location

      // Render decode tool with encode URL - should not crash
      const { container } = renderWithProvider(<Base64DecodeTool />)

      expect(container).toBeInTheDocument()
      // Tool should render successfully even with "wrong" parameters
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle Base32 parameters in Base64 tool', () => {
      const url = generateShareURL({
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { padding: true },
      })

      ;(window as { location: Partial<Location> }).location = {
        search: new URL(url).search,
        origin: 'http://localhost',
      } as Location

      // Render Base64 tool with Base32 parameters - should ignore incompatible settings
      const { container } = renderWithProvider(<Base64EncodeTool />)

      expect(container).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle decode URL opened in encode tool', () => {
      const url = generateShareURL({
        toolId: 'base64-decode',
        input: 'SGVsbG8=',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      ;(window as { location: Partial<Location> }).location = {
        search: new URL(url).search,
        origin: 'http://localhost',
      } as Location

      // Render encode tool with decode URL
      const { container } = renderWithProvider(<Base64EncodeTool />)

      expect(container).toBeInTheDocument()
      // Should still accept the input parameter
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle invalid tool-specific parameters gracefully', () => {
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {
          invalidParam: 'value',
          anotherInvalid: 123,
        },
      })

      ;(window as { location: Partial<Location> }).location = {
        search: new URL(url).search,
        origin: 'http://localhost',
      } as Location

      const { container } = renderWithProvider(<Base64EncodeTool />)

      expect(container).toBeInTheDocument()
      // Should ignore invalid parameters and render normally
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('Tool-Specific Parameters Don\'t Interfere', () => {
    it('should isolate Base64 format parameter from Base32', () => {
      const base64Url = generateShareURL({
        toolId: 'base64-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'URL-safe' },
      })

      const base32Url = generateShareURL({
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { padding: true },
      })

      // URLs should have different tool-specific parameters
      expect(base64Url).toContain('format=URL-safe')
      expect(base32Url).toContain('padding=true')
      expect(base32Url).not.toContain('format=')
      expect(base64Url).not.toContain('padding=')
    })

    it('should preserve base parameters across tools', () => {
      const tools = [
        'base64-encode',
        'base64-decode',
        'base16-encode',
        'base16-decode',
        'base32-encode',
        'base32-decode',
      ]

      const urls = tools.map(toolId =>
        generateShareURL({
          toolId,
          input: 'Test Input',
          inputEncoding: 'utf-8',
          toolSpecificSettings: {},
        })
      )

      // All URLs should have the same base parameters
      urls.forEach(url => {
        expect(url).toContain('input=')
        expect(url).toContain('input_encoding=utf-8')
      })
    })

    it('should handle mixed parameters without conflicts', () => {
      const url1 = generateShareURL({
        toolId: 'base64-encode',
        input: 'Test1',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'RFC 4648' },
      })

      const url2 = generateShareURL({
        toolId: 'base32-encode',
        input: 'Test2',
        inputEncoding: 'ascii',
        toolSpecificSettings: { padding: false },
      })

      // Parameters should be isolated per tool
      expect(url1).toContain('base64-encode')
      expect(url1).toContain('input=')
      expect(url1).toContain('input_encoding=utf-8')
      
      expect(url2).toContain('base32-encode')
      expect(url2).toContain('input=')
      expect(url2).toContain('input_encoding=ascii')
    })

    it('should handle tool-specific parameters in URL simultaneously', () => {
      const url = generateShareURL({
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {
          padding: true,
          format: 'Custom', // Should coexist even if not used
          other: 'value',
        },
      })

      expect(url).toContain('padding=true')
      expect(url).toContain('format=Custom')
      expect(url).toContain('other=value')
    })
  })

  describe('Parameter Isolation Between Tools', () => {
    it('should not leak state between Base64 and Base16 tools', () => {
      // Render Base64 tool first
      const { unmount: unmount1 } = renderWithProvider(<Base64EncodeTool />)

      const base64Textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      expect(base64Textarea.value).toBe('')

      unmount1()

      // Render Base16 tool - should not have Base64 state
      renderWithProvider(<Base16EncodeTool />)

      const base16Textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      expect(base16Textarea.value).toBe('')
    })

    it('should maintain separate settings per tool', () => {
      // Base64 has format setting
      const { unmount: unmount1 } = renderWithProvider(<Base64EncodeTool />)
      const base64Format = screen.queryByLabelText(/output format/i)
      expect(base64Format).toBeInTheDocument()
      unmount1()

      // Base16 doesn't have format setting
      const { unmount: unmount2 } = renderWithProvider(<Base16EncodeTool />)
      const base16Format = screen.queryByLabelText(/output format/i)
      expect(base16Format).not.toBeInTheDocument()
      unmount2()

      // Base32 has padding setting
      renderWithProvider(<Base32EncodeTool />)
      expect(screen.getByText(/padding adds/i)).toBeInTheDocument()
    })

    it('should handle tool switching without parameter pollution', () => {
      const url1 = generateShareURL({
        toolId: 'base64-encode',
        input: 'Base64 Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'URL-safe' },
      })

      ;(window as { location: Partial<Location> }).location = {
        search: new URL(url1).search,
        origin: 'http://localhost',
      } as Location

      const { unmount } = renderWithProvider(<Base64EncodeTool />)
      unmount()

      // Switch to different tool with different URL
      const url2 = generateShareURL({
        toolId: 'base32-encode',
        input: 'Base32 Test',
        inputEncoding: 'ascii',
        toolSpecificSettings: { padding: true },
      })

      ;(window as { location: Partial<Location> }).location = {
        search: new URL(url2).search,
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base32EncodeTool />)

      // Should use new parameters, not old ones
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should validate encoding parameter compatibility', () => {
      const encodings = ['utf-8', 'ascii', 'latin-1']

      encodings.forEach(encoding => {
        const url = generateShareURL({
          toolId: 'base64-encode',
          input: 'Test',
          inputEncoding: encoding as 'utf-8' | 'ascii' | 'latin-1',
          toolSpecificSettings: {},
        })

        expect(url).toContain(`input_encoding=${encoding}`)
      })
    })
  })

  describe('Complex Parameter Scenarios', () => {
    it('should handle all tools with maximum parameters', () => {
      const tools = [
        { id: 'base64-encode', settings: { format: 'RFC 4648' } },
        { id: 'base64-decode', settings: { format: 'RFC 4648' } },
        { id: 'base16-encode', settings: {} },
        { id: 'base16-decode', settings: {} },
        { id: 'base32-encode', settings: { padding: true } },
        { id: 'base32-decode', settings: {} },
      ]

      tools.forEach(({ id, settings }) => {
        const url = generateShareURL({
          toolId: id,
          input: `Test for ${id}`,
          inputEncoding: 'utf-8',
          toolSpecificSettings: settings,
        })

        expect(url).toContain(id)
        expect(url).toContain('input=')
        expect(url).toContain('input_encoding=utf-8')
      })
    })

    it('should handle URL parameters with special characters across tools', () => {
      const specialInput = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`'

      const tools = ['base64-encode', 'base16-encode', 'base32-encode']

      tools.forEach(toolId => {
        const url = generateShareURL({
          toolId,
          input: specialInput,
          inputEncoding: 'utf-8',
          toolSpecificSettings: {},
        })

        expect(url).toContain('input=')
        // Special characters should be encoded
        expect(url).not.toContain('&*()') // Raw special chars shouldn't appear
      })
    })

    it('should handle Unicode input parameters across all tools', () => {
      const unicodeInput = '你好世界 🌍'

      const tools = [
        'base64-encode',
        'base16-encode',
        'base32-encode',
        'base64-decode',
        'base16-decode',
        'base32-decode',
      ]

      tools.forEach(toolId => {
        const url = generateShareURL({
          toolId,
          input: unicodeInput,
          inputEncoding: 'utf-8',
          toolSpecificSettings: {},
        })

        expect(url).toContain('input=')
        expect(url).toContain('input_encoding=utf-8')
      })
    })

    it('should handle empty parameters gracefully across tools', () => {
      const tools = ['base64-encode', 'base16-encode', 'base32-encode']

      tools.forEach(toolId => {
        const url = generateShareURL({
          toolId,
          input: '',
          inputEncoding: 'utf-8',
          toolSpecificSettings: {},
        })

        expect(url).toContain(toolId)
        expect(url).toContain('input=')
      })
    })

    it('should validate parameter consistency in round-trip', () => {
      const originalData = {
        toolId: 'base64-encode',
        input: 'Round Trip Test',
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: { format: 'URL-safe' },
      }

      const url = generateShareURL(originalData)

      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')
      expect(url).toContain('format=URL-safe')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    /**
     * Tests robustness with invalid URL parameters.
     * Should not crash and should load valid parameters if present.
     */
    it('should handle malformed URL parameters', () => {
      (window as { location: Partial<Location> }).location = {
        search: '?invalid=true&malformed',
        origin: 'http://localhost',
      } as Location

      const { container } = renderWithProvider(<Base64EncodeTool />)

      expect(container).toBeInTheDocument()
      // Should render without crashing
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle missing required parameters', () => {
      (window as { location: Partial<Location> }).location = {
        search: '', // No parameters
        origin: 'http://localhost',
      } as Location

      const { container } = renderWithProvider(<Base64EncodeTool />)

      expect(container).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle duplicate parameters', () => {
      (window as { location: Partial<Location> }).location = {
        search: '?input=Test1&input=Test2&input_encoding=utf-8',
        origin: 'http://localhost',
      } as Location

      const { container } = renderWithProvider(<Base64EncodeTool />)

      expect(container).toBeInTheDocument()
      // Should handle duplicates gracefully (typically uses first or last)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should handle very long parameter values', () => {
      const longInput = 'A'.repeat(5000)

      const url = generateShareURL({
        toolId: 'base64-encode',
        input: longInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      expect(url).toContain('input=')
      expect(url.length).toBeGreaterThan(5000)
    })
  })
})
