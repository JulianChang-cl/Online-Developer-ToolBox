# Feature Specification: UI Layout Refinement & Shareable Links

**Feature Branch**: `004-ui-layout-sharing`  
**Created**: October 30, 2025  
**Status**: Draft  
**Input**: User description: "Refine UI/UX of sidebar with grouped encoding tools, update content area layout to 20/40/40, and implement shareable link functionality with URL parameters"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organized Sidebar Navigation (Priority: P1)

Users want a clear, organized sidebar that groups related encoding tools together, making it easier to find and switch between similar tools without visual clutter from icons.

**Why this priority**: Core navigation directly impacts user experience and tool discoverability. Users will interact with the sidebar on every tool switch. Clear organization improves navigation efficiency and reduces cognitive load.

**Independent Test**: Can be fully tested by verifying sidebar structure displays grouped categories (e.g., "Encoding" category with Base64, Base16, Base32 subgroups), each group has expandable/collapsible sections, icons are removed, and users can expand/collapse groups independently.

**Acceptance Scenarios**:

1. **Given** user views the sidebar, **When** page loads, **Then** sidebar displays "Encoding" category header with all encoding method subgroups collapsed
2. **Given** sidebar shows "Encoding" category, **When** user clicks Base64 group, **Then** Base64 Encode and Decode items expand and become clickable
3. **Given** Base64 group is expanded, **When** user clicks Base16 group, **Then** Base16 expands while Base64 remains expanded (multi-open groups allowed)
4. **Given** sidebar is displayed, **When** user inspects items, **Then** no icon images are visible (clean text-only list)
5. **Given** user hovers over collapsed group, **When** hovering, **Then** visual indicator (e.g., chevron rotation) shows group is collapsible

---

### User Story 2 - Consistent Content Area Layout (Priority: P1)

Users need consistent layout across all encoding tools (Base64, Base16, Base32) with a predictable 20/40/40 three-column structure (Settings panel, Input area, Output area), allowing them to work efficiently across different tools without relearning the layout.

**Why this priority**: Consistency is critical for user experience. Base16 and Base32 already use 20/40/40 layout; Base64 must match to create a unified interface. Users switching between tools should find the same layout structure.

**Independent Test**: Can be fully tested by measuring column widths on Base64 Encode, Base64 Decode, Base16 Encode, Base16 Decode, Base32 Encode, and Base32 Decode pages at standard viewport widths (1024px, 1440px, 1920px), verifying Settings column is approximately 20% width, Input and Output columns are each approximately 40% width, and layout remains consistent across tools.

**Acceptance Scenarios**:

1. **Given** user opens Base64 Encode tool, **When** page loads at 1440px viewport, **Then** three columns are visible with Settings ~20%, Input ~40%, Output ~40%
2. **Given** user switches from Base64 to Base16 Encode, **When** new tool loads, **Then** column layout matches Base64 (20/40/40 proportions)
3. **Given** user resizes browser to 1024px viewport, **When** layout reflows, **Then** three columns remain visible at same proportions without horizontal scrolling
4. **Given** Settings panel content exceeds column height, **When** viewing, **Then** Settings panel scrolls independently while Input/Output remain visible
5. **Given** Input area has long text, **When** viewing, **Then** Input column scrolls independently without affecting Settings or Output columns

---

### User Story 3 - Shareable Links with URL Parameters (Priority: P1)

Users want to easily share current encoding work with others by copying a link that preserves their input and settings, enabling quick sharing and collaboration without manual re-entry of parameters.

**Why this priority**: Sharing is critical for workflow efficiency and tool usefulness. Users often need to share encoding results with colleagues/collaborators. URL parameters enable instant reproduction of work.

**Independent Test**: Can be fully tested by (1) entering input text and settings in an encoding tool, (2) clicking Share button/menu, (3) copying the generated URL, (4) pasting URL into browser, (5) verifying input field is pre-populated with original input and settings match the shared configuration.

**Acceptance Scenarios**:

1. **Given** user enters "Hello" in Base64 Encode input, **When** user clicks Share button, **Then** a menu/dropdown appears showing URL with encoded input parameters
2. **Given** Share menu displays URL like "{domain}/base64_encode.html?input=SGVsbG8=&input_type=utf-8", **When** user copies URL and opens in new tab, **Then** Base64 Encode tool loads with input field pre-filled with "Hello"
3. **Given** user sets input encoding to "Latin-1" and clicks Share, **When** URL is generated, **Then** URL includes "input_encoding=latin-1" parameter
4. **Given** Base32 Encode tool has input "test" with padding OFF, **When** user clicks Share, **Then** URL includes both input and tool-specific settings like "padding=false"
5. **Given** user shares URL with another user who opens it, **When** page loads, **Then** all settings match the original user's configuration and input is pre-populated

---

### Edge Cases

- What happens when user shares URL with very long input text (1000+ characters)? URL should remain valid and input should load completely.
- How does system handle special characters in input (emoji, Unicode)? URL encoding should handle all UTF-8 characters correctly.
- What if user opens shared URL with outdated or missing parameters? Tool should load with default settings for any missing parameters.
- What if user has 3+ groups expanded simultaneously? Sidebar should accommodate multiple expanded groups without collapsing; scrolling may be required in sidebar if space is constrained.
- How does Share button dropdown behave if URL is extremely long? Dropdown should display full URL with horizontal scrolling or text wrapping; copy icon should work regardless.

## Requirements *(mandatory)*

### Functional Requirements

