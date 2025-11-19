/**
 * Contract tests for storage service
 * These tests verify the public API contract and behavior expectations
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  getTheme,
  setTheme,
  getPreferences,
  setPreferences,
  updatePreferences,
  getRecentTools,
  addRecentTool,
  clearStorage,
  resetPreferences,
  isStorageAvailable,
  StorageError,
} from '@/utils/storage'
import { DEFAULT_PREFERENCES } from '@/types/Preferences'
import type { Theme, UserPreferences } from '@/types/Preferences'

describe('Storage Service Contract Tests', () => {
  // Store original Storage methods
  const originalSetItem = Storage.prototype.setItem
  const originalGetItem = Storage.prototype.getItem
  const originalRemoveItem = Storage.prototype.removeItem

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    
    // Restore original methods
    Storage.prototype.setItem = originalSetItem
    Storage.prototype.getItem = originalGetItem
    Storage.prototype.removeItem = originalRemoveItem
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
    
    // Restore original methods again
    Storage.prototype.setItem = originalSetItem
    Storage.prototype.getItem = originalGetItem
    Storage.prototype.removeItem = originalRemoveItem
  })

  describe('Theme Management', () => {
    it('should set and get theme correctly', () => {
      // Arrange
      const theme: Theme = 'dark'

      // Act
      setTheme(theme)
      const result = getTheme()

      // Assert
      expect(result).toBe('dark')
    })

    it('should return default theme when not set', () => {
      // Act
      const result = getTheme()

      // Assert
      expect(result).toBe(DEFAULT_PREFERENCES.theme.theme)
    })

    it('should handle all theme values', () => {
      // Arrange
      const themes: Theme[] = ['light', 'dark', 'system']

      // Act & Assert
      themes.forEach((theme) => {
        setTheme(theme)
        expect(getTheme()).toBe(theme)
      })
    })
  })

  describe('Preferences Management', () => {
    it('should set and get preferences correctly (round-trip)', () => {
      // Arrange
      const preferences: UserPreferences = {
        theme: {
          theme: 'dark',
          followSystem: false,
        },
        recentTools: [],
        maxRecentTools: 10,
        saveHistory: false,
        showTooltips: false,
      }

      // Act
      setPreferences(preferences)
      const result = getPreferences()

      // Assert
      expect(result).toEqual(preferences)
    })

    it('should return default preferences when not set', () => {
      // Act
      const result = getPreferences()

      // Assert
      expect(result).toEqual(DEFAULT_PREFERENCES)
    })

    it('should update partial preferences', () => {
      // Arrange
      const initial: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        saveHistory: false,
      }
      setPreferences(initial)

      // Act
      updatePreferences({ showTooltips: false })
      const result = getPreferences()

      // Assert
      expect(result.showTooltips).toBe(false)
      expect(result.saveHistory).toBe(false)
      expect(result.maxRecentTools).toBe(DEFAULT_PREFERENCES.maxRecentTools)
    })
  })

  describe('Recent Tools Management', () => {
    it('should add new tool to recent history', () => {
      // Act
      addRecentTool('base64')
      const recent = getRecentTools()

      // Assert
      expect(recent).toHaveLength(1)
      expect(recent[0].toolId).toBe('base64')
      expect(recent[0].usageCount).toBe(1)
      expect(recent[0].lastUsed).toBeGreaterThan(0)
    })

    it('should update existing tool in recent history', () => {
      // Arrange
      addRecentTool('base64')
      const firstTime = getRecentTools()[0].lastUsed

      // Wait a bit to ensure timestamp changes
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
      
      // Act
      return delay(10).then(() => {
        addRecentTool('base64')
        const recent = getRecentTools()

        // Assert
        expect(recent).toHaveLength(1)
        expect(recent[0].usageCount).toBe(2)
        expect(recent[0].lastUsed).toBeGreaterThan(firstTime)
      })
    })

    it('should limit recent tools to maxRecentTools', () => {
      // Arrange
      setPreferences({ ...DEFAULT_PREFERENCES, maxRecentTools: 3 })

      // Act
      addRecentTool('base64')
      addRecentTool('json-validator')
      addRecentTool('url-encoder')
      addRecentTool('hash-generator')
      const recent = getRecentTools()

      // Assert
      expect(recent).toHaveLength(3)
      expect(recent[0].toolId).toBe('hash-generator')
    })

    it('should sort recent tools by last used', () => {
      // Arrange
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      // Act
      addRecentTool('tool1')
      return delay(10)
        .then(() => addRecentTool('tool2'))
        .then(() => delay(10))
        .then(() => addRecentTool('tool3'))
        .then(() => {
          const recent = getRecentTools()

          // Assert
          expect(recent[0].toolId).toBe('tool3')
          expect(recent[1].toolId).toBe('tool2')
          expect(recent[2].toolId).toBe('tool1')
        })
    })
  })

  describe('Edge Cases - localStorage Disabled', () => {
    it('should detect when localStorage is available', () => {
      // Act
      const result = isStorageAvailable()

      // Assert
      expect(result).toBe(true)
    })

    it('should handle disabled localStorage gracefully', () => {
      // Arrange - Mock localStorage.setItem to throw
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = () => {
        throw new DOMException('localStorage disabled', 'SecurityError')
      }

      // Act & Assert
      expect(() => setTheme('dark')).toThrow(StorageError)
      expect(() => setTheme('dark')).toThrow('localStorage is not available')

      // Cleanup
      Storage.prototype.setItem = originalSetItem
    })
  })

  describe('Edge Cases - Quota Exceeded', () => {
    it('should throw StorageError when quota is exceeded', () => {
      // Arrange - Mock localStorage.setItem to throw quota error ONLY for non-test keys
      const originalSetItem = Storage.prototype.setItem
      
      Storage.prototype.setItem = function (key: string, value: string) {
        // Allow the isStorageAvailable test to pass
        if (key === '__storage_test__') {
          originalSetItem.call(this, key, value)
          return
        }
        
        // Throw quota error for actual storage operations
        const error = new DOMException('Quota exceeded', 'QuotaExceededError')
        Object.defineProperty(error, 'code', { value: 22 })
        throw error
      }

      // Act & Assert
      expect(() => setTheme('dark')).toThrow(StorageError)
      expect(() => setTheme('dark')).toThrow('localStorage quota exceeded')
    })
  })

  describe('Data Integrity', () => {
    beforeEach(() => {
      // Ensure clean state
      localStorage.clear()
    })

    it('should handle corrupted localStorage data', () => {
      // Arrange - Set invalid JSON
      localStorage.setItem('online-tools-preferences', 'invalid-json{')

      // Act
      const result = getPreferences()

      // Assert - Should return defaults when parsing fails
      expect(result).toEqual(DEFAULT_PREFERENCES)
    })

    it('should clear all storage data', () => {
      // Arrange
      setTheme('dark')
      setPreferences(DEFAULT_PREFERENCES)
      addRecentTool('base64')

      // Act
      clearStorage()

      // Assert
      expect(getTheme()).toBe(DEFAULT_PREFERENCES.theme.theme)
      expect(getPreferences()).toEqual(DEFAULT_PREFERENCES)
      expect(getRecentTools()).toEqual([])
    })

    it('should reset preferences to defaults', () => {
      // Arrange
      const customPrefs: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        saveHistory: false,
        showTooltips: false,
      }
      setPreferences(customPrefs)

      // Act
      resetPreferences()
      const result = getPreferences()

      // Assert
      expect(result).toEqual(DEFAULT_PREFERENCES)
    })
  })
})
