# Implementation Plan: Online Tools Platform (MVP)

**Branch**: `001-web-tools-platform` | **Date**: 2025-10-28 | **Spec**: `specs/001-web-tools-platform/spec.md`

**Input**: Feature specification from `/specs/001-web-tools-platform/spec.md`

## Summary

Build a responsive web application that provides a collection of developer tools
(Base64 encode/decode, JSON validator, encryption utilities, and converters) with
a clean sidebar navigation, light/dark theme support, and advanced features like
auto-update, shareable links, and copy-to-clipboard functionality.

## Technical Context

**Language/Version**: JavaScript (ES6+) / TypeScript 4.9+  
**Primary Framework**: React 18.2+ with functional components and hooks  
**Styling Solution**: Tailwind CSS 3.x with dark mode support  
**Storage**: localStorage for theme preference, tool history, and shared configs  
**Testing**: Jest + React Testing Library for unit/component tests; Playwright for E2E  
**Target Platform**: Web (SPA - Single Page Application)  
**Performance Goals**: Initial load <2 seconds on 4G, tool operations <100ms p95  
**Constraints**: <200ms max response for all tool operations, <50MB initial bundle  
**Scale/Scope**: MVP with 5-7 tools, extensible architecture for future tools  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Code Quality Excellence**: Architecture uses modular tool components with clear separation of concerns. Each tool is independently testable and documented.

✅ **Testing Standards**: All tools include contract tests verifying input/output contracts. UI components have unit tests. User stories have independent E2E tests. Target: 80%+ coverage.

✅ **User Experience Consistency**: All tools follow identical interaction pattern: input field → options panel → output display. Error messages are consistent and actionable. Dark/light theme applied uniformly.

✅ **Performance Requirements**: All operations target <100ms. Initial load <2s. Bundle size carefully monitored. No N+1 operations in tool execution.

---

## UI Design Clarifications Integrated

**Source**: `specs/001-web-tools-platform/ui-design.md` (v1.0.1, clarified 2025-10-28)

5 critical design decisions locked via clarification workflow:

| Decision | Clarification | Implementation Impact |
|----------|---------------|----------------------|
| **Mobile Layout** | Flex-shrink (auto-scale) | All 3 columns visible on mobile 375px viewport, no horizontal scroll. CSS: `flex-shrink: 1` on columns. |
| **Share URL Limit** | Error + fallback | If URL >2000 chars, show error toast. Copy button remains functional. Validate URL length before copying. |
| **Clipboard Errors** | API + fallback | Try `navigator.clipboard.writeText()` first; fall back to `execCommand('copy')`. Show error toast if both fail. |
| **Settings Default** | Expanded (desktop-primary) | ToolOptions accordion expanded by default on all screen sizes. Desktop-primary design philosophy. |
| **Input Height Mobile** | Fixed 300px | Input field fixed 300px on mobile (non-resizable). Desktop is resizable 400px base. |

These clarifications directly impact:
- Phase 1: Responsive CSS strategy (flex-shrink)
- Phase 2: Component implementation (clipboard logic, Settings expanded state)
- Phase 5: Responsive testing (mobile 375px flex-shrink verification)
- Phase 9: Error handling tests (clipboard fallback, URL validation)

## Project Structure

### Documentation (this feature)

```text
specs/001-web-tools-platform/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file
├── research.md          # [TO CREATE] Technology decisions, library evaluation
├── data-model.md        # [TO CREATE] Tool architecture, data contracts
├── quickstart.md        # [TO CREATE] Development environment setup
├── contracts/           # [TO CREATE] API/tool contracts
│   ├── base64-contract.json
│   ├── json-validator-contract.json
│   ├── encryption-contract.json
│   └── ui-contract.json
└── tasks.md             # [TO CREATE] Detailed task breakdown
```

### Source Code (repository root)

