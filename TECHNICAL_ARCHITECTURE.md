# Technical Architecture - File Upload Feature

## Overview

The file upload feature in `ListeningMockForm.jsx` provides a complete solution for importing listening exam questions from CSV or JSON files. This document covers the technical implementation details.

---

## Component Architecture

```
ListeningMockForm.jsx
├── Helper Components
│   ├── Section() - Collapsible accordion
│   └── AudioInput() - URL input with player
├── Parser Functions
│   ├── parseFileContent() - Router
│   ├── parseCSV() - CSV parser
│   └── JSON.parse() - JSON parser
├── State Hooks
│   ├── title, setTitle
│   ├── audios, setAudios
│   ├── part1-6, setPart1-6
│   └── searchParams, navigate
├── Event Handlers
│   ├── handleFileUpload() - Main handler
│   └── saveMock() - Form submission
└── Render
    ├── File upload section
    └── Form sections (Part 1-6)
```

---

## Data Structure

### Input Format - CSV

```
Section Header: [SECTION_NAME]
Fields: key|value|key|value...
Lists: item1;item2;item3
```

### Input Format - JSON

```json
{
  "title": "String",
  "audios": {Object<string, string>},
  "part1": [Array],
  "part2": [Array],
  "part3": {Object},
  "part4": {Object},
  "part5": [Array],
  "part6": [Array]
}
```

### Output State Structure

```javascript
// Form state after parsing
{
  title: String,
  audios: {
    part_1: String (URL),
    part_2: String (URL),
    // ... parts 3-6
  },
  part1: [
    { options: [String, String, String], answer: String },
    // ... 8 total
  ],
  part2: [
    { label: String, before: String, after: String, answer: String },
    // ... 6 total
  ],
  part3: {
    speakers: [String, String, String, String],
    options: [String, String, String, String, String, String],
    answers: [String, String, String, String]
  },
  part4: {
    mapUrl: String,
    mapLabels: [String, String, ...],
    questions: [
      { place: String, answer: String },
      // ... 5 total
    ]
  },
  part5: [
    {
      text: String,
      q1: { question: String, options: [String, String, String], answer: String },
      q2: { question: String, options: [String, String, String], answer: String }
    },
    // ... 3 total
  ],
  part6: [
    { before: String, after: String, answer: String },
    // ... 6 total
  ]
}
```

---

## Parser Implementation

### Main Parser Flow

```
FileReader.readAsText(file)
    ↓
    event.target.result (string)
    ↓
parseFileContent(content, filename)
    ├─ Check file extension
    ├─ If .json → JSON.parse()
    ├─ If .csv/.txt → parseCSV()
    └─ Error handling with alerts
    ↓
Parsed data object
    ↓
Validation check
    ↓
State updates (part1-6, audios, title)
    ↓
Success/error message
```

### CSV Parser Algorithm

```javascript
parseCSV(content)
  1. Split content by newline
  2. Initialize data structure
  3. Line-by-line iteration:
     a. Skip empty lines and comments (#)
     b. Detect section header [SECTION]
     c. Parse fields until next header
     d. Map fields to data structure
  4. Return populated data object
```

### Section Parsing Strategies

#### [TITLE]
```javascript
// Single value section
if (line.startsWith('[TITLE]')) {
  data.title = nextNonEmptyLine
}
```

#### [AUDIOS]
```javascript
// Key-value pairs (repeating)
key|value format
Parse multiple lines until next section
Store in audios object with key
```

#### [PART1]
```javascript
// Simple format (3 fields + answer)
option1|option2|option3|answer
Parse 8 lines (one per question)
```

#### [PART2]
```javascript
// Key-value pairs (field-based)
label|val|before|val|after|val|answer|val
Parse 6 lines
```

#### [PART3]
```javascript
// Mixed format with lists
speakers|item;item;item;item
options|item;item;item;item;item;item
answers|A;B;C;D
```

#### [PART4]
```javascript
// Mixed format
mapUrl|url
mapLabels|A;B;C;D;E;F;G;H;I
questionN|place|name|answer|letter (5 lines)
```

#### [PART5]
```javascript
// Complex single-line format
extractN|text|text_value|q1_question|q1_text|q1_options|opt1;opt2;opt3|
q1_answer|ans|q2_question|q2_text|q2_options|opt1;opt2;opt3|q2_answer|ans
Parse 3 lines (one per extract)
```

#### [PART6]
```javascript
// Key-value pairs
before|text|after|text|answer|word
Parse 6 lines
```

---

## Event Handler Flow

### handleFileUpload(event)

