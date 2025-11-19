# Online ToolBox Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-03

## Active Technologies

- TypeScript 5.9.3 (strict mode) | React 18.2 + Tailwind CSS 3.4, Jest 30+, Vite 5.4.21
- Encoding: Base64 (RFC 4648) | Base16/Base32 | HTML Entities | URL Percent (RFC 3986)
- All encoding uses native JavaScript (no external libraries)

## Project Structure

```text
frontend/
├── src/
│   ├── components/Tools/     # Tool components (HTML/URL Encode/Decode)
│   ├── services/             # Encoding services (html-encoder, url-encoder)
│   ├── tools/                # Tool registration and sidebar groups
│   └── hooks/                # Sidebar state management
└── tests/
    └── contract/             # Contract tests (TDD approach)
```

## Commands

npm test; npm run lint; npm run build

## Code Style

TypeScript 5.9.3 (strict mode): Follow standard conventions with test-first development (TDD)

## Recent Changes

- 003-encoding-expansion: Added Base16 and Base32 encoding tools
- 005-ui-bugs-format-tools: Added JSON Validator and JSON Minifier tools
- 006-html-url-encoding: Added HTML and URL encoding/decoding tools ✅ COMPLETE (2025-11-03)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
