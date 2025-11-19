/**
 * Base64 Encoder/Decoder Service
 *
 * Implements ToolService interface for Base64 encoding and decoding.
 * Supports both standard and URL-safe variants.
 */

import type { ToolService, ToolResult } from '@/types/Tool'

/**
 * Base64 operation type
 */
export type Base64Operation = 'encode' | 'decode'

/**
 * Base64 variant type
 */
export type Base64Variant = 'standard' | 'urlsafe'

/**
 * Base64 service options
 */
export interface Base64Options {
  /**
   * Operation to perform
   */
  operation: Base64Operation

  /**
   * Encoding variant
   */
  variant: Base64Variant
}

/**
 * Base64 service implementing ToolService interface
 */
class Base64Service implements ToolService<string, string, Base64Options> {
  /** Unique tool identifier */
  id = 'base64'

  /**
   * Execute Base64 encode or decode operation
   */
  async execute(
    input: string,
    options?: Partial<Base64Options>
  ): Promise<ToolResult<string>> {
    const startTime = performance.now()
    const opts = {
      ...this.getDefaultOptions(),
      ...options,
    }

    try {
      let result: string

      if (opts.operation === 'encode') {
        result = this.encode(input, opts.variant)
      } else {
        result = this.decode(input, opts.variant)
      }

      return {
        success: true,
        data: result,
        executionTime: performance.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: performance.now() - startTime,
      }
    }
  }

  /**
   * Validate input
   */
  validate(_input: string, _options?: Partial<Base64Options>): { valid: boolean; error?: string } {
    // All inputs are valid for encoding
    // For decoding, we'll validate during execution
    return { valid: true }
  }

  /**
   * Get default options
   */
  getDefaultOptions(): Base64Options {
    return {
      operation: 'encode',
      variant: 'standard',
    }
  }

  /**
   * Encode string to Base64
   */
  private encode(input: string, variant: Base64Variant): string {
    if (input === '') {
      return ''
    }

    try {
      // Use browser's btoa with UTF-8 encoding
      // First encode to UTF-8, then to Base64
      const utf8String = unescape(encodeURIComponent(input))
      const base64 = btoa(utf8String)

      if (variant === 'urlsafe') {
        return this.toUrlSafe(base64)
      }

      return base64
    } catch (error) {
      throw new Error(`Encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decode Base64 to string
   */
  private decode(input: string, variant: Base64Variant): string {
    if (input === '') {
      return ''
    }

    try {
      let base64 = input

      // Convert URL-safe to standard if needed
      if (variant === 'urlsafe') {
        base64 = this.fromUrlSafe(input)
      }

      // Decode Base64 then decode UTF-8
      const utf8String = atob(base64)
      return decodeURIComponent(escape(utf8String))
    } catch (error) {
      throw new Error(`Invalid Base64 input: ${error instanceof Error ? error.message : 'Decoding failed'}`)
    }
  }

  /**
   * Convert standard Base64 to URL-safe variant
   */
  private toUrlSafe(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  /**
   * Convert URL-safe variant to standard Base64
   */
  private fromUrlSafe(urlSafe: string): string {
    let base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    const padding = base64.length % 4
    if (padding > 0) {
      base64 += '='.repeat(4 - padding)
    }

    return base64
  }
}

/**
 * Singleton instance
 */
export const base64Service = new Base64Service()
