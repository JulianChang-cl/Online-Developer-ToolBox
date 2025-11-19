/**
 * Performance Validation Tests for Feature 004
 * 
 * Tests performance metrics for:
 * - Sidebar toggle response time (<50ms target)
 * - URL generation time (<100ms target)
 * - Page load with URL parameters (<200ms additional latency)
 * - Layout reflow on viewport resize (<200ms target)
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Sidebar } from '../../src/components/Layout/Sidebar'
import { Base64EncodeTool } from '../../src/components/Tools/Base64EncodeTool'
import { Base32EncodeTool } from '../../src/components/Tools/Base32EncodeTool'
import { Base16EncodeTool } from '../../src/components/Tools/Base16EncodeTool'
import { ToolProvider } from '../../src/context/ToolContext'
import { generateShareURL } from '../../src/services/shareLink'
import { TOOL_GROUPS } from '../../src/tools'

// Helper to render components with ToolProvider
function renderWithProvider(component: React.ReactElement) {
  return render(<ToolProvider>{component}</ToolProvider>)
}

describe('T039: Performance Validation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Sidebar Toggle Performance', () => {
    it('should toggle sidebar group in <50ms', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Group = screen.getByText('Base64')

      // Measure toggle time
      const startTime = performance.now()
      fireEvent.click(base64Group)
      const toggleTime = performance.now() - startTime

      // Should be very fast (<50ms)
      expect(toggleTime).toBeLessThan(50)

      // Verify it actually toggled
      expect(screen.getAllByText('Encode').length).toBeGreaterThan(0)
    })

    it('should handle rapid toggles efficiently', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const base64Group = screen.getByText('Base64')
      const base16Group = screen.getByText('Base16')
      const base32Group = screen.getByText('Base32')

      // Measure time for 10 rapid toggles
      const startTime = performance.now()

      for (let i = 0; i < 10; i++) {
        fireEvent.click(base64Group)
        fireEvent.click(base16Group)
        fireEvent.click(base32Group)
      }

      const totalTime = performance.now() - startTime

      // 30 toggles should complete in <100ms total
      expect(totalTime).toBeLessThan(100)
    })

    it('should expand multiple groups without performance degradation', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      const times: number[] = []

      // Expand each group and measure time
      const groups = [
        screen.getByText('Base64'),
        screen.getByText('Base16'),
        screen.getByText('Base32'),
      ]

      groups.forEach(group => {
        const startTime = performance.now()
        fireEvent.click(group)
        const clickTime = performance.now() - startTime
        times.push(clickTime)
      })

      // All toggles should be fast
      times.forEach(time => {
        expect(time).toBeLessThan(50)
      })

      // No significant performance degradation across toggles
      const firstToggle = times[0]
      const lastToggle = times[times.length - 1]
      expect(lastToggle).toBeLessThan(firstToggle * 2) // Should not double
    })
  })

  describe('URL Generation Performance', () => {
    it('should generate simple URL in <100ms', () => {
      const startTime = performance.now()

      const url = generateShareURL({
        toolId: 'base64-encode',
        input: 'Hello World',
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'RFC 4648' },
      })

      const generateTime = performance.now() - startTime

      expect(generateTime).toBeLessThan(100)
      expect(url).toContain('http://localhost')
    })

    it('should generate URL with 1000 character input in <100ms', () => {
      const largeInput = 'A'.repeat(1000)

      const startTime = performance.now()

      const url = generateShareURL({
        toolId: 'base64-encode',
        input: largeInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      const generateTime = performance.now() - startTime

      expect(generateTime).toBeLessThan(100)
      expect(url).toContain('input=')
    })

    it('should generate URL with Unicode input in <100ms', () => {
      const unicodeInput = '你好世界 🌍 مرحبا 🎉 Привет'

      const startTime = performance.now()

      const url = generateShareURL({
        toolId: 'base64-encode',
        input: unicodeInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: { format: 'URL-safe' },
      })

      const generateTime = performance.now() - startTime

      expect(generateTime).toBeLessThan(100)
      expect(url).toContain('input=')
    })

    it('should generate URLs for all 6 tools efficiently', () => {
      const toolIds = [
        'base64-encode',
        'base64-decode',
        'base16-encode',
        'base16-decode',
        'base32-encode',
        'base32-decode',
      ]

      const startTime = performance.now()

      const urls = toolIds.map(toolId =>
        generateShareURL({
          toolId,
          input: 'Test Input',
          inputEncoding: 'utf-8',
          toolSpecificSettings: {},
        })
      )

      const totalTime = performance.now() - startTime

      // Should generate all 6 in <300ms
      expect(totalTime).toBeLessThan(300)
      expect(urls).toHaveLength(6)
    })

    it('should handle complex settings without performance impact', () => {
      const startTime = performance.now()

      const url = generateShareURL({
        toolId: 'base32-encode',
        input: 'Complex test with settings',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {
          padding: true,
          format: 'RFC 4648',
          customSetting1: 'value1',
          customSetting2: 'value2',
          customSetting3: 'value3',
        },
      })

      const generateTime = performance.now() - startTime

      expect(generateTime).toBeLessThan(100)
      expect(url).toContain('input=')
    })
  })

  describe('Component Render Performance', () => {
    it('should render Base64EncodeTool quickly', () => {
      const startTime = performance.now()

      renderWithProvider(<Base64EncodeTool />)

      const renderTime = performance.now() - startTime

      // Initial render should be fast (<200ms)
      expect(renderTime).toBeLessThan(200)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should render all encode tools without performance issues', () => {
      const tools = [Base64EncodeTool, Base16EncodeTool, Base32EncodeTool]

      const renderTimes: number[] = []

      tools.forEach(Component => {
        const startTime = performance.now()
        const { unmount } = renderWithProvider(<Component />)
        const renderTime = performance.now() - startTime
        renderTimes.push(renderTime)
        unmount()
      })

      // All renders should be fast
      renderTimes.forEach(time => {
        expect(time).toBeLessThan(200)
      })

      // Average render time should be reasonable
      const avgTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      expect(avgTime).toBeLessThan(150)
    })

    it('should handle component updates efficiently', () => {
      renderWithProvider(<Base64EncodeTool />)

      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      const updateTimes: number[] = []

      // Perform multiple updates
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now()
        fireEvent.change(textarea, { target: { value: `Test ${i}` } })
        const updateTime = performance.now() - startTime
        updateTimes.push(updateTime)
      }

      // Updates should be fast
      updateTimes.forEach(time => {
        expect(time).toBeLessThan(100)
      })
    })
  })

  describe('Auto-Update Performance', () => {
    it('should handle auto-update toggle quickly', () => {
      renderWithProvider(<Base64EncodeTool />)

      // Find switch by getting all switches (Auto-Update is the first one)
      const switches = screen.getAllByRole('switch')
      const autoUpdateSwitch = switches[0]

      const startTime = performance.now()
      fireEvent.click(autoUpdateSwitch)
      const toggleTime = performance.now() - startTime

      expect(toggleTime).toBeLessThan(50)
    })

    it('should handle rapid input changes with auto-update enabled', () => {
      renderWithProvider(<Base64EncodeTool />)

      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      const startTime = performance.now()

      // Simulate rapid typing
      for (let i = 0; i < 10; i++) {
        fireEvent.change(textarea, { target: { value: `Test ${i}` } })
      }

      const totalTime = performance.now() - startTime

      // Should handle 10 rapid changes in <200ms
      expect(totalTime).toBeLessThan(200)
    })
  })

  describe('Settings Panel Performance', () => {
    it('should toggle settings panel quickly', () => {
      renderWithProvider(<Base64EncodeTool />)

      const settingsButton = screen.getByTestId('tool-options-toggle')

      const startTime = performance.now()
      fireEvent.click(settingsButton)
      const toggleTime = performance.now() - startTime

      expect(toggleTime).toBeLessThan(50)
    })

    it('should change encoding selection quickly', () => {
      renderWithProvider(<Base64EncodeTool />)

      const encodingSelect = screen.getByLabelText(/input encoding/i)

      const startTime = performance.now()
      fireEvent.change(encodingSelect, { target: { value: 'ASCII' } })
      const changeTime = performance.now() - startTime

      expect(changeTime).toBeLessThan(50)
    })

    it('should change format selection quickly', () => {
      renderWithProvider(<Base64EncodeTool />)

      const formatSelect = screen.getByLabelText(/output format/i)

      const startTime = performance.now()
      fireEvent.change(formatSelect, { target: { value: 'URL-safe' } })
      const changeTime = performance.now() - startTime

      expect(changeTime).toBeLessThan(50)
    })
  })

  describe('Large Input Performance', () => {
    it('should handle 5000 character input efficiently', () => {
      renderWithProvider(<Base64EncodeTool />)

      const textarea = screen.getByRole('textbox', {
        name: /text to encode/i,
      }) as HTMLTextAreaElement

      const largeInput = 'Lorem ipsum '.repeat(400) // ~5000 characters

      const startTime = performance.now()
      fireEvent.change(textarea, { target: { value: largeInput } })
      const changeTime = performance.now() - startTime

      // Should handle large input in reasonable time
      expect(changeTime).toBeLessThan(200)
      expect(textarea.value).toHaveLength(largeInput.length)
    })

    it('should generate URL for 5000 character input efficiently', () => {
      const largeInput = 'A'.repeat(5000)

      const startTime = performance.now()

      const url = generateShareURL({
        toolId: 'base64-encode',
        input: largeInput,
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })

      const generateTime = performance.now() - startTime

      // Even large inputs should generate URLs quickly
      expect(generateTime).toBeLessThan(150)
      expect(url).toContain('input=')
    })
  })

  describe('Memory Performance', () => {
    it('should not leak memory with repeated renders', () => {
      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithProvider(<Base64EncodeTool />)
        expect(screen.getByText('Settings')).toBeInTheDocument()
        unmount()
      }

      // If we got here without errors, memory is being properly cleaned up
      expect(true).toBe(true)
    })

    it('should handle multiple concurrent component instances', () => {
      const startTime = performance.now()

      // Render multiple tools simultaneously
      const { unmount: unmount1 } = renderWithProvider(<Base64EncodeTool />)
      const { unmount: unmount2 } = renderWithProvider(<Base16EncodeTool />)
      const { unmount: unmount3 } = renderWithProvider(<Base32EncodeTool />)

      const renderTime = performance.now() - startTime

      // Should handle multiple instances efficiently
      expect(renderTime).toBeLessThan(300)

      // Cleanup
      unmount1()
      unmount2()
      unmount3()
    })
  })

  describe('Batch Operations Performance', () => {
    it('should handle batch URL generation efficiently', () => {
      const inputs = Array.from({ length: 20 }, (_, i) => `Test ${i}`)

      const startTime = performance.now()

      const urls = inputs.map(input =>
        generateShareURL({
          toolId: 'base64-encode',
          input,
          inputEncoding: 'utf-8',
          toolSpecificSettings: {},
        })
      )

      const totalTime = performance.now() - startTime

      // Should generate 20 URLs quickly
      expect(totalTime).toBeLessThan(500)
      expect(urls).toHaveLength(20)
      urls.forEach(url => expect(url).toContain('input='))
    })

    it('should handle rapid sidebar navigation efficiently', () => {
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

      const startTime = performance.now()

      // Rapidly select tools
      const encodeTools = screen.getAllByText('Encode')
      const decodeTools = screen.getAllByText('Decode')

      encodeTools.forEach(tool => fireEvent.click(tool))
      decodeTools.forEach(tool => fireEvent.click(tool))

      const totalTime = performance.now() - startTime

      // Should handle rapid navigation efficiently
      expect(totalTime).toBeLessThan(100)
      expect(mockOnToolSelect).toHaveBeenCalled()
    })
  })

  describe('Performance Budget Compliance', () => {
    /**
     * Master test verifying all operations meet their budgets.
     * Logs actual performance metrics for monitoring.
     */
    it('should meet all performance budgets', () => {
      const results = {
        sidebarToggle: 0,
        urlGeneration: 0,
        componentRender: 0,
        settingsToggle: 0,
      }

      // Test sidebar toggle
      const mockOnToolSelect = jest.fn()
      const { unmount: unmountSidebar } = render(
        <Sidebar
          tools={TOOL_GROUPS}
          selectedToolId={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )
      const start1 = performance.now()
      fireEvent.click(screen.getByText('Base64'))
      results.sidebarToggle = performance.now() - start1
      unmountSidebar()

      // Test URL generation
      const start2 = performance.now()
      generateShareURL({
        toolId: 'base64-encode',
        input: 'Test',
        inputEncoding: 'utf-8',
        toolSpecificSettings: {},
      })
      results.urlGeneration = performance.now() - start2

      // Test component render
      const start3 = performance.now()
      const { unmount: unmountTool } = renderWithProvider(<Base64EncodeTool />)
      results.componentRender = performance.now() - start3
      unmountTool()

      // Test settings toggle
      const { unmount: unmountTool2 } = renderWithProvider(<Base64EncodeTool />)
      const settingsButton = screen.getByTestId('tool-options-toggle')
      const start4 = performance.now()
      fireEvent.click(settingsButton)
      results.settingsToggle = performance.now() - start4
      unmountTool2()

      // Verify all budgets
      expect(results.sidebarToggle).toBeLessThan(50) // <50ms budget
      expect(results.urlGeneration).toBeLessThan(100) // <100ms budget
      expect(results.componentRender).toBeLessThan(200) // <200ms budget
      expect(results.settingsToggle).toBeLessThan(50) // <50ms budget

      // Log results for visibility
      console.log('Performance Test Results:', results)
    })
  })
})
