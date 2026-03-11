import React from 'react'
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import type { InventoryItem, InventoryCategory } from '../types'

interface Transaction {
  id: string
  linkedInventoryItemId?: string
  amount?: number
  [key: string]: any
}

export interface UseInventoryHandlersParams {
  items: InventoryItem[]
  categories: InventoryCategory[]
  transactions: Transaction[]
  editingItem: InventoryItem | undefined
  itemToDelete: InventoryItem | undefined
  selectedItemIds: Set<string>
  lastSelectedIndex: number | null
  paginatedItems: InventoryItem[]
  bulkEditQuantity: string
  bulkEditPrice: string
  bulkEditEncyclopediaId: string
  selectedItemForImageEdit: InventoryItem | undefined
  addItem: (item: Partial<InventoryItem>) => Promise<any>
  updateItem: (id: string, updates: Partial<InventoryItem>) => void
  deleteItem: (id: string) => void
  setShowItemForm: (show: boolean) => void
  setEditingItem: (item: InventoryItem | undefined) => void
  setSelectedCategoryId: (id: string | undefined) => void
  setExpandedCategoryIds: React.Dispatch<React.SetStateAction<Set<string>>>
  setItemToDelete: (item: InventoryItem | undefined) => void
  setShowDeleteModal: (show: boolean) => void
  setSelectedTransactionId: (id: string | undefined) => void
  setShowTransactionModal: (show: boolean) => void
  setSelectedItemForDetail: (item: InventoryItem | undefined) => void
  setShowItemDetailModal: (show: boolean) => void
  setSelectedItemForImageEdit: (item: InventoryItem | undefined) => void
  setShowImageEditModal: (show: boolean) => void
  setSelectedItemIds: React.Dispatch<React.SetStateAction<Set<string>>>
  setLastSelectedIndex: (index: number | null) => void
  setShowBulkActions: (show: boolean) => void
  setShowBulkEditModal: (show: boolean) => void
  setBulkEditQuantity: (qty: string) => void
  setBulkEditPrice: (price: string) => void
  setBulkEditEncyclopediaId: (id: string) => void
  setExpandedBulkCategories: React.Dispatch<React.SetStateAction<Set<string>>>
  setDraggedItem: (item: InventoryItem | null) => void
  setDragOffset: (offset: { x: number; y: number }) => void
}

