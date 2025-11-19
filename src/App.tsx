/**
 * Main App component
 * Combines Header, Sidebar, and content area with theme and tool state management
 */

import { useState, useEffect } from 'react'
import { Header } from './components/Layout/Header'
import { Sidebar } from './components/Layout/Sidebar'
import { Base64EncodeTool } from './components/Tools/Base64EncodeTool'
import { Base64DecodeTool } from './components/Tools/Base64DecodeTool'
import { Base16EncodeTool } from './components/Tools/Base16EncodeTool'
import { Base16DecodeTool } from './components/Tools/Base16DecodeTool'
import { Base32EncodeTool } from './components/Tools/Base32EncodeTool'
import { Base32DecodeTool } from './components/Tools/Base32DecodeTool'
import { JSONValidatorTool } from './components/Tools/JSONValidatorTool'
import { JSONMinifierTool } from './components/Tools/JSONMinifierTool'
import { HTMLEncodeTool } from './components/Tools/HTMLEncodeTool'
import { HTMLDecodeTool } from './components/Tools/HTMLDecodeTool'
import { URLEncodeTool } from './components/Tools/URLEncodeTool'
import { URLDecodeTool } from './components/Tools/URLDecodeTool'
import { SVGViewerTool } from './components/Tools/SVGViewerTool'
import { useTheme } from './hooks/useTheme'
import { ToolProvider, useToolContext } from './context/ToolContext'
import { getAllTools } from './tools'

function AppContent() {
  const { theme, setTheme } = useTheme()
  const { selectedToolId, setSelectedToolId, setCurrentInput, setCurrentOptions } = useToolContext()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const allTools = getAllTools()

  // Map Tool objects to Sidebar format
  const sidebarTools = allTools.map(tool => ({
    id: tool.id,
    name: tool.name,
    icon: typeof tool.icon === 'string' ? tool.icon : '🔧',
    category: tool.category,
  }))

  // Auto-select first tool if none selected
  useEffect(() => {
    if (!selectedToolId && allTools.length > 0) {
      setSelectedToolId(allTools[0].id)
    }
  }, [selectedToolId, allTools, setSelectedToolId])

  // Reset input/output when tool changes
  useEffect(() => {
    setCurrentInput('')
    setCurrentOptions({})
  }, [selectedToolId, setCurrentInput, setCurrentOptions])

  const handleToolSelect = (toolId: string) => {
    setSelectedToolId(toolId)
    setIsMobileMenuOpen(false)
  }

  // Render the selected tool component
  const renderTool = () => {
    if (!selectedToolId) {
      return (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Online Developer Tools
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a tool from the sidebar to get started.
          </p>
        </div>
      )
    }

    // Map tool IDs to components
    switch (selectedToolId) {
      case 'base64-encode':
        return <Base64EncodeTool />
      case 'base64-decode':
        return <Base64DecodeTool />
      case 'base16-encode':
        return <Base16EncodeTool />
      case 'base16-decode':
        return <Base16DecodeTool />
      case 'base32-encode':
        return <Base32EncodeTool />
      case 'base32-decode':
        return <Base32DecodeTool />
      case 'json-validator':
        return <JSONValidatorTool />
      case 'json-minifier':
        return <JSONMinifierTool />
      case 'html-encode':
        return <HTMLEncodeTool />
      case 'html-decode':
        return <HTMLDecodeTool />
      case 'url-encode':
        return <URLEncodeTool />
      case 'url-decode':
        return <URLDecodeTool />
      case 'svg-viewer':
        return <SVGViewerTool />
      case 'base64':
        // Redirect legacy ID to encode
        return <Base64EncodeTool />
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Tool Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The selected tool is not yet implemented.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        showMenuButton={true}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile unless menu is open */}
        <div
          className={`
            ${isMobileMenuOpen ? 'block' : 'hidden'} 
            md:block
            fixed md:relative
            inset-0 top-[73px] md:top-0
            z-40
            bg-black/50 md:bg-transparent
          `}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full md:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              tools={sidebarTools}
              selectedToolId={selectedToolId || undefined}
              onToolSelect={handleToolSelect}
              recentToolIds={[]}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {renderTool()}
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <ToolProvider>
      <AppContent />
    </ToolProvider>
  )
}

export default App
