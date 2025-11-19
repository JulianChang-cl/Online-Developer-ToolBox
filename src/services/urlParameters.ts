/**
 * URL Parameters Service
 * 
 * Handles validation and parsing of URL parameters for shareable tool links.
 * Ensures input is safely encoded/decoded and settings are valid.
 */

import type { URLParameters } from '@/types/tools'

/**
 * Valid input encoding options
 */
const VALID_ENCODINGS = ['utf-8', 'ascii', 'latin-1'] as const

/**
 * Validate and sanitize URL parameters from a shareable link
 * 
 * @param params - Raw URL parameters object (from URLSearchParams)
 * @returns Validated parameters with defaults for missing/invalid values
 * 
 * @example
 * ```ts
 * const params = {
 *   input: 'SGVsbG8=',
 *   input_encoding: 'utf-8',
 *   padding: 'true'
 * }
 * const validated = validateURLParameters(params)
 * // { input: 'SGVsbG8=', input_encoding: 'utf-8', padding: 'true' }
 * ```
 */
export function validateURLParameters(
  params: Record<string, unknown>
): URLParameters {
  const validated: URLParameters = {
    input: '',
    input_encoding: 'utf-8',
  }

  // Validate input: must be valid Base64 or empty
  if (params.input && typeof params.input === 'string') {
    if (isValidBase64(params.input)) {
      validated.input = params.input
    } else {
      // Invalid Base64 → use empty string default
      validated.input = ''
    }
  }

  // Validate input_encoding: must be one of the allowed values
  if (params.input_encoding && typeof params.input_encoding === 'string') {
    if (VALID_ENCODINGS.includes(params.input_encoding as typeof VALID_ENCODINGS[number])) {
      validated.input_encoding = params.input_encoding
    }
  }

  // Pass through all other tool-specific parameters
  // (e.g., padding, format, etc.)
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'input' && key !== 'input_encoding') {
      // Preserve the original type (string, boolean, number)
      validated[key] = value as string | boolean | number
    }
  })

  return validated
}

/**
 * Check if a string is valid Base64
 * 
 * @param str - String to validate
 * @returns True if valid Base64, false otherwise
 */
function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false
  }

  try {
    // Try to decode - will throw if invalid
    atob(str.replace(/-/g, '+').replace(/_/g, '/'))
    return true
  } catch {
    return false
  }
}

/**
 * Decode Base64-encoded input text from URL parameter
 * 
 * @param encoded - Base64-encoded input string
 * @returns Decoded text, or empty string if decoding fails
 * 
 * @example
 * ```ts
 * const decoded = decodeInputFromURL('SGVsbG8gV29ybGQh')
 * // Returns: "Hello World!"
 * ```
 */
export function decodeInputFromURL(encoded: string): string {
  if (!encoded || typeof encoded !== 'string') {
    return ''
  }

  try {
    // Handle URL-safe Base64 (replace - with +, _ with /)
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
    
    // Decode Base64
    const decoded = atob(normalized)
    
    // Convert to UTF-8 string (handle Unicode properly)
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    // If decoding fails for any reason, return empty string
    return ''
  }
}

/**
 * Encode input text as Base64 for URL parameter
 * 
 * @param input - Plain text input
 * @returns Base64-encoded string safe for URL
 * 
 * @example
 * ```ts
 * const encoded = encodeInputForURL('Hello World!')
 * // Returns: "SGVsbG8gV29ybGQh"
 * ```
 */
export function encodeInputForURL(input: string): string {
  if (!input) {
    return ''
  }

  try {
    // Convert to UTF-8 bytes (handle Unicode properly)
    const utf8Encoded = encodeURIComponent(input)
      .replace(/%([0-9A-F]{2})/g, (_, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      )
    
    // Encode as Base64
    const base64 = btoa(utf8Encoded)
    
    // Make URL-safe (optional, but recommended)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } catch {
    return ''
  }
}
