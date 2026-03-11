import { useMemo } from 'react'
import React from 'react'
import { searchCategories } from '../services/categoryService'
import type { InventoryCategory } from '../types'

interface UseInventoryCategoryFilterParams {
  categories: InventoryCategory[]
  searchQuery: string
  uncategorizedId: string
  setExpandedCategoryIds: React.Dispatch<React.SetStateAction<Set<string>>>
}

export function useInventoryCategoryFilter({
  categories,
  searchQuery,
  uncategorizedId,
  setExpandedCategoryIds,
}: UseInventoryCategoryFilterParams) {
  return useMemo(() => {
    const sort = (cats: InventoryCategory[]) =>
      cats.sort((a, b) => {
        if (a.id === uncategorizedId) return -1
        if (b.id === uncategorizedId) return 1
        return a.name.localeCompare(b.name, 'ko')
      })

    if (!searchQuery.trim()) {
      return { filteredCategories: sort([...categories]), matchedCategoryIds: new Set<string>() }
    }

    const result = searchCategories(searchQuery, categories)
    setExpandedCategoryIds(prev => {
      const next = new Set(prev)
      result.visibleCategories.forEach(id => next.add(id))
      return next
    })

    return {
      filteredCategories: sort(categories.filter(c => result.visibleCategories.has(c.id))),
      matchedCategoryIds: result.matchedCategories,
    }
  }, [categories, searchQuery, uncategorizedId])
}
