# Feature Specification: Encoding Expansion (Base16 & Base32)

**Feature ID**: 003-encoding-expansion  
**Status**: Specification  
**Date Created**: October 29, 2025  
**Version**: 1.0

---

## 1. Overview

Expand the Online Developer Tools platform to include Base16 (hexadecimal) and Base32 encoding/decoding functionality, extending the existing encoding tool suite beyond Base64. Each encoding type follows the unified content layout (20% settings, 40% input, 40% output) and shares consistent state management patterns.

---

## 2. Feature Description

### What is being built?

Four new encoding tools:
- **Base16 Encode**: Convert text to hexadecimal representation
- **Base16 Decode**: Convert hexadecimal back to text
- **Base32 Encode**: Convert text to Base32 format (RFC 4648)
- **Base32 Decode**: Convert Base32 back to text (with format recognition)

### Why it matters

Users working with encoding/decoding tasks need a complete toolkit. Base16 (hex) is ubiquitous in cryptography, debugging, and data inspection. Base32 is used in authentication systems (TOTP, HOTP), DNS, and situations where Base64 isn't suitable.

### In scope

- Base16 encoding/decoding (hex format only, case-insensitive input, lowercase output default)
- Base32 encoding/decoding (RFC 4648 standard)
- Unified 20/40/40 content layout for all tools
- Auto-update toggle (ON by default)
- Input encoding selection (UTF-8, ASCII, Latin-1)
- State reset on tool switching
- Sidebar navigation with new tools
- Production build success

### Out of scope

- Base32hex variant (RFC 4648 Section 7)
- Crockford Base32
- Extended Base16 options (case preference persistence)
- Compression before encoding
- Direct file encoding (text only)

---

## 3. User Scenarios & Testing

### Scenario 1: Hex Debugging
**Actor**: Software developer debugging binary data  
**Flow**:
1. User selects "Base16 Encode" tool
2. Pastes binary string or special characters
3. Auto-update immediately shows hex representation
4. Copies hex result for debugging logs
5. Switches to "Base16 Decode" (input/output reset)
6. Pastes hex string from log file
7. Sees decoded text

**Success**: Hex conversion accurate, state clears on tool switch

### Scenario 2: TOTP Setup
**Actor**: System administrator setting up 2FA  
**Flow**:
1. User selects "Base32 Encode"
2. Enters secret key (UTF-8 text)
3. Sees Base32 encoded result
4. Copies for TOTP provisioning
5. Later switches to "Base32 Decode"
6. Pastes Base32 string from backup
7. Sees original secret recovered

**Success**: Base32 encoding reversible, correct RFC 4648 format

### Scenario 3: Layout Consistency
**Actor**: Any user using the platform  
**Flow**:
1. Views Base16 Encode tool (layout: 20% settings, 40% input, 40% output)
2. Switches to Base32 Encode (same layout proportions)
3. Switches to Base64 Encode (same layout proportions - backwards compatible)
4. All three tools show identical layout structure

**Success**: 3-column layout consistent across all encoding tools, columns properly sized

### Scenario 4: Settings Panel
**Actor**: User needing specific output format  
**Flow**:
1. Opens Base16 Encode
2. Settings panel (20% width) shows:
   - Auto-Update toggle (ON)
   - Input Encoding dropdown (UTF-8 default)
3. Changes Input Encoding to Latin-1
4. Input auto-updates to show hex of Latin-1 bytes
5. Switches to Base32 Encode
6. Settings reset to defaults (UTF-8)

**Success**: Settings isolated per tool, defaults reset on tool switch

---

## 4. Functional Requirements

### 4.1 Base16 Service Layer

**FR-B16-01**: Base16 Encoding Service
- Input: string (any UTF-8/ASCII/Latin-1 text)
- Process: Convert text bytes to hexadecimal representation
- Output: lowercase hex string (e.g., "Hello" → "48656c6c6f")
- Encoding support: UTF-8 (default), ASCII, Latin-1
- Error handling: Invalid encoding raises user-friendly error

**FR-B16-02**: Base16 Decoding Service
- Input: hex string (case-insensitive, spaces/newlines allowed)
- Process: Convert hex pairs to bytes, then to text
- Output: decoded text
- Format tolerance: Accept "48 65 6c 6c 6f" or "48656c6c6f" or "48\n65\n6c\n6c\n6f"
- Error handling: Invalid hex characters raise specific error

**FR-B16-03**: Base16 Character Validation
- Accept: 0-9, A-F, a-f, whitespace (ignored)
- Reject: Non-hex characters with clear error message
- Odd number of hex digits: Error "Hex string must have even number of characters"

### 4.2 Base32 Service Layer

