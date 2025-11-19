/**
 * JSON Minifier Tool
 * Feature 005: UI Bug Fixes & Format Tools
 * 
 * A tool for minifying JSON by removing whitespace while maintaining validity.
 * Shows size reduction statistics and formatted minified output.
 */

import React, { useState, useEffect } from 'react'
import { InputField } from '@/components/Common/InputField'
import { OutputField } from '@/components/Common/OutputField'
import { CopyButton } from '@/components/Common/CopyButton'
import { ShareButton } from '@/components/Common/ShareButton'
import { ToolOptions, type ToolOptionsComponentProps } from '@/components/Common/ToolOptions'
import { useToolContext } from '@/context/ToolContext'
import { minifyJSON } from '@/utils/json-utils'
import type { JSONMinificationResult } from '@/types/json-tools'

const TOOL_ID = 'json-minifier'

// Sub-component: Displays minification statistics
interface MinificationStatsProps {
  result: JSONMinificationResult | null
}

function MinificationStats({ result }: MinificationStatsProps): React.ReactElement | null {
  if (!result) {
    return null
  }

  if (!result.valid) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
        <div className="flex items-center gap-2 text-red-700">
          <span className="text-xl">✗</span>
          <span className="font-semibold">Invalid JSON</span>
        </div>
        {result.error && (
          <p className="mt-2 text-sm text-red-600">{result.error}</p>
        )}
      </div>
    )
  }

  const hasReduction = result.saved > 0

  return (
    <div 
      className={`mb-4 p-4 border rounded-lg ${
        hasReduction 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xl ${hasReduction ? 'text-green-600' : 'text-gray-600'}`}>
          {hasReduction ? '✓' : '○'}
        </span>
        <span className={`font-semibold ${hasReduction ? 'text-green-700' : 'text-gray-700'}`}>
          Minification {hasReduction ? 'Complete' : 'Not Needed'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600">Original Size:</span>
          <span className="ml-2 font-mono font-semibold text-gray-900">
            {result.originalSize.toLocaleString()} bytes
          </span>
        </div>
        <div>
          <span className="text-gray-600">Minified Size:</span>
          <span className="ml-2 font-mono font-semibold text-gray-900">
            {result.minifiedSize.toLocaleString()} bytes
          </span>
        </div>
        <div>
          <span className="text-gray-600">Bytes Saved:</span>
          <span className={`ml-2 font-mono font-semibold ${
            hasReduction ? 'text-green-700' : 'text-gray-900'
          }`}>
            {result.saved.toLocaleString()} bytes
          </span>
        </div>
        <div>
          <span className="text-gray-600">Reduction:</span>
          <span className={`ml-2 font-mono font-semibold ${
            hasReduction ? 'text-green-700' : 'text-gray-900'
          }`}>
            {result.percent}%
          </span>
        </div>
      </div>
    </div>
  )
}

// Options component
function JSONMinifierOptions({
  options: _options,
  onOptionChange: _onOptionChange,
}: ToolOptionsComponentProps): React.ReactElement {
  const { autoUpdate, toggleAutoUpdate } = useToolContext()

  return (
    <div className="space-y-4">
      {/* Auto-Update Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="minifier-auto-update"
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
        <p className="mb-2">
          This tool removes unnecessary whitespace from JSON while preserving its structure and validity.
        </p>
        <p className="text-xs">
          💡 <strong>Tip:</strong> Already minified JSON will show 0% reduction.
        </p>
      </div>
    </div>
  )
}

// Main component
export function JSONMinifierTool(): React.ReactElement {
  const {
    currentInput,
    currentOptions,
    setCurrentInput,
    updateOption,
    autoUpdate,
    setHeaderTitle
  } = useToolContext()

  const [localInput, setLocalInput] = useState(currentInput)
  const [localOptions, setLocalOptions] = useState(currentOptions || {})
  const [result, setResult] = useState<JSONMinificationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize header title
  useEffect(() => {
    setHeaderTitle('JSON Minifier')
    return () => setHeaderTitle('')
  }, [setHeaderTitle])

  // Restore input from URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const inputParam = params.get('input')
    if (inputParam) {
      const decodedInput = decodeURIComponent(inputParam)
      setLocalInput(decodedInput)
      setCurrentInput(decodedInput)
    }
  }, [setCurrentInput])

  // Auto-minify with debounce and auto-clear
  useEffect(() => {
    if (!autoUpdate) {
      return
    }

    // Feature 005: Auto-clear output when input is empty
    if (!localInput || localInput.trim() === '') {
      setResult(null)
      return
    }

    const timer = setTimeout(() => {
      setIsProcessing(true)
      const minificationResult = minifyJSON(localInput)
      setResult(minificationResult)
      setIsProcessing(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [localInput, autoUpdate])

  const handleInputChange = (value: string): void => {
    setLocalInput(value)
    setCurrentInput(value)
  }

  const handleMinify = (): void => {
    setIsProcessing(true)
    const minificationResult = minifyJSON(localInput)
    setResult(minificationResult)
    setIsProcessing(false)
  }

  const handleOptionChange = (key: string, value: unknown): void => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)
    updateOption(key, value)
  }

  return (
    <div className="grid gap-4 h-full min-w-0 p-4" style={{ gridTemplateColumns: '1fr 2fr 2fr' }}>
      {/* Settings Column */}
      <div className="flex flex-col min-w-0 min-h-0 overflow-y-auto">
        <ToolOptions
          hasOptions={true}
          optionsComponent={JSONMinifierOptions}
          options={localOptions}
          onOptionsChange={setLocalOptions}
          onOptionChange={handleOptionChange}
          toolId={TOOL_ID}
        />
      </div>

      {/* Input Column */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <InputField
          value={localInput}
          onChange={handleInputChange}
          placeholder='Paste your formatted JSON here...'
          label="JSON to Minify"
          id="json-minifier-input"
          disabled={isProcessing}
        />
        
        {!autoUpdate && (
          <button
            type="button"
            onClick={handleMinify}
            disabled={isProcessing || !localInput.trim()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm"
          >
            {isProcessing ? 'Minifying...' : 'Minify'}
          </button>
        )}
      </div>

      {/* Output Column */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        {/* Minification Stats - Only show when there's a result */}
        {result && <MinificationStats result={result} />}
        
        {/* Minified Output - Always visible */}
        <OutputField
          value={result?.minified || ''}
          label="Minified JSON"
          id="json-minifier-output"
          showEmpty={!isProcessing && !result}
        />

        {/* Actions - Only show when there's valid output */}
        {result?.valid && (
          <div className="flex gap-2">
            <CopyButton textToCopy={result.minified} />
            <ShareButton 
              toolId={TOOL_ID}
              input={localInput}
              options={localOptions}
            />
          </div>
        )}
      </div>
    </div>
  )
}
