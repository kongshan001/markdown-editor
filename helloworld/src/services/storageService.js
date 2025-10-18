/**
 * Storage service for managing documents in LocalStorage
 */

const STORAGE_PREFIX = 'md-editor';
const INDEX_KEY = `${STORAGE_PREFIX}:index`;

/**
 * Save or update a document in LocalStorage
 * @param {Object} document - Document object to save
 * @returns {Promise<{success: boolean, error?: string}>} Save result
 */
export async function saveDocument(document) {
  try {
    const key = `${STORAGE_PREFIX}:doc:${document.id}`;
    localStorage.setItem(key, JSON.stringify(document));
    await updateIndex(document);
    return { success: true };
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      return { success: false, error: 'QUOTA_EXCEEDED' };
    }
    return { success: false, error: 'STORAGE_UNAVAILABLE' };
  }
}

/**
 * Get a document by ID from LocalStorage
 * @param {string} id - Document UUID
 * @returns {Promise<Object|null>} Document object or null if not found
 */
export async function getDocument(id) {
  try {
    const key = `${STORAGE_PREFIX}:doc:${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Delete a document from LocalStorage
 * @param {string} id - Document UUID
 * @returns {Promise<{success: boolean, error?: string}>} Delete result
 */
export async function deleteDocument(id) {
  try {
    const key = `${STORAGE_PREFIX}:doc:${id}`;
    localStorage.removeItem(key);
    await removeFromIndex(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'STORAGE_UNAVAILABLE' };
  }
}

/**
 * Get list of all document metadata
 * @returns {Promise<Array>} Array of document metadata
 */
export async function listDocuments() {
  try {
    const indexData = localStorage.getItem(INDEX_KEY);
    if (indexData) {
      const index = JSON.parse(indexData);
      return index.documents || [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Get storage usage statistics
 * @returns {Promise<{used: number, total: number, percentage: number}>} Storage stats
 */
export async function getStorageStats() {
  try {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        used += localStorage.getItem(key).length * 2; // UTF-16 encoding
      }
    }
    const total = 5 * 1024 * 1024; // Assume 5MB quota
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  } catch (error) {
    return { used: 0, total: 5242880, percentage: 0 };
  }
}

/**
 * Update document index with new metadata
 * @param {Object} document - Document object
 * @returns {Promise<void>}
 */
async function updateIndex(document) {
  const index = await getIndex();
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

  // Sort by modified (newest first)
  index.documents.sort((a, b) => b.modified - a.modified);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

/**
 * Remove document metadata from index
 * @param {string} id - Document UUID
 * @returns {Promise<void>}
 */
async function removeFromIndex(id) {
  const index = await getIndex();
  index.documents = index.documents.filter(d => d.id !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

/**
 * Get the document index
 * @returns {Promise<{documents: Array}>} Document index
 */
async function getIndex() {
  try {
    const data = localStorage.getItem(INDEX_KEY);
    return data ? JSON.parse(data) : { documents: [] };
  } catch (error) {
    return { documents: [] };
  }
}
