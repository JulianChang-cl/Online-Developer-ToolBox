/**
 * Unit tests for storage utility
 * Target: 95%+ code coverage
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
import { DEFAULT_PREFERENCES, STORAGE_KEYS } from '@/types/Preferences'
import type { UserPreferences } from '@/types/Preferences'

describe('Storage Utility Unit Tests', () => {
  const originalSetItem = Storage.prototype.setItem
  const originalGetItem = Storage.prototype.getItem
  const originalRemoveItem = Storage.prototype.removeItem

  beforeEach(() => {
    localStorage.clear()
    Storage.prototype.setItem = originalSetItem
    Storage.prototype.getItem = originalGetItem
    Storage.prototype.removeItem = originalRemoveItem
  })

  afterEach(() => {
    localStorage.clear()
    Storage.prototype.setItem = originalSetItem
    Storage.prototype.getItem = originalGetItem
    Storage.prototype.removeItem = originalRemoveItem
  })

  describe('isStorageAvailable', () => {
    it('should return true when localStorage works', () => {
      expect(isStorageAvailable()).toBe(true)
    })

    it('should return false when localStorage throws on setItem', () => {
      Storage.prototype.setItem = () => {
        throw new Error('Storage disabled')
      }

      expect(isStorageAvailable()).toBe(false)
    })

    it('should return false when localStorage throws on removeItem', () => {
      Storage.prototype.removeItem = () => {
        throw new Error('Storage disabled')
      }

      expect(isStorageAvailable()).toBe(false)
    })

    it('should clean up test key', () => {
      isStorageAvailable()
      expect(localStorage.getItem('__storage_test__')).toBeNull()
    })
  })

  describe('StorageError', () => {
    it('should create error with correct code', () => {
      const error = new StorageError('Test error', 'QUOTA_EXCEEDED')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(StorageError)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('QUOTA_EXCEEDED')
      expect(error.name).toBe('StorageError')
    })

    it('should support all error codes', () => {
      const codes: Array<'QUOTA_EXCEEDED' | 'STORAGE_DISABLED' | 'PARSE_ERROR'> = [
        'QUOTA_EXCEEDED',
        'STORAGE_DISABLED',
        'PARSE_ERROR',
      ]

      codes.forEach((code) => {
        const error = new StorageError('Test', code)
        expect(error.code).toBe(code)
      })
    })
  })

  describe('Theme operations', () => {
    it('should persist theme across multiple gets', () => {
      setTheme('dark')
      expect(getTheme()).toBe('dark')
      expect(getTheme()).toBe('dark') // Second call should still work
    })

    it('should overwrite previous theme', () => {
      setTheme('light')
      setTheme('dark')
      expect(getTheme()).toBe('dark')
    })

    it('should handle system theme', () => {
      setTheme('system')
      expect(getTheme()).toBe('system')
    })
  })

  describe('Preferences operations', () => {
    it('should deep clone preferences on get', () => {
      const prefs: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        saveHistory: false,
      }
      setPreferences(prefs)

      const retrieved = getPreferences()
      retrieved.saveHistory = true

      // Original should not be affected
      expect(getPreferences().saveHistory).toBe(false)
    })

    it('should handle nested theme config', () => {
      const prefs: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        theme: {
          theme: 'dark',
          followSystem: false,
        },
      }
      setPreferences(prefs)

      const retrieved = getPreferences()
      expect(retrieved.theme.theme).toBe('dark')
      expect(retrieved.theme.followSystem).toBe(false)
    })

    it('should preserve array types in preferences', () => {
      const prefs: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        recentTools: [
          { toolId: 'base64', lastUsed: 12345, usageCount: 1 },
        ],
      }
      setPreferences(prefs)

      const retrieved = getPreferences()
      expect(Array.isArray(retrieved.recentTools)).toBe(true)
      expect(retrieved.recentTools).toHaveLength(1)
    })

    it('should update only specified preference fields', () => {
      setPreferences({
        ...DEFAULT_PREFERENCES,
        saveHistory: true,
        showTooltips: true,
        maxRecentTools: 5,
      })

      updatePreferences({ saveHistory: false })

      const result = getPreferences()
      expect(result.saveHistory).toBe(false)
      expect(result.showTooltips).toBe(true) // Unchanged
      expect(result.maxRecentTools).toBe(5) // Unchanged
    })

    it('should update multiple fields at once', () => {
      updatePreferences({
        saveHistory: false,
        showTooltips: false,
      })

      const result = getPreferences()
      expect(result.saveHistory).toBe(false)
      expect(result.showTooltips).toBe(false)
    })
  })

  describe('Recent tools operations', () => {
    it('should create new tool with usageCount 1', () => {
      const before = Date.now()
      addRecentTool('json-validator')
      const after = Date.now()

      const recent = getRecentTools()
      expect(recent[0].toolId).toBe('json-validator')
      expect(recent[0].usageCount).toBe(1)
      expect(recent[0].lastUsed).toBeGreaterThanOrEqual(before)
      expect(recent[0].lastUsed).toBeLessThanOrEqual(after)
    })

    it('should increment usage count for existing tool', () => {
      addRecentTool('base64')
      addRecentTool('base64')
      addRecentTool('base64')

      const recent = getRecentTools()
      expect(recent[0].usageCount).toBe(3)
    })

    it('should update timestamp on each use', () => {
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      addRecentTool('base64')
      const firstTimestamp = getRecentTools()[0].lastUsed

      return delay(10).then(() => {
        addRecentTool('base64')
        const secondTimestamp = getRecentTools()[0].lastUsed

        expect(secondTimestamp).toBeGreaterThan(firstTimestamp)
      })
    })

    it('should respect maxRecentTools from preferences', () => {
      setPreferences({ ...DEFAULT_PREFERENCES, maxRecentTools: 2 })

      addRecentTool('tool1')
      addRecentTool('tool2')
      addRecentTool('tool3')

      expect(getRecentTools()).toHaveLength(2)
    })

    it('should keep most recently used tools', () => {
      setPreferences({ ...DEFAULT_PREFERENCES, maxRecentTools: 2 })

      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      addRecentTool('old1')
      return delay(10)
        .then(() => addRecentTool('old2'))
        .then(() => delay(10))
        .then(() => addRecentTool('new1'))
        .then(() => {
          const recent = getRecentTools()
          expect(recent.map((tool: { toolId: string }) => tool.toolId)).toEqual(['new1', 'old2'])
        })
    })

    it('should handle empty recent tools list', () => {
      expect(getRecentTools()).toEqual([])
    })

    it('should move existing tool to front when used again', () => {
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      addRecentTool('tool1')
      return delay(10)
        .then(() => addRecentTool('tool2'))
        .then(() => delay(10))
        .then(() => addRecentTool('tool3'))
        .then(() => delay(10))
        .then(() => addRecentTool('tool1'))
        .then(() => {
          const recent = getRecentTools()
          expect(recent[0].toolId).toBe('tool1')
          expect(recent[0].usageCount).toBe(2)
        })
    })
  })

  describe('Storage cleanup operations', () => {
    it('should remove all storage keys', () => {
      setTheme('dark')
      setPreferences(DEFAULT_PREFERENCES)
      addRecentTool('base64')

      clearStorage()

      ;(Object.values(STORAGE_KEYS) as string[]).forEach((key) => {
        expect(localStorage.getItem(key)).toBeNull()
      })
    })

    it('should handle clearStorage when localStorage is empty', () => {
      expect(() => clearStorage()).not.toThrow()
    })

    it('should reset all preferences to defaults', () => {
      const custom: UserPreferences = {
        theme: { theme: 'dark', followSystem: false },
        recentTools: [{ toolId: 'test', lastUsed: 123, usageCount: 5 }],
        maxRecentTools: 10,
        saveHistory: false,
        showTooltips: false,
      }
      setPreferences(custom)

      resetPreferences()

      expect(getPreferences()).toEqual(DEFAULT_PREFERENCES)
    })
  })

  describe('Error handling - Parse errors', () => {
    it('should return default when JSON.parse throws', () => {
      localStorage.setItem(STORAGE_KEYS.THEME, '{"invalid json}')

      expect(getTheme()).toBe(DEFAULT_PREFERENCES.theme.theme)
    })

    it('should log error on parse failure', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, 'not valid json')
      getPreferences()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse localStorage item'),
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })

    it('should handle null values gracefully', () => {
      expect(getTheme()).toBe(DEFAULT_PREFERENCES.theme.theme)
      expect(getPreferences()).toEqual(DEFAULT_PREFERENCES)
      expect(getRecentTools()).toEqual([])
    })
  })

  describe('Error handling - Storage disabled', () => {
    it('should throw STORAGE_DISABLED when storage unavailable', () => {
      Storage.prototype.setItem = () => {
        throw new Error('Disabled')
      }

      expect(() => setTheme('dark')).toThrow(StorageError)
      expect(() => setTheme('dark')).toThrow('localStorage is not available')

      const error = (() => {
        try {
          setTheme('dark')
        } catch (e) {
          return e as StorageError
        }
      })()

      expect(error?.code).toBe('STORAGE_DISABLED')
    })

    it('should return defaults when getting from disabled storage', () => {
      Storage.prototype.getItem = () => {
        throw new Error('Disabled')
      }

      expect(getTheme()).toBe(DEFAULT_PREFERENCES.theme.theme)
      expect(getPreferences()).toEqual(DEFAULT_PREFERENCES)
    })
  })

  describe('Error handling - Quota exceeded (various error codes)', () => {
    it('should detect quota error with code 22', () => {
      Storage.prototype.setItem = function (_key: string, _value: string) {
        if (_key === '__storage_test__') {
          originalSetItem.call(this, _key, _value)
          return
        }
        const error = new DOMException('Quota', 'QuotaExceededError')
        Object.defineProperty(error, 'code', { value: 22 })
        throw error
      }

      const error = (() => {
        try {
          setPreferences(DEFAULT_PREFERENCES)
        } catch (e) {
          return e as StorageError
        }
      })()

      expect(error?.code).toBe('QUOTA_EXCEEDED')
    })

    it('should detect quota error with code 1014 (Firefox)', () => {
      Storage.prototype.setItem = function (_key: string, _value: string) {
        if (_key === '__storage_test__') {
          originalSetItem.call(this, _key, _value)
          return
        }
        const error = new DOMException('Quota', 'NS_ERROR_DOM_QUOTA_REACHED')
        Object.defineProperty(error, 'code', { value: 1014 })
        throw error
      }

      expect(() => setPreferences(DEFAULT_PREFERENCES)).toThrow('localStorage quota exceeded')
    })

    it('should detect quota error by name QuotaExceededError', () => {
      Storage.prototype.setItem = function (_key: string, _value: string) {
        if (_key === '__storage_test__') {
          originalSetItem.call(this, _key, _value)
          return
        }
        const error = new DOMException('Quota')
        Object.defineProperty(error, 'name', { value: 'QuotaExceededError' })
        throw error
      }

      expect(() => setTheme('dark')).toThrow(StorageError)
    })

    it('should detect quota error by name NS_ERROR_DOM_QUOTA_REACHED', () => {
      Storage.prototype.setItem = function (_key: string, _value: string) {
        if (_key === '__storage_test__') {
          originalSetItem.call(this, _key, _value)
          return
        }
        const error = new DOMException('Quota')
        Object.defineProperty(error, 'name', { value: 'NS_ERROR_DOM_QUOTA_REACHED' })
        throw error
      }

      expect(() => addRecentTool('test')).toThrow('localStorage quota exceeded')
    })
  })

  describe('Error handling - Serialization errors', () => {
    it('should throw PARSE_ERROR when JSON.stringify fails', () => {
      interface CircularRef {
        self?: CircularRef
      }
      const circular: CircularRef = {}
      circular.self = circular

      Storage.prototype.setItem = function (_key: string, value: string) {
        if (_key === '__storage_test__') {
          originalSetItem.call(this, _key, value)
          return
        }
        // Simulate serialization failure
        throw new Error('Converting circular structure to JSON')
      }

      expect(() => setPreferences(circular)).toThrow(StorageError)
      expect(() => setPreferences(circular)).toThrow('Failed to serialize data')
    })
  })
})
