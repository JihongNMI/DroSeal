interface BulkEditModalProps {
  selectedCount: number;
  bulkEditQuantity: string;
  setBulkEditQuantity: (val: string) => void;
  bulkEditPrice: string;
  setBulkEditPrice: (val: string) => void;
  bulkEditEncyclopediaId: string;
  setBulkEditEncyclopediaId: (val: string) => void;
  encyclopedias: any[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function BulkEditModal({
  selectedCount,
  bulkEditQuantity,
  setBulkEditQuantity,
  bulkEditPrice,
  setBulkEditPrice,
  bulkEditEncyclopediaId,
  setBulkEditEncyclopediaId,
  encyclopedias,
  onConfirm,
  onCancel
}: BulkEditModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-white dark:bg-[#1a1740] rounded-lg p-6 max-w-md w-full transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">일괄 수정</h2>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 mb-6 transition-colors">
          <p className="text-red-800 dark:text-red-300 text-sm font-medium transition-colors">
            ⚠️ 주의: 선택한 {selectedCount}개의 아이템이 일괄적으로 변경됩니다
          </p>
        </div>

        <div className="space-y-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              수량 (선택사항)
            </label>
            <input
              type="number"
              min="0"
              value={bulkEditQuantity}
              onChange={(e) => setBulkEditQuantity(e.target.value)}
              placeholder="변경하지 않으려면 비워두세요"
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              가격 (선택사항)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={bulkEditPrice}
              onChange={(e) => setBulkEditPrice(e.target.value)}
              placeholder="변경하지 않으려면 비워두세요"
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>

          {/* Encyclopedia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              도감 (선택사항)
            </label>
            <select
              value={bulkEditEncyclopediaId}
              onChange={(e) => setBulkEditEncyclopediaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="">변경하지 않음</option>
              <option value="none">도감 제거</option>
              {encyclopedias.map((encyclopedia: any) => (
                <option key={encyclopedia.id} value={encyclopedia.id}>
                  {encyclopedia.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-purple-900/30 transition-colors">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
