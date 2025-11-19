/**
 * Tool Registration
 * 
 * Central file for registering all tools with the ToolRegistry.
 * Each tool is registered with its metadata and service implementation.
 */

import { toolRegistry } from '@/services/ToolRegistry'
// import { base64Service } from '@/services/base64' // Legacy service - no longer used
import { base64EncodeService } from '@/services/base64-encode'
import { base64DecodeService } from '@/services/base64-decode'
import { base16EncodeService } from '@/services/base16-encode'
import { base16DecodeService } from '@/services/base16-decode'
import { base32EncodeService } from '@/services/base32-encode'
import { base32DecodeService } from '@/services/base32-decode'
import { jsonValidatorService } from '@/services/json-validator'
import { jsonMinifierService } from '@/services/json-minifier'
import { htmlEncoderService } from '@/services/html-encoder'
import { urlEncoderService } from '@/services/url-encoder'
import type { Tool } from '@/types/Tool'
import type { ToolGroup, ToolSettings } from '@/types/tools'

/**
 * Base64 Encode Tool Definition
 */
const base64EncodeTool: Tool = {
  id: 'base64-encode',
  name: 'Base64 Encode',
  description: 'Convert text to Base64 encoding with support for UTF-8, ASCII, and Latin-1 input encodings.',
  category: 'Encoders',
  icon: '🔤',
  service: base64EncodeService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Encode simple text',
      input: 'Hello, World!',
      options: { inputEncoding: 'UTF-8', format: 'RFC 4648' },
    },
    {
      label: 'URL-safe encoding',
      input: 'subjects?_d=1',
      options: { inputEncoding: 'UTF-8', format: 'URL-safe' },
    },
  ],
  keywords: ['base64', 'encode', 'encoding', 'btoa', 'rfc4648', 'urlsafe'],
  priority: 1,
}

/**
 * Base64 Decode Tool Definition
 */
const base64DecodeTool: Tool = {
  id: 'base64-decode',
  name: 'Base64 Decode',
  description: 'Convert Base64 to text with support for UTF-8, ASCII, and Latin-1 output encodings.',
  category: 'Encoders',
  icon: '🔤',
  service: base64DecodeService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Decode Base64',
      input: 'SGVsbG8sIFdvcmxkIQ==',
      options: { inputEncoding: 'UTF-8', format: 'RFC 4648' },
    },
    {
      label: 'Decode URL-safe Base64',
      input: 'c3ViamVjdHM_X2Q9MQ',
      options: { inputEncoding: 'UTF-8', format: 'URL-safe' },
    },
  ],
  keywords: ['base64', 'decode', 'decoding', 'atob', 'rfc4648', 'urlsafe'],
  priority: 2,
}

/**
 * Base16 Encode Tool Definition
 */
const base16EncodeTool: Tool = {
  id: 'base16-encode',
  name: 'Base16 Encode',
  description: 'Convert text to hexadecimal (Base16) encoding with support for UTF-8, ASCII, and Latin-1 input encodings.',
  category: 'Encoders',
  icon: '🔢',
  service: base16EncodeService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Encode simple text',
      input: 'Hello',
      options: { inputEncoding: 'UTF-8' },
    },
    {
      label: 'Encode with ASCII',
      input: 'ABC',
      options: { inputEncoding: 'ASCII' },
    },
  ],
  keywords: ['base16', 'hex', 'hexadecimal', 'encode', 'encoding'],
  priority: 3,
}

/**
 * Base16 Decode Tool Definition
 */
const base16DecodeTool: Tool = {
  id: 'base16-decode',
  name: 'Base16 Decode',
  description: 'Convert hexadecimal (Base16) to text with case-insensitive and whitespace-tolerant input.',
  category: 'Encoders',
  icon: '🔢',
  service: base16DecodeService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Decode hex',
      input: '48656c6c6f',
      options: { inputEncoding: 'UTF-8' },
    },
    {
      label: 'Decode with spaces',
      input: '48 65 6c 6c 6f',
      options: { inputEncoding: 'UTF-8' },
    },
  ],
  keywords: ['base16', 'hex', 'hexadecimal', 'decode', 'decoding'],
  priority: 4,
}

