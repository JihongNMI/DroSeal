import { useState, useEffect, useCallback } from 'react'
import { saveData, loadData, isStorageNearQuota } from '../services/localStorage'
import { STORAGE_KEYS, DEBOUNCE_DELAY } from '../constants/storage'
import { validateCategoryName, isDescendant } from '../services/categoryService'
import type { InventoryCategory, InventoryItem } from '../types'

const UNCATEGORIZED_ID = 'uncategorized'

interface UseCategoriesReturn {
  categories: InventoryCategory[]
  uncategorizedId: string
  addCategory: (name: string, parentId?: string) => void
  updateCategory: (id: string, updates: Partial<InventoryCategory>) => void
  deleteCategory: (id: string) => void
  loading: boolean
  error: string | null
  storageWarning: string | null
}

/**
 * Custom hook for managing hierarchical categories with localStorage persistence
 * 
 * Features:
 * - Auto-creates Uncategorized category ('미분류') if no categories exist
 * - Prevents deletion of Uncategorized category
 * - Validates category names (no duplicates under same parent)
 * - Prevents circular references when updating parent
 * - Handles item reassignment when deleting categories with items
 * - Handles child category reassignment when deleting categories with children
 * - Uses debounced save to localStorage (500ms delay)
 * 
 * @returns Categories array, CRUD functions, loading state, and error state
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storageWarning, setStorageWarning] = useState<string | null>(null)

  // Check storage quota on mount and after saves
  useEffect(() => {
    if (isStorageNearQuota()) {
      setStorageWarning('저장 공간이 부족합니다. 오래된 이력을 정리하는 것을 권장합니다.')
    } else {
      setStorageWarning(null)
    }
  }, [categories])

  // Load categories from localStorage on mount
  useEffect(() => {
    try {
      const loadedCategories = loadData<InventoryCategory[]>(STORAGE_KEYS.INVENTORY_CATEGORIES)
      
      // If no categories exist, create Uncategorized category
      if (!loadedCategories || loadedCategories.length === 0) {
        const uncategorized: InventoryCategory = {
          id: UNCATEGORIZED_ID,
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setCategories([uncategorized])
      } else {
        // Ensure Uncategorized category exists
        const hasUncategorized = loadedCategories.some(cat => cat.id === UNCATEGORIZED_ID)
        if (!hasUncategorized) {
          const uncategorized: InventoryCategory = {
            id: UNCATEGORIZED_ID,
            name: '미분류',
            parentId: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setCategories([uncategorized, ...loadedCategories])
        } else {
          setCategories(loadedCategories)
        }
      }
      
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      setLoading(false)
    }
  }, [])

  // Save categories to localStorage with debounce
  useEffect(() => {
    if (loading) return // Don't save during initial load

    const timeoutId = setTimeout(() => {
      try {
        saveData(STORAGE_KEYS.INVENTORY_CATEGORIES, categories)
        setError(null)
      } catch (err) {
        if (err instanceof Error) {
          // Check if it's a quota exceeded error
          if (err.message.includes('quota exceeded') || err.message.includes('QuotaExceededError')) {
            setError('저장 공간이 부족합니다. 오래된 이력을 정리하거나 일부 데이터를 삭제해주세요.')
          } else {
            setError(err.message)
          }
        } else {
          setError('Failed to save categories')
        }
      }
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timeoutId)
  }, [categories, loading])

  /**
   * Add a new category with validation
   * 
   * @param name - Category name
   * @param parentId - Optional parent category ID (undefined for top-level)
   * @throws Error if name is invalid or duplicate under same parent
   */
  const addCategory = useCallback((name: string, parentId?: string) => {
    // Validate name is not empty
    if (!name.trim()) {
      throw new Error('Category name cannot be empty')
    }

    // Validate no duplicate names under same parent
    if (!validateCategoryName(name, parentId, categories)) {
      throw new Error('같은 위치에 동일한 이름의 카테고리가 이미 존재합니다.')
    }

    const newCategory: InventoryCategory = {
      id: crypto.randomUUID(),
      name: name.trim(),
      parentId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setCategories(prev => [...prev, newCategory])
  }, [categories])

  /**
   * Update an existing category with circular reference check
   * 
   * @param id - Category ID to update
   * @param updates - Partial category updates
   * @throws Error if update would create circular reference or duplicate name
   */
  const updateCategory = useCallback((id: string, updates: Partial<InventoryCategory>) => {
    // Prevent updating Uncategorized category's parentId
    if (id === UNCATEGORIZED_ID && updates.parentId !== undefined) {
      throw new Error('Cannot change parent of Uncategorized category')
    }

    // Check for circular reference if parentId is being updated
    if (updates.parentId !== undefined && updates.parentId !== null) {
      if (updates.parentId === id) {
        throw new Error('Cannot set category as its own parent')
      }
      if (isDescendant(id, updates.parentId, categories)) {
        throw new Error('하위 카테고리를 부모로 설정할 수 없습니다.')
      }
    }

    // Validate name uniqueness if name or parentId is being updated
    if (updates.name !== undefined || updates.parentId !== undefined) {
      const category = categories.find(cat => cat.id === id)
      if (!category) {
        throw new Error('Category not found')
      }

      const newName = updates.name !== undefined ? updates.name : category.name
      const newParentId = updates.parentId !== undefined ? updates.parentId : category.parentId

      if (!validateCategoryName(newName, newParentId, categories, id)) {
        throw new Error('같은 위치에 동일한 이름의 카테고리가 이미 존재합니다.')
      }
    }

    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, ...updates, updatedAt: new Date() }
          : cat
      )
    )
  }, [categories])

  /**
   * Delete a category with item and child reassignment
   * 
   * - Items in the deleted category are reassigned to Uncategorized
   * - Child categories are reassigned to the deleted category's parent
   * - Cannot delete Uncategorized category
   * 
   * @param id - Category ID to delete
   * @throws Error if attempting to delete Uncategorized category
   */
  const deleteCategory = useCallback((id: string) => {
    // Prevent deletion of Uncategorized category
    if (id === UNCATEGORIZED_ID) {
      throw new Error('Cannot delete Uncategorized category')
    }

    const categoryToDelete = categories.find(cat => cat.id === id)
    if (!categoryToDelete) {
      throw new Error('Category not found')
    }

    // Reassign items to Uncategorized
    const items = loadData<InventoryItem[]>(STORAGE_KEYS.INVENTORY_ITEMS) || []
    const updatedItems = items.map(item =>
      item.categoryId === id
        ? { ...item, categoryId: UNCATEGORIZED_ID, updatedAt: new Date() }
        : item
    )
    saveData(STORAGE_KEYS.INVENTORY_ITEMS, updatedItems)

    // Reassign child categories to parent (or top-level if no parent)
    setCategories(prev => {
      // Remove the deleted category and update children
      return prev
        .filter(cat => cat.id !== id)
        .map(cat => {
          // If this is a direct child of the deleted category
          if (cat.parentId === id) {
            return {
              ...cat,
              parentId: categoryToDelete.parentId, // Inherit parent's parent
              updatedAt: new Date()
            }
          }
          return cat
        })
    })
  }, [categories])

  return {
    categories,
    uncategorizedId: UNCATEGORIZED_ID,
    addCategory,
    updateCategory,
    deleteCategory,
    loading,
    error,
    storageWarning
  }
}