```text
# Option 1: Web Application (SELECTED)

src/
├── components/          # React components
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ThemeToggle.tsx
│   ├── Tools/           # Tool-specific components
│   │   ├── Base64Tool.tsx
│   │   ├── JsonValidator.tsx
│   │   ├── EncryptionTool.tsx
│   │   └── ConverterTool.tsx
│   ├── Common/          # Shared components
│   │   ├── InputField.tsx
│   │   ├── OutputField.tsx
│   │   ├── ToolOptions.tsx
│   │   └── CopyButton.tsx
│   └── App.tsx
├── hooks/               # Custom React hooks
│   ├── useTheme.ts      # Theme management
│   ├── useTool.ts       # Tool execution state
│   └── useShareLink.ts  # Share functionality
├── services/            # Tool implementations
│   ├── base64.ts
│   ├── jsonValidator.ts
│   ├── encryption.ts
│   └── converter.ts
├── utils/               # Helper functions
│   ├── storage.ts       # localStorage management
│   ├── url.ts           # URL encoding/decoding
│   └── validation.ts    # Input validation
├── types/               # TypeScript type definitions
│   ├── Tool.ts
│   ├── Result.ts
│   └── Preferences.ts
├── styles/              # Tailwind config and globals
│   ├── globals.css
│   └── tailwind.config.js
└── index.tsx            # Entry point

tests/
├── unit/                # Unit tests
│   ├── services/
│   │   ├── base64.test.ts
│   │   ├── jsonValidator.test.ts
│   │   └── encryption.test.ts
│   └── utils/
│       └── storage.test.ts
├── components/          # Component tests
│   ├── Base64Tool.test.tsx
│   └── Sidebar.test.tsx
├── contract/            # Contract tests
│   ├── base64-contract.test.ts
│   └── json-validator-contract.test.ts
└── e2e/                 # End-to-end tests
    └── user-workflows.spec.ts

public/
├── index.html
├── favicon.ico
└── manifest.json

.github/
└── workflows/
    └── ci.yml           # CI/CD pipeline

package.json
tsconfig.json
tailwind.config.js
jest.config.js
playwright.config.js
```

**Structure Decision**: Selected Option 1 (Single Web Application) because this
is a single-page application (SPA) with one deployment target. All tools share
common infrastructure (theme, sidebar, storage). Monolithic structure is simpler
for MVP, with tool services abstracted to enable future modularization.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None at MVP | Constitution fully supported | N/A - clean architecture enables all principles |

## Phase Breakdown & Timeline

**Updated**: 2025-10-28 (UI Design Clarifications Integrated)

### Phase 0: Research & Design (Week 1)
- Evaluate CSS-in-JS vs. Tailwind vs. CSS Modules (framework choice validation)
- Document API contracts for each tool
- Create component architecture design
- Technology stack finalization
- **NEW**: Review UI design clarifications (mobile flex-shrink, clipboard fallback, etc.)

### Phase 1: Setup & Core Infrastructure (Week 1-2)
- Initialize React project (Vite recommended for speed)
- Configure Tailwind CSS with dark mode (class strategy, smooth transitions)
- Set up testing infrastructure (Jest, RTL, Playwright)
- Create project structure and base components (Layout, Header, Sidebar skeleton)
- **NEW**: Implement flex-shrink responsive strategy for mobile

### Phase 2: Foundation UI Components (Week 2)
- Implement theme system with localStorage persistence
- Create Header component with theme toggle
- Create Sidebar and tool list navigation
- Implement MainLayout wrapper combining both
- Create InputField component (resizable on desktop, fixed 300px on mobile)
- Create OutputField component (read-only display)
- Create ToolOptions accordion component (expanded by default, per clarifications)
- Create CopyButton component with **Clipboard API + fallback error handling**
- Create ShareButton component with **URL length validation** (error if >2000 chars)
- Create ActionButtons container (Copy | Share | Clear buttons)
- Create Toast/notification system for user feedback
- Create EmptyState component for first-load experience
- Set up Context API for tool selection state

### Phase 3: Core Tools - Base64 (Week 3)
- Implement Base64 encode/decode service
- Create Base64Tool component wrapper
- Wire up ToolOptions for Base64 (input encoding, output encoding, line breaks)
- Implement auto-update functionality
- Write service tests and contract tests

### Phase 4: Core Tools - JSON Validator (Week 3)
- Implement JSON validator and formatter service
- Create JsonValidator component wrapper
- Wire up ToolOptions for JSON (indentation levels, format options)
- Implement validation error reporting (line/char position)
- Write service tests and contract tests

