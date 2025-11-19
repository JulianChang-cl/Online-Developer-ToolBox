/**
 * Type definitions for JSON tools (Validator and Minifier)
 * Feature 005: UI Bug Fixes & Format Tools
 */

// ============================================================================
// JSON Validator Types
// ============================================================================

/**
 * JSON validation result
 * Returned by validateJSON() function
 */
export interface JSONValidationResult {
  valid: boolean;
  errors: JSONError[];
  formatted?: string; // Pretty-printed JSON if valid
}

/**
 * Single JSON parsing error with location info
 */
export interface JSONError {
  line: number;
  column: number;
  message: string;
  code: 'PARSE_ERROR' | 'SYNTAX_ERROR' | 'UNEXPECTED_TOKEN';
}

/**
 * JSON Validator tool state
 */
export interface JSONValidatorState {
  input: string;
  validation: JSONValidationResult | null;
}

// ============================================================================
// JSON Minifier Types
// ============================================================================

/**
 * JSON minification result with statistics
 */
export interface JSONMinificationResult {
  minified: string;
  originalSize: number;
  minifiedSize: number;
  saved: number; // bytes
  percent: number; // percentage saved (0-100)
  valid: boolean; // whether input was valid JSON
  error?: string; // error message if invalid
}

/**
 * JSON Minifier tool state
 */
export interface JSONMinifierState {
  input: string;
  minification: JSONMinificationResult | null;
}

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Tool input change handler pattern
 * Auto-clears output when input becomes empty
 */
export type ToolInputHandler = (value: string) => void;

/**
 * ShareButton position and visibility
 */
export interface ShareButtonPosition {
  location: 'sidebar' | 'output';
  visibility: 'visible' | 'hidden';
  group: 'share-toggle';
}

/**
 * Shared URL state
 */
export interface SharedLink {
  url: string;
  copiedAt: number;
  toolName: string;
  toolState: Record<string, unknown>;
}
