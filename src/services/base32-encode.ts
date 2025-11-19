/**
 * Base32EncodeService - Encode text to Base32
 * 
 * Converts text to RFC 4648 Base32 encoding with optional padding.
 * Supports UTF-8, ASCII, and Latin-1 input encodings.
 */

import { Base32Service, type Base32ServiceOptions } from './base32-base'
import type { ToolResult } from '@/types/Tool'

export class Base32EncodeService extends Base32Service {
  id = 'base32-encode'

  async execute(
    input: string,
    options?: Partial<Base32ServiceOptions>
  ): Promise<ToolResult<string>> {
    const startTime = Date.now()
    const opts = { ...this.getDefaultOptions(), ...options }

    try {
      // Handle empty input
      if (input === '') {
        return this.createSuccessResult('', startTime)
      }

      // Validate input can be encoded with chosen encoding
      const validation = this.validate(input, opts)
      if (!validation.valid) {
        return this.createErrorResult(validation.error || 'Invalid input', startTime)
      }

      // Convert to Base32 (stringToBase32 already handles UTF-8 encoding via TextEncoder)
      const base32 = this.stringToBase32(input, opts.padding ?? true)

      return this.createSuccessResult(base32, startTime)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Encoding failed'
      return this.createErrorResult(errorMessage, startTime)
    }
  }

  validate(
    input: string,
    options?: Partial<Base32ServiceOptions>
  ): { valid: boolean; error?: string } {
    const opts = { ...this.getDefaultOptions(), ...options }

    try {
      // Try encoding to catch encoding-specific errors early
      this.encodeInput(input, opts.inputEncoding)
      return { valid: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed'
      return { valid: false, error: errorMessage }
    }
  }
}

// Export singleton instance
export const base32EncodeService = new Base32EncodeService()
