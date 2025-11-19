/**
 * URL Utilities
 *
 * Utilities for encoding/decoding shareable state to/from URLs.
 * Validates URL length (<2000 chars) for maximum compatibility.
 */

import type { ShareableState, ShareResult } from '@/types/Result'

/**
 * Maximum URL length for share links
 * 2000 chars ensures compatibility with most browsers and servers
 */
export const MAX_URL_LENGTH = 2000

/**
 * URL parameter key for encoded state
 */
export const SHARE_PARAM_KEY = 'share'

/**
 * Encode shareable state to URL-safe Base64 string
 */
export function encodeShareState(state: ShareableState): string {
  try {
    // Convert to JSON
    const json = JSON.stringify(state)

    // Encode to Base64
    const base64 = btoa(json)

    // Make URL-safe by replacing characters
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } catch (error) {
    throw new Error(
      `Failed to encode share state: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Decode URL-safe Base64 string to shareable state
 */
export function decodeShareState(encoded: string): ShareableState {
  try {
    // Restore standard Base64 characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    const padding = base64.length % 4
    if (padding > 0) {
      base64 += '='.repeat(4 - padding)
    }

    // Decode from Base64
    const json = atob(base64)

    // Parse JSON
    const state = JSON.parse(json) as ShareableState

    // Validate required fields
    if (!state.toolId || typeof state.toolId !== 'string') {
      throw new Error('Invalid share state: missing or invalid toolId')
    }

    if (!state.input || typeof state.input !== 'string') {
      throw new Error('Invalid share state: missing or invalid input')
    }

    return state
  } catch (error) {
    throw new Error(
      `Failed to decode share state: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Validate URL length
 */
export function validateUrlLength(url: string): {
  valid: boolean
  length: number
  tooLong: boolean
} {
  const length = url.length

  return {
    valid: length <= MAX_URL_LENGTH,
    length,
    tooLong: length > MAX_URL_LENGTH,
  }
}

/**
 * Check if a URL contains valid share state
 */
export function isValidShareUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const encoded = urlObj.searchParams.get(SHARE_PARAM_KEY)

    if (!encoded) {
      return false
    }

    // Try to decode to validate
    decodeShareState(encoded)
    return true
  } catch {
    return false
  }
}

/**
 * Create a share URL from current state
 */
export function createShareUrl(
  baseUrl: string,
  state: ShareableState
): ShareResult {
  try {
    // Encode state
    const encoded = encodeShareState(state)

    // Build URL
    const url = new URL(baseUrl)
    url.searchParams.set(SHARE_PARAM_KEY, encoded)
    const shareUrl = url.toString()

    // Validate length
    const validation = validateUrlLength(shareUrl)

    if (validation.tooLong) {
      return {
        success: false,
        error: `Share URL is too long (${validation.length} chars). Maximum is ${MAX_URL_LENGTH} chars.`,
        length: validation.length,
        tooLong: true,
      }
    }

    return {
      success: true,
      url: shareUrl,
      length: validation.length,
      tooLong: false,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create share URL',
      tooLong: false,
    }
  }
}

/**
 * Extract share state from URL
 */
export function extractShareState(url: string): ShareableState | null {
  try {
    const urlObj = new URL(url)
    const encoded = urlObj.searchParams.get(SHARE_PARAM_KEY)

    if (!encoded) {
      return null
    }

    return decodeShareState(encoded)
  } catch {
    return null
  }
}

/**
 * Get current page URL
 */
export function getCurrentUrl(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.location.href.split('?')[0] || window.location.origin
}
