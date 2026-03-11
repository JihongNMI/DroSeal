import { useState, useMemo } from 'react'
import type { HistoryRecord, InventoryItem } from '../../types'

interface HistoryPanelProps {
  itemId?: string // undefined shows all history, defined shows item-specific
  categoryId?: string // undefined shows all, defined shows category-specific
  history: HistoryRecord[]
  items: InventoryItem[] // Needed for category filtering
  categories: any[] // Needed for category name lookup
}

const ITEMS_PER_PAGE = 20

/**
 * Component for displaying inventory history records
 * 
 * Features:
 * - Displays history in reverse chronological order (newest first)
 * - Filters by itemId if provided, otherwise shows all history
 * - Format: "[Date] [Item Name]: [Change Description]"
 * - Quantity changes: "수량 변경: X → Y"
 * - Deletions: "아이템 삭제 (수량: X)"
 * - Pagination for large histories
 * 
 * @param itemId - Optional item ID to filter history (undefined shows all)
 * @param history - Array of all history records
 */
export function HistoryPanel({ itemId, categoryId, history, items, categories }: HistoryPanelProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || '미분류'
  }

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let filtered = history

    // Filter by itemId if provided
    if (itemId) {
      filtered = filtered.filter(record => record.itemId === itemId)
    }
    // Filter by categoryId if provided (and no specific itemId)
    else if (categoryId) {
      const categoryItemIds = new Set(
        items.filter(item => item.categoryId === categoryId).map(item => item.id)
      )
      filtered = filtered.filter(record => categoryItemIds.has(record.itemId))
    }

    // Sort by timestamp in reverse chronological order (newest first)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return dateB - dateA
    })
  }, [history, itemId, categoryId, items])

  // Group history records by timestamp and itemId (within 1 second window)
  const groupedHistory = useMemo(() => {
    const groups: Array<{ key: string; records: HistoryRecord[] }> = []
    const processed = new Set<string>()

    filteredHistory.forEach(record => {
      if (processed.has(record.id)) return

      const recordTime = new Date(record.timestamp).getTime()
      const group: HistoryRecord[] = [record]
      processed.add(record.id)

      // Find other records within 1 second for the same item
      filteredHistory.forEach(other => {
        if (processed.has(other.id)) return
        if (other.itemId !== record.itemId) return

        const otherTime = new Date(other.timestamp).getTime()
        if (Math.abs(recordTime - otherTime) <= 1000) {
          group.push(other)
          processed.add(other.id)
        }
      })

      groups.push({
        key: `${record.itemId}-${recordTime}`,
        records: group
      })
    })

    return groups
  }, [filteredHistory])

  // Pagination
  const totalPages = Math.ceil(groupedHistory.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedHistory = groupedHistory.slice(startIndex, endIndex)

  // Format date for display
  const formatDate = (date: Date): string => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  // Format change description
  const formatChangeDescription = (record: HistoryRecord): string => {
    if (record.changeType === 'item_created') {
      return '아이템 추가'
    } else if (record.changeType === 'quantity_change') {
      return `수량 변경: ${record.previousQuantity} → ${record.newQuantity}`
    } else if (record.changeType === 'notes_change') {
      const prevNotes = record.previousNotes || '(없음)'
      const newNotes = record.newNotes || '(없음)'
      return `메모 변경: "${prevNotes}" → "${newNotes}"`
    } else if (record.changeType === 'name_change') {
      return `이름 변경: "${record.previousName}" → "${record.newName}"`
    } else if (record.changeType === 'price_change' || record.changeType === 'price_updated') {
      const prevPrice = record.previousPrice !== undefined ? `₩${record.previousPrice.toLocaleString()}` : '(없음)'
      const newPrice = record.newPrice !== undefined ? `₩${record.newPrice.toLocaleString()}` : '(없음)'
      return `가격 변경: ${prevPrice} → ${newPrice}`
    } else if (record.changeType === 'category_changed') {
      const prevCategory = record.previousCategoryId ? getCategoryName(record.previousCategoryId) : '미분류'
      const newCategory = record.newCategoryId ? getCategoryName(record.newCategoryId) : '미분류'
      return `카테고리 변경: ${prevCategory} → ${newCategory}`
    } else if (record.changeType === 'image_change') {
      return '이미지 변경'
    } else if (record.changeType === 'item_deleted') {
      return `아이템 삭제 (수량: ${record.previousQuantity})`
    }
    return '알 수 없는 변경'
  }

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (filteredHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">변동 이력</h2>
        <p className="text-gray-500 text-center py-8">
          {itemId ? '이 아이템의 변동 이력이 없습니다.' : '변동 이력이 없습니다.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        변동 이력
        <span className="text-sm font-normal text-gray-500 ml-2">
          (총 {groupedHistory.length}건)
        </span>
      </h2>

      {/* History list */}
      <div className="space-y-2">
        {paginatedHistory.map((group) => {
          const firstRecord = group.records[0]
          const hasMultipleChanges = group.records.length > 1
          
          return (
            <div
              key={group.key}
              className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-gray-500">
                    {formatDate(firstRecord.timestamp)}
                  </div>
                  <div className="font-medium">
                    {firstRecord.itemName}
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    {group.records.map((record, idx) => (
                      <div
                        key={idx}
                        className={
                          record.changeType === 'item_deleted' 
                            ? 'text-red-600'
                            : record.changeType === 'item_created'
                            ? 'text-green-600'
                            : ''
                        }
                      >
                        {formatChangeDescription(record)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          
          <div className="flex items-center gap-1">
            {/* Show first page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => goToPage(1)}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                >
                  1
                </button>
                {currentPage > 4 && <span className="px-2">...</span>}
              </>
            )}

            {/* Show pages around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === currentPage ||
                page === currentPage - 1 ||
                page === currentPage + 1 ||
                page === currentPage - 2 ||
                page === currentPage + 2
              )
              .map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded border ${
                    page === currentPage
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

            {/* Show last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                <button
                  onClick={() => goToPage(totalPages)}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
