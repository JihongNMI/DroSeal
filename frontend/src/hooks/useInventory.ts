import { useState, useEffect, useCallback } from 'react'
import { fetchMyInventoryItems, createInventoryItem, deleteInventoryItem as apiDeleteItem, updateInventoryItemNoteAndPrice as apiUpdateInventoryItem, InventoryItemDto } from '../api/inventory'
import { fetchCategoryTree, CategoryDto } from '../api/category'
import type { InventoryState, InventoryItem, HistoryRecord } from '../types'

interface UseInventoryParams {
  addHistoryRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void
}

interface UseInventoryReturn {
  data: InventoryState
  loading: boolean
  error: string | null
  addItem: (item: any) => Promise<void>
  updateItem: (id: string, updates: any) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useInventory({ addHistoryRecord }: UseInventoryParams): UseInventoryReturn {
  const [data, setData] = useState<InventoryState>({
    items: [],
    categories: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const [itemsData, categoriesData] = await Promise.all([
        fetchMyInventoryItems(0, 100),
        fetchCategoryTree()
      ])

      // Map API DTOs to local types if necessary, or update local types to match DTOs
      // For now, mapping broadly
      const mappedItems: InventoryItem[] = itemsData.content.map((dto: InventoryItemDto) => ({
        id: dto.inventoryId.toString(),
        name: dto.customName || dto.collectionItemName || 'Unnamed Item',
        categoryId: dto.categoryId?.toString() || 'uncategorized',
        quantity: 1, // API currently returns single items
        price: dto.purchasedPrice || 0,
        imageUrl: dto.userImageUrl || undefined,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.createdAt), // Backend doesn't return updatedAt, use createdAt
        notes: dto.note
      }))

      // Recursively flatten categories for the local state if needed
      const flattenCategories = (cats: CategoryDto[]): any[] => {
        return cats.map(cat => ({
          id: cat.categoryId.toString(),
          name: cat.name,
          parentId: cat.parentId?.toString(),
          children: cat.children ? flattenCategories(cat.children) : []
        }))
      }

      setData({
        items: mappedItems,
        categories: flattenCategories(categoriesData)
      })
      setError(null)
    } catch (err) {
      console.error('Failed to load inventory from API', err)
      setError('서버에서 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(async (item: any) => {
    try {
      setLoading(true)
      await createInventoryItem({
        itemId: item.itemId,
        categoryId: item.categoryId ? parseInt(item.categoryId) : undefined,
        customName: item.name,
        regType: 'MANUAL',
        note: item.notes,
        purchasedPrice: item.price,
        location: item.location
      })

      addHistoryRecord({
        itemId: 'new',
        itemName: item.name,
        changeType: 'item_created'
      })

      await refresh()
    } catch (err) {
      setError('아이템 추가에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [refresh, addHistoryRecord])

  const updateItem = useCallback(async (id: string, updates: any) => {
    try {
      setLoading(true)
      const numericId = parseInt(id)
      if (!isNaN(numericId)) {
        const request: any = {}
        
        // categoryId 변환
        if (updates.categoryId !== undefined) {
          request.categoryId = updates.categoryId !== 'uncategorized' ? parseInt(updates.categoryId) : null
        }
        
        // 다른 필드들
        if (updates.note !== undefined) request.note = updates.note
        if (updates.price !== undefined) request.purchasedPrice = updates.price
        
        await apiUpdateInventoryItem(numericId, request)
      }

      addHistoryRecord({
        itemId: id,
        itemName: updates.name || 'Updated Item',
        changeType: 'item_updated'
      })

      await refresh()
    } catch (err) {
      setError('아이템 수정에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [refresh, addHistoryRecord])

  const deleteItem = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const numericId = parseInt(id)
      if (!isNaN(numericId)) {
        await apiDeleteItem(numericId)
      }

      addHistoryRecord({
        itemId: id,
        itemName: 'Deleted Item',
        changeType: 'item_deleted'
      })

      await refresh()
    } catch (err) {
      setError('아이템 삭제에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [refresh, addHistoryRecord])

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refresh
  }
}
