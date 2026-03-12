import { useState, useEffect, useCallback } from 'react'
import { TransactionDto, TransactionType, fetchMyTransactions, createTransaction, getAccountingSummary, AccountingSummaryResponseDto } from '../api/accounting'
import { fetchMyInventoryItems, InventoryItemDto } from '../api/inventory'

export default function Accounting(): JSX.Element {
  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [summary, setSummary] = useState<AccountingSummaryResponseDto | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItemDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form states for add transaction modal
  const [transactionType, setTransactionType] = useState<TransactionType>('PURCHASE')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('') // Matches platform in API for now
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [linkedInventoryId, setLinkedInventoryId] = useState<number | undefined>(undefined)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [txData, summaryData, invData] = await Promise.all([
        fetchMyTransactions(0, 50),
        getAccountingSummary(),
        fetchMyInventoryItems(0, 100)
      ])
      setTransactions(txData.content || [])
      setSummary(summaryData)
      setInventoryItems(invData.content || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load accounting data', err)
      setError('서버에서 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle add transaction form submission
  const handleAddTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('유효한 금액을 입력해주세요.')
      return
    }

    try {
      await createTransaction({
        transactionType,
        price: parseFloat(amount),
        transactionDate: date,
        platform: description.trim() || 'Direct',
        inventoryId: linkedInventoryId,
      })

      alert('거래가 데이터베이스에 저장되었습니다!')
      handleCloseModal()
      loadData()
    } catch (err) {
      alert('거래 저장에 실패했습니다.')
    }
  }

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowAddModal(false)
    setTransactionType('PURCHASE')
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setLinkedInventoryId(undefined)
  }

  return (
    <div className="p-6 min-h-screen dark:bg-[#0d0b2b] transition-colors duration-300">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">간편 가계부</h1>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 mb-6 transition-colors">
            <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors">Loading transactions...</p>
          </div>
        ) : (
          <>
            {/* Dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 border-l-4 border-red-500 transition-colors">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">총 지출</h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 transition-colors">₩{summary?.totalExpense.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 border-l-4 border-blue-500 transition-colors">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">판매 수입 (연결됨)</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors">₩{summary?.businessIncome.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 border-l-4 border-green-500 transition-colors">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">기타 수입</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors">₩{summary?.miscellaneousIncome.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 border-l-4 border-indigo-500 transition-colors">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">순이익</h3>
                <p className={`text-2xl font-bold transition-colors ${(summary?.netIncome || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                  ₩{(summary?.netIncome || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Transaction list */}
            <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md transition-colors">
              <div className="p-6 border-b border-gray-200 dark:border-purple-900/30 flex justify-between items-center transition-colors">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">Transaction History</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm transition-colors"
                >
                  Add Transaction
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 transition-colors">No transactions yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm transition-colors">Add transactions to start tracking your finances</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-[#13112c] border-b border-gray-200 dark:border-purple-900/30 transition-colors">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">날짜</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">유형</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">금액</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">설명/플랫폼</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">연결된 아이템</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-purple-900/20">
                      {transactions.map(transaction => (
                        <tr key={transaction.transactionId} className="hover:bg-gray-50 dark:hover:bg-[#0d0b2b]/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${transaction.transactionType === 'PURCHASE'
                               ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                               : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              }`}>
                              {transaction.transactionType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-bold transition-colors">
                            ₩{transaction.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                            {transaction.platform || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                            {transaction.inventoryItemName || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-colors">
          <div className="bg-white dark:bg-[#1a1740] rounded-2xl shadow-xl p-6 max-w-md w-full border border-transparent dark:border-purple-900/50 animate-in fade-in zoom-in duration-200 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-display transition-colors">DB 거래 등록</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">유형</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-purple-900/50 rounded-lg hover:bg-gray-50 dark:hover:bg-[#13112c] transition-colors flex-1 justify-center">
                    <input
                      type="radio"
                      name="transactionType"
                      value="PURCHASE"
                      checked={transactionType === 'PURCHASE'}
                      onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                      className="text-blue-600 focus:ring-blue-500 bg-white dark:bg-[#0d0b2b] transition-colors"
                    />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">구매 (지출)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-purple-900/50 rounded-lg hover:bg-gray-50 dark:hover:bg-[#13112c] transition-colors flex-1 justify-center">
                    <input
                      type="radio"
                      name="transactionType"
                      value="SALE"
                      checked={transactionType === 'SALE'}
                      onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                      className="text-blue-600 focus:ring-blue-500 bg-white dark:bg-[#0d0b2b] transition-colors"
                    />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">판매 (수입)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">금액 (₩)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">₩</span>
                  <input
                    type="number"
                    className="w-full pl-8 p-2 border border-gray-200 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">날짜</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-200 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">플랫폼/출처</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 번개장터, 트위터, 직접거래 등"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">아이템 연결 (선택)</label>
                <select
                  className="w-full p-2 border border-gray-200 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
                  value={linkedInventoryId || ''}
                  onChange={(e) => setLinkedInventoryId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">-- 연결 없음 --</option>
                  {inventoryItems.map(item => (
                    <option key={item.inventoryId} value={item.inventoryId}>
                      #{item.inventoryId} - {item.customName || item.collectionItemName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 transition-colors">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              >
                취소
              </button>
              <button
                onClick={handleAddTransaction}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/40 transition-all font-display"
              >
                거래 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