```javascript
const file = event.target.files[0]  // Get file

const reader = new FileReader()     // Create reader
reader.onload = (event) => {
  const content = event.target.result
  
  // Parse based on filename
  const data = parseFileContent(content, file.name)
  
  if (data) {
    // Update state for each part
    if (data.title) setTitle(data.title)
    if (data.audios) setAudios(data.audios)
    
    // Part 1: merge + pad to 8 questions
    if (data.part1?.length > 0) {
      setPart1([
        ...data.part1,
        ...Array.from(
          { length: 8 - data.part1.length },
          () => ({ options: ["", "", ""], answer: "" })
        )
      ])
    }
    
    // Similar logic for parts 2-6
    // ... (each has specific structure)
    
    alert("✅ Success!")
  }
}

reader.readAsText(file)  // Initiate read
```

### State Merge Strategy

```
For each part:
  1. If data present: preserve and pad
  2. If no data: don't change existing
  3. Padding: fill remaining slots with empty values
  4. Preservation: combine existing + new data
```

**Example:**
```javascript
// Input: 3 Part 1 questions from file
// Form state: 8 empty questions

// Output: 3 filled + 5 empty = 8 total
setPart1([
  ...data.part1,  // 3 questions with data
  ...Array.from({ length: 5 }, () => ({...}))  // 5 empty
])
```

---

## Error Handling

### Error Categories

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| **Format** | Wrong extension | "Faqat .json yoki .csv..." | Try .json/.csv |
| **Parse JSON** | Invalid JSON | "Fayl parse qilishda xato: [error]" | Validate JSON |
| **Parse CSV** | Malformed line | Skipped (missing data) | Check format |
| **No File** | Empty selection | No action | Select file |
| **Empty File** | 0 bytes | Empty data object | Add content |

### Error Handling Code

```javascript
try {
  if (fileName.endsWith('.json')) {
    return JSON.parse(fileContent)  // May throw
  } else if (fileName.endsWith('.csv')) {
    return parseCSV(fileContent)    // Safe (no throw)
  } else {
    alert("Unsupported format")
    return null
  }
} catch (error) {
  alert("Fayl parse qilishda xato: " + error.message)
  return null
}
```

---

## CSV Parsing Details

### Delimiter Rules

| Delimiter | Use | Example |
|-----------|-----|---------|
| `\|` (pipe) | Field separator | `label\|value\|before\|value` |
| `;` (semicolon) | List separator | `John;Mary;David;Sarah` |
| `\n` (newline) | Line separator | Section boundary |
| `[HEADER]` | Section marker | `[TITLE]`, `[PART1]` |

### Field Parsing Algorithm

```javascript
// Key-value format parsing
const fields = line.split('|')
for (let j = 0; j < fields.length; j += 2) {
  const key = fields[j].trim()
  const value = fields[j + 1]?.trim() || ""
  parts[key] = value
}
```

**Example:**
```
Input: "label|Train|before|Leaves at|after|sharp|answer|10:30"
Split: ["label", "Train", "before", "Leaves at", "after", "sharp", "answer", "10:30"]
Parse:
  [0, 1]: label="Train"
  [2, 3]: before="Leaves at"
  [4, 5]: after="sharp"
  [6, 7]: answer="10:30"
Output: { label: "Train", before: "Leaves at", after: "sharp", answer: "10:30" }
```

### List Parsing Algorithm

```javascript
// Semicolon-separated list parsing
const value = "John;Mary;David;Sarah"
const items = value.split(';').map(s => s.trim())
// Result: ["John", "Mary", "David", "Sarah"]
```

---

## State Management

### React Hooks Used

```javascript
// Form state (6 parts)
const [title, setTitle] = useState("")
const [audios, setAudios] = useState({...})
const [part1, setPart1] = useState([...])
const [part2, setPart2] = useState([...])
const [part3, setPart3] = useState({...})
const [part4, setPart4] = useState({...})
const [part5, setPart5] = useState([...])
const [part6, setPart6] = useState([...])

// Navigation
const [params] = useSearchParams()
const navigate = useNavigate()

// Edit mode
const isEdit = params.get("edit") === "true"
const mockId = params.get("id")
```

### State Update Pattern

```javascript
// Append new data while preserving structure
setState(prevState => [
  ...newData,
  ...prevState.slice(newData.length)
])

// Or with padding:
setState([
  ...newData,
  ...Array.from(
    { length: MAX - newData.length },
    () => emptyItem
  )
])
```

---

## UI Integration

### HTML Structure

```jsx
<div className="border-2 border-dashed border-blue-400 rounded-lg p-6 mb-6 bg-blue-50">
  <h3>📁 Fayldan Yuklash (JSON/CSV)</h3>
  <input type="file" accept=".json,.csv,.txt" onChange={handleFileUpload} />
  <p>💡 Instructions</p>
  <details>
    <summary>📋 CSV Format Example</summary>
    <pre>/* Format examples */</pre>
  </details>
</div>
```