**FR-B32-01**: Base32 Encoding Service
- Input: string (UTF-8/ASCII/Latin-1 text)
- Standard: RFC 4648 (alphabet: A-Z, 2-7, padding with =)
- Process: Convert text to Base32 using standard alphabet
- Output: Base32 string with padding (e.g., "Hello" → "JBSWY3DPEBLW64TMMQ======")
- Encoding support: UTF-8 (default), ASCII, Latin-1

**FR-B32-02**: Base32 Decoding Service
- Input: Base32 string (case-insensitive, whitespace allowed)
- Standard: RFC 4648 (recognizes A-Z, 2-7, padding)
- Process: Convert Base32 to bytes, then to text
- Output: decoded text
- Format tolerance: Accept with/without padding, with newlines
- Error handling: Invalid Base32 characters raise specific error

**FR-B32-03**: Base32 Character Validation
- Accept: A-Z, a-z, 2-7, = (padding), whitespace (ignored)
- Reject: Non-Base32 characters with clear error message
- Padding validation: Only = characters at end, correct count

### 4.3 Tool Components

**FR-COMP-01**: Base16EncodeTool Component
- Follows Base64EncodeTool pattern
- Header title: "Base16 Encode" (displays in app header)
- Header description: "Convert text to hexadecimal encoding"
- Uses 3-column layout: 20% settings, 40% input, 40% output
- Settings include: Auto-Update toggle, Input Encoding dropdown
- On mount: Sets header title/description via ToolContext
- On unmount: Clears header state

**FR-COMP-02**: Base16DecodeTool Component
- Similar to Base16EncodeTool
- Header title: "Base16 Decode"
- Header description: "Convert hexadecimal to text"
- Format tolerance: Handles various hex input formats
- On mount/unmount: Header state management

**FR-COMP-03**: Base32EncodeTool Component
- Similar pattern to Base16
- Header title: "Base32 Encode"
- Header description: "Convert text to Base32 encoding"
- Encoding support: UTF-8, ASCII, Latin-1
- On mount/unmount: Header state management

**FR-COMP-04**: Base32DecodeTool Component
- Similar pattern to Base32EncodeTool
- Header title: "Base32 Decode"
- Header description: "Convert Base32 to text"
- Format recognition: Auto-handles RFC 4648 format
- On mount/unmount: Header state management

### 4.4 State Management

**FR-STATE-01**: Tool Switching State Reset
- When user switches from Tool A to Tool B:
  - Input field cleared
  - Output field cleared
  - Auto-update state remains (shared context)
  - Settings reset to defaults (UTF-8 encoding)
  - Header title/description updated immediately

**FR-STATE-02**: Auto-Update Consistency
- Auto-Update state persists across tool switches
- Default: ON for all encoding tools
- User toggle affects all tools uniformly
- 200ms debounce applied per tool

**FR-STATE-03**: ToolContext Integration
- `headerTitle` updated per tool
- `headerDescription` updated per tool
- Input/output persisted per tool in ToolContext
- Options (encoding, format) stored per tool

### 4.5 Layout & Responsiveness

**FR-LAYOUT-01**: Content Area Proportions
- Settings column: 20% width (min 200px on desktop)
- Input column: 40% width
- Output column: 40% width
- All columns: Full height, min-h-0, overflow-y-auto
- Applied to: Base16Encode, Base16Decode, Base32Encode, Base32Decode, Base64Encode, Base64Decode

**FR-LAYOUT-02**: Full-Height Behavior
- Each column grows/shrinks to fill available space
- Grid gap: 16px (consistent with existing tools)
- Padding: 16px (consistent with existing tools)
- No horizontal scroll on 1024px+ screens
- Mobile (< 768px): Stack vertically or show 2-column view

**FR-LAYOUT-03**: Settings Panel Consistency
- Width: 20% (200-280px typical)
- Contents:
  - Auto-Update toggle at top
  - Input Encoding dropdown below
  - Info/help text at bottom
- Scrollable if content exceeds height

### 4.6 Navigation & Registration

**FR-NAV-01**: Sidebar Tool Registration
- Register 4 new tools: base16-encode, base16-decode, base32-encode, base32-decode
- Priority ordering:
  - base64-encode: 1
  - base64-decode: 2
  - base16-encode: 3
  - base16-decode: 4
  - base32-encode: 5
  - base32-decode: 6
- Icons: 🔤 (same as Base64 tools)
- Category: "Encoding" (or same as Base64)

**FR-NAV-02**: App Router Updates
- Add cases for new tool IDs in App.tsx renderTool()
- Route base16-encode → Base16EncodeTool component
- Route base16-decode → Base16DecodeTool component
- Route base32-encode → Base32EncodeTool component
- Route base32-decode → Base32DecodeTool component

---

## 5. Success Criteria

### Functional Success
- ✅ All 8 encoding/decoding functions work correctly (Base64, Base16×2, Base32×2)
- ✅ Hex encoding produces lowercase output, accepts case-insensitive input
- ✅ Base32 follows RFC 4648 standard with correct padding
- ✅ Input/output cleared when switching tools
- ✅ Auto-update works consistently across all 6 tools

