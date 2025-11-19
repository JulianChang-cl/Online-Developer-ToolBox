/**
 * Header component with branding and theme toggle
 * Shows app title, tool title (from context), and provides theme switching
 */

import React from 'react'
import { ThemeToggle } from './ThemeToggle'
import { useToolContext } from '@/context/ToolContext'

interface HeaderProps {
  /** Current theme (light or dark only) */
  theme: 'light' | 'dark'
  /** Theme change handler */
  onThemeChange: (theme: 'light' | 'dark') => void
  /** App title */
  title?: string
  /** Whether to show mobile menu button */
  showMenuButton?: boolean
  /** Mobile menu toggle handler */
  onMenuToggle?: () => void
  /** Whether mobile menu is open */
  isMobileMenuOpen?: boolean
  /** Additional CSS classes */
  className?: string
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  title = 'Online Developer Tools',
  showMenuButton = false,
  onMenuToggle,
  isMobileMenuOpen = false,
  className = '',
}) => {
  // Get tool title and description from context
  const { headerTitle, headerDescription } = useToolContext()

  return (
    <header
      className={`
        sticky top-0 z-50
        flex items-center justify-between
        px-6 py-4
        bg-white dark:bg-gray-900
        border-b border-gray-200 dark:border-gray-800
        transition-colors
        ${className}
      `}
    >
      {/* Left: Logo/Title + Mobile Menu Button */}
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="
              md:hidden
              p-2 rounded-lg
              text-gray-600 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors
            "
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="
              flex items-center justify-center
              w-10 h-10
              bg-gradient-to-br from-blue-500 to-blue-600
              rounded-lg
              shadow-sm
            "
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Title - Shows app title and/or tool title */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {headerTitle && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {headerTitle}
                </span>
                {headerDescription && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    • {headerDescription}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-4">
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>
    </header>
  )
}
