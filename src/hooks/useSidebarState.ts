/**
 * Sidebar State Management Hook
 * 
 * Manages multi-open collapsible sidebar groups with localStorage persistence.
 * Multiple groups can be expanded simultaneously (not an accordion).
 */

import { useState, useCallback, useEffect } from 'react'
import type { SidebarState } from '@/types/tools'

const STORAGE_KEY = 'sidebarState'

/**
 * Default sidebar state - all groups collapsed
 */
const DEFAULT_STATE: SidebarState = {
  base64: false,
  base16: false,
  base32: false,
  json: false,
  html: false,
  url: false,
  viewers: false,
}

/**
 * Load sidebar state from localStorage
 * Returns default state if localStorage is empty or contains invalid data
 */
function loadStateFromStorage(): SidebarState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { ...DEFAULT_STATE }
    }

    const parsed = JSON.parse(stored) as SidebarState

    // Validate parsed data has expected shape
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        base64: parsed.base64 ?? false,
        base16: parsed.base16 ?? false,
        base32: parsed.base32 ?? false,
        json: parsed.json ?? false,
        html: parsed.html ?? false,
        url: parsed.url ?? false,
        viewers: parsed.viewers ?? false,
      }
    }

    return { ...DEFAULT_STATE }
  } catch {
    // If parsing fails, return default state
    return { ...DEFAULT_STATE }
  }
}

/**
 * Save sidebar state to localStorage
 */
function saveStateToStorage(state: SidebarState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Silently fail if localStorage is unavailable (e.g., in private mode)
  }
}

/**
 * Custom hook for managing sidebar group expand/collapse state
 * 
 * @returns A tuple of [state, toggleGroup] where:
 *   - state: Current sidebar state (Record<groupId, isExpanded>)
 *   - toggleGroup: Function to toggle a specific group's expansion state
 * 
 * @example
 * ```tsx
 * const [sidebarState, toggleGroup] = useSidebarState()
 * 
 * // Check if base64 group is expanded
 * const isBase64Expanded = sidebarState.base64
 * 
 * // Toggle base64 group
 * <button onClick={() => toggleGroup('base64')}>
 *   {sidebarState.base64 ? 'Collapse' : 'Expand'} Base64
 * </button>
 * ```
 */
export function useSidebarState(): [SidebarState, (groupId: string) => void] {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState<SidebarState>(loadStateFromStorage)

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveStateToStorage(state)
  }, [state])

  /**
   * Toggle a specific group's expansion state
   * Multiple groups can be expanded simultaneously
   */
  const toggleGroup = useCallback((groupId: string) => {
    // Ignore invalid or empty group IDs
    if (!groupId || typeof groupId !== 'string') {
      return
    }

    setState((prevState) => {
      // Only toggle if this is a known group
      if (!(groupId in prevState)) {
        return prevState
      }

      return {
        ...prevState,
        [groupId]: !prevState[groupId],
      }
    })
  }, [])

  return [state, toggleGroup]
}
