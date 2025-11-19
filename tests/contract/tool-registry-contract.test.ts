/**
 * Contract Tests for ToolRegistry Service
 *
 * These tests verify that the ToolRegistry service fulfills its contract:
 * - Tool registration and retrieval
 * - Tool execution with validation
 * - Tool discovery by keywords
 * - Error handling for missing tools
 * - Validation without execution
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { ToolRegistry } from '@/services/ToolRegistry'
import type { Tool, ToolService } from '@/types/Tool'

describe('ToolRegistry Contract Tests', () => {
  let registry: ToolRegistry

  // Mock tool service for testing
  const createMockService = <TInput = string, TOutput = string>(
    shouldSucceed = true
  ): ToolService<TInput, TOutput> => ({
    execute: async (input: TInput) => {
      if (shouldSucceed) {
        return {
          success: true,
          data: `Processed: ${input}` as TOutput,
        }
      }
      return {
        success: false,
        error: 'Execution failed',
      }
    },
    validate: (input: TInput) => {
      if (!input || (typeof input === 'string' && input.trim() === '')) {
        return {
          valid: false,
          error: 'Input is required',
        }
      }
      return { valid: true }
    },
    getDefaultOptions: () => ({}),
  })

  const mockTool: Tool = {
    id: 'test-tool',
    name: 'Test Tool',
    description: 'A tool for testing',
    category: 'Other',
    icon: 'TestIcon',
    service: createMockService(),
    supportsAutoUpdate: true,
    hasOptions: false,
    examples: ['example1', 'example2'],
    keywords: ['test', 'mock'],
  }

  beforeEach(() => {
    registry = new ToolRegistry()
  })

  describe('Tool Registration and Retrieval', () => {
    it('should register a tool and retrieve it via getAll()', () => {
      registry.register(mockTool)

      const tools = registry.getAll()
      expect(tools).toHaveLength(1)
      expect(tools[0]).toEqual(mockTool)
    })

    it('should register multiple tools via registerMany()', () => {
      const tool2: Tool = {
        ...mockTool,
        id: 'test-tool-2',
        name: 'Test Tool 2',
      }

      registry.registerMany([mockTool, tool2])

      const tools = registry.getAll()
      expect(tools).toHaveLength(2)
    })

    it('should retrieve a tool by ID', () => {
      registry.register(mockTool)

      const tool = registry.get('test-tool')
      expect(tool).toEqual(mockTool)
    })

    it('should return undefined for non-existent tool', () => {
      const tool = registry.get('non-existent')
      expect(tool).toBeUndefined()
    })

    it('should check if a tool exists', () => {
      registry.register(mockTool)

      expect(registry.has('test-tool')).toBe(true)
      expect(registry.has('non-existent')).toBe(false)
    })

    it('should unregister a tool', () => {
      registry.register(mockTool)
      expect(registry.has('test-tool')).toBe(true)

      const result = registry.unregister('test-tool')
      expect(result).toBe(true)
      expect(registry.has('test-tool')).toBe(false)
    })

    it('should return false when unregistering non-existent tool', () => {
      const result = registry.unregister('non-existent')
      expect(result).toBe(false)
    })

    it('should count registered tools', () => {
      expect(registry.count()).toBe(0)

      registry.register(mockTool)
      expect(registry.count()).toBe(1)

      const tool2: Tool = { ...mockTool, id: 'test-tool-2' }
      registry.register(tool2)
      expect(registry.count()).toBe(2)
    })

    it('should clear all tools', () => {
      registry.registerMany([mockTool, { ...mockTool, id: 'test-tool-2' }])
      expect(registry.count()).toBe(2)

      registry.clear()
      expect(registry.count()).toBe(0)
    })
  })

  describe('Tool Execution', () => {
    it('should execute a tool successfully', async () => {
      registry.register(mockTool)

      const result = await registry.execute('test-tool', 'test input')

      expect(result.success).toBe(true)
      expect(result.data).toBe('Processed: test input')
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('should validate input before execution', async () => {
      registry.register(mockTool)

      const result = await registry.execute('test-tool', '')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Input is required')
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('should handle tool execution failure', async () => {
      const failingTool: Tool = {
        ...mockTool,
        id: 'failing-tool',
        service: createMockService(false),
      }
      registry.register(failingTool)

      const result = await registry.execute('failing-tool', 'test input')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Execution failed')
    })

    it('should return error for non-existent tool', async () => {
      const result = await registry.execute('non-existent', 'test input')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Tool "non-existent" not found')
    })

    it('should handle exceptions during execution', async () => {
      const throwingService: ToolService = {
        execute: async () => {
          throw new Error('Unexpected error')
        },
        validate: () => ({ valid: true }),
        getDefaultOptions: () => ({}),
      }

      const throwingTool: Tool = {
        ...mockTool,
        id: 'throwing-tool',
        service: throwingService,
      }
      registry.register(throwingTool)

      const result = await registry.execute('throwing-tool', 'test input')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unexpected error')
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
    })

    it('should measure execution time', async () => {
      const slowService: ToolService = {
        execute: async (input: string) => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return { success: true, data: input }
        },
        validate: () => ({ valid: true }),
        getDefaultOptions: () => ({}),
      }

      const slowTool: Tool = {
        ...mockTool,
        id: 'slow-tool',
        service: slowService,
      }
      registry.register(slowTool)

      const result = await registry.execute('slow-tool', 'test input')

      expect(result.success).toBe(true)
      expect(result.executionTime).toBeGreaterThanOrEqual(10)
    })
  })

  describe('Tool Validation', () => {
    it('should validate input without execution', () => {
      registry.register(mockTool)

      const result = registry.validate('test-tool', 'valid input')

      expect(result.valid).toBe(true)
    })

    it('should return validation error for invalid input', () => {
      registry.register(mockTool)

      const result = registry.validate('test-tool', '')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Input is required')
    })

    it('should handle tool without validation function', () => {
      const noValidationService: ToolService = {
        execute: async (input: string) => ({ success: true, data: input }),
        getDefaultOptions: () => ({}),
      }

      const noValidationTool: Tool = {
        ...mockTool,
        id: 'no-validation-tool',
        service: noValidationService,
      }
      registry.register(noValidationTool)

      const result = registry.validate('no-validation-tool', 'any input')

      expect(result.valid).toBe(true)
    })

    it('should return error for non-existent tool', () => {
      const result = registry.validate('non-existent', 'test input')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Tool "non-existent" not found')
    })
  })

  describe('Tool Discovery', () => {
    beforeEach(() => {
      const encoderTool: Tool = {
        id: 'base64-encoder',
        name: 'Base64 Encoder',
        description: 'Encode text to Base64',
        category: 'Encoders',
        icon: 'EncoderIcon',
        service: createMockService(),
        supportsAutoUpdate: true,
        hasOptions: false,
        keywords: ['base64', 'encode'],
      }

      const validatorTool: Tool = {
        id: 'json-validator',
        name: 'JSON Validator',
        description: 'Validate JSON syntax',
        category: 'Validators',
        icon: 'ValidatorIcon',
        service: createMockService(),
        supportsAutoUpdate: true,
        hasOptions: false,
        keywords: ['json', 'validate'],
      }

      registry.registerMany([encoderTool, validatorTool])
    })

    it('should discover tools by name', () => {
      const tools = registry.discover('Base64')

      expect(tools).toHaveLength(1)
      expect(tools[0].id).toBe('base64-encoder')
    })

    it('should discover tools by description', () => {
      const tools = registry.discover('Validate JSON')

      expect(tools).toHaveLength(1)
      expect(tools[0].id).toBe('json-validator')
    })

    it('should discover tools by keyword', () => {
      const tools = registry.discover('encode')

      expect(tools).toHaveLength(1)
      expect(tools[0].id).toBe('base64-encoder')
    })

    it('should discover tools by category', () => {
      const tools = registry.discover('Encoders')

      expect(tools).toHaveLength(1)
      expect(tools[0].category).toBe('Encoders')
    })

    it('should be case-insensitive', () => {
      const tools = registry.discover('json')

      expect(tools).toHaveLength(1)
      expect(tools[0].id).toBe('json-validator')
    })

    it('should return empty array for no matches', () => {
      const tools = registry.discover('non-existent-query')

      expect(tools).toEqual([])
    })

    it('should match partial words', () => {
      const tools = registry.discover('val')

      expect(tools).toHaveLength(1)
      expect(tools[0].id).toBe('json-validator')
    })
  })

  describe('Tool Organization', () => {
    beforeEach(() => {
      const tools: Tool[] = [
        {
          id: 'encoder-1',
          name: 'Encoder 1',
          description: 'Test encoder',
          category: 'Encoders',
          icon: 'Icon',
          service: createMockService(),
          supportsAutoUpdate: true,
          hasOptions: false,
          priority: 2,
        },
        {
          id: 'encoder-2',
          name: 'Encoder 2',
          description: 'Test encoder',
          category: 'Encoders',
          icon: 'Icon',
          service: createMockService(),
          supportsAutoUpdate: true,
          hasOptions: false,
          priority: 1,
        },
        {
          id: 'validator-1',
          name: 'Validator 1',
          description: 'Test validator',
          category: 'Validators',
          icon: 'Icon',
          service: createMockService(),
          supportsAutoUpdate: true,
          hasOptions: false,
        },
      ]

      registry.registerMany(tools)
    })

    it('should get tools by category', () => {
      const encoders = registry.getByCategory('Encoders')

      expect(encoders).toHaveLength(2)
      expect(encoders.every((tool: Tool) => tool.category === 'Encoders')).toBe(true)
    })

    it('should sort tools by priority then name', () => {
      const tools = registry.getAll()

      // encoder-2 (priority 1) should come before encoder-1 (priority 2)
      expect(tools[0].id).toBe('encoder-2')
      expect(tools[1].id).toBe('encoder-1')
    })

    it('should get all unique categories', () => {
      const categories = registry.getCategories()

      expect(categories).toHaveLength(2)
      expect(categories).toContain('Encoders')
      expect(categories).toContain('Validators')
    })

    it('should sort categories alphabetically', () => {
      const categories = registry.getCategories()

      expect(categories[0]).toBe('Encoders')
      expect(categories[1]).toBe('Validators')
    })
  })

  describe('Tool Service Retrieval', () => {
    it('should retrieve tool service by ID', () => {
      registry.register(mockTool)

      const service = registry.getService('test-tool')

      expect(service).toBeDefined()
      expect(service).toBe(mockTool.service)
    })

    it('should return undefined for non-existent tool service', () => {
      const service = registry.getService('non-existent')

      expect(service).toBeUndefined()
    })

    it('should get default options from tool service', () => {
      const serviceWithOptions: ToolService = {
        execute: async (input: string) => ({ success: true, data: input }),
        validate: () => ({ valid: true }),
        getDefaultOptions: () => ({ optionA: true, optionB: 'value' }),
      }

      const toolWithOptions: Tool = {
        ...mockTool,
        id: 'tool-with-options',
        service: serviceWithOptions,
        hasOptions: true,
      }
      registry.register(toolWithOptions)

      const options = registry.getDefaultOptions('tool-with-options')

      expect(options).toEqual({ optionA: true, optionB: 'value' })
    })

    it('should return empty object for non-existent tool options', () => {
      const options = registry.getDefaultOptions('non-existent')

      expect(options).toEqual({})
    })
  })
})
