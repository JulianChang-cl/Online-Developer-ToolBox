import { describe, it, expect } from '@jest/globals'
import { svgViewerService } from '@/services/svg-viewer'

describe('SVG Viewer Service Contract Tests', () => {
    const validSVG = '<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" /></svg>'
    const invalidSVG = '<div>Not an SVG</div>'
    const malformedSVG = '<svg>Unclosed tag'

    describe('Validation', () => {
        it('should validate valid SVG content', () => {
            const result = svgViewerService.validate!(validSVG)
            expect(result.valid).toBe(true)
        })

        it('should validate empty input', () => {
            const result = svgViewerService.validate!('')
            expect(result.valid).toBe(true)
        })

        it('should reject content without svg tags', () => {
            const result = svgViewerService.validate!(invalidSVG)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('Missing <svg> tags')
        })

        it('should reject malformed XML', () => {
            const result = svgViewerService.validate!(malformedSVG)
            expect(result.valid).toBe(false)
            // The specific error message depends on DOMParser implementation in jsdom, 
            // but it should fail either on tags or parsing
        })
    })

    describe('Execution', () => {
        it('should return input for view operation', async () => {
            const result = await svgViewerService.execute(validSVG, { operation: 'view' })
            expect(result.success).toBe(true)
            expect(result.data).toBe(validSVG)
        })

        it('should extract metadata', async () => {
            const result = await svgViewerService.execute(validSVG, { operation: 'metadata' })
            expect(result.success).toBe(true)
            const metadata = result.data as any
            expect(metadata.width).toBe('100')
            expect(metadata.height).toBe('100')
            expect(metadata.viewBox).toBe('0 0 100 100')
        })

        it('should fail execution on invalid input', async () => {
            const result = await svgViewerService.execute(invalidSVG)
            expect(result.success).toBe(false)
        })
    })
})