/**
 * Base32 Encode Tool Definition
 */
const base32EncodeTool: Tool = {
  id: 'base32-encode',
  name: 'Base32 Encode',
  description: 'Convert text to RFC 4648 Base32 encoding. Commonly used for TOTP/2FA secrets.',
  category: 'Encoders',
  icon: '🔢',
  service: base32EncodeService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Encode simple text',
      input: 'Hello',
      options: { inputEncoding: 'UTF-8', padding: true },
    },
    {
      label: 'Encode without padding',
      input: 'Hi',
      options: { inputEncoding: 'UTF-8', padding: false },
    },
  ],
  keywords: ['base32', 'encode', 'encoding', 'rfc4648', 'totp', '2fa'],
  priority: 5,
}

/**
 * Base32 Decode Tool Definition
 */
const base32DecodeTool: Tool = {
  id: 'base32-decode',
  name: 'Base32 Decode',
  description: 'Convert RFC 4648 Base32 to text. Case-insensitive and whitespace-tolerant.',
  category: 'Encoders',
  icon: '🔢',
  service: base32DecodeService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Decode Base32',
      input: 'JBSWY3DP',
      options: { inputEncoding: 'UTF-8' },
    },
    {
      label: 'Decode with padding',
      input: 'JBUQ====',
      options: { inputEncoding: 'UTF-8' },
    },
  ],
  keywords: ['base32', 'decode', 'decoding', 'rfc4648', 'totp', '2fa'],
  priority: 6,
}

/**
 * JSON Validator Tool Definition
 */
const jsonValidatorTool: Tool = {
  id: 'json-validator',
  name: 'JSON Validator',
  description: 'Validate JSON syntax and view detailed error messages with line and column numbers.',
  category: 'Formatters',
  icon: '✓',
  service: jsonValidatorService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Validate JSON',
      input: '{"name": "John", "age": 30}',
      options: {},
    },
    {
      label: 'Check invalid JSON',
      input: '{invalid}',
      options: {},
    },
  ],
  keywords: ['json', 'validate', 'validator', 'syntax', 'check', 'lint'],
  priority: 7,
}

/**
 * JSON Minifier Tool Definition
 */
const jsonMinifierTool: Tool = {
  id: 'json-minifier',
  name: 'JSON Minifier',
  description: 'Minify JSON by removing unnecessary whitespace while preserving structure and validity.',
  category: 'Formatters',
  icon: '⚡',
  service: jsonMinifierService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Minify formatted JSON',
      input: '{\n  "name": "John",\n  "age": 30\n}',
      options: {},
    },
    {
      label: 'Already minified',
      input: '{"compact":true}',
      options: {},
    },
  ],
  keywords: ['json', 'minify', 'minifier', 'compact', 'compress', 'whitespace'],
  priority: 8,
}

/**
 * HTML Encode Tool Definition
 */
const htmlEncodeTool: Tool = {
  id: 'html-encode',
  name: 'HTML Encode',
  description: 'Convert text to HTML entities for safe display and XSS prevention.',
  category: 'Encoders',
  icon: '🔒',
  service: htmlEncoderService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Encode HTML tags',
      input: '<script>alert("XSS")</script>',
      options: {},
    },
    {
      label: 'Encode special characters',
      input: 'A & B > C',
      options: {},
    },
  ],
  keywords: ['html', 'encode', 'entity', 'xss', 'escape', 'sanitize'],
  priority: 9,
}

/**
 * HTML Decode Tool Definition
 */
