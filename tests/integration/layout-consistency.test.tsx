/**
 * Integration tests for Layout Consistency (User Story 2)
 * 
 * Tests that all encoding tools use consistent 20/40/40 layout
 */

import { render, screen } from '@testing-library/react'
import { ToolProvider } from '../../src/context/ToolContext'
import { Base64EncodeTool } from '../../src/components/Tools/Base64EncodeTool'
import { Base64DecodeTool } from '../../src/components/Tools/Base64DecodeTool'
import { Base16EncodeTool } from '../../src/components/Tools/Base16EncodeTool'
import { Base16DecodeTool } from '../../src/components/Tools/Base16DecodeTool'
import { Base32EncodeTool } from '../../src/components/Tools/Base32EncodeTool'
import { Base32DecodeTool } from '../../src/components/Tools/Base32DecodeTool'

// Helper to wrap components with ToolProvider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<ToolProvider>{component}</ToolProvider>)
}

// Helper to check grid layout
const hasCorrectGridLayout = (container: HTMLElement): boolean => {
  const gridContainer = container.querySelector('.grid')
  if (!gridContainer) return false

  const gridTemplateColumns = gridContainer.getAttribute('style')
  
  // Check for inline style with 1fr 2fr 2fr pattern
  return gridTemplateColumns?.includes('1fr 2fr 2fr') || false
}

// Helper to check for overflow-y-auto on columns
const hasIndependentScrolling = (container: HTMLElement): boolean => {
  const columns = container.querySelectorAll('.overflow-y-auto')
  // Should have at least the settings column with overflow-y-auto
  return columns.length > 0
}

describe('Layout Consistency Integration', () => {
  describe('Base64 Encode Tool', () => {
    it('should use 20/40/40 grid layout', () => {
      const { container } = renderWithProvider(<Base64EncodeTool />)
      expect(hasCorrectGridLayout(container)).toBe(true)
    })

    it('should have independent scrolling columns', () => {
      const { container } = renderWithProvider(<Base64EncodeTool />)
      expect(hasIndependentScrolling(container)).toBe(true)
    })

    it('should render all three columns', () => {
      renderWithProvider(<Base64EncodeTool />)
      
      // Settings column content
      expect(screen.getByText('Auto-Update')).toBeInTheDocument()
      
      // Input column
      expect(screen.getByLabelText('Text to Encode')).toBeInTheDocument()
      
      // Output column
      expect(screen.getByLabelText('Encoded Base64')).toBeInTheDocument()
    })
  })

  describe('Base64 Decode Tool', () => {
    it('should use 20/40/40 grid layout', () => {
      const { container } = renderWithProvider(<Base64DecodeTool />)
      expect(hasCorrectGridLayout(container)).toBe(true)
    })

    it('should have independent scrolling columns', () => {
      const { container } = renderWithProvider(<Base64DecodeTool />)
      expect(hasIndependentScrolling(container)).toBe(true)
    })

    it('should render all three columns', () => {
      renderWithProvider(<Base64DecodeTool />)
      
      // Settings column content
      expect(screen.getByText('Auto-Update')).toBeInTheDocument()
      
      // Input column
      expect(screen.getByLabelText('Base64 to Decode')).toBeInTheDocument()
      
      // Output column
      expect(screen.getByLabelText('Decoded Text')).toBeInTheDocument()
    })
  })

  describe('Base16 Encode Tool', () => {
    it('should use 20/40/40 grid layout', () => {
      const { container } = renderWithProvider(<Base16EncodeTool />)
      expect(hasCorrectGridLayout(container)).toBe(true)
    })

    it('should have independent scrolling columns', () => {
      const { container } = renderWithProvider(<Base16EncodeTool />)
      expect(hasIndependentScrolling(container)).toBe(true)
    })
  })

  describe('Base16 Decode Tool', () => {
    it('should use 20/40/40 grid layout', () => {
      const { container } = renderWithProvider(<Base16DecodeTool />)
      expect(hasCorrectGridLayout(container)).toBe(true)
    })

    it('should have independent scrolling columns', () => {
      const { container } = renderWithProvider(<Base16DecodeTool />)
      expect(hasIndependentScrolling(container)).toBe(true)
    })
  })

  describe('Base32 Encode Tool', () => {
    it('should use 20/40/40 grid layout', () => {
      const { container } = renderWithProvider(<Base32EncodeTool />)
      expect(hasCorrectGridLayout(container)).toBe(true)
    })

    it('should have independent scrolling columns', () => {
      const { container } = renderWithProvider(<Base32EncodeTool />)
      expect(hasIndependentScrolling(container)).toBe(true)
    })
  })

  describe('Base32 Decode Tool', () => {
    it('should use 20/40/40 grid layout', () => {
      const { container } = renderWithProvider(<Base32DecodeTool />)
      expect(hasCorrectGridLayout(container)).toBe(true)
    })

    it('should have independent scrolling columns', () => {
      const { container } = renderWithProvider(<Base32DecodeTool />)
      expect(hasIndependentScrolling(container)).toBe(true)
    })
  })

  describe('Cross-Tool Consistency', () => {
    it('should have consistent grid structure across all 6 tools', () => {
      const tools = [
        <Base64EncodeTool />,
        <Base64DecodeTool />,
        <Base16EncodeTool />,
        <Base16DecodeTool />,
        <Base32EncodeTool />,
        <Base32DecodeTool />,
      ]

      tools.forEach((tool) => {
        const { container, unmount } = renderWithProvider(tool)
        expect(hasCorrectGridLayout(container)).toBe(true)
        expect(hasIndependentScrolling(container)).toBe(true)
        unmount()
      })
    })

    it('should maintain layout at minimum viewport (1024px)', () => {
      // Set viewport width
      global.innerWidth = 1024

      const { container } = renderWithProvider(<Base64EncodeTool />)
      
      // Grid should still be applied
      expect(hasCorrectGridLayout(container)).toBe(true)
      
      // All columns should be visible
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeTruthy()
    })

    it('should maintain layout at larger viewport (1920px)', () => {
      // Set viewport width
      global.innerWidth = 1920

      const { container } = renderWithProvider(<Base16EncodeTool />)
      
      // Grid should still be applied
      expect(hasCorrectGridLayout(container)).toBe(true)
    })
  })

  describe('Column Proportions', () => {
    it('should maintain correct proportions in Base64 tools', () => {
      const { container: encodeContainer } = renderWithProvider(<Base64EncodeTool />)
      const { container: decodeContainer } = renderWithProvider(<Base64DecodeTool />)

      expect(hasCorrectGridLayout(encodeContainer)).toBe(true)
      expect(hasCorrectGridLayout(decodeContainer)).toBe(true)
    })

    it('should maintain correct proportions in Base16 tools', () => {
      const { container: encodeContainer } = renderWithProvider(<Base16EncodeTool />)
      const { container: decodeContainer } = renderWithProvider(<Base16DecodeTool />)

      expect(hasCorrectGridLayout(encodeContainer)).toBe(true)
      expect(hasCorrectGridLayout(decodeContainer)).toBe(true)
    })

    it('should maintain correct proportions in Base32 tools', () => {
      const { container: encodeContainer } = renderWithProvider(<Base32EncodeTool />)
      const { container: decodeContainer } = renderWithProvider(<Base32DecodeTool />)

      expect(hasCorrectGridLayout(encodeContainer)).toBe(true)
      expect(hasCorrectGridLayout(decodeContainer)).toBe(true)
    })
  })
})
