interface TransactionDetailModalProps {
  transaction: any; // We use 'any' to match the current loose typing in Inventory.tsx
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">회계 기록 상세</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
            <p className="text-gray-900">
              {transaction.type === 'income' ? '수입' : '지출'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
            <p className="text-gray-900 text-lg font-semibold">
              ₩{transaction.amount?.toLocaleString() || '0'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <p className="text-gray-900">{transaction.description || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <p className="text-gray-900">{transaction.category || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
            <p className="text-gray-900">
              {transaction.date ? new Date(transaction.date).toLocaleDateString('ko-KR') : '-'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
