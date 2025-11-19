/**
 * JSON utility functions for validation and minification
 * Feature 005: UI Bug Fixes & Format Tools
 */

import { JSONValidationResult, JSONError, JSONMinificationResult } from '../types/json-tools';

// ============================================================================
// JSON Validation Utilities
// ============================================================================

/**
 * Extract line number from JSON.parse error message
 * Example: "Unexpected token } in JSON at position 42" -> line 1 (fallback)
 * Example: "JSON.parse: unexpected character at line 5 column 2" -> line 5
 * 
 * @param errorMessage - Error message from JSON.parse
 * @returns Line number (1-indexed), defaults to 1 if not found
 */
export function extractLineNumber(errorMessage: string): number {
  const match = errorMessage.match(/line (\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Extract column number from JSON.parse error message
 * 
 * @param errorMessage - Error message from JSON.parse
 * @returns Column number (1-indexed), defaults to 1 if not found
 */
export function extractColumnNumber(errorMessage: string): number {
  const match = errorMessage.match(/column (\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Validate JSON and extract error details
 * 
 * @param input - Raw JSON string to validate
 * @returns Validation result with errors if invalid, formatted JSON if valid
 * 
 * @example
 * validateJSON('{"key": "value"}')
 * // { valid: true, errors: [], formatted: '{\n  "key": "value"\n}' }
 * 
 * @example
 * validateJSON('{invalid}')
 * // { valid: false, errors: [{ line: 1, column: 2, message: 'Unexpected token...', code: 'PARSE_ERROR' }] }
 */
export function validateJSON(input: string): JSONValidationResult {
  // Empty input is considered invalid
  if (!input || input.trim() === '') {
    return {
      valid: false,
      errors: [],
      formatted: undefined
    };
  }

  try {
    // Attempt to parse JSON
    const parsed = JSON.parse(input);
    
    // Format with 2-space indentation
    const formatted = JSON.stringify(parsed, null, 2);
    
    return {
      valid: true,
      errors: [],
      formatted
    };
  } catch (error) {
    // Extract error message
    const message = error instanceof SyntaxError ? error.message : String(error);
    
    // Parse error location
    const line = extractLineNumber(message);
    const column = extractColumnNumber(message);
    
    // Clean up message (remove position info if duplicated)
    const cleanMessage = message
      .replace(/at line \d+.*$/i, '')
      .replace(/in JSON at position \d+/i, '')
      .trim();
    
    const jsonError: JSONError = {
      line,
      column,
      message: cleanMessage,
      code: 'PARSE_ERROR'
    };
    
    return {
      valid: false,
      errors: [jsonError],
      formatted: undefined
    };
  }
}

// ============================================================================
// JSON Minification Utilities
// ============================================================================

/**
 * Minify JSON by removing whitespace
 * 
 * @param input - JSON string (formatted or already minified)
 * @returns Minification result with statistics
 * 
 * @example
 * minifyJSON('{\n  "key": "value"\n}')
 * // { minified: '{"key":"value"}', originalSize: 24, minifiedSize: 15, saved: 9, percent: 38, valid: true }
 * 
 * @example
 * minifyJSON('{invalid}')
 * // { minified: '', originalSize: 9, minifiedSize: 0, saved: 0, percent: 0, valid: false, error: 'Invalid JSON: ...' }
 */
export function minifyJSON(input: string): JSONMinificationResult {
  // Handle empty input
  if (!input || input.trim() === '') {
    return {
      minified: '',
      originalSize: 0,
      minifiedSize: 0,
      saved: 0,
      percent: 0,
      valid: false,
      error: undefined
    };
  }

  try {
    // Parse and stringify to remove whitespace
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    
    // Calculate statistics
    const originalSize = input.length;
    const minifiedSize = minified.length;
    const saved = originalSize - minifiedSize;
    const percent = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0;

    return {
      minified,
      originalSize,
      minifiedSize,
      saved,
      percent,
      valid: true,
      error: undefined
    };
  } catch (error) {
    // Handle invalid JSON
    const message = error instanceof SyntaxError ? error.message : String(error);
    
    return {
      minified: '',
      originalSize: input.length,
      minifiedSize: 0,
      saved: 0,
      percent: 0,
      valid: false,
      error: `Invalid JSON: ${message}`
    };
  }
}
