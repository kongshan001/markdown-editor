/**
 * Preview component for rendering markdown
 */

import { renderToHTML } from '../services/markdownService.js';

export class Preview {
  /**
   * @param {HTMLElement} element - Preview container element
   */
  constructor(element) {
    this.element = element;
    this.currentMarkdown = '';
  }

  /**
   * Render markdown as HTML
   * @param {string} markdown - Markdown source text
   */
  render(markdown) {
    this.currentMarkdown = markdown;
    const html = renderToHTML(markdown);
    this.element.innerHTML = html;
  }

  /**
   * Scroll preview to top
   */
  scrollToTop() {
    this.element.scrollTop = 0;
  }

  /**
   * Clear preview content
   */
  clear() {
    this.element.innerHTML = '<p class="empty-preview">Start typing markdown to see preview...</p>';
  }
}
