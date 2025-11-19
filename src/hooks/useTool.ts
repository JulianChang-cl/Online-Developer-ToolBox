/**
 * useTool Hook
 *
 * Custom hook for executing tools with validation, auto-update, and state management.
 * Provides debounced auto-update (200ms) for responsive UX.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { toolRegistry } from '@/services/ToolRegistry'
import type { ExecutionState, OperationResult } from '@/types/Result'

interface UseToolOptions {
  /**
   * Enable automatic execution on input/options change
   */
  autoUpdate?: boolean

  /**
   * Debounce delay for auto-update in milliseconds
   * @default 200
   */
  debounceMs?: number

  /**
   * Initial input value
   */
  initialInput?: string

  /**
   * Initial options value
   */
  initialOptions?: Record<string, unknown>

  /**
   * Callback when execution completes
   */
  onComplete?: (result: OperationResult<string>) => void

  /**
   * Callback when execution fails
   */
  onError?: (error: string) => void
}

interface UseToolReturn {
  /**
   * Current execution state
   */
  state: ExecutionState

  /**
   * Result data from successful execution
   */
  data: string | undefined

  /**
   * Error message from failed execution or validation
   */
  error: string | undefined

  /**
   * Execution time in milliseconds
   */
  executionTime: number | undefined

  /**
   * Whether the tool is currently executing
   */
  isExecuting: boolean

  /**
   * Manually execute the tool
   */
  execute: (input?: string, options?: Record<string, unknown>) => Promise<void>

  /**
   * Validate input without execution
   */
  validate: (input?: string, options?: Record<string, unknown>) => boolean

  /**
   * Reset state to idle
   */
  reset: () => void
}

/**
 * Hook for executing tools with validation and auto-update
 */
export function useTool(
  toolId: string | undefined,
  options: UseToolOptions = {}
): UseToolReturn {
  const {
    autoUpdate = false,
    debounceMs = 200,
    initialInput = '',
    initialOptions = {},
    onComplete,
    onError,
  } = options

  const [state, setState] = useState<ExecutionState>('idle')
  const [data, setData] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined)
  const [currentInput, setCurrentInput] = useState(initialInput)
  const [currentOptions, setCurrentOptions] = useState(initialOptions)

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Abort controller for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | undefined>(undefined)

  /**
   * Execute the tool
   */
  const execute = useCallback(
    async (input?: string, opts?: Record<string, unknown>) => {
      // Use provided input/options or current state
      const inputToUse = input !== undefined ? input : currentInput
      const optionsToUse = opts !== undefined ? opts : currentOptions

      // Update current state if new values provided
      if (input !== undefined) setCurrentInput(input)
      if (opts !== undefined) setCurrentOptions(opts)

      // Clear any pending executions
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = undefined
      }

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Check if tool exists
      if (!toolId || !toolRegistry.has(toolId)) {
        setState('error')
        const errorMsg = toolId ? `Tool "${toolId}" not found` : 'No tool selected'
        setError(errorMsg)
        setData(undefined)
        setExecutionTime(undefined)
        onError?.(errorMsg)
        return
      }

      // Validate input
      setState('validating')
      const validation = toolRegistry.validate(toolId, inputToUse, optionsToUse)

      if (!validation.valid) {
        setState('error')
        const errorMsg = validation.error || 'Validation failed'
        setError(errorMsg)
        setData(undefined)
        setExecutionTime(undefined)
        onError?.(errorMsg)
        return
      }

      // Execute tool
      setState('executing')
      abortControllerRef.current = new AbortController()

      try {
        const result = await toolRegistry.execute<string, string>(
          toolId,
          inputToUse,
          optionsToUse
        )

        // Check if this execution was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return
        }

        if (result.success) {
          setState('success')
          setData(result.data)
          setError(undefined)
          setExecutionTime(result.executionTime)
          onComplete?.({
            state: 'success',
            data: result.data,
            executionTime: result.executionTime,
          })
        } else {
          setState('error')
          const errorMsg = result.error || 'Execution failed'
          setError(errorMsg)
          setData(undefined)
          setExecutionTime(result.executionTime)
          onError?.(errorMsg)
        }
      } catch (err) {
        // Check if this execution was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return
        }

        setState('error')
        const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMsg)
        setData(undefined)
        setExecutionTime(undefined)
        onError?.(errorMsg)
      } finally {
        abortControllerRef.current = undefined
      }
    },
    [toolId, currentInput, currentOptions, onComplete, onError]
  )

  /**
   * Validate input without execution
   */
  const validate = useCallback(
    (input?: string, opts?: Record<string, unknown>): boolean => {
      const inputToUse = input !== undefined ? input : currentInput
      const optionsToUse = opts !== undefined ? opts : currentOptions

      if (!toolId || !toolRegistry.has(toolId)) {
        return false
      }

      const validation = toolRegistry.validate(toolId, inputToUse, optionsToUse)
      return validation.valid
    },
    [toolId, currentInput, currentOptions]
  )

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = undefined
    }

    // Cancel in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = undefined
    }

    setState('idle')
    setData(undefined)
    setError(undefined)
    setExecutionTime(undefined)
  }, [])

  /**
   * Auto-update effect
   * Executes tool when input/options change if autoUpdate is enabled
   */
  useEffect(() => {
    if (!autoUpdate || !toolId) {
      return
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounced execution
    debounceTimerRef.current = setTimeout(() => {
      execute()
    }, debounceMs)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [autoUpdate, toolId, currentInput, currentOptions, debounceMs, execute])

  /**
   * Reset when tool changes
   */
  useEffect(() => {
    reset()
  }, [toolId, reset])

  return {
    state,
    data,
    error,
    executionTime,
    isExecuting: state === 'validating' || state === 'executing',
    execute,
    validate,
    reset,
  }
}
