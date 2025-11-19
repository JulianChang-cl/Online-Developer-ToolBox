/**
 * OutputField component for displaying tool results
 * Read-only display with syntax highlighting support
 */

import React from 'react'

interface OutputFieldProps {
  /** Output value to display */
  value: string
  /** Field label */
  label: string
  /** Unique ID for accessibility */
  id: string
  /** Additional CSS classes */
  className?: string
  /** Whether to show empty state */
  showEmpty?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** ARIA description */
  ariaDescribedBy?: string
}

export const OutputField: React.FC<OutputFieldProps> = ({
  value,
  label,
  id,
  className = '',
  showEmpty = true,
  emptyMessage = 'Output will appear here...',
  ariaDescribedBy,
}) => {
  const isEmpty = !value || value.trim().length === 0

  return (
    <div className={`flex flex-col gap-2 flex-1 min-h-0 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0"
      >
        {label}
      </label>
      <div className="relative flex-1 min-h-0 overflow-auto">
        <div
          id={id}
          role="textbox"
          aria-readonly="true"
          aria-label={label}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full h-full
            px-4 py-3 
            border border-gray-300 dark:border-gray-600 
            rounded-lg 
            bg-gray-50 dark:bg-gray-900 
            text-gray-900 dark:text-gray-100
            font-mono text-sm
            whitespace-pre-wrap break-words
            transition-colors
            overflow-auto
          `}
        >
          {isEmpty && showEmpty ? (
            <span className="text-gray-400 dark:text-gray-500 italic">
              {emptyMessage}
            </span>
          ) : (
            value
          )}
        </div>
      </div>
      {!isEmpty && (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          {value.length.toLocaleString()} characters
        </div>
      )}
    </div>
  )
}
