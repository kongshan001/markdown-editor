/**
 * Main application entry point
 */

import { Editor } from './components/Editor.js';
import { Preview } from './components/Preview.js';

// Initialize components
const editorElement = document.getElementById('editor');
const previewElement = document.getElementById('preview');

const editor = new Editor(editorElement);
const preview = new Preview(previewElement);

// Debounce timer for preview updates
let debounceTimer = null;
const DEBOUNCE_DELAY = 150; // milliseconds

/**
 * Handle editor content changes with debounced preview update
 * @param {Object} data - Event data with content
 */
function handleContentChange(data) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    preview.render(data.content);
  }, DEBOUNCE_DELAY);
}

/**
 * Initialize the application
 */
function init() {
  // Wire up event listeners
  editor.on('content-changed', handleContentChange);

  // Set initial empty state
  preview.clear();
  editor.focus();

  console.log('Markdown Editor initialized');
  console.log('Start typing to see live preview!');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
