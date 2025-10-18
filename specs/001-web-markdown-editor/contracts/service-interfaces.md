# Service Contracts: Web Markdown Editor

**Feature**: 001-web-markdown-editor
**Date**: 2025-10-17
**Purpose**: Define internal service interfaces for the markdown editor application

---

## Overview

This document defines the contracts (interfaces) for internal services in the markdown editor. Since this is a client-side-only application, these are JavaScript module interfaces rather than HTTP APIs.

---

## StorageService

**Module**: `src/services/storageService.js`
**Purpose**: Manage document persistence to browser LocalStorage

### Methods

#### `saveDocument(document: Document): Promise<{success: boolean, error?: string}>`

Save or update a document in LocalStorage.

**Parameters**:
- `document`: Document object (see data-model.md)

**Returns**:
- `Promise<{success: true}>` on success
- `Promise<{success: false, error: string}>` on failure

**Behavior**:
1. Validate document fields
2. Check storage quota availability
3. Save document to `localStorage['md-editor:doc:{id}']`
4. Update document index
5. Return result

**Errors**:
- `"QUOTA_EXCEEDED"`: Storage quota exceeded
- `"INVALID_DOCUMENT"`: Document validation failed
- `"STORAGE_UNAVAILABLE"`: LocalStorage not available/disabled

**Example**:
```javascript
const result = await storageService.saveDocument({
  id: crypto.randomUUID(),
  filename: "notes.md",
  content: "# My Notes",
  created: Date.now(),
  modified: Date.now(),
  size: 12
});
// {success: true} or {success: false, error: "QUOTA_EXCEEDED"}
```

---

#### `getDocument(id: string): Promise<Document | null>`

Retrieve a document by ID from LocalStorage.

**Parameters**:
- `id`: Document UUID

**Returns**:
- `Promise<Document>` if found
- `Promise<null>` if not found

**Behavior**:
1. Read from `localStorage['md-editor:doc:{id}']`
2. Parse JSON
3. Validate structure
4. Return document or null

**Example**:
```javascript
const doc = await storageService.getDocument("550e8400-e29b-41d4-a716-446655440000");
// { id: "...", filename: "notes.md", content: "...", ... } or null
```

---

#### `deleteDocument(id: string): Promise<{success: boolean, error?: string}>`

Delete a document from LocalStorage.

**Parameters**:
- `id`: Document UUID

**Returns**:
- `Promise<{success: true}>` on success
- `Promise<{success: false, error: string}>` on failure

**Behavior**:
1. Remove from `localStorage['md-editor:doc:{id}']`
2. Update index to remove metadata
3. Return result

**Errors**:
- `"NOT_FOUND"`: Document doesn't exist
- `"STORAGE_UNAVAILABLE"`: LocalStorage not available

**Example**:
```javascript
const result = await storageService.deleteDocument("550e8400-e29b-41d4-a716-446655440000");
// {success: true} or {success: false, error: "NOT_FOUND"}
```

---

#### `listDocuments(): Promise<DocumentMetadata[]>`

Get list of all saved documents (metadata only).

**Parameters**: None

**Returns**:
- `Promise<DocumentMetadata[]>`: Array of document metadata, sorted by modified date (newest first)

**Behavior**:
1. Read index from `localStorage['md-editor:index']`
2. If missing/corrupt, rebuild from all documents
3. Return metadata array

**Example**:
```javascript
const docs = await storageService.listDocuments();
// [
//   { id: "...", filename: "notes.md", created: 123456, modified: 123456, size: 100 },
//   { id: "...", filename: "todo.md", created: 123400, modified: 123400, size: 50 }
// ]
```

---

#### `getStorageStats(): Promise<{used: number, total: number, percentage: number}>`

Get current storage usage statistics.

**Parameters**: None

**Returns**:
- `Promise<{used, total, percentage}>`: Storage usage info in bytes

**Behavior**:
1. Calculate total size of all documents
2. Estimate total available quota (typically 5-10MB)
3. Return usage statistics

**Example**:
```javascript
const stats = await storageService.getStorageStats();
// { used: 102400, total: 5242880, percentage: 1.95 }
```

---

## MarkdownService

**Module**: `src/services/markdownService.js`
**Purpose**: Parse and render markdown to HTML

### Methods

#### `renderToHTML(markdown: string): string`

Convert markdown text to sanitized HTML.

**Parameters**:
- `markdown`: Markdown source text

**Returns**:
- `string`: Rendered HTML (sanitized to prevent XSS)

**Behavior**:
1. Parse markdown using marked.js
2. Sanitize output to prevent script injection
3. Return HTML string

**Performance**: Must complete in <100ms for documents up to 100KB

**Example**:
```javascript
const html = markdownService.renderToHTML("# Hello\n\n**World**");
// "<h1>Hello</h1>\n<p><strong>World</strong></p>"
```

---

#### `getSupportedSyntax(): string[]`

Get list of supported markdown syntax features.

**Parameters**: None

**Returns**:
- `string[]`: Array of supported syntax names

**Example**:
```javascript
const syntax = markdownService.getSupportedSyntax();
// ["headings", "bold", "italic", "lists", "links", "images", "code", "blockquotes"]
```

---

## ValidationService

**Module**: `src/services/validationService.js`
**Purpose**: Validate filenames and document data

### Methods

#### `validateFilename(filename: string, existingFilenames?: string[]): {valid: boolean, error?: string}`

Validate a document filename.

**Parameters**:
- `filename`: Filename to validate
- `existingFilenames`: Optional array of existing filenames (to check uniqueness)

**Returns**:
- `{valid: true}` if valid
- `{valid: false, error: string}` if invalid

**Validation Rules**:
- Must match `/^[a-zA-Z0-9_\-\.]+\.md$/`
- Length: 1-255 characters
- Must be unique if `existingFilenames` provided
- No whitespace or special characters

**Errors**:
- `"EMPTY_FILENAME"`: Filename is empty
- `"INVALID_CHARACTERS"`: Contains invalid characters
- `"TOO_LONG"`: Exceeds 255 characters
- `"MISSING_EXTENSION"`: Doesn't end with `.md`
- `"DUPLICATE"`: Filename already exists

**Example**:
```javascript
const result = validationService.validateFilename("my-notes.md", ["todo.md"]);
// {valid: true}

const result2 = validationService.validateFilename("my notes.md");
// {valid: false, error: "INVALID_CHARACTERS"}
```

---

#### `validateDocument(document: Partial<Document>): {valid: boolean, errors: string[]}`

Validate a complete document object.

**Parameters**:
- `document`: Document object to validate

**Returns**:
- `{valid: true, errors: []}` if valid
- `{valid: false, errors: string[]}` if invalid

**Validation Checks**:
- `id` is valid UUID
- `filename` passes filename validation
- `content` is string and <1MB
- `created` and `modified` are valid timestamps
- `modified >= created`

**Example**:
```javascript
const result = validationService.validateDocument({
  id: "invalid-id",
  filename: "test.md",
  content: "Hello",
  created: Date.now(),
  modified: Date.now()
});
// {valid: false, errors: ["Invalid UUID format for id"]}
```

---

## Component Interfaces

### Editor Component

**Module**: `src/components/Editor.js`

**Events Emitted**:
- `content-changed`: Fired when editor content changes
  - Payload: `{content: string}`
- `save-requested`: Fired when user requests save (Ctrl+S)
  - Payload: `{content: string}`

**Methods**:
- `setContent(content: string): void` - Set editor content
- `getContent(): string` - Get current editor content
- `focus(): void` - Focus the editor

---

### Preview Component

**Module**: `src/components/Preview.js`

**Methods**:
- `render(markdown: string): void` - Render markdown as HTML preview
- `scrollToTop(): void` - Scroll preview to top

---

### FileList Component

**Module**: `src/components/FileList.js`

**Events Emitted**:
- `document-selected`: Fired when user clicks a document
  - Payload: `{id: string, filename: string}`
- `delete-requested`: Fired when user requests deletion
  - Payload: `{id: string, filename: string}`
- `new-document`: Fired when user clicks "New Document"

**Methods**:
- `loadDocuments(docs: DocumentMetadata[]): void` - Update file list
- `highlightDocument(id: string): void` - Highlight active document
- `refresh(): Promise<void>` - Reload file list from storage

---

### SaveDialog Component

**Module**: `src/components/SaveDialog.js`

**Events Emitted**:
- `save-confirmed`: Fired when user confirms save
  - Payload: `{filename: string, overwrite: boolean}`
- `save-cancelled`: Fired when user cancels

**Methods**:
- `show(currentFilename?: string): void` - Show save dialog
- `hide(): void` - Hide save dialog

---

### DeleteConfirmation Component

**Module**: `src/components/DeleteConfirmation.js`

**Events Emitted**:
- `delete-confirmed`: Fired when user confirms deletion
  - Payload: `{id: string}`
- `delete-cancelled`: Fired when user cancels

**Methods**:
- `show(filename: string, id: string): void` - Show confirmation
- `hide(): void` - Hide confirmation

---

## Error Handling Contract

All services must return errors in a consistent format:

```javascript
{
  success: false,
  error: "ERROR_CODE",
  message: "Human-readable error message"
}
```

**Standard Error Codes**:
- `QUOTA_EXCEEDED`: Storage quota exceeded
- `STORAGE_UNAVAILABLE`: LocalStorage disabled/unavailable
- `INVALID_DOCUMENT`: Document validation failed
- `NOT_FOUND`: Document not found
- `DUPLICATE`: Duplicate filename
- `UNKNOWN_ERROR`: Unexpected error occurred

---

## Testing Contracts

All services and components must provide test doubles (mocks) for unit testing:

**Example Mock**:
```javascript
// tests/mocks/storageService.mock.js
export const mockStorageService = {
  saveDocument: vi.fn().mockResolvedValue({success: true}),
  getDocument: vi.fn().mockResolvedValue(null),
  deleteDocument: vi.fn().mockResolvedValue({success: true}),
  listDocuments: vi.fn().mockResolvedValue([]),
  getStorageStats: vi.fn().mockResolvedValue({used: 0, total: 5242880, percentage: 0})
};
```
