/**
 * URL Parameter Handling - Contract Test Specification
 * 
 * CONTRACT: URL Parameter Round-Trip (Input → URL → Page Load)
 * Requirement: Share URLs must preserve all tool state for reproduction
 * 
 * User Story 3 (P1): Shareable Links with URL Parameters
 * Acceptance Scenarios 2-5 define the parameter handling behavior
 * 
 * These tests define the contract for URL parameter encoding and restoration.
 */

// SCENARIO 1: URL Parameter Encoding - Simple Input
// GIVEN: User enters "Hello" in Base64 Encode
// WHEN: Share button generates URL
// THEN: input parameter should be "SGVsbG8=" (Base64-encoded)
// Result: Input "Hello" → Base64 "SGVsbG8=" → URL parameter input=SGVsbG8%3D

// SCENARIO 2: URL Parameter Encoding - Special Characters
// GIVEN: User enters text with special characters "Hello, World!"
// WHEN: URL is generated
// THEN: special characters should be properly URL-encoded
// Result: URL-safe encoding; navigable and parseable

// SCENARIO 3: URL Parameter Encoding - Unicode Characters
// GIVEN: User enters Unicode text "Hello 👋 Привет"
// WHEN: URL is generated
// THEN: Unicode should be encoded as UTF-8 then Base64
// Result: URL contains properly encoded Unicode

// SCENARIO 4: URL Parameter Restoration - Full Round-Trip (Acceptance Scenario 2)
// GIVEN: User generates share URL from Base64 Encode with input "Hello"
// WHEN: another user opens the URL in new browser tab
// THEN: Base64 Encode tool should load with input field pre-filled with "Hello"
// Result: Input preserved end-to-end: "Hello" → URL → "Hello" ✓

// SCENARIO 5: Input Encoding Parameter Restoration (FR-018, FR-021)
// GIVEN: User sets input encoding to "latin-1" and generates share URL
// WHEN: shared URL is opened
// THEN: input_encoding parameter should restore tool setting to "latin-1"
// Result: Setting "latin-1" → URL param input_encoding=latin-1 → restored to "latin-1"

// SCENARIO 6: Tool-Specific Settings Restoration (FR-019, FR-021)
// GIVEN: User enables padding=false in Base32 Decode and generates share URL
// WHEN: shared URL is opened
// THEN: tool should restore with padding=false setting
// Result: Setting "padding=false" → URL param padding=false → restored to false

// SCENARIO 7: Multiple Settings in Single URL
// GIVEN: User configures multiple settings and generates share URL
// WHEN: URL contains input=..., input_encoding=utf-8, padding=false
// THEN: all parameters should be parsed and restored correctly
// Result: All parameters present and parsed

// SCENARIO 8: Missing Input Parameter (Edge Case - FR-022)
// GIVEN: URL without input parameter (e.g., missing or empty)
// WHEN: tool page loads
// THEN: input field should default to empty string
// Result: No error thrown, default applied

// SCENARIO 9: Missing Input Encoding Parameter (Edge Case - FR-022)
// GIVEN: URL without input_encoding parameter
// WHEN: tool page loads
// THEN: input_encoding should default to "utf-8"
// Result: Default "utf-8" applied

// SCENARIO 10: Missing Tool-Specific Settings (Edge Case - FR-022)
// GIVEN: Base32 tool URL without padding parameter
// WHEN: tool page loads
// THEN: padding should default to true (Base32 standard)
// Result: Tool default applied for missing setting

// SCENARIO 11: Invalid Input Parameter (Edge Case)
// GIVEN: URL with invalid Base64 in input parameter (e.g., "input=!!!invalid!!!")
// WHEN: tool page loads
// THEN: input field should default to empty string (graceful fallback)
// Result: Invalid Base64 handled without error

// SCENARIO 12: Invalid Input Encoding Value (Edge Case)
// GIVEN: URL with unknown input_encoding (e.g., "input_encoding=unknown")
// WHEN: tool page loads
// THEN: input_encoding should default to "utf-8"
// Result: Unknown encoding value handled gracefully

// SCENARIO 13: Invalid Tool-Specific Setting Type (Edge Case)
// GIVEN: Base32 tool URL with non-boolean padding (e.g., "padding=maybe")
// WHEN: tool page loads
// THEN: padding should default to true
// Result: Invalid setting type handled gracefully

// SCENARIO 14: Output Parameter Ignored (If Present)
// GIVEN: Share URL somehow contains output parameter (should not, per FR-017)
// WHEN: tool page loads
// THEN: output should be re-computed from input, ignoring URL parameter
// Result: Output parameter ignored, fresh computation performed

// SCENARIO 15: Parameter Order Independence
// GIVEN: Two URLs with same parameters in different order
// Example: ?input=X&input_encoding=Y vs ?input_encoding=Y&input=X
// WHEN: both URLs are parsed
// THEN: tools should load identically regardless of parameter order
// Result: Both URLs produce same tool state

