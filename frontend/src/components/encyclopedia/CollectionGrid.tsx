import { CollectionProgressResponseDto } from '../../api/collection'
import { CategoryDto } from '../../api/category'
import CollectionCard from './CollectionCard'

interface CollectionGridProps {
  collections: CollectionProgressResponseDto[]
  loading: boolean
  categories: CategoryDto[]
  searchKeyword: string
  filterCategoryId: number | string
  onSearchChange: (value: string) => void
  onFilterChange: (value: string) => void
  onAlbumOpen: (col: CollectionProgressResponseDto) => void
}

export default function CollectionGrid({
  collections,
  loading,
  categories,
  searchKeyword,
  filterCategoryId,
  onSearchChange,
  onFilterChange,
  onAlbumOpen,
}: CollectionGridProps) {
  // 카테고리별 그룹핑
  const grouped = collections.reduce((acc, col) => {
    const cat = col.categoryName || 'Unknown Category'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(col)
    return acc
  }, {} as Record<string, CollectionProgressResponseDto[]>)

  return (
    <>
      {/* 검색 & 필터 바 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-[#1a1740] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-purple-900/30 transition-colors">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="도감 이름으로 검색..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-purple-900/30 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-gray-100 bg-white dark:bg-[#1a1740] transition-colors"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="w-full md:w-64">
          <select
            value={filterCategoryId}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-purple-900/30 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-[#1a1740] text-gray-700 dark:text-gray-100 transition-colors"
          >
            <option value="">전체 카테고리</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 콘텐츠 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">데이터를 불러오는 중...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">등록된 도감이 없습니다.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">"도감 추가하기" 버튼을 눌러 새 도감을 만들어보세요.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, cols]) => (
            <div key={category} className="mb-8">
              <div className="border-b-4 border-gray-800 dark:border-gray-500 pb-2 mb-6 flex items-baseline justify-between transition-colors">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-serif tracking-wide">{category}</h2>
                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">총 {cols.length}권</span>
              </div>
              <div className="flex flex-wrap gap-6 px-4">
                {cols.map(col => (
                  <CollectionCard
                    key={col.collectionId}
                    col={col}
                    onClick={() => onAlbumOpen(col)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
