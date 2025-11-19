# UI Design Specification: Online Tools Platform

**Version**: 1.0.0  
**Date**: 2025-10-28  
**Status**: Ready for Phase 2 Implementation  
**Related**: `plan.md` (Phase 2), `data-model.md` (Component Types), `CONTRACTS.md` (Component Contracts)

---

## 1. Design Philosophy

### Principles
- **Consistency**: All tools follow identical interaction pattern
- **Simplicity**: Minimal visual hierarchy, focus on tool functionality
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Responsiveness**: Seamless experience from mobile to desktop
- **Dark Mode First**: Theme system is first-class citizen, not afterthought

### User Model
The typical user is a **developer using command-line tools** who wants a quick web UI for format conversions. Expected usage patterns:
- Paste input → Get output → Copy result
- Toggle dark mode based on time of day
- Rarely save/share links (but feature available)
- **Desktop-primary**: This is designed for desktop users; mobile is occasional use case

---

## Clarifications

### Session 2025-10-28

Ambiguity scan and clarification Q&A session completed. 5 design decisions locked:

- Q1: Mobile column scaling → **B (Flex-shrink)**: Auto-scale all 3 columns to fit viewport, no horizontal scroll
- Q2: Share URL length limit → **A (Error + Fallback)**: Show error toast if URL >2000 chars, copy button remains functional
- Q3: Copy-to-clipboard errors → **A (Clipboard API + Fallback)**: Try modern Clipboard API, fall back to execCommand('copy')
- Q4: Settings accordion default → **B (Expanded)**: Expanded by default on all sizes (desktop-primary context)
- Q5: Input field height on mobile → **A (Fixed 300px)**: Fixed 300px base height on mobile (consistent with desktop)

---

## 2. Layout Architecture

### Main Layout Structure

