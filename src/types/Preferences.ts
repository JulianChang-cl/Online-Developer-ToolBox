/**
 * User preferences and theme configuration types
 * Used for localStorage persistence and theme management
 */

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  /** Current theme mode */
  theme: Theme
  /** Whether to follow system preferences when theme is 'system' */
  followSystem: boolean
}

export interface ToolHistory {
  /** Tool identifier (e.g., 'base64', 'json-validator') */
  toolId: string
  /** Last used timestamp */
  lastUsed: number
  /** Number of times used */
  usageCount: number
}

export interface UserPreferences {
  /** Theme configuration */
  theme: ThemeConfig
  /** Recently used tools */
  recentTools: ToolHistory[]
  /** Maximum number of recent tools to track */
  maxRecentTools: number
  /** Whether to save tool inputs in history */
  saveHistory: boolean
  /** Whether to show tooltips for first-time users */
  showTooltips: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: {
    theme: 'light',
    followSystem: false,
  },
  recentTools: [],
  maxRecentTools: 5,
  saveHistory: true,
  showTooltips: true,
}

export const STORAGE_KEYS = {
  PREFERENCES: 'online-tools-preferences',
  THEME: 'online-tools-theme',
  RECENT_TOOLS: 'online-tools-recent',
} as const
