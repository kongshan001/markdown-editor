# Research & Technical Decisions: Web Markdown Editor

**Feature**: 001-web-markdown-editor
**Date**: 2025-10-17
**Purpose**: Resolve technical unknowns identified in plan.md Technical Context

---

## Decision 1: Language Choice - Vanilla JavaScript vs TypeScript

**Decision**: Use vanilla JavaScript (ES6+) without TypeScript

**Rationale**:
- Simpler setup with no build/transpilation step required
- Faster development for a small-to-medium single-page application
- Modern ES6+ features provide sufficient type safety through JSDoc comments
- Browser-native support without tooling overhead
- Easier for potential contributors to understand and modify

**Alternatives Considered**:
- **TypeScript**: Provides stronger type safety and better IDE support, but adds build complexity, requires compilation step, and increases initial setup time. For this project's scope (single-page app with ~10 modules), the overhead outweighs benefits.
- **ES5 JavaScript**: Better browser compatibility, but lacks modern features like modules, arrow functions, and classes that improve code readability and maintainability.

**Implementation Notes**:
- Use ES6 modules (`import`/`export`)
- Target modern browsers (last 2 versions) - no IE11 support needed
- Add JSDoc comments for function signatures to aid IDE autocomplete

---

## Decision 2: Markdown Parser Library

