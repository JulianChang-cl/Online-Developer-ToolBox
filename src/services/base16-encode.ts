/**
 * Base16 (Hexadecimal) Encode Service
 *
 * Implements hexadecimal encoding with support for multiple input encodings
 * (UTF-8, ASCII, Latin-1). Outputs lowercase hexadecimal.
 */

import { Base16Service, type Base16ServiceOptions } from './base16-base'
import type { ToolResult } from '@/types/Tool'

/**
 * Base16 Encode Service
 * Converts text to hexadecimal with configurable encoding options
 */
export class Base16EncodeService extends Base16Service {
  /** Unique tool identifier */
  id = 'base16-encode'

  /**
   * Execute Base16 encoding operation
   */
  async execute(
    input: string,
    options?: Partial<Base16ServiceOptions>
  ): Promise<ToolResult<string>> {
    const startTime = performance.now()

    // Merge with default options
    const opts: Base16ServiceOptions = {
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

      // Step 2: Perform hex encoding (lowercase)
      const result = this.stringToHex(encodedBytes)

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
    options?: Partial<Base16ServiceOptions>
  ): { valid: boolean; error?: string } {
    // Empty input is valid
    if (input === '') {
      return { valid: true }
    }

    const opts: Base16ServiceOptions = {
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
 * Singleton instance for Base16 Encode service
 */
export const base16EncodeService = new Base16EncodeService()
