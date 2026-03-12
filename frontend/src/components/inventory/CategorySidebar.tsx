import { CategoryTree } from './CategoryTree'
import { CategorySearch } from './CategorySearch'
import type { InventoryItem, InventoryCategory } from '../../types'

interface CategorySidebarProps {
  categories: InventoryCategory[]
  filteredCategories: InventoryCategory[]
  matchedCategoryIds: Set<string>
  selectedCategoryId: string | undefined
  expandedCategoryIds: Set<string>
  searchQuery: string
  items: InventoryItem[]
  onSearchChange: (query: string) => void
  onAddCategoryClick: () => void
  onCategoryClick: (id: string | undefined) => void
  onToggleExpand: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onShowAll: () => void
}

export function CategorySidebar({
  categories,
  filteredCategories,
  matchedCategoryIds,
  selectedCategoryId,
  expandedCategoryIds,
  searchQuery,
  items,
  onSearchChange,
  onAddCategoryClick,
  onCategoryClick,
  onToggleExpand,
  onEdit,
  onDelete,
  onShowAll,
}: CategorySidebarProps) {
  return (
    <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-4 border border-transparent dark:border-purple-900/30 transition-colors">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">카테고리</h2>

      <button
        onClick={onAddCategoryClick}
        className="w-full mb-3 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
      >
        카테고리 추가
      </button>

      <CategorySearch
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      <div className="mt-4">
        <CategoryTree
          categories={filteredCategories}
          items={items}
          selectedCategoryId={selectedCategoryId}
          expandedCategoryIds={expandedCategoryIds}
          matchedCategoryIds={matchedCategoryIds}
          totalItemCount={items.length}
          onCategoryClick={onCategoryClick}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowAll={onShowAll}
        />
      </div>
    </div>
  )
}
