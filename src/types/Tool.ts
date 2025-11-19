/**
 * Tool type definitions
 * Defines the structure for tools, services, and results
 */

import type { ReactNode } from 'react'

/**
 * Tool category for organization
 */
export type ToolCategory = 'Encoders' | 'Validators' | 'Formatters' | 'Generators' | 'Converters' | 'Viewers' | 'Other'

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Tool execution result
 */
export interface ToolResult<T = unknown> {
  /** Whether execution succeeded */
  success: boolean
  /** Result data */
  data?: T
  /** Error message if failed */
  error?: string
  /** Execution time in milliseconds */
  executionTime?: number
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Tool service interface
 * Each tool must implement this interface
 */
export interface ToolService<TInput = string, TOutput = string, TOptions = Record<string, unknown>> {
  /** Unique tool identifier */
  id: string

  /** Execute the tool operation */
  execute: (input: TInput, options?: TOptions) => Promise<ToolResult<TOutput>> | ToolResult<TOutput>

  /** Validate input before execution */
  validate?: (input: TInput, options?: TOptions) => { valid: boolean; error?: string }

  /** Get default options */
  getDefaultOptions?: () => TOptions
}

/**
 * Tool metadata and configuration
 */
export interface Tool {
  /** Unique tool identifier */
  id: string

  /** Display name */
  name: string

  /** Short description */
  description: string

  /** Tool category */
  category: ToolCategory

  /** Icon emoji or component */
  icon?: string | ReactNode

  /** Tool service implementation */
  service: ToolService

  /** Whether tool supports auto-update */
  supportsAutoUpdate?: boolean

  /** Whether tool has options */
  hasOptions?: boolean

  /** Custom options component */
  optionsComponent?: ReactNode

  /** Example inputs for demonstration */
  examples?: Array<{
    label: string
    input: string
    options?: Record<string, unknown>
  }>

  /** Keywords for search */
  keywords?: string[]

  /** Priority for sorting (lower = higher priority) */
  priority?: number
}

/**
 * Tool registry entry
 */
export interface ToolRegistryEntry {
  tool: Tool
  registeredAt: number
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  /** Tool being executed */
  toolId: string

  /** Input value */
  input: string

  /** Tool options */
  options: Record<string, unknown>

  /** Whether this is an auto-update execution */
  isAutoUpdate: boolean

  /** Execution timestamp */
  timestamp: number
}
