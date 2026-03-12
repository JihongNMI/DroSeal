import React from 'react';
import { InventoryCategory } from '../../types';
import { ItemSearch, type ItemSearchFilters } from './ItemSearch';
import { HistorySearch, type HistorySearchFilters } from './HistorySearch';

interface InventoryHeaderProps {
  selectedItemIds: Set<string>;
  showBulkActions: boolean;
  setShowBulkActions: (show: boolean) => void;
  categories: InventoryCategory[];
  uncategorizedId: string;
  expandedBulkCategories: Set<string>;
  toggleBulkCategoryExpand: (categoryId: string) => void;
  handleBulkCategoryChange: (categoryId: string) => void;
  setShowBulkEditModal: (show: boolean) => void;
  handleBulkDelete: () => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  setItemSearchFilters: (filters: ItemSearchFilters | null) => void;
  setHistorySearchFilters: (filters: HistorySearchFilters | null) => void;
  setShowItemForm: (show: boolean) => void;
  setEditingItem: (item: any) => void;
  setSelectedItemIdForHistory: (id: string | undefined) => void;
}

export function InventoryHeader({
  selectedItemIds,
  showBulkActions,
  setShowBulkActions,
  categories,
  uncategorizedId,
  expandedBulkCategories,
  toggleBulkCategoryExpand,
  handleBulkCategoryChange,
  setShowBulkEditModal,
  handleBulkDelete,
  showHistory,
  setShowHistory,
  setItemSearchFilters,
  setHistorySearchFilters,
  setShowItemForm,
  setEditingItem,
  setSelectedItemIdForHistory
}: InventoryHeaderProps) {

  // Helper function definitions from Inventory.tsx
  const getChildren = (parentId: string, allCategories: InventoryCategory[]) => 
    allCategories.filter(c => c.parentId === parentId);

  return (
    <div className="flex justify-between items-center mb-6 transition-colors">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">인벤토리</h1>
      </div>
      <div className="flex gap-3">
        {selectedItemIds.size > 0 && (
          <div className="relative flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50 transition-colors">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300 transition-colors">
              {selectedItemIds.size}개 선택됨
            </span>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              일괄 작업
            </button>
            {showBulkActions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowBulkActions(false)}
                />
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#1a1740] rounded-lg shadow-lg border border-gray-200 dark:border-purple-900/50 z-50 p-2 min-w-64 max-h-96 overflow-y-auto transition-colors">
                  <div className="space-y-1">
                    {/* Category Move with Accordion */}
                    <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-purple-900/30 transition-colors">카테고리 이동</div>
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
                            <div className="flex items-center text-gray-800 dark:text-gray-200 transition-colors">
                              {hasChildren && (
                                <button
                                  onClick={() => toggleBulkCategoryExpand(category.id)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-[#13112c] rounded transition-colors"
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
                              <div className="ml-6 text-gray-700 dark:text-gray-400 transition-colors">
                                {children.map(child => (
                                  <button
                                    key={child.id}
                                    onClick={() => handleBulkCategoryChange(child.id)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#13112c] rounded transition-colors"
                                  >
                                    └ {child.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}

                    <div className="border-t border-gray-200 dark:border-purple-900/30 my-1 transition-colors"></div>

                    {/* Bulk Edit */}
                    <button
                      onClick={() => {
                        setShowBulkEditModal(true)
                        setShowBulkActions(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#13112c] rounded transition-colors"
                    >
                      수량/가격/도감 일괄 수정
                    </button>

                    <div className="border-t border-gray-200 dark:border-purple-900/30 my-1 transition-colors"></div>

                    {/* Delete */}
                    <button
                      onClick={handleBulkDelete}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          아이템 추가
        </button>
        <button
          onClick={() => {
            setSelectedItemIdForHistory(undefined) // 전체 이력 표시
            setShowHistory(!showHistory)
          }}
          className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        >
          {showHistory ? '이력 숨기기' : '이력 보기'}
        </button>
      </div>
    </div>
  );
}
