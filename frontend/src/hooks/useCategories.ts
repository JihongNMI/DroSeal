import { useState, useEffect, useCallback } from 'react'
import { fetchCategoryTree, createCategory as apiCreateCategory, updateCategory as apiUpdateCategory, deleteCategory as apiDeleteCategory } from '../api/category'
import { categoryTreeToFlat, categoryToCreateRequest, categoryToUpdateRequest } from '../adapters/categoryAdapter'
import { validateCategoryName, isDescendant } from '../services/categoryService'
import type { InventoryCategory } from '../types'

const UNCATEGORIZED_ID = 'uncategorized'

interface UseCategoriesReturn {
  categories: InventoryCategory[]
  uncategorizedId: string
  addCategory: (name: string, parentId?: string) => Promise<void>
  updateCategory: (id: string, updates: Partial<InventoryCategory>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  loading: boolean
  error: string | null
}

/**
 * Custom hook for managing hierarchical categories with backend API
 * 
 * Features:
 * - Fetches categories from backend API
 * - Auto-creates Uncategorized category ('미분류') if no categories exist
 * - Prevents deletion of Uncategorized category
 * - Validates category names (no duplicates under same parent)
 * - Prevents circular references when updating parent
 * - Handles item reassignment when deleting categories with items
 * - Handles child category reassignment when deleting categories with children
 * 
 * @returns Categories array, CRUD functions, loading state, and error state
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories from backend on mount
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const categoryTree = await fetchCategoryTree()
      const flatCategories = categoryTreeToFlat(categoryTree)
      
      // Ensure Uncategorized category exists
      const hasUncategorized = flatCategories.some(cat => cat.id === UNCATEGORIZED_ID)
      if (!hasUncategorized) {
        const uncategorized: InventoryCategory = {
          id: UNCATEGORIZED_ID,
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setCategories([uncategorized, ...flatCategories])
      } else {
        setCategories(flatCategories)
      }
      
      setError(null)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  /**
   * Add a new category with validation
   * 
   * @param name - Category name
   * @param parentId - Optional parent category ID (undefined for top-level)
   * @throws Error if name is invalid or duplicate under same parent
   */
  const addCategory = useCallback(async (name: string, parentId?: string) => {
    // Validate name is not empty
    if (!name.trim()) {
      throw new Error('Category name cannot be empty')
    }

    // Validate no duplicate names under same parent
    if (!validateCategoryName(name, parentId, categories)) {
      throw new Error('같은 위치에 동일한 이름의 카테고리가 이미 존재합니다.')
    }

    try {
      const request = categoryToCreateRequest({ name: name.trim(), parentId })
      await apiCreateCategory(request)
      
      // Reload categories from backend
      await loadCategories()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add category')
    }
  }, [categories, loadCategories])

  /**
   * Update an existing category with circular reference check
   * 
   * @param id - Category ID to update
   * @param updates - Partial category updates
   * @throws Error if update would create circular reference or duplicate name
   */
  const updateCategory = useCallback(async (id: string, updates: Partial<InventoryCategory>) => {
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

    try {
      const category = categories.find(cat => cat.id === id)
      if (!category) {
        throw new Error('Category not found')
      }

      const request = categoryToUpdateRequest({
        name: updates.name || category.name,
        parentId: updates.parentId !== undefined ? updates.parentId : category.parentId
      })
      
      await apiUpdateCategory(parseInt(id), request)
      
      // Reload categories from backend
      await loadCategories()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update category')
    }
  }, [categories, loadCategories])

  /**
   * Delete a category with item and child reassignment
   * 
   * - Items in the deleted category are reassigned to Uncategorized (handled by backend)
   * - Child categories are reassigned to the deleted category's parent (handled by backend)
   * - Cannot delete Uncategorized category
   * 
   * @param id - Category ID to delete
   * @throws Error if attempting to delete Uncategorized category
   */
  const deleteCategory = useCallback(async (id: string) => {
    // Prevent deletion of Uncategorized category
    if (id === UNCATEGORIZED_ID) {
      throw new Error('Cannot delete Uncategorized category')
    }

    const categoryToDelete = categories.find(cat => cat.id === id)
    if (!categoryToDelete) {
      throw new Error('Category not found')
    }

    try {
      await apiDeleteCategory(parseInt(id))
      
      // Reload categories from backend
      await loadCategories()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }, [categories, loadCategories])

  return {
    categories,
    uncategorizedId: UNCATEGORIZED_ID,
    addCategory,
    updateCategory,
    deleteCategory,
    loading,
    error,
  }
}
