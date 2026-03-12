import { getCategoryPath, formatCategoryPath } from '../../services/categoryService'
import type { InventoryCategory } from '../../types'

interface CategoryFormModalProps {
  editingCategoryId: string | undefined
  uncategorizedId: string
  categories: InventoryCategory[]
  categoryName: string
  categoryParentId: string | undefined
  categoryFormError: string | null
  onCategoryNameChange: (name: string) => void
  onCategoryParentChange: (parentId: string | undefined) => void
  onSubmit: () => void
  onClose: () => void
}

export function CategoryFormModal({
  editingCategoryId,
  uncategorizedId,
  categories,
  categoryName,
  categoryParentId,
  categoryFormError,
  onCategoryNameChange,
  onCategoryParentChange,
  onSubmit,
  onClose,
}: CategoryFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-white dark:bg-[#1a1740] rounded-lg p-6 max-w-md w-full transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
          {editingCategoryId ? '카테고리 수정' : '카테고리 추가'}
        </h2>

        {categoryFormError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 mb-4 transition-colors">
            <p className="text-red-800 dark:text-red-300 text-sm transition-colors">{categoryFormError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              카테고리 이름 <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => onCategoryNameChange(e.target.value)}
              placeholder="카테고리 이름 입력"
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              상위 카테고리 (선택사항)
            </label>
            <select
              value={categoryParentId || ''}
              onChange={(e) => onCategoryParentChange(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
              disabled={editingCategoryId === uncategorizedId}
              title={categoryParentId ? formatCategoryPath(categoryParentId, categories) : ''}
            >
              <option value="">없음 (최상위 카테고리)</option>
              {categories
                .filter(c => c.id !== editingCategoryId && c.id !== uncategorizedId)
                .map(category => {
                  const path = getCategoryPath(category.id, categories)
                  const depth = path.length
                  const indent = '\u00A0\u00A0'.repeat(depth - 1)
                  const fullPath = formatCategoryPath(category.id, categories)
                  return (
                    <option key={category.id} value={category.id} title={fullPath}>
                      {indent}{depth > 1 ? '└ ' : ''}{category.name}
                    </option>
                  )
                })}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-purple-900/30 transition-colors">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingCategoryId ? '수정' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}
