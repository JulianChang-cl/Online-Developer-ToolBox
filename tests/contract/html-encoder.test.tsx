/**
 * Contract Tests: HTML Encoder Service
 * 
 * Tests written following TDD (RED → GREEN → REFACTOR)
 * Requirements from: specs/006-html-url-encoding/contracts/html-encoder-contract.md
 */

import { describe, it, expect } from '@jest/globals';
import { htmlEncoderService } from '../../src/services/html-encoder';

describe('HTML Encoder Service - Contract Tests', () => {
  // T004: Basic entity encoding
  describe('encode() - Basic entities', () => {
    it('should encode all 5 essential HTML entities', () => {
      const input = `<>&"'`;
      const expected = `&lt;&gt;&amp;&quot;&#39;`;
      const result = htmlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should encode ampersand first to prevent double-encoding', () => {
      const input = '&lt;';
      const expected = '&amp;lt;';
      const result = htmlEncoderService.encode(input);
      expect(result).toBe(expected);
    });
  });

  // T005: XSS prevention
  describe('encode() - XSS prevention', () => {
    it('should prevent XSS by encoding script tags', () => {
      const input = `<script>alert('XSS')</script>`;
      const expected = `&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;`;
      const result = htmlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should encode dangerous HTML patterns', () => {
      const input = `<img src="x" onerror="alert('XSS')">`;
      const expected = `&lt;img src=&quot;x&quot; onerror=&quot;alert(&#39;XSS&#39;)&quot;&gt;`;
      const result = htmlEncoderService.encode(input);
      expect(result).toBe(expected);
    });
  });

  // T006: Unicode pass-through
  describe('encode() - Unicode handling', () => {
    it('should pass through Unicode characters unchanged', () => {
      const input = '你好';
      const expected = '你好';
      const result = htmlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should pass through emoji unchanged', () => {
      const input = '🌍';
      const expected = '🌍';
      const result = htmlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should encode entities but pass through Unicode', () => {
      const input = 'Hello <世界>';
      const expected = 'Hello &lt;世界&gt;';
      const result = htmlEncoderService.encode(input);
      expect(result).toBe(expected);
    });
  });

  // T007: Named entity decoding
  describe('decode() - Named entities', () => {
    it('should decode all essential named entities', () => {
      const input = '&lt;&gt;&amp;&quot;&#39;';
      const expected = `<>&"'`;
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should decode mixed text and entities', () => {
      const input = '&lt;div&gt;Hello&lt;/div&gt;';
      const expected = '<div>Hello</div>';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should handle nbsp and common entities', () => {
      const input = 'Hello&nbsp;World';
      const expected = 'Hello\u00A0World';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });
  });

  // T008: Numeric entity decoding
  describe('decode() - Numeric entities', () => {
    it('should decode decimal numeric entities', () => {
      const input = '&#60;div&#62;';
      const expected = '<div>';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should decode hexadecimal numeric entities', () => {
      const input = '&#x3C;div&#x3E;';
      const expected = '<div>';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should decode mixed named and numeric entities', () => {
      const input = '&lt;div&#62;Hello&#x3C;/div&gt;';
      const expected = '<div>Hello</div>';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should handle Unicode code points in numeric entities', () => {
      const input = '&#20320;&#22909;'; // 你好 in numeric entities
      const expected = '你好';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });
  });

  // T009: Malformed entity pass-through
  describe('decode() - Malformed entities', () => {
    it('should pass through entities missing semicolon', () => {
      const input = '&lt';
      const expected = '&lt';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should pass through unknown entities', () => {
      const input = '&unknown;';
      const expected = '&unknown;';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should pass through malformed numeric entities', () => {
      const input = '&#;';
      const expected = '&#;';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });

    it('should decode valid entities and pass through malformed ones', () => {
      const input = '&lt;div&unknown;&gt;';
      const expected = '<div&unknown;>';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });
  });

  // T010: Empty input handling
  describe('encode() and decode() - Empty input', () => {
    it('should return empty string when encoding empty input', () => {
      const input = '';
      const expected = '';
      const result = htmlEncoderService.encode(input);
      expect(result).toBe(expected);
    });

    it('should return empty string when decoding empty input', () => {
      const input = '';
      const expected = '';
      const result = htmlEncoderService.decode(input);
      expect(result).toBe(expected);
    });
  });

  // T011: Performance
  describe('Performance requirements', () => {
    it('should encode 10KB input in less than 50ms', () => {
      // Generate 10KB of mixed content
      const baseString = '<div>Hello "World" & \'Test\'</div>';
      const input = baseString.repeat(Math.ceil(10240 / baseString.length));
      
      const start = performance.now();
      htmlEncoderService.encode(input);
      const end = performance.now();
      
      const duration = end - start;
      expect(duration).toBeLessThan(50);
    });

    it('should decode 10KB input in less than 50ms', () => {
      // Generate 10KB of entity-encoded content
      const baseString = '&lt;div&gt;Hello &quot;World&quot; &amp; &#39;Test&#39;&lt;/div&gt;';
      const input = baseString.repeat(Math.ceil(10240 / baseString.length));
      
      const start = performance.now();
      htmlEncoderService.decode(input);
      const end = performance.now();
      
      const duration = end - start;
      expect(duration).toBeLessThan(50);
    });
  });

  // Roundtrip testing
  describe('Roundtrip encoding/decoding', () => {
    it('should roundtrip encode/decode basic text', () => {
      const original = `<script>alert("XSS")</script>`;
      const encoded = htmlEncoderService.encode(original);
      const decoded = htmlEncoderService.decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should roundtrip with mixed content', () => {
      const original = `Hello <world> & "test" 'string'`;
      const encoded = htmlEncoderService.encode(original);
      const decoded = htmlEncoderService.decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should preserve Unicode through roundtrip', () => {
      const original = `你好 🌍 <div>`;
      const encoded = htmlEncoderService.encode(original);
      const decoded = htmlEncoderService.decode(encoded);
      expect(decoded).toBe(original);
    });
  });

  // Validation function
  describe('validate()', () => {
    it('should return valid for any string (lenient)', () => {
      const result = htmlEncoderService.validate('<div>test</div>');
      expect(result.valid).toBe(true);
    });

    it('should return valid for empty string', () => {
      const result = htmlEncoderService.validate('');
      expect(result.valid).toBe(true);
    });

    it('should return valid for entity-encoded text', () => {
      const result = htmlEncoderService.validate('&lt;div&gt;');
      expect(result.valid).toBe(true);
    });
  });
});
