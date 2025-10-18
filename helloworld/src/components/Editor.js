/**
 * Editor component for markdown text input
 */

export class Editor {
  /**
   * @param {HTMLTextAreaElement} element - Textarea element
   */
  constructor(element) {
    this.element = element;
    this.content = '';
    this.listeners = {
      'content-changed': [],
      'save-requested': []
    };

    this.initializeEventListeners();
  }

  /**
   * Initialize DOM event listeners
   */
  initializeEventListeners() {
    // Content change events
    this.element.addEventListener('input', (e) => {
      this.content = e.target.value;
      this.emit('content-changed', { content: this.content });
    });

    // Keyboard shortcuts
    this.element.addEventListener('keydown', (e) => {
      // Ctrl+S or Cmd+S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.emit('save-requested', { content: this.content });
      }
    });
  }

  /**
   * Set editor content
   * @param {string} content - Content to set
   */
  setContent(content) {
    this.content = content;
    this.element.value = content;
  }

  /**
   * Get current editor content
   * @returns {string} Current content
   */
  getContent() {
    return this.content;
  }

  /**
   * Focus the editor
   */
  focus() {
    this.element.focus();
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}
