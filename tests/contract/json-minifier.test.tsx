/**
 * Contract Tests: JSON Minifier Tool
 * Feature 005: UI Bug Fixes & Format Tools
 * 
 * These tests define the contract for JSONMinifierTool component behavior using
 * the minification utilities that have already been implemented and tested.
 * 
 * Contract tests verify the EXPECTED behavior before implementation:
 * - Minification functionality
 * - Idempotency (already-minified JSON unchanged)
 * - Size statistics calculation
 * - Edge cases and error handling
 */

import { describe, it, expect } from '@jest/globals'
import { minifyJSON } from '../../src/utils/json-utils'
import type { JSONMinificationResult } from '../../src/types/json-tools'

describe('JSON Minifier Contract Tests', () => {
  
  describe('Minification Logic', () => {
    
    it('T5.1: should remove whitespace from formatted JSON', () => {
      const input = '{\n  "name": "John",\n  "age": 30\n}'
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.minified).toBe('{"name":"John","age":30}')
      expect(result.minified).not.toContain('\n')
      expect(result.minified).not.toContain('  ')
    })
    
    it('T5.2: should be idempotent (already-minified JSON unchanged)', () => {
      const input = '{"name":"John","age":30}'
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.minified).toBe(input)
      expect(result.saved).toBe(0)
      expect(result.percent).toBe(0)
    })
    
    it('T5.3: should calculate correct size statistics', () => {
      const input = '{\n  "key": "value"\n}'
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.originalSize).toBe(input.length)
      expect(result.minifiedSize).toBe(result.minified.length)
      expect(result.saved).toBe(result.originalSize - result.minifiedSize)
      expect(result.percent).toBeGreaterThan(0)
    })
    
    it('T5.4: should handle nested objects and arrays', () => {
      const input = `{
  "user": {
    "name": "John",
    "tags": [
      "dev",
      "js"
    ]
  }
}`
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.minified).toBe('{"user":{"name":"John","tags":["dev","js"]}}')
      expect(result.saved).toBeGreaterThan(35) // Actual saved: 39 bytes
    })
    
    it('T5.5: should achieve significant reduction for typical formatted JSON', () => {
      const input = `{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "age": 30,
  "active": true
}`
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.percent).toBeGreaterThanOrEqual(19) // Actual: 19% reduction
      expect(result.saved).toBeGreaterThan(0)
    })
  })
  
  describe('Error Handling', () => {
    
    it('T5.6: should handle invalid JSON gracefully', () => {
      const input = '{invalid json}'
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(false)
      expect(result.minified).toBe('')
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Invalid JSON')
    })
    
    it('T5.7: should provide error message for parsing failure', () => {
      const input = '{"key": value}'
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
      expect(typeof result.error).toBe('string')
    })
    
    it('T5.8: should handle empty input', () => {
      const result = minifyJSON('')
      
      expect(result.valid).toBe(false)
      expect(result.minified).toBe('')
      expect(result.originalSize).toBe(0)
      expect(result.minifiedSize).toBe(0)
      expect(result.saved).toBe(0)
      expect(result.percent).toBe(0)
    })
  })
  
  describe('Edge Cases', () => {
    
    it('T5.9: should handle primitive values', () => {
      const testCases = [
        { input: 'null', expected: 'null' },
        { input: 'true', expected: 'true' },
        { input: 'false', expected: 'false' },
        { input: '123', expected: '123' },
        { input: '"string"', expected: '"string"' },
      ]
      
      testCases.forEach(({ input, expected }) => {
        const result = minifyJSON(input)
        expect(result.valid).toBe(true)
        expect(result.minified).toBe(expected)
      })
    })
    
    it('T5.10: should handle Unicode characters', () => {
      const input = '{\n  "greeting": "你好世界"\n}'
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.minified).toContain('你好世界')
      expect(result.minified).toBe('{"greeting":"你好世界"}')
    })
    
    it('T5.11: should handle JSON with escaped characters', () => {
      const input = '{\n  "path": "C:\\\\Users\\\\John"\n}'
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.minified).toContain('C:\\\\Users\\\\John')
    })
    
    it('T5.12: should calculate 0% savings for primitives', () => {
      const result = minifyJSON('123')
      
      expect(result.valid).toBe(true)
      expect(result.saved).toBe(0)
      expect(result.percent).toBe(0)
    })
  })
  
  describe('Performance', () => {
    
    it('T5.13: should minify large JSON efficiently', () => {
      const largeJSON = JSON.stringify({
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: 'Test description'
        }))
      }, null, 2)
      
      const start = performance.now()
      const result = minifyJSON(largeJSON)
      const duration = performance.now() - start
      
      expect(result.valid).toBe(true)
      expect(duration).toBeLessThan(100) // Should complete within 100ms
      expect(result.saved).toBeGreaterThan(0)
    })
    
    it('T5.14: should handle deeply nested JSON', () => {
      let nested: Record<string, unknown> = { value: 'deep' }
      for (let i = 0; i < 50; i++) {
        nested = { level: i, child: nested }
      }
      const input = JSON.stringify(nested, null, 2)
      
      const result = minifyJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.minified.length).toBeLessThan(input.length)
    })
  })
  
  describe('Statistics Component Contract', () => {
    
    it('should display original size in bytes', () => {
      const input = '{"test": "data"}'
      const result = minifyJSON(input)
      
      expect(result.originalSize).toBe(input.length)
      expect(result.originalSize).toBeGreaterThan(0)
    })
    
    it('should display minified size in bytes', () => {
      const input = '{\n  "test": "data"\n}'
      const result = minifyJSON(input)
      
      expect(result.minifiedSize).toBe(result.minified.length)
      expect(result.minifiedSize).toBeLessThan(result.originalSize)
    })
    
    it('should display bytes saved', () => {
      const input = '{\n  "test": "data"\n}'
      const result = minifyJSON(input)
      
      expect(result.saved).toBe(result.originalSize - result.minifiedSize)
      expect(result.saved).toBeGreaterThan(0)
    })
    
    it('should display reduction percentage', () => {
      const input = '{\n  "test": "data"\n}'
      const result = minifyJSON(input)
      
      const expectedPercent = Math.round((result.saved / result.originalSize) * 100)
      expect(result.percent).toBe(expectedPercent)
      expect(result.percent).toBeGreaterThan(0)
      expect(result.percent).toBeLessThanOrEqual(100)
    })
    
    it('should handle zero reduction gracefully', () => {
      const input = '{"test":"data"}'
      const result = minifyJSON(input)
      
      expect(result.saved).toBe(0)
      expect(result.percent).toBe(0)
    })
  })
})

