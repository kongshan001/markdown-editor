/**
 * Validation service for filenames and documents
 */

const FILENAME_REGEX = /^[a-zA-Z0-9_\-\.]+\.md$/;
const MAX_FILENAME_LENGTH = 255;
const MAX_CONTENT_SIZE = 1048576; // 1MB in bytes

/**
 * Validate a document filename
 * @param {string} filename - Filename to validate
 * @param {string[]} [existingFilenames=[]] - Array of existing filenames to check uniqueness
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateFilename(filename, existingFilenames = []) {
  // Check if empty
  if (!filename || filename.trim() === '') {
    return { valid: false, error: 'EMPTY_FILENAME' };
  }

  // Check length
  if (filename.length > MAX_FILENAME_LENGTH) {
    return { valid: false, error: 'TOO_LONG' };
  }

  // Check if it ends with .md
  if (!filename.endsWith('.md')) {
    return { valid: false, error: 'MISSING_EXTENSION' };
  }

  // Check for invalid characters
  if (!FILENAME_REGEX.test(filename)) {
    return { valid: false, error: 'INVALID_CHARACTERS' };
  }

  // Check for duplicates
  if (existingFilenames.includes(filename)) {
    return { valid: false, error: 'DUPLICATE' };
  }

  return { valid: true };
}

/**
 * Validate a complete document object
 * @param {Object} document - Document object to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateDocument(document) {
  const errors = [];

  // Validate ID (UUID format)
  if (!document.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(document.id)) {
    errors.push('Invalid UUID format for id');
  }

  // Validate filename
  const filenameResult = validateFilename(document.filename);
  if (!filenameResult.valid) {
    errors.push(`Invalid filename: ${filenameResult.error}`);
  }

  // Validate content
  if (typeof document.content !== 'string') {
    errors.push('Content must be a string');
  } else if (new Blob([document.content]).size > MAX_CONTENT_SIZE) {
    errors.push('Content exceeds maximum size of 1MB');
  }

  // Validate timestamps
  if (!Number.isInteger(document.created) || document.created < 0) {
    errors.push('Invalid created timestamp');
  }

  if (!Number.isInteger(document.modified) || document.modified < 0) {
    errors.push('Invalid modified timestamp');
  }

  if (document.modified < document.created) {
    errors.push('Modified timestamp must be >= created timestamp');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
