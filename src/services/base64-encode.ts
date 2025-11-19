/**
 * Base64 Encode Service
 *
 * Implements Base64 encoding with support for multiple input encodings
 * (UTF-8, ASCII, Latin-1) and output formats (RFC 4648, URL-safe).
 */

import { Base64Service, type Base64ServiceOptions } from './base64-base'
import type { ToolResult } from '@/types/Tool'

/**
 * Base64 Encode Service
 * Converts text to Base64 with configurable encoding and format options
 */
export class Base64EncodeService extends Base64Service {
  /** Unique tool identifier */
  id = 'base64-encode'

  /**
   * Execute Base64 encoding operation
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

      // Validate input
      const validation = this.validate(input, opts)
      if (!validation.valid) {
        return this.createErrorResult(new Error(validation.error), startTime)
      }

      // Step 1: Convert input to bytes according to encoding
      const encodedBytes = this.encodeInput(input, opts.inputEncoding)

      // Step 2: Perform Base64 encoding
      const base64 = btoa(encodedBytes)

      // Step 3: Apply format conversion (standard or URL-safe)
      const result = this.applyFormat(base64, opts.format)

      return this.createSuccessResult(result, startTime)
    } catch (error) {
      return this.createErrorResult(error, startTime)
    }
  }

  /**
   * Validate input for encoding
   * All text input is valid for encoding (validation happens during encoding)
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

    // Validate encoding compatibility
    try {
      // Test encoding to catch errors early
      this.encodeInput(input, opts.inputEncoding)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Encoding validation failed',
      }
    }
  }
}

/**
 * Singleton instance for Base64 Encode service
 */
export const base64EncodeService = new Base64EncodeService()
