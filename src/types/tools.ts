/**
 * Domain types for Feature 004: UI Layout Refinement & Shareable Links
 * 
 * This file defines the core data structures for:
 * - Sidebar organization (groups and items)
 * - Tool state management (settings and inputs)
 * - Share functionality (URL generation and parameters)
 */

/**
 * Represents a collapsible group of related encoding tools in the sidebar
 */
export interface ToolGroup {
  /** Unique identifier for the group (e.g., "base64", "base16", "base32") */
  id: string;
  
  /** Display name shown in sidebar (e.g., "Base64 Encoding") */
  name: string;
  
  /** List of tool items in this group */
  items: ToolItem[];
  
  /** Whether this group is currently expanded (UI state) */
  isExpanded?: boolean;
}

/**
 * Represents a single encoding/decoding tool that can be navigated to
 */
export interface ToolItem {
  /** Unique identifier (e.g., "base64_encode", "base32_decode") */
  id: string;
  
  /** Display name (e.g., "Encode", "Decode") */
  name: string;
  
  /** URL path to tool page (e.g., "/base64_encode") */
  path: string;
  
  /** Parent group ID */
  groupId: string;
}

/**
 * Represents the current configuration/state of a specific encoding tool
 */
export interface ToolSettings {
  /** Tool identifier (e.g., "base64_encode") */
  toolId: string;
  
  /** Current input text */
  input: string;
  
  /** How the input should be interpreted */
  inputEncoding: 'utf-8' | 'ascii' | 'latin-1';
  
  /** Tool-specific settings (varies by tool) */
  toolSpecificSettings: Record<string, string | boolean | number>;
  
  /** Computed output (read-only, derived from input and settings) */
  output?: string;
}

/**
 * Represents a generated shareable URL containing all tool state as query parameters
 */
export interface ShareLink {
  /** The complete URL including domain and parameters */
  url: string;
  
  /** Tool identifier for reference */
  toolId: string;
  
  /** When this share link was generated (for optional analytics) */
  generatedAt: Date;
  
  /** The original settings that generated this link */
  settings: ToolSettings;
}

/**
 * Represents the query parameters serialized in a shareable link
 */
export interface URLParameters {
  /** Input text encoded in Base64 (to handle special characters safely) */
  input: string;
  
  /** Input encoding format */
  input_encoding: string;
  
  /** Tool-specific parameters (e.g., padding, format) */
  [key: string]: string | boolean | number;
}

/**
 * State shape for sidebar group expansion
 * Maps groupId to boolean (true = expanded, false = collapsed)
 */
export interface SidebarState {
  [groupId: string]: boolean;
}

/**
 * UI state for Share button component
 */
export interface ShareButtonState {
  /** Whether the dropdown is currently visible */
  isOpen: boolean;
  
  /** The generated shareable URL (if any) */
  generatedUrl?: string;
  
  /** Whether the URL was recently copied (for feedback UI) */
  copiedRecently?: boolean;
}
