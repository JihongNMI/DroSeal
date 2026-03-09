import { useDroppable } from '@dnd-kit/core'
import { InventoryCategory, InventoryItem } from '../../types'
import { getChildren, getDescendants } from '../../services/categoryService'

interface CategoryTreeProps {
  categories: InventoryCategory[]
  items: InventoryItem[]
  selectedCategoryId?: string
  expandedCategoryIds: Set<string>
  matchedCategoryIds?: Set<string>
  totalItemCount: number
  onCategoryClick: (categoryId: string) => void
  onToggleExpand: (categoryId: string) => void
  onEdit: (categoryId: string) => void
  onDelete: (categoryId: string) => void
  onShowAll: () => void
}

interface CategoryNodeProps {
  category: InventoryCategory
  categories: InventoryCategory[]
  items: InventoryItem[]
  selectedCategoryId?: string
  expandedCategoryIds: Set<string>
  matchedCategoryIds?: Set<string>
  depth: number
  onCategoryClick: (categoryId: string) => void
  onToggleExpand: (categoryId: string) => void
  onEdit: (categoryId: string) => void
  onDelete: (categoryId: string) => void
}

const UNCATEGORIZED_ID = 'uncategorized'

/**
 * CategoryNode - Recursive component for rendering a single category and its children
 */
function CategoryNode({
  category,
  categories,
  items,
  selectedCategoryId,
  expandedCategoryIds,
  matchedCategoryIds,
  depth,
  onCategoryClick,
  onToggleExpand,
  onEdit,
  onDelete
}: CategoryNodeProps): JSX.Element {
  const children = getChildren(category.id, categories)
  const hasChildren = children.length > 0
  const isExpanded = expandedCategoryIds.has(category.id)
  const isSelected = selectedCategoryId === category.id
  const isMatched = matchedCategoryIds?.has(category.id) || false
  const isUncategorized = category.id === UNCATEGORIZED_ID
  
  // Droppable setup
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
  })
  
  // Count items in this category (direct items only)
  const directItemCount = items.filter(item => item.categoryId === category.id).length
  
  // Count items in all descendant categories
  const descendants = getDescendants(category.id, categories)
  const descendantItemCount = items.filter(item => 
    descendants.some(desc => desc.id === item.categoryId)
  ).length
  
  // Total count includes direct items + descendant items
  const totalItemCount = directItemCount + descendantItemCount

  // Calculate indentation based on depth
  const indentStyle = { paddingLeft: `${depth * 1.5}rem` }

  return (
    <div className="category-node" ref={setNodeRef}>
      <div
        className={`category-item flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-gray-100 ${
          isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : 
          isMatched ? 'bg-yellow-100' : 
          isOver ? 'bg-green-100 border-l-4 border-green-500' : ''
        }`}
        style={indentStyle}
        onClick={() => onCategoryClick(category.id)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Expand/collapse icon */}
          {hasChildren && (
            <span
              className="expand-icon text-gray-600 w-5 h-5 flex items-center justify-center flex-shrink-0"
              aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          
          {/* Spacer for categories without children */}
          {!hasChildren && <span className="w-5 flex-shrink-0" />}
          
          {/* Category name and item count */}
          <span className="category-name font-medium text-gray-800 break-words">
            {category.name}
          </span>
          <span className="item-count text-sm text-gray-500 flex-shrink-0">
            ({totalItemCount})
          </span>
        </div>

        {/* Action buttons */}
        <div className="category-actions flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            className="edit-btn text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
            onClick={() => onEdit(category.id)}
            aria-label={`Edit ${category.name}`}
          >
            수정
          </button>
          <button
            className="delete-btn text-red-600 hover:text-red-800 text-sm px-2 py-1 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={() => onDelete(category.id)}
            disabled={isUncategorized}
            aria-label={`Delete ${category.name}`}
            title={isUncategorized ? '기본 카테고리는 삭제할 수 없습니다.' : ''}
          >
            삭제
          </button>
        </div>
      </div>

      {/* Render children recursively if expanded */}
      {hasChildren && isExpanded && (
        <div className="category-children">
          {children.map(child => (
            <CategoryNode
              key={child.id}
              category={child}
              categories={categories}
              items={items}
              selectedCategoryId={selectedCategoryId}
              expandedCategoryIds={expandedCategoryIds}
              matchedCategoryIds={matchedCategoryIds}
              depth={depth + 1}
              onCategoryClick={onCategoryClick}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * CategoryTree - Main component for displaying hierarchical categories
 * 
 * Features:
 * - Recursive rendering of nested categories
 * - Expand/collapse icons (▶ collapsed, ▼ expanded)
 * - Indentation based on depth level
 * - Highlight selected category
 * - Display item count per category
 * - Edit/delete buttons (delete disabled for Uncategorized)
 * 
 * @param props - CategoryTreeProps
 */
export function CategoryTree({
  categories,
  items,
  selectedCategoryId,
  expandedCategoryIds,
  matchedCategoryIds,
  totalItemCount,
  onCategoryClick,
  onToggleExpand,
  onEdit,
  onDelete,
  onShowAll
}: CategoryTreeProps): JSX.Element {
  // Get top-level categories (those without a parent) and sort them
  const topLevelCategories = getChildren(undefined, categories)
    .sort((a, b) => {
      // Always put "uncategorized" first
      if (a.id === UNCATEGORIZED_ID) return -1
      if (b.id === UNCATEGORIZED_ID) return 1
      return a.name.localeCompare(b.name, 'ko')
    })

  return (
    <div className="category-tree border border-gray-300 rounded-lg overflow-hidden">
      {/* All items button */}
      <div
        onClick={onShowAll}
        className={`category-item flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-gray-100 ${
          !selectedCategoryId ? 'bg-blue-100 border-l-4 border-blue-500' : ''
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="category-name font-semibold text-gray-800">전체</span>
          <span className="item-count text-sm text-gray-500 flex-shrink-0">
            ({totalItemCount})
          </span>
        </div>
      </div>

      {topLevelCategories.length === 0 ? (
        <div className="empty-state p-4 text-center text-gray-500">
          카테고리가 없습니다.
        </div>
      ) : (
        <div className="category-list">
          {topLevelCategories.map(category => (
            <CategoryNode
              key={category.id}
              category={category}
              categories={categories}
              items={items}
              selectedCategoryId={selectedCategoryId}
              expandedCategoryIds={expandedCategoryIds}
              matchedCategoryIds={matchedCategoryIds}
              depth={0}
              onCategoryClick={onCategoryClick}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
