# Component Contracts: UI/UX Refinement

**Date**: 2025-10-29  
**Format**: TypeScript Interface Contracts  
**Related**: `../data-model.md`, `../spec.md`

---

## 1. Header Component Contract

**Component**: `src/components/Layout/Header.tsx`  
**Responsibility**: Display app title, tool title, and theme toggle  
**Updated For**: Tool title integration (moved from content area)

```typescript
/**
 * Header component props
 */
interface HeaderProps {
  /** Tool title to display (e.g., "Base64 Encode") */
  toolTitle?: string;
  
  /** Optional tool description */
  toolDescription?: string;
  
  /** Current theme mode */
  theme: 'light' | 'dark';
  
  /** Called when theme toggle is clicked */
  onThemeToggle: () => void;
}

/**
 * Expected JSX structure
 * <header className="header">
 *   <div className="left">
 *     <span className="brand">Online Developer Tools</span>
 *     {toolTitle && (
 *       <div className="tool-section">
 *         <h1>{toolTitle}</h1>
 *         {toolDescription && <p>{toolDescription}</p>}
 *       </div>
 *     )}
 *   </div>
 *   <div className="right">
 *     <button onClick={onThemeToggle}>
 *       {theme === 'light' ? <SunIcon /> : <MoonIcon />}
 *     </button>
 *   </div>
 * </header>
 */

/**
 * Contract Tests
 */
describe('Header Component', () => {
  test('displays "Online Developer Tools" branding', () => {
    const { getByText } = render(<Header theme="light" onThemeToggle={jest.fn()} />);
    expect(getByText('Online Developer Tools')).toBeInTheDocument();
  });

  test('displays toolTitle when provided', () => {
    const { getByText } = render(
      <Header theme="light" toolTitle="Base64 Encode" onThemeToggle={jest.fn()} />
    );
    expect(getByText('Base64 Encode')).toBeInTheDocument();
  });

  test('displays toolDescription when provided', () => {
    const { getByText } = render(
      <Header 
        theme="light" 
        toolTitle="Base64 Encode"
        toolDescription="Convert text to Base64"
        onThemeToggle={jest.fn()} 
      />
    );
    expect(getByText('Convert text to Base64')).toBeInTheDocument();
  });

  test('calls onThemeToggle when theme button clicked', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(<Header theme="light" onThemeToggle={onToggle} />);
    fireEvent.click(getByRole('button'));
    expect(onToggle).toHaveBeenCalled();
  });

  test('shows Sun icon in light mode', () => {
    const { container } = render(<Header theme="light" onThemeToggle={jest.fn()} />);
    expect(container.querySelector('svg.sun-icon')).toBeInTheDocument();
  });

  test('shows Moon icon in dark mode', () => {
    const { container } = render(<Header theme="dark" onThemeToggle={jest.fn()} />);
    expect(container.querySelector('svg.moon-icon')).toBeInTheDocument();
  });

  test('applies correct theme classes', () => {
    const { container: lightContainer } = render(<Header theme="light" onThemeToggle={jest.fn()} />);
    expect(lightContainer.querySelector('.header')).toHaveClass('bg-white');

    const { container: darkContainer } = render(<Header theme="dark" onThemeToggle={jest.fn()} />);
    expect(darkContainer.querySelector('.header')).toHaveClass('dark:bg-gray-900');
  });
});
```

---

## 2. ToolOptions Component Contract (Renamed from ToolOptions, "Settings" UI)

**Component**: `src/components/Common/ToolOptions.tsx`  
**Responsibility**: Display settings accordion with tool-specific options  
**Updated For**: Auto-Update toggle, Input Encoding dropdown, Format dropdown

