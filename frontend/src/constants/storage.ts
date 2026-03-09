// Storage key constants for localStorage operations

export const STORAGE_KEYS = {
  ENCYCLOPEDIAS: 'droseal_encyclopedias',
  INVENTORY_ITEMS: 'droseal_inventory_items',
  INVENTORY_CATEGORIES: 'droseal_inventory_categories',
  HISTORY: 'droseal_inventory_history',
  TRANSACTIONS: 'droseal_transactions',
  PROFILE: 'droseal_profile',
  FRIENDS: 'droseal_friends',
} as const

export const DEBOUNCE_DELAY = 500 // milliseconds
export const STORAGE_QUOTA_WARNING_THRESHOLD = 0.8 // 80%
export const STORAGE_QUOTA_URGENT_THRESHOLD = 0.9 // 90%
export const ESTIMATED_QUOTA = 5 * 1024 * 1024 // 5MB
export const CURRENT_SCHEMA_VERSION = 1
