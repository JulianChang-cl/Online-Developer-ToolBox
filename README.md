# 🛠️ Online Tools Platform

A modern, responsive web application providing essential developer tools including Base64 encoding/decoding, JSON validation, encryption utilities, and more.

## ✨ Features

### Core Tools
- 🔄 **Base64 Encode/Decode** - Convert text to/from Base64 with RFC 4648 and URL-safe variants
- 🔢 **Base16 (Hex) Encode/Decode** - Convert text to/from hexadecimal encoding
- 🔣 **Base32 Encode/Decode** - Convert text to/from Base32 with optional padding
- ✅ **JSON Validator** - Validate and format JSON with syntax error reporting
- 🔐 **Encryption Tools** - Caesar cipher, ROT13, URL encoding
- 🖼️ **SVG Viewer** - View, zoom, and export SVG files with background toggle (Grid/White/Black) for optimal visibility

### UI Features
- 📁 **Collapsible Sidebar** - Organized tool navigation with expandable categories
- 🔗 **Shareable Links** - Share tool configurations via URL parameters
- 🌓 **Dark Mode** - Seamless light/dark theme with persistence
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- ♿ **Accessible** - WCAG 2.1 Level AA compliant
- ⚡ **Fast** - Sub-50ms interactions, instant feedback
- 🔒 **Private** - All processing happens locally, no data transmission

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or 20+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "Online ToolBox"

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

## 📦 Available Scripts

### Development

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Testing

```bash
npm test             # Run unit tests with Jest
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run end-to-end tests with Playwright
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 🏗️ Project Structure

```
Online ToolBox/
├── src/
│   ├── components/       # React components
│   │   ├── Layout/      # Header, Sidebar, ThemeToggle
│   │   ├── Common/      # Reusable UI components
│   │   └── Tools/       # Tool-specific components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Tool service implementations
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── context/         # React Context providers
│   └── styles/          # Global styles and Tailwind config
├── tests/
│   ├── unit/            # Unit tests
│   ├── components/      # Component tests
│   ├── contract/        # Contract tests
│   └── e2e/             # End-to-end tests
├── public/              # Static assets
└── specs/               # Feature specifications and documentation

```

## 🧪 Testing Strategy

This project follows **Test-Driven Development (TDD)** with comprehensive coverage:

- **Contract Tests**: Define tool behavior and performance requirements
- **Unit Tests**: Test services and utilities in isolation (95%+ coverage target)
- **Component Tests**: Test React components (85%+ coverage target)
- **Integration Tests**: Test feature interactions and data flow
- **E2E Tests**: Test complete user workflows across browsers

**Test Suite Stats** (424 tests total):
- ✅ Unit tests: 56 tests (services, utilities)
- ✅ Component tests: 52 tests (UI components)
- ✅ Contract tests: 175 tests (tool behavior)
- ✅ Integration tests: 141 tests (feature interactions, performance, edge cases)

**Performance Budgets**:
- Sidebar toggle: <50ms (actual: ~0.7ms ⚡)
- URL generation: <100ms (actual: ~0.03ms ⚡)
- Component render: <200ms (actual: ~1.9ms ⚡)
- Settings toggle: <50ms (actual: ~0.3ms ⚡)

**Coverage Targets**:
- Services: 95%+
- Utils: 90%+
- Components: 85%+
- Overall: 80%+

## 🎨 Tech Stack

- **Framework**: React 18.2+
- **Build Tool**: Vite 5.2+
- **Language**: TypeScript 5.2+
- **Styling**: Tailwind CSS 3.x
- **Testing**: Jest + React Testing Library + Playwright
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## 🌓 Dark Mode

Toggle between light and dark themes:
- Click the theme toggle button in the header
- Theme preference is saved to localStorage
- Respects system preference on first visit
- Instant switching with no flicker

## ♿ Accessibility

All components meet WCAG 2.1 Level AA standards:
- Keyboard navigation support
- Screen reader compatible
- Proper ARIA labels
- Focus indicators
- Color contrast compliance

## 🔒 Privacy

- **100% Client-Side**: All processing happens in your browser
- **No Data Transmission**: Nothing is sent to external servers
- **No Analytics**: No tracking or data collection
- **Offline Capable**: Works without internet connection

## 📝 Development Guidelines

### Constitution Principles

This project follows strict development standards:

1. **Code Quality Excellence** - Modular, self-documenting code
2. **Testing Standards** - TDD mandatory, tests before implementation
3. **User Experience Consistency** - Uniform patterns across all tools
4. **Performance Requirements** - <100ms operations, <2s load time

### Adding a New Tool

1. Define tool contract in `specs/001-web-tools-platform/CONTRACTS.md`
2. Write contract tests in `tests/contract/`
3. Implement service in `src/services/`
4. Create React component in `src/components/Tools/`
5. Register tool in `src/services/ToolRegistry.ts`
6. Add to sidebar navigation

See `specs/001-web-tools-platform/ADDING_TOOLS.md` for detailed guide.

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow the existing code style and testing patterns
3. Ensure all tests pass: `npm test`
4. Ensure code quality: `npm run lint && npm run format:check`
5. Build successfully: `npm run build`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for developer tools.

---

**Version**: 0.0.1 (MVP in development)  
**Status**: Phase 1 Setup Complete ✅
