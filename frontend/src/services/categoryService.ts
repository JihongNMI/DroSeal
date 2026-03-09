import { InventoryCategory } from '../types'

/**
 * Get the full path from root to a specific category
 * Returns an array of categories from root to the target category
 * 
 * @param categoryId - The ID of the target category
 * @param categories - Array of all categories
 * @returns Array of categories from root to target (empty if category not found)
 */
export function getCategoryPath(
  categoryId: string,
  categories: InventoryCategory[]
): InventoryCategory[] {
  const category = categories.find(cat => cat.id === categoryId)
  if (!category) return []

  const path: InventoryCategory[] = [category]
  let currentCategory = category

  while (currentCategory.parentId) {
    const parent = categories.find(cat => cat.id === currentCategory.parentId)
    if (!parent) break
    path.unshift(parent)
    currentCategory = parent
  }

  return path
}

/**
 * Get all ancestor categories of a specific category
 * Returns ancestors from immediate parent to root
 * 
 * @param categoryId - The ID of the target category
 * @param categories - Array of all categories
 * @returns Array of ancestor categories (empty if no ancestors or category not found)
 */
export function getAncestors(
  categoryId: string,
  categories: InventoryCategory[]
): InventoryCategory[] {
  const path = getCategoryPath(categoryId, categories)
  // Remove the target category itself, keeping only ancestors
  return path.slice(0, -1)
}

/**
 * Get all descendant categories recursively
 * Returns all children, grandchildren, etc.
 * 
 * @param categoryId - The ID of the parent category
 * @param categories - Array of all categories
 * @returns Array of all descendant categories
 */
export function getDescendants(
  categoryId: string,
  categories: InventoryCategory[]
): InventoryCategory[] {
  const descendants: InventoryCategory[] = []
  const children = categories.filter(cat => cat.parentId === categoryId)

  for (const child of children) {
    descendants.push(child)
    // Recursively get descendants of this child
    const childDescendants = getDescendants(child.id, categories)
    descendants.push(...childDescendants)
  }

  return descendants
}

/**
 * Get direct children of a category
 * Returns only immediate children, not grandchildren
 * 
 * @param parentId - The ID of the parent category (undefined for top-level)
 * @param categories - Array of all categories
 * @returns Array of direct child categories
 */
export function getChildren(
  parentId: string | undefined,
  categories: InventoryCategory[]
): InventoryCategory[] {
  // Handle both null and undefined as "no parent" (top-level categories)
  if (parentId === undefined || parentId === null) {
    return categories.filter(cat => cat.parentId === undefined || cat.parentId === null)
  }
  return categories.filter(cat => cat.parentId === parentId)
}

/**
 * Format category path as a string
 * Returns a string like "Parent > Child > Grandchild"
 * 
 * @param categoryId - The ID of the target category
 * @param categories - Array of all categories
 * @returns Formatted path string (empty if category not found)
 */
export function formatCategoryPath(
  categoryId: string,
  categories: InventoryCategory[]
): string {
  const path = getCategoryPath(categoryId, categories)
  return path.map(cat => cat.name).join(' > ')
}

/**
 * Validate that a category name is unique under the same parent
 * Prevents duplicate category names under the same parent
 * Different parents can have categories with the same name
 * 
 * @param name - The category name to validate
 * @param parentId - The parent category ID (undefined for top-level)
 * @param categories - Array of all categories
 * @param excludeId - Optional category ID to exclude from validation (for updates)
 * @returns true if the name is valid (no duplicate), false otherwise
 */
export function validateCategoryName(
  name: string,
  parentId: string | undefined,
  categories: InventoryCategory[],
  excludeId?: string
): boolean {
  return !categories.some(
    cat =>
      cat.name === name &&
      cat.parentId === parentId &&
      cat.id !== excludeId
  )
}

/**
 * Check if a category is a descendant of another category
 * Used to prevent circular references when setting parent categories
 * 
 * @param categoryId - The ID of the category to check
 * @param potentialDescendantId - The ID of the potential descendant
 * @param categories - Array of all categories
 * @returns true if potentialDescendantId is a descendant of categoryId
 */
export function isDescendant(
  categoryId: string,
  potentialDescendantId: string,
  categories: InventoryCategory[] 
): boolean {
  const descendants = getDescendants(categoryId, categories)
  return descendants.some(cat => cat.id === potentialDescendantId)
}

/**
 * Search result containing matched categories and all visible categories
 */
export interface SearchResult {
  matchedCategories: Set<string>
  visibleCategories: Set<string>
}

/**
 * Search categories by name and return matches with ancestors and descendants
 * Case-insensitive matching on category names
 * 
 * @param query - The search query string
 * @param categories - Array of all categories
 * @returns SearchResult with matched categories and all visible categories (including ancestors and descendants)
 */
export function searchCategories(
  query: string,
  categories: InventoryCategory[]
): SearchResult {
  const matchedCategories = new Set<string>()
  const visibleCategories = new Set<string>()

  // If query is empty, return empty sets
  if (!query.trim()) {
    return { matchedCategories, visibleCategories }
  }

  const lowerQuery = query.toLowerCase()

  // Find all categories that match the query
  for (const category of categories) {
    if (category.name.toLowerCase().includes(lowerQuery)) {
      matchedCategories.add(category.id)
    }
  }

  // For each matched category, add it and its ancestors and descendants to visible set
  for (const matchedId of matchedCategories) {
    // Add the matched category itself
    visibleCategories.add(matchedId)

    // Add all ancestors
    const ancestors = getAncestors(matchedId, categories)
    for (const ancestor of ancestors) {
      visibleCategories.add(ancestor.id)
    }

    // Add all descendants
    const descendants = getDescendants(matchedId, categories)
    for (const descendant of descendants) {
      visibleCategories.add(descendant.id)
    }
  }

  return { matchedCategories, visibleCategories }
}
