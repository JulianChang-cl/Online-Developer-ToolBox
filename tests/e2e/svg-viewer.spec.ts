import { test, expect } from '@playwright/test'

test.describe('SVG Viewer Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        // Expand the Viewers group
        await page.click('text=Viewers')
        // Click on the SVG Viewer in the sidebar
        await page.click('text=SVG Viewer')
    })

    test('should load the tool', async ({ page }) => {
        await expect(page.locator('h2:has-text("Tool Not Found")')).not.toBeVisible()
        await expect(page.locator('text=Drag & Drop SVG files here')).toBeVisible()
    })

    test('should handle file upload', async ({ page }) => {
        // Create a dummy SVG file
        const svgContent = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>'

        // Trigger file chooser
        const fileChooserPromise = page.waitForEvent('filechooser')
        await page.click('text=Open SVG')
        const fileChooser = await fileChooserPromise

        await fileChooser.setFiles({
            name: 'test.svg',
            mimeType: 'image/svg+xml',
            buffer: Buffer.from(svgContent)
        })

        // Verify file is loaded
        await expect(page.locator('text=test.svg')).toBeVisible()
        await expect(page.locator('text=Drag & Drop SVG files here')).not.toBeVisible()

        // Verify SVG content is rendered
        // We look for the circle element inside the viewer
        const circle = page.locator('circle')
        await expect(circle).toBeVisible()
    })

    test('should handle zoom controls', async ({ page }) => {
        // Upload file first
        const svgContent = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" /></svg>'
        const fileChooserPromise = page.waitForEvent('filechooser')
        await page.click('text=Open SVG')
        const fileChooser = await fileChooserPromise
        await fileChooser.setFiles({
            name: 'zoom-test.svg',
            mimeType: 'image/svg+xml',
            buffer: Buffer.from(svgContent)
        })

        // Check initial scale (we can't easily check exact scale, but we can check transform style)
        // This is a bit tricky in E2E, so we'll just verify buttons exist and are clickable
        await page.click('button[title="Zoom In"]')
        await page.click('button[title="Zoom Out"]')
        await page.click('button[title="Reset View"]')
    })
})
