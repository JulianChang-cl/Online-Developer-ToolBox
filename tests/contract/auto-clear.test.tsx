/**
 * Contract tests for auto-clear output feature
 * Feature 005: UI Bug Fixes & Format Tools
 * User Story 1: Auto-Clear Output When Input is Cleared (P1)
 * 
 * Contract: When user clears input field, output field must automatically clear
 */

import { describe, it, expect } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Base64Tool } from '../../src/components/tools/Base64Tool';
import { Base16Tool } from '../../src/components/tools/Base16Tool';
import { Base32Tool } from '../../src/components/tools/Base32Tool';
import { ToolProvider } from '../../src/context/ToolContext';

/**
 * Helper to render tool with context
 */
function renderTool(ToolComponent: React.ComponentType) {
  return render(
    <ToolProvider>
      <ToolComponent />
    </ToolProvider>
  );
}

describe('Auto-Clear Output Contract Tests', () => {
  // ============================================================================
  // Base64Tool Auto-Clear Tests
  // ============================================================================

  describe('Base64Tool - Auto-Clear Behavior', () => {
    it('should clear output when input is completely cleared', async () => {
      const user = userEvent.setup();
      renderTool(Base64Tool);

      // Type input
      const input = screen.getByLabelText(/text to encode/i);
      await user.type(input, 'hello world');

      // Wait for auto-update to process
      await waitFor(() => {
        const output = screen.getByLabelText(/encoded base64/i);
        expect((output as HTMLTextAreaElement).value).not.toBe('');
      });

      // Clear input completely
      await user.clear(input);

      // Output should be empty
      await waitFor(() => {
        const output = screen.getByLabelText(/encoded base64/i);
        expect((output as HTMLTextAreaElement).value).toBe('');
      });
    });

    it('should clear output when input is deleted character by character', async () => {
      const user = userEvent.setup();
      renderTool(Base64Tool);

      const input = screen.getByLabelText(/text to encode/i);
      await user.type(input, 'test');

      // Wait for output
      await waitFor(() => {
        const output = screen.getByLabelText(/encoded base64/i);
        expect((output as HTMLTextAreaElement).value).not.toBe('');
      });

      // Delete all characters
      await user.clear(input);

      // Output should be cleared
      const output = screen.getByLabelText(/encoded base64/i);
      expect((output as HTMLTextAreaElement).value).toBe('');
    });

    it('should keep output empty when input remains empty', async () => {
      renderTool(Base64Tool);

      const input = screen.getByLabelText(/text to encode/i);
      const output = screen.getByLabelText(/encoded base64/i);

      expect((input as HTMLTextAreaElement).value).toBe('');
      expect((output as HTMLTextAreaElement).value).toBe('');
    });
  });

  // ============================================================================
  // Base16Tool Auto-Clear Tests
  // ============================================================================

  describe('Base16Tool - Auto-Clear Behavior', () => {
    it('should clear output when input is completely cleared', async () => {
      const user = userEvent.setup();
      renderTool(Base16Tool);

      const input = screen.getByLabelText(/text to encode/i);
      await user.type(input, 'hello');

      await waitFor(() => {
        const output = screen.getByLabelText(/encoded.*hex/i);
        expect((output as HTMLTextAreaElement).value).not.toBe('');
      });

      await user.clear(input);

      await waitFor(() => {
        const output = screen.getByLabelText(/encoded.*hex/i);
        expect((output as HTMLTextAreaElement).value).toBe('');
      });
    });

    it('should clear output on backspace to empty', async () => {
      const user = userEvent.setup();
      renderTool(Base16Tool);

      const input = screen.getByLabelText(/text to encode/i);
      await user.type(input, 'a');

      await waitFor(() => {
        const output = screen.getByLabelText(/encoded.*hex/i);
        expect((output as HTMLTextAreaElement).value).not.toBe('');
      });

      await user.clear(input);

      const output = screen.getByLabelText(/encoded.*hex/i);
      expect((output as HTMLTextAreaElement).value).toBe('');
    });

    it('should not process empty input', async () => {
      renderTool(Base16Tool);

      const input = screen.getByLabelText(/text to encode/i);
      const output = screen.getByLabelText(/encoded.*hex/i);

      expect((input as HTMLTextAreaElement).value).toBe('');
      expect((output as HTMLTextAreaElement).value).toBe('');
    });
  });

  // ============================================================================
  // Base32Tool Auto-Clear Tests
  // ============================================================================

  describe('Base32Tool - Auto-Clear Behavior', () => {
    it('should clear output when input is completely cleared', async () => {
      const user = userEvent.setup();
      renderTool(Base32Tool);

      const input = screen.getByLabelText(/text to encode/i);
      await user.type(input, 'test data');

      await waitFor(() => {
        const output = screen.getByLabelText(/encoded base32/i);
        expect((output as HTMLTextAreaElement).value).not.toBe('');
      });

      await user.clear(input);

      await waitFor(() => {
        const output = screen.getByLabelText(/encoded base32/i);
        expect((output as HTMLTextAreaElement).value).toBe('');
      });
    });

    it('should handle rapid clear and type cycles', async () => {
      const user = userEvent.setup();
      renderTool(Base32Tool);

      const input = screen.getByLabelText(/text to encode/i);

      // Type, clear, type, clear
      await user.type(input, 'hello');
      await user.clear(input);
      await user.type(input, 'world');
      await user.clear(input);

      const output = screen.getByLabelText(/encoded base32/i);
      expect((output as HTMLTextAreaElement).value).toBe('');
    });

    it('should keep output empty for whitespace-only input that gets cleared', async () => {
      const user = userEvent.setup();
      renderTool(Base32Tool);

      const input = screen.getByLabelText(/text to encode/i);
      await user.type(input, '   ');
      await user.clear(input);

      const output = screen.getByLabelText(/encoded base32/i);
      expect((output as HTMLTextAreaElement).value).toBe('');
    });
  });
});
