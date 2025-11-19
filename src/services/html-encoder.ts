/**
 * HTML Entity Encoder Service
 * 
 * Converts text to HTML entities and back for XSS prevention.
 * Follows clarifications from Session 2025-10-31:
 * - Unicode: Pass through unchanged (no numeric encoding)
 * - Malformed entities: Strict semicolon requirement with pass-through
 * 
 * Performance: O(n) algorithms, <50ms for 10KB input
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * HTML Entity maps for encoding
 * Order matters: & must be encoded first to prevent double-encoding
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',   // MUST encode first to avoid double-encoding
  '<': '&lt;',    // Prevents tag injection
  '>': '&gt;',    // Prevents tag injection
  '"': '&quot;',  // Prevents attribute injection
  "'": '&#39;'    // Prevents attribute injection (single quotes)
};

/**
 * Named entity map for decoding
 * Maps entity names (without & and ;) to their characters
 */
const NAMED_ENTITIES: Record<string, string> = {
  'lt': '<',
  'gt': '>',
  'amp': '&',
  'quot': '"',
  'apos': "'",
  '#39': "'",
  'nbsp': '\u00A0',  // Non-breaking space
  // Common additional entities
  'copy': '\u00A9',  // ©
  'reg': '\u00AE',   // ®
  'trade': '\u2122', // ™
};

/**
 * Regex for numeric entities (decimal and hexadecimal)
 * Matches: &#60; or &#x3C; (with required semicolon)
 */
const NUMERIC_ENTITY_PATTERN = /&#(\d+);|&#x([0-9A-Fa-f]+);/g;

/**
 * Regex for named entities
 * Matches: &entity; (with required semicolon)
 */
const NAMED_ENTITY_PATTERN = /&([a-zA-Z0-9#]+);/g;

/**
 * HTML Encoder Service implementation
 */
export const htmlEncoderService = {
  /**
   * Encode text to HTML entities
   * Converts < > & " ' to their HTML entity equivalents
   * Unicode characters are passed through unchanged
   * 
   * @param input - Plain text to encode
   * @returns HTML entity encoded string
   * @example
   * encode('<script>') // '&lt;script&gt;'
   * encode('你好') // '你好' (Unicode pass-through)
   */
  encode(input: string): string {
    if (!input) return '';
    
    // Single-pass encoding with correct order (& first)
    let result = input;
    
    // Must encode & first to prevent double-encoding
    result = result.replace(/&/g, HTML_ENTITIES['&']);
    result = result.replace(/</g, HTML_ENTITIES['<']);
    result = result.replace(/>/g, HTML_ENTITIES['>']);
    result = result.replace(/"/g, HTML_ENTITIES['"']);
    result = result.replace(/'/g, HTML_ENTITIES["'"]);
    
    return result;
  },

  /**
   * Decode HTML entities to text
   * Supports both named (&lt;) and numeric (&#60;, &#x3C;) entities
   * Malformed entities (missing semicolon) are passed through unchanged
   * Unknown entities are passed through unchanged
   * 
   * @param input - HTML entity encoded text
   * @returns Decoded plain text
   * @example
   * decode('&lt;script&gt;') // '<script>'
   * decode('&#60;div&#62;') // '<div>'
   * decode('&lt') // '&lt' (malformed, no semicolon)
   */
  decode(input: string): string {
    if (!input) return '';
    
    let result = input;
    
    // Decode numeric entities first (both decimal and hex)
    result = result.replace(NUMERIC_ENTITY_PATTERN, (match, decimal, hex) => {
      if (decimal) {
        const code = parseInt(decimal, 10);
        // Validate code point is in valid range
        if (code >= 0 && code <= 0x10FFFF) {
          try {
            return String.fromCodePoint(code);
          } catch {
            return match; // Pass through if invalid
          }
        }
      } else if (hex) {
        const code = parseInt(hex, 16);
        // Validate code point is in valid range
        if (code >= 0 && code <= 0x10FFFF) {
          try {
            return String.fromCodePoint(code);
          } catch {
            return match; // Pass through if invalid
          }
        }
      }
      return match; // Pass through if can't decode
    });
    
    // Decode named entities
    result = result.replace(NAMED_ENTITY_PATTERN, (match, entityName) => {
      // Check if it's a known named entity
      if (entityName in NAMED_ENTITIES) {
        return NAMED_ENTITIES[entityName];
      }
      // Unknown entity - pass through unchanged
      return match;
    });
    
    return result;
  },

  /**
   * Validate HTML entity encoded text
   * Currently lenient - accepts any string
   * 
   * @param _input - Text to validate (unused, lenient validation)
   * @returns Validation result (always valid for now)
   */
  validate(_input: string): ValidationResult {
    // Lenient validation - accept any string
    return { valid: true };
  }
};
