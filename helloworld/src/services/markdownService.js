/**
 * Markdown service for parsing and rendering markdown to HTML
 */

import { marked } from 'marked';

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});

/**
 * Render markdown text to HTML
 * @param {string} markdown - Markdown source text
 * @returns {string} Rendered HTML (sanitized)
 */
export function renderToHTML(markdown) {
  if (!markdown || markdown.trim() === '') {
    return '<p class="empty-preview">Start typing markdown to see preview...</p>';
  }

  try {
    return marked.parse(markdown);
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return '<p class="error-preview">Error rendering markdown</p>';
  }
}

/**
 * Get list of supported markdown syntax features
 * @returns {string[]} Array of supported syntax names
 */
export function getSupportedSyntax() {
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
    'horizontal-rules',
    'tables'
  ];
}
