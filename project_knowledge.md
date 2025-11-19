# Canonical Project Knowledge: Online Tools Platform

**Version**: 1.0.0  
**Last Updated**: 2025-11-19

This document serves as the authoritative reference for AI code-generation agents and developers. It codifies the architecture, module boundaries, data contracts, coding conventions, design patterns, and operational workflows for the Online Tools Platform.

---

## 1. Project Overview

The **Online Tools Platform** is a client-side, offline-capable web application providing developer utilities (Base64, JSON Validator, Encryption, etc.). It is built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

### Key Principles
- **100% Client-Side**: No data transmission to servers.
- **Offline Capable**: Fully functional without internet.
- **Performance First**: <50ms interaction response, <2s load time.
- **Accessibility**: WCAG 2.1 Level AA compliant.
- **Strict Types**: No `any`, strict null checks, comprehensive interfaces.

---

## 2. Architecture & Design Patterns

### 2.1 Tool Factory Pattern
The core architectural pattern is the **Tool Factory**. All tools are decoupled from the UI and registered via a central `ToolRegistry`.

- **Registry**: `src/services/ToolRegistry.ts` (Singleton)
- **Pattern**: Strategy Pattern for tool execution.
- **Mechanism**: Tools register themselves at runtime. The UI queries the registry to render the sidebar and route requests.

### 2.2 State Management
- **Global State**: React Context (`ToolContext`) manages the currently selected tool, input/output state, and user preferences.
- **Persistence**: `StorageService` persists user preferences (theme, favorites) to `localStorage`.
- **Session State**: Tool input/output is **ephemeral** (in-memory only) for privacy, unless explicitly shared via URL parameters.

### 2.3 API/UI Boundary
Strict separation between UI components and business logic.

- **Flow**: `User Input` -> `Validation` -> `Service Execution` -> `Result Formatting` -> `UI Display`.
- **Error Handling**:
    - **Validation Errors**: Caught before execution (e.g., invalid JSON).
    - **Execution Errors**: Caught during processing (e.g., runtime exception).
    - **Boundary**: React Error Boundaries catch component-level crashes.

---

## 3. Module Boundaries

### 3.1 `src/services/` (Business Logic)
- **Responsibility**: Pure functional implementations of tool logic.
- **Constraints**:
    - **NO UI code** (no React, no JSX).
    - **Stateless**: Functions should be pure where possible.
    - **Testability**: Must be 100% coverable by unit tests.
- **Key Files**:
    - `ToolRegistry.ts`: Central management.
    - `[tool-name].ts`: Individual tool implementations.

### 3.2 `src/components/` (User Interface)
- **Responsibility**: Rendering UI and handling user interaction.
- **Structure**:
    - `Layout/`: App shell (Sidebar, Header).
    - `Common/`: Reusable atoms (Button, Input, Card).
    - `Tools/`: Tool-specific views (consumes Services).
- **Constraints**:
    - **Logic-Lite**: Delegate complex logic to Services or Hooks.
    - **Theming**: Use Tailwind utility classes exclusively.

### 3.3 `src/types/` (Data Contracts)
- **Responsibility**: Shared TypeScript interfaces and types.
- **Constraints**: Single source of truth for data structures.

---

## 4. Data Contracts

### 4.1 Tool Interface
Every tool MUST implement this interface to be registered.

```typescript
interface Tool {
  id: string;                    // Unique ID (e.g., "base64")
  name: string;                  // Display name
  category: ToolCategory;        // "encoding" | "validation" | ...
  description: string;           // Short description
  icon: string;                  // Icon identifier
  service: ToolService;          // The implementation
}
```

### 4.2 Tool Service Interface
The contract for the business logic.

```typescript
interface ToolService<TInput = string, TOutput = string> {
  execute(input: TInput, options?: ToolOptions): Promise<ToolResult<TOutput>>;
  validate?(input: TInput, options?: ToolOptions): ValidationResult;
  getDefaultOptions?(): ToolOptions;
}
```

### 4.3 Tool Result
Standardized output format.

```typescript
interface ToolResult<T = string> {
  success: boolean;
  output?: T;
  error?: string;           // User-facing error message
  executionTime?: number;   // ms
  metadata?: Record<string, any>;
}
```

---

## 5. Coding Conventions

### 5.1 TypeScript
- **Strict Mode**: Enabled (`strict: true`).
- **No Any**: Explicitly define types. Use `unknown` if necessary and narrow.
- **Interfaces vs Types**: Use `interface` for public contracts/objects, `type` for unions/primitives.

### 5.2 Testing (TDD)
- **Mandatory**: Write tests **before** implementation.
- **Hierarchy**:
    1.  **Contract Tests** (`tests/contract/`): Define behavior specs.
    2.  **Unit Tests** (`tests/unit/`): Test service logic in isolation.
    3.  **Component Tests** (`tests/components/`): Test UI rendering/interaction.
    4.  **E2E Tests** (`tests/e2e/`): Verify critical user flows.

### 5.3 Styling
- **Tailwind CSS**: Use utility classes. Avoid custom CSS files unless absolutely necessary.
- **Dark Mode**: Use `dark:` modifier for all color-related classes.
- **Responsive**: Mobile-first approach (default = mobile, `md:` = desktop).

---

## 6. Operational Workflows

### 6.1 Adding a New Tool
Follow this strict sequence to maintain quality and consistency:

1.  **Define Contract**: Create `tests/contract/[tool]-contract.test.ts`.
2.  **Implement Service**: Create `src/services/[tool].ts` implementing `ToolService`.
3.  **Verify Service**: Run contract/unit tests until green.
4.  **Create Component**: Create `src/components/Tools/[ToolName].tsx`.
5.  **Register**: Add to `src/services/ToolRegistry.ts`.
6.  **E2E Test**: Add a basic flow test in `tests/e2e/`.

### 6.2 Git Workflow
1.  **Branch**: `feature/[tool-name]` or `fix/[issue]`.
2.  **Commit**: Conventional Commits (e.g., `feat: add base64 tool`, `fix: json validation`).
3.  **PR**: Must pass all CI checks (Lint, Test, Build).

### 6.3 Verification
Before submitting changes, run:
```bash
npm run type-check  # Verify types
npm run lint        # Check style
npm test            # Run unit/contract tests
npm run test:e2e    # Run E2E tests
```

---

## 7. Directory Structure Reference

```
src/
├── components/     # React Components
│   ├── Common/     # Reusable UI (Button, Input)
│   ├── Layout/     # App Shell (Sidebar, Header)
│   └── Tools/      # Tool-specific Views
├── services/       # Business Logic (Pure TS)
├── hooks/          # React Hooks
├── context/        # Global State
├── types/          # TypeScript Interfaces
└── utils/          # Shared Utilities
tests/
├── contract/       # API Contracts (The "Spec")
├── unit/           # Service Unit Tests
├── components/     # React Component Tests
└── e2e/            # Playwright E2E Tests
specs/              # Feature Specifications
```
