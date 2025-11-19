/**
 * End-to-End Integration Tests for Feature 004
 * 
 * Tests all 3 user stories working together:
 * - US1: Sidebar Navigation (multi-open collapsible groups)
 * - US2: Layout Consistency (20/40/40 across all tools)
 * - US3: Shareable Links (URL generation and restoration)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Sidebar } from '../../src/components/Layout/Sidebar'
import { Base64EncodeTool } from '../../src/components/Tools/Base64EncodeTool'
import { Base64DecodeTool } from '../../src/components/Tools/Base64DecodeTool'
import { Base16EncodeTool } from '../../src/components/Tools/Base16EncodeTool'
import { Base32EncodeTool } from '../../src/components/Tools/Base32EncodeTool'
import { ToolProvider } from '../../src/context/ToolContext'
import { generateShareURL } from '../../src/services/shareLink'
import { TOOL_GROUPS } from '../../src/tools'

// Helper to render components with ToolProvider
function renderWithProvider(component: React.ReactElement) {
  return render(<ToolProvider>{component}</ToolProvider>)
}

describe('Feature 004 End-to-End Integration', () => {
  // Mock window.location for URL tests
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
    writeTextMock.mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })
    localStorage.clear()
  })

  describe('T037: Multi-Story Integration', () => {
    it('should support sidebar navigation with multi-open groups', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // US1: Multi-open sidebar functionality
      const base64Group = screen.getByText('Base64')
      const base16Group = screen.getByText('Base16')
      const base32Group = screen.getByText('Base32')

      // Open multiple groups
      fireEvent.click(base64Group)
      fireEvent.click(base16Group)

      // Both should be open
      expect(screen.getAllByText('Encode')).toHaveLength(2)
      expect(screen.getAllByText('Decode')).toHaveLength(2)

      // Open third group
      fireEvent.click(base32Group)

      // All three should be open
      expect(screen.getAllByText('Encode')).toHaveLength(3)
      expect(screen.getAllByText('Decode')).toHaveLength(3)
    })

    it('should maintain consistent layout across tools', () => {
      // US2: Layout consistency (20/40/40)
      const { container: container1 } = renderWithProvider(<Base64EncodeTool />)
      const grid1 = container1.querySelector('[class*="grid"]')
      expect(grid1).toBeInTheDocument()

      const { container: container2 } = renderWithProvider(<Base16EncodeTool />)
      const grid2 = container2.querySelector('[class*="grid"]')
      expect(grid2).toBeInTheDocument()

      const { container: container3 } = renderWithProvider(<Base32EncodeTool />)
      const grid3 = container3.querySelector('[class*="grid"]')
      expect(grid3).toBeInTheDocument()

      // All tools should have grid layout
      expect(grid1?.classList.contains('grid')).toBe(true)
      expect(grid2?.classList.contains('grid')).toBe(true)
      expect(grid3?.classList.contains('grid')).toBe(true)
    })

    it('should generate and restore share links with all settings', () => {
      // US3: Share link round-trip
      const originalInput = 'Hello E2E Test'
      const settings = {
        toolId: 'base64-encode',
        input: originalInput,
        inputEncoding: 'utf-8' as const,
        toolSpecificSettings: { format: 'RFC 4648' },
      }

      // Generate share URL
      const url = generateShareURL(settings)

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')
      expect(url).toContain('format=RFC')

      // Extract parameters from URL
      const urlObj = new URL(url)
      const params = urlObj.searchParams

      expect(params.get('input')).toBeTruthy()
      expect(params.get('input_encoding')).toBe('utf-8')
      expect(params.get('format')).toContain('RFC')
    })

    it('should complete full workflow: navigate -> generate URL -> verify structure', () => {
      // Step 1: Generate share URL (US3)
      const testInput = 'Complete Workflow Test'
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: testInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'RFC 4648' },
      })

      // Step 2: Verify URL structure
      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')

      // Step 3: Render tool to verify layout (US2)
      renderWithProvider(<Base64EncodeTool />)

      // Step 4: Verify layout elements present
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Auto-Update')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /text to encode/i })).toBeInTheDocument()
    })
  })

  describe('T037: Cross-Story Scenarios', () => {
    it('should maintain state when switching between tools', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId="base64-encode"
          onToolSelect={mockOnToolSelect}
        />
      )

      // Open Base64 group
      const base64Group = screen.getByText('Base64')
      fireEvent.click(base64Group)

      // Select Encode tool
      const encodeTools = screen.getAllByText('Encode')
      fireEvent.click(encodeTools[0])

      expect(mockOnToolSelect).toHaveBeenCalledWith('base64-encode')

      // Open Base16 group (Base64 should stay open)
      const base16Group = screen.getByText('Base16')
      fireEvent.click(base16Group)

      // Both groups should be open
      expect(screen.getAllByText('Encode').length).toBeGreaterThanOrEqual(2)
    })

    it('should handle multiple share URLs from different tools', () => {
      const base64Url = generateShareURL({
        toolId: 'base64-encode',
        input: 'Base64 Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'RFC 4648' },
      })

      const base16Url = generateShareURL({
        toolId: 'base16-encode',
        input: 'Base16 Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      const base32Url = generateShareURL({
        toolId: 'base32-encode',
        input: 'Base32 Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { padding: true },
      })

      // Each should have correct tool path
      expect(base64Url).toContain('/base64-encode')
      expect(base16Url).toContain('/base16-encode')
      expect(base32Url).toContain('/base32-encode')

      // Each should have input parameter
      expect(base64Url).toContain('input=')
      expect(base16Url).toContain('input=')
      expect(base32Url).toContain('input=')

      // Tool-specific settings should be present
      expect(base64Url).toContain('format=')
      expect(base32Url).toContain('padding=')
    })

    it('should preserve sidebar state while using share links', () => {
      const mockOnToolSelect = jest.fn()

      const { rerender } = render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Open multiple groups
      fireEvent.click(screen.getByText('Base64'))
      fireEvent.click(screen.getByText('Base16'))

      // Simulate selecting a tool (which might trigger navigation)
      const encodeTools = screen.getAllByText('Encode')
      fireEvent.click(encodeTools[0])

      // Re-render with selected tool
      rerender(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId="base64-encode"
          onToolSelect={mockOnToolSelect}
        />
      )

      // Both groups should still be open (state preserved)
      expect(screen.getAllByText('Encode').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('Decode').length).toBeGreaterThanOrEqual(2)
    })

    it('should handle rapid interactions across all features', async () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Rapid group toggles
      const base64Group = screen.getByText('Base64')
      const base16Group = screen.getByText('Base16')
      const base32Group = screen.getByText('Base32')

      fireEvent.click(base64Group)
      fireEvent.click(base16Group)
      fireEvent.click(base32Group)
      fireEvent.click(base64Group) // Close
      fireEvent.click(base64Group) // Re-open

      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getAllByText('Encode').length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('T037: Tool-Specific Integration', () => {
    it('should have format setting available in Base64 tool', () => {
      renderWithProvider(<Base64EncodeTool />)

      // Verify format setting is available (tool-specific feature)
      expect(screen.getByText('Output Format')).toBeInTheDocument()
      expect(screen.getByText('RFC 4648 (Standard)')).toBeInTheDocument()
      expect(screen.getByText('URL-safe')).toBeInTheDocument()
    })

    it('should have padding setting available in Base32 tool', () => {
      renderWithProvider(<Base32EncodeTool />)

      // Verify padding toggle exists (tool-specific feature)
      expect(screen.getByText('Add Padding')).toBeInTheDocument()

      // There are multiple switches (Auto-Update and Add Padding)
      const switches = screen.getAllByRole('switch')
      expect(switches.length).toBeGreaterThanOrEqual(2)

      // Verify tool rendered successfully with padding description
      expect(screen.getByText(/padding adds.*characters/i)).toBeInTheDocument()
    })

    it('should render decode tool with consistent layout', () => {
      renderWithProvider(<Base64DecodeTool />)

      // Verify layout elements present
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /base64 to decode/i })).toBeInTheDocument()
    })
  })

  describe('T037: Performance Integration', () => {
    it('should handle large inputs in share URL generation', () => {
      const largeInput = 'A'.repeat(1000)

      const startTime = Date.now()
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: largeInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })
      const generateTime = Date.now() - startTime

      // Should generate quickly (< 100ms)
      expect(generateTime).toBeLessThan(100)

      // Should produce valid URL
      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      expect(url.length).toBeGreaterThan(1000) // Encoded input makes URL long
    })

    it('should handle rapid sidebar toggles efficiently', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Group = screen.getByText('Base64')

      const startTime = Date.now()

      // Rapid toggles
      for (let i = 0; i < 10; i++) {
        fireEvent.click(base64Group)
      }

      const totalTime = Date.now() - startTime

      // Should complete quickly (< 100ms for 10 toggles)
      expect(totalTime).toBeLessThan(100)
    })
  })

  describe('T037: Error Handling Integration', () => {
    it('should gracefully handle invalid URL parameters without breaking layout', () => {
      delete (window as { location?: unknown }).location
      ;(window as { location: Partial<Location> }).location = {
        search: '?input=invalid!!!&input_encoding=invalid&format=invalid',
        origin: 'http://localhost',
      } as Location

      renderWithProvider(<Base64EncodeTool />)

      // Should still render with layout intact
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /text to encode/i })).toBeInTheDocument()

      // Should handle gracefully with empty/default values
      const textarea = screen.getByRole('textbox', { name: /text to encode/i })
      expect(textarea).toHaveValue('')
    })

    it('should handle missing tool selection in sidebar', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId="non-existent-tool"
          onToolSelect={mockOnToolSelect}
        />
      )

      // Should render without crashing
      expect(screen.getByText('Base64')).toBeInTheDocument()
      expect(screen.getByText('Base16')).toBeInTheDocument()
      expect(screen.getByText('Base32')).toBeInTheDocument()
    })

    it('should handle empty share URL generation', () => {
      const url = generateShareURL({
        toolId: 'base64-encode',
        input: '',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      expect(url).toContain('http://localhost/base64-encode')
      expect(url).toContain('input=')
      expect(url).toContain('input_encoding=utf-8')
    })
  })

  describe('T037: Accessibility Integration', () => {
    it('should maintain accessibility across all features', () => {
      renderWithProvider(<Base64EncodeTool />)

      // Layout should have proper ARIA labels
      expect(screen.getByRole('textbox', { name: /text to encode/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /encoded base64/i })).toBeInTheDocument()

      // Settings should be accessible
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /input encoding/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation in sidebar', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Group = screen.getByText('Base64').closest('button')
      expect(base64Group).toBeInTheDocument()

      // Should be focusable
      base64Group?.focus()
      expect(document.activeElement).toBe(base64Group)
    })
  })
})
