import type { InventoryItem, Transaction, Encyclopedia, InventoryCategory } from '../types'
import { formatCategoryPath } from './categoryService'

/**
 * Transaction verification status for an item
 */
export type TransactionVerificationStatus = 'verified' | 'mismatch' | 'none'

/**
 * Check if an item's price matches a linked transaction
 * Returns verification status:
 * - 'verified': Transaction exists and price matches
 * - 'mismatch': Transaction exists but price doesn't match
 * - 'none': No transaction linked or no price on item
 * 
 * @param item - The inventory item to check
 * @param transactions - Array of all transactions
 * @returns Verification status
 */
export function getTransactionVerification(
  item: InventoryItem,
  transactions: Transaction[]
): TransactionVerificationStatus {
  // If item has no price, no verification possible
  if (!item.price) return 'none'

  // Find transaction linked to this item
  const linkedTransaction = transactions.find(
    t => t.linkedInventoryItemId === item.id
  )

  // If no transaction found, return none
  if (!linkedTransaction) return 'none'

  // Check if transaction amount matches item price
  return linkedTransaction.amount === item.price ? 'verified' : 'mismatch'
}

/**
 * Wrapper for formatCategoryPath from categoryService
 * Provides a convenient interface for item display
 * 
 * @param categoryId - The category ID to format
 * @param categories - Array of all categories
 * @returns Formatted category path string (e.g., "Parent > Child")
 */
export function formatItemCategoryPath(
  categoryId: string,
  categories: InventoryCategory[]
): string {
  return formatCategoryPath(categoryId, categories)
}

/**
 * Get the encyclopedia name for an item
 * Returns the encyclopedia name if the item is linked to one, otherwise undefined
 * 
 * @param item - The inventory item
 * @param encyclopedias - Array of all encyclopedias
 * @returns Encyclopedia name or undefined if not linked or not found
 */
export function getEncyclopediaName(
  item: InventoryItem,
  encyclopedias: Encyclopedia[]
): string | undefined {
  // If item has no encyclopedia link, return undefined
  if (!item.encyclopediaId) return undefined

  // Find the encyclopedia
  const encyclopedia = encyclopedias.find(enc => enc.id === item.encyclopediaId)

  // Return the title if found, undefined otherwise
  return encyclopedia?.title
}
