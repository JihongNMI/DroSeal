/**
 * LocalStorage Service
 * 
 * Provides centralized localStorage operations with error handling,
 * versioning, and memory fallback for when localStorage is unavailable.
 */

// Storage backend type
type StorageBackend = 'localStorage' | 'memory';

// In-memory storage fallback
const memoryStorage = new Map<string, string>();

// Track which storage backend is being used
let storageBackend: StorageBackend = 'localStorage';

/**
 * Check if localStorage is available
 * 
 * Tests localStorage availability by attempting to write and remove a test value.
 * Falls back to memory storage if localStorage is unavailable (e.g., private browsing mode).
 * 
 * @returns true if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize storage backend
 * 
 * Detects localStorage availability and sets up the appropriate storage backend.
 * Displays a warning if localStorage is unavailable.
 */
function initializeStorage(): void {
  if (isLocalStorageAvailable()) {
    storageBackend = 'localStorage';
  } else {
    storageBackend = 'memory';
    console.warn('LocalStorage is unavailable. Using in-memory storage. Data will not persist between sessions.');
  }
}

// Initialize storage on module load
initializeStorage();

/**
 * Get an item from storage
 * 
 * Retrieves a value from either localStorage or memory storage depending on availability.
 * 
 * @param key - The storage key
 * @returns The stored value or null if not found
 */
export function getItem(key: string): string | null {
  if (storageBackend === 'localStorage') {
    return localStorage.getItem(key);
  }
  return memoryStorage.get(key) ?? null;
}

/**
 * Set an item in storage
 * 
 * Stores a value in either localStorage or memory storage depending on availability.
 * 
 * @param key - The storage key
 * @param value - The value to store
 */
export function setItem(key: string, value: string): void {
  if (storageBackend === 'localStorage') {
    localStorage.setItem(key, value);
  } else {
    memoryStorage.set(key, value);
  }
}

/**
 * Remove an item from storage
 * 
 * @param key - The storage key to remove
 */
export function removeItem(key: string): void {
  if (storageBackend === 'localStorage') {
    localStorage.removeItem(key);
  } else {
    memoryStorage.delete(key);
  }
}

/**
 * Clear all items from storage
 */
export function clear(): void {
  if (storageBackend === 'localStorage') {
    localStorage.clear();
  } else {
    memoryStorage.clear();
  }
}

/**
 * Get the current storage backend being used
 * 
 * @returns 'localStorage' or 'memory'
 */
export function getStorageBackend(): StorageBackend {
  return storageBackend;
}

/**
 * Serialize data to JSON string
 * 
 * Converts JavaScript objects to JSON with special handling for:
 * - Date objects: Converted to ISO 8601 strings
 * - undefined values: Converted to null
 * 
 * @param data - The data to serialize
 * @returns JSON string representation
 */
export function serialize<T>(data: T): string {
  return JSON.stringify(data, (_key, value) => {
    // Convert Date objects to ISO 8601 strings
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Convert undefined to null
    if (value === undefined) {
      return null;
    }
    return value;
  });
}

/**
 * Deserialize JSON string to JavaScript object
 * 
 * Parses JSON with special handling for:
 * - ISO 8601 date strings: Converted back to Date objects
 * 
 * @param json - The JSON string to deserialize
 * @returns Parsed JavaScript object
 */
export function deserialize<T>(json: string): T {
  return JSON.parse(json, (_key, value) => {
    // Convert ISO 8601 date strings back to Date objects
    // Pattern matches: YYYY-MM-DDTHH:mm:ss.sssZ or similar ISO 8601 formats
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const date = new Date(value);
      // Verify it's a valid date
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return value;
  });
}

/**
 * Storage schema wrapper
 * 
 * All data stored in localStorage is wrapped with versioning information.
 */
interface StorageSchema<T> {
  version: number;
  timestamp: string;
  data: T;
}

/**
 * Save data to storage with schema versioning
 * 
 * Wraps the data with version and timestamp information before storing.
 * Handles serialization and error handling for quota exceeded scenarios.
 * 
 * @param key - The storage key
 * @param data - The data to save
 * @throws Error if storage quota is exceeded
 */
export function saveData<T>(key: string, data: T): void {
  try {
    const wrappedData: StorageSchema<T> = {
      version: 1,
      timestamp: new Date().toISOString(),
      data
    };
    const serialized = serialize(wrappedData);
    setItem(key, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded. Please export your data as a backup.');
      throw new Error('Storage quota exceeded. Please export your data and consider removing old items.');
    } else {
      console.error('Failed to save data:', error);
      throw error;
    }
  }
}

