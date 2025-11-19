/**
 * ShareButton Component
 * 
 * Displays a button that generates a shareable URL for the current tool state.
 * Shows a dropdown with the URL and copy-to-clipboard functionality.
 */

import { useState, useRef, useEffect } from 'react'
import type { ToolSettings } from '@/types/tools'
import { generateShareURL } from '@/services/shareLink'

interface ShareButtonProps {
  toolId: string
  input: string
  inputEncoding: 'utf-8' | 'ascii' | 'latin-1'
  toolSpecificSettings?: Record<string, string | boolean | number>
}

export function ShareButton({
  toolId,
  input,
  inputEncoding,
  toolSpecificSettings = {},
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Generate shareable URL
  const settings: ToolSettings = {
    toolId,
    input,
    inputEncoding,
    toolSpecificSettings,
  }
  const shareURL = generateShareURL(settings)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Copy URL to clipboard
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareURL)
      setCopySuccess(true)
      setCopyError(false)

      // Reset success feedback after 1.5 seconds
      setTimeout(() => {
        setCopySuccess(false)
      }, 1500)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      setCopyError(true)
      setCopySuccess(false)

      // Reset error feedback after 3 seconds
      setTimeout(() => {
        setCopyError(false)
      }, 3000)
    }
  }

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-label="Share link"
        aria-expanded={isOpen}
      >
        {/* Share Icon */}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Shareable Link
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* URL Display */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareURL}
                readOnly
                className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.currentTarget.select()}
              />

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Copy to clipboard"
                title="Copy to clipboard"
              >
                {copySuccess ? (
                  // Check Icon (Success)
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  // Copy Icon
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Success/Error Feedback */}
            {copySuccess && (
              <p className="mt-2 text-sm text-green-600">Copied!</p>
            )}
            {copyError && (
              <p className="mt-2 text-sm text-red-600">
                Failed to copy. Please try again.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