// SCENARIO 16: Duplicate Parameter Handling
// GIVEN: URL with duplicate parameters (edge case: ?input=A&input=B)
// WHEN: tool page loads
// THEN: tool should use standard browser behavior (last value wins)
// Result: No error thrown; last value used

// SCENARIO 17: Very Long Input Parameter (SC-005 Edge Case)
// GIVEN: 1000+ character input generates Base64 near URL limit
// WHEN: URL is generated and opened
// THEN: long input should load successfully
// Result: No URL truncation, all content preserved

// SCENARIO 18: URL Case Sensitivity
// GIVEN: parameter names are used in lowercase (input, input_encoding)
// WHEN: tool parses URL parameters
// THEN: parameters should be parsed case-insensitively (standard URL parsing)
// Result: Parameters found regardless of case

// SCENARIO 19: Parameter Validation Sequence
// GIVEN: URL with all parameters (input, input_encoding, tool-specific)
// WHEN: tool page loads
// THEN: parameters should be validated in order: input → input_encoding → tool-specific
// Result: All parameters validated before tool renders

// SCENARIO 20: Parameter Parsing Performance
// GIVEN: URL with all parameters for specific tool
// WHEN: tool page loads and parameters are parsed
// THEN: parameter parsing should complete within <100ms (FR-013 assumes reasonable performance)
// Result: No noticeable delay in page load

/**
 * CONTRACT: URL Parameter Generation (useShareLink Hook)
 * 
 * These tests define the contract for generating URL query parameters from tool state.
 */

// SCENARIO 21: Parameter Generation for Base64 Encode
// GIVEN: Base64 Encode tool with input="test", input_encoding="utf-8"
// WHEN: useShareLink generates parameters
// THEN: parameters should be: { input: "dGVzdA==", input_encoding: "utf-8" }
// Result: Correct parameter generation

// SCENARIO 22: Parameter Generation for Base32 with Settings
// GIVEN: Base32 Encode tool with input="data", input_encoding="utf-8", padding=false
// WHEN: useShareLink generates parameters
// THEN: parameters should include all three: input, input_encoding, padding
// Result: Complete parameter set generated

// SCENARIO 23: Base64 Input Encoding
// GIVEN: Any input text from tool state
// WHEN: parameters are generated
// THEN: input text should be Base64-encoded
// Result: Input always Base64-encoded in parameters

// SCENARIO 24: Input Encoding Parameter
// GIVEN: Tool's input_encoding setting
// WHEN: parameters are generated
// THEN: input_encoding parameter should match tool's current setting
// Result: Setting accurately reflected in parameters

// SCENARIO 25: Selective Parameter Inclusion
// GIVEN: Tool with optional settings (e.g., Base32's padding)
// WHEN: parameters are generated
// THEN: only applicable tool-specific settings should be included
// Result: No extraneous parameters for tools that don't use them

// SCENARIO 26: Empty Input Handling
// GIVEN: Tool with empty input field
// WHEN: Share button generates URL
// THEN: input parameter should be empty or empty Base64 representation
// Result: Empty input handled correctly

// SCENARIO 27: Parameter Generation Performance
// GIVEN: Tool state ready for URL generation
// WHEN: useShareLink generates parameters
// THEN: generation should complete within <100ms
// Result: No noticeable delay in Share button response

/**
 * VALIDATION RULES FOR ACCEPTANCE
 * 
 * URL Parameter Round-Trip (Acceptance Scenario 2):
 * ✓ Input text preserved: Enter "Hello" → generate URL → open URL → displays "Hello"
 * ✓ Input encoding preserved: Set "latin-1" → URL param → restored to "latin-1"
 * ✓ Tool settings preserved: Set padding=false → URL param → restored to false
 * ✓ All parameters functional: Every parameter in URL affects tool state correctly
 * 
 * Input Encoding Strategy (FR-017, FR-018):
 * ✓ Input text is Base64-encoded in URL parameters (safe, compact)
 * ✓ Input encoding is preserved as "utf-8" | "ascii" | "latin-1"
 * ✓ Output is NOT included (computed fresh on load)
 * ✓ Tool-specific settings preserved as additional parameters
 * 
 * Graceful Degradation (FR-022):
 * ✓ Missing parameters default to tool's standard defaults
 * ✓ Invalid parameters treated as missing (no error)
 * ✓ Invalid encoding defaults to "utf-8"
 * ✓ Invalid boolean settings default to standard value
 * 
 * URL Validity (Acceptance Scenario 3, SC-005):
 * ✓ Generated URLs are syntactically valid (no corruption)
 * ✓ URLs remain under 2000 character limit for typical inputs
 * ✓ Special characters and Unicode properly encoded
 * ✓ 95% of URLs successfully reproduce tool state
 * 
 * Performance (Implicit Requirement):
 * ✓ Parameter generation: <100ms
 * ✓ Parameter parsing: <100ms
 * ✓ Share button response: responsive (appears immediately)
 */