**Decision**: Use **marked.js** (https://github.com/markedjs/marked)

**Rationale**:
- Lightweight (~25KB minified) and fast
- Well-established library with 30k+ GitHub stars, active maintenance
- Simple API - converts markdown to HTML in one function call
- Supports all standard markdown syntax required by FR-003
- Built-in sanitization options to prevent XSS attacks
- No dependencies - works standalone in browser
- Performance: Can parse 100KB markdown in <50ms (well under our 100ms requirement)

**Alternatives Considered**:
- **markdown-it**: More extensible with plugins, but heavier (~45KB) and more complex API than needed for this use case
- **showdown**: Older library, less actively maintained, similar features but slower performance
- **CommonMark**: Spec-compliant but overkill for basic markdown rendering needs

**Implementation Notes**:
- Load from CDN: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`
- Configure with `{ breaks: true, gfm: true }` for GitHub-flavored markdown
- Enable sanitize option to prevent XSS: `{ sanitize: true }`

---

## Decision 3: Testing Framework

**Decision**: Use **Vitest** for unit and integration testing

**Rationale**:
- Fast test execution with native ES6 module support
- Compatible with modern JavaScript without transpilation
- Excellent developer experience with watch mode and UI
- Can test browser-specific code (LocalStorage) with jsdom environment
- Growing ecosystem and active development
- Simpler configuration than Jest for ES6 modules

**Alternatives Considered**:
- **Jest**: Industry standard, but requires more configuration for ES6 modules; slower test execution; heavier dependency footprint
- **Browser-native testing (no framework)**: Zero dependencies, but lacks assertion library, mocking utilities, and test runner features that speed up development
- **Mocha + Chai**: Flexible but requires manual setup of assertion library, test runner, and coverage tools

**Implementation Notes**:
- Install as dev dependency: `npm install -D vitest @vitest/ui`
- Configure for jsdom environment to test LocalStorage interactions
- Use Vitest's built-in assertions and mocking (`vi.mock()`)
- Set up coverage reporting with `c8` or Vitest's built-in coverage

---

## Decision 4: Build Tool & Development Setup

**Decision**: Use **Vite** as development server and build tool

**Rationale**:
- Lightning-fast hot module replacement (HMR) for instant feedback
- Zero-config setup for vanilla JavaScript projects
- Native ES6 module support - no transpilation during development
- Production builds with optimized bundling and minification
- Built-in development server with HTTPS support
- Pairs perfectly with Vitest (same ecosystem)
- Minimal configuration required

**Alternatives Considered**:
- **No build tool (serve files directly)**: Simplest approach, but no HMR, no minification, no module bundling for production, harder to manage dependencies
- **Webpack**: More mature and configurable, but significantly more complex setup, slower build times, steeper learning curve
- **Parcel**: Zero-config like Vite, but slower HMR and less active development

**Implementation Notes**:
- Initialize with: `npm create vite@latest . -- --template vanilla`
- Development: `npm run dev`
- Production build: `npm run build` → outputs to `dist/`
- Vite automatically handles marked.js import if installed via npm

---

## Decision 5: LocalStorage Data Structure

**Decision**: Store documents as JSON objects in LocalStorage with index-based key structure

**Rationale**:
- Use two storage patterns:
  1. **Index key** (`md-editor:index`): Array of document metadata (id, filename, timestamps)
  2. **Document keys** (`md-editor:doc:{id}`): Individual document content
- Separates metadata (for fast file list rendering) from content (lazy-loaded)
- Enables efficient list operations without loading all document content
- Supports up to 100+ documents within 5-10MB quota by storing only metadata in index

**Data Structure**:
```javascript
// LocalStorage: 'md-editor:index'
[
  { id: 'uuid-1', filename: 'notes.md', created: 1234567890, modified: 1234567899, size: 1024 },
  { id: 'uuid-2', filename: 'todo.md', created: 1234567900, modified: 1234567910, size: 512 }
]

// LocalStorage: 'md-editor:doc:uuid-1'
{
  id: 'uuid-1',
  filename: 'notes.md',
  content: '# My Notes\n\nContent here...',
  created: 1234567890,
  modified: 1234567899
}
```

**Alternatives Considered**:
- **Single large JSON object**: Simpler, but requires parsing entire dataset on every operation; hits quota limits faster
- **One key per document with metadata embedded**: No separate index, but file list would need to load all documents to display; slow with many documents

**Implementation Notes**:
- Use `crypto.randomUUID()` for document IDs (browser-native, no library needed)
- Implement quota error handling with try-catch around `localStorage.setItem()`
- Add index rebuild function in case of corruption
- Cache index in memory during session to reduce LocalStorage reads

---

## Decision 6: UI Styling Approach

**Decision**: Use CSS Grid + Flexbox with custom CSS (no framework)

**Rationale**:
- Native CSS Grid perfect for two-pane editor/preview layout
- Flexbox ideal for component-level layouts (buttons, file list items)
- No framework overhead - faster page load
- Full control over responsive behavior for mobile
- Modern browsers have excellent Grid/Flexbox support
- Simpler than learning and configuring a CSS framework for this small app

**Alternatives Considered**:
- **Tailwind CSS**: Utility-first approach is fast to develop, but adds build step and increases HTML verbosity; overkill for ~5 components
- **Bootstrap**: Heavy dependency, opinionated styles that would need overriding, not optimized for editor layouts
- **CSS-in-JS**: Requires runtime library, adds complexity without clear benefits for static styles

**Layout Strategy**:
- Desktop: Side-by-side editor/preview with CSS Grid (`grid-template-columns: 1fr 1fr`)
- Mobile: Tabbed view (editor OR preview) with Flexbox tabs
- File list: Sidebar (desktop) or drawer (mobile)

---

## Decision 7: Performance Optimization Strategy

**Decision**: Debounce markdown rendering to meet <100ms preview update requirement

**Rationale**:
- Users type at ~60-100 WPM (1-2 keystrokes per second)
- Rendering on every keystroke wastes CPU and can cause jank
- Debounce rendering by 150ms - provides "instant" feel while reducing re-renders by ~80%
- For large documents (>50KB), use requestIdleCallback to render during idle time

**Implementation**:
```javascript
let debounceTimer;
function onEditorInput(event) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderPreview(event.target.value);
  }, 150);
}
```

**Alternatives Considered**:
- **Render on every keystroke**: Simplest implementation, but causes performance issues with documents >10KB
- **Throttle instead of debounce**: Ensures regular updates, but renders more often than necessary; debounce is better for editor use case where only final state matters

---

## Summary of Technical Stack

| Component | Choice | Version/Source |
|-----------|--------|----------------|
| Language | Vanilla JavaScript | ES6+ (ES2015+) |
| Markdown Parser | marked.js | v11.0+ (CDN or npm) |
| Testing | Vitest | Latest |
| Build Tool | Vite | Latest |
| Storage | LocalStorage API | Browser-native |
| UI Framework | None (vanilla) | - |
| Styling | Custom CSS (Grid/Flexbox) | CSS3 |

**Total Bundle Size Estimate**: ~30-40KB (minified + gzipped) including marked.js
**Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