export function useInventoryHandlers({
  items,
  categories,
  transactions,
  editingItem,
  itemToDelete,
  selectedItemIds,
  lastSelectedIndex,
  paginatedItems,
  bulkEditQuantity,
  bulkEditPrice,
  bulkEditEncyclopediaId,
  selectedItemForImageEdit,
  addItem,
  updateItem,
  deleteItem,
  setShowItemForm,
  setEditingItem,
  setSelectedCategoryId,
  setExpandedCategoryIds,
  setItemToDelete,
  setShowDeleteModal,
  setSelectedTransactionId,
  setShowTransactionModal,
  setSelectedItemForDetail,
  setShowItemDetailModal,
  setSelectedItemForImageEdit,
  setShowImageEditModal,
  setSelectedItemIds,
  setLastSelectedIndex,
  setShowBulkActions,
  setShowBulkEditModal,
  setBulkEditQuantity,
  setBulkEditPrice,
  setBulkEditEncyclopediaId,
  setExpandedBulkCategories,
  setDraggedItem,
  setDragOffset,
}: UseInventoryHandlersParams) {

  // Item CRUD
  const handleAddItem = async (item: Partial<InventoryItem>, transaction?: { type: 'PURCHASE' | 'SALE', platform: string, price?: number }) => {
    try {
      console.log('[handleAddItem] Item data:', item)
      console.log('[handleAddItem] Transaction data:', transaction)

      const newItem = await addItem(item)
      console.log('[handleAddItem] New item created:', newItem)

      if (transaction) {
        const transactionPrice = transaction.price || item.price
        if (!transactionPrice) {
          console.log('[handleAddItem] Skipping transaction: no price available')
        } else {
          try {
            console.log('[handleAddItem] Creating transaction with price:', transactionPrice)
            const { createTransaction } = await import('../api/accounting')
            await createTransaction({
              transactionType: transaction.type,
              price: transactionPrice,
              transactionDate: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              platform: transaction.platform,
              inventoryId: parseInt(item.id || ''),
            })
            console.log('[handleAddItem] Transaction created successfully')
          } catch (transactionError) {
            console.error('[handleAddItem] Failed to create transaction:', transactionError)
            alert('아이템은 추가되었으나 가계부 등록에 실패했습니다.')
          }
        }
      } else {
        console.log('[handleAddItem] Skipping transaction creation:', { hasTransaction: !!transaction })
      }

      setShowItemForm(false)

      if (item.categoryId) {
        setSelectedCategoryId(item.categoryId)
        setExpandedCategoryIds(prev => {
          const next = new Set(prev)
          next.add(item.categoryId!)
          return next
        })
      }
    } catch (error) {
      console.error('[handleAddItem] Error:', error)
      alert('아이템 추가에 실패했습니다.')
    }
  }

  const handleUpdateItem = async (item: Partial<InventoryItem>, transaction?: { type: 'PURCHASE' | 'SALE', platform: string, price?: number }) => {
    if (!editingItem) return
    try {
      console.log('[handleUpdateItem] Item data:', item)
      console.log('[handleUpdateItem] Transaction data:', transaction)

      await updateItem(editingItem.id, item)

      if (transaction) {
        const transactionPrice = transaction.price || item.price
        if (!transactionPrice) {
          console.log('[handleUpdateItem] Skipping transaction: no price available')
        } else {
          try {
            console.log('[handleUpdateItem] Creating transaction with price:', transactionPrice)
            const { createTransaction } = await import('../api/accounting')
            await createTransaction({
              transactionType: transaction.type,
              price: transactionPrice,
              transactionDate: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              platform: transaction.platform,
              inventoryId: parseInt(editingItem.id),
            })
            console.log('[handleUpdateItem] Transaction created successfully')
          } catch (transactionError) {
            console.error('[handleUpdateItem] Failed to create transaction:', transactionError)
            alert('아이템은 수정되었으나 가계부 등록에 실패했습니다.')
          }
        }
      } else {
        console.log('[handleUpdateItem] Skipping transaction creation: no transaction data')
      }

      setShowItemForm(false)
      setEditingItem(undefined)
    } catch (error) {
      console.error('[handleUpdateItem] Error:', error)
      alert('아이템 수정에 실패했습니다.')
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    console.log('handleEditItem called with:', item)
    setEditingItem(item)
    setShowItemForm(true)
  }

  const handleDeleteItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    setItemToDelete(item)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async (addToAccounting: boolean, platform?: string, salePrice?: number) => {
    if (!itemToDelete) return

    console.log('[handleConfirmDelete] Item to delete:', itemToDelete)
    console.log('[handleConfirmDelete] Add to accounting:', addToAccounting)
    console.log('[handleConfirmDelete] Platform:', platform)
    console.log('[handleConfirmDelete] Sale price:', salePrice)

    try {
      await deleteItem(itemToDelete.id)
      console.log('[handleConfirmDelete] Item deleted successfully')

      if (addToAccounting) {
        const finalPrice = salePrice || itemToDelete.price
        if (!finalPrice) {
          alert('판매가를 입력해주세요.')
          return
        }
        try {
          console.log('[handleConfirmDelete] Creating SALE transaction with price:', finalPrice)
          const { createTransaction } = await import('../api/accounting')
          await createTransaction({
            transactionType: 'SALE',
            price: finalPrice,
            transactionDate: new Date().toISOString().split('T')[0],
            platform: platform || '직접거래',
            inventoryId: parseInt(itemToDelete.id),
          })
          console.log('[handleConfirmDelete] Sale transaction created successfully')
        } catch (transactionError: any) {
          console.error('[handleConfirmDelete] Failed to create sale transaction:', transactionError)
          alert('아이템은 삭제되었으나 가계부 등록에 실패했습니다.')
        }
      }

      setShowDeleteModal(false)
      setItemToDelete(undefined)
    } catch (error: any) {
      console.error('[handleConfirmDelete] Error:', error)
      alert(`아이템 삭제에 실패했습니다: ${error.response?.data?.message || error.message}`)
    }
  }

  // Transaction helpers
  const getTransactionVerification = (item: InventoryItem): 'verified' | 'mismatch' | 'none' => {
    if (!item.price) return 'none'
    const linkedTransaction = transactions.find(t => t.linkedInventoryItemId === item.id)
    if (!linkedTransaction) return 'none'
    return linkedTransaction.amount === item.price ? 'verified' : 'mismatch'
  }

  const getPriceComparisonStatus = (item: InventoryItem, transaction: any): 'match' | 'higher' | 'lower' => {
    if (!item.price) return 'match'
    if (item.price === transaction.amount) return 'match'
    if (item.price > transaction.amount) return 'higher'
    return 'lower'
  }

  const getLinkedTransaction = (item: InventoryItem) => {
    return transactions.find(t => t.linkedInventoryItemId === item.id)
  }

  // Modal handlers
  const handleShowTransaction = (transactionId: string) => {
    setSelectedTransactionId(transactionId)
    setShowTransactionModal(true)
  }

  const handleShowItemDetail = (item: InventoryItem) => {
    setSelectedItemForDetail(item)
    setShowItemDetailModal(true)
  }

  const handleShowImageEdit = (item: InventoryItem) => {
    setSelectedItemForImageEdit(item)
    setShowImageEditModal(true)
  }

  const handleSaveImage = (imageUrl: string | undefined) => {
    if (selectedItemForImageEdit) {
      updateItem(selectedItemForImageEdit.id, { imageUrl })
      setShowImageEditModal(false)
      setSelectedItemForImageEdit(undefined)
    }
  }

  // Checkbox handlers
  const handleToggleSelectItem = (itemId: string, index: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const rangeIds = paginatedItems.slice(start, end + 1).map(item => item.id)
      setSelectedItemIds(prev => {
        const next = new Set(prev)
        rangeIds.forEach(id => next.add(id))
        return next
      })
    } else {
      setSelectedItemIds(prev => {
        const next = new Set(prev)
        if (next.has(itemId)) {
          next.delete(itemId)
        } else {
          next.add(itemId)
        }
        return next
      })
      setLastSelectedIndex(index)
    }
  }

  const handleToggleSelectAll = () => {
    const visibleItemIds = paginatedItems.map(item => item.id)
    const allSelected = visibleItemIds.every(id => selectedItemIds.has(id))
    if (allSelected) {
      setSelectedItemIds(prev => {
        const next = new Set(prev)
        visibleItemIds.forEach(id => next.delete(id))
        return next
      })
    } else {
      setSelectedItemIds(prev => {
        const next = new Set(prev)
        visibleItemIds.forEach(id => next.add(id))
        return next
      })
    }
    setLastSelectedIndex(null)
  }

  // Bulk handlers
  const handleBulkCategoryChange = (newCategoryId: string) => {
    selectedItemIds.forEach(itemId => {
      updateItem(itemId, { categoryId: newCategoryId })
    })
    setSelectedItemIds(new Set())
    setShowBulkActions(false)
  }

  const handleBulkDelete = () => {
    if (confirm(`선택한 ${selectedItemIds.size}개의 아이템을 삭제하시겠습니까?`)) {
      selectedItemIds.forEach(itemId => {
        deleteItem(itemId)
      })
      setSelectedItemIds(new Set())
      setShowBulkActions(false)
    }
  }

  const handleBulkEdit = () => {
    const updates: Partial<InventoryItem> = {}

    if (bulkEditQuantity.trim()) {
      const qty = parseInt(bulkEditQuantity)
      if (!isNaN(qty) && qty >= 0) updates.quantity = qty
    }
    if (bulkEditPrice.trim()) {
      const price = parseFloat(bulkEditPrice)
      if (!isNaN(price) && price >= 0) updates.price = price
    }
    if (bulkEditEncyclopediaId) {
      updates.encyclopediaId = bulkEditEncyclopediaId === 'none' ? undefined : bulkEditEncyclopediaId
    }

    if (Object.keys(updates).length === 0) {
      alert('변경할 항목을 입력해주세요.')
      return
    }

    selectedItemIds.forEach(itemId => {
      updateItem(itemId, updates)
    })
    setSelectedItemIds(new Set())
    setShowBulkActions(false)
    setShowBulkEditModal(false)
    setBulkEditQuantity('')
    setBulkEditPrice('')
    setBulkEditEncyclopediaId('')
  }

  const toggleBulkCategoryExpand = (categoryId: string) => {
    setExpandedBulkCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const itemId = event.active.id as string
    const item = items.find(i => i.id === itemId)
    if (item) {
      setDraggedItem(item)

      const activatorEvent = event.activatorEvent as PointerEvent
      const rect = event.active.rect.current.translated
      if (rect && activatorEvent) {
        const offsetX = activatorEvent.clientX - rect.left
        const offsetY = activatorEvent.clientY - rect.top
        setDragOffset({ x: offsetX, y: offsetY })
      }

      if (!selectedItemIds.has(itemId)) {
        setSelectedItemIds(new Set([itemId]))
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedItem(null)

    if (!over) return

    const itemId = active.id as string
    const categoryId = over.id as string

    if (categories.find(c => c.id === categoryId)) {
      if (selectedItemIds.size > 1 && selectedItemIds.has(itemId)) {
        selectedItemIds.forEach(id => {
          updateItem(id, { categoryId })
        })
        setSelectedItemIds(new Set())
      } else {
        updateItem(itemId, { categoryId })
      }
    }
  }

  return {
    handleAddItem,
    handleUpdateItem,
    handleEditItem,
    handleDeleteItem,
    handleConfirmDelete,
    getTransactionVerification,
    getPriceComparisonStatus,
    getLinkedTransaction,
    handleShowTransaction,
    handleShowItemDetail,
    handleShowImageEdit,
    handleSaveImage,
    handleToggleSelectItem,
    handleToggleSelectAll,
    handleBulkCategoryChange,
    handleBulkDelete,
    handleBulkEdit,
    toggleBulkCategoryExpand,
    handleDragStart,
    handleDragEnd,
  }
}
