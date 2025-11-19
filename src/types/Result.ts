/**
 * Result and state type definitions
 * Defines execution states, validation results, and shareable state
 */

/**
 * Execution state for tool operations
 */
export type ExecutionState = 'idle' | 'validating' | 'executing' | 'success' | 'error'

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether input is valid */
  valid: boolean
  /** Error message if invalid */
  error?: string
  /** Warning messages (non-blocking) */
  warnings?: string[]
  /** Validation metadata */
  metadata?: Record<string, unknown>
}

/**
 * Shareable state that can be encoded in URL
 */
export interface ShareableState {
  /** Tool ID */
  toolId: string
  /** Input value */
  input: string
  /** Tool options */
  options?: Record<string, unknown>
  /** Timestamp when state was created */
  timestamp?: number
}

/**
 * URL share result
 */
export interface ShareResult {
  /** Whether sharing succeeded */
  success: boolean
  /** Generated URL */
  url?: string
  /** Error message if failed */
  error?: string
  /** URL length in characters */
  length?: number
  /** Whether URL exceeds recommended length (2000 chars) */
  tooLong?: boolean
}

/**
 * Tool execution history entry
 */
export interface ExecutionHistoryEntry {
  /** Unique entry ID */
  id: string
  /** Tool ID */
  toolId: string
  /** Input value */
  input: string
  /** Output value */
  output: string
  /** Tool options used */
  options: Record<string, unknown>
  /** Execution timestamp */
  timestamp: number
  /** Execution time in milliseconds */
  executionTime?: number
  /** Whether execution succeeded */
  success: boolean
  /** Error message if failed */
  error?: string
}

/**
 * Tool operation result with execution details
 */
export interface OperationResult<T = string> {
  /** Execution state */
  state: ExecutionState
  /** Result data if successful */
  data?: T
  /** Error message if failed */
  error?: string
  /** Validation result */
  validation?: ValidationResult
  /** Execution time in milliseconds */
  executionTime?: number
  /** Additional metadata */
  metadata?: Record<string, unknown>
}