### Phase 5: UI Polish & Responsive Design (Week 3-4)
- Test responsive layouts across all breakpoints (375px, 768px, 1440px)
- Verify mobile flex-shrink layout (no horizontal scroll)
- Implement keyboard navigation (Tab, Enter, Escape)
- Add screen reader labels and ARIA attributes (WCAG 2.1 AA)
- Dark mode comprehensive testing and refinement
- Performance profiling and bundle optimization

### Phase 6: Extended Tools (Week 4)
- Implement Encryption/Converter tools (Hex, Caesar, ROT13, URL encoding)
- Create encryption tool components and ToolOptions

### Phase 7: Advanced Features (Week 4-5)
- Implement share link generation with **URL encoding**
- Test share link with URL length handling
- Add advanced options for format selection across tools

### Phase 8: Performance & Optimization (Week 5)
- Performance profiling (initial load <2s, operations <100ms)
- Bundle size analysis and optimization
- Implement lazy loading for tools (if needed)
- Monitor memory usage

### Phase 9: Comprehensive Testing (Week 5)
- Unit tests for all services (80%+ coverage target)
- Component tests for all UI components
- E2E tests for user workflows (Base64 → JSON → Share)
- Accessibility testing (axe DevTools, screen readers)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Phase 10: Documentation (Week 5)
- Generate component Storybook (optional for MVP)
- Update README with setup/contribution guides
- Document API contracts for each tool

### Phase 11: Deployment Preparation (Week 5)
- Set up CI/CD pipeline (.github/workflows)
- Configure deployment to Vercel/Netlify
- Set up environment variables and secrets

### Phase 12: Final QA & Release (Week 5-6)
- Full regression testing
- Performance validation against success metrics
- User acceptance testing (if applicable)
- Release to production

## Key Decisions

1. **Framework**: React chosen for component reusability, ecosystem, and developer experience
2. **Styling**: Tailwind CSS chosen for rapid development and consistent dark mode
3. **State Management**: Context API sufficient for MVP; can upgrade to Redux if needed
4. **Testing**: Jest + React Testing Library for unit tests, Playwright for E2E
5. **Storage**: localStorage for persistence; no backend required for MVP
6. **Deployment**: Static hosting (Vercel, Netlify, GitHub Pages)

## Success Metrics

- ✅ All user stories independently testable and passing
- ✅ 80%+ code coverage for critical paths (services + components)
- ✅ Initial load <2 seconds on 4G (verify with Lighthouse)
- ✅ All tool operations complete in <100ms (p95)
- ✅ Dark mode toggle is instant (<50ms)
- ✅ Share links successfully encode/decode all state without truncation errors
- ✅ Mobile 375px layout: 3-column flex-shrink visible, no horizontal scroll
- ✅ Copy button: Works on modern browsers AND fallback (execCommand)
- ✅ WCAG 2.1 Level AA accessibility: Zero axe violations
- ✅ Settings accordion: Expanded by default, user can collapse
- ✅ Input field mobile: Fixed 300px, non-resizable
- ✅ Clipboard API errors: Fallback to execCommand, show error toast on complete failure

---

## Key Implementation Notes

### Mobile Strategy
- **Flex-shrink responsive**: All 3 columns (Settings, Input, Output) fit in 375px viewport
- CSS: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;` on all breakpoints
- Columns: `flex-shrink: 1; min-width: 0;` to prevent overflow
- No horizontal scroll at any breakpoint
- Verify with Playwright tests at 375px, 768px, 1440px viewports

### Clipboard Implementation
```typescript
// CopyButton logic (pseudo-code)
try {
  await navigator.clipboard.writeText(text);
  showSuccessToast("Copied to clipboard");
} catch (err) {
  // Fallback: execCommand
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showSuccessToast("Copied to clipboard");
  } catch (fallbackErr) {
    showErrorToast("Copy failed. Try manual Ctrl+C");
  }
}
```

### Share URL Validation
```typescript
// ShareButton logic (pseudo-code)
const url = generateShareUrl(toolId, input, options);
if (url.length > 2000) {
  showErrorToast("Input too large to share. Try a smaller input.");
  return;
}
// Safe to copy
navigator.clipboard.writeText(url);
showSuccessToast("Link copied to clipboard");
```

### Settings Accordion Default
- Initial state: `isExpanded: true` on ToolOptions component
- User can click header to toggle
- State NOT persisted (per clarification: desktop-primary, stateless per-session)

