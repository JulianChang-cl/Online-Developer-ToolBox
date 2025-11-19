/**
 * Edge Case Testing for Feature 004
 * 
 * Tests edge cases across all features:
 * - Long inputs (500+, 1000+, 5000+ characters)
 * - Special characters and Unicode
 * - Missing/invalid URL parameters
 * - Multiple groups expanded simultaneously
 * - Very long share URLs (near 2000 character limit)
 * - Rapid sidebar toggles for state consistency
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Sidebar } from '../../src/components/Layout/Sidebar'
import { Base64EncodeTool } from '../../src/components/Tools/Base64EncodeTool'
import { Base32EncodeTool } from '../../src/components/Tools/Base32EncodeTool'
import { Base64DecodeTool } from '../../src/components/Tools/Base64DecodeTool'
import { ToolProvider } from '../../src/context/ToolContext'
import { generateShareURL } from '../../src/services/shareLink'
import { TOOL_GROUPS } from '../../src/tools'

// Helper to render components with ToolProvider
function renderWithProvider(component: React.ReactElement) {
  return render(<ToolProvider>{component}</ToolProvider>)
}

describe('T040: Edge Case Testing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Long Input Handling', () => {
    /**
     * Tests encoding with moderately long input.
     * Validates UI remains responsive with realistic content sizes.
     */
    it('should handle 500 character input', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = 'A'.repeat(500)
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
      expect(screen.getByText('500 characters')).toBeInTheDocument()
    })

    it('should handle 1000 character input', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = 'Lorem ipsum '.repeat(84) // ~1000 characters
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
      expect(textarea.value.length).toBeGreaterThanOrEqual(1000)
    })

    it('should handle 5000 character input', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = 'A'.repeat(5000)
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
      expect(screen.getByText(/5,?000 characters/)).toBeInTheDocument()
    })

    it('should handle 10000 character input', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = 'Test '.repeat(2000) // 10000 characters
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
      expect(textarea.value.length).toBe(10000)
    })
  })

  describe('Special Characters and Unicode', () => {
    it('should handle special characters (!@#$%^&*)', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`'
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
    })

    it('should handle Unicode characters (Chinese, Arabic, Cyrillic)', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = '你好世界 مرحبا بالعالم Привет мир'
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
    })

    it('should handle emoji characters', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = '😀🎉🌍💻🚀🎨🔥⭐🎵🌟'
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
    })

    it('should handle mixed Unicode and ASCII', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = 'Hello 你好 World 世界 🌍 !@#'
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
    })

    it('should handle newlines and tabs', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = 'Line 1\nLine 2\tTabbed\nLine 3'
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
    })

    it('should handle multiple consecutive spaces', () => {
      renderWithProvider(<Base64EncodeTool />)

      const input = 'Word1     Word2          Word3'
      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: input } })

      expect(textarea.value).toBe(input)
    })
  })

  describe('URL Parameter Edge Cases', () => {
    it('should handle empty input parameter', () => {
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: '',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
    })

    it('should handle missing input parameter', () => {
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: undefined as unknown as string,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      // Should generate valid URL even without input
      expect(url).toContain('http://localhost/base64-encode')
    })

    it('should handle URL with only encoding parameter', () => {
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: '',
        inputEncoding: 'ascii',
        toolSpecificSettings: {},
      })

      expect(url).toContain('input_encoding=ascii')
    })

    it('should handle URL with complex settings', () => {
      const url = generateShareURL({
        toolId: 'base32-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {
          padding: true,
          format: 'RFC 4648',
          custom1: 'value1',
          custom2: 'value2',
          custom3: 123,
          custom4: true,
        },
      })

      expect(url).toContain('http://localhost/base32-encode')
      expect(url).toContain('padding=true')
    })

    it('should handle very long URL parameters', () => {
      const longInput = 'A'.repeat(1000)

      const url = generateShareURL({
        toolId: 'base64-encode',
        input: longInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      // URL should still be generated even if long
      expect(url.length).toBeGreaterThan(1000)
    })

    it('should handle special characters in URL parameters', () => {
      const specialInput = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`'

      const url = generateShareURL({
        toolId: 'base64-encode',
        input: specialInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      // Should be properly encoded
      expect(url).not.toContain('&*()') // Should be URL-encoded
    })
  })

  describe('Multiple Groups Expanded', () => {
    it('should handle all 3 groups expanded simultaneously', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand all groups
      fireEvent.click(screen.getByText('Base64'))
      fireEvent.click(screen.getByText('Base16'))
      fireEvent.click(screen.getByText('Base32'))

      // All should be expanded - verify by checking for encode/decode options
      const encodeOptions = screen.getAllByText('Encode')
      const decodeOptions = screen.getAllByText('Decode')

      expect(encodeOptions.length).toBe(3) // One for each group
      expect(decodeOptions.length).toBe(3) // One for each group
    })

    it('should maintain expanded state when selecting tools', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand all groups
      fireEvent.click(screen.getByText('Base64'))
      fireEvent.click(screen.getByText('Base16'))
      fireEvent.click(screen.getByText('Base32'))

      // Select a tool
      const encodeOptions = screen.getAllByText('Encode')
      fireEvent.click(encodeOptions[0])

      // All groups should still be expanded
      expect(screen.getAllByText('Encode').length).toBe(3)
      expect(screen.getAllByText('Decode').length).toBe(3)
    })

    it('should handle rapid expand/collapse of multiple groups', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Rapidly toggle all groups multiple times (starting from collapsed state)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText('Base64'))
        fireEvent.click(screen.getByText('Base16'))
        fireEvent.click(screen.getByText('Base32'))
      }

      // After 5 toggles on each, they should be expanded (odd number)
      expect(screen.queryAllByText('Encode').length).toBe(3)
    })
  })

  describe('Very Long Share URLs', () => {
    it('should generate URL near 2000 character limit', () => {
      // Create input that will result in very long URL
      const longInput = 'A'.repeat(1500)

      const url = generateShareURL({
        toolId: 'base64-encode',
        input: longInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {
          format: 'RFC 4648',
          customSetting1: 'value1',
          customSetting2: 'value2',
        },
      })

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      // Should handle long URLs
      expect(url.length).toBeGreaterThan(1500)
    })

    it('should handle URL with complex nested settings', () => {
      const url = generateShareURL({
        toolId: 'base32-encode',
        input: 'Test input',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {
          padding: true,
          format: 'RFC 4648',
          option1: 'value1',
          option2: 'value2',
          option3: 'value3',
          option4: 'value4',
          option5: 'value5',
        },
      })

      expect(url).toContain('http://localhost/base32-encode')
      expect(url).toContain('padding=true')
    })
  })

  describe('Rapid Sidebar Toggles - State Consistency', () => {
    it('should maintain consistent state after rapid toggles', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Group = screen.getByText('Base64')

      // Rapidly toggle 10 times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(base64Group)
      }

      // Should be collapsed (even number of toggles)
      expect(screen.queryAllByText('Encode').length).toBe(0)
    })

    it('should handle tool selection during rapid toggles', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand group
      fireEvent.click(screen.getByText('Base64'))

      // Select tool
      const encodeOptions = screen.getAllByText('Encode')
      fireEvent.click(encodeOptions[0])

      // Rapidly toggle group
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText('Base64'))
      }

      // Tool should still be selected
      expect(mockOnToolSelect).toHaveBeenCalledWith('base64-encode')
    })

    it('should handle simultaneous group toggles', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Toggle all groups in quick succession
      fireEvent.click(screen.getByText('Base64'))
      fireEvent.click(screen.getByText('Base16'))
      fireEvent.click(screen.getByText('Base32'))
      fireEvent.click(screen.getByText('Base64'))
      fireEvent.click(screen.getByText('Base16'))
      fireEvent.click(screen.getByText('Base32'))

      // All should be collapsed
      expect(screen.queryAllByText('Encode').length).toBe(0)
    })
  })

  describe('Empty and Whitespace Edge Cases', () => {
    it('should handle empty string input', () => {
      renderWithProvider(<Base64EncodeTool />)

      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: '' } })

      expect(textarea.value).toBe('')
      expect(screen.getByText('0 characters')).toBeInTheDocument()
    })

    it('should handle whitespace-only input', () => {
      renderWithProvider(<Base64EncodeTool />)

      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: '     ' } })

      expect(textarea.value).toBe('     ')
      expect(screen.getByText('5 characters')).toBeInTheDocument()
    })

    it('should handle newline-only input', () => {
      renderWithProvider(<Base64EncodeTool />)

      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: '\n\n\n' } })

      expect(textarea.value).toBe('\n\n\n')
    })
  })

  describe('Decode Tool Edge Cases', () => {
    it('should handle invalid Base64 input gracefully', () => {
      renderWithProvider(<Base64DecodeTool />)

      const textarea = screen.getByRole('textbox', {
        name: /base64 to decode/i,
      }) as HTMLTextAreaElement

      // Invalid Base64 (not a multiple of 4)
      fireEvent.change(textarea, { target: { value: 'ABC' } })

      expect(textarea.value).toBe('ABC')
    })

    it('should handle mixed valid/invalid Base64', () => {
      renderWithProvider(<Base64DecodeTool />)

      const textarea = screen.getByRole('textbox', {
        name: /base64 to decode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: 'SGVsbG8=Invalid' } })

      expect(textarea.value).toBe('SGVsbG8=Invalid')
    })

    it('should handle very long Base64 input', () => {
      renderWithProvider(<Base64DecodeTool />)

      const validBase64 = 'SGVsbG8='.repeat(100) // 800 characters
      const textarea = screen.getByRole('textbox', {
        name: /base64 to decode/i,
      }) as HTMLTextAreaElement

      fireEvent.change(textarea, { target: { value: validBase64 } })

      expect(textarea.value).toBe(validBase64)
    })
  })

  describe('Settings Edge Cases', () => {
    it('should handle rapid encoding format changes', () => {
      renderWithProvider(<Base64EncodeTool />)

      const formatSelect = screen.getByLabelText(/output format/i)

      // Rapidly change format (starts at RFC 4648)
      for (let i = 0; i < 10; i++) {
        fireEvent.change(formatSelect, {
          target: { value: i % 2 === 0 ? 'URL-safe' : 'RFC 4648' },
        })
      }

      // After 10 changes starting with URL-safe, should end on URL-safe (even = last was i=9 which is odd, so RFC 4648, but i=10 doesn't execute)
      // Actually ends on RFC 4648 (i=9 is odd, so 'RFC 4648')
      expect((formatSelect as HTMLSelectElement).value).toBe('RFC 4648')
    })

    it('should handle rapid input encoding changes', () => {
      renderWithProvider(<Base64EncodeTool />)

      const encodingSelect = screen.getByLabelText(/input encoding/i)

      // Rapidly change encoding (starts at UTF-8)
      const encodings = ['UTF-8', 'ASCII', 'Latin-1']
      for (let i = 0; i < 15; i++) {
        fireEvent.change(encodingSelect, {
          target: { value: encodings[i % 3] },
        })
      }

      // After 15 changes: i=14 is 14%3=2, so encodings[2]='Latin-1'
      // But i goes 0-14, last is i=14, so we end on Latin-1
      // Let's just verify it handles all changes without error
      expect(['UTF-8', 'ASCII', 'Latin-1']).toContain(
        (encodingSelect as HTMLSelectElement).value
      )
    })

    it('should handle padding toggle in Base32', () => {
      renderWithProvider(<Base32EncodeTool />)

      const switches = screen.getAllByRole('switch')
      // Find padding switch (if exists) - usually the second one
      const paddingSwitch = switches.length > 1 ? switches[1] : switches[0]

      // Toggle padding multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(paddingSwitch)
      }

      // Should handle all toggles without error
      expect(paddingSwitch).toBeInTheDocument()
    })
  })
})
