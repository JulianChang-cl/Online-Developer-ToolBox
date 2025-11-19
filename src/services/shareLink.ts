/**
 * Share Link Service
 * 
 * Generates shareable URLs for tools with Base64-encoded input and settings.
 * URLs can be shared with others to pre-populate tool state.
 */

import type { ToolSettings } from '@/types/tools'
import { encodeInputForURL } from './urlParameters'
import { TOOL_PARAMETERS } from '@/tools'

/**
 * Generate a shareable URL for a tool with current settings
 * 
 * @param settings - Current tool state (input, encoding, tool-specific settings)
 * @returns Complete URL with query parameters
 * 
 * @example
 * ```ts
 * const settings = {
 *   toolId: 'base64-encode',
 *   input: 'Hello World',
 *   inputEncoding: 'utf-8',
 *   toolSpecificSettings: { format: 'RFC 4648' }
 * }
 * const url = generateShareURL(settings)
 * // Returns: "http://localhost:5173/base64-encode?input=SGVsbG8gV29ybGQ&input_encoding=utf-8&format=RFC%204648"
 * ```
 */
export function generateShareURL(settings: ToolSettings): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:5173'

  // Build tool path from toolId
  const toolPath = `/${settings.toolId}`

  // Prepare parameters object
  const params: Record<string, string | boolean | number> = {}

  // Encode input as Base64 (empty string is valid)
  params.input = encodeInputForURL(settings.input)

  // Add input encoding
  params.input_encoding = settings.inputEncoding

  // Add tool-specific settings
  Object.entries(settings.toolSpecificSettings || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params[key] = value
    }
  })

  // Build query string
  const queryString = buildQueryString(params)

  // Combine into complete URL
  return `${baseUrl}${toolPath}${queryString ? `?${queryString}` : ''}`
}

/**
 * Build URL query string from parameters object
 * 
 * @param params - Parameters to serialize
 * @returns Query string (without leading ?)
 * 
 * @example
 * ```ts
 * const params = { input: 'SGVsbG8=', input_encoding: 'utf-8', padding: true }
 * const qs = buildQueryString(params)
 * // Returns: "input=SGVsbG8%3D&input_encoding=utf-8&padding=true"
 * ```
 */
export function buildQueryString(
  params: Record<string, string | boolean | number | undefined | null>
): string {
  const entries = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const encodedKey = encodeURIComponent(key)
      const encodedValue = encodeURIComponent(String(value))
      return `${encodedKey}=${encodedValue}`
    })

  return entries.join('&')
}

/**
 * Get the list of parameters that should be included in the URL for a specific tool
 * 
 * @param toolId - Tool identifier
 * @returns Array of parameter names
 */
export function getToolParameters(toolId: string): string[] {
  return TOOL_PARAMETERS[toolId] || ['input', 'input_encoding']
}
