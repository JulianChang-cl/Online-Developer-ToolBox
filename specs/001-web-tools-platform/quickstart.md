# Quickstart: Online Tools Platform Development

**Last Updated**: 2025-10-28  
**Feature**: `001-web-tools-platform`

## Overview

This guide gets you from zero to development in 15 minutes. It covers setup,
running the project, and the development workflow.

## Prerequisites

- Node.js 18+ (verify with `node --version`)
- npm 9+ (verify with `npm --version`) or yarn/pnpm
- Git installed and configured
- Code editor (VS Code recommended)
- Modern browser (Chrome, Firefox, Safari, or Edge)

## Initial Setup (5 minutes)

### 1. Clone Repository

```bash
git clone <repository-url>
cd online-tools
```

### 2. Create Feature Branch

```bash
git checkout -b 001-web-tools-platform
```

### 3. Install Dependencies

```bash
npm install
# or: yarn install / pnpm install
```

**What gets installed**:
- React 18, React DOM
- TypeScript, Vite (build tool)
- Tailwind CSS, PostCSS
- Jest, React Testing Library, Playwright
- ESLint, Prettier

**Typical install time**: 2-3 minutes

### 4. Verify Installation

```bash
npm run build
npm test -- --listTests

# Expected output:
# ✓ Build succeeds
# ✓ Test files found (after you create them)
```

## Running the Project (2 minutes)

### Development Server

```bash
npm run dev
```

Opens `http://localhost:5173` (Vite default)

**What you see**: 
- Empty React app with basic layout
- Hot Module Replacement (HMR) enabled - changes auto-refresh
- Browser console ready for debugging

**Stop server**: `Ctrl+C` in terminal

### Production Build

```bash
npm run build
```

Creates optimized build in `dist/` folder

**Build output**:
- Minified JavaScript
- Tree-shaken CSS
- Sourcemaps for debugging
- ~40KB gzipped (estimated)

### Preview Production Build

```bash
npm run build
npm run preview
```

Opens `http://localhost:4173` - mimics production environment

## Code Structure

### Key Directories

```
src/
  ├── components/          # React components
  │   ├── Layout/         # App shell (Sidebar, Header, ThemeToggle)
  │   ├── Tools/          # Tool implementations (Base64Tool, etc.)
  │   └── Common/         # Shared components (InputField, CopyButton, etc.)
  ├── hooks/              # Custom React hooks (useTheme, useTool, etc.)
  ├── services/           # Tool logic (base64.ts, jsonValidator.ts, etc.)
  ├── utils/              # Helpers (storage.ts, url.ts, validation.ts)
  ├── types/              # TypeScript definitions
  ├── styles/             # Tailwind config, globals
  └── index.tsx           # Entry point

tests/
  ├── unit/               # Jest unit tests
  ├── components/         # React component tests (RTL)
  ├── contract/           # Contract/API tests
  └── e2e/                # Playwright end-to-end tests
```

### How to Add a New Tool

1. Create service: `src/services/myTool.ts`
   - Implement `ToolService` interface
   - Export execute(), validate() methods

2. Create component: `src/components/Tools/MyTool.tsx`
   - Implement tool UI using InputField, OutputField, ToolOptions
   - Use useTool() hook for state management

3. Register tool: `src/services/ToolRegistry.ts`
   - Add tool to registry in init function

4. Add to sidebar: `src/components/Layout/Sidebar.tsx`
   - Add tool name and icon to tool list

5. Write tests:
   - Contract test: `tests/contract/myTool-contract.test.ts`
   - Service test: `tests/unit/services/myTool.test.ts`
   - Component test: `tests/components/MyTool.test.tsx`

Done! Tool now appears in sidebar and is fully integrated.

## Testing

### Run All Tests

```bash
npm test
```

Watches for file changes, re-runs affected tests automatically

### Run Specific Test File

```bash
npm test -- base64.test.ts
```

### Coverage Report

```bash
npm test -- --coverage
```

Shows percentage of code covered by tests. Target: 80%+

### Contract Tests (API Verification)

```bash
npm test -- contract
```

Tests verify tool inputs/outputs match specification

### E2E Tests

```bash
npm run test:e2e
```

Runs Playwright tests in browser (slower but comprehensive)

### Test Development Workflow

**For Test-Driven Development (TDD)**:

```bash
# 1. Write test (watch mode runs it immediately, FAILS)
npm test -- myTool.test.ts

# 2. Implement just enough code to make it PASS
# (edit src/services/myTool.ts)

# 3. Watch changes automatically re-run tests

# 4. Refactor while keeping tests PASSING
```

## Code Quality

### Linting

```bash
npm run lint
npm run lint -- --fix
```

Catches style issues, unused variables, potential bugs

### Type Checking

```bash
npm run type-check
```

Strict TypeScript - no `any` types allowed without justification

### Formatting

```bash
npm run format
npm run format -- --check
```

Auto-formats code to consistent style (Prettier)

### All Checks (Pre-commit)

```bash
npm run check
```

Runs lint, type-check, and format checks together

## Git Workflow

### Before Starting Work

```bash
git pull origin main
git checkout -b 001-feature-name
```

### While Developing

```bash
# Make changes in feature branch
npm test        # Verify tests pass
npm run check   # Verify code quality

# Commit small, logical chunks
git add .
git commit -m "feat: add feature description"

# Keep branch up to date
git pull origin main (if needed)
```