const htmlDecodeTool: Tool = {
  id: 'html-decode',
  name: 'HTML Decode',
  description: 'Convert HTML entities back to plain text characters.',
  category: 'Encoders',
  icon: '🔓',
  service: htmlEncoderService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Decode HTML entities',
      input: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
      options: {},
    },
    {
      label: 'Decode numeric entities',
      input: '&#60;div&#62;',
      options: {},
    },
  ],
  keywords: ['html', 'decode', 'entity', 'unescape', 'convert'],
  priority: 10,
}

/**
 * URL Encode Tool Definition
 */
const urlEncodeTool: Tool = {
  id: 'url-encode',
  name: 'URL Encode',
  description: 'Convert text to percent-encoded URL format (RFC 3986).',
  category: 'Encoders',
  icon: '🔗',
  service: urlEncoderService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Encode URL parameters',
      input: 'hello world',
      options: {},
    },
    {
      label: 'Encode special characters',
      input: 'key=value&foo=bar',
      options: {},
    },
  ],
  keywords: ['url', 'encode', 'percent', 'uri', 'escape', 'rfc3986'],
  priority: 11,
}

/**
 * URL Decode Tool Definition
 */
const urlDecodeTool: Tool = {
  id: 'url-decode',
  name: 'URL Decode',
  description: 'Convert percent-encoded URL format back to plain text.',
  category: 'Encoders',
  icon: '🔗',
  service: urlEncoderService as unknown as Tool['service'],
  supportsAutoUpdate: true,
  hasOptions: true,
  examples: [
    {
      label: 'Decode URL parameters',
      input: 'hello%20world',
      options: {},
    },
    {
      label: 'Decode special characters',
      input: 'key%3Dvalue%26foo%3Dbar',
      options: {},
    },
  ],
  keywords: ['url', 'decode', 'percent', 'uri', 'unescape', 'rfc3986'],
  priority: 12,
}

import { svgViewerService } from '@/services/svg-viewer'

/**
 * SVG Viewer Tool Definition
 */
const svgViewerTool: Tool = {
  id: 'svg-viewer',
  name: 'SVG Viewer',
  description: 'View, inspect, and convert SVG files. Supports zooming, panning, and exporting.',
  category: 'Viewers',
  icon: '🖼️',
  service: svgViewerService as unknown as Tool['service'],
  supportsAutoUpdate: false,
  hasOptions: true,
  examples: [],
  keywords: ['svg', 'viewer', 'vector', 'image', 'inspect'],
  priority: 13,
}

/**
 * Register all tools
 */
export function registerAllTools(): void {
  // Register new separated Base64 tools
  toolRegistry.register(base64EncodeTool)
  toolRegistry.register(base64DecodeTool)

  // Register Base16 tools
  toolRegistry.register(base16EncodeTool)
  toolRegistry.register(base16DecodeTool)

  // Register Base32 tools
  toolRegistry.register(base32EncodeTool)
  toolRegistry.register(base32DecodeTool)

  // Register Format tools
  toolRegistry.register(jsonValidatorTool)
  toolRegistry.register(jsonMinifierTool)

  // Register HTML tools
  toolRegistry.register(htmlEncodeTool)
  toolRegistry.register(htmlDecodeTool)

  // Register URL tools
  toolRegistry.register(urlEncodeTool)
  toolRegistry.register(urlDecodeTool)

  // Register Viewer tools
  toolRegistry.register(svgViewerTool)
}

/**
 * Get all registered tools
 */
export function getAllTools(): Tool[] {
  return toolRegistry.getAll()
}

/**
 * Get tool by ID
 */
export function getTool(toolId: string): Tool | undefined {
  return toolRegistry.get(toolId)
}

/**
 * Sidebar Organization: Tool Groups
 * 
 * Defines the hierarchical structure for sidebar navigation.
 * Each group contains related encoding tools (encode/decode variants).
 */
