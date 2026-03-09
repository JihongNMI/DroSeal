import { useState } from 'react'
import type { InventoryCategory } from '../../types'

export interface ItemSearchFilters {
  textSearch: string
  textField: 'name' | 'notes' | 'encyclopedia'
  categoryId: string // '' means all categories
  verificationStatus: 'all' | 'verified' | 'mismatch' | 'none' // all, has verification (match), has verification (mismatch), no verification
  quantityOperator: '>=' | '=' | '<='
  quantityValue: number | null
  priceOperator: '>=' | '=' | '<='
  priceValue: number | null
  dateFrom: string // YYYY-MM-DD or YYYY-MM or YYYY
  dateTo: string // YYYY-MM-DD or YYYY-MM or YYYY
}

interface ItemSearchProps {
  categories: InventoryCategory[]
  onSearch: (filters: ItemSearchFilters) => void
  onClear: () => void
}

export function ItemSearch({ categories, onSearch, onClear }: ItemSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [textSearch, setTextSearch] = useState('')
  const [textField, setTextField] = useState<'name' | 'notes' | 'encyclopedia'>('name')
  const [categoryId, setCategoryId] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<'all' | 'verified' | 'mismatch' | 'none'>('all')
  const [quantityOperator, setQuantityOperator] = useState<'>=' | '=' | '<='>("=")
  const [quantityValue, setQuantityValue] = useState<string>('')
  const [priceOperator, setPriceOperator] = useState<'>=' | '=' | '<='>("=")
  const [priceValue, setPriceValue] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleSearch = () => {
    const filters: ItemSearchFilters = {
      textSearch: textSearch.trim(),
      textField,
      categoryId,
      verificationStatus,
      quantityOperator,
      quantityValue: quantityValue ? parseInt(quantityValue) : null,
      priceOperator,
      priceValue: priceValue ? parseFloat(priceValue) : null,
      dateFrom: dateFrom.trim(),
      dateTo: dateTo.trim()
    }
    onSearch(filters)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTextSearch('')
    setTextField('name')
    setCategoryId('')
    setVerificationStatus('all')
    setQuantityOperator('=')
    setQuantityValue('')
    setPriceOperator('=')
    setPriceValue('')
    setDateFrom('')
    setDateTo('')
    onClear()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        아이템 검색
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Search panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
            <h3 className="text-lg font-semibold mb-4">아이템 검색</h3>
            
            <div className="space-y-4">
              {/* Text search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  텍스트 검색
                </label>
                <div className="flex gap-2">
                  <select
                    value={textField}
                    onChange={(e) => setTextField(e.target.value as 'name' | 'notes' | 'encyclopedia')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">이름</option>
                    <option value="notes">메모</option>
                    <option value="encyclopedia">도감</option>
                  </select>
                  <input
                    type="text"
                    value={textSearch}
                    onChange={(e) => setTextSearch(e.target.value)}
                    placeholder="검색어 입력"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전체 카테고리</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verification status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  증빙 여부
                </label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as 'all' | 'verified' | 'mismatch' | 'none')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="verified">증빙 있음 (일치)</option>
                  <option value="mismatch">증빙 있음 (불일치)</option>
                  <option value="none">증빙 없음</option>
                </select>
              </div>

              {/* Quantity search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  수량
                </label>
                <div className="flex gap-2">
                  <select
                    value={quantityOperator}
                    onChange={(e) => setQuantityOperator(e.target.value as '>=' | '=' | '<=')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value=">=">&gt;=</option>
                    <option value="=">=</option>
                    <option value="<=">&lt;=</option>
                  </select>
                  <input
                    type="number"
                    value={quantityValue}
                    onChange={(e) => setQuantityValue(e.target.value)}
                    placeholder="수량"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Price search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가격
                </label>
                <div className="flex gap-2">
                  <select
                    value={priceOperator}
                    onChange={(e) => setPriceOperator(e.target.value as '>=' | '=' | '<=')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value=">=">&gt;=</option>
                    <option value="=">=</option>
                    <option value="<=">&lt;=</option>
                  </select>
                  <input
                    type="number"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="가격"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Date range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기간
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="시작일"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="종료일"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button
                onClick={handleSearch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                검색
              </button>
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                초기화
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
