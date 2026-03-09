import { useState } from 'react'

export interface HistorySearchFilters {
  textSearch: string
  textField: 'itemName' | 'notes'
  changeTypes: string[] // 'item_created', 'quantity_change', 'notes_change', 'name_change', 'price_change', 'item_deleted'
  quantityOperator: '>=' | '=' | '<='
  quantityValue: number | null
  priceOperator: '>=' | '=' | '<='
  priceValue: number | null
  dateFrom: string // YYYY-MM-DD or YYYY-MM or YYYY
  dateTo: string // YYYY-MM-DD or YYYY-MM or YYYY
}

interface HistorySearchProps {
  onSearch: (filters: HistorySearchFilters) => void
  onClear: () => void
}

export function HistorySearch({ onSearch, onClear }: HistorySearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [textSearch, setTextSearch] = useState('')
  const [textField, setTextField] = useState<'itemName' | 'notes'>('itemName')
  const [changeTypes, setChangeTypes] = useState<string[]>([])
  const [quantityOperator, setQuantityOperator] = useState<'>=' | '=' | '<='>("=")
  const [quantityValue, setQuantityValue] = useState<string>('')
  const [priceOperator, setPriceOperator] = useState<'>=' | '=' | '<='>("=")
  const [priceValue, setPriceValue] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleChangeTypeToggle = (type: string) => {
    setChangeTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSearch = () => {
    const filters: HistorySearchFilters = {
      textSearch: textSearch.trim(),
      textField,
      changeTypes,
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
    setTextField('itemName')
    setChangeTypes([])
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
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        이력 검색
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
            <h3 className="text-lg font-semibold mb-4">이력 검색</h3>
            
            <div className="space-y-4">
              {/* Item created/deleted checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  아이템 추가/삭제
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={changeTypes.includes('item_created')}
                      onChange={() => handleChangeTypeToggle('item_created')}
                      className="mr-2"
                    />
                    <span className="text-sm text-blue-600 font-medium">아이템 추가</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={changeTypes.includes('item_deleted')}
                      onChange={() => handleChangeTypeToggle('item_deleted')}
                      className="mr-2"
                    />
                    <span className="text-sm text-red-600 font-medium">아이템 삭제</span>
                  </label>
                </div>
              </div>

              {/* Quantity/Price change checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수량/가격 변경
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={changeTypes.includes('quantity_change')}
                      onChange={() => handleChangeTypeToggle('quantity_change')}
                      className="mr-2"
                    />
                    <span className="text-sm">수량 변경</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={changeTypes.includes('price_change')}
                      onChange={() => handleChangeTypeToggle('price_change')}
                      className="mr-2"
                    />
                    <span className="text-sm">가격 변경</span>
                  </label>
                </div>
              </div>

              {/* Quantity search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  수량 조건
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
                  가격 조건
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

              {/* Name/Notes change checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름/메모 변경
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={changeTypes.includes('name_change')}
                      onChange={() => handleChangeTypeToggle('name_change')}
                      className="mr-2"
                    />
                    <span className="text-sm">이름 변경</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={changeTypes.includes('notes_change')}
                      onChange={() => handleChangeTypeToggle('notes_change')}
                      className="mr-2"
                    />
                    <span className="text-sm">메모 변경</span>
                  </label>
                </div>
              </div>

              {/* Text search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  텍스트 검색
                </label>
                <div className="flex gap-2">
                  <select
                    value={textField}
                    onChange={(e) => setTextField(e.target.value as 'itemName' | 'notes')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="itemName">아이템 이름</option>
                    <option value="notes">메모</option>
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