export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'base64',
    name: 'Base64',
    items: [
      { id: 'base64-encode', name: 'Encode', path: '/base64-encode', groupId: 'base64' },
      { id: 'base64-decode', name: 'Decode', path: '/base64-decode', groupId: 'base64' },
    ],
  },
  {
    id: 'base16',
    name: 'Base16',
    items: [
      { id: 'base16-encode', name: 'Encode', path: '/base16-encode', groupId: 'base16' },
      { id: 'base16-decode', name: 'Decode', path: '/base16-decode', groupId: 'base16' },
    ],
  },
  {
    id: 'base32',
    name: 'Base32',
    items: [
      { id: 'base32-encode', name: 'Encode', path: '/base32-encode', groupId: 'base32' },
      { id: 'base32-decode', name: 'Decode', path: '/base32-decode', groupId: 'base32' },
    ],
  },
  {
    id: 'json',
    name: 'JSON',
    items: [
      { id: 'json-validator', name: 'Validator', path: '/json-validator', groupId: 'json' },
      { id: 'json-minifier', name: 'Minifier', path: '/json-minifier', groupId: 'json' },
    ],
  },
  {
    id: 'html',
    name: 'HTML',
    items: [
      { id: 'html-encode', name: 'Encode', path: '/html-encode', groupId: 'html' },
      { id: 'html-decode', name: 'Decode', path: '/html-decode', groupId: 'html' },
    ],
  },
  {
    id: 'url',
    name: 'URL',
    items: [
      { id: 'url-encode', name: 'Encode', path: '/url-encode', groupId: 'url' },
      { id: 'url-decode', name: 'Decode', path: '/url-decode', groupId: 'url' },
    ],
  },
  {
    id: 'viewers',
    name: 'Viewers',
    items: [
      { id: 'svg-viewer', name: 'SVG Viewer', path: '/svg-viewer', groupId: 'viewers' },
    ],
  },
]

/**
 * Tool Parameter Definitions
 * 
 * Defines which URL parameters each tool accepts for shareable links.
 * Used by the share service to generate and validate URLs.
 */
export const TOOL_PARAMETERS: Record<string, string[]> = {
  'base64-encode': ['input', 'input_encoding', 'format'],
  'base64-decode': ['input', 'input_encoding', 'format'],
  'base16-encode': ['input', 'input_encoding'],
  'base16-decode': ['input', 'input_encoding'],
  'base32-encode': ['input', 'input_encoding', 'padding'],
  'base32-decode': ['input', 'input_encoding', 'padding'],
  'json-validator': ['input'],
  'json-minifier': ['input'],
  'html-encode': ['input'],
  'html-decode': ['input'],
  'url-encode': ['input'],
  'url-decode': ['input'],
  'svg-viewer': [],
}

/**
 * Default Settings per Tool
 * 
 * Defines default values used when URL parameters are missing or invalid.
 * Ensures tools always have valid initial state.
 */
export const DEFAULT_SETTINGS: Record<string, Partial<ToolSettings>> = {
  'base64-encode': {
    toolId: 'base64-encode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: { format: 'RFC 4648' },
  },
  'base64-decode': {
    toolId: 'base64-decode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: { format: 'RFC 4648' },
  },
  'base16-encode': {
    toolId: 'base16-encode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  'base16-decode': {
    toolId: 'base16-decode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  'base32-encode': {
    toolId: 'base32-encode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: { padding: true },
  },
  'base32-decode': {
    toolId: 'base32-decode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: { padding: true },
  },
  'json-validator': {
    toolId: 'json-validator',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  'json-minifier': {
    toolId: 'json-minifier',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  'html-encode': {
    toolId: 'html-encode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  'html-decode': {
    toolId: 'html-decode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  'url-encode': {
    toolId: 'url-encode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  'url-decode': {
    toolId: 'url-decode',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
  'svg-viewer': {
    toolId: 'svg-viewer',
    input: '',
    inputEncoding: 'utf-8',
    toolSpecificSettings: {},
  },
}