### Layout Success
- ✅ Content area shows 20/40/40 proportions on all tools
- ✅ All columns fill available height (no white space gaps)
- ✅ Scrolling works within individual columns if content overflows
- ✅ Layout consistent at 1024px, 1440px, 1920px breakpoints
- ✅ Mobile layout readable at 375px width

### Integration Success
- ✅ Sidebar shows 6 encoding tools total (Base64×2, Base16×2, Base32×2)
- ✅ Navigation switches tools without errors
- ✅ TypeScript compilation: 0 errors
- ✅ Production build succeeds
- ✅ Tests pass: 106+ tests green

### User Experience Success
- ✅ Tool switching feels instant (no lag)
- ✅ Settings clearly visible and accessible
- ✅ Error messages are specific and actionable
- ✅ Copy button works on all outputs
- ✅ Share functionality includes new tools

---

## 6. Key Entities & Data Models

### Base16Service
- **Properties**: id, name, description, icon
- **Methods**: execute(), validate(), getDefaultOptions()
- **Shared Methods**: encodeToUTF8(), decodeFromUTF8(), encodeToASCII(), encodeToLatin1()
- **Input**: { input: string, options: { inputEncoding: string } }
- **Output**: ToolResult<string>

### Base32Service
- **Properties**: id, name, description, icon
- **Methods**: execute(), validate(), getDefaultOptions()
- **Input**: { input: string, options: { inputEncoding: string } }
- **Output**: ToolResult<string>

### Tool Registration
```typescript
interface EncodingTool {
  id: string // "base16-encode", "base32-decode", etc.
  name: string
  description: string
  icon: string // "🔤"
  service: EncodingService
  priority: number // 1-6
  category: string // "Encoding"
}
```

---

## 7. Assumptions

1. **Encoding defaults**: UTF-8 is the primary encoding; ASCII and Latin-1 are fallbacks
2. **Output format**: Hex is lowercase by default (follows common convention); Base32 is uppercase
3. **Error tolerance**: Input format flexibility (whitespace allowed) is more important than strict validation
4. **Layout scaling**: 20/40/40 proportions work on desktop (1024px+); mobile uses alternative layout
5. **State persistence**: Input/output NOT persisted in localStorage (cleared per session, reset per tool switch)
6. **Service inheritance**: Base16/Base32 services follow the same abstract pattern as Base64 services
7. **Icon consistency**: All encoding tools use 🔤 emoji (same as Base64)
8. **Testing baseline**: Existing 106 tests pass; new services add 20-30 new tests

---

## 8. Dependencies & Constraints

### Technical Dependencies
- Existing Base64Service abstract class (extends/follows same pattern)
- ToolContext for state management
- useTool hook for execution and auto-update
- ToolRegistry for tool registration
- Existing UI components (InputField, OutputField, ToolOptions, CopyButton, ShareButton)

### Constraints
- Must maintain backward compatibility with Base64 tools
- Cannot modify core ToolContext API
- Layout changes must apply to ALL encoding tools (including existing Base64)
- Cannot change existing TypeScript compilation model
- Build time must remain under 1.5s (currently ~992ms)
- Bundle size increase target: < 5KB gzipped

### Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

---

## 9. Risk Assessment

### Low Risk
- Adding new services (existing pattern proven with Base64)
- Adding new tool components (existing pattern proven)
- Layout proportions (CSS Grid, well-tested technique)

### Medium Risk
- State reset on tool switch (must test edge cases like rapid switching)
- RFC 4648 Base32 compliance (must validate against test vectors)
- Layout consistency across 6 tools (more complex than 2 tools)

### Mitigation
- Use contract tests for service correctness (existing pattern)
- Add test vectors from RFC 4648 spec
- Manual layout testing at 3 breakpoints
- Automated screenshot comparison for layout regression

---

## 10. Timeline & Scope

**Estimated Duration**: 2-3 hours (parallel to existing base64 pattern)

**Phases**:
1. **Service Layer** (30 min): Abstract base class, Base16/Base32 services
2. **Components** (40 min): 4 new tool components with unified layout
3. **Integration** (30 min): Router updates, tool registration, ToolContext
4. **Testing** (30 min): Contract tests, layout tests, manual verification
5. **Polish** (20 min): Build verification, TypeScript check, final testing

---

## 11. Success Definition

Feature is complete when:
- ✅ All 4 new tools functional and tested
- ✅ 20/40/40 layout applied to all 6 encoding tools
- ✅ Tool switching resets state correctly
- ✅ Production build succeeds (< 1.5s)
- ✅ TypeScript: 0 errors
- ✅ Tests: 130+ passing
- ✅ No layout regressions
- ✅ User can encode/decode all 4 formats seamlessly

---

## 12. Open Questions

None at this time - feature scope is well-defined with reasonable defaults documented in Assumptions section.
