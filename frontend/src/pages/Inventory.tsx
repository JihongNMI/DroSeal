import { useState, useMemo } from 'react'
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable, DragStartEvent, Modifier } from '@dnd-kit/core'
import { useCategories } from '../hooks/useCategories'
import { useEncyclopedias } from '../hooks/useEncyclopedias'
import { useInventory } from '../hooks/useInventory'
import { useHistory } from '../hooks/useHistory'
import { useTransactions } from '../hooks/useTransactions'
import { InitialSetupModal } from '../components/inventory/InitialSetupModal'
import { CategoryTree } from '../components/inventory/CategoryTree'
import { CategorySearch } from '../components/inventory/CategorySearch'
import { ItemForm } from '../components/inventory/ItemForm'
import { HistoryPanel } from '../components/inventory/HistoryPanel'
import { ItemSearch, type ItemSearchFilters } from '../components/inventory/ItemSearch'
import { HistorySearch, type HistorySearchFilters } from '../components/inventory/HistorySearch'
import { ImageEditModal } from '../components/inventory/ImageEditModal'
import { formatCategoryPath, searchCategories, getChildren, getCategoryPath } from '../services/categoryService'
import type { InventoryItem, HistoryRecord, InventoryCategory } from '../types'

// Draggable table row component
interface DraggableTableRowProps {
  item: InventoryItem
  index: number
  verification: 'verified' | 'mismatch' | 'none'
  linkedTransaction: any
  encyclopediaName: string | undefined
  selectedItemIds: Set<string>
  categories: InventoryCategory[]
  handleToggleSelectItem: (itemId: string, index: number, event: React.MouseEvent) => void
  handleShowImageEdit: (item: InventoryItem) => void
  handleShowItemDetail: (item: InventoryItem) => void
  formatCategoryPath: (categoryId: string, categories: InventoryCategory[]) => string
  getPriceComparisonStatus: (item: InventoryItem, transaction: any) => 'match' | 'higher' | 'lower'
  handleShowTransaction: (transactionId: string) => void
  handleEditItem: (item: InventoryItem) => void
  handleDeleteItem: (itemId: string) => void
  setSelectedItemIdForHistory: (itemId: string) => void
  setShowHistory: (show: boolean) => void
}

