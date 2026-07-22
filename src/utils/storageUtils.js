/**
 * storageUtils.js — shared factory for localStorage CRUD operations.
 *
 * Eliminates repetitive load/save/clear boilerplate across services.
 */

export function makeStorageHelpers(storageKey, errorTag) {
  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(`[${errorTag}] Error loading data:`, err);
      return [];
    }
  }

  function save(data) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (err) {
      console.error(`[${errorTag}] Error saving data:`, err);
    }
  }

  function clear() {
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error(`[${errorTag}] Error clearing data:`, err);
    }
  }

  return { load, save, clear };
}
