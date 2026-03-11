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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">일괄 수정</h2>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-red-800 text-sm font-medium">
            ⚠️ 주의: 선택한 {selectedCount}개의 아이템이 일괄적으로 변경됩니다
          </p>
        </div>

        <div className="space-y-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수량 (선택사항)
            </label>
            <input
              type="number"
              min="0"
              value={bulkEditQuantity}
              onChange={(e) => setBulkEditQuantity(e.target.value)}
              placeholder="변경하지 않으려면 비워두세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가격 (선택사항)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={bulkEditPrice}
              onChange={(e) => setBulkEditPrice(e.target.value)}
              placeholder="변경하지 않으려면 비워두세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Encyclopedia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              도감 (선택사항)
            </label>
            <select
              value={bulkEditEncyclopediaId}
              onChange={(e) => setBulkEditEncyclopediaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
