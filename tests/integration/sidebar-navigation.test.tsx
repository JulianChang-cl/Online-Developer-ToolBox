/**
 * Integration tests for Sidebar Navigation (User Story 1)
 * 
 * Tests multi-open collapsible groups, navigation, and responsive behavior
 */

import { render, screen, fireEvent, within } from '@testing-library/react'
import { Sidebar } from '../../src/components/Layout/Sidebar'

describe('Sidebar Navigation Integration', () => {
  const mockOnToolSelect = jest.fn()

  beforeEach(() => {
    mockOnToolSelect.mockClear()
    localStorage.clear()
  })

  describe('Initial Render', () => {
    it('should display all 3 groups collapsed on load', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // All groups should be visible
      expect(screen.getByText('Base64')).toBeInTheDocument()
      expect(screen.getByText('Base16')).toBeInTheDocument()
      expect(screen.getByText('Base32')).toBeInTheDocument()

      // Tool items should NOT be visible (groups collapsed)
      expect(screen.queryByText('Encode')).not.toBeInTheDocument()
      expect(screen.queryByText('Decode')).not.toBeInTheDocument()
    })

    it('should display Encoding category header', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      expect(screen.getByText('Encoding')).toBeInTheDocument()
    })
  })

  describe('Group Expand/Collapse', () => {
    it('should expand group when clicking group header', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Header = screen.getByRole('button', { name: /Base64/i, expanded: false })
      fireEvent.click(base64Header)

      // Tool items should now be visible
      const encodeButtons = screen.getAllByText('Encode')
      const decodeButtons = screen.getAllByText('Decode')
      
      expect(encodeButtons.length).toBeGreaterThan(0)
      expect(decodeButtons.length).toBeGreaterThan(0)
    })

    it('should collapse group when clicking expanded group header', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand first
      const base64Header = screen.getByRole('button', { name: /Base64/i })
      fireEvent.click(base64Header)

      // Verify expanded
      expect(screen.getAllByText('Encode').length).toBeGreaterThan(0)

      // Collapse
      fireEvent.click(base64Header)

      // Items should be hidden again (only group headers visible)
      const remainingEncodeButtons = screen.queryAllByText('Encode')
      expect(remainingEncodeButtons.length).toBe(0)
    })
  })

  describe('Multi-Open Behavior', () => {
    it('should allow multiple groups to be open simultaneously', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand Base64
      const base64Header = screen.getByRole('button', { name: /Base64/i })
      fireEvent.click(base64Header)

      // Expand Base16
      const base16Header = screen.getByRole('button', { name: /Base16/i })
      fireEvent.click(base16Header)

      // Both should be expanded - should see 4 tool items (2 encode + 2 decode)
      const encodeButtons = screen.getAllByText('Encode')
      const decodeButtons = screen.getAllByText('Decode')
      
      expect(encodeButtons.length).toBe(2) // Base64 Encode + Base16 Encode
      expect(decodeButtons.length).toBe(2) // Base64 Decode + Base16 Decode
    })

    it('should keep Base64 open when expanding Base16', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand Base64
      fireEvent.click(screen.getByRole('button', { name: /Base64/i }))
      
      const base64Section = screen.getByRole('button', { name: /Base64/i })
        .closest('div')
      const base64Items = within(base64Section!).getAllByRole('button')
      expect(base64Items.length).toBeGreaterThan(1) // Header + items

      // Expand Base16
      fireEvent.click(screen.getByRole('button', { name: /Base16/i }))

      // Base64 should STILL be expanded
      const base64ItemsAfter = within(base64Section!).getAllByRole('button')
      expect(base64ItemsAfter.length).toBeGreaterThan(1)
    })
  })

  describe('Tool Navigation', () => {
    it('should call onToolSelect when clicking tool item', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand Base64 group
      fireEvent.click(screen.getByRole('button', { name: /Base64/i }))

      // Click Encode tool
      const encodeButtons = screen.getAllByText('Encode')
      fireEvent.click(encodeButtons[0])

      expect(mockOnToolSelect).toHaveBeenCalledWith('base64-encode')
    })

    it('should highlight selected tool', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId="base64-encode"
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand Base64 group
      fireEvent.click(screen.getByRole('button', { name: /Base64/i }))

      // Find the Encode button
      const encodeButtons = screen.getAllByText('Encode')
      const selectedButton = encodeButtons[0]

      // Should have selected styling (bg-blue-600)
      expect(selectedButton.className).toContain('bg-blue-600')
    })
  })

  describe('Responsive Behavior', () => {
    it('should apply correct width classes', () => {
      const { container } = render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const sidebar = container.querySelector('aside')
      expect(sidebar?.className).toContain('w-64')
    })

    it('should handle collapsed state', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
          isCollapsed={true}
        />
      )

      const sidebar = screen.getByRole('complementary')
      expect(sidebar.className).toContain('w-16')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on group headers', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Header = screen.getByRole('button', { name: /Base64/i })
      
      expect(base64Header).toHaveAttribute('aria-expanded', 'false')
      expect(base64Header).toHaveAttribute('aria-controls')
    })

    it('should update aria-expanded when group is toggled', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Header = screen.getByRole('button', { name: /Base64/i })
      
      // Initially collapsed
      expect(base64Header).toHaveAttribute('aria-expanded', 'false')

      // Click to expand
      fireEvent.click(base64Header)

      // Should be expanded
      expect(base64Header).toHaveAttribute('aria-expanded', 'true')
    })

    it('should mark selected tool with aria-current', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId="base64-encode"
          onToolSelect={mockOnToolSelect}
        />
      )

      // Expand Base64
      fireEvent.click(screen.getByRole('button', { name: /Base64/i }))

      // Find selected tool button
      const encodeButtons = screen.getAllByText('Encode')
      const selectedButton = encodeButtons[0]

      expect(selectedButton).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Chevron Icons', () => {
    it('should rotate chevron when group is expanded', () => {
      render(
        <Sidebar
          tools={[]}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Header = screen.getByRole('button', { name: /Base64/i })
      const chevron = base64Header.querySelector('svg')

      // Initially not rotated
      expect(chevron).toBeTruthy()
      const initialClasses = chevron?.getAttribute('class') || ''
      expect(initialClasses).not.toContain('rotate-90')

      // Expand group
      fireEvent.click(base64Header)

      // Should be rotated
      const expandedClasses = chevron?.getAttribute('class') || ''
      expect(expandedClasses).toContain('rotate-90')
    })
  })
})