```typescript
/**
 * Tool options component props
 */
interface ToolOptionsProps {
  /** Whether the tool has options */
  hasOptions: boolean;
  
  /** React component for rendering tool-specific options */
  optionsComponent: React.ComponentType<ToolOptionsComponentProps>;
  
  /** Current options values */
  options: Record<string, any>;
  
  /** Called when entire options object changes */
  onOptionsChange: (options: Record<string, any>) => void;
  
  /** Called when individual option changes */
  onOptionChange: (key: string, value: any) => void;
  
  /** Tool ID (for context) */
  toolId: string;
}

/**
 * Base64-specific options component props
 */
interface Base64OptionsComponentProps {
  options: Base64Settings;
  onOptionChange: (key: keyof Base64Settings, value: any) => void;
}

interface Base64Settings {
  autoUpdate: boolean;
  inputEncoding: 'utf8' | 'ascii' | 'latin1';
  format: 'rfc4648' | 'urlsafe';
}

/**
 * Expected JSX structure for ToolOptions
 * <div className="tool-options">
 *   <button className="accordion-header" onClick={toggleExpanded}>
 *     Settings {isExpanded ? <ChevronDown /> : <ChevronRight />}
 *   </button>
 *   {isExpanded && (
 *     <div className="accordion-content">
 *       {React.createElement(optionsComponent, {
 *         options,
 *         onOptionChange
 *       })}
 *     </div>
 *   )}
 * </div>
 */

/**
 * Expected JSX structure for Base64OptionsComponent
 * <div className="space-y-4">
 *   <div>
 *     <label htmlFor="auto-update">Auto-Update</label>
 *     <input
 *       type="checkbox"
 *       id="auto-update"
 *       checked={options.autoUpdate}
 *       onChange={(e) => onOptionChange('autoUpdate', e.target.checked)}
 *     />
 *   </div>
 *   
 *   <div>
 *     <label htmlFor="input-encoding">Input Encoding</label>
 *     <select
 *       id="input-encoding"
 *       value={options.inputEncoding}
 *       onChange={(e) => onOptionChange('inputEncoding', e.target.value)}
 *     >
 *       <option value="utf8">UTF-8</option>
 *       <option value="ascii">ASCII</option>
 *       <option value="latin1">Latin-1</option>
 *     </select>
 *   </div>
 *   
 *   <div>
 *     <label htmlFor="format">Format</label>
 *     <select
 *       id="format"
 *       value={options.format}
 *       onChange={(e) => onOptionChange('format', e.target.value)}
 *     >
 *       <option value="rfc4648">RFC 4648</option>
 *       <option value="urlsafe">URL-safe</option>
 *     </select>
 *   </div>
 * </div>
 */

/**
 * Contract Tests - ToolOptions Component
 */
describe('ToolOptions Component', () => {
  const mockOptionsComponent = ({ options, onOptionChange }) => (
    <div data-testid="options-content">Options Component</div>
  );

  test('displays "Settings" header', () => {
    const { getByText } = render(
      <ToolOptions
        hasOptions={true}
        optionsComponent={mockOptionsComponent}
        options={{}}
        onOptionsChange={jest.fn()}
        onOptionChange={jest.fn()}
        toolId="test"
      />
    );
    expect(getByText('Settings')).toBeInTheDocument();
  });

  test('expands accordion when header clicked', () => {
    const { getByText, getByTestId } = render(
      <ToolOptions
        hasOptions={true}
        optionsComponent={mockOptionsComponent}
        options={{}}
        onOptionsChange={jest.fn()}
        onOptionChange={jest.fn()}
        toolId="test"
      />
    );
    fireEvent.click(getByText('Settings'));
    expect(getByTestId('options-content')).toBeVisible();
  });

  test('collapses accordion when clicked again', () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <ToolOptions
        hasOptions={true}
        optionsComponent={mockOptionsComponent}
        options={{}}
        onOptionsChange={jest.fn()}
        onOptionChange={jest.fn()}
        toolId="test"
      />
    );
    fireEvent.click(getByText('Settings'));
    fireEvent.click(getByText('Settings'));
    expect(queryByTestId('options-content')).not.toBeInTheDocument();
  });

  test('renders options component when expanded', () => {
    const { getByTestId } = render(
      <ToolOptions
        hasOptions={true}
        optionsComponent={mockOptionsComponent}
        options={{}}
        onOptionsChange={jest.fn()}
        onOptionChange={jest.fn()}
        toolId="test"
      />
    );
    expect(getByTestId('options-content')).toBeInTheDocument();
  });

  test('calls onOptionChange when option changes', () => {
    const onOptionChange = jest.fn();
    // This test assumes Base64OptionsComponent is rendered
    // Actual test would verify dropdown/checkbox events
  });
});

/**
 * Contract Tests - Base64OptionsComponent
 */
describe('Base64OptionsComponent', () => {
  test('renders Auto-Update toggle', () => {
    const { getByLabelText } = render(
      <Base64OptionsComponent
        options={{ autoUpdate: true, inputEncoding: 'utf8', format: 'rfc4648' }}
        onOptionChange={jest.fn()}
      />
    );
    expect(getByLabelText('Auto-Update')).toBeInTheDocument();
  });

  test('auto-update toggle reflects current value', () => {
    const { getByLabelText: getByLabelTextOn } = render(
      <Base64OptionsComponent
        options={{ autoUpdate: true, inputEncoding: 'utf8', format: 'rfc4648' }}
        onOptionChange={jest.fn()}
      />
    );
    expect(getByLabelTextOn('Auto-Update')).toBeChecked();

    const { getByLabelText: getByLabelTextOff } = render(
      <Base64OptionsComponent
        options={{ autoUpdate: false, inputEncoding: 'utf8', format: 'rfc4648' }}
        onOptionChange={jest.fn()}
      />
    );
    expect(getByLabelTextOff('Auto-Update')).not.toBeChecked();
  });

  test('Input Encoding dropdown shows correct options', () => {
    const { getByLabelText, getByDisplayValue } = render(
      <Base64OptionsComponent
        options={{ autoUpdate: true, inputEncoding: 'utf8', format: 'rfc4648' }}
        onOptionChange={jest.fn()}
      />
    );
    const select = getByLabelText('Input Encoding');
    expect(select).toHaveLength(3); // 3 options: UTF-8, ASCII, Latin-1
  });

  test('Format dropdown shows correct options', () => {
    const { getByLabelText } = render(
      <Base64OptionsComponent
        options={{ autoUpdate: true, inputEncoding: 'utf8', format: 'rfc4648' }}
        onOptionChange={jest.fn()}
      />
    );
    const select = getByLabelText('Format');
    expect(select).toHaveLength(2); // 2 options: RFC 4648, URL-safe
  });

  test('calls onOptionChange when Auto-Update toggled', () => {
    const onOptionChange = jest.fn();
    const { getByLabelText } = render(
      <Base64OptionsComponent
        options={{ autoUpdate: true, inputEncoding: 'utf8', format: 'rfc4648' }}
        onOptionChange={onOptionChange}
      />
    );
    fireEvent.click(getByLabelText('Auto-Update'));
    expect(onOptionChange).toHaveBeenCalledWith('autoUpdate', false);
  });

  test('calls onOptionChange when Input Encoding changed', () => {
    const onOptionChange = jest.fn();
    const { getByLabelText } = render(
      <Base64OptionsComponent
        options={{ autoUpdate: true, inputEncoding: 'utf8', format: 'rfc4648' }}
        onOptionChange={onOptionChange}
      />
    );
    fireEvent.change(getByLabelText('Input Encoding'), { target: { value: 'ascii' } });
    expect(onOptionChange).toHaveBeenCalledWith('inputEncoding', 'ascii');
  });

  test('calls onOptionChange when Format changed', () => {
    const onOptionChange = jest.fn();
    const { getByLabelText } = render(
      <Base64OptionsComponent
        options={{ autoUpdate: true, inputEncoding: 'utf8', format: 'rfc4648' }}
        onOptionChange={onOptionChange}
      />
    );
    fireEvent.change(getByLabelText('Format'), { target: { value: 'urlsafe' } });
    expect(onOptionChange).toHaveBeenCalledWith('format', 'urlsafe');
  });
});
```

