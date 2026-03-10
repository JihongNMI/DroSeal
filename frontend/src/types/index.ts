// Type definitions for DroSeal application

// Encyclopedia Data Models
export interface EncyclopediaItem {
  id: string
  name: string
  quantity: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface Encyclopedia {
  id: string
  title: string
  description: string
  items: EncyclopediaItem[]
  createdAt: Date
  updatedAt: Date
}

export type EncyclopediaData = Encyclopedia[]

// Inventory Data Models
export interface InventoryCategory {
  id: string
  name: string
  parentId?: string // undefined for top-level categories
  color?: string // Optional color for UI display
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItem {
  id: string
  name: string
  categoryId: string // Required, defaults to 'uncategorized'
  quantity: number
  price?: number // Optional purchase price
  date: Date // Required, acquisition/purchase date (defaults to current timestamp)
  encyclopediaId?: string // Optional link to encyclopedia
  notes: string
  imageUrl?: string // Optional image URL
  createdAt: Date
  updatedAt: Date
}

export interface InventoryState {
  items: InventoryItem[]
  categories: InventoryCategory[]
}

// History tracking for inventory changes
export type HistoryChangeType = 'item_created' | 'quantity_change' | 'notes_change' | 'name_change' | 'price_change' | 'category_changed' | 'price_updated' | 'item_deleted' | 'item_updated'

export interface HistoryRecord {
  id: string
  itemId: string
  itemName: string // Denormalized for display after item deletion
  changeType: HistoryChangeType
  previousQuantity?: number // For quantity_change and item_deleted
  newQuantity?: number // For quantity_change and item_deleted (0 for deletions)
  previousNotes?: string // For notes_change
  newNotes?: string // For notes_change
  previousName?: string // For name_change
  newName?: string // For name_change
  previousPrice?: number // For price_change
  newPrice?: number // For price_change
  timestamp: Date
}

// Accounting Data Models
export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: Date
  linkedInventoryItemId?: string
  createdAt: Date
  updatedAt: Date
}

export type AccountingData = Transaction[]

// Profile Data Models
export interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  createdAt: Date
  updatedAt: Date
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

export interface ProfileData {
  profile: UserProfile
  friends: Friend[]
  friendRequests: Friend[]
}

// Storage-related Types
export interface StorageSchema<T = unknown> {
  version: number
  timestamp: string
  data: T
}

export interface StorageKeys {
  ENCYCLOPEDIAS: 'droseal_encyclopedias'
  INVENTORY_ITEMS: 'droseal_inventory_items'
  INVENTORY_CATEGORIES: 'droseal_inventory_categories'
  TRANSACTIONS: 'droseal_transactions'
  PROFILE: 'droseal_profile'
  FRIENDS: 'droseal_friends'
}

export interface StorageQuotaInfo {
  used: number
  available: number
  percentage: number
}
