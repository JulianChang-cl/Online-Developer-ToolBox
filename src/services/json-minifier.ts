/**
 * JSON Minifier Service
 * Feature 005: UI Bug Fixes & Format Tools
 * 
 * Service for minifying JSON by removing whitespace.
 */

import { minifyJSON } from '../utils/json-utils'
import type { JSONMinificationResult } from '../types/json-tools'

export const jsonMinifierService = {
  /**
   * Minify JSON input
   */
  execute(input: string, _options?: Record<string, unknown>): JSONMinificationResult {
    return minifyJSON(input)
  },

  /**
   * Validate minifier execution
   */
  validate(input: string): { valid: boolean; error?: string } {
    if (!input || input.trim() === '') {
      return { valid: false, error: 'Input cannot be empty' }
    }

    const result = minifyJSON(input)
    return {
      valid: result.valid,
      error: result.error,
    }
  },
}