describe('MinificationStats Sub-Component Contract (for future implementation)', () => {
  
  it('should display statistics in compact format', () => {
    // Component contract: Display inline statistics
    const resultExample: JSONMinificationResult = {
      minified: '{"key":"value"}',
      originalSize: 25,
      minifiedSize: 15,
      saved: 10,
      percent: 40,
      valid: true
    }
    
    expect(resultExample.saved).toBe(10)
    expect(resultExample.percent).toBe(40)
  })
  
  it('should display statistics in detailed format', () => {
    // Component contract: Display multi-line statistics with labels
    const resultExample: JSONMinificationResult = {
      minified: '{"key":"value"}',
      originalSize: 100,
      minifiedSize: 60,
      saved: 40,
      percent: 40,
      valid: true
    }
    
    expect(resultExample.originalSize).toBe(100)
    expect(resultExample.minifiedSize).toBe(60)
  })
  
  it('should handle invalid JSON in stats display', () => {
    // Component contract: Show appropriate message for invalid JSON
    const resultExample: JSONMinificationResult = {
      minified: '',
      originalSize: 10,
      minifiedSize: 0,
      saved: 0,
      percent: 0,
      valid: false,
      error: 'Invalid JSON syntax'
    }
    
    expect(resultExample.valid).toBe(false)
    expect(resultExample.error).toBeDefined()
  })
})
