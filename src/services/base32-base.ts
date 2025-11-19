/**
 * Base32Service - Abstract base class for Base32 encoding/decoding
 * 
 * Implements RFC 4648 Base32 standard with support for:
 * - Uppercase output (A-Z, 2-7)
 * - Optional padding (=)
 * - Case-insensitive decoding
 * - UTF-8, ASCII, and Latin-1 encoding support
 */

import type { ToolService, ToolResult } from '@/types/Tool'

export type InputEncoding = 'UTF-8' | 'ASCII' | 'Latin-1'

export interface Base32ServiceOptions {
  inputEncoding: InputEncoding
  padding?: boolean
}

/**
 * Abstract base class for Base32 services
 */
export abstract class Base32Service implements ToolService<string, string, Base32ServiceOptions> {
  abstract id: string
  abstract execute(
    input: string,
    options?: Partial<Base32ServiceOptions>
  ): Promise<ToolResult<string>>
  abstract validate(
    input: string,
    options?: Partial<Base32ServiceOptions>
  ): { valid: boolean; error?: string }

  /**
   * Get default options for Base32 services
   */
  getDefaultOptions(): Base32ServiceOptions {
    return {
      inputEncoding: 'UTF-8',
      padding: true,
    }
  }

  /**
   * RFC 4648 Base32 alphabet (A-Z, 2-7)
   */
  protected readonly BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

  /**
   * Check if string contains only valid Base32 characters (A-Z, 2-7, =, whitespace)
   */
  protected isValidBase32(input: string): boolean {
    return /^[A-Za-z2-7=\s]*$/.test(input)
  }

  /**
   * Normalize Base32 input: remove whitespace, convert to uppercase
   */
  protected normalizeBase32(input: string): string {
    return input.replace(/\s/g, '').toUpperCase()
  }

  /**
   * Convert string to Base32
   */
  protected stringToBase32(input: string, padding: boolean): string {
    if (!input) return ''

    const bytes = new TextEncoder().encode(input)
    let result = ''
    let bits = 0
    let value = 0

    for (const byte of bytes) {
      value = (value << 8) | byte
      bits += 8

      while (bits >= 5) {
        result += this.BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }

    // Handle remaining bits
    if (bits > 0) {
      result += this.BASE32_ALPHABET[(value << (5 - bits)) & 31]
    }

    // Add padding if requested
    if (padding) {
      while (result.length % 8 !== 0) {
        result += '='
      }
    }

    return result
  }

  /**
   * Convert Base32 to bytes
   */
  protected base32ToBytes(base32: string): Uint8Array {
    // Remove padding and whitespace
    const cleaned = base32.replace(/=+$/, '').replace(/\s/g, '').toUpperCase()
    
    if (!cleaned) return new Uint8Array(0)

    const bytes: number[] = []
    let bits = 0
    let value = 0

    for (const char of cleaned) {
      const index = this.BASE32_ALPHABET.indexOf(char)
      if (index === -1) {
        throw new Error(`Invalid Base32 character: ${char}`)
      }

      value = (value << 5) | index
      bits += 5

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255)
        bits -= 8
      }
    }

    return new Uint8Array(bytes)
  }

  /**
   * Convert Base32 to string
   */
  protected base32ToString(base32: string): string {
    const bytes = this.base32ToBytes(base32)
    return new TextDecoder('utf-8').decode(bytes)
  }

  /**
   * Encode input string using specified encoding
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
        return input
    }
  }

  /**
   * Decode output bytes using specified encoding
   */
  protected decodeOutput(output: string, encoding: InputEncoding): string {
    switch (encoding) {
      case 'UTF-8':
        return this.decodeFromUTF8(output)
      case 'ASCII':
      case 'Latin-1':
        // For decode, we always use UTF-8 decoder
        return output
      default:
        return output
    }
  }

  /**
   * Encode to UTF-8 (default, handles all Unicode)
   */
  protected encodeToUTF8(input: string): string {
    return input
  }

  /**
   * Encode to ASCII (7-bit only, throws on non-ASCII)
   */
  protected encodeToASCII(input: string): string {
    // Check if all characters are ASCII (0-127)
    for (let i = 0; i < input.length; i++) {
      if (input.charCodeAt(i) > 127) {
        throw new Error(
          `Character "${input[i]}" at position ${i} is not valid ASCII. Use UTF-8 encoding instead.`
        )
      }
    }
    return input
  }

  /**
   * Encode to Latin-1 (ISO-8859-1, 0-255)
   */
  protected encodeToLatin1(input: string): string {
    // Check if all characters are in Latin-1 range (0-255)
    for (let i = 0; i < input.length; i++) {
      if (input.charCodeAt(i) > 255) {
        throw new Error(
          `Character "${input[i]}" at position ${i} is not valid Latin-1. Use UTF-8 encoding instead.`
        )
      }
    }
    return input
  }

  /**
   * Decode from UTF-8
   */
  protected decodeFromUTF8(utf8String: string): string {
    return utf8String
  }

  /**
   * Create a success result
   */
  protected createSuccessResult(data: string, startTime: number): ToolResult<string> {
    return {
      success: true,
      data,
      metadata: {
        executionTime: Date.now() - startTime,
      },
    }
  }

  /**
   * Create an error result
   */
  protected createErrorResult(error: string, startTime: number): ToolResult<string> {
    return {
      success: false,
      error,
      metadata: {
        executionTime: Date.now() - startTime,
      },
    }
  }
}