function DraggableTableRow({
  item,
  index,
  verification,
  linkedTransaction,
  encyclopediaName,
  selectedItemIds,
  categories,
  handleToggleSelectItem,
  handleShowImageEdit,
  handleShowItemDetail,
  formatCategoryPath,
  getPriceComparisonStatus,
  handleShowTransaction,
  handleEditItem,
  handleDeleteItem,
  setSelectedItemIdForHistory,
  setShowHistory
}: DraggableTableRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  })

  return (
    <tr
      ref={setNodeRef}
      className={`hover:bg-gray-50 ${isDragging ? 'opacity-50' : ''}`}
    >
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div
            {...listeners}
            {...attributes}
            className="cursor-move text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="드래그하여 카테고리 이동"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 4h12v1H2V4zm0 3.5h12v1H2v-1zM2 11h12v1H2v-1z" />
            </svg>
          </div>
          <input
            type="checkbox"
            checked={selectedItemIds.has(item.id)}
            onClick={(e) => handleToggleSelectItem(item.id, index, e)}
            onChange={() => { }} // Prevent React warning
            className="w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
          />
        </div>
      </td>
      <td className="px-6 py-4">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-12 h-12 object-cover rounded cursor-pointer"
            onClick={() => handleShowImageEdit(item)}
          />
        ) : (
          <div
            className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300"
            onClick={() => handleShowImageEdit(item)}
          >
            <span className="text-gray-400 text-xs text-center">이미지<br />없음</span>
          </div>
        )}
      </td>
      <td
        className="px-6 py-4 text-sm text-gray-900 hover:text-blue-600 cursor-pointer"
        onClick={() => handleShowItemDetail(item)}
      >
        {item.name}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatCategoryPath(item.categoryId, categories)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {item.price ? (
          <span>₩{item.price.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {linkedTransaction ? (
          (() => {
            const status = getPriceComparisonStatus(item, linkedTransaction)
            const colorClass =
              status === 'match' ? 'text-green-600 hover:text-green-800' :
                status === 'higher' ? 'text-red-600 hover:text-red-800' :
                  'text-blue-600 hover:text-blue-800'
            const tooltip =
              status === 'match' ? '회계 기록과 가격 일치' :
                status === 'higher' ? `인벤토리 가격이 더 높음 (₩${item.price?.toLocaleString()} > ₩${linkedTransaction.amount.toLocaleString()})` :
                  `인벤토리 가격이 더 낮음 (₩${item.price?.toLocaleString()} < ₩${linkedTransaction.amount.toLocaleString()})`

            return (
              <button
                onClick={() => handleShowTransaction(linkedTransaction.id)}
                className={`${colorClass} cursor-pointer font-bold text-lg`}
                title={tooltip}
              >
                ✓
              </button>
            )
          })()
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {encyclopediaName || <span className="text-gray-400">-</span>}
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="flex gap-2">
          <button
            onClick={() => handleShowItemDetail(item)}
            className="text-gray-600 hover:text-gray-800"
          >
            상세
          </button>
          <button
            onClick={() => handleEditItem(item)}
            className="text-blue-600 hover:text-blue-800"
          >
            수정
          </button>
          <button
            onClick={() => handleDeleteItem(item.id)}
            className="text-red-600 hover:text-red-800"
          >
            삭제
          </button>
          <button
            onClick={() => {
              setSelectedItemIdForHistory(item.id)
              setShowHistory(true)
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            이력
          </button>
        </div>
      </td>
    </tr>
  )
}

export function Inventory() {
  const { categories, uncategorizedId, addCategory, updateCategory, deleteCategory, error: categoryError } = useCategories()
  const { data: encyclopedias } = useEncyclopedias()
  const { history, addHistoryRecord } = useHistory()
  const { data, addItem, updateItem, deleteItem, loading: inventoryLoading, error: inventoryError } = useInventory({ addHistoryRecord })
  const { data: transactions } = useTransactions()

  // UI state
  const [showInitialSetup, setShowInitialSetup] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>()
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>()
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [selectedItemIdForHistory, setSelectedItemIdForHistory] = useState<string | undefined>()
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | undefined>()
  const [itemSearchFilters, setItemSearchFilters] = useState<ItemSearchFilters | null>(null)
  const [historySearchFilters, setHistorySearchFilters] = useState<HistorySearchFilters | null>(null)
  const [showItemDetailModal, setShowItemDetailModal] = useState(false)
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | undefined>()
  const [showImageEditModal, setShowImageEditModal] = useState(false)
  const [selectedItemForImageEdit, setSelectedItemForImageEdit] = useState<InventoryItem | undefined>()
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [bulkEditQuantity, setBulkEditQuantity] = useState<string>('')
  const [bulkEditPrice, setBulkEditPrice] = useState<string>('')
  const [bulkEditEncyclopediaId, setBulkEditEncyclopediaId] = useState<string>('')
  const [expandedBulkCategories, setExpandedBulkCategories] = useState<Set<string>>(new Set())
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Category form state
  const [categoryName, setCategoryName] = useState('')
  const [categoryParentId, setCategoryParentId] = useState<string | undefined>()
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null)

  // Check if initial setup is needed
  const needsInitialSetup = categories.length === 1 && categories[0].id === uncategorizedId

  // Handle initial setup completion
  const handleInitialSetupComplete = (categoryNames: string[]) => {
    try {
      categoryNames.forEach(name => {
        addCategory(name, undefined)
      })
      setShowInitialSetup(false)
    } catch (error) {
      console.error('Failed to create initial categories:', error)
    }
  }


  // Category management handlers
  const handleAddCategory = () => {
    setCategoryFormError(null)
    try {
      if (!categoryName.trim()) {
        setCategoryFormError('카테고리 이름을 입력해주세요.')
        return
      }
      addCategory(categoryName, categoryParentId)
      setShowCategoryForm(false)
      setCategoryName('')
      setCategoryParentId(undefined)
    } catch (error) {
      setCategoryFormError(error instanceof Error ? error.message : '카테고리 추가에 실패했습니다.')
    }
  }

  const handleUpdateCategory = () => {
    setCategoryFormError(null)
    if (!editingCategoryId) return

    try {
      if (!categoryName.trim()) {
        setCategoryFormError('카테고리 이름을 입력해주세요.')
        return
      }
      updateCategory(editingCategoryId, {
        name: categoryName,
        parentId: categoryParentId
      })
      setShowCategoryForm(false)
      setCategoryName('')
      setCategoryParentId(undefined)
      setEditingCategoryId(undefined)
    } catch (error) {
      setCategoryFormError(error instanceof Error ? error.message : '카테고리 수정에 실패했습니다.')
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (categoryId === uncategorizedId) {
      return // Should not happen due to disabled button
    }

    if (confirm('이 카테고리를 삭제하시겠습니까? 카테고리 내 아이템은 미분류로 이동됩니다.')) {
      try {
        deleteCategory(categoryId)
      } catch (error) {
        alert(error instanceof Error ? error.message : '카테고리 삭제에 실패했습니다.')
      }
    }
  }

  const handleEditCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return

    setCategoryName(category.name)
    setCategoryParentId(category.parentId)
    setEditingCategoryId(categoryId)
    setShowCategoryForm(true)
    setCategoryFormError(null)
  }

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategoryIds(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleCategoryClick = (categoryId: string) => {
    // Select the category
    setSelectedCategoryId(categoryId)

    // Toggle expand/collapse
    handleToggleExpand(categoryId)
  }

  // Item management handlers
  const handleAddItem = async (item: Partial<InventoryItem>) => {
    try {
      await addItem(item)
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
      alert('아이템 추가에 실패했습니다.')
    }
  }

  const handleUpdateItem = async (item: Partial<InventoryItem>) => {
    if (editingItem) {
      try {
        await updateItem(editingItem.id, item)
        setShowItemForm(false)
        setEditingItem(undefined)
      } catch (error) {
        alert('아이템 수정에 실패했습니다.')
      }
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    console.log('handleEditItem called with:', item)
    setEditingItem(item)
    setShowItemForm(true)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('이 아이템을 삭제하시겠습니까?')) {
      try {
        await deleteItem(itemId)
      } catch (error) {
        alert('아이템 삭제에 실패했습니다.')
      }
    }
  }

  // Get transaction verification status
  const getTransactionVerification = (item: InventoryItem): 'verified' | 'mismatch' | 'none' => {
    if (!item.price) return 'none'

    const linkedTransaction = transactions.find(t => t.linkedInventoryItemId === item.id)
    if (!linkedTransaction) return 'none'

    return linkedTransaction.amount === item.price ? 'verified' : 'mismatch'
  }

  // Get detailed price comparison status
  const getPriceComparisonStatus = (item: InventoryItem, transaction: any): 'match' | 'higher' | 'lower' => {
    if (!item.price) return 'match'
    if (item.price === transaction.amount) return 'match'
    if (item.price > transaction.amount) return 'higher'
    return 'lower'
  }

  // Get linked transaction for an item
  const getLinkedTransaction = (item: InventoryItem) => {
    return transactions.find(t => t.linkedInventoryItemId === item.id)
  }

  // Handle transaction modal
  const handleShowTransaction = (transactionId: string) => {
    setSelectedTransactionId(transactionId)
    setShowTransactionModal(true)
  }

  // Handle item detail modal
  const handleShowItemDetail = (item: InventoryItem) => {
    setSelectedItemForDetail(item)
    setShowItemDetailModal(true)
  }

  // Handle image edit modal
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
      // Shift + click: select range
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const rangeIds = paginatedItems.slice(start, end + 1).map(item => item.id)

      setSelectedItemIds(prev => {
        const next = new Set(prev)
        rangeIds.forEach(id => next.add(id))
        return next
      })
    } else {
      // Normal click: toggle single item
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
      // Deselect all visible items on current page
      setSelectedItemIds(prev => {
        const next = new Set(prev)
        visibleItemIds.forEach(id => next.delete(id))
        return next
      })
    } else {
      // Select all visible items on current page
      setSelectedItemIds(prev => {
        const next = new Set(prev)
        visibleItemIds.forEach(id => next.add(id))
        return next
      })
    }
    setLastSelectedIndex(null)
  }

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
      if (!isNaN(qty) && qty >= 0) {
        updates.quantity = qty
      }
    }

    if (bulkEditPrice.trim()) {
      const price = parseFloat(bulkEditPrice)
      if (!isNaN(price) && price >= 0) {
        updates.price = price
      }
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
    const item = data.items.find(i => i.id === itemId)
    if (item) {
      setDraggedItem(item)

      // Calculate cursor offset from the dragging element
      const activatorEvent = event.activatorEvent as PointerEvent
      const rect = event.active.rect.current.translated
      if (rect && activatorEvent) {
        const offsetX = activatorEvent.clientX - rect.left
        const offsetY = activatorEvent.clientY - rect.top
        setDragOffset({ x: offsetX, y: offsetY })
      }

      // If the dragged item is not selected, select only it
      // If it's already selected, keep all selections (for multi-drag)
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

    // Check if dropping on a category
    if (categories.find(c => c.id === categoryId)) {
      // If multiple items are selected, move all of them
      if (selectedItemIds.size > 1 && selectedItemIds.has(itemId)) {
        selectedItemIds.forEach(id => {
          updateItem(id, { categoryId })
        })
        setSelectedItemIds(new Set()) // Clear selection after move
      } else {
        // Move single item
        updateItem(itemId, { categoryId })
      }
    }
  }


  // Get encyclopedia name
  const getEncyclopediaName = (encyclopediaId?: string): string | undefined => {
    if (!encyclopediaId) return undefined
    return encyclopedias.find(e => e.id === encyclopediaId)?.title
  }

  // Parse date string (supports YYYY-MM-DD, YYYY-MM, YYYY)
  const parseDate = (dateStr: string): { start: Date, end: Date } | null => {
    if (!dateStr) return null

    const parts = dateStr.split('-')
    if (parts.length === 3) {
      // YYYY-MM-DD
      const date = new Date(dateStr)
      return { start: date, end: new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1) }
    } else if (parts.length === 2) {
      // YYYY-MM
      const year = parseInt(parts[0])
      const month = parseInt(parts[1])
      const start = new Date(year, month - 1, 1)
      const end = new Date(year, month, 0, 23, 59, 59, 999)
      return { start, end }
    } else if (parts.length === 1) {
      // YYYY
      const year = parseInt(parts[0])
      const start = new Date(year, 0, 1)
      const end = new Date(year, 11, 31, 23, 59, 59, 999)
      return { start, end }
    }
    return null
  }

  // Apply item search filters
  const applyItemFilters = (items: InventoryItem[], filters: ItemSearchFilters | null): InventoryItem[] => {
    if (!filters) return items

    return items.filter(item => {
      // Text search
      if (filters.textSearch) {
        if (filters.textField === 'name') {
          if (!item.name.toLowerCase().includes(filters.textSearch.toLowerCase())) return false
        } else if (filters.textField === 'notes') {
          if (!item.notes.toLowerCase().includes(filters.textSearch.toLowerCase())) return false
        } else if (filters.textField === 'encyclopedia') {
          const encyclopediaName = getEncyclopediaName(item.encyclopediaId)
          if (!encyclopediaName || !encyclopediaName.toLowerCase().includes(filters.textSearch.toLowerCase())) return false
        }
      }

      // Category filter
      if (filters.categoryId) {
        if (item.categoryId !== filters.categoryId) return false
      }

      // Verification status filter
      if (filters.verificationStatus !== 'all') {
        const linkedTransaction = transactions.find(t => t.linkedInventoryItemId === item.id)

        if (filters.verificationStatus === 'none') {
          if (linkedTransaction) return false
        } else if (filters.verificationStatus === 'verified') {
          if (!linkedTransaction || !item.price || linkedTransaction.amount !== item.price) return false
        } else if (filters.verificationStatus === 'mismatch') {
          if (!linkedTransaction || !item.price || linkedTransaction.amount === item.price) return false
        }
      }

      // Quantity filter
      if (filters.quantityValue !== null) {
        if (filters.quantityOperator === '>=' && item.quantity < filters.quantityValue) return false
        if (filters.quantityOperator === '=' && item.quantity !== filters.quantityValue) return false
        if (filters.quantityOperator === '<=' && item.quantity > filters.quantityValue) return false
      }

      // Price filter
      if (filters.priceValue !== null) {
        if (!item.price) return false
        if (filters.priceOperator === '>=' && item.price < filters.priceValue) return false
        if (filters.priceOperator === '=' && item.price !== filters.priceValue) return false
        if (filters.priceOperator === '<=' && item.price > filters.priceValue) return false
      }

      // Date range filter
      const itemDate = new Date(item.date)
      if (filters.dateFrom) {
        const fromRange = parseDate(filters.dateFrom)
        if (fromRange && itemDate < fromRange.start) return false
      }
      if (filters.dateTo) {
        const toRange = parseDate(filters.dateTo)
        if (toRange && itemDate > toRange.end) return false
      }

      return true
    })
  }

  // Apply history search filters
  const applyHistoryFilters = (history: HistoryRecord[], filters: HistorySearchFilters | null): HistoryRecord[] => {
    if (!filters) return history

    return history.filter(record => {
      // Change type filter
      if (filters.changeTypes.length > 0) {
        if (!filters.changeTypes.includes(record.changeType)) return false
      }

      // Text search
      if (filters.textSearch) {
        if (filters.textField === 'itemName') {
          if (!record.itemName.toLowerCase().includes(filters.textSearch.toLowerCase())) return false
        } else if (filters.textField === 'notes') {
          const hasNotesChange = record.changeType === 'notes_change'
          if (!hasNotesChange) return false
          const prevNotes = record.previousNotes || ''
          const newNotes = record.newNotes || ''
          if (!prevNotes.toLowerCase().includes(filters.textSearch.toLowerCase()) &&
            !newNotes.toLowerCase().includes(filters.textSearch.toLowerCase())) return false
        }
      }

      // Quantity filter (for quantity_change records)
      if (filters.quantityValue !== null) {
        if (record.changeType !== 'quantity_change' && record.changeType !== 'item_deleted') return false
        const qty = record.newQuantity ?? 0
        if (filters.quantityOperator === '>=' && qty < filters.quantityValue) return false
        if (filters.quantityOperator === '=' && qty !== filters.quantityValue) return false
        if (filters.quantityOperator === '<=' && qty > filters.quantityValue) return false
      }

      // Price filter (for price_change records)
      if (filters.priceValue !== null) {
        if (record.changeType !== 'price_change') return false
        const price = record.newPrice ?? 0
        if (filters.priceOperator === '>=' && price < filters.priceValue) return false
        if (filters.priceOperator === '=' && price !== filters.priceValue) return false
        if (filters.priceOperator === '<=' && price > filters.priceValue) return false
      }

      // Date range filter
      const recordDate = new Date(record.timestamp)
      if (filters.dateFrom) {
        const fromRange = parseDate(filters.dateFrom)
        if (fromRange && recordDate < fromRange.start) return false
      }
      if (filters.dateTo) {
        const toRange = parseDate(filters.dateTo)
        if (toRange && recordDate > toRange.end) return false
      }

      return true
    })
  }

  // Filter items by search and selected category
  const filteredItems = useMemo(() => {
    let filtered = data.items

    // Filter by selected category
    if (selectedCategoryId) {
      filtered = filtered.filter(item => item.categoryId === selectedCategoryId)
    }

    // Apply search filters
    filtered = applyItemFilters(filtered, itemSearchFilters)

    return filtered
  }, [data.items, selectedCategoryId, itemSearchFilters])

  // Filter history by search filters
  const filteredHistory = useMemo(() => {
    return applyHistoryFilters(history, historySearchFilters)
  }, [history, historySearchFilters])

  // Paginate filtered items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredItems.slice(startIndex, endIndex)
  }, [filteredItems, currentPage, ITEMS_PER_PAGE])

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [itemSearchFilters, selectedCategoryId])

  // Check if all visible items on current page are selected
  const allVisibleSelected = paginatedItems.length > 0 && paginatedItems.every(item => selectedItemIds.has(item.id))
  const someVisibleSelected = paginatedItems.some(item => selectedItemIds.has(item.id))

  // Filter categories by search query and auto-expand matched paths
  const { filteredCategories, matchedCategoryIds } = useMemo(() => {
    const sortCategories = (cats: InventoryCategory[]) => {
      return cats.sort((a, b) => {
        // Always put "uncategorized" first
        if (a.id === uncategorizedId) return -1
        if (b.id === uncategorizedId) return 1
        return a.name.localeCompare(b.name, 'ko')
      })
    }

    if (!searchQuery.trim()) {
      return {
        filteredCategories: sortCategories([...categories]),
        matchedCategoryIds: new Set<string>()
      }
    }

    const searchResult = searchCategories(searchQuery, categories)

    // Auto-expand all visible categories when searching
    setExpandedCategoryIds(prev => {
      const next = new Set(prev)
      searchResult.visibleCategories.forEach(id => next.add(id))
      return next
    })

    const filtered = categories.filter(cat => searchResult.visibleCategories.has(cat.id))

    return {
      filteredCategories: sortCategories(filtered),
      matchedCategoryIds: searchResult.matchedCategories
    }
  }, [categories, searchQuery, uncategorizedId])


  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">인벤토리</h1>
            </div>
            <div className="flex gap-3">
              {selectedItemIds.size > 0 && (
                <div className="relative flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedItemIds.size}개 선택됨
                  </span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    일괄 작업
                  </button>
                  {showBulkActions && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowBulkActions(false)}
                      />
                      <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-2 min-w-64 max-h-96 overflow-y-auto">
                        <div className="space-y-1">
                          {/* Category Move with Accordion */}
                          <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b">카테고리 이동</div>
                          {categories
                            .filter(cat => !cat.parentId)
                            .sort((a, b) => {
                              if (a.id === uncategorizedId) return -1
                              if (b.id === uncategorizedId) return 1
                              return a.name.localeCompare(b.name, 'ko')
                            })
                            .map(category => {
                              const children = getChildren(category.id, categories)
                              const hasChildren = children.length > 0
                              const isExpanded = expandedBulkCategories.has(category.id)

                              return (
                                <div key={category.id}>
                                  <div className="flex items-center">
                                    {hasChildren && (
                                      <button
                                        onClick={() => toggleBulkCategoryExpand(category.id)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                      >
                                        <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleBulkCategoryChange(category.id)}
                                      className="flex-1 text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                                      style={{ marginLeft: hasChildren ? '0' : '24px' }}
                                    >
                                      {category.name}
                                    </button>
                                  </div>
                                  {isExpanded && hasChildren && (
                                    <div className="ml-6">
                                      {children.map(child => (
                                        <button
                                          key={child.id}
                                          onClick={() => handleBulkCategoryChange(child.id)}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                                        >
                                          └ {child.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}

                          <div className="border-t my-1"></div>

                          {/* Bulk Edit */}
                          <button
                            onClick={() => {
                              setShowBulkEditModal(true)
                              setShowBulkActions(false)
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                          >
                            수량/가격/도감 일괄 수정
                          </button>

                          <div className="border-t my-1"></div>

                          {/* Delete */}
                          <button
                            onClick={handleBulkDelete}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            선택 항목 삭제
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {!showHistory && (
                <ItemSearch
                  categories={categories}
                  onSearch={(filters) => setItemSearchFilters(filters)}
                  onClear={() => setItemSearchFilters(null)}
                />
              )}
              {showHistory && (
                <HistorySearch
                  onSearch={(filters) => setHistorySearchFilters(filters)}
                  onClear={() => setHistorySearchFilters(null)}
                />
              )}
              <button
                onClick={() => {
                  setEditingItem(undefined)
                  setShowItemForm(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                아이템 추가
              </button>
              <button
                onClick={() => {
                  setSelectedItemIdForHistory(undefined) // 전체 이력 표시
                  setShowHistory(!showHistory)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                {showHistory ? '이력 숨기기' : '이력 보기'}
              </button>
            </div>
          </div>

          {/* Error display */}
          {categoryError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">오류: {categoryError}</p>
            </div>
          )}

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar - Categories */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="font-semibold text-gray-900 mb-4">카테고리</h2>

                {/* Category add button */}
                <button
                  onClick={() => {
                    setCategoryName('')
                    setCategoryParentId(selectedCategoryId)
                    setEditingCategoryId(undefined)
                    setShowCategoryForm(true)
                    setCategoryFormError(null)
                  }}
                  className="w-full mb-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  카테고리 추가
                </button>

                {/* Category search */}
                <CategorySearch
                  categories={categories}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                {/* Category tree */}
                <div className="mt-4">
                  <CategoryTree
                    categories={filteredCategories}
                    items={data.items}
                    selectedCategoryId={selectedCategoryId}
                    expandedCategoryIds={expandedCategoryIds}
                    matchedCategoryIds={matchedCategoryIds}
                    totalItemCount={data.items.length}
                    onCategoryClick={handleCategoryClick}
                    onToggleExpand={handleToggleExpand}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onShowAll={() => setSelectedCategoryId(undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Right content - Items and History */}
            <div className="lg:col-span-3">
              {showHistory ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">수량 변동 이력</h2>
                  <HistoryPanel
                    itemId={selectedItemIdForHistory}
                    categoryId={selectedCategoryId}
                    history={filteredHistory}
                    items={data.items}
                    categories={categories}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg mb-2">아이템이 없습니다</p>
                      <p className="text-gray-400 text-sm">아이템을 추가하여 인벤토리를 시작하세요</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-3 py-3 text-left">
                                <div className="flex items-center gap-3">
                                  <div className="w-4 flex-shrink-0"></div>
                                  <input
                                    type="checkbox"
                                    checked={allVisibleSelected}
                                    ref={(input) => {
                                      if (input) {
                                        input.indeterminate = someVisibleSelected && !allVisibleSelected
                                      }
                                    }}
                                    onChange={handleToggleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                                  />
                                </div>
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20"></th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수량</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">증빙</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도감</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {paginatedItems.map((item, index) => {
                              const verification = getTransactionVerification(item)
                              const linkedTransaction = getLinkedTransaction(item)
                              const encyclopediaName = getEncyclopediaName(item.encyclopediaId)

                              return (
                                <DraggableTableRow
                                  key={item.id}
                                  item={item}
                                  index={index}
                                  verification={verification}
                                  linkedTransaction={linkedTransaction}
                                  encyclopediaName={encyclopediaName}
                                  selectedItemIds={selectedItemIds}
                                  categories={categories}
                                  handleToggleSelectItem={handleToggleSelectItem}
                                  handleShowImageEdit={handleShowImageEdit}
                                  handleShowItemDetail={handleShowItemDetail}
                                  formatCategoryPath={formatCategoryPath}
                                  getPriceComparisonStatus={getPriceComparisonStatus}
                                  handleShowTransaction={handleShowTransaction}
                                  handleEditItem={handleEditItem}
                                  handleDeleteItem={handleDeleteItem}
                                  setSelectedItemIdForHistory={setSelectedItemIdForHistory}
                                  setShowHistory={setShowHistory}
                                />
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                          <div className="text-sm text-gray-700">
                            {filteredItems.length}개 중 {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} 표시
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              이전
                            </button>
                            <div className="flex gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-1 border rounded ${currentPage === page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              다음
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Initial Setup Modal */}
        {(needsInitialSetup || showInitialSetup) && (
          <InitialSetupModal
            isOpen={true}
            onComplete={handleInitialSetupComplete}
          />
        )}

        {/* Item Form Modal */}
        {showItemForm && (
          <ItemForm
            item={editingItem}
            categories={categories}
            encyclopedias={encyclopedias}
            uncategorizedId={uncategorizedId}
            onSubmit={editingItem ? handleUpdateItem : handleAddItem}
            onCancel={() => {
              setShowItemForm(false)
              setEditingItem(undefined)
            }}
          />
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCategoryId ? '카테고리 수정' : '카테고리 추가'}
              </h2>

              {categoryFormError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">{categoryFormError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="카테고리 이름 입력"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상위 카테고리 (선택사항)
                  </label>
                  <select
                    value={categoryParentId || ''}
                    onChange={(e) => setCategoryParentId(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={editingCategoryId === uncategorizedId}
                    title={categoryParentId ? formatCategoryPath(categoryParentId, categories) : ''}
                  >
                    <option value="">없음 (최상위 카테고리)</option>
                    {categories
                      .filter(c => c.id !== editingCategoryId && c.id !== uncategorizedId)
                      .map(category => {
                        const path = getCategoryPath(category.id, categories)
                        const depth = path.length
                        const indent = '\u00A0\u00A0'.repeat(depth - 1) // Non-breaking spaces for indentation
                        const fullPath = formatCategoryPath(category.id, categories)

                        return (
                          <option
                            key={category.id}
                            value={category.id}
                            title={fullPath}
                          >
                            {indent}{depth > 1 ? '└ ' : ''}{category.name}
                          </option>
                        )
                      })}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCategoryForm(false)
                    setCategoryName('')
                    setCategoryParentId(undefined)
                    setEditingCategoryId(undefined)
                    setCategoryFormError(null)
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategoryId ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {showTransactionModal && selectedTransactionId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">회계 기록 상세</h2>

              {(() => {
                const transaction = transactions.find(t => t.id === selectedTransactionId)
                if (!transaction) return <p>거래를 찾을 수 없습니다.</p>

                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                      <p className="text-gray-900">
                        {transaction.type === 'income' ? '수입' : '지출'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
                      <p className="text-gray-900 text-lg font-semibold">
                        ₩{transaction.amount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                      <p className="text-gray-900">{transaction.description}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                      <p className="text-gray-900">{transaction.category || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                      <p className="text-gray-900">
                        {transaction.date.toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                )
              })()}

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTransactionModal(false)
                    setSelectedTransactionId(undefined)
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Item Detail Modal */}
        {showItemDetailModal && selectedItemForDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">아이템 상세 정보</h2>

              <div className="space-y-4">
                {/* Image */}
                {selectedItemForDetail.imageUrl ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이미지</label>
                    <img
                      src={selectedItemForDetail.imageUrl}
                      alt={selectedItemForDetail.name}
                      className="w-full max-w-md rounded-lg cursor-pointer hover:opacity-80"
                      onClick={() => {
                        setShowItemDetailModal(false)
                        handleShowImageEdit(selectedItemForDetail)
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">클릭하여 이미지 수정</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이미지</label>
                    <div
                      className="w-full max-w-md h-48 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        setShowItemDetailModal(false)
                        handleShowImageEdit(selectedItemForDetail)
                      }}
                    >
                      <span className="text-gray-400">이미지 없음 (클릭하여 추가)</span>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <p className="text-gray-900 text-lg font-semibold">{selectedItemForDetail.name}</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <p className="text-gray-900">{formatCategoryPath(selectedItemForDetail.categoryId, categories)}</p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
                  <p className="text-gray-900">{selectedItemForDetail.quantity}</p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                  <p className="text-gray-900">
                    {selectedItemForDetail.price ? `₩${selectedItemForDetail.price.toLocaleString()}` : '-'}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">일자</label>
                  <p className="text-gray-900">
                    {new Date(selectedItemForDetail.date).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* Encyclopedia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">도감</label>
                  <p className="text-gray-900">
                    {getEncyclopediaName(selectedItemForDetail.encyclopediaId) || '-'}
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedItemForDetail.notes || '-'}
                  </p>
                </div>

                {/* Verification Status */}
                {(() => {
                  const linkedTransaction = getLinkedTransaction(selectedItemForDetail)
                  if (linkedTransaction) {
                    const status = getPriceComparisonStatus(selectedItemForDetail, linkedTransaction)
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">증빙 상태</label>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${status === 'match' ? 'text-green-600' :
                            status === 'higher' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>
                            ✓
                          </span>
                          <span className="text-gray-900">
                            {status === 'match' ? '회계 기록과 가격 일치' :
                              status === 'higher' ? `인벤토리 가격이 더 높음 (₩${selectedItemForDetail.price?.toLocaleString()} > ₩${linkedTransaction.amount.toLocaleString()})` :
                                `인벤토리 가격이 더 낮음 (₩${selectedItemForDetail.price?.toLocaleString()} < ₩${linkedTransaction.amount.toLocaleString()})`}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                {/* Created/Updated dates */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">생성일:</span> {new Date(selectedItemForDetail.createdAt).toLocaleString('ko-KR')}
                    </div>
                    <div>
                      <span className="font-medium">수정일:</span> {new Date(selectedItemForDetail.updatedAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowItemDetailModal(false)
                    setSelectedItemForDetail(undefined)
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    setShowItemDetailModal(false)
                    handleEditItem(selectedItemForDetail)
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Edit Modal */}
        {showImageEditModal && selectedItemForImageEdit && (
          <ImageEditModal
            currentImageUrl={selectedItemForImageEdit.imageUrl}
            itemName={selectedItemForImageEdit.name}
            onSave={handleSaveImage}
            onCancel={() => {
              setShowImageEditModal(false)
              setSelectedItemForImageEdit(undefined)
            }}
          />
        )}

        {/* Bulk Edit Modal */}
        {showBulkEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">일괄 수정</h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ 주의: 선택한 {selectedItemIds.size}개의 아이템이 일괄적으로 변경됩니다
                </p>
              </div>

              <div className="space-y-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수량 (선택사항)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkEditQuantity}
                    onChange={(e) => setBulkEditQuantity(e.target.value)}
                    placeholder="변경하지 않으려면 비워두세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가격 (선택사항)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bulkEditPrice}
                    onChange={(e) => setBulkEditPrice(e.target.value)}
                    placeholder="변경하지 않으려면 비워두세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Encyclopedia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    도감 (선택사항)
                  </label>
                  <select
                    value={bulkEditEncyclopediaId}
                    onChange={(e) => setBulkEditEncyclopediaId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">변경하지 않음</option>
                    <option value="none">도감 제거</option>
                    {encyclopedias.map(encyclopedia => (
                      <option key={encyclopedia.id} value={encyclopedia.id}>
                        {encyclopedia.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBulkEditModal(false)
                    setBulkEditQuantity('')
                    setBulkEditPrice('')
                    setBulkEditEncyclopediaId('')
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleBulkEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {draggedItem ? (
          <div
            className="bg-white shadow-lg rounded px-3 py-2 border-2 border-blue-500 text-sm inline-block whitespace-nowrap pointer-events-none"
            style={{
              cursor: 'grabbing',
              transform: `translate(-${dragOffset.x}px, -${dragOffset.y}px)`
            }}
          >
            {selectedItemIds.size > 1 && selectedItemIds.has(draggedItem.id) ? (
              <div className="font-medium text-blue-600">
                {selectedItemIds.size}개 이동 중
              </div>
            ) : (
              <>
                <div className="font-medium">{draggedItem.name}</div>
                <div className="text-xs text-gray-500">
                  {formatCategoryPath(draggedItem.categoryId, categories)}
                </div>
              </>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default Inventory
