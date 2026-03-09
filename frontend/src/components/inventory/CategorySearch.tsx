import { InventoryCategory } from '../../types'
import { searchCategories, SearchResult } from '../../services/categoryService'

interface CategorySearchProps {
  categories: InventoryCategory[]
  searchQuery: string
  onSearchChange: (query: string) => void
}

/**
 * CategorySearch - Search input component for filtering categories
 * 
 * Features:
 * - Real-time search as user types
 * - Case-insensitive matching
 * - Uses searchCategories utility to get matched and visible categories
 * - Clear button to reset search
 * - Returns SearchResult with matched and visible category IDs
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * @param props - CategorySearchProps
 */
export function CategorySearch({
  categories,
  searchQuery,
  onSearchChange
}: CategorySearchProps): JSX.Element {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const handleClear = () => {
    onSearchChange('')
  }

  // Get search results for display purposes (optional - parent can also call this)
  const searchResult: SearchResult = searchCategories(searchQuery, categories)
  const hasResults = searchResult.matchedCategories.size > 0

  return (
    <div className="category-search mb-4">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="카테고리 검색..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search categories"
        />
        
        {/* Clear button - only show when there's text */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
            title="검색 초기화"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Optional: Display search results count */}
      {searchQuery && (
        <div className="mt-2 text-sm text-gray-600">
          {hasResults ? (
            <span>
              {searchResult.matchedCategories.size}개의 카테고리 찾음
              {searchResult.visibleCategories.size > searchResult.matchedCategories.size && (
                <span className="text-gray-500">
                  {' '}(상위/하위 카테고리 포함: {searchResult.visibleCategories.size}개)
                </span>
              )}
            </span>
          ) : (
            <span className="text-gray-500">검색 결과가 없습니다.</span>
          )}
        </div>
      )}
    </div>
  )
}