/**
 * Load data from storage
 * 
 * Retrieves and deserializes data from storage. Returns null if the key doesn't exist
 * or if the data is corrupted.
 * 
 * @param key - The storage key
 * @returns The stored data or null if not found or corrupted
 */
export function loadData<T>(key: string): T | null {
  try {
    const item = getItem(key);
    if (!item) {
      return null;
    }
    const wrappedData = deserialize<StorageSchema<T>>(item);
    return wrappedData.data;
  } catch (error) {
    console.error(`Failed to load data for key "${key}":`, error);
    console.warn(`Data for key "${key}" is corrupted. Returning null.`);
    return null;
  }
}

/**
 * Clear data for a specific key
 * 
 * Removes the data associated with the given key from storage.
 * 
 * @param key - The storage key to clear
 */
export function clearData(key: string): void {
  removeItem(key);
}

/**
 * Clear all application data from storage
 * 
 * Removes all data with keys starting with 'droseal_' prefix.
 * This preserves any non-application data in localStorage.
 */
export function clearAllData(): void {
  if (storageBackend === 'localStorage') {
    // Get all keys that start with 'droseal_'
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('droseal_')) {
        keysToRemove.push(key);
      }
    }
    // Remove all droseal keys
    keysToRemove.forEach(key => removeItem(key));
  } else {
    // For memory storage, clear all keys that start with 'droseal_'
    const keysToRemove: string[] = [];
    memoryStorage.forEach((_, key) => {
      if (key.startsWith('droseal_')) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach(key => memoryStorage.delete(key));
  }
}

/**
 * Storage keys for DroSeal application data
 */
export const STORAGE_KEYS = {
  CATEGORIES: 'droseal_inventory_categories',
  ITEMS: 'droseal_inventory_items',
  HISTORY: 'droseal_inventory_history',
  ENCYCLOPEDIAS: 'droseal_encyclopedias',
  TRANSACTIONS: 'droseal_transactions',
  DATA_VERSION: 'droseal_data_version'
} as const;

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean;
  categoriesCreated: number;
  itemsMigrated: number;
  errors: string[];
}

/**
 * Phase 1 data types (for migration)
 */
interface Phase1Category {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  // parentId does not exist in Phase 1
}

interface Phase1Item {
  id: string;
  name: string;
  categoryId: string | null | undefined;
  quantity: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  // price, date, encyclopediaId do not exist in Phase 1
}

/**
 * Phase 3 data types (target format)
 */