```
┌─────────────────────────────────────────────────┐
│  Header (compact, minimal branding)             │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│   Sidebar    │  Content Area                   │
│   (collapsible                                  │
│   on mobile) │  [Tool-specific UI]             │
│              │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Sidebar | Header |
|-----------|-------|---------|--------|
| Mobile | <640px | Hamburger menu / Hidden | Full width |
| Tablet | 640px-1024px | Collapsed icon view | Full width |
| Desktop | >1024px | Full width / Collapsible | Full width |

### Component Hierarchy

```
App
├── Header
│   ├── Logo / Title
│   ├── Search / Quick Nav (optional)
│   └── ThemeToggle
│       └── Moon/Sun Icon
├── MainLayout
│   ├── Sidebar
│   │   ├── ToolList
│   │   │   └── ToolItem (multiple)
│   │   │       ├── Icon
│   │   │       └── Label
│   │   └── Settings
│   │       └── About / GitHub link
│   └── ContentArea
│       ├── ToolWrapper
│       │   ├── ToolHeader (name + description)
│       │   └── ToolPanel (3-column grid)
│       │       ├── SettingsColumn
│       │       │   └── ToolOptions (accordion)
│       │       ├── InputColumn
│       │       │   └── InputField
│       │       └── OutputColumn
│       │           ├── OutputField
│       │           └── ActionButtons (Copy, Share, Clear)
│       └── EmptyState (on first load)
└── Toast / Notifications (global)
```

---

## 3. Component Specifications

### 3.1 Header Component

**Location**: `src/components/Layout/Header.tsx`

**Props**:
```typescript
interface HeaderProps {
  title?: string;              // "Online Tools" or custom
  showSearch?: boolean;        // Default: false for MVP
  onThemeToggle?: () => void;  // Called when theme button clicked
  currentTheme: 'light' | 'dark';
}
```

**Visual Specs**:
- Height: 56px (fixed)
- Background: White (light) / Dark gray (#1F2937 dark)
- Border: Thin bottom border (gray-200 light / gray-800 dark)
- Padding: 12px 16px (mobile), 12px 24px (desktop)
- Sticky: Yes, stays at top during scroll

**Contains**:
- Left: Logo/Title text (14-16px, semibold)
- Center: Empty or search box (future)
- Right: Theme toggle button + optional menu

**Responsive**:
- Mobile: Hamburger menu for sidebar, title left-aligned
- Desktop: Full header, no menu icon (sidebar always visible)

---

### 3.2 Sidebar Component

**Location**: `src/components/Layout/Sidebar.tsx`

**Props**:
```typescript
interface SidebarProps {
  tools: Tool[];
  selectedToolId: string;
  onToolSelect: (toolId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}
```

**Visual Specs**:
- Width: 240px (expanded), 60px (collapsed), 100% (mobile)
- Background: Light gray (#F9FAFB light) / Dark gray (#111827 dark)
- Border-right: Thin border (gray-200 light / gray-800 dark)
- Padding: 16px 8px
- Scrollable: Yes, if tools list exceeds viewport

**Contains**:
1. **Tool List Section**
   - Spacing: 8px between items
   - Each tool item:
     - Icon: 24×24px
     - Label: 12px, semibold (only shown when expanded)
     - Hover state: Background highlight
     - Active state: Bold label, accent color background
   - Expandable groups (future): "Converters", "Validators", etc.

2. **Divider**: 1px gray line (8px margin top/bottom)

3. **Settings Section**
   - About link (12px, gray-600)
   - GitHub link (12px, gray-600)
   - Links: Hover underline only

**Responsive**:
- Mobile (<640px): Full-screen overlay when opened, hamburger toggle in header
- Tablet (640-1024px): Collapsed icon-only view by default
- Desktop (>1024px): Always visible, toggleable collapse

**Interaction**:
- Click tool → Update active state + load tool in content area
- Collapse button: Toggle width animation (300ms)
- Click outside (mobile): Close sidebar overlay

---

### 3.3 Tool Content Area

**Location**: `src/components/Tools/ToolWrapper.tsx` (container) + individual tool components

**Props**:
```typescript
interface ToolWrapperProps {
  tool: Tool;
  onExecute: (input: string, options: ToolOptions) => void;
  result?: ToolResult;
  isLoading?: boolean;
  error?: ToolError;
  onShare?: () => void;
}
```

**Layout**: Three-column horizontal layout on desktop, stacked on mobile

**Desktop (>1024px)**:
```
┌──────────────┬──────────────┬──────────────┐
│  Settings    │    Input     │    Output    │
│   Column     │   Column     │   Column     │
│              │              │              │
│ ToolOptions  │ InputField   │ OutputField  │
│              │              │              │
│              │              │ Copy Button  │
│              │              │ Share Button │
│              │              │              │
└──────────────┴──────────────┴──────────────┘
```

**Mobile (<640px)**:
```
Same 3-column layout as desktop (horizontally scrollable or scaled)
┌──────────────┬──────────────┬──────────────┐
│  Settings    │    Input     │    Output    │
│   Column     │   Column     │   Column     │
│              │              │              │
│ ToolOptions  │ InputField   │ OutputField  │
│              │              │              │
│              │              │ Copy Button  │
│              │              │ Share Button │
│              │              │              │
└──────────────┴──────────────┴──────────────┘
```

**Visual Specs**:
- Padding: 24px (desktop), 16px (mobile)
- Max-width: None (full container width)
- Margin: Auto
- Background: White (light) / Dark gray (#1F2937 dark)
- Grid layout: 3 equal columns (33% each) on desktop; flex-shrink on mobile
- Column gap: 16px (desktop and mobile)
- Row gap: 0px (same row)
- Mobile handling: **Flex-shrink auto-scale** - all 3 columns visible, each shrinks proportionally to fit 375px viewport. No horizontal scroll.

**Desktop Column Layout**:
- **Left Column (Settings)**: 33% width, 16px padding
  - Contains: ToolOptions accordion
  - Sticky header: "Settings" label
  - Height: Match input/output heights
  - Overflow: Scrollable if options exceed height

- **Middle Column (Input)**: 33% width, 16px padding
  - Contains: InputField component
  - Height: 400px base (resizable)
  - Border: 1px gray on all sides

- **Right Column (Output)**: 33% width, 16px padding
  - Contains: OutputField component + Action buttons
  - Height: 400px base (matches input)
  - Border: 1px gray on all sides
  - Bottom spacing: 12px (for buttons)

**Action Buttons Layout**:
- Position: Below OutputField in right column
- Flex layout: Row (horizontal)
- Spacing: 8px between buttons
- Button order: Copy | Share | Clear
- Each button: 32px height, flex-grow enabled for equal width
- Buttons:
  - Copy: Green on success, gray on default
  - Share: Blue, generates shareable URL
  - Clear: Gray, resets both input and output

---

### 3.4 InputField Component

**Location**: `src/components/Common/InputField.tsx`

**Props**:
```typescript
interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
}
```

**Visual Specs**:
- Type: `<textarea>` for large input
- Height: **Desktop: 400px base, resizable (min 80px, max 400px)** | **Mobile: Fixed 300px** (non-resizable, desktop-primary design)
- Font: Monospace (Courier New, SF Mono fallback)
- Font size: 13px
- Padding: 12px
- Border: 1px solid gray-300 (light) / gray-600 (dark)
- Border-radius: 4px
- Focus state: 
  - Border color: Blue-500
  - Box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
- Error state:
  - Border color: Red-500
  - Error message below in red-600

**Responsive**:
- Min width: 100%
- Desktop: Resize vertical only (no horizontal)
- Mobile: No resize (fixed 300px)

---

### 3.5 OutputField Component

**Location**: `src/components/Common/OutputField.tsx`

**Props**:
```typescript
interface OutputFieldProps {
  value: string;
  isLoading?: boolean;
  error?: ToolError;
  label?: string;
  copyable?: boolean;
  onCopy?: () => void;
}
```

**Visual Specs**:
- Type: Read-only `<textarea>`
- Height: 120px base (match input for symmetry)
- Font: Monospace (same as input)
- Font size: 13px
- Padding: 12px
- Background: Gray-50 (light) / Gray-800 (dark) — slightly different from input
- Border: 1px solid gray-300 (light) / gray-600 (dark)
- Border-radius: 4px
- Disabled state: Cursor not-allowed

**States**:
- Loading: Show spinner overlay + "Processing..." text
- Error: Show error message in red with icon
- Success: Show output, ready to copy

**Actions**:
- Copy button: Next to field (see CopyButton spec)

---

### 3.6 CopyButton Component

**Location**: `src/components/Common/CopyButton.tsx`

**Props**:
```typescript
interface CopyButtonProps {
  text: string;
  label?: string;
  onCopy?: () => void;
}
```

**Visual Specs**:
- Button size: 32px × 32px (icon only) or variable (with label)
- Icon: Copy icon (Lucide or similar)
- Background: Gray-100 (light) / Gray-700 (dark)
- Hover: Gray-200 (light) / Gray-600 (dark)
- Active/Copied: Green-500 background + "Copied!" tooltip (1s duration)
- Border: None
- Border-radius: 4px

**Interaction**:
- Click: Attempt to copy to clipboard using **Clipboard API with fallback**
  - Primary: Try `navigator.clipboard.writeText(text)` (modern, reliable)
  - Fallback: If Clipboard API fails/denied, use `document.execCommand('copy')` with text selection
- **Success**: Show green background (1s), then revert. Show toast: "Copied to clipboard"
- **Error** (both methods fail): Show red background (1s), then revert. Show error toast: "Copy failed. Try manual Ctrl+C"
- Revert button state after 1s

---

### 3.6a ShareButton Component

**Location**: `src/components/Common/ShareButton.tsx`

**Props**:
```typescript
interface ShareButtonProps {
  toolId: string;
  input: string;
  options: ToolOptions;
  onShare?: (url: string) => void;
}
```

**Visual Specs**:
- Button size: 32px × 32px (icon only) or variable (with label)
- Icon: Share icon (Lucide or similar)
- Background: Blue-500 (light) / Blue-600 (dark)
- Hover: Blue-600 (light) / Blue-700 (dark)
- Border: None
- Border-radius: 4px
- Text color: White

**Interaction**:
- Click: Generate shareable URL with encoded input/options as parameters
- **URL length validation**: If generated URL exceeds ~2000 characters, show error toast: "Input too large to share. Try a smaller input." Do NOT copy link.
- **Success case**: Show toast notification: "Link copied to clipboard"
- URL format: `?tool=base64&input=<encoded>&options=<encoded>`
- Copy generated link to clipboard automatically
- Optional: Open copy tooltip showing full link (3s duration)

---

### 3.7 ActionButtons Container

**Location**: `src/components/Common/ActionButtons.tsx`

**Props**:
```typescript
interface ActionButtonsProps {
  onCopy: () => void;
  onShare: (url: string) => void;
  onClear: () => void;
  copyText: string;
  toolId: string;
  options: ToolOptions;
  input: string;
}
```

**Visual Specs**:
- Container: Flex row, horizontal layout
- Spacing: 8px between buttons
- Height: 40px
- Position: Below OutputField in right column
- Padding: 0px (inherit from column)

**Button Order** (left to right):
1. **Copy Button** (width: 33%, flex-grow)
   - Action: Copy output to clipboard
   - Icon + Label: "Copy" or just icon

2. **Share Button** (width: 33%, flex-grow)
   - Action: Generate and copy shareable URL
   - Icon + Label: "Share" or just icon

3. **Clear Button** (width: 33%, flex-grow)
   - Action: Clear both input and output
   - Icon + Label: "Clear" or just icon
   - Confirmation: Optional (for MVP: no confirmation)

**Responsive**:
- Desktop: All buttons visible in single row
- Mobile: Buttons remain in row, text labels hidden (icons only)

---

### 3.8 ToolOptions Component

**Location**: `src/components/Common/ToolOptions.tsx`

**Props**:
```typescript
interface ToolOptionsProps {
  tool: Tool;
  values: ToolOptions;
  onChange: (options: ToolOptions) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}
