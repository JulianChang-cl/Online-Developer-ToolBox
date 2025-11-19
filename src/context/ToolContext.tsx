/**
 * ToolContext for managing global tool state
 * Tracks: selectedTool, autoUpdate toggle, currentInput, currentOptions
 */

import React, { createContext, useContext, useState, useCallback } from 'react'

interface ToolOptions {
  [key: string]: unknown
}

interface ToolContextValue {
  /** Currently selected tool ID */
  selectedToolId: string | null
  /** Set selected tool */
  setSelectedToolId: (toolId: string | null) => void
  
  /** Whether auto-update is enabled */
  autoUpdate: boolean
  /** Toggle auto-update */
  toggleAutoUpdate: () => void
  /** Set auto-update */
  setAutoUpdate: (enabled: boolean) => void
  
  /** Current input value */
  currentInput: string
  /** Set current input */
  setCurrentInput: (input: string) => void
  
  /** Current tool options */
  currentOptions: ToolOptions
  /** Set current options */
  setCurrentOptions: (options: ToolOptions) => void
  /** Update a single option */
  updateOption: (key: string, value: unknown) => void
  
  /** Header title (tool name displayed in header) */
  headerTitle?: string
  /** Set header title */
  setHeaderTitle: (title: string | undefined) => void
  
  /** Header description (tool description displayed in header) */
  headerDescription?: string
  /** Set header description */
  setHeaderDescription: (description: string | undefined) => void
  
  /** Reset all state */
  reset: () => void
}

const ToolContext = createContext<ToolContextValue | undefined>(undefined)

interface ToolProviderProps {
  children: React.ReactNode
}

export const ToolProvider: React.FC<ToolProviderProps> = ({ children }) => {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [currentInput, setCurrentInput] = useState('')
  const [currentOptions, setCurrentOptions] = useState<ToolOptions>({})
  const [headerTitle, setHeaderTitle] = useState<string | undefined>(undefined)
  const [headerDescription, setHeaderDescription] = useState<string | undefined>(undefined)

  const toggleAutoUpdate = useCallback(() => {
    setAutoUpdate((prev) => !prev)
  }, [])

  const updateOption = useCallback((key: string, value: unknown) => {
    setCurrentOptions((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const reset = useCallback(() => {
    setSelectedToolId(null)
    setAutoUpdate(true)
    setCurrentInput('')
    setCurrentOptions({})
    setHeaderTitle(undefined)
    setHeaderDescription(undefined)
  }, [])

  const value: ToolContextValue = {
    selectedToolId,
    setSelectedToolId,
    autoUpdate,
    toggleAutoUpdate,
    setAutoUpdate,
    currentInput,
    setCurrentInput,
    currentOptions,
    setCurrentOptions,
    updateOption,
    headerTitle,
    setHeaderTitle,
    headerDescription,
    setHeaderDescription,
    reset,
  }

  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToolContext = (): ToolContextValue => {
  const context = useContext(ToolContext)
  if (context === undefined) {
    throw new Error('useToolContext must be used within a ToolProvider')
  }
  return context
}
