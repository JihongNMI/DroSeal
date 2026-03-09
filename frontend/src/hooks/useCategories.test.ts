import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCategories } from './useCategories'
import * as localStorage from '../services/localStorage'
import type { InventoryCategory, InventoryItem } from '../types'

// Mock the localStorage service
vi.mock('../services/localStorage', () => ({
  saveData: vi.fn(),
  loadData: vi.fn(),
  isStorageNearQuota: vi.fn(() => false),
  STORAGE_KEYS: {
    INVENTORY_CATEGORIES: 'droseal_inventory_categories',
    INVENTORY_ITEMS: 'droseal_inventory_items'
  }
}))

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should create Uncategorized category if no categories exist', async () => {
      vi.mocked(localStorage.loadData).mockReturnValue(null)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.categories).toHaveLength(1)
      expect(result.current.categories[0].id).toBe('uncategorized')
      expect(result.current.categories[0].name).toBe('미분류')
      expect(result.current.categories[0].parentId).toBeUndefined()
    })

    it('should ensure Uncategorized category exists when loading existing categories', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'cat1',
          name: 'Category 1',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.categories).toHaveLength(2)
      expect(result.current.categories[0].id).toBe('uncategorized')
      expect(result.current.categories[1].id).toBe('cat1')
    })

    it('should not duplicate Uncategorized category if it already exists', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat1',
          name: 'Category 1',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.categories).toHaveLength(2)
      const uncategorizedCount = result.current.categories.filter(
        cat => cat.id === 'uncategorized'
      ).length
      expect(uncategorizedCount).toBe(1)
    })
  })

  describe('addCategory', () => {
    it('should add a new top-level category', async () => {
      vi.mocked(localStorage.loadData).mockReturnValue([])

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.addCategory('New Category')
      })

      expect(result.current.categories).toHaveLength(2) // Uncategorized + new
      const newCategory = result.current.categories.find(cat => cat.name === 'New Category')
      expect(newCategory).toBeDefined()
      expect(newCategory?.parentId).toBeUndefined()
    })

    it('should add a child category with parentId', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'parent',
          name: 'Parent',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.addCategory('Child Category', 'parent')
      })

      const childCategory = result.current.categories.find(cat => cat.name === 'Child Category')
      expect(childCategory).toBeDefined()
      expect(childCategory?.parentId).toBe('parent')
    })

    it('should throw error for empty category name', async () => {
      vi.mocked(localStorage.loadData).mockReturnValue([])

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(() => {
        act(() => {
          result.current.addCategory('   ')
        })
      }).toThrow('Category name cannot be empty')
    })

    it('should throw error for duplicate name under same parent', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat1',
          name: 'Duplicate',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(() => {
        act(() => {
          result.current.addCategory('Duplicate')
        })
      }).toThrow('같은 위치에 동일한 이름의 카테고리가 이미 존재합니다.')
    })

    it('should allow duplicate names under different parents', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'parent1',
          name: 'Parent 1',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'parent2',
          name: 'Parent 2',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'child1',
          name: 'Child',
          parentId: 'parent1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.addCategory('Child', 'parent2')
      })

      const childCategories = result.current.categories.filter(cat => cat.name === 'Child')
      expect(childCategories).toHaveLength(2)
      expect(childCategories[0].parentId).not.toBe(childCategories[1].parentId)
    })
  })

  describe('updateCategory', () => {
    it('should update category name', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat1',
          name: 'Old Name',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.updateCategory('cat1', { name: 'New Name' })
      })

      const updatedCategory = result.current.categories.find(cat => cat.id === 'cat1')
      expect(updatedCategory?.name).toBe('New Name')
    })

    it('should update category parent', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'parent',
          name: 'Parent',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'child',
          name: 'Child',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.updateCategory('child', { parentId: 'parent' })
      })

      const updatedCategory = result.current.categories.find(cat => cat.id === 'child')
      expect(updatedCategory?.parentId).toBe('parent')
    })

    it('should throw error when setting category as its own parent', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat1',
          name: 'Category',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(() => {
        act(() => {
          result.current.updateCategory('cat1', { parentId: 'cat1' })
        })
      }).toThrow('Cannot set category as its own parent')
    })

    it('should throw error for circular reference', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'parent',
          name: 'Parent',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'child',
          name: 'Child',
          parentId: 'parent',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(() => {
        act(() => {
          result.current.updateCategory('parent', { parentId: 'child' })
        })
      }).toThrow('하위 카테고리를 부모로 설정할 수 없습니다.')
    })

    it('should prevent changing Uncategorized parent', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'parent',
          name: 'Parent',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(() => {
        act(() => {
          result.current.updateCategory('uncategorized', { parentId: 'parent' })
        })
      }).toThrow('Cannot change parent of Uncategorized category')
    })
  })

  describe('deleteCategory', () => {
    it('should throw error when deleting Uncategorized category', async () => {
      vi.mocked(localStorage.loadData).mockReturnValue([])

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(() => {
        act(() => {
          result.current.deleteCategory('uncategorized')
        })
      }).toThrow('Cannot delete Uncategorized category')
    })

    it('should delete empty category', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat1',
          name: 'Category 1',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.deleteCategory('cat1')
      })

      expect(result.current.categories).toHaveLength(1)
      expect(result.current.categories[0].id).toBe('uncategorized')
    })

    it('should reassign items to Uncategorized when deleting category with items', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat1',
          name: 'Category 1',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      const existingItems: InventoryItem[] = [
        {
          id: 'item1',
          name: 'Item 1',
          categoryId: 'cat1',
          quantity: 5,
          date: new Date(),
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      vi.mocked(localStorage.loadData).mockImplementation((key: string) => {
        if (key === 'droseal_inventory_categories') return existingCategories
        if (key === 'droseal_inventory_items') return existingItems
        return null
      })

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.deleteCategory('cat1')
      })

      expect(vi.mocked(localStorage.saveData)).toHaveBeenCalledWith(
        'droseal_inventory_items',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'item1',
            categoryId: 'uncategorized'
          })
        ])
      )
    })

    it('should reassign child categories to parent when deleting category with children', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'grandparent',
          name: 'Grandparent',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'parent',
          name: 'Parent',
          parentId: 'grandparent',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'child',
          name: 'Child',
          parentId: 'parent',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.deleteCategory('parent')
      })

      const childCategory = result.current.categories.find(cat => cat.id === 'child')
      expect(childCategory?.parentId).toBe('grandparent')
    })

    it('should reassign child categories to top-level when deleting top-level category', async () => {
      const existingCategories: InventoryCategory[] = [
        {
          id: 'uncategorized',
          name: '미분류',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'parent',
          name: 'Parent',
          parentId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'child',
          name: 'Child',
          parentId: 'parent',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      vi.mocked(localStorage.loadData).mockReturnValue(existingCategories)

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.deleteCategory('parent')
      })

      const childCategory = result.current.categories.find(cat => cat.id === 'child')
      expect(childCategory?.parentId).toBeUndefined()
    })
  })

  describe('localStorage persistence', () => {
    it('should save categories to localStorage after changes', async () => {
      vi.mocked(localStorage.loadData).mockReturnValue([])

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.addCategory('New Category')
      })

      // Wait for debounce
      await waitFor(
        () => {
          expect(vi.mocked(localStorage.saveData)).toHaveBeenCalledWith(
            'droseal_inventory_categories',
            expect.arrayContaining([
              expect.objectContaining({ name: 'New Category' })
            ])
          )
        },
        { timeout: 1000 }
      )
    })
  })
})
