import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Add custom jest matchers from jest-dom
// This extends Jest with DOM element assertions

// Polyfill TextEncoder/TextDecoder for Node.js test environment
global.TextEncoder = TextEncoder as typeof global.TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder
