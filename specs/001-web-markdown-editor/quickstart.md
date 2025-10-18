# Quick Start Guide: Web Markdown Editor

**Feature**: 001-web-markdown-editor
**Date**: 2025-10-17
**Purpose**: Get the markdown editor up and running quickly

---

## Prerequisites

- **Node.js**: v18.0+ (for Vite and Vitest)
- **npm**: v9.0+ (comes with Node.js)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

---

## Installation

### Step 1: Initialize the Project

```bash
# Create project directory (if not already in project root)
mkdir markdown-editor
cd markdown-editor

# Initialize Vite project with vanilla JavaScript
npm create vite@latest . -- --template vanilla

# Install dependencies
npm install
```

### Step 2: Install Required Dependencies

```bash
# Install markdown parser
npm install marked

# Install testing framework (dev dependencies)
npm install -D vitest @vitest/ui jsdom
```

### Step 3: Configure Vitest

Create `vitest.config.js` in project root:

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
});
```

### Step 4: Update package.json Scripts

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Project Structure Setup

Create the following directory structure:

```bash
mkdir -p src/{models,services,components,utils}
mkdir -p tests/{unit/{models,services,components},integration}
mkdir -p public
```

Your structure should look like:

```
markdown-editor/
├── src/
│   ├── models/
│   ├── services/
│   ├── components/
│   ├── utils/
│   └── app.js
├── public/
│   └── index.html
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── vite.config.js
└── vitest.config.js
```

---

## Development

### Start Development Server

```bash
npm run dev
```

This starts Vite dev server at `http://localhost:5173` with hot module replacement (HMR).

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Build for Production

```bash
npm run build
```

Outputs optimized production build to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

---

## Basic Implementation Example

### 1. Create Document Model

`src/models/Document.js`:

```javascript
export class Document {
  constructor({ id, filename, content = '', created, modified }) {
    this.id = id || crypto.randomUUID();
    this.filename = filename;
    this.content = content;
    this.created = created || Date.now();
    this.modified = modified || this.created;
    this.size = new Blob([content]).size;
  }

  toJSON() {
    return {
      id: this.id,
      filename: this.filename,
      content: this.content,
      created: this.created,
      modified: this.modified,
      size: this.size
    };
  }
}
```

### 2. Create Storage Service

`src/services/storageService.js`:

```javascript
const STORAGE_PREFIX = 'md-editor';
const INDEX_KEY = `${STORAGE_PREFIX}:index`;

export const storageService = {
  async saveDocument(document) {
    try {
      const key = `${STORAGE_PREFIX}:doc:${document.id}`;
      localStorage.setItem(key, JSON.stringify(document));
      await this.updateIndex(document);
      return { success: true };
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        return { success: false, error: 'QUOTA_EXCEEDED' };
      }
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  },

  async getDocument(id) {
    const key = `${STORAGE_PREFIX}:doc:${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  async deleteDocument(id) {
    try {
      const key = `${STORAGE_PREFIX}:doc:${id}`;
      localStorage.removeItem(key);
      await this.removeFromIndex(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'UNKNOWN_ERROR' };
    }
  },

  async listDocuments() {
    const indexData = localStorage.getItem(INDEX_KEY);
    if (indexData) {
      const index = JSON.parse(indexData);
      return index.documents || [];
    }
    return [];
  },

  async updateIndex(document) {
    const index = await this.getIndex();
    const existing = index.documents.findIndex(d => d.id === document.id);

    const metadata = {
      id: document.id,
      filename: document.filename,
      created: document.created,
      modified: document.modified,
      size: document.size
    };

    if (existing >= 0) {
      index.documents[existing] = metadata;
    } else {
      index.documents.push(metadata);
    }

    index.documents.sort((a, b) => b.modified - a.modified);
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  },

  async removeFromIndex(id) {
    const index = await this.getIndex();
    index.documents = index.documents.filter(d => d.id !== id);
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  },

  async getIndex() {
    const data = localStorage.getItem(INDEX_KEY);
    return data ? JSON.parse(data) : { documents: [] };
  }
};
```

### 3. Create Markdown Service

`src/services/markdownService.js`:

```javascript
import { marked } from 'marked';

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});

export const markdownService = {
  renderToHTML(markdown) {
    return marked.parse(markdown);
  },

  getSupportedSyntax() {
    return [
      'headings',
      'bold',
      'italic',
      'strikethrough',
      'lists',
      'links',
      'images',
      'code',
      'blockquotes',
      'horizontal-rules'
    ];
  }
};
```

### 4. Create Main HTML

`public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Editor</title>
</head>
<body>
  <div id="app">
    <div class="toolbar">
      <button id="newBtn">New</button>
      <button id="saveBtn">Save</button>
      <button id="filesBtn">Files</button>
    </div>

    <div class="editor-container">
      <div class="editor-pane">
        <textarea id="editor" placeholder="Start typing markdown..."></textarea>
      </div>
      <div class="preview-pane">
        <div id="preview"></div>
      </div>
    </div>
  </div>

  <script type="module" src="/src/app.js"></script>
</body>
</html>
```

### 5. Create Main App

`src/app.js`:

```javascript
import { Document } from './models/Document.js';
import { storageService } from './services/storageService.js';
import { markdownService } from './services/markdownService.js';

let currentDocument = null;
let debounceTimer = null;

// DOM elements
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const newBtn = document.getElementById('newBtn');
const saveBtn = document.getElementById('saveBtn');

// Initialize
newDocument();

// Event listeners
editor.addEventListener('input', handleEditorInput);
newBtn.addEventListener('click', newDocument);
saveBtn.addEventListener('click', saveDocument);

function handleEditorInput(event) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderPreview(event.target.value);
  }, 150);
}

function renderPreview(markdown) {
  preview.innerHTML = markdownService.renderToHTML(markdown);
}

function newDocument() {
  currentDocument = new Document({
    filename: 'untitled.md'
  });
  editor.value = '';
  preview.innerHTML = '';
  editor.focus();
}

async function saveDocument() {
  const filename = prompt('Enter filename:', currentDocument?.filename || 'untitled.md');
  if (!filename) return;

  const doc = new Document({
    id: currentDocument?.id,
    filename: filename.endsWith('.md') ? filename : `${filename}.md`,
    content: editor.value,
    created: currentDocument?.created,
    modified: Date.now()
  });

  const result = await storageService.saveDocument(doc.toJSON());

  if (result.success) {
    currentDocument = doc;
    alert('Document saved!');
  } else {
    alert(`Save failed: ${result.error}`);
  }
}
```

---

## Verification

### Test the Basic Flow

1. **Start dev server**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:5173`
3. **Type markdown**: Enter `# Hello World` in the editor
4. **Verify preview**: Should see rendered HTML in preview pane
5. **Save document**: Click "Save", enter filename "test.md"
6. **Refresh page**: Reload browser
7. **Verify persistence**: (After implementing file list) Document should be loadable

### Run Tests

Create a simple test in `tests/unit/models/Document.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { Document } from '../../../src/models/Document.js';

describe('Document', () => {
  it('should create a document with generated ID', () => {
    const doc = new Document({ filename: 'test.md', content: 'Hello' });
    expect(doc.id).toBeDefined();
    expect(doc.filename).toBe('test.md');
    expect(doc.content).toBe('Hello');
  });

  it('should calculate size correctly', () => {
    const doc = new Document({ filename: 'test.md', content: 'Hello' });
    expect(doc.size).toBeGreaterThan(0);
  });
});
```

Run: `npm test`

---

## Next Steps

After basic setup:

1. Implement File List component
2. Add Delete Confirmation dialog
3. Implement Save Dialog with filename validation
4. Add keyboard shortcuts (Ctrl+S for save)
5. Implement mobile-responsive layout
6. Add storage quota monitoring
7. Write integration tests for user flows

Refer to `contracts/service-interfaces.md` for complete API specifications.

---

## Troubleshooting

**Issue**: Tests fail with "localStorage is not defined"
- **Solution**: Ensure `vitest.config.js` has `environment: 'jsdom'`

**Issue**: HMR not working
- **Solution**: Check Vite is running and browser console for errors

**Issue**: marked.js import fails
- **Solution**: Verify `npm install marked` was run successfully

**Issue**: Storage quota exceeded
- **Solution**: Clear LocalStorage via browser DevTools → Application → LocalStorage