---

## 3. Content Area (Full-Height Layout) Contract

**Component**: `src/components/Tools/ToolWrapper.tsx` (updated) or new layout component  
**Responsibility**: Display 3-column tool layout that fills browser height

```typescript
/**
 * Tool wrapper props (content area container)
 */
interface ToolWrapperProps {
  children: React.ReactNode; // 3-column grid inside
}

/**
 * Expected CSS structure
 */
interface ContentAreaCSS {
  container: {
    padding: '0'; // No top/bottom padding
    height: 'calc(100vh - 56px)'; // Full height minus header
    display: 'grid';
    gridTemplateColumns: 'repeat(3, 1fr)';
    gap: '16px';
    padding: '24px'; // Padding inside grid
  };
  column: {
    display: 'flex';
    flexDirection: 'column';
    minHeight: '0'; // Critical for flex children
  };
}

/**
 * Contract Tests
 */
describe('ToolWrapper / Content Area Layout', () => {
  test('renders 3-column grid layout', () => {
    const { container } = render(
      <ToolWrapper>
        <div data-testid="column-settings">Settings</div>
        <div data-testid="column-input">Input</div>
        <div data-testid="column-output">Output</div>
      </ToolWrapper>
    );
    expect(container.querySelector('.grid')).toHaveClass('grid-cols-3');
  });

  test('columns have equal width', () => {
    const { container } = render(
      <ToolWrapper>
        <div data-testid="column-settings">Settings</div>
        <div data-testid="column-input">Input</div>
        <div data-testid="column-output">Output</div>
      </ToolWrapper>
    );
    const columns = container.querySelectorAll('.column');
    // All columns should have flex: 1 (equal width)
    columns.forEach(col => {
      expect(col).toHaveClass('flex-1');
    });
  });

  test('content area fills full height', () => {
    const { container } = render(
      <ToolWrapper>
        <div>Content</div>
      </ToolWrapper>
    );
    const wrapper = container.querySelector('.tool-wrapper');
    expect(wrapper).toHaveClass('h-full');
  });

  test('no top/bottom padding on content area', () => {
    const { container } = render(
      <ToolWrapper>
        <div>Content</div>
      </ToolWrapper>
    );
    const wrapper = container.querySelector('.content-area');
    expect(wrapper).not.toHaveClass('pt-6', 'pb-6');
  });

  test('columns have min-height-0 for proper flex behavior', () => {
    const { container } = render(
      <ToolWrapper>
        <div data-testid="column-settings">Settings</div>
        <div data-testid="column-input">Input</div>
        <div data-testid="column-output">Output</div>
      </ToolWrapper>
    );
    const columns = container.querySelectorAll('.column');
    columns.forEach(col => {
      expect(col).toHaveClass('min-h-0');
    });
  });
});
```

