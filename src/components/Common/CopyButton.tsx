/**
 * CopyButton component with Clipboard API + fallback
 * - Tries navigator.clipboard.writeText() first (per UI clarification Q3)
 * - Falls back to execCommand('copy') if API fails
 * - Shows error toast if both methods fail
 */

import React, { useState } from 'react'

interface CopyButtonProps {
  /** Text to copy to clipboard */
  textToCopy: string
  /** Button label */
  label?: string
  /** Additional CSS classes */
  className?: string
  /** Callback when copy succeeds */
  onCopySuccess?: () => void
  /** Callback when copy fails */
  onCopyError?: (error: Error) => void
  /** Whether button is disabled */
  disabled?: boolean
}

type CopyState = 'idle' | 'copying' | 'success' | 'error'

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  className = '',
  onCopySuccess,
  onCopyError,
  disabled = false,
}) => {
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const copyToClipboard = async () => {
    if (!textToCopy || disabled) return

    setCopyState('copying')
    setErrorMessage('')

    try {
      // Method 1: Try Clipboard API first (modern browsers)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy)
        setCopyState('success')
        onCopySuccess?.()
        
        // Reset state after 2 seconds
        setTimeout(() => setCopyState('idle'), 2000)
        return
      }

      // Method 2: Fallback to execCommand (legacy browsers)
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        setCopyState('success')
        onCopySuccess?.()
        setTimeout(() => setCopyState('idle'), 2000)
      } else {
        throw new Error('execCommand failed')
      }
    } catch (error) {
      // Both methods failed
      const errorMsg = error instanceof Error ? error.message : 'Failed to copy'
      setErrorMessage(errorMsg)
      setCopyState('error')
      
      const copyError = new Error(`Copy failed: ${errorMsg}`)
      onCopyError?.(copyError)

      // Reset error state after 3 seconds
      setTimeout(() => {
        setCopyState('idle')
        setErrorMessage('')
      }, 3000)
    }
  }

  const getButtonContent = () => {
    switch (copyState) {
      case 'copying':
        return (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Copying...</span>
          </>
        )
      case 'success':
        return (
          <>
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Copied!</span>
          </>
        )
      case 'error':
        return (
          <>
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>Failed</span>
          </>
        )
      default:
        return (
          <>
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            <span>{label}</span>
          </>
        )
    }
  }

  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center gap-2 px-4 py-2 
      rounded-lg font-medium text-sm
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    switch (copyState) {
      case 'success':
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`
      case 'error':
        return `${baseStyles} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`
      default:
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600`
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={copyToClipboard}
        disabled={disabled || !textToCopy || copyState === 'copying'}
        className={getButtonStyles()}
        aria-label={`${label} to clipboard`}
        type="button"
      >
        {getButtonContent()}
      </button>
      {copyState === 'error' && errorMessage && (
        <div
          role="alert"
          className="text-xs text-red-600 dark:text-red-400 px-1"
        >
          {errorMessage}
        </div>
      )}
    </div>
  )
}
