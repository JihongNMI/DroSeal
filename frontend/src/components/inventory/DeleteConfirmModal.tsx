import { useState } from 'react'

interface DeleteConfirmModalProps {
  itemName: string
  itemPrice?: number
  onConfirm: (addToAccounting: boolean, platform?: string, salePrice?: number) => void
  onCancel: () => void
}

export function DeleteConfirmModal({
  itemName,
  itemPrice,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  const [addToAccounting, setAddToAccounting] = useState(false)
  const [platform, setPlatform] = useState('')
  const [salePrice, setSalePrice] = useState<string>(itemPrice?.toString() || '')

  const handleConfirm = () => {
    const finalPrice = salePrice ? parseFloat(salePrice) : undefined
    onConfirm(addToAccounting, platform.trim() || '직접거래', finalPrice)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-white dark:bg-[#1a1740] rounded-lg p-6 w-full max-w-md transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">아이템 삭제</h2>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors">
          <strong className="text-gray-900 dark:text-gray-100 transition-colors">{itemName}</strong>을(를) 삭제하시겠습니까?
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-3 mb-4 transition-colors">
          <p className="text-sm text-yellow-800 dark:text-yellow-400 transition-colors">
            ⚠️ 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        {/* Accounting checkbox */}
        <div className="border-t border-gray-200 dark:border-purple-900/30 pt-4 mb-4 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addToAccounting}
              onChange={(e) => setAddToAccounting(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] transition-colors"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">판매로 가계부에 등록</span>
          </label>
        </div>

        {/* Platform and price inputs (shown when checkbox is checked) */}
        {addToAccounting && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">플랫폼/출처</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="예: 번개장터, 트위터, 직접거래 등"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">판매가 *</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="판매 금액 입력"
                min="0"
              />
              {itemPrice && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                  구입가: ₩{itemPrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 transition-colors">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