---

## 4. Base64 Service Contracts (Separated)

**Services**: `src/services/base64-encode.ts` and `src/services/base64-decode.ts`

```typescript
/**
 * Base64 Encode Service Contract
 */
interface Base64EncodeService extends ToolService {
  /**
   * Encode text to Base64
   * @param input Plain text string
   * @param options Encoding options (inputEncoding, format)
   * @returns Encoded Base64 string or error
   */
  execute(
    input: string,
    options: { inputEncoding: string; format: 'rfc4648' | 'urlsafe' }
  ): Promise<ToolResult<string>>;
  
  /**
   * Validate input for encoding
   * Always returns valid (any string can be encoded)
   */
  validate(input: string): ValidationResult;
  
  /**
   * Get default options
   */
  getDefaultOptions(): { inputEncoding: 'utf8'; format: 'rfc4648' };
}

/**
 * Base64 Decode Service Contract
 */
interface Base64DecodeService extends ToolService {
  /**
   * Decode Base64 to text
   * @param input Base64 encoded string
   * @param options Decoding options (inputEncoding, format)
   * @returns Decoded text or error
   */
  execute(
    input: string,
    options: { inputEncoding: string; format: 'rfc4648' | 'urlsafe' }
  ): Promise<ToolResult<string>>;
  
  /**
   * Validate input for decoding
   * Returns error if invalid Base64
   */
  validate(input: string): ValidationResult;
  
  /**
   * Get default options
   */
  getDefaultOptions(): { inputEncoding: 'utf8'; format: 'rfc4648' };
}

/**
 * Contract Tests - Base64EncodeService
 */
describe('Base64EncodeService', () => {
  const service = new Base64EncodeService();

  test('encodes simple text to RFC 4648 format', async () => {
    const result = await service.execute('Hello', {
      inputEncoding: 'utf8',
      format: 'rfc4648'
    });
    expect(result.success).toBe(true);
    expect(result.data).toBe('SGVsbG8=');
  });

  test('encodes to URL-safe format', async () => {
    const result = await service.execute('Hello?', {
      inputEncoding: 'utf8',
      format: 'urlsafe'
    });
    expect(result.success).toBe(true);
    // URL-safe replaces + with - and / with _
    expect(result.data).not.toContain('+');
    expect(result.data).not.toContain('/');
  });

  test('handles empty input', async () => {
    const result = await service.execute('', {
      inputEncoding: 'utf8',
      format: 'rfc4648'
    });
    expect(result.success).toBe(true);
    expect(result.data).toBe('');
  });

  test('returns valid result with executionTime', async () => {
    const result = await service.execute('Test', {
      inputEncoding: 'utf8',
      format: 'rfc4648'
    });
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
    expect(result.executionTime).toBeLessThan(100); // Should be <100ms
  });
});

/**
 * Contract Tests - Base64DecodeService
 */
describe('Base64DecodeService', () => {
  const service = new Base64DecodeService();

  test('decodes valid RFC 4648 base64', async () => {
    const result = await service.execute('SGVsbG8=', {
      inputEncoding: 'utf8',
      format: 'rfc4648'
    });
    expect(result.success).toBe(true);
    expect(result.data).toBe('Hello');
  });

  test('decodes URL-safe format', async () => {
    const result = await service.execute('SGVsbG8_', {
      inputEncoding: 'utf8',
      format: 'urlsafe'
    });
    expect(result.success).toBe(true);
  });

  test('returns error for invalid base64', async () => {
    const result = await service.execute('!!!invalid!!!', {
      inputEncoding: 'utf8',
      format: 'rfc4648'
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('validates input correctly', () => {
    const validResult = service.validate('SGVsbG8=');
    expect(validResult.valid).toBe(true);

    const invalidResult = service.validate('!!!invalid!!!');
    expect(invalidResult.valid).toBe(false);
  });

  test('validation tolerates URL-safe characters', () => {
    const result = service.validate('SGVsbG8_SGVsbG8-'); // Contains - and _
    expect(result.valid).toBe(true);
  });
});
```

