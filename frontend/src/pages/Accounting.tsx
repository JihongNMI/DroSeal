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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">간편 가계부</h1>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading transactions...</p>
          </div>
        ) : (
          <>
            {/* Dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <h3 className="text-sm font-medium text-gray-500 mb-2">총 지출</h3>
                <p className="text-2xl font-bold text-red-600">₩{summary?.totalExpense.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <h3 className="text-sm font-medium text-gray-500 mb-2">판매 수입 (연결됨)</h3>
                <p className="text-2xl font-bold text-blue-600">₩{summary?.businessIncome.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <h3 className="text-sm font-medium text-gray-500 mb-2">기타 수입</h3>
                <p className="text-2xl font-bold text-green-600">₩{summary?.miscellaneousIncome.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                <h3 className="text-sm font-medium text-gray-500 mb-2">순이익</h3>
                <p className={`text-2xl font-bold ${(summary?.netIncome || 0) >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                  ₩{(summary?.netIncome || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Transaction list */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Transaction
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No transactions yet</p>
                  <p className="text-gray-400 text-sm">Add transactions to start tracking your finances</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">설명/플랫폼</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">연결된 아이템</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map(transaction => (
                        <tr key={transaction.transactionId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.transactionType === 'PURCHASE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                              }`}>
                              {transaction.transactionType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                            ₩{transaction.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {transaction.platform || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">DB 거래 등록</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center">
                    <input
                      type="radio"
                      name="transactionType"
                      value="PURCHASE"
                      checked={transactionType === 'PURCHASE'}
                      onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-red-600">구매 (지출)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center">
                    <input
                      type="radio"
                      name="transactionType"
                      value="SALE"
                      checked={transactionType === 'SALE'}
                      onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-green-600">판매 (수입)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">금액 (₩)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₩</span>
                  <input
                    type="number"
                    className="w-full pl-8 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">플랫폼/출처</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 번개장터, 트위터, 직접거래 등"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">아이템 연결 (선택)</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                취소
              </button>
              <button
                onClick={handleAddTransaction}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all"
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
