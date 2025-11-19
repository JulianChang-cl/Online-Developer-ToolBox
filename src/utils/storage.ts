/**
 * Storage service for localStorage management
 * Handles user preferences, theme, and tool history with error handling
 */

import type { UserPreferences, Theme, ToolHistory } from '@/types/Preferences'
import { DEFAULT_PREFERENCES, STORAGE_KEYS } from '@/types/Preferences'

/**
 * Storage errors that can occur
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: 'QUOTA_EXCEEDED' | 'STORAGE_DISABLED' | 'PARSE_ERROR'
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * Check if localStorage is available and enabled
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Safely get item from localStorage with JSON parsing
 */
const getItem = <T>(key: string, defaultValue: T): T => {
  if (!isStorageAvailable()) {
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Failed to parse localStorage item "${key}":`, error)
    return defaultValue
  }
}

/**
 * Safely set item in localStorage with JSON stringification
 */
const setItem = <T>(key: string, value: T): void => {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available', 'STORAGE_DISABLED')
  }

  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
  } catch (error) {
    // Check if it's a quota exceeded error
    if (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      throw new StorageError('localStorage quota exceeded', 'QUOTA_EXCEEDED')
    }
    throw new StorageError('Failed to serialize data', 'PARSE_ERROR')
  }
}

/**
 * Get current theme from storage
 */
export const getTheme = (): Theme => {
  return getItem<Theme>(STORAGE_KEYS.THEME, DEFAULT_PREFERENCES.theme.theme)
}

/**
 * Set theme in storage
 */
export const setTheme = (theme: Theme): void => {
  setItem(STORAGE_KEYS.THEME, theme)
}

/**
 * Get user preferences from storage
 */
export const getPreferences = (): UserPreferences => {
  return getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES)
}

/**
 * Set user preferences in storage
 */
export const setPreferences = (preferences: UserPreferences): void => {
  setItem(STORAGE_KEYS.PREFERENCES, preferences)
}

/**
 * Update a partial set of preferences
 */
export const updatePreferences = (partial: Partial<UserPreferences>): void => {
  const current = getPreferences()
  setPreferences({ ...current, ...partial })
}

/**
 * Get recent tools history
 */
export const getRecentTools = (): ToolHistory[] => {
  return getItem<ToolHistory[]>(STORAGE_KEYS.RECENT_TOOLS, [])
}

/**
 * Add or update a tool in recent history
 */
export const addRecentTool = (toolId: string): void => {
  const recent = getRecentTools()
  const preferences = getPreferences()
  const existingIndex = recent.findIndex((tool) => tool.toolId === toolId)

  if (existingIndex !== -1) {
    // Update existing tool
    recent[existingIndex] = {
      ...recent[existingIndex],
      lastUsed: Date.now(),
      usageCount: recent[existingIndex].usageCount + 1,
    }
  } else {
    // Add new tool
    recent.unshift({
      toolId,
      lastUsed: Date.now(),
      usageCount: 1,
    })
  }

  // Sort by last used and limit to maxRecentTools
  const sorted = recent.sort((a, b) => b.lastUsed - a.lastUsed)
  const limited = sorted.slice(0, preferences.maxRecentTools)

  setItem(STORAGE_KEYS.RECENT_TOOLS, limited)
}

/**
 * Clear all stored data
 */
export const clearStorage = (): void => {
  if (!isStorageAvailable()) {
    return
  }

  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error)
    }
  })
}

/**
 * Reset preferences to defaults
 */
export const resetPreferences = (): void => {
  setPreferences(DEFAULT_PREFERENCES)
}