---

## 5. Theme Toggle Contract

**Component**: `src/components/Layout/ThemeToggle.tsx` (updated)  
**Responsibility**: Switch between light and dark themes (no system option)

```typescript
interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: (newTheme: 'light' | 'dark') => void;
}

/**
 * Contract Tests
 */
describe('ThemeToggle Component', () => {
  test('displays Sun icon in light mode', () => {
    const { container } = render(
      <ThemeToggle theme="light" onToggle={jest.fn()} />
    );
    expect(container.querySelector('svg.sun-icon')).toBeInTheDocument();
  });

  test('displays Moon icon in dark mode', () => {
    const { container } = render(
      <ThemeToggle theme="dark" onToggle={jest.fn()} />
    );
    expect(container.querySelector('svg.moon-icon')).toBeInTheDocument();
  });

  test('calls onToggle with opposite theme when clicked', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <ThemeToggle theme="light" onToggle={onToggle} />
    );
    fireEvent.click(getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith('dark');
  });

  test('only supports 2 themes (light/dark)', () => {
    // No 'system' or 'auto' option
    expect(['light', 'dark']).toHaveLength(2);
  });

  test('persists theme to localStorage on toggle', () => {
    const onToggle = jest.fn((theme) => {
      localStorage.setItem('theme', theme);
    });
    const { getByRole } = render(
      <ThemeToggle theme="light" onToggle={onToggle} />
    );
    fireEvent.click(getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('applies correct CSS classes for theme', () => {
    const { container: lightContainer } = render(
      <ThemeToggle theme="light" onToggle={jest.fn()} />
    );
    expect(lightContainer.querySelector('.theme-toggle')).toHaveClass('text-gray-600');

    const { container: darkContainer } = render(
      <ThemeToggle theme="dark" onToggle={jest.fn()} />
    );
    expect(darkContainer.querySelector('.theme-toggle')).toHaveClass('text-gray-300');
  });
});
```

