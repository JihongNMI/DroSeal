import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useInventory } from './useInventory'
import * as localStorageService from '../services/localStorage'
import type { InventoryItem, InventoryCategory } from '../types'

// Mock the localStorage service
vi.mock('../services/localStorage', () => ({
  saveData: vi.fn(),
  loadData: vi.fn(),
  isStorageNearQuota: vi.fn(() => false),
  cleanupOldHistory: vi.fn(() => 0)
}))

// Mock constants
vi.mock('../constants/storage', () => ({
  STORAGE_KEYS: {
    INVENTORY_ITEMS: 'droseal_inventory_items',
    INVENTORY_CATEGORIES: 'droseal_inventory_categories',
    HISTORY: 'droseal_inventory_history'
  },
  DEBOUNCE_DELAY: 500
}))

// Mock useHistory hook
const mockAddHistoryRecord = vi.fn()
vi.mock('./useHistory', () => ({
  useHistory: vi.fn(() => ({
    history: [],
    addHistoryRecord: mockAddHistoryRecord,
    getItemHistory: vi.fn(() => []),
    loading: false,
    error: null
  }))
}))

describe('useInventory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: return empty arrays
    vi.mocked(localStorageService.loadData).mockReturnValue([])
    mockAddHistoryRecord.mockClear()
  })

  describe('initialization', () => {
    it('should initialize with empty data when no data exists', () => {
      const { result } = renderHook(() => useInventory())

      expect(result.current.loading).toBe(false)
      expect(result.current.data.items).toEqual([])
      expect(result.current.data.categories).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should load existing data from localStorage', () => {
      const existingItems: InventoryItem[] = [
        {
          id: '1',
          name: 'Test Item',
          categoryId: 'cat-1',
          quantity: 5,
          price: 100,
          date: new Date('2024-01-01'),
          notes: 'Test notes',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ]
      const existingCategories: InventoryCategory[] = [
        {
          id: 'cat-1',
          name: 'Category 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ]

      vi.mocked(localStorageService.loadData)
        .mockReturnValueOnce(existingItems)
        .mockReturnValueOnce(existingCategories)

      const { result } = renderHook(() => useInventory())

      expect(result.current.data.items).toEqual(existingItems)
      expect(result.current.data.categories).toEqual(existingCategories)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('addItem', () => {
    it('should add item with all fields including new fields', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'New Item',
          categoryId: 'cat-1',
          quantity: 10,
          price: 200,
          date: new Date('2024-01-15'),
          encyclopediaId: undefined, // Don't test validation here
          notes: 'New item notes'
        })
      })

      expect(result.current.data.items).toHaveLength(1)
      expect(result.current.data.items[0]).toMatchObject({
        name: 'New Item',
        categoryId: 'cat-1',
        quantity: 10,
        price: 200,
        notes: 'New item notes'
      })
      expect(result.current.data.items[0].encyclopediaId).toBeUndefined()
      expect(result.current.data.items[0].id).toBeDefined()
      expect(result.current.data.items[0].createdAt).toBeInstanceOf(Date)
      expect(result.current.data.items[0].updatedAt).toBeInstanceOf(Date)
    })

    it('should default categoryId to uncategorized if null', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Uncategorized Item',
          categoryId: null as any,
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      expect(result.current.data.items[0].categoryId).toBe('uncategorized')
    })

    it('should default categoryId to uncategorized if undefined', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Uncategorized Item',
          categoryId: undefined as any,
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      expect(result.current.data.items[0].categoryId).toBe('uncategorized')
    })

    it('should set default date if not provided', () => {
      const { result } = renderHook(() => useInventory())
      const beforeAdd = new Date()

      act(() => {
        result.current.addItem({
          name: 'Item without date',
          categoryId: 'cat-1',
          quantity: 5,
          date: undefined as any,
          notes: ''
        })
      })

      const afterAdd = new Date()
      const itemDate = result.current.data.items[0].date

      expect(itemDate).toBeInstanceOf(Date)
      expect(itemDate.getTime()).toBeGreaterThanOrEqual(beforeAdd.getTime())
      expect(itemDate.getTime()).toBeLessThanOrEqual(afterAdd.getTime())
    })

    it('should support optional price field', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Item without price',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      expect(result.current.data.items[0].price).toBeUndefined()
    })

    it('should support optional encyclopediaId field', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Item without encyclopedia',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      expect(result.current.data.items[0].encyclopediaId).toBeUndefined()
    })
  })

  describe('updateItem', () => {
    it('should update item with new fields', () => {
      const { result } = renderHook(() => useInventory())

      // Add initial item
      act(() => {
        result.current.addItem({
          name: 'Original Item',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date('2024-01-01'),
          notes: 'Original notes'
        })
      })

      const itemId = result.current.data.items[0].id

      // Update item (without encyclopediaId to avoid validation)
      act(() => {
        result.current.updateItem(itemId, {
          name: 'Updated Item',
          price: 300
        })
      })

      expect(result.current.data.items[0]).toMatchObject({
        name: 'Updated Item',
        price: 300,
        categoryId: 'cat-1',
        quantity: 5
      })
      expect(result.current.data.items[0].encyclopediaId).toBeUndefined()
    })

    it('should ensure categoryId defaults to uncategorized if updated to null', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Item',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      const itemId = result.current.data.items[0].id

      act(() => {
        result.current.updateItem(itemId, {
          categoryId: null as any
        })
      })

      expect(result.current.data.items[0].categoryId).toBe('uncategorized')
    })

    it('should update updatedAt timestamp', async () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Item',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      const itemId = result.current.data.items[0].id
      const originalUpdatedAt = result.current.data.items[0].updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      act(() => {
        result.current.updateItem(itemId, { name: 'Updated' })
      })

      expect(result.current.data.items[0].updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      )
    })
  })

  describe('updateItemQuantity', () => {
    it('should update quantity and create history record', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Test Item',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      const itemId = result.current.data.items[0].id

      act(() => {
        result.current.updateItemQuantity(itemId, 10)
      })

      // Check quantity was updated
      expect(result.current.data.items[0].quantity).toBe(10)

      // Check history record was created
      expect(mockAddHistoryRecord).toHaveBeenCalledWith({
        itemId,
        itemName: 'Test Item',
        changeType: 'quantity_change',
        previousQuantity: 5,
        newQuantity: 10
      })
    })

    it('should handle non-existent item gracefully', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.updateItemQuantity('non-existent-id', 10)
      })

      expect(result.current.error).toContain('not found')
      expect(mockAddHistoryRecord).not.toHaveBeenCalled()
    })
  })

  describe('deleteItem', () => {
    it('should delete item and create history record', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Item to Delete',
          categoryId: 'cat-1',
          quantity: 7,
          date: new Date(),
          notes: ''
        })
      })

      const itemId = result.current.data.items[0].id

      act(() => {
        result.current.deleteItem(itemId)
      })

      // Check item was deleted
      expect(result.current.data.items).toHaveLength(0)

      // Check history record was created
      expect(mockAddHistoryRecord).toHaveBeenCalledWith({
        itemId,
        itemName: 'Item to Delete',
        changeType: 'item_deleted',
        previousQuantity: 7,
        newQuantity: 0
      })
    })

    it('should handle non-existent item gracefully', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.deleteItem('non-existent-id')
      })

      expect(result.current.error).toContain('not found')
      expect(mockAddHistoryRecord).not.toHaveBeenCalled()
    })

    it('should preserve itemName in history for display after deletion', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Deleted Item Name',
          categoryId: 'cat-1',
          quantity: 3,
          date: new Date(),
          notes: ''
        })
      })

      const itemId = result.current.data.items[0].id

      act(() => {
        result.current.deleteItem(itemId)
      })

      expect(mockAddHistoryRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          itemName: 'Deleted Item Name'
        })
      )
    })
  })

  describe('localStorage persistence', () => {
    it('should save to localStorage with debounce after adding item', async () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Test Item',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      // Should not save immediately
      expect(localStorageService.saveData).not.toHaveBeenCalled()

      // Wait for debounce (500ms)
      await waitFor(
        () => {
          expect(localStorageService.saveData).toHaveBeenCalledWith(
            'droseal_inventory_items',
            expect.arrayContaining([
              expect.objectContaining({
                name: 'Test Item'
              })
            ])
          )
        },
        { timeout: 1000 }
      )
    })

    it('should handle save errors gracefully', async () => {
      vi.mocked(localStorageService.saveData).mockImplementation(() => {
        throw new Error('Save failed')
      })

      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Test Item',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      // Wait for debounce
      await waitFor(
        () => {
          expect(result.current.error).toBe('Save failed')
        },
        { timeout: 1000 }
      )
    })
  })

  describe('encyclopedia validation', () => {
    it('should validate encyclopediaId when adding item', () => {
      // Mock encyclopedia data
      vi.mocked(localStorageService.loadData).mockImplementation((key: string) => {
        if (key === 'droseal_encyclopedias') {
          return [{ id: 'valid-enc', title: 'Valid Encyclopedia', items: [] }]
        }
        return []
      })

      const { result } = renderHook(() => useInventory())

      // Should throw error for invalid encyclopedia ID
      let errorThrown = false
      try {
        act(() => {
          result.current.addItem({
            name: 'Test Item',
            categoryId: 'cat-1',
            quantity: 5,
            date: new Date(),
            encyclopediaId: 'invalid-enc',
            notes: ''
          })
        })
      } catch (error) {
        errorThrown = true
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Invalid encyclopedia ID')
      }

      expect(errorThrown).toBe(true)
    })

    it('should allow undefined encyclopediaId', () => {
      const { result } = renderHook(() => useInventory())

      act(() => {
        result.current.addItem({
          name: 'Test Item',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          encyclopediaId: undefined,
          notes: ''
        })
      })

      expect(result.current.data.items).toHaveLength(1)
      expect(result.current.error).toBeNull()
    })

    it('should validate encyclopediaId when updating item', () => {
      // Mock encyclopedia data
      vi.mocked(localStorageService.loadData).mockImplementation((key: string) => {
        if (key === 'droseal_encyclopedias') {
          return [{ id: 'valid-enc', title: 'Valid Encyclopedia', items: [] }]
        }
        return []
      })

      const { result } = renderHook(() => useInventory())

      // Add item first
      act(() => {
        result.current.addItem({
          name: 'Test Item',
          categoryId: 'cat-1',
          quantity: 5,
          date: new Date(),
          notes: ''
        })
      })

      const itemId = result.current.data.items[0].id

      // Should throw error for invalid encyclopedia ID
      let errorThrown = false
      try {
        act(() => {
          result.current.updateItem(itemId, {
            encyclopediaId: 'invalid-enc'
          })
        })
      } catch (error) {
        errorThrown = true
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Invalid encyclopedia ID')
      }

      expect(errorThrown).toBe(true)
    })
  })
})
