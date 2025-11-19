/**
 * ToolOptions Component
 *
 * Displays tool-specific options in an accordion UI.
 * Expanded by default, allowing users to collapse if desired.
 * No persistence - desktop-primary design.
 */

import React, { useState } from 'react'

interface ToolOptionsProps {
  /**
   * Whether the tool has options to display
   */
  hasOptions: boolean

  /**
   * Custom options component to render
   */
  optionsComponent?: React.ComponentType<ToolOptionsComponentProps>

  /**
   * Current options values
   */
  options: Record<string, unknown>

  /**
   * Callback when options change
   */
  onOptionsChange: (options: Record<string, unknown>) => void

  /**
   * Callback when a single option changes
   */
  onOptionChange: (key: string, value: unknown) => void

  /**
   * Tool ID for analytics/debugging
   */
  toolId?: string
}

export interface ToolOptionsComponentProps {
  /**
   * Current options values
   */
  options: Record<string, unknown>

  /**
   * Callback when options change
   */
  onOptionsChange: (options: Record<string, unknown>) => void

  /**
   * Callback when a single option changes
   */
  onOptionChange: (key: string, value: unknown) => void
}

/**
 * ToolOptions component with accordion UI
 */
export function ToolOptions({
  hasOptions,
  optionsComponent: OptionsComponent,
  options,
  onOptionsChange,
  onOptionChange,
  toolId,
}: ToolOptionsProps): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(true)

  // Don't render if tool has no options
  if (!hasOptions || !OptionsComponent) {
    return null
  }

  const toggleExpanded = (): void => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
      data-testid="tool-options"
      data-tool-id={toolId}
    >
      {/* Accordion Header */}
      <button
        type="button"
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="tool-options-content"
        data-testid="tool-options-toggle"
      >
        <span className="font-medium text-gray-900 dark:text-gray-100">Settings</span>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div
          id="tool-options-content"
          className="px-4 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          data-testid="tool-options-content"
        >
          <OptionsComponent
            options={options}
            onOptionsChange={onOptionsChange}
            onOptionChange={onOptionChange}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Example options component for reference
 * Tool implementations should provide their own custom options component
 */
export function ExampleOptionsComponent({
  options,
  onOptionChange,
}: ToolOptionsComponentProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Checkbox example */}
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={(options.exampleCheckbox as boolean) || false}
          onChange={(e) => onOptionChange('exampleCheckbox', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">Example Checkbox</span>
      </label>

      {/* Select example */}
      <div>
        <label htmlFor="example-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Example Select
        </label>
        <select
          id="example-select"
          value={(options.exampleSelect as string) || 'option1'}
          onChange={(e) => onOptionChange('exampleSelect', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      </div>

      {/* Number input example */}
      <div>
        <label htmlFor="example-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Example Number
        </label>
        <input
          type="number"
          id="example-number"
          value={(options.exampleNumber as number) || 0}
          onChange={(e) => onOptionChange('exampleNumber', parseInt(e.target.value, 10))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min={0}
          max={100}
        />
      </div>
    </div>
  )
}
