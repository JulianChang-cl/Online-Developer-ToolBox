/**
 * Sidebar component for tool navigation
 * Shows collapsible groups of encoding tools (Base64, Base16, Base32)
 * Uses multi-open group behavior (not accordion)
 */

import React from 'react'
import { useSidebarState } from '@/hooks/useSidebarState'
import { TOOL_GROUPS } from '@/tools'
import type { ToolGroup } from '@/types/tools'

interface Tool {
  id: string
  name: string
  icon?: string
  category?: string
}

interface SidebarProps {
  /** Available tools to display */
  tools: Tool[]
  /** Currently selected tool ID */
  selectedToolId?: string
  /** Tool selection handler */
  onToolSelect: (toolId: string) => void
  /** Recent tool IDs */
  recentToolIds?: string[]
  /** Whether sidebar is collapsed (mobile) */
  isCollapsed?: boolean
  /** Additional CSS classes */
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  tools: _tools, // Legacy prop, now using TOOL_GROUPS
  selectedToolId,
  onToolSelect,
  recentToolIds: _recentToolIds = [], // Not used in new group-based design
  isCollapsed = false,
  className = '',
}) => {
  // Use multi-open sidebar state hook
  const [sidebarState, toggleGroup] = useSidebarState()

  const renderToolItem = (_groupId: string, itemName: string, itemId: string) => {
    const isSelected = selectedToolId === itemId

    return (
      <button
        key={itemId}
        onClick={() => onToolSelect(itemId)}
        className={`
          w-full flex items-center gap-2 px-4 py-2 pl-8
          text-left text-sm
          transition-colors
          ${
            isSelected
              ? 'bg-blue-600 text-white font-medium'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
        `}
        aria-current={isSelected ? 'page' : undefined}
        type="button"
      >
        {itemName}
      </button>
    )
  }

  const renderGroup = (group: ToolGroup) => {
    const isExpanded = sidebarState[group.id] ?? false

    return (
      <div key={group.id} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
        {/* Group Header (Clickable) */}
        <button
          onClick={() => toggleGroup(group.id)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-controls={`group-${group.id}`}
          type="button"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {group.name}
          </span>
          {/* Chevron Icon */}
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Group Items (Collapsible) */}
        {isExpanded && (
          <div id={`group-${group.id}`} className="pb-2">
            {group.items.map((item) =>
              renderToolItem(group.id, item.name, item.id)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={`
        flex flex-col
        h-full overflow-y-auto
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
      aria-label="Tool navigation"
    >
      {/* Encoding Tools Section */}
      <div className="pt-4">
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-4">
            Encoding
          </h2>
        )}
        <nav aria-label="Encoding tools">
          {TOOL_GROUPS.map(renderGroup)}
        </nav>
      </div>

      {/* Empty State */}
      {TOOL_GROUPS.length === 0 && !isCollapsed && (
        <div className="flex items-center justify-center h-full px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tools available
          </p>
        </div>
      )}
    </aside>
  )
}
