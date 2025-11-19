/**
 * InputField component for tool input
 * - Full-height flexible layout with CSS Grid
 * - Auto-fills available vertical space
 */

import React from 'react'

interface InputFieldProps {
  /** Input value */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Field label */
  label: string
  /** Placeholder text */
  placeholder?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** Unique ID for accessibility */
  id: string
  /** Additional CSS classes */
  className?: string
  /** ARIA description */
  ariaDescribedBy?: string
}

export const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Enter your input here...',
  disabled = false,
  id,
  className = '',
  ariaDescribedBy,
}) => {
  return (
    <div className={`flex flex-col gap-2 flex-1 min-h-0 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0"
      >
        {label}
      </label>
      <div className="relative flex-1 min-h-0">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-label={label}
          className={`
            w-full h-full px-4 py-3 
            border border-gray-300 dark:border-gray-600 
            rounded-lg 
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            font-mono text-sm
            transition-colors
          `}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
        {value.length.toLocaleString()} characters
      </div>
    </div>
  )
}
