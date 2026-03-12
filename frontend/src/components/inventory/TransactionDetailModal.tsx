interface TransactionDetailModalProps {
  transaction: any; // We use 'any' to match the current loose typing in Inventory.tsx
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-white dark:bg-[#1a1740] rounded-lg p-6 max-w-md w-full transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">회계 기록 상세</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">유형</label>
            <p className="text-gray-900 dark:text-gray-100 transition-colors">
              {transaction.type === 'income' ? '수입' : '지출'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">금액</label>
            <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold transition-colors">
              ₩{transaction.amount?.toLocaleString() || '0'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">설명</label>
            <p className="text-gray-900 dark:text-gray-100 transition-colors">{transaction.description || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">카테고리</label>
            <p className="text-gray-900 dark:text-gray-100 transition-colors">{transaction.category || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">날짜</label>
            <p className="text-gray-900 dark:text-gray-100 transition-colors">
              {transaction.date ? new Date(transaction.date).toLocaleDateString('ko-KR') : '-'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-purple-900/30 transition-colors">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