interface Phase3Category {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Phase3Item {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  price?: number;
  date: Date;
  encyclopediaId?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Migrate Phase 1 data to Phase 3 format
 * 
 * This function handles the migration of existing Phase 1 data to Phase 3 format:
 * 1. Creates backup of existing data
 * 2. Ensures Uncategorized category exists
 * 3. Adds parentId: undefined to all existing categories
 * 4. Assigns null categoryId items to 'uncategorized'
 * 5. Adds default values for new item fields (price, date, encyclopediaId)
 * 6. Saves version 2 to localStorage
 * 7. Restores backup on any failure
 * 
 * @returns Migration result with success status and statistics
 */
export function migratePhase1ToPhase3(): MigrationResult {
  const UNCATEGORIZED_ID = 'uncategorized';
  const errors: string[] = [];
  let categoriesCreated = 0;
  let itemsMigrated = 0;

  // Create backup before migration
  const backup = {
    categories: getItem(STORAGE_KEYS.CATEGORIES),
    items: getItem(STORAGE_KEYS.ITEMS),
    version: getItem(STORAGE_KEYS.DATA_VERSION)
  };

  try {
    // Check current data version
    const currentVersion = loadData<number>(STORAGE_KEYS.DATA_VERSION);
    
    // If already at version 2 or higher, no migration needed
    if (currentVersion !== null && currentVersion >= 2) {
      return {
        success: true,
        categoriesCreated: 0,
        itemsMigrated: 0,
        errors: []
      };
    }

    // Load Phase 1 categories
    const phase1Categories = loadData<Phase1Category[]>(STORAGE_KEYS.CATEGORIES) || [];
    
    // Ensure Uncategorized category exists
    const uncategorizedExists = phase1Categories.some(cat => cat.id === UNCATEGORIZED_ID);
    const phase3Categories: Phase3Category[] = [];
    
    if (!uncategorizedExists) {
      // Create Uncategorized category
      phase3Categories.push({
        id: UNCATEGORIZED_ID,
        name: '미분류',
        parentId: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      categoriesCreated++;
    }

    // Migrate existing categories: add parentId: undefined
    for (const cat of phase1Categories) {
      phase3Categories.push({
        ...cat,
        parentId: undefined
      });
    }

    // Load Phase 1 items
    const phase1Items = loadData<Phase1Item[]>(STORAGE_KEYS.ITEMS) || [];
    const phase3Items: Phase3Item[] = [];

    // Migrate items
    for (const item of phase1Items) {
      // Assign null/undefined categoryId to 'uncategorized'
      const categoryId = item.categoryId || UNCATEGORIZED_ID;
      
      // Add default values for new fields
      phase3Items.push({
        ...item,
        categoryId,
        price: undefined, // Optional field, defaults to undefined
        date: item.createdAt || new Date(), // Use createdAt if available, otherwise current date
        encyclopediaId: undefined // Optional field, defaults to undefined
      });
      itemsMigrated++;
    }

    // Save migrated data
    saveData(STORAGE_KEYS.CATEGORIES, phase3Categories);
    saveData(STORAGE_KEYS.ITEMS, phase3Items);
    saveData(STORAGE_KEYS.DATA_VERSION, 2);

    return {
      success: true,
      categoriesCreated,
      itemsMigrated,
      errors
    };

  } catch (error) {
    // Restore backup on failure
    try {
      if (backup.categories) {
        setItem(STORAGE_KEYS.CATEGORIES, backup.categories);
      }
      if (backup.items) {
        setItem(STORAGE_KEYS.ITEMS, backup.items);
      }
      if (backup.version) {
        setItem(STORAGE_KEYS.DATA_VERSION, backup.version);
      }
    } catch (restoreError) {
      errors.push(`Failed to restore backup: ${restoreError instanceof Error ? restoreError.message : String(restoreError)}`);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Migration failed: ${errorMessage}`);
    console.error('Phase 1 to Phase 3 migration failed:', error);

    return {
      success: false,
      categoriesCreated: 0,
      itemsMigrated: 0,
      errors
    };
  }
}

/**
 * Get current data version
 * 
 * @returns Current data version number, or 1 if not set (Phase 1 data)
 */
export function getDataVersion(): number {
  const version = loadData<number>(STORAGE_KEYS.DATA_VERSION);
  return version ?? 1;
}
/**
 * Get storage quota information
 *
 * Estimates localStorage usage and available space.
 * Note: This is an approximation as browsers don't provide exact quota info.
 *
 * @returns Storage quota information with used, available, and percentage
 */
export function getStorageQuota(): { used: number; available: number; percentage: number } {
  if (storageBackend === 'memory') {
    // For memory storage, calculate size of stored data
    let used = 0;
    memoryStorage.forEach((value) => {
      used += value.length * 2; // Approximate bytes (UTF-16)
    });
    return {
      used,
      available: Infinity,
      percentage: 0
    };
  }

  // For localStorage, estimate usage
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        used += (key.length + value.length) * 2; // Approximate bytes (UTF-16)
      }
    }
  }

  // Most browsers have 5-10MB localStorage limit, we'll use 5MB as conservative estimate
  const available = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (used / available) * 100;

  return {
    used,
    available,
    percentage
  };
}

/**
 * Check if storage is approaching quota limit
 *
 * @returns true if storage usage is above 80%
 */
export function isStorageNearQuota(): boolean {
  const quota = getStorageQuota();
  return quota.percentage > 80;
}

/**
 * Cleanup old history records to free up storage space
 *
 * Removes history records older than the specified number of days.
 *
 * @param daysToKeep - Number of days of history to keep (default: 90)
 * @returns Number of records deleted
 */
export function cleanupOldHistory(daysToKeep: number = 90): number {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const history = loadData<Array<{ timestamp: Date }>>(STORAGE_KEYS.HISTORY) || [];
    const filtered = history.filter(record => {
      const recordDate = record.timestamp instanceof Date
        ? record.timestamp
        : new Date(record.timestamp);
      return recordDate > cutoffDate;
    });

    const deletedCount = history.length - filtered.length;

    if (deletedCount > 0) {
      saveData(STORAGE_KEYS.HISTORY, filtered);
    }

    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup old history:', error);
    return 0;
  }
}

/**
 * Check if migration is needed
 * 
 * @returns true if data needs to be migrated to Phase 3 format
 */
export function needsMigration(): boolean {
  return getDataVersion() < 2;
}
