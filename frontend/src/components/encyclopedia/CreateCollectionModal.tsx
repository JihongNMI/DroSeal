import { useState } from 'react'
import { createCollection } from '../../api/collection'
import { CategoryDto } from '../../api/category'

interface CreateCollectionModalProps {
  categories: CategoryDto[]
  onClose: () => void
  onSuccess: () => void
}

export default function CreateCollectionModal({ categories, onClose, onSuccess }: CreateCollectionModalProps) {
  const [customName, setCustomName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string>('')
  const [isPublic, setIsPublic] = useState(false)
  const [gridX, setGridX] = useState(3)
  const [gridY, setGridY] = useState(12)

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async () => {
    if (!customName.trim()) { alert('도감 이름을 입력해주세요.'); return }
    if (!selectedCategoryId) { alert('카테고리를 선택해주세요!'); return }

    try {
      await createCollection({
        name: customName,
        description,
        categoryId: Number(selectedCategoryId),
        isPublic,
        gridX,
        gridY,
      })
      alert('도감이 성공적으로 생성되었습니다!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating collection:', error)
      alert(`도감 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-white dark:bg-[#1a1740] rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-transparent dark:border-purple-900/50 shadow-2xl transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">새 커스텀 도감 만들기</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">도감 이름 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="예: 내 포켓몬 띠부씰 1탄 모음"
              className="w-full px-4 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">설명 (선택사항)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 내용을 적어주세요..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">카테고리 <span className="text-red-500">*</span></label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="">카테고리 선택</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">가로 칸 수 (X)</label>
              <input type="number" min="1" max="20" value={gridX}
                onChange={(e) => setGridX(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">세로 칸 수 (Y)</label>
              <input type="number" min="1" max="50" value={gridY}
                onChange={(e) => setGridY(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">책에 들어갈 카드 슬롯 그리드를 지정합니다. (예: 가로 3 x 세로 12 레이아웃)</p>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="sr-only" />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-4' : ''}`} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">도감 공개</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">다른 유저도 이 도감 프레임을 볼 수 있도록 허용합니다.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-purple-900/30 transition-colors">
          <button onClick={handleClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">취소</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">도감 저장</button>
        </div>
      </div>
    </div>
  )
}
