/**
 * Base32DecodeService - Decode Base32 to text
 * 
 * Converts RFC 4648 Base32 encoding back to text.
 * Case-insensitive, whitespace-tolerant, padding-optional.
 * Supports UTF-8, ASCII, and Latin-1 output encodings.
 */

import { Base32Service, type Base32ServiceOptions } from './base32-base'
import type { ToolResult } from '@/types/Tool'

export class Base32DecodeService extends Base32Service {
  id = 'base32-decode'

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

      // Validate Base32 format
      const validation = this.validate(input, opts)
      if (!validation.valid) {
        return this.createErrorResult(validation.error || 'Invalid Base32 input', startTime)
      }

      // Decode Base32 to string
      const decoded = this.base32ToString(input)

      // Apply output encoding (for display purposes)
      const result = this.decodeOutput(decoded, opts.inputEncoding)

      return this.createSuccessResult(result, startTime)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Decoding failed'
      return this.createErrorResult(errorMessage, startTime)
    }
  }

  validate(
    input: string,
    _options?: Partial<Base32ServiceOptions>
  ): { valid: boolean; error?: string } {
    try {
      // Check for valid Base32 characters (A-Z, 2-7, =, whitespace)
      if (!this.isValidBase32(input)) {
        return {
          valid: false,
          error: 'Invalid Base32 input. Only characters A-Z, 2-7, and = (padding) are allowed.',
        }
      }

      // Normalize input (remove whitespace, uppercase)
      const normalized = this.normalizeBase32(input)

      // Remove padding for validation
      const withoutPadding = normalized.replace(/=+$/, '')

      // Check if input is valid Base32 (try decoding)
      if (withoutPadding.length > 0) {
        this.base32ToBytes(normalized)
      }

      return { valid: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid Base32 format'
      return { valid: false, error: errorMessage }
    }
  }
}

// Export singleton instance
export const base32DecodeService = new Base32DecodeService()
