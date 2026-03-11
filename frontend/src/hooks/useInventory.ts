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
        quantity: dto.quantity ?? 1, // Use nullish coalescing to allow 0
        price: dto.purchasedPrice || 0,
        date: dto.purchasedAt ? new Date(dto.purchasedAt) : new Date(dto.createdAt),
        encyclopediaId: dto.collectionId?.toString(),
        imageUrl: dto.userImageUrl || undefined,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.createdAt),
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
      const newItem = await createInventoryItem({
        itemId: item.itemId,
        collectionId: item.encyclopediaId ? parseInt(item.encyclopediaId) : undefined,
        categoryId: item.categoryId ? parseInt(item.categoryId) : undefined,
        customName: item.name,
        quantity: item.quantity ?? 1, // Use nullish coalescing to allow 0
        regType: 'MANUAL',
        note: item.notes,
        purchasedPrice: item.price,
        purchasedAt: item.date ? new Date(item.date).toISOString() : undefined,
        location: item.location,
        userImageUrl: item.imageUrl
      })

      addHistoryRecord({
        itemId: 'new',
        itemName: item.name,
        changeType: 'item_created'
      })

      await refresh()
      
      // Return the created item with ID
      return {
        id: newItem.inventoryId.toString(),
        ...item
      }
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

      // 현재 아이템 정보 가져오기
      const currentItem = data.items.find(item => item.id === id)
      if (!currentItem) {
        throw new Error('Item not found')
      }
      
      const itemName = updates.name || currentItem.name

      const numericId = parseInt(id)
      if (!isNaN(numericId)) {
        const request: any = {}

        // collectionId 변환
        if (updates.encyclopediaId !== undefined) {
          request.collectionId = updates.encyclopediaId ? parseInt(updates.encyclopediaId) : null
        }

        // categoryId 변환
        if (updates.categoryId !== undefined) {
          request.categoryId = updates.categoryId !== 'uncategorized' ? parseInt(updates.categoryId) : null
        }

        // 다른 필드들 매핑
        if (updates.name !== undefined) request.customName = updates.name
        if (updates.quantity !== undefined) request.quantity = updates.quantity
        if (updates.notes !== undefined) request.note = updates.notes
        if (updates.price !== undefined) request.purchasedPrice = updates.price
        if (updates.imageUrl !== undefined) request.userImageUrl = updates.imageUrl
        if (updates.date !== undefined) {
          // Date 객체를 ISO string으로 변환
          const dateValue = updates.date instanceof Date ? updates.date : new Date(updates.date)
          request.purchasedAt = dateValue.toISOString()
        }

        await apiUpdateInventoryItem(numericId, request)
      }

      // 변경 타입 결정 및 상세 정보 기록 (여러 변경사항을 모두 기록)
      const changes: Array<Omit<HistoryRecord, 'id' | 'timestamp'>> = []

      if (updates.quantity !== undefined && updates.quantity !== currentItem.quantity) {
        changes.push({
          itemId: id,
          itemName: itemName,
          changeType: 'quantity_change',
          previousQuantity: currentItem.quantity,
          newQuantity: updates.quantity
        })
      }
      
      if (updates.price !== undefined && updates.price !== currentItem.price) {
        changes.push({
          itemId: id,
          itemName: itemName,
          changeType: 'price_change',
          previousPrice: currentItem.price,
          newPrice: updates.price
        })
      }
      
      if (updates.notes !== undefined && updates.notes !== currentItem.notes) {
        changes.push({
          itemId: id,
          itemName: itemName,
          changeType: 'notes_change',
          previousNotes: currentItem.notes,
          newNotes: updates.notes
        })
      }
      
      if (updates.name !== undefined && updates.name !== currentItem.name) {
        changes.push({
          itemId: id,
          itemName: currentItem.name, // Use old name for history
          changeType: 'name_change',
          previousName: currentItem.name,
          newName: updates.name
        })
      }
      
      if (updates.categoryId !== undefined && updates.categoryId !== currentItem.categoryId) {
        changes.push({
          itemId: id,
          itemName: itemName,
          changeType: 'category_changed',
          previousCategoryId: currentItem.categoryId,
          newCategoryId: updates.categoryId
        })
      }
      
      if (updates.imageUrl !== undefined && updates.imageUrl !== currentItem.imageUrl) {
        changes.push({
          itemId: id,
          itemName: itemName,
          changeType: 'image_change'
        })
      }

      // 변경사항이 있으면 모두 기록, 없으면 일반 업데이트로 기록
      if (changes.length > 0) {
        changes.forEach(change => addHistoryRecord(change))
      } else {
        addHistoryRecord({
          itemId: id,
          itemName: itemName,
          changeType: 'item_updated'
        })
      }

      await refresh()
    } catch (err) {
      setError('아이템 수정에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [data.items, refresh, addHistoryRecord])

  const deleteItem = useCallback(async (id: string) => {
    try {
      setLoading(true)
      
      // 삭제 전 현재 아이템 정보 저장
      const currentItem = data.items.find(item => item.id === id)
      const itemName = currentItem?.name || 'Deleted Item'
      const itemQuantity = currentItem?.quantity || 0
      
      const numericId = parseInt(id)
      if (!isNaN(numericId)) {
        await apiDeleteItem(numericId)
      }

      addHistoryRecord({
        itemId: id,
        itemName: itemName,
        changeType: 'item_deleted',
        previousQuantity: itemQuantity,
        newQuantity: 0
      })

      await refresh()
    } catch (err) {
      setError('아이템 삭제에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [data.items, refresh, addHistoryRecord])

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