**Sidebar Organization**:

- **FR-001**: Sidebar MUST display an "Encoding" category header that groups all encoding tools
- **FR-002**: Each encoding method (Base64, Base16, Base32) MUST be represented as an expandable group/menu item
- **FR-003**: Each group MUST contain two items: "Encode" and "Decode" sub-items
- **FR-004**: Groups MUST be collapsible/expandable with visual indication (chevron icon or similar)
- **FR-005**: Multiple encoding groups MAY be expanded simultaneously (no accordion constraint); users can have Base64, Base16, and Base32 all open at once
- **FR-006**: Sidebar items MUST NOT display emoji/image icons; text labels only
- **FR-007**: Clicking an encoding/decoding item MUST load the corresponding tool

**Content Area Layout**:

- **FR-008**: Base64 Encode tool MUST use 20/40/40 three-column layout matching Base16 and Base32 tools
- **FR-009**: Base64 Decode tool MUST use 20/40/40 three-column layout matching Base16 and Base32 tools
- **FR-010**: All encoding tools MUST maintain consistent column proportions (Settings column 20%, Input/Output columns 40% each)
- **FR-011**: Columns MUST remain visible at all viewport widths from 1024px and above without horizontal scrolling
- **FR-012**: Each column MUST be 100% height of content area with independent vertical scrolling if content exceeds available height
- **FR-013**: Desktop-only support; minimum viewport width 1024px; mobile/tablet optimization out of scope

**Shareable Links**:

- **FR-013**: Share button MUST be accessible from every encoding tool page as a separate button (not menu item)
- **FR-014**: Share button click MUST open a dropdown/modal displaying the shareable URL in text format
- **FR-015**: Share dropdown MUST display a small copy icon next to the URL text for clipboard copying
- **FR-016**: Share action MUST generate a URL in format: `{domain}/{tool_name}.html?input={encoded_input}&input_encoding={encoding}&[tool_specific_params]`
- **FR-017**: URL parameters MUST include current input text (URL-encoded); output field MUST NOT be included in URL
- **FR-018**: URL parameters MUST include input encoding setting (utf-8, ascii, or latin-1)
- **FR-019**: URL parameters MUST include tool-specific settings where applicable (e.g., padding=true/false for Base32)
- **FR-020**: When user opens shared URL, tool MUST pre-populate input field from URL parameter and re-compute output
- **FR-021**: When user opens shared URL, all settings MUST be restored from URL parameters
- **FR-022**: If URL parameters are missing or invalid, tool MUST load with default settings for those parameters

### Key Entities

- **Tool**: Represents an encoding/decoding utility (Base64 Encode, Base16 Decode, etc.) with unique identifier, display name, and current input/settings state
- **ToolGroup**: Represents a grouping of related tools (Base64 group contains Encode and Decode variants) with expandable state
- **ShareLink**: Generated URL containing tool identifier and current configuration (input, encoding, format options) as query parameters
- **ToolSettings**: User configuration for a tool (input encoding, padding toggle, auto-update flag) that can be serialized to URL parameters

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate between all 6 encoding tools using sidebar groups in under 3 clicks (expand group + click tool)
- **SC-002**: Content area maintains consistent 20/40/40 column layout across all 6 encoding tools and all viewport widths from 1024px to 2560px
- **SC-003**: Users can copy and share a link and open it in a new browser window with input/settings fully restored within 5 seconds
- **SC-004**: Sidebar without icons takes up less than 20% of screen width at 1440px viewport (improved from previous design)
- **SC-005**: 95% of generated share URLs successfully pre-populate the tool when opened in a new session (compatibility across tools/settings)
- **SC-006**: Users can switch between encoding tools without re-learning layout (consistency metric: same 3-column structure on all tools)

---

## Assumptions

1. **URL Parameter Encoding**: Assume URL encoding (UTF-8 with percent-encoding) is suitable for sharing; no need for custom encoding schemes
2. **Sidebar Behavior - CLARIFIED**: Multi-open groups allowed; users can expand multiple encoding groups (Base64, Base16, Base32) simultaneously without auto-closing
3. **Icon Removal**: Assume emoji icons in sidebar are removed entirely; no fallback icons needed
4. **Base64 Layout**: Assume Base64 tools are currently not using 20/40/40 layout; alignment is needed to match Base16/Base32
5. **URL Format**: Assume HTML file naming convention follows pattern `{tool_name}.html` (e.g., `base64_encode.html`, `base32_decode.html`)
6. **Parameter Validation**: Assume missing or invalid URL parameters default to tool's standard defaults without error messages
7. **Desktop-Only Scope**: Application targets desktop users only; viewport minimum 1024px; mobile/tablet optimizations out of scope
8. **Column Height**: All three columns (Settings, Input, Output) default to 100% height of content area with independent vertical scrolling

---

## Clarifications

### Session 2025-10-30

- Q1: Sidebar Group Behavior → A: Multi-open groups allowed (users can expand Base64, Base16, Base32 simultaneously)
- Q2: URL Parameter Handling → B: Input only in URL; output re-computed when page loads (keeps URLs shorter and future-proof)
- Q3: Share Menu UI Component → A (custom): Separate Share button with dropdown showing URL text and small copy icon
- Q4: Base64 Layout Migration → A: Preserve Current State (migrate layout while maintaining existing Base64 functionality)
- Q5: Viewport Breakpoint → Custom: Desktop-only application; columns default to 100% height; minimum viewport 1024px

