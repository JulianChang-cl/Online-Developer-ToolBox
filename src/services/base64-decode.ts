/**
 * Base64 Decode Service
 *
 * Implements Base64 decoding with support for multiple output encodings
 * (UTF-8, ASCII, Latin-1) and input formats (RFC 4648, URL-safe).
 */

import { Base64Service, type Base64ServiceOptions } from './base64-base'
import type { ToolResult } from '@/types/Tool'

/**
 * Base64 Decode Service
 * Converts Base64 to text with configurable output encoding and format recognition
 */
export class Base64DecodeService extends Base64Service {
  /** Unique tool identifier */
  id = 'base64-decode'

  /**
   * Execute Base64 decoding operation
   */
  async execute(
    input: string,
    options?: Partial<Base64ServiceOptions>
  ): Promise<ToolResult<string>> {
    const startTime = performance.now()

    // Merge with default options
    const opts: Base64ServiceOptions = {
      ...this.getDefaultOptions(),
      ...options,
    }

    try {
      // Handle empty input
      if (input === '') {
        return this.createSuccessResult('', startTime)
      }

      // Validate input is valid Base64
      const validation = this.validate(input, opts)
      if (!validation.valid) {
        return this.createErrorResult(new Error(validation.error), startTime)
      }

      // Step 1: Normalize format to standard Base64 (convert URL-safe if needed)
      const normalizedBase64 = this.normalizeFormat(input, opts.format)

      // Step 2: Perform Base64 decoding
      const decodedBytes = atob(normalizedBase64)

      // Step 3: Convert bytes to text according to output encoding
      const result = this.decodeOutput(decodedBytes, opts.inputEncoding)

      return this.createSuccessResult(result, startTime)
    } catch (error) {
      return this.createErrorResult(error, startTime)
    }
  }

  /**
   * Validate input is valid Base64
   * Checks format and character validity before attempting decode
   */
  validate(
    input: string,
    options?: Partial<Base64ServiceOptions>
  ): { valid: boolean; error?: string } {
    // Empty input is valid
    if (input === '') {
      return { valid: true }
    }

    const opts: Base64ServiceOptions = {
      ...this.getDefaultOptions(),
      ...options,
    }

    // Check if input contains only valid Base64 characters for the specified format
    if (!this.isValidBase64(input, opts.format)) {
      return {
        valid: false,
        error: `Invalid Base64 input for ${opts.format} format. Input contains invalid characters.`,
      }
    }

    // Try to decode to catch any other issues
    try {
      const normalizedBase64 = this.normalizeFormat(input, opts.format)
      atob(normalizedBase64)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid Base64 input: ' + (error instanceof Error ? error.message : 'Decoding failed'),
      }
    }
  }
}

/**
 * Singleton instance for Base64 Decode service
 */
export const base64DecodeService = new Base64DecodeService()
