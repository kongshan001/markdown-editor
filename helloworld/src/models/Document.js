/**
 * Document model class representing a markdown document
 */
export class Document {
  /**
   * @param {Object} data - Document data
   * @param {string} [data.id] - Unique document identifier (UUID)
   * @param {string} data.filename - Document filename
   * @param {string} [data.content=''] - Markdown document content
   * @param {number} [data.created] - Creation timestamp (milliseconds since epoch)
   * @param {number} [data.modified] - Last modified timestamp (milliseconds since epoch)
   */
  constructor({ id, filename, content = '', created, modified }) {
    this.id = id || crypto.randomUUID();
    this.filename = filename;
    this.content = content;
    this.created = created || Date.now();
    this.modified = modified || this.created;
    this.size = new Blob([content]).size;
  }

  /**
   * Convert document to JSON-serializable object
   * @returns {Object} Plain object representation
   */
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

  /**
   * Create Document from JSON object
   * @param {Object} json - JSON object
   * @returns {Document} Document instance
   */
  static fromJSON(json) {
    return new Document(json);
  }
}
