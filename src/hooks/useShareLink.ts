/**
 * useShareLink Hook
 * 
 * React hook for generating shareable links for tool state.
 * Wraps the shareLink service with React-friendly interface.
 */

import { useMemo } from 'react'
import type { ToolSettings } from '@/types/tools'
import { generateShareURL } from '@/services/shareLink'

interface UseShareLinkParams {
  toolId: string
  input: string
  inputEncoding: 'utf-8' | 'ascii' | 'latin-1'
  toolSpecificSettings?: Record<string, string | boolean | number>
}

/**
 * Generate a shareable link for the current tool state
 * 
 * @param params - Tool state parameters
 * @returns Shareable URL string
 * 
 * @example
 * ```tsx
 * const shareURL = useShareLink({
 *   toolId: 'base64-encode',
 *   input: 'Hello World',
 *   inputEncoding: 'utf-8',
 *   toolSpecificSettings: { format: 'RFC 4648' }
 * })
 * ```
 */
export function useShareLink({
  toolId,
  input,
  inputEncoding,
  toolSpecificSettings = {},
}: UseShareLinkParams): string {
  const shareURL = useMemo(() => {
    const settings: ToolSettings = {
      toolId,
      input,
      inputEncoding,
      toolSpecificSettings,
    }

    return generateShareURL(settings)
  }, [toolId, input, inputEncoding, toolSpecificSettings])

  return shareURL
}
