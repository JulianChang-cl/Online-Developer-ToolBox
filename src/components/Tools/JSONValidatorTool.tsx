/**
 * JSON Validator Tool Component
 * Feature 005: UI Bug Fixes & Format Tools
 * 
 * Validates JSON syntax and displays validation results with error details.
 * Shows split output: status indicator (left) and error details (right).
 */

import React, { useState, useEffect } from 'react'
import { InputField } from '@/components/Common/InputField'
import { OutputField } from '@/components/Common/OutputField'
import { CopyButton } from '@/components/Common/CopyButton'
import { ShareButton } from '@/components/Common/ShareButton'
import { ToolOptions, type ToolOptionsComponentProps } from '@/components/Common/ToolOptions'
import { useToolContext } from '@/context/ToolContext'
import { validateJSON } from '@/utils/json-utils'
import type { JSONValidationResult } from '@/types/json-tools'
import { validateURLParameters, decodeInputFromURL } from '@/services/urlParameters'

const TOOL_ID = 'json-validator'

/**
 * JSON Validator options component
 */
function JSONValidatorOptions({
  options: _options,
  onOptionChange: _onOptionChange,
}: ToolOptionsComponentProps): React.ReactElement {
  const { autoUpdate, toggleAutoUpdate } = useToolContext()

  return (
    <div className="space-y-4">
      {/* Auto-Update Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="validator-auto-update"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Auto-Update
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={autoUpdate}
          onClick={toggleAutoUpdate}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${autoUpdate ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${autoUpdate ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Info text */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
        <p>
          <strong>JSON Validator:</strong> Paste your JSON to check syntax. 
          Displays validation status and detailed error messages with line/column numbers.
        </p>
      </div>
    </div>
  )
}

/**
 * ValidationStatus Sub-Component
 * Shows validation result indicator (✓ Valid or ✗ Invalid)
 */
function ValidationStatus({ 
  validation 
}: { 
  validation: JSONValidationResult | null 
}): React.ReactElement | null {
  if (!validation) {
    return null
  }

  if (validation.valid) {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <svg
          className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-lg font-semibold text-green-800 dark:text-green-200">
          ✓ Valid JSON
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <svg
        className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <span className="text-lg font-semibold text-red-800 dark:text-red-200">
          ✗ Invalid JSON
        </span>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''} found
        </p>
      </div>
    </div>
  )
}

/**
 * ErrorDetails Sub-Component
 * Shows detailed error messages with line and column numbers (only when validation fails)
 */
function ErrorDetails({ 
  validation 
}: { 
  validation: JSONValidationResult | null 
}): React.ReactElement | null {
  // Only show errors when validation failed and has error details
  if (!validation || validation.valid || validation.errors.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Error Details
      </h3>
      {validation.errors.map((error, index) => (
        <div
          key={index}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm"
        >
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-red-800 dark:text-red-200">
                Line {error.line}, Column {error.column}
              </p>
              <p className="text-red-700 dark:text-red-300 mt-1 break-words">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * JSON Validator Tool Component
 */
export function JSONValidatorTool(): React.ReactElement {
  const {
    currentInput,
    currentOptions,
    setCurrentInput,
    updateOption,
    autoUpdate,
    setHeaderTitle,
    setHeaderDescription,
  } = useToolContext()

  const [localInput, setLocalInput] = useState(currentInput || '')
  const [localOptions, setLocalOptions] = useState(currentOptions || {})
  const [validation, setValidation] = useState<JSONValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Set header title on mount, clear on unmount
  useEffect(() => {
    setHeaderTitle('JSON Validator')
    setHeaderDescription('Validate JSON syntax and view error details')
    
    return () => {
      setHeaderTitle(undefined)
      setHeaderDescription(undefined)
    }
  }, [setHeaderTitle, setHeaderDescription])

  // Restore state from URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    
    if (params.size > 0) {
      const urlParams = validateURLParameters(Object.fromEntries(params))
      
      // Restore input if present
      if (urlParams.input) {
        const decodedInput = decodeInputFromURL(urlParams.input)
        if (decodedInput) {
          setLocalInput(decodedInput)
          setCurrentInput(decodedInput)
        }
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setLocalInput(currentInput || '')
  }, [currentInput])

  useEffect(() => {
    setLocalOptions(currentOptions || {})
  }, [currentOptions])

  const handleInputChange = (value: string): void => {
    setLocalInput(value)
    setCurrentInput(value)
  }

  const handleOptionChange = (key: string, value: unknown): void => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    updateOption(key, value)
  }

  // Auto-validation with debounce
  useEffect(() => {
    if (!autoUpdate) {
      return
    }

    // Feature 005: Auto-clear output when input is empty
    if (!localInput || localInput.trim() === '') {
      setValidation(null)
      return
    }

    const timer = setTimeout(() => {
      setIsValidating(true)
      const result = validateJSON(localInput)
      setValidation(result)
      setIsValidating(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [localInput, autoUpdate])

  const handleValidate = (): void => {
    setIsValidating(true)
    const result = validateJSON(localInput)
    setValidation(result)
    setIsValidating(false)
  }

  return (
    <div className="grid gap-4 h-full min-w-0 p-4" style={{ gridTemplateColumns: '1fr 2fr 2fr' }}>
      {/* Settings Column */}
      <div className="flex flex-col min-w-0 min-h-0 overflow-y-auto">
        <ToolOptions
          hasOptions={true}
          optionsComponent={JSONValidatorOptions}
          options={localOptions}
          onOptionsChange={setLocalOptions}
          onOptionChange={handleOptionChange}
          toolId={TOOL_ID}
        />
      </div>

      {/* Input Column */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <InputField
          id="validator-input"
          label="JSON to Validate"
          value={localInput}
          onChange={handleInputChange}
          placeholder='Paste your JSON here... e.g., {"key": "value"}'
          disabled={isValidating}
        />
        
        {!autoUpdate && (
          <button
            type="button"
            onClick={handleValidate}
            disabled={isValidating || !localInput}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </button>
        )}
      </div>

      {/* Output Column */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        {/* Validation Status - Only show when there's a result */}
        {validation && (
          <div role="status" aria-live="polite">
            <ValidationStatus validation={validation} />
          </div>
        )}

        {/* Error Details - Only show when invalid */}
        <ErrorDetails validation={validation} />

        {/* Formatted Output - Always visible */}
        <OutputField
          id="validator-output"
          label="Formatted JSON"
          value={validation?.valid ? validation.formatted || '' : ''}
          showEmpty={!isValidating && !validation}
        />

        {/* Actions - Only show when there's valid output */}
        {validation?.valid && validation.formatted && (
          <div className="flex gap-2">
            <CopyButton textToCopy={validation.formatted} />
            <ShareButton toolId={TOOL_ID} input={localInput} options={localOptions} />
          </div>
        )}
      </div>
    </div>
  )
}
