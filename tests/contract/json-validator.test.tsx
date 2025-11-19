/**
 * Contract Tests: JSON Validator Tool
 * Feature 005: UI Bug Fixes & Format Tools
 * 
 * These tests define the contract for JSONValidatorTool component behavior using
 * the validation utilities that have already been implemented and tested.
 * 
 * Contract tests verify the EXPECTED behavior before implementation:
 * - Valid/invalid JSON detection
 * - Error message formatting with line/column
 * - Edge cases (null, Unicode, comments)
 * - Performance requirements
 */

import { describe, it, expect } from '@jest/globals'
import { validateJSON } from '../../src/utils/json-utils'
import type { JSONValidationResult } from '../../src/types/json-tools'

describe('JSON Validator Contract Tests', () => {
  
  describe('Output Contract - Validation Logic', () => {
    
    it('T4.1: should identify valid JSON and provide formatted output', () => {
      const input = '{"key": "value"}'
      const result = validateJSON(input)
      
      // Valid indicator
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Formatted output with 2-space indentation
      expect(result.formatted).toBeDefined()
      const parsed = JSON.parse(result.formatted!)
      expect(parsed).toEqual({ key: 'value' })
      expect(result.formatted).toContain('\n  "key"') // 2-space indent
    })
    
    it('T4.2: should identify invalid JSON with error location details', () => {
      const input = '{invalid}'
      const result = validateJSON(input)
      
      // Invalid indicator
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      
      // Error details include line and column
      const error = result.errors[0]
      expect(error.line).toBeGreaterThan(0)
      expect(error.column).toBeGreaterThan(0)
      expect(error.message).toMatch(/unexpected.*token/i)
    })
    
    it('T4.3: should extract location from error messages', () => {
      const input = `{
  "key1": "value"
  "key2": "value"
}`
      const result = validateJSON(input)
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      
      // First error should have line and column
      const error = result.errors[0]
      expect(error.line).toBeGreaterThanOrEqual(1)
      expect(error.column).toBeGreaterThanOrEqual(1)
    })
    
    it('T4.4: should handle empty input gracefully', () => {
      const input = ''
      const result = validateJSON(input)
      
      // Empty input is invalid but shouldn't crash
      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })
  
  describe('Component Behavior - Validation Logic', () => {
    
    it('T4.5: should handle cleared input (empty string)', () => {
      const result1 = validateJSON('{"valid": "json"}')
      expect(result1.valid).toBe(true)
      
      const result2 = validateJSON('')
      expect(result2.valid).toBe(false)
      // Component should detect empty string and not display output
    })
    
    it('T4.6: should validate incrementally as JSON is built', () => {
      // Incomplete JSON - invalid
      expect(validateJSON('{').valid).toBe(false)
      expect(validateJSON('{"key').valid).toBe(false)
      expect(validateJSON('{"key":').valid).toBe(false)
      
      // Complete JSON - valid
      expect(validateJSON('{"key":"value"}').valid).toBe(true)
    })
    
    it('T4.7: should format valid JSON with 2-space indentation', () => {
      const input = '{"nested":{"array":[1,2,3]}}'
      const result = validateJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.formatted).toBeDefined()
      
      // Check 2-space indentation
      expect(result.formatted).toContain('\n  "nested"')
      expect(result.formatted).toContain('\n    "array"') // 4 spaces for nested
      
      // Verify parseable
      const parsed = JSON.parse(result.formatted!)
      expect(parsed.nested.array).toEqual([1, 2, 3])
    })
  })
  
  describe('Performance', () => {
    
    it('T4.10: should validate 1MB JSON within 100ms', () => {
      // Generate large JSON (>1MB)
      const largeJSON = JSON.stringify({
        data: Array.from({ length: 12000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: 'x'.repeat(50)
        }))
      })
      
      expect(largeJSON.length).toBeGreaterThan(1024 * 1024)
      
      const start = performance.now()
      const result = validateJSON(largeJSON)
      const duration = performance.now() - start
      
      expect(result.valid).toBe(true)
      expect(duration).toBeLessThan(100)
    })
    
    it('T4.11: should format large JSON efficiently', () => {
      const largeJSON = JSON.stringify({ data: Array.from({ length: 1000 }, (_, i) => i) })
      
      const start = performance.now()
      const result = validateJSON(largeJSON)
      const duration = performance.now() - start
      
      expect(result.valid).toBe(true)
      expect(result.formatted).toBeDefined()
      expect(duration).toBeLessThan(50) // Should be fast
    })
  })
  
  describe('Edge Cases', () => {
    
    it('T4.12: should accept null as valid JSON', () => {
      const result = validateJSON('null')
      expect(result.valid).toBe(true)
      expect(result.formatted).toBe('null')
    })
    
    it('T4.13: should reject JSON with comments as invalid', () => {
      const jsonWithComments = `{
  // This is a comment
  "key": "value"
}`
      
      const result = validateJSON(jsonWithComments)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
    
    it('T4.14: should handle Unicode characters correctly', () => {
      const result = validateJSON('{"name": "你好世界"}')
      
      expect(result.valid).toBe(true)
      expect(result.formatted).toContain('你好世界')
    })
    
    it('T4.15: should format long single-line JSON into multiple lines', () => {
      const input = '{"a":1,"b":2,"c":3,"d":4,"e":5}'
      const result = validateJSON(input)
      
      expect(result.valid).toBe(true)
      expect(result.formatted).toBeDefined()
      
      const lines = result.formatted!.split('\n')
      expect(lines.length).toBeGreaterThan(1)
    })
  })
})

describe('Sub-Component Contracts (for future implementation)', () => {
  
  describe('ValidationStatus Component', () => {
    it('should not render when validation is null', () => {
      // Component contract: ValidationStatus({ validation: null }) should not render
      expect(true).toBe(true) // Placeholder for future implementation
    })
    
    it('should display green checkmark for valid JSON', () => {
      // Component contract: Should render ✓ with text-green-600 class
      // Example data:
      const validationExample: JSONValidationResult = {
        valid: true,
        errors: [],
        formatted: '{"key": "value"}'
      }
      expect(validationExample.valid).toBe(true)
    })
    
    it('should display red X for invalid JSON with error count', () => {
      // Component contract: Should render ✗ with text-red-600 class
      // Should show "1 error found"
      const validationExample: JSONValidationResult = {
        valid: false,
        errors: [
          { line: 1, column: 2, message: 'Unexpected token', code: 'UNEXPECTED_TOKEN' }
        ]
      }
      expect(validationExample.errors).toHaveLength(1)
    })
  })

  describe('ErrorDetails Component', () => {
    it('should render empty when validation is null', () => {
      // Component contract: ErrorDetails({ validation: null }) should return null
      expect(true).toBe(true) // Placeholder
    })
    
    it('should display "No errors found" for empty errors array', () => {
      // Component contract: Should show "No errors found" message
      const validationExample: JSONValidationResult = {
        valid: true,
        errors: [],
        formatted: '{}'
      }
      expect(validationExample.errors).toHaveLength(0)
    })
    
    it('should display errors with line and column numbers', () => {
      // Component contract: Should render each error as "Line 3, Column 12: Unexpected token"
      const validationExample: JSONValidationResult = {
        valid: false,
        errors: [
          { line: 3, column: 12, message: 'Unexpected token', code: 'UNEXPECTED_TOKEN' },
          { line: 5, column: 8, message: 'Missing comma', code: 'SYNTAX_ERROR' }
        ]
      }
      expect(validationExample.errors).toHaveLength(2)
    })
  })

  describe('SplitOutput Component', () => {
    it('should display two panels side-by-side on desktop', () => {
      // Component contract: Left panel 50%, Right panel 50%, gap between panels
      expect(true).toBe(true) // Placeholder
    })
    
    it('should stack panels vertically on mobile (<640px)', () => {
      // Component contract: Each panel 100% width, vertical stacking
      expect(true).toBe(true) // Placeholder
    })
  })
})
