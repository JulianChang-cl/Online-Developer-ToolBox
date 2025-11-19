/**
 * Contract Tests: URL Encoder Service
 * 
 * Tests written following TDD (RED → GREEN → REFACTOR)
 * Requirements from: specs/006-html-url-encoding/contracts/url-encoder-contract.md
 */

import { describe, it, expect } from '@jest/globals';
import { urlEncoderService } from '../../src/services/url-encoder';

describe('URL Encoder Service - Contract Tests', () => {
  // T021: Space encoding
  describe('encode() - Space encoding', () => {
    it('should encode spaces as %20 (not +)', () => {
      const input = 'hello world';
      const expected = 'hello%20world';
      const result = urlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should encode multiple spaces', () => {
      const input = 'a b c d';
      const expected = 'a%20b%20c%20d';
      const result = urlEncoderService.encode(input);
      expect(result).toBe(expected);
    });
  });

  // T022: Reserved character encoding
  describe('encode() - Reserved characters', () => {
    it('should encode reserved characters per RFC 3986', () => {
      const input = '=&?';
      const expected = '%3D%26%3F';
      const result = urlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should encode all reserved characters', () => {
      const reserved = ':/?#[]@!$&\'()*+,;=';
      const result = urlEncoderService.encode(reserved);
      // Each reserved char should be percent-encoded
      expect(result).toContain('%');
      expect(result).not.toContain(':');
      expect(result).not.toContain('/');
      expect(result).not.toContain('?');
    });

    it('should encode email-like strings', () => {
      const input = 'john@example.com';
      const result = urlEncoderService.encode(input);
      expect(result).toContain('%40'); // @ encoded
    });
  });

  // T023: Unreserved characters NOT encoded
  describe('encode() - Unreserved characters', () => {
    it('should NOT encode unreserved characters', () => {
      const input = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const expected = input; // Should remain unchanged
      const result = urlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should NOT encode hyphen, underscore, period, tilde', () => {
      const input = 'test-file_name.txt~backup';
      const expected = 'test-file_name.txt~backup';
      const result = urlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should encode only special chars in mixed string', () => {
      const input = 'file_name-v2.0&copy=true';
      const result = urlEncoderService.encode(input);
      expect(result).toContain('file_name-v2.0'); // Unreserved part unchanged
      expect(result).toContain('%26'); // & encoded
      expect(result).toContain('%3D'); // = encoded
    });
  });

  // T024: UTF-8 encoding
  describe('encode() - UTF-8 encoding', () => {
    it('should encode Chinese characters as UTF-8', () => {
      const input = '你好';
      const expected = '%E4%BD%A0%E5%A5%BD';
      const result = urlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should encode mixed English and Chinese', () => {
      const input = 'Hello你好';
      const result = urlEncoderService.encode(input);
      expect(result).toContain('Hello'); // English unchanged
      expect(result).toContain('%E4%BD%A0%E5%A5%BD'); // Chinese encoded
    });

    it('should encode Japanese characters', () => {
      const input = 'こんにちは';
      const result = urlEncoderService.encode(input);
      expect(result).toMatch(/%[0-9A-F]{2}/); // Contains percent encoding
      expect(result).not.toContain('こんにちは'); // Original not in result
    });
  });

  // T025: Emoji encoding
  describe('encode() - Emoji encoding', () => {
    it('should encode emoji as 4-byte UTF-8 sequence', () => {
      const input = '🚀';
      const expected = '%F0%9F%9A%80';
      const result = urlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should encode multiple emojis', () => {
      const input = '🌍🚀';
      const result = urlEncoderService.encode(input);
      expect(result).toContain('%F0%9F'); // UTF-8 emoji pattern
      expect(result.match(/%[0-9A-F]{2}/g)).toBeTruthy(); // Multiple percent sequences
    });

    it('should encode text with emojis', () => {
      const input = 'Hello 🌍 World';
      const result = urlEncoderService.encode(input);
      expect(result).toContain('Hello'); // English unchanged
      expect(result).toContain('%20'); // Space encoded
      expect(result).toContain('%F0%9F'); // Emoji encoded
    });
  });

  // T026: Invalid sequence pass-through
  describe('decode() - Invalid sequences', () => {
    it('should pass through invalid hex sequences', () => {
      const input = '%ZZ';
      const expected = '%ZZ';
      const result = urlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should pass through sequences with invalid hex chars', () => {
      const input = '%G0';
      const expected = '%G0';
      const result = urlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should decode valid sequences and pass through invalid ones', () => {
      const input = 'test%20valid%ZZinvalid';
      const result = urlEncoderService.decode(input);
      expect(result).toContain('test valid'); // %20 decoded
      expect(result).toContain('%ZZ'); // Invalid passed through
    });

    it('should handle incomplete sequence at end of string', () => {
      const input = 'test%2';
      const expected = 'test%2';
      const result = urlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should handle percent sign without hex digits', () => {
      const input = 'test%';
      const expected = 'test%';
      const result = urlEncoderService.decode(input);
      expect(result).toBe(expected);
    });
  });

  // T027: Empty input handling
  describe('encode() and decode() - Empty input', () => {
    it('should return empty string when encoding empty input', () => {
      const input = '';
      const expected = '';
      const result = urlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should return empty string when decoding empty input', () => {
      const input = '';
      const expected = '';
      const result = urlEncoderService.decode(input);
      expect(result).toBe(expected);
    });
  });

  // T028: Performance
  describe('Performance requirements', () => {
    it('should encode 10KB input in less than 50ms', () => {
      // Generate 10KB of mixed content
      const baseString = 'Hello World 你好 test=value&param=data';
      const input = baseString.repeat(Math.ceil(10240 / baseString.length));
      
      const start = performance.now();
      urlEncoderService.encode(input);
      const end = performance.now();
      
      const duration = end - start;
      expect(duration).toBeLessThan(50);
    });

    it('should decode 10KB input in less than 50ms', () => {
      // Generate 10KB of percent-encoded content
      const baseString = 'Hello%20World%20test%3Dvalue%26param%3Ddata';
      const input = baseString.repeat(Math.ceil(10240 / baseString.length));
      
      const start = performance.now();
      urlEncoderService.decode(input);
      const end = performance.now();
      
      const duration = end - start;
      expect(duration).toBeLessThan(50);
    });
  });

  // Roundtrip testing
  describe('Roundtrip encoding/decoding', () => {
    it('should roundtrip encode/decode simple query string', () => {
      const original = 'name=John Doe&email=john@example.com';
      const encoded = urlEncoderService.encode(original);
      const decoded = urlEncoderService.decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should roundtrip with Unicode', () => {
      const original = '你好世界';
      const encoded = urlEncoderService.encode(original);
      const decoded = urlEncoderService.decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should roundtrip with emojis', () => {
      const original = 'Hello 🚀 World';
      const encoded = urlEncoderService.encode(original);
      const decoded = urlEncoderService.decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should roundtrip with mixed content', () => {
      const original = 'search?q=hello world&lang=en';
      const encoded = urlEncoderService.encode(original);
      const decoded = urlEncoderService.decode(encoded);
      expect(decoded).toBe(original);
    });
  });

  // Case-insensitive hex decoding
  describe('decode() - Case insensitive', () => {
    it('should decode lowercase hex sequences', () => {
      const input = '%3d%26';
      const expected = '=&';
      const result = urlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should decode uppercase hex sequences', () => {
      const input = '%3D%26';
      const expected = '=&';
      const result = urlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should decode mixed case hex sequences', () => {
      const input = '%3D%26%3f';
      const expected = '=&?';
      const result = urlEncoderService.decode(input);
      expect(result).toBe(expected);
    });
  });

  // Validation function
  describe('validate()', () => {
    it('should return valid for properly encoded URL', () => {
      const result = urlEncoderService.validate('test%20value');
      expect(result.valid).toBe(true);
    });

    it('should return valid for empty string', () => {
      const result = urlEncoderService.validate('');
      expect(result.valid).toBe(true);
    });

    it('should return valid even with invalid sequences (lenient)', () => {
      const result = urlEncoderService.validate('test%ZZ');
      expect(result.valid).toBe(true);
    });
  });
});