```

**Visual Specs**:
- Container: Accordion-style (collapsible)
- **Default state: Expanded** (shown by default on all screen sizes, desktop-primary design)
- Header: "Options" label + chevron icon (pointing down when expanded, right when collapsed)
- Header height: 40px
- Padding: 12px 12px
- Border: 1px solid gray-200 (light) / gray-700 (dark)
- Border-radius: 4px
- Toggle animation: 200ms ease

**Content** (when expanded):
- Tool-specific options rendered as form fields
- Spacing: 12px between fields
- Each field: Label above + input below
- Example (Base64):
  - Input encoding (dropdown)
  - Output encoding (dropdown)
  - Line break mode (radio group)

**Responsive**:
- Desktop: Expanded by default, user can collapse
- Mobile (flex-shrink): Expanded by default, user can collapse (all 3 columns visible)

---

### 3.8 ThemeToggle Component

**Location**: `src/components/Layout/ThemeToggle.tsx`

**Props**:
```typescript
interface ThemeToggleProps {
  currentTheme: 'light' | 'dark';
  onChange: (theme: 'light' | 'dark') => void;
}
```

**Visual Specs**:
- Button size: 40px × 40px
- Icon: Sun (light mode) or Moon (dark mode)
- Icon color: Gray-600 (light) / Gray-300 (dark)
- Background: Transparent or hover gray-100 (light) / gray-800 (dark)
- Border: None
- Border-radius: 6px
- Hover: Light background highlight

**Interaction**:
- Click: Toggle theme immediately
- Persist to localStorage
- Apply theme CSS class to `<html>` element
- Smooth transition: 200ms fade (no jarring flashes)

---

### 3.9 Toast/Notification Component

**Location**: `src/components/Common/Toast.tsx` (global, rendered at App level)

**Props**:
```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number; // ms, default 3000
  onClose?: () => void;
}
```

**Visual Specs**:
- Position: Bottom-right (16px from edge)
- Padding: 12px 16px
- Border-radius: 4px
- Font size: 14px
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- Z-index: 9999 (above all content)

**Background by type**:
- Success: Green-500
- Error: Red-500
- Info: Blue-500

**Animation**:
- Slide in from bottom-right (200ms)
- Auto-dismiss after duration
- Slide out on dismiss (200ms)

---

## 4. Design Tokens (Tailwind Config)

### Colors

**Light Mode**:
```
Primary Background: white (#FFFFFF)
Secondary Background: gray-50 (#F9FAFB)
Text Primary: gray-900 (#111827)
Text Secondary: gray-600 (#4B5563)
Border: gray-200 (#E5E7EB)
Accent: blue-500 (#3B82F6)
Success: green-500 (#10B981)
Error: red-500 (#EF4444)
```

**Dark Mode**:
```
Primary Background: gray-900 (#111827)
Secondary Background: gray-800 (#1F2937)
Text Primary: gray-100 (#F3F4F6)
Text Secondary: gray-400 (#9CA3AF)
Border: gray-700 (#374151)
Accent: blue-400 (#60A5FA)
Success: green-400 (#4ADE80)
Error: red-400 (#F87171)
```

### Typography

```
H1: 24px, bold, line-height 1.2
H2: 20px, semibold, line-height 1.3
H3: 16px, semibold, line-height 1.4
Body: 14px, regular, line-height 1.5
Small: 12px, regular, line-height 1.4
Code: 13px, monospace (SF Mono, Courier New), line-height 1.6
```

### Spacing

```
Base unit: 4px
xs: 4px (rarely used)
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
```

### Shadows

```
sm: 0 1px 2px rgba(0, 0, 0, 0.05)
md: 0 4px 6px rgba(0, 0, 0, 0.1)
lg: 0 10px 15px rgba(0, 0, 0, 0.1)
```

### Border Radius

```
None: 0px
sm: 4px (inputs, buttons)
md: 6px (cards, modals)
lg: 8px (large containers)
full: 50% (circular)
```

---

## 5. State Management by Component

### Theme State (Global)

```typescript
// In App.tsx or useTheme hook
const [theme, setTheme] = useState<'light' | 'dark'>('light');

// On mount: Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
}, []);

// On change: Save to localStorage + apply CSS class
const handleThemeChange = (newTheme: 'light' | 'dark') => {
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  document.documentElement.classList.toggle('dark', newTheme === 'dark');
};
```

### Tool Selection State (Global)

```typescript
// In App.tsx
const [selectedToolId, setSelectedToolId] = useState<string>('base64');

// URL-based persistence (future): Parse URL to set initial tool
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const toolId = params.get('tool');
  if (toolId) setSelectedToolId(toolId);
}, []);
```

### Tool Execution State (Per-Tool)

```typescript
// In each tool component or custom hook
const [input, setInput] = useState('');
const [output, setOutput] = useState('');
const [options, setOptions] = useState<ToolOptions>({});
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<ToolError | null>(null);

// Execute tool
const handleExecute = async (input: string, opts: ToolOptions) => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await toolService.execute(input, opts);
    setOutput(result.output);
  } catch (err) {
    setError({ message: err.message, code: 'EXECUTION_ERROR' });
  } finally {
    setIsLoading(false);
  }
};
```

### Sidebar State (Mobile)

```typescript
// In App.tsx or Layout.tsx
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

// Close on mobile when tool selected
const handleToolSelect = (toolId: string) => {
  setSelectedToolId(toolId);
  if (window.innerWidth < 640) {
    setIsSidebarOpen(false);
  }
};
```

---

## 6. Responsive Design Details

### Mobile (<640px)

**Layout**:
- Same 3-column grid layout as desktop
- **Flex-shrink enabled**: All 3 columns visible, each auto-scales to <33% width
- Settings column: Flex-shrink % (dynamically scaled)
- Input column: Flex-shrink % (dynamically scaled)
- Output column: Flex-shrink % (dynamically scaled)
- **No horizontal scroll** - all content fits within viewport

**Input/Output**:
- Full width within column (after flex-shrink)
- Height: **Fixed 300px base** (matches desktop-primary design)
- Non-resizable on mobile (fixed height)
- Font size: Same as desktop (13px monospace)

**Columns**:
- Settings: ToolOptions accordion **expanded by default** (desktop-primary)
- Input: InputField component
- Output: OutputField + ActionButtons below

**Navigation**:
- Sidebar still toggles via hamburger in header
- Tool content maintains 3-column layout

### Tablet (640-1024px)

**Layout**:
- Sidebar collapsed to icon-only view (60px width)
- Content area: Remaining width
- Icon tooltips on hover

**Input/Output**:
- Max-width: 600px (narrower for tablet)
- Slightly smaller padding

### Desktop (>1024px)

**Layout**:
- Sidebar fully visible (240px)
- Content area: Remaining width, centered
- Collapsible sidebar toggle (optional)

**Input/Output**:
- Max-width: 800px
- Standard padding
- Side-by-side comparison possible (future feature)

---

## 7. Dark Mode Implementation

### CSS Approach

**Tailwind dark mode**: Use `class` strategy

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Use class selector instead of prefers-color-scheme
  theme: {
    // ...color definitions...
  }
};
```

**Apply dark class**:
```typescript
// In ThemeToggle or App
document.documentElement.classList.add('dark');
document.documentElement.classList.remove('dark');
```

**Usage in components**:
```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### Smooth Transitions

```css
/* globals.css */
html {
  transition: background-color 200ms ease, color 200ms ease;
}

* {
  transition: background-color 200ms ease, border-color 200ms ease;
}
```

---

## 8. Accessibility (WCAG 2.1 Level AA)

### Keyboard Navigation

- Tab order: Header → Sidebar tools → Tool content → Buttons
- Enter/Space: Activate buttons
- Escape: Close sidebar overlay (mobile)
- Focus visible: All interactive elements show 2px outline

### Screen Readers

- All buttons: `aria-label` or visible text
- Form inputs: `<label>` elements with `htmlFor`
- Tool name: `<h1>` tag (screen reader landmark)
- Error messages: `role="alert"` for dynamic updates
- Loading state: `aria-busy="true"`

### Color Contrast

- Text on background: Minimum 4.5:1 (normal text), 3:1 (large text)
- Border colors: 3:1 minimum
- Icons: Same contrast requirements as text

### Focus Management

- Tool selection: Focus moved to tool content area
- Modal/overlay close: Focus returns to trigger button
- Dynamic content: Announce to screen readers

---

## 9. Component File Structure

```
src/components/
├── Layout/
│   ├── Header.tsx                 # Main header with theme toggle
│   ├── Sidebar.tsx                # Tool list sidebar
│   ├── ThemeToggle.tsx            # Theme switch button
│   └── MainLayout.tsx             # Layout wrapper
├── Tools/
│   ├── ToolWrapper.tsx            # Generic tool container (3-column layout)
│   ├── Base64Tool.tsx             # Base64 specific
│   ├── JsonValidator.tsx          # JSON specific
│   ├── EncryptionTool.tsx         # Encryption specific
│   └── ConverterTool.tsx          # Converter specific
├── Common/
│   ├── InputField.tsx             # Textarea input
│   ├── OutputField.tsx            # Read-only output
│   ├── ToolOptions.tsx            # Options accordion (left column)
│   ├── CopyButton.tsx             # Copy-to-clipboard button
│   ├── ShareButton.tsx            # Share link generation button
│   ├── ActionButtons.tsx          # Container for Copy, Share, Clear buttons
│   ├── Toast.tsx                  # Notifications
│   └── EmptyState.tsx             # First-load placeholder
└── App.tsx                        # Root component

src/hooks/
├── useTheme.ts                    # Theme management
├── useTool.ts                     # Tool execution
├── useToast.ts                    # Toast notifications
└── useResponsive.ts               # Responsive helpers

src/types/
├── UI.ts                          # UI component types
├── Tool.ts                        # Tool types
└── State.ts                       # State types
```

---

## 10. Testing Contract for UI Components

### Header Component Tests
- ✅ Theme toggle button updates theme
- ✅ Logo text displays correctly
- ✅ Header stays at top (position sticky)
- ✅ Mobile: Hamburger appears on <640px

### Sidebar Tests
- ✅ Tool items render with icons
- ✅ Selected tool has active styling
- ✅ Tool click fires onToolSelect
- ✅ Collapse button toggles sidebar width
- ✅ Mobile: Overlay covers full height
- ✅ Mobile: Click outside closes sidebar

### Tool Wrapper (3-Column Layout) Tests
- ✅ Three columns render side-by-side on desktop
- ✅ Columns stack vertically on mobile
- ✅ Settings column shows ToolOptions accordion
- ✅ Input column shows InputField
- ✅ Output column shows OutputField
- ✅ ActionButtons appear below OutputField
- ✅ Columns maintain equal width (33% each) on desktop

### ActionButtons Tests
- ✅ Copy button copies output to clipboard
- ✅ Copy button shows success state (1s)
- ✅ Share button generates URL with input/options
- ✅ Share button copies link to clipboard
- ✅ Clear button resets input and output
- ✅ All buttons show proper hover/active states
- ✅ Mobile: Buttons remain visible and functional

### Dark Mode Tests
- ✅ Dark theme applies correct colors
- ✅ Theme persists to localStorage
- ✅ Class toggled on `<html>` element
- ✅ Smooth transition (no flashing)
- ✅ All elements visible in both themes

### Responsive Tests (Playwright)
- ✅ Mobile (375px): 3-column flex-shrink layout, all columns visible, no horizontal scroll
- ✅ Mobile: Input field fixed 300px height
- ✅ Mobile: Settings accordion expanded by default
- ✅ Tablet (768px): 3-column layout with reduced padding
- ✅ Desktop (1440px): Full 3-column side-by-side layout
- ✅ All columns maintain proportional width ratio (flex-shrink on mobile)
- ✅ Font sizes consistent across all breakpoints
- ✅ Touch targets ≥44px on mobile
- ✅ Share button: Shows error if URL >2000 chars
- ✅ Copy button: Clipboard API + fallback works
- ✅ Copy button: Shows error toast if both methods fail

---

## 11. Implementation Checklist (Phase 2)

**Week 2 Tasks** (in order):

- [ ] Create Header component with theme toggle
- [ ] Create Sidebar component with tool list
- [ ] Create MainLayout wrapper combining both
- [ ] Set up Tailwind dark mode in config
- [ ] Create theme hook (useTheme)
- [ ] Create InputField component
- [ ] Create OutputField component
- [ ] Create CopyButton component
- [ ] Create ToolOptions component
- [ ] Create ToolWrapper container
- [ ] Create EmptyState component
- [ ] Create Toast/notification system
- [ ] Wire up tool selection (Context API)
- [ ] Test responsive breakpoints
- [ ] Add keyboard navigation
- [ ] Add screen reader labels

**Definition of Done**:
- All components render without errors
- Theme toggle works (light ↔ dark)
- Sidebar navigation works
- Responsive layouts verified (375px, 768px, 1440px)
- No accessibility warnings (axe DevTools)
- Storybook stories for all components (optional)

---

## 12. Future Enhancements (Post-MVP)

- Component library (Storybook)
- Drag-to-reorder tools in sidebar
- Tool search/filter
- Collapsible tool categories
- Custom color themes (beyond light/dark)
- Settings panel
- Keyboard shortcuts
- Voice input/output (accessibility)

---

**Next Steps**: Follow this spec during Phase 2 implementation. Reference specific component props and visual specs when building React components.
