/**
 * Base16 (Hexadecimal) Decode Service
 *
 * Implements hexadecimal decoding with support for multiple output encodings
 * (UTF-8, ASCII, Latin-1). Accepts case-insensitive input and whitespace.
 */

import { Base16Service, type Base16ServiceOptions } from './base16-base'
import type { ToolResult } from '@/types/Tool'

/**
 * Base16 Decode Service
 * Converts hexadecimal to text with configurable output encoding
 * Handles case-insensitive input and whitespace tolerance
 */
export class Base16DecodeService extends Base16Service {
  /** Unique tool identifier */
  id = 'base16-decode'

  /**
   * Execute Base16 decoding operation
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

      // Validate input is valid hex
      const validation = this.validate(input, opts)
      if (!validation.valid) {
        return this.createErrorResult(new Error(validation.error), startTime)
      }

      // Step 1: Perform hex decoding
      const decodedBytes = this.hexToString(input)

      // Step 2: Convert bytes to text according to output encoding
      const result = this.decodeOutput(decodedBytes, opts.inputEncoding)

      return this.createSuccessResult(result, startTime)
    } catch (error) {
      return this.createErrorResult(error, startTime)
    }
  }

  /**
   * Validate input is valid hexadecimal
   * Checks format and character validity before attempting decode
   */
  validate(
    input: string,
    _options?: Partial<Base16ServiceOptions>
  ): { valid: boolean; error?: string } {
    // Empty input is valid
    if (input === '') {
      return { valid: true }
    }

    // Check if input contains only valid hex characters
    if (!this.isValidHex(input)) {
      return {
        valid: false,
        error: 'Invalid hexadecimal input. Only 0-9, A-F, a-f, and whitespace are allowed.',
      }
    }

    // Check for odd number of hex digits (after removing whitespace)
    const normalized = this.normalizeHex(input)
    if (normalized.length % 2 !== 0) {
      return {
        valid: false,
        error: 'Hex string must have even number of characters (pairs of hex digits).',
      }
    }

    // Try to decode to catch any other issues
    try {
      this.hexToString(input)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid hexadecimal input: ' + (error instanceof Error ? error.message : 'Decoding failed'),
      }
    }
  }
}

/**
 * Singleton instance for Base16 Decode service
 */
export const base16DecodeService = new Base16DecodeService()
