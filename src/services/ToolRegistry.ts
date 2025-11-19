/**
 * ToolRegistry service
 * Manages tool registration, discovery, and execution
 */

import type { Tool, ToolService, ToolResult, ToolRegistryEntry } from '@/types/Tool'

class ToolRegistry {
  private tools: Map<string, ToolRegistryEntry> = new Map()

  /**
   * Register a tool in the registry
   */
  register(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      console.warn(`Tool with id "${tool.id}" is already registered. Overwriting.`)
    }

    this.tools.set(tool.id, {
      tool,
      registeredAt: Date.now(),
    })
  }

  /**
   * Register multiple tools at once
   */
  registerMany(tools: Tool[]): void {
    tools.forEach((tool) => this.register(tool))
  }

  /**
   * Unregister a tool
   */
  unregister(toolId: string): boolean {
    return this.tools.delete(toolId)
  }

  /**
   * Get a tool by ID
   */
  get(toolId: string): Tool | undefined {
    return this.tools.get(toolId)?.tool
  }

  /**
   * Get a tool service by ID
   */
  getService(toolId: string): ToolService | undefined {
    return this.tools.get(toolId)?.tool.service
  }

  /**
   * Get all registered tools
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values())
      .map((entry) => entry.tool)
      .sort((a, b) => {
        // Sort by priority first (lower number = higher priority)
        const priorityDiff = (a.priority ?? 999) - (b.priority ?? 999)
        if (priorityDiff !== 0) return priorityDiff

        // Then by name alphabetically
        return a.name.localeCompare(b.name)
      })
  }

  /**
   * Get tools by category
   */
  getByCategory(category: string): Tool[] {
    return this.getAll().filter((tool) => tool.category === category)
  }

  /**
   * Discover tools (search by keyword)
   */
  discover(query: string): Tool[] {
    const lowerQuery = query.toLowerCase().trim()

    if (!lowerQuery) {
      return this.getAll()
    }

    return this.getAll().filter((tool) => {
      // Search in name
      if (tool.name.toLowerCase().includes(lowerQuery)) return true

      // Search in description
      if (tool.description.toLowerCase().includes(lowerQuery)) return true

      // Search in keywords
      if (tool.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery))) {
        return true
      }

      // Search in category
      if (tool.category.toLowerCase().includes(lowerQuery)) return true

      return false
    })
  }

  /**
   * Execute a tool
   */
  async execute<TInput = string, TOutput = string>(
    toolId: string,
    input: TInput,
    options?: Record<string, unknown>
  ): Promise<ToolResult<TOutput>> {
    const service = this.getService(toolId) as ToolService<TInput, TOutput> | undefined

    if (!service) {
      return {
        success: false,
        error: `Tool "${toolId}" not found`,
      }
    }

    const startTime = performance.now()

    try {
      // Validate input if validation is supported
      if (service.validate) {
        const validation = service.validate(input, options)
        if (!validation.valid) {
          return {
            success: false,
            error: validation.error || 'Validation failed',
            executionTime: performance.now() - startTime,
          }
        }
      }

      // Execute the tool
      const result = await service.execute(input, options)

      // Add execution time if not already present
      if (result.executionTime === undefined) {
        result.executionTime = performance.now() - startTime
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: performance.now() - startTime,
      }
    }
  }

  /**
   * Validate input for a tool without executing
   */
  validate<TInput = string>(
    toolId: string,
    input: TInput,
    options?: Record<string, unknown>
  ): { valid: boolean; error?: string } {
    const service = this.getService(toolId) as ToolService<TInput> | undefined

    if (!service) {
      return {
        valid: false,
        error: `Tool "${toolId}" not found`,
      }
    }

    if (!service.validate) {
      // No validation function means input is always valid
      return { valid: true }
    }

    return service.validate(input, options)
  }

  /**
   * Get default options for a tool
   */
  getDefaultOptions(toolId: string): Record<string, unknown> {
    const service = this.getService(toolId)

    if (!service || !service.getDefaultOptions) {
      return {}
    }

    return service.getDefaultOptions()
  }

  /**
   * Check if a tool exists
   */
  has(toolId: string): boolean {
    return this.tools.has(toolId)
  }

  /**
   * Get total number of registered tools
   */
  count(): number {
    return this.tools.size
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear()
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    const categories = new Set(this.getAll().map((tool) => tool.category))
    return Array.from(categories).sort()
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry()

// Export class for testing
export { ToolRegistry }
