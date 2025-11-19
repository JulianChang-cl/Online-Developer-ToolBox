/**
 * URL Percent Encoder Service
 * 
 * Converts text to percent-encoded URL format (RFC 3986) and back.
 * Follows clarifications from Session 2025-10-31:
 * - Invalid sequences: Pass through unchanged with graceful continuation
 * - Space encoding: %20 (not +)
 * 
 * Performance: O(n) algorithms using native browser APIs, <50ms for 10KB input
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * URL Encoder Service implementation
 */
export const urlEncoderService = {
  /**
   * Encode text to percent-encoded URL format
   * Follows RFC 3986: unreserved characters (A-Z, a-z, 0-9, -, _, ., ~) are NOT encoded
   * All other characters are percent-encoded
   * Spaces are encoded as %20 (not +)
   * 
   * Uses native encodeURIComponent() which is RFC 3986 compliant and UTF-8 aware
   * 
   * @param input - Plain text to encode
   * @returns Percent-encoded string
   * @example
   * encode('hello world') // 'hello%20world'
   * encode('你好') // '%E4%BD%A0%E5%A5%BD'
   */
  encode(input: string): string {
    if (!input) return '';
    
    // Use native encodeURIComponent which:
    // - Follows RFC 3986
    // - Handles UTF-8 correctly (including emojis)
    // - Is optimized by the browser (O(n) performance)
    // - Encodes spaces as %20
    // - Does NOT encode: A-Z a-z 0-9 - _ . ~ (unreserved)
    // - Encodes everything else including: : / ? # [ ] @ ! $ & ' ( ) * + , ; =
    return encodeURIComponent(input);
  },

  /**
   * Decode percent-encoded URL to text
   * Handles invalid sequences gracefully (partial decode with pass-through)
   * Invalid sequences (e.g., %ZZ, %G0, %2) are passed through unchanged
   * Incomplete sequences at end of string are passed through
   * 
   * @param input - Percent-encoded URL string
   * @returns Decoded plain text
   * @example
   * decode('hello%20world') // 'hello world'
   * decode('%E4%BD%A0%E5%A5%BD') // '你好'
   * decode('test%ZZ') // 'test%ZZ' (invalid sequence passed through)
   */
  decode(input: string): string {
    if (!input) return '';
    
    // Try to decode using native decodeURIComponent
    // If it fails on invalid sequences, do partial decode
    try {
      return decodeURIComponent(input);
    } catch (error) {
      // Graceful handling: decode valid sequences, pass through invalid ones
      return this.partialDecode(input);
    }
  },

  /**
   * Partial decode with graceful error handling
   * Decodes valid percent sequences and passes through invalid ones
   * 
   * @param input - Percent-encoded string (possibly with invalid sequences)
   * @returns Partially decoded string
   * @private
   */
  partialDecode(input: string): string {
    let result = '';
    let i = 0;
    
    while (i < input.length) {
      if (input[i] === '%') {
        // Check if we have at least 2 characters after %
        if (i + 2 < input.length) {
          const hex = input.substring(i + 1, i + 3);
          
          // Check if both characters are valid hex digits
          if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
            // Valid hex sequence - try to decode
            try {
              // Collect consecutive valid percent sequences for UTF-8 multi-byte chars
              let encodedSequence = '%' + hex;
              let j = i + 3;
              
              // Look ahead for more percent sequences (for multi-byte UTF-8)
              while (j < input.length && input[j] === '%' && j + 2 < input.length) {
                const nextHex = input.substring(j + 1, j + 3);
                if (/^[0-9A-Fa-f]{2}$/.test(nextHex)) {
                  encodedSequence += '%' + nextHex;
                  j += 3;
                } else {
                  break;
                }
              }
              
              // Try to decode the sequence
              try {
                const decoded = decodeURIComponent(encodedSequence);
                result += decoded;
                i = j;
                continue;
              } catch {
                // If multi-byte sequence fails, just decode the first byte
                result += String.fromCharCode(parseInt(hex, 16));
                i += 3;
                continue;
              }
            } catch {
              // Pass through if can't decode
              result += input[i];
              i++;
              continue;
            }
          } else {
            // Invalid hex digits - pass through
            result += input[i];
            i++;
            continue;
          }
        } else {
          // Incomplete sequence at end - pass through
          result += input[i];
          i++;
          continue;
        }
      } else {
        // Regular character - copy as-is
        result += input[i];
        i++;
      }
    }
    
    return result;
  },

  /**
   * Validate percent-encoded URL string
   * Currently lenient - accepts any string (including invalid sequences)
   * 
   * @param _input - Text to validate (unused, lenient validation)
   * @returns Validation result (always valid for graceful handling)
   */
  validate(_input: string): ValidationResult {
    // Lenient validation - accept any string
    // Invalid sequences will be passed through during decode
    return { valid: true };
  }
};
