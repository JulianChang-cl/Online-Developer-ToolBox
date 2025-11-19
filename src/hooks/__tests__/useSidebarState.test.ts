/**
 * Tests for useSidebarState hook
 * 
 * Contract: Multi-open sidebar group state management with localStorage persistence
 */

import { renderHook, act } from '@testing-library/react'
import { useSidebarState } from '../useSidebarState'

describe('useSidebarState', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should initialize with all groups collapsed', () => {
      const { result } = renderHook(() => useSidebarState())
      const [state] = result.current

      expect(state.base64).toBe(false)
      expect(state.base16).toBe(false)
      expect(state.base32).toBe(false)
    })

    it('should restore state from localStorage if available', () => {
      // Pre-populate localStorage
      localStorage.setItem('sidebarState', JSON.stringify({
        base64: true,
        base16: false,
        base32: true,
      }))

      const { result } = renderHook(() => useSidebarState())
      const [state] = result.current

      expect(state.base64).toBe(true)
      expect(state.base16).toBe(false)
      expect(state.base32).toBe(true)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('sidebarState', 'invalid-json')

      const { result } = renderHook(() => useSidebarState())
      const [state] = result.current

      // Should fall back to default (all collapsed)
      expect(state.base64).toBe(false)
      expect(state.base16).toBe(false)
      expect(state.base32).toBe(false)
    })
  })

  describe('Toggle Operations', () => {
    it('should toggle a single group from collapsed to expanded', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      act(() => {
        toggleGroup('base64')
      })

      const [state] = result.current
      expect(state.base64).toBe(true)
      expect(state.base16).toBe(false)
      expect(state.base32).toBe(false)
    })

    it('should toggle a group from expanded to collapsed', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      // Expand first
      act(() => {
        toggleGroup('base64')
      })

      // Then collapse
      act(() => {
        toggleGroup('base64')
      })

      const [state] = result.current
      expect(state.base64).toBe(false)
    })

    it('should allow multiple groups to be expanded simultaneously (multi-open)', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      // Expand all three groups
      act(() => {
        toggleGroup('base64')
      })
      act(() => {
        toggleGroup('base16')
      })
      act(() => {
        toggleGroup('base32')
      })

      const [state] = result.current
      expect(state.base64).toBe(true)
      expect(state.base16).toBe(true)
      expect(state.base32).toBe(true)
    })

    it('should maintain other groups state when toggling one group', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      // Expand base64 and base32
      act(() => {
        toggleGroup('base64')
        toggleGroup('base32')
      })

      // Toggle base16 (currently collapsed)
      act(() => {
        toggleGroup('base16')
      })

      const [state] = result.current
      expect(state.base64).toBe(true) // Should remain expanded
      expect(state.base16).toBe(true) // Now expanded
      expect(state.base32).toBe(true) // Should remain expanded
    })
  })

  describe('localStorage Persistence', () => {
    it('should persist state to localStorage after toggle', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      act(() => {
        toggleGroup('base64')
      })

      const savedState = localStorage.getItem('sidebarState')
      expect(savedState).toBeTruthy()
      
      const parsed = JSON.parse(savedState!)
      expect(parsed.base64).toBe(true)
      expect(parsed.base16).toBe(false)
      expect(parsed.base32).toBe(false)
    })

    it('should persist multiple group states correctly', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      act(() => {
        toggleGroup('base64')
        toggleGroup('base32')
      })

      const savedState = localStorage.getItem('sidebarState')
      const parsed = JSON.parse(savedState!)
      
      expect(parsed.base64).toBe(true)
      expect(parsed.base16).toBe(false)
      expect(parsed.base32).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid consecutive toggles', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      // Rapid toggles of the same group
      act(() => {
        toggleGroup('base64')
        toggleGroup('base64')
        toggleGroup('base64')
        toggleGroup('base64')
      })

      const [state] = result.current
      // Should be collapsed (started false, toggled 4 times)
      expect(state.base64).toBe(false)
    })

    it('should handle unknown group IDs gracefully', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      // This should not throw
      act(() => {
        toggleGroup('unknown-group')
      })

      const [state] = result.current
      // Other groups should remain unchanged
      expect(state.base64).toBe(false)
      expect(state.base16).toBe(false)
      expect(state.base32).toBe(false)
    })

    it('should handle empty string group ID', () => {
      const { result } = renderHook(() => useSidebarState())
      const [, toggleGroup] = result.current

      act(() => {
        toggleGroup('')
      })

      const [state] = result.current
      expect(state.base64).toBe(false)
      expect(state.base16).toBe(false)
      expect(state.base32).toBe(false)
    })
  })

  describe('Return Value Stability', () => {
    it('should return stable toggleGroup function reference', () => {
      const { result, rerender } = renderHook(() => useSidebarState())
      const [, toggleGroup1] = result.current

      rerender()

      const [, toggleGroup2] = result.current
      expect(toggleGroup1).toBe(toggleGroup2)
    })
  })
})
