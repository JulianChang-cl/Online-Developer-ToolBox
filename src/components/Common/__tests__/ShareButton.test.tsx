/**
 * ShareButton Component Tests
 * 
 * Tests for the ShareButton component with dropdown UI and clipboard functionality.
 */

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareButton } from '../ShareButton'

// Mock clipboard API
const writeTextMock = jest.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: writeTextMock,
  },
})

// Mock window.location for tests - JSDOM uses http://localhost by default

describe('ShareButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    writeTextMock.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('should render share button', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Share')
    })

    it('should not show dropdown initially', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      expect(screen.queryByTestId('share-dropdown')).not.toBeInTheDocument()
    })
  })

  describe('Dropdown Interaction', () => {
    it('should open dropdown when button is clicked', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      expect(screen.getByTestId('share-dropdown')).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('should close dropdown when button is clicked again', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      
      // Open
      fireEvent.click(button)
      expect(screen.getByTestId('share-dropdown')).toBeInTheDocument()

      // Close
      fireEvent.click(button)
      expect(screen.queryByTestId('share-dropdown')).not.toBeInTheDocument()
    })

    it('should close dropdown when close button is clicked', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const closeButton = screen.getByLabelText('Close')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('share-dropdown')).not.toBeInTheDocument()
    })

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <ShareButton
            toolId="base64-encode"
            input="Hello World"
            options={{ inputEncoding: 'utf-8' }}
          />
          <div data-testid="outside">Outside</div>
        </div>
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      expect(screen.getByTestId('share-dropdown')).toBeInTheDocument()

      // Click outside
      const outside = screen.getByTestId('outside')
      fireEvent.mouseDown(outside)

      await waitFor(() => {
        expect(screen.queryByTestId('share-dropdown')).not.toBeInTheDocument()
      })
    })
  })

  describe('URL Generation', () => {
    it('should display generated URL with input and options', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8', format: 'RFC 4648' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const urlInput = screen.getByTestId('share-url-input') as HTMLInputElement
      expect(urlInput.value).toContain('http://localhost/base64-encode')
      expect(urlInput.value).toContain('input=')
      expect(urlInput.value).toContain('input_encoding=utf-8')
    })

    it('should generate URL with empty input', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input=""
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const urlInput = screen.getByTestId('share-url-input') as HTMLInputElement
      expect(urlInput.value).toContain('http://localhost/base64-encode')
      expect(urlInput.value).toContain('input_encoding=utf-8')
    })

    it('should include tool-specific settings in URL', () => {
      render(
        <ShareButton
          toolId="base32-encode"
          input="Test"
          options={{ inputEncoding: 'utf-8', padding: true }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const urlInput = screen.getByTestId('share-url-input') as HTMLInputElement
      expect(urlInput.value).toContain('padding=true')
    })
  })

  describe('Copy to Clipboard', () => {
    it('should copy URL to clipboard when copy button is clicked', async () => {
      writeTextMock.mockResolvedValue(undefined)

      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      // Open dropdown
      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      // Click copy button
      const copyButton = screen.getByTestId('copy-button')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledTimes(1)
        expect(writeTextMock).toHaveBeenCalledWith(
          expect.stringContaining('http://localhost/base64-encode')
        )
      })
    })

    it('should show success feedback after successful copy', async () => {
      writeTextMock.mockResolvedValue(undefined)

      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const copyButton = screen.getByTestId('copy-button')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByTestId('copy-success')).toBeInTheDocument()
        expect(screen.getByTestId('copy-success')).toHaveTextContent('Copied!')
      })
    })

    it('should show error feedback when copy fails', async () => {
      writeTextMock.mockRejectedValue(new Error('Clipboard error'))

      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const copyButton = screen.getByTestId('copy-button')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByTestId('copy-error')).toBeInTheDocument()
        expect(screen.getByTestId('copy-error')).toHaveTextContent(
          'Failed to copy. Please try again.'
        )
      })
    })

    it('should reset success feedback after 1.5 seconds', async () => {
      jest.useFakeTimers()
      writeTextMock.mockResolvedValue(undefined)

      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const copyButton = screen.getByTestId('copy-button')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByTestId('copy-success')).toBeInTheDocument()
      })

      // Fast-forward 1.5 seconds
      jest.advanceTimersByTime(1500)

      await waitFor(() => {
        expect(screen.queryByTestId('copy-success')).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })

  describe('URL Input Field', () => {
    it('should be read-only', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const urlInput = screen.getByTestId('share-url-input') as HTMLInputElement
      expect(urlInput).toHaveAttribute('readonly')
    })

    it('should select text when clicked', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const urlInput = screen.getByTestId('share-url-input') as HTMLInputElement
      const selectSpy = jest.spyOn(urlInput, 'select')

      fireEvent.click(urlInput)

      expect(selectSpy).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      
      // Initially collapsed
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-label', 'Share link')

      // After opening
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have accessible close button', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const closeButton = screen.getByLabelText('Close')
      expect(closeButton).toBeInTheDocument()
    })

    it('should have accessible copy button', () => {
      render(
        <ShareButton
          toolId="base64-encode"
          input="Hello World"
          options={{ inputEncoding: 'utf-8' }}
        />
      )

      const button = screen.getByTestId('share-button')
      fireEvent.click(button)

      const copyButton = screen.getByLabelText('Copy to clipboard')
      expect(copyButton).toBeInTheDocument()
    })
  })
})
