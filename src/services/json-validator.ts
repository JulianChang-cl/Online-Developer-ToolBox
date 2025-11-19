/**
 * JSON Validator Service
 * Feature 005: UI Bug Fixes & Format Tools
 * 
 * Service for validating JSON syntax using the validateJSON utility.
 */

import { validateJSON } from '@/utils/json-utils'
import type { JSONValidationResult } from '@/types/json-tools'

/**
 * JSON Validator Service
 * 
 * Validates JSON input and returns validation results with error details.
 */
export const jsonValidatorService = {
  /**
   * Execute validation
   * 
   * @param input - JSON string to validate
   * @param _options - No options needed for validation
   * @returns Validation result with errors or formatted JSON
   */
  execute(input: string, _options?: Record<string, unknown>): JSONValidationResult {
    return validateJSON(input)
  },

  /**
   * Validate input
   * 
   * @param input - JSON string to validate
   * @returns True if input is non-empty
   */
  validate(input: string): { valid: boolean; error?: string } {
    if (!input || input.trim() === '') {
      return { valid: false, error: 'Input is required' }
    }
    return { valid: true }
  },
}
