/**
 * Base32 Encode Tool Component
 *
 * Dedicated tool for encoding text to Base32 (RFC 4648) with input encoding and padding options.
 */

import React, { useState, useEffect } from 'react'
import { InputField } from '@/components/Common/InputField'
import { OutputField } from '@/components/Common/OutputField'
import { CopyButton } from '@/components/Common/CopyButton'
import { ShareButton } from '@/components/Common/ShareButton'
import { ToolOptions, type ToolOptionsComponentProps } from '@/components/Common/ToolOptions'
import { useTool } from '@/hooks/useTool'
import { useToolContext } from '@/context/ToolContext'
import type { InputEncoding } from '@/services/base32-base'
import { validateURLParameters, decodeInputFromURL } from '@/services/urlParameters'

const TOOL_ID = 'base32-encode'

function Base32EncodeOptions({
  options,
  onOptionChange,
}: ToolOptionsComponentProps): React.ReactElement {
  const { autoUpdate, toggleAutoUpdate } = useToolContext()
  const inputEncoding = (options.inputEncoding as InputEncoding) || 'UTF-8'
  const padding = options.padding !== undefined ? options.padding : true

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="encode-auto-update"
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

      <div>
        <label
          htmlFor="encode-input-encoding"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Input Encoding
        </label>
        <select
          id="encode-input-encoding"
          value={inputEncoding}
          onChange={(e) => onOptionChange('inputEncoding', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="UTF-8">UTF-8</option>
          <option value="ASCII">ASCII</option>
          <option value="Latin-1">Latin-1</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label
          htmlFor="encode-padding"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Add Padding
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(padding)}
          onClick={() => onOptionChange('padding', !padding)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${padding ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${padding ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
        <p>
          <strong>Encode:</strong> Convert text to RFC 4648 Base32 (uppercase A-Z, 2-7).
          Commonly used for TOTP/2FA secrets. Padding adds "=" characters to 8-character blocks.
        </p>
      </div>
    </div>
  )
}

export function Base32EncodeTool(): React.ReactElement {
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
  const [localOptions, setLocalOptions] = useState(currentOptions || {
    inputEncoding: 'UTF-8',
    padding: true,
  })

  useEffect(() => {
    setHeaderTitle('Base32 Encode')
    setHeaderDescription('Convert text to Base32 encoding')
    
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
      
      // Restore input encoding if present
      if (urlParams.input_encoding) {
        const newOptions = {
          ...localOptions,
          inputEncoding: urlParams.input_encoding.toUpperCase(),
        }
        setLocalOptions(newOptions)
        updateOption('inputEncoding', urlParams.input_encoding.toUpperCase())
      }
      
      // Restore padding if present
      if (urlParams.padding !== undefined) {
        const newOptions = {
          ...localOptions,
          padding: urlParams.padding === 'true' || urlParams.padding === true,
        }
        setLocalOptions(newOptions)
        updateOption('padding', urlParams.padding === 'true' || urlParams.padding === true)
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setLocalInput(currentInput || '')
  }, [currentInput])

  useEffect(() => {
    setLocalOptions(currentOptions || { inputEncoding: 'UTF-8', padding: true })
  }, [currentOptions])

  const { state, data, error, isExecuting, execute, reset } = useTool(TOOL_ID, {
    autoUpdate: false,
    initialInput: localInput,
    initialOptions: localOptions,
  })

  const handleInputChange = (value: string): void => {
    setLocalInput(value)
    setCurrentInput(value)
  }

  const handleOptionChange = (key: string, value: unknown): void => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    updateOption(key, value)
  }

  useEffect(() => {
    if (!autoUpdate) {
      return
    }

    // Feature 005: Auto-clear output when input is empty
    if (!localInput || localInput.trim() === '') {
      reset()
      return
    }

    const timer = setTimeout(() => {
      execute(localInput, localOptions)
    }, 200)

    return () => clearTimeout(timer)
  }, [localInput, localOptions, autoUpdate, execute, reset])

  const handleExecute = (): void => {
    execute(localInput, localOptions)
  }

  return (
    <div className="grid gap-4 h-full min-w-0 p-4" style={{ gridTemplateColumns: '1fr 2fr 2fr' }}>
      <div className="flex flex-col min-w-0 min-h-0 overflow-y-auto">
        <ToolOptions
          hasOptions={true}
          optionsComponent={Base32EncodeOptions}
          options={localOptions}
          onOptionsChange={setLocalOptions}
          onOptionChange={handleOptionChange}
          toolId={TOOL_ID}
        />
      </div>

      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <InputField
          id="encode-input"
          label="Text to Encode"
          value={localInput}
          onChange={handleInputChange}
          placeholder="Enter text to encode..."
          disabled={isExecuting}
        />
        
        {!autoUpdate && (
          <button
            type="button"
            onClick={handleExecute}
            disabled={isExecuting || !localInput}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm"
          >
            {isExecuting ? 'Encoding...' : 'Encode'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <OutputField
          id="encode-output"
          label="Encoded Base32"
          value={data || ''}
          showEmpty={!isExecuting && !data && !error}
        />
        
        {data && state === 'success' && (
          <div className="flex gap-2">
            <CopyButton textToCopy={data} />
            <ShareButton toolId={TOOL_ID} input={localInput} options={localOptions} />
          </div>
        )}
        
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
                  Encoding Error
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
