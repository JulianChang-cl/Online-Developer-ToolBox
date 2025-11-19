import type { ToolService, ToolResult, ValidationResult } from '@/types/Tool'

interface SVGViewerOptions {
    operation?: 'view' | 'metadata'
}

interface SVGMetadata {
    width?: string
    height?: string
    viewBox?: string
    title?: string
    desc?: string
}

export const svgViewerService: ToolService<string, string | SVGMetadata> = {
    id: 'svg-viewer',

    validate(input: string): ValidationResult {
        if (!input || input.trim() === '') {
            return { valid: true } // Empty input is valid (initial state)
        }

        const trimmed = input.trim()

        // Basic check for SVG tag
        if (!trimmed.toLowerCase().includes('<svg') || !trimmed.toLowerCase().includes('</svg>')) {
            return {
                valid: false,
                error: 'Invalid SVG: Missing <svg> tags'
            }
        }

        try {
            const parser = new DOMParser()
            const doc = parser.parseFromString(trimmed, 'image/svg+xml')
            const parserError = doc.querySelector('parsererror')

            if (parserError) {
                return {
                    valid: false,
                    error: 'Invalid SVG: XML parsing failed'
                }
            }

            return { valid: true }
        } catch (e) {
            return {
                valid: false,
                error: 'Invalid SVG: Parsing exception'
            }
        }
    },

    async execute(input: string, options?: SVGViewerOptions): Promise<ToolResult<string | SVGMetadata>> {
        if (!input) {
            return { success: true, data: '' }
        }

        const validation = this.validate!(input)
        if (!validation.valid) {
            return { success: false, error: validation.error }
        }

        if (options?.operation === 'metadata') {
            try {
                const parser = new DOMParser()
                const doc = parser.parseFromString(input, 'image/svg+xml')
                const svg = doc.querySelector('svg')

                if (!svg) {
                    return { success: false, error: 'No SVG element found' }
                }

                const metadata: SVGMetadata = {
                    width: svg.getAttribute('width') || undefined,
                    height: svg.getAttribute('height') || undefined,
                    viewBox: svg.getAttribute('viewBox') || undefined,
                    title: svg.querySelector('title')?.textContent || undefined,
                    desc: svg.querySelector('desc')?.textContent || undefined
                }

                return { success: true, data: metadata as any }
            } catch (e) {
                return { success: false, error: 'Failed to extract metadata' }
            }
        }

        // Default: return the input as is (sanitized/verified by validate)
        return { success: true, data: input }
    },

    getDefaultOptions() {
        return {
            operation: 'view'
        }
    }
}