### Ready to Submit PR

```bash
git push origin 001-feature-name
# Go to GitHub → Create Pull Request
```

PR will:
1. Run all tests in CI/CD
2. Run linting and type checks
3. Generate coverage report
4. Require code review before merge

## Debugging

### Browser DevTools

- **React DevTools**: Inspect component tree, state, hooks
  - Install extension: https://react.devtools
  
- **Console**: Check for errors/warnings

- **Performance**: Lighthouse tab measures page metrics

- **Network**: View asset sizes, loading times

### VS Code Debugging

**Create `.vscode/launch.json`**:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

Then: Debug → Start Debugging (F5)

### Profiling Performance

1. Open Chrome DevTools → Performance tab
2. Click record
3. Perform action you want to profile
4. Click stop
5. Analyze flame chart to identify slow functions

## Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run tests in watch mode
npm test -- --coverage  # Coverage report
npm run test:e2e        # End-to-end tests

# Code Quality
npm run lint            # Check linting issues
npm run type-check      # TypeScript strict check
npm run format          # Auto-format code
npm run check           # All quality checks at once

# Maintenance
npm outdated            # Check for outdated dependencies
npm audit               # Check for security vulnerabilities
npm audit fix           # Auto-fix vulnerable dependencies
```

## Common Issues

### "npm: command not found"

- Node.js not installed or not in PATH
- Solution: Download and install from https://nodejs.org

### Tests fail with "localStorage is not defined"

- Jest environment issue
- Solution: Already configured in jest.config.js (uses jsdom)
- If issue persists: Clear cache with `npm test -- --clearCache`

### Build fails with TypeScript errors

- Type errors blocking production build
- Solution: Fix errors per error message, or:
  ```bash
  npm run type-check  # See detailed errors
  ```

### Changes not reflected in browser

- HMR (Hot Module Replacement) not working
- Solution: 
  1. Check dev server is running: `npm run dev`
  2. Verify file is saved
  3. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Port 5173 already in use

- Another process using same port
- Solution: 
  ```bash
  npm run dev -- --port 3000
  ```

## Performance Expectations

- **Dev server start**: 2-3 seconds
- **Build time**: 15-30 seconds
- **Test run (first time)**: 30-60 seconds
- **Test run (watch mode)**: <5 seconds per file change
- **Hot reload**: <1 second
- **Page load (dev)**: <2 seconds

If performance degrades, check:
1. Dependencies installed correctly: `npm install`
2. No excessive console logging
3. Node.js version: `node --version` (should be 18+)
4. Disk space available

## Next Steps

### For First Task (T001-T010: Setup)

1. Complete initial setup (above)
2. Verify `npm run dev` works
3. Verify `npm test` works
4. Commit: `git commit -m "chore: project setup"`

### For Phase 1 Tasks (T011-T035: Foundation)

1. Create necessary directories
2. Create TypeScript interfaces in `src/types/`
3. Implement storage service
4. Create React components
5. Write tests FIRST, then implementation
6. Verify `npm run check` passes

### For Phase 2 Tasks (T036+: Core Tools)

1. Follow TDD workflow:
   - Write contract test
   - Write tests for service
   - Implement service
   - Create component
   - Create component test
2. Register in ToolRegistry
3. Add to Sidebar
4. E2E test the workflow

## Getting Help

### Documentation

- **Architecture**: See `specs/001-web-tools-platform/data-model.md`
- **Task Details**: See `specs/001-web-tools-platform/tasks.md`
- **Research**: See `specs/001-web-tools-platform/research.md`
- **Constitution**: See `.specify/memory/constitution.md` for principles

### Git History

```bash
git log --oneline          # See commit history
git show <commit-hash>     # See changes in specific commit
git diff                   # See unstaged changes
git diff --staged          # See staged changes
```

### Team Communication

- **Issues**: Use GitHub Issues for bugs/questions
- **PRs**: Use PR descriptions to explain changes
- **Discussions**: Use GitHub Discussions for architecture decisions

## IDE Setup (VS Code)

### Recommended Extensions

1. **ES7+ React/Redux/React-Native snippets**
   - ID: `dsznajder.es7-react-js-snippets`

2. **TypeScript Vue Plugin** (if using TypeScript)
   - Built-in to latest VS Code

3. **Tailwind CSS IntelliSense**
   - ID: `bradlc.vscode-tailwindcss`
   - Auto-completes Tailwind classes

4. **Prettier - Code formatter**
   - ID: `esbenp.prettier-vscode`
   - Auto-format on save

5. **ESLint**
   - ID: `dbaeumer.vscode-eslint`
   - Shows linting issues inline

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Framework: Vite (auto-detected)
5. Deploy!

### Deploy to Netlify

1. Push code to GitHub
2. Go to https://netlify.com
3. Connect GitHub account
4. Select repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Deploy!

Both services handle:
- Automatic deployments on push
- Preview URLs for PRs
- HTTPS and SSL
- Global CDN distribution

## What's Next?

You're now ready to start development!

**Next action**: 
1. Create feature branch: `git checkout -b 001-web-tools-platform`
2. Start dev server: `npm run dev`
3. Begin with Phase 1 tasks (setup)
4. Follow test-first development practices per constitution

**Questions?** Check tasks.md or research.md for more details!