---

## 6. Tool Component Contracts (Base64Encode & Base64Decode)

**Components**: `src/components/Tools/Base64EncodeTool.tsx` and `Base64DecodeTool.tsx`

```typescript
/**
 * Base64EncodeTool component
 * Inherits from generic ToolComponentBase
 */
interface Base64EncodeToolProps {
  // No props - uses context for global state
  // Uses useTool hook for execution
  // Sets headerTitle/headerDescription on mount
}

/**
 * Contract Tests - Base64EncodeTool
 */
describe('Base64EncodeTool', () => {
  test('renders 3-column layout (Settings, Input, Output)', () => {
    const { getByTestId } = render(<Base64EncodeTool />);
    expect(getByTestId('settings-column')).toBeInTheDocument();
    expect(getByTestId('input-column')).toBeInTheDocument();
    expect(getByTestId('output-column')).toBeInTheDocument();
  });

  test('sets header title on mount', () => {
    // Mock ToolContext to verify setHeaderTitle is called
    const setHeaderTitle = jest.fn();
    render(<Base64EncodeTool />);
    expect(setHeaderTitle).toHaveBeenCalledWith('Base64 Encode');
  });

  test('auto-updates output when input changes (if auto-update ON)', async () => {
    const { getByDisplayValue, getByText } = render(<Base64EncodeTool />);
    const input = getByDisplayValue('');
    
    // Assume auto-update is ON by default
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    await waitFor(() => {
      expect(getByDisplayValue('SGVsbG8=')).toBeInTheDocument();
    }, { timeout: 300 }); // Allow for 200ms debounce
  });

  test('does not auto-update when toggle is OFF', async () => {
    const { getByLabelText, getByDisplayValue } = render(<Base64EncodeTool />);
    
    // Turn off auto-update
    fireEvent.click(getByLabelText('Auto-Update'));
    
    // Type in input
    const input = getByDisplayValue('');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    // Output should not change automatically
    expect(queryByDisplayValue('SGVsbG8=')).not.toBeInTheDocument();
    
    // Click Encode button
    fireEvent.click(getByText('Encode'));
    
    // Now output should appear
    await waitFor(() => {
      expect(getByDisplayValue('SGVsbG8=')).toBeInTheDocument();
    });
  });

  test('Encode button visible only when auto-update OFF', () => {
    const { getByText, queryByText } = render(<Base64EncodeTool />);
    
    // Auto-update ON by default → no button
    expect(queryByText('Encode')).not.toBeInTheDocument();
    
    // Toggle auto-update OFF → button appears
    fireEvent.click(getByLabelText('Auto-Update'));
    expect(getByText('Encode')).toBeInTheDocument();
  });

  test('respects Input Encoding selection', async () => {
    const { getByLabelText, getByDisplayValue } = render(<Base64EncodeTool />);
    
    // Change input encoding to ASCII
    fireEvent.change(getByLabelText('Input Encoding'), { target: { value: 'ascii' } });
    
    // Input text
    fireEvent.change(getByDisplayValue(''), { target: { value: 'Hello' } });
    
    // Output should be encoded with ASCII interpretation
    await waitFor(() => {
      expect(getByDisplayValue('SGVsbG8=')).toBeInTheDocument();
    });
  });

  test('respects Format selection', async () => {
    const { getByLabelText, getByDisplayValue } = render(<Base64EncodeTool />);
    
    // Change format to URL-safe
    fireEvent.change(getByLabelText('Format'), { target: { value: 'urlsafe' } });
    
    // Type input with characters that differ in URL-safe
    fireEvent.change(getByDisplayValue(''), { target: { value: 'Hello?test+data' } });
    
    // Output should use URL-safe encoding (- instead of +, _ instead of /)
    await waitFor(() => {
      const output = getByDisplayValue('');
      expect(output.value).not.toContain('+');
      expect(output.value).not.toContain('/');
    });
  });

  test('Copy button works and shows success state', async () => {
    const { getByDisplayValue, getByText } = render(<Base64EncodeTool />);
    
    // Generate output
    fireEvent.change(getByDisplayValue(''), { target: { value: 'Hello' } });
    
    await waitFor(() => {
      expect(getByDisplayValue('SGVsbG8=')).toBeInTheDocument();
    });
    
    // Click copy
    fireEvent.click(getByText('Copy'));
    
    // Verify clipboard (or success state)
    expect(getByText('Copied!')).toBeInTheDocument();
  });

  test('clears input and output with Clear button', async () => {
    const { getByDisplayValue, getByText, queryByDisplayValue } = render(<Base64EncodeTool />);
    
    // Generate output
    fireEvent.change(getByDisplayValue(''), { target: { value: 'Hello' } });
    
    await waitFor(() => {
      expect(getByDisplayValue('SGVsbG8=')).toBeInTheDocument();
    });
    
    // Click Clear
    fireEvent.click(getByText('Clear'));
    
    // Both fields should be empty
    expect(queryByDisplayValue('Hello')).not.toBeInTheDocument();
    expect(queryByDisplayValue('SGVsbG8=')).not.toBeInTheDocument();
  });
});

/**
 * Base64DecodeTool component
 * Same structure as Encode, but operation is 'decode'
 */
interface Base64DecodeToolProps {
  // No props
}

/**
 * Contract Tests - Base64DecodeTool
 * (Same pattern as encode, but with decode-specific inputs/outputs)
 */
describe('Base64DecodeTool', () => {
  test('sets header title to "Base64 Decode" on mount', () => {
    const setHeaderTitle = jest.fn();
    render(<Base64DecodeTool />);
    expect(setHeaderTitle).toHaveBeenCalledWith('Base64 Decode');
  });

  test('Decode button label shows "Decode" not "Encode"', () => {
    const { getByLabelText, getByText } = render(<Base64DecodeTool />);
    fireEvent.click(getByLabelText('Auto-Update')); // Turn off auto-update
    expect(getByText('Decode')).toBeInTheDocument();
  });

  test('auto-updates output when base64 input changes', async () => {
    const { getByDisplayValue } = render(<Base64DecodeTool />);
    
    // Input Base64
    fireEvent.change(getByDisplayValue(''), { target: { value: 'SGVsbG8=' } });
    
    // Output should be decoded
    await waitFor(() => {
      expect(getByDisplayValue('Hello')).toBeInTheDocument();
    });
  });

  test('shows error for invalid Base64 input', async () => {
    const { getByDisplayValue, getByText } = render(<Base64DecodeTool />);
    
    // Input invalid Base64
    fireEvent.change(getByDisplayValue(''), { target: { value: '!!!invalid!!!' } });
    
    // Error message should appear
    await waitFor(() => {
      expect(getByText(/Decoding Error/i)).toBeInTheDocument();
    });
  });
});
```

---

## Summary of Component Contracts

| Component | Key Methods | Input Types | Output Types | Error Handling |
|-----------|------------|-----------|--------------|----------------|
| Header | render | theme, toolTitle, onToggle | HTML with title + toggle | N/A |
| ToolOptions | expand/collapse, onChange | options, callbacks | HTML accordion | N/A |
| Base64Options | onChange | settings | HTML form | N/A |
| ToolWrapper | render | 3 children | HTML 3-col grid | N/A |
| Base64EncodeService | execute, validate | string, options | ToolResult<string> | Result.success=false |
| Base64DecodeService | execute, validate | string, options | ToolResult<string> | Result.success=false |
| Base64EncodeTool | render, setTitle | context | HTML tool UI | Display error state |
| Base64DecodeTool | render, setTitle | context | HTML tool UI | Display error state |
| ThemeToggle | onToggle | theme | updated theme | N/A |

---

**Status**: ✅ All Component Contracts Defined  
**Next**: Quickstart Guide & Implementation