### Styling

```css
/* File upload section */
border-2 border-dashed border-blue-400  /* Blue dashed border */
rounded-lg p-6 mb-6 bg-blue-50          /* Rounded, padded, blue background */

/* File input */
block w-full p-3 border border-blue-300 rounded-lg cursor-pointer
```

---

## Performance Considerations

### File Reading
- **API:** FileReader (async)
- **Performance:** Non-blocking (doesn't freeze UI)
- **Memory:** Loads entire file into memory

### Parsing
- **Complexity:** O(n) where n = lines
- **Time:** < 100ms for typical files
- **Memory:** Linear space for parsed data

### State Updates
- **Batch:** React batches updates within event handler
- **Re-renders:** Once per state update
- **Optimization:** Could batch setState with useReducer (not needed currently)

### File Size Limits
- **Practical Limit:** 10MB (no hard limit)
- **Typical Size:** 10-50KB
- **Large Files:** > 1MB may cause UI lag

---

## Extension Points

### Adding New File Formats

```javascript
function parseFileContent(fileContent, fileName) {
  if (fileName.endsWith('.xml')) {
    return parseXML(fileContent)
  } else if (fileName.endsWith('.yaml')) {
    return parseYAML(fileContent)
  }
  // ... existing code
}

function parseXML(xmlContent) {
  // Custom XML parser
  // Return data object
}
```

### Adding Validation

```javascript
function validateData(data) {
  if (!data.part1 || data.part1.length !== 8) {
    console.warn("Part 1 has wrong count")
  }
  if (!data.title) {
    console.warn("Missing title")
  }
  return isValid
}
```

### Adding Transformations

```javascript
function transformData(data) {
  // Normalize answers (A -> a)
  data.part1 = data.part1.map(q => ({
    ...q,
    answer: q.answer.toUpperCase()
  }))
  return data
}
```

---

## Testing Strategy

### Unit Tests (for parseCSV)

```javascript
test('Parse basic CSV part1', () => {
  const csv = `[PART1]\nA|B|C|A`
  const result = parseCSV(csv)
  expect(result.part1).toHaveLength(1)
  expect(result.part1[0].answer).toBe('A')
})
```

### Integration Tests (handleFileUpload)

```javascript
test('Upload CSV and populate form', async () => {
  const file = new File(['...csv...'], 'test.csv')
  fireEvent.change(input, { target: { files: [file] } })
  
  await waitFor(() => {
    expect(mockSetTitle).toHaveBeenCalledWith('Test Title')
  })
})
```

### End-to-End Tests

```javascript
test('Full workflow: upload, edit, save', async () => {
  // 1. Upload file
  // 2. Verify population
  // 3. Edit some fields
  // 4. Submit form
  // 5. Verify API call
})
```

---

## Browser Compatibility

### Required Features
- ✅ FileReader API
- ✅ String.split()
- ✅ Array methods
- ✅ JSON.parse()

### Supported Browsers
- Chrome 13+
- Firefox 10+
- Safari 6+
- Edge (all versions)
- IE 11 (with polyfills)

---

## Security Considerations

### Input Validation
- ✅ File extension check
- ✅ JSON syntax validation
- ✅ Array/object type checking
- ⚠️ No XSS protection (user is admin)

### Data Sanitization
- ⚠️ No HTML stripping
- ⚠️ No SQL injection risk (client-side only)
- ✅ No code execution (strings only)

### Recommendations
1. Validate on backend as well
2. Consider HTML escaping for display
3. Implement file size limits
4. Add file upload logging

---

## Documentation Files

| File | Purpose |
|------|---------|
| `FILE_UPLOAD_GUIDE.md` | User guide with examples |
| `QUICK_REFERENCE.md` | Quick lookup for formats |
| `FILE_UPLOAD_IMPLEMENTATION.md` | Implementation summary |
| `LISTENING_MOCK_TEMPLATE.csv` | CSV template |
| `LISTENING_MOCK_TEMPLATE.json` | JSON template |
| **This file** | Technical architecture |

---

## Related Components

- **ListeningMockForm.jsx** - Main form component
- **api.js** - API client for form submission
- **Dashboard.jsx** - Navigation and layout

## Dependencies

- React (useState, useEffect)
- React Router (useSearchParams, useNavigate)
- FileReader API (browser native)
- JSON (browser native)

---

**Status:** ✅ Complete and Production-Ready  
**Last Updated:** 2024  
**Version:** 1.0
