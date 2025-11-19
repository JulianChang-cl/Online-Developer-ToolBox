/**
 * Base64 Tool Component
 *
 * Encode and decode Base64 with support for standard and URL-safe variants.
 * Implements the complete tool UI pattern with auto-update support.
 */

import React, { useState, useEffect } from 'react'
import { InputField } from '@/components/Common/InputField'
import { OutputField } from '@/components/Common/OutputField'
import { CopyButton } from '@/components/Common/CopyButton'
import { ShareButton } from '@/components/Common/ShareButton'
import { ToolOptions, type ToolOptionsComponentProps } from '@/components/Common/ToolOptions'
import { useTool } from '@/hooks/useTool'
import { useToolContext } from '@/context/ToolContext'
import type { Base64Operation, Base64Variant } from '@/services/base64'

const TOOL_ID = 'base64'

/**
 * Base64 options component
 */
function Base64OptionsComponent({
  options,
  onOptionChange,
}: ToolOptionsComponentProps): React.ReactElement {
  const operation = (options.operation as Base64Operation) || 'encode'
  const variant = (options.variant as Base64Variant) || 'standard'

  return (
    <div className="space-y-4">
      {/* Operation Selection */}
      <div>
        <label
          htmlFor="base64-operation"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Operation
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onOptionChange('operation', 'encode')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              operation === 'encode'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
            }`}
            aria-pressed={operation === 'encode'}
          >
            Encode
          </button>
          <button
            type="button"
            onClick={() => onOptionChange('operation', 'decode')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              operation === 'decode'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
            }`}
            aria-pressed={operation === 'decode'}
          >
            Decode
          </button>
        </div>
      </div>

      {/* Variant Selection */}
      <div>
        <label
          htmlFor="base64-variant"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Variant
        </label>
        <select
          id="base64-variant"
          value={variant}
          onChange={(e) => onOptionChange('variant', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="standard">Standard (RFC 4648)</option>
          <option value="urlsafe">URL-safe (no +/=)</option>
        </select>
      </div>

      {/* Info text */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
        {operation === 'encode' ? (
          <p>
            <strong>Encode:</strong> Convert text to Base64. Use URL-safe variant for URLs and filenames.
          </p>
        ) : (
          <p>
            <strong>Decode:</strong> Convert Base64 back to text. Automatically handles both standard and URL-safe formats.
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Base64 Tool Component
 */
export function Base64Tool(): React.ReactElement {
  const { currentInput, currentOptions, setCurrentInput, updateOption, autoUpdate } = useToolContext()
  const [localInput, setLocalInput] = useState(currentInput || '')
  const [localOptions, setLocalOptions] = useState(currentOptions || {
    operation: 'encode',
    variant: 'standard',
  })

  // Sync with context
  useEffect(() => {
    setLocalInput(currentInput || '')
  }, [currentInput])

  useEffect(() => {
    setLocalOptions(currentOptions || { operation: 'encode', variant: 'standard' })
  }, [currentOptions])

  // Use the tool hook
  const { state, data, error, isExecuting, execute, reset } = useTool(TOOL_ID, {
    autoUpdate: false, // We'll handle auto-update manually
    initialInput: localInput,
    initialOptions: localOptions,
  })

  // Handle input change
  const handleInputChange = (value: string): void => {
    setLocalInput(value)
    setCurrentInput(value)
  }

  // Handle option change
  const handleOptionChange = (key: string, value: unknown): void => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    updateOption(key, value)
  }

  // Auto-update effect: Execute when input or options change (with debounce)
  useEffect(() => {
    if (!autoUpdate) {
      return
    }

    // If input is empty, clear output immediately (auto-clear feature)
    if (!localInput || localInput.trim() === '') {
      // Reset to idle state with empty output
      reset()
      return
    }

    const timer = setTimeout(() => {
      execute(localInput, localOptions)
    }, 200)

    return () => clearTimeout(timer)
  }, [localInput, localOptions, autoUpdate, execute, reset])

  // Handle manual execute
  const handleExecute = (): void => {
    execute(localInput, localOptions)
  }

  // Determine input/output labels based on operation
  const operation = (localOptions.operation as Base64Operation) || 'encode'
  const inputLabel = operation === 'encode' ? 'Text to Encode' : 'Base64 to Decode'
  const outputLabel = operation === 'encode' ? 'Encoded Base64' : 'Decoded Text'
  const inputPlaceholder =
    operation === 'encode'
      ? 'Enter text to encode...'
      : 'Enter Base64 string to decode...'

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      {/* Tool Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Base64 Encoder/Decoder
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Encode text to Base64 or decode Base64 to text
          </p>
        </div>
      </div>

      {/* 3-Column Layout: Settings | Input | Output */}
      {/* Desktop: 3 equal columns | Mobile: Flex-shrink auto-scale (all 3 visible) */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-w-0">
        {/* Settings Column (Left) */}
        <div className="flex flex-col min-w-0">
          <ToolOptions
            hasOptions={true}
            optionsComponent={Base64OptionsComponent}
            options={localOptions}
            onOptionsChange={setLocalOptions}
            onOptionChange={handleOptionChange}
            toolId={TOOL_ID}
          />
        </div>

        {/* Input Column (Middle) */}
        <div className="flex flex-col gap-3 min-w-0">
          <InputField
            id="base64-input"
            label={inputLabel}
            value={localInput}
            onChange={handleInputChange}
            placeholder={inputPlaceholder}
            disabled={isExecuting}
          />
          
          {/* Execute Button (only show if auto-update is off) */}
          {!autoUpdate && (
            <button
              type="button"
              onClick={handleExecute}
              disabled={isExecuting || !localInput}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm"
            >
              {isExecuting ? 'Processing...' : operation === 'encode' ? 'Encode' : 'Decode'}
            </button>
          )}
        </div>

        {/* Output Column (Right) */}
        <div className="flex flex-col gap-3 min-w-0">
          <OutputField
            id="base64-output"
            label={outputLabel}
            value={data || ''}
            showEmpty={!isExecuting && !data && !error}
          />
          
          {/* Action Buttons */}
          {data && state === 'success' && (
            <div className="flex gap-2">
              <CopyButton textToCopy={data} />
              <ShareButton toolId={TOOL_ID} input={localInput} options={localOptions} />
            </div>
          )}
          
          {/* Error Display */}
          {error && state === 'error' && (
            <div
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs"
              role="alert"
            >
              <div className="flex items-start">
                <svg
                  className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0"
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
                <div className="min-w-0">
                  <h3 className="text-xs font-medium text-red-800 dark:text-red-200">
                    {operation === 'encode' ? 'Encoding Error' : 'Decoding Error'}
                  </h3>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
