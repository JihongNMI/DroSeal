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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">아이템 삭제</h2>
        
        <p className="text-gray-700 mb-4">
          <strong>{itemName}</strong>을(를) 삭제하시겠습니까?
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        {/* Accounting checkbox */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addToAccounting}
              onChange={(e) => setAddToAccounting(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">판매로 가계부에 등록</span>
          </label>
        </div>

        {/* Platform and price inputs (shown when checkbox is checked) */}
        {addToAccounting && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">플랫폼/출처</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="예: 번개장터, 트위터, 직접거래 등"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">판매가 *</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="판매 금액 입력"
                min="0"
              />
              {itemPrice && (
                <p className="text-xs text-gray-500 mt-1">
                  구입가: ₩{itemPrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
