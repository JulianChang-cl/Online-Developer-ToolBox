/**
 * Abstract Base16 (Hexadecimal) Service
 *
 * Base class for Base16 encode/decode services with shared functionality.
 * Provides common validation, error handling, and utility methods.
 */

import type { ToolService, ToolResult } from '@/types/Tool'

/**
 * Input encoding types for text conversion
 */
export type InputEncoding = 'UTF-8' | 'ASCII' | 'Latin-1'

/**
 * Base16 service options
 */
export interface Base16ServiceOptions {
  /**
   * Input encoding for text (UTF-8, ASCII, or Latin-1)
   */
  inputEncoding: InputEncoding
}

/**
 * Abstract base class for Base16 services
 * Provides shared utilities and defines contract for encode/decode implementations
 */
export abstract class Base16Service implements ToolService<string, string, Base16ServiceOptions> {
  /** Unique tool identifier (must be overridden by subclasses) */
  abstract id: string

  /**
   * Execute the Base16 operation (encode or decode)
   * Must be implemented by subclasses
   */
  abstract execute(
    input: string,
    options?: Partial<Base16ServiceOptions>
  ): Promise<ToolResult<string>>

  /**
   * Validate input before processing
   * Must be implemented by subclasses
   */
  abstract validate(
    input: string,
    options?: Partial<Base16ServiceOptions>
  ): { valid: boolean; error?: string }

  /**
   * Get default options for the service
   */
  getDefaultOptions(): Base16ServiceOptions {
    return {
      inputEncoding: 'UTF-8',
    }
  }

  /**
   * Validate hexadecimal string format
   * Checks if the string contains only valid hex characters (0-9, A-F, a-f)
   * Whitespace is allowed and will be stripped
   */
  protected isValidHex(input: string): boolean {
    if (!input) {
      return true // Empty string is valid
    }

    // Remove whitespace for validation
    const normalized = input.replace(/\s+/g, '')

    // Check if string contains only hex characters
    return /^[0-9A-Fa-f]*$/.test(normalized)
  }

  /**
   * Normalize hex string by removing whitespace and converting to lowercase
   */
  protected normalizeHex(input: string): string {
    return input.replace(/\s+/g, '').toLowerCase()
  }

  /**
   * Encode string to UTF-8 bytes before hex encoding
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
   * Decode UTF-8 bytes after hex decoding
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
   * Convert string to hexadecimal (lowercase)
   * Each byte is represented as two hex digits
   */
  protected stringToHex(input: string): string {
    let hex = ''
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i)
      hex += charCode.toString(16).padStart(2, '0')
    }
    return hex
  }

  /**
   * Convert hexadecimal to string
   * Each pair of hex digits represents one byte
   */
  protected hexToString(hex: string): string {
    // Normalize hex (remove whitespace, lowercase)
    const normalized = this.normalizeHex(hex)

    // Check for odd length
    if (normalized.length % 2 !== 0) {
      throw new Error('Hex string must have even number of characters')
    }

    let result = ''
    for (let i = 0; i < normalized.length; i += 2) {
      const hexPair = normalized.substring(i, i + 2)
      const charCode = parseInt(hexPair, 16)

      if (isNaN(charCode)) {
        throw new Error(`Invalid hex pair: ${hexPair}`)
      }

      result += String.fromCharCode(charCode)
    }
    return result
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
