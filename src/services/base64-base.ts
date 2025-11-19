/**
 * Abstract Base64 Service
 *
 * Base class for Base64 encode/decode services with shared functionality.
 * Provides common validation, error handling, and utility methods.
 */

import type { ToolService, ToolResult } from '@/types/Tool'

/**
 * Input encoding types for text conversion
 */
export type InputEncoding = 'UTF-8' | 'ASCII' | 'Latin-1'

/**
 * Base64 format variants
 */
export type Base64Format = 'RFC 4648' | 'URL-safe'

/**
 * Base64 service options
 */
export interface Base64ServiceOptions {
  /**
   * Input encoding for text (UTF-8, ASCII, or Latin-1)
   */
  inputEncoding: InputEncoding

  /**
   * Base64 format variant (RFC 4648 standard or URL-safe)
   */
  format: Base64Format
}

/**
 * Abstract base class for Base64 services
 * Provides shared utilities and defines contract for encode/decode implementations
 */
export abstract class Base64Service implements ToolService<string, string, Base64ServiceOptions> {
  /** Unique tool identifier (must be overridden by subclasses) */
  abstract id: string

  /**
   * Execute the Base64 operation (encode or decode)
   * Must be implemented by subclasses
   */
  abstract execute(
    input: string,
    options?: Partial<Base64ServiceOptions>
  ): Promise<ToolResult<string>>

  /**
   * Validate input before processing
   * Must be implemented by subclasses
   */
  abstract validate(
    input: string,
    options?: Partial<Base64ServiceOptions>
  ): { valid: boolean; error?: string }

  /**
   * Get default options for the service
   */
  getDefaultOptions(): Base64ServiceOptions {
    return {
      inputEncoding: 'UTF-8',
      format: 'RFC 4648',
    }
  }

  /**
   * Validate Base64 string format
   * Checks if the string contains only valid Base64 characters
   */
  protected isValidBase64(input: string, format: Base64Format): boolean {
    if (!input) {
      return true // Empty string is valid
    }

    if (format === 'RFC 4648') {
      // Standard Base64: A-Z, a-z, 0-9, +, /, and = for padding
      return /^[A-Za-z0-9+/]*={0,2}$/.test(input)
    } else {
      // URL-safe: A-Z, a-z, 0-9, -, _ (no padding)
      return /^[A-Za-z0-9_-]*$/.test(input)
    }
  }

  /**
   * Convert standard Base64 to URL-safe variant
   * Replaces + with -, / with _, and removes = padding
   */
  protected toUrlSafe(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  /**
   * Convert URL-safe variant to standard Base64
   * Replaces - with +, _ with /, and adds = padding
   */
  protected fromUrlSafe(urlSafe: string): string {
    let base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    const padding = base64.length % 4
    if (padding > 0) {
      base64 += '='.repeat(4 - padding)
    }

    return base64
  }

  /**
   * Encode string to UTF-8 bytes before Base64 encoding
   * Handles special characters and emojis correctly
   */
  protected encodeToUTF8(input: string): string {
    try {
      return unescape(encodeURIComponent(input))
    } catch (error) {
      throw new Error(`UTF-8 encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decode UTF-8 bytes after Base64 decoding
   * Handles special characters and emojis correctly
   */
  protected decodeFromUTF8(utf8String: string): string {
    try {
      return decodeURIComponent(escape(utf8String))
    } catch (error) {
      throw new Error(`UTF-8 decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Encode string to ASCII
   * Non-ASCII characters will be lost or cause errors
   */
  protected encodeToASCII(input: string): string {
    // Check if string contains non-ASCII characters
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(input)) {
      throw new Error('Input contains non-ASCII characters. Use UTF-8 encoding instead.')
    }
    return input
  }

  /**
   * Encode string to Latin-1 (ISO-8859-1)
   * Characters beyond Latin-1 range will cause errors
   */
  protected encodeToLatin1(input: string): string {
    // Check if string contains characters outside Latin-1 range
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\xFF]/.test(input)) {
      throw new Error('Input contains characters outside Latin-1 range. Use UTF-8 encoding instead.')
    }
    return input
  }

  /**
   * Encode input string according to specified encoding
   */
  protected encodeInput(input: string, encoding: InputEncoding): string {
    switch (encoding) {
      case 'UTF-8':
        return this.encodeToUTF8(input)
      case 'ASCII':
        return this.encodeToASCII(input)
      case 'Latin-1':
        return this.encodeToLatin1(input)
      default:
        throw new Error(`Unsupported encoding: ${encoding}`)
    }
  }

  /**
   * Decode output string according to specified encoding
   */
  protected decodeOutput(output: string, encoding: InputEncoding): string {
    switch (encoding) {
      case 'UTF-8':
        return this.decodeFromUTF8(output)
      case 'ASCII':
        // ASCII doesn't need special decoding
        return output
      case 'Latin-1':
        // Latin-1 doesn't need special decoding
        return output
      default:
        throw new Error(`Unsupported encoding: ${encoding}`)
    }
  }

  /**
   * Apply format conversion to Base64 string
   */
  protected applyFormat(base64: string, format: Base64Format): string {
    if (format === 'URL-safe') {
      return this.toUrlSafe(base64)
    }
    return base64
  }

  /**
   * Normalize Base64 input to standard format
   */
  protected normalizeFormat(base64: string, format: Base64Format): string {
    if (format === 'URL-safe') {
      return this.fromUrlSafe(base64)
    }
    return base64
  }

  /**
   * Create error result with execution time
   */
  protected createErrorResult(error: unknown, startTime: number): ToolResult<string> {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      executionTime: performance.now() - startTime,
    }
  }

  /**
   * Create success result with execution time
   */
  protected createSuccessResult(data: string, startTime: number): ToolResult<string> {
    return {
      success: true,
      data,
      executionTime: performance.now() - startTime,
    }
  }
}
