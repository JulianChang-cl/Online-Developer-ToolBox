/**
 * HTML Decode Tool Component
 *
 * Converts HTML entities back to plain text characters.
 * Decodes: &lt; &gt; &amp; &quot; &apos; and numeric entities
 */

import React, { useState, useEffect } from 'react'
import { InputField } from '@/components/Common/InputField'
import { OutputField } from '@/components/Common/OutputField'
import { CopyButton } from '@/components/Common/CopyButton'
import { ShareButton } from '@/components/Common/ShareButton'
import { ToolOptions, type ToolOptionsComponentProps } from '@/components/Common/ToolOptions'
import { useToolContext } from '@/context/ToolContext'
import { htmlEncoderService } from '@/services/html-encoder'
import { validateURLParameters, decodeInputFromURL } from '@/services/urlParameters'

const TOOL_ID = 'html-decode'

/**
 * HTML Decode options component (minimal - no special options needed)
 */
function HTMLDecodeOptions({
  options: _options,
  onOptionChange: _onOptionChange,
}: ToolOptionsComponentProps): React.ReactElement {
  const { autoUpdate, toggleAutoUpdate } = useToolContext()

  return (
    <div className="space-y-4">
      {/* Auto-Update Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="html-decode-auto-update"
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
          <strong>HTML Decode:</strong> Converts HTML entities back to their original characters.
        </p>
        <p className="mt-2">
          <strong>Supported entities:</strong>
        </p>
        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
          <li>Named: &amp;lt; &amp;gt; &amp;amp; &amp;quot; &amp;apos;</li>
          <li>Decimal: &amp;#60; &amp;#62;</li>
          <li>Hexadecimal: &amp;#x3C; &amp;#x3E;</li>
        </ul>
        <p className="mt-2">
          <strong>Note:</strong> Malformed entities (missing semicolon) pass through unchanged.
        </p>
      </div>
    </div>
  )
}

/**
 * HTML Decode Tool Component
 */
export function HTMLDecodeTool(): React.ReactElement {
  const {
    currentInput,
    currentOptions,
    setCurrentInput,
    autoUpdate,
    setHeaderTitle,
    setHeaderDescription,
  } = useToolContext()

  const [localInput, setLocalInput] = useState(currentInput || '')
  const [localOptions, setLocalOptions] = useState(currentOptions || {})
  const [output, setOutput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Set header title on mount, clear on unmount
  useEffect(() => {
    setHeaderTitle('HTML Decode')
    setHeaderDescription('Convert HTML entities back to plain text')
    
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

  // Sync with context
  useEffect(() => {
    setLocalInput(currentInput || '')
  }, [currentInput])

  useEffect(() => {
    setLocalOptions(currentOptions || {})
  }, [currentOptions])

  // Handle input change
  const handleInputChange = (value: string): void => {
    setLocalInput(value)
    setCurrentInput(value)
  }

  // Handle option change (no options currently, but kept for consistency)
  const handleOptionChange = (_key: string, _value: unknown): void => {
    // No options to handle for HTML decode
  }

  // Auto-update effect: Decode when input changes (with debounce)
  // Auto-clear output when input is empty
  useEffect(() => {
    if (!autoUpdate) {
      return
    }

    // If input is empty, clear output immediately (auto-clear feature)
    if (!localInput || localInput.trim() === '') {
      setOutput('')
      setIsProcessing(false)
      return
    }

    const timer = setTimeout(() => {
      setIsProcessing(true)
      
      try {
        const decoded = htmlEncoderService.decode(localInput)
        setOutput(decoded)
      } catch (error) {
        console.error('HTML decoding failed:', error)
        setOutput('')
      } finally {
        setIsProcessing(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [localInput, autoUpdate])

  // Handle manual execute
  const handleExecute = (): void => {
    if (!localInput || localInput.trim() === '') {
      setOutput('')
      return
    }

    setIsProcessing(true)
    
    try {
      const decoded = htmlEncoderService.decode(localInput)
      setOutput(decoded)
    } catch (error) {
      console.error('HTML decoding failed:', error)
      setOutput('')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid gap-4 h-full min-w-0 p-4" style={{ gridTemplateColumns: '1fr 2fr 2fr' }}>
      {/* Settings Column */}
      <div className="flex flex-col min-w-0 min-h-0 overflow-y-auto">
        <ToolOptions
          hasOptions={true}
          optionsComponent={HTMLDecodeOptions}
          options={localOptions}
          onOptionsChange={setLocalOptions}
          onOptionChange={handleOptionChange}
          toolId={TOOL_ID}
        />
      </div>

      {/* Input Column */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <InputField
          id="html-decode-input"
          label="HTML Entities to Decode"
          value={localInput}
          onChange={handleInputChange}
          placeholder="Enter HTML entities: &lt;script&gt; &#60; &#x3C;"
          disabled={isProcessing}
        />
        
        {!autoUpdate && (
          <button
            type="button"
            onClick={handleExecute}
            disabled={isProcessing || !localInput}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm"
          >
            {isProcessing ? 'Decoding...' : 'Decode'}
          </button>
        )}
      </div>

      {/* Output Column */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0">
        <OutputField
          id="html-decode-output"
          label="Decoded Text"
          value={output}
          showEmpty={!isProcessing && !output}
        />
        
        {output && (
          <div className="flex gap-2">
            <CopyButton textToCopy={output} />
            <ShareButton toolId={TOOL_ID} input={localInput} options={localOptions} />
          </div>
        )}
      </div>
    </div>
  )
}
