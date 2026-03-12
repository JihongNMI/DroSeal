import { useState, useEffect, useRef } from 'react'
import type { InventoryItem, InventoryCategory, Encyclopedia } from '../../types'

const FORM_DRAFT_KEY = 'droseal_item_form_draft'
const DEBOUNCE_DELAY = 800 // 800ms

interface ItemFormProps {
  item?: InventoryItem // undefined for create, defined for edit
  categories: InventoryCategory[]
  encyclopedias: Encyclopedia[]
  uncategorizedId: string
  onSubmit: (item: Partial<InventoryItem>, transaction?: { type: 'PURCHASE' | 'SALE', platform: string }) => void
  onCancel: () => void
}

/**
 * Form component for creating and editing inventory items
 * 
 * Features:
 * - Supports both create and edit modes
 * - Enhanced fields: name, category, quantity, price (optional), date, encyclopedia (optional)
 * - Category defaults to Uncategorized
 * - Date defaults to current timestamp
 * - Price is optional (can be left empty)
 * - Encyclopedia dropdown populated from useEncyclopedias
 * 
 * @param item - Item to edit (undefined for create mode)
 * @param categories - Array of all categories
 * @param encyclopedias - Array of all encyclopedias
 * @param uncategorizedId - ID of the Uncategorized category
 * @param onSubmit - Callback when form is submitted
 * @param onCancel - Callback when form is cancelled
 */
export function ItemForm({
  item,
  categories,
  encyclopedias,
  uncategorizedId,
  onSubmit,
  onCancel
}: ItemFormProps) {
  const isEditMode = !!item

  // Debug logging
  console.log('[ItemForm] Received encyclopedias:', encyclopedias)
  console.log('[ItemForm] Number of encyclopedias:', encyclopedias.length)

  // Form state
  const [name, setName] = useState(item?.name || '')
  const [categoryId, setCategoryId] = useState(item?.categoryId || uncategorizedId)
  const [quantity, setQuantity] = useState(item?.quantity || 1)
  const [price, setPrice] = useState<string>(item?.price?.toString() || '')
  const [date, setDate] = useState<string>(
    item?.date
      ? new Date(item.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [encyclopediaId, setEncyclopediaId] = useState(item?.encyclopediaId || '')
  const [notes, setNotes] = useState(item?.notes || '')
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '')
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Transaction (가계부) state
  const [alsoAddTransaction, setAlsoAddTransaction] = useState(false)
  const [transactionType, setTransactionType] = useState<'PURCHASE' | 'SALE'>('PURCHASE')
  const [transactionPlatform, setTransactionPlatform] = useState('')
  const [transactionPrice, setTransactionPrice] = useState<string>('') // Override price for SALE

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-detect quantity change and set transaction type
  useEffect(() => {
    if (isEditMode && item) {
      if (quantity < item.quantity) {
        // Quantity decreased -> SALE
        setTransactionType('SALE')
      } else if (quantity > item.quantity) {
        // Quantity increased -> PURCHASE
        setTransactionType('PURCHASE')
      }
      // If quantity is same, keep current type
    } else if (!isEditMode) {
      // Create mode always starts with PURCHASE
      setTransactionType('PURCHASE')
    }
  }, [quantity, isEditMode, item])

  // Load draft from localStorage on mount (only for create mode)
  useEffect(() => {
    if (!isEditMode) {
      const savedDraft = localStorage.getItem(FORM_DRAFT_KEY)
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          setName(draft.name || '')
          setCategoryId(draft.categoryId || uncategorizedId)
          setQuantity(draft.quantity || 1)
          setPrice(draft.price || '')
          setDate(draft.date || new Date().toISOString().split('T')[0])
          setEncyclopediaId(draft.encyclopediaId || '')
          setNotes(draft.notes || '')
          setImageUrl(draft.imageUrl || '')
          console.log('[ItemForm] Restored draft from localStorage')
        } catch (e) {
          console.error('[ItemForm] Failed to parse draft:', e)
        }
      }
    }
  }, [isEditMode, uncategorizedId])

  // Auto-save draft to localStorage with debouncing (only for create mode)
  useEffect(() => {
    if (!isEditMode) {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        const draft = {
          name,
          categoryId,
          quantity,
          price,
          date,
          encyclopediaId,
          notes,
          imageUrl
        }
        localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draft))
        console.log('[ItemForm] Auto-saved draft to localStorage')
      }, DEBOUNCE_DELAY)
    }

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [name, categoryId, quantity, price, date, encyclopediaId, notes, imageUrl, isEditMode])

  // Clear draft on unmount or successful submit
  const clearDraft = () => {
    localStorage.removeItem(FORM_DRAFT_KEY)
    console.log('[ItemForm] Cleared draft from localStorage')
  }

  // Handle image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create a local URL for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  // Update form when item prop changes (for edit mode)
  useEffect(() => {
    if (item) {
      console.log('ItemForm received item:', item)
      setName(item.name || '')
      setCategoryId(item.categoryId || uncategorizedId)
      setQuantity(item.quantity || 1)
      setPrice(item.price?.toString() || '')

      // date 필드 처리 - 없으면 현재 날짜 사용
      if (item.date) {
        try {
          setDate(new Date(item.date).toISOString().split('T')[0])
        } catch (e) {
          console.error('Invalid date:', item.date)
          setDate(new Date().toISOString().split('T')[0])
        }
      } else {
        setDate(new Date().toISOString().split('T')[0])
      }

      setEncyclopediaId(item.encyclopediaId || '')
      setNotes(item.notes || '')
      setImageUrl(item.imageUrl || '')
    }
  }, [item, uncategorizedId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '아이템 이름을 입력해주세요'
    }

    // Check if quantity is empty or invalid
    if (quantity === '' || quantity === null || quantity === undefined) {
      newErrors.quantity = '수량을 입력해주세요'
    } else if (quantity < 0) {
      newErrors.quantity = '수량은 0 이상이어야 합니다'
    }

    if (price && isNaN(parseFloat(price))) {
      newErrors.price = '올바른 가격을 입력해주세요'
    }

    if (price && parseFloat(price) < 0) {
      newErrors.price = '가격은 0 이상이어야 합니다'
    }

    // If adding to accounting, price is required
    if (alsoAddTransaction && (!price || parseFloat(price) <= 0)) {
      newErrors.price = '가계부에 등록하려면 가격을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    let finalImageUrl = imageUrl

    // If there's a file to upload
    if (imageInputType === 'upload' && imageFile) {
      try {
        const { uploadImage } = await import('../../api/upload')
        finalImageUrl = await uploadImage(imageFile)
      } catch (error) {
        console.error('Failed to upload image:', error)
        alert('이미지 업로드에 실패했습니다.')
        return
      }
    }

    const itemData: Partial<InventoryItem> = {
      name: name.trim(),
      categoryId,
      quantity,
      price: price ? parseFloat(price) : undefined,
      date: new Date(date),
      encyclopediaId: encyclopediaId || undefined,
      notes: notes.trim(),
      imageUrl: finalImageUrl || undefined
    }

    // Prepare transaction data if checkbox is checked
    const transactionData = alsoAddTransaction ? {
      type: transactionType,
      platform: transactionPlatform.trim() || '직접거래',
      // For SALE, use transactionPrice if provided, otherwise use item price
      price: transactionType === 'SALE' && transactionPrice 
        ? parseFloat(transactionPrice) 
        : (price ? parseFloat(price) : undefined)
    } : undefined

    onSubmit(itemData, transactionData)
    
    // Clear draft after successful submit (only for create mode)
    if (!isEditMode) {
      clearDraft()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors">
      <div className={`bg-white dark:bg-[#1a1740] rounded-lg p-6 max-h-[90vh] overflow-y-auto transition-all ${alsoAddTransaction ? 'w-full max-w-4xl' : 'w-full max-w-md'}`}>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 transition-colors">
          {isEditMode ? '아이템 수정' : '아이템 추가'}
        </h2>

        <div className={`flex gap-6 ${alsoAddTransaction ? 'flex-row' : 'flex-col'}`}>
          {/* Left side: Item Form */}
          <form onSubmit={handleSubmit} className={`space-y-4 ${alsoAddTransaction ? 'flex-1' : 'w-full'}`}>
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              이름 *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-purple-900/50'
                }`}
              placeholder="아이템 이름"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              카테고리 *
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity field */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              수량 {isEditMode && item && quantity !== item.quantity && (
                <span className={quantity > item.quantity ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}>
                  ({item.quantity} → <span className={quantity > item.quantity ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>{quantity}</span>)
                </span>
              )} *
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value)
                setQuantity(val as number)
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 ${errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-purple-900/50'
                }`}
              min="0"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
            {quantity === 0 && !errors.quantity && (
              <p className="text-yellow-600 text-sm mt-1">
                ⚠️ 수량이 0입니다. '재고 없음'으로 등록되고 수정으로 재고숫자를 바꿀 수 있습니다.
              </p>
            )}
          </div>

          {/* Price field (optional) */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              구입 가격 {alsoAddTransaction && <span className="text-red-500 dark:text-red-400">*</span>}
              {!alsoAddTransaction && <span className="text-gray-500 dark:text-gray-400">(선택사항)</span>}
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-purple-900/50'
                }`}
              placeholder={alsoAddTransaction ? "가격 입력 (필수)" : "가격 (선택사항)"}
              min="0"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {/* Transaction checkbox - moved here */}
          <div className={`pt-2 border-t border-gray-200 dark:border-purple-900/30 transition-colors ${
            !isEditMode || !item
              ? 'bg-blue-50 dark:bg-blue-900/20 -mx-3 px-3 py-3 rounded-lg'  // Create mode = always blue
              : alsoAddTransaction 
                ? transactionType === 'SALE' 
                  ? 'bg-green-50 dark:bg-green-900/20 -mx-3 px-3 py-3 rounded-lg' 
                  : transactionType === 'PURCHASE'
                    ? 'bg-red-50 dark:bg-red-900/20 -mx-3 px-3 py-3 rounded-lg'
                    : 'bg-blue-50 dark:bg-blue-900/20 -mx-3 px-3 py-3 rounded-lg'
                : ''
          }`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoAddTransaction}
                onChange={(e) => setAlsoAddTransaction(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] transition-colors"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">가계부에도 등록</span>
            </label>
          </div>

          {/* Date field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              일자 *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Encyclopedia field (optional) */}
          <div>
            <label htmlFor="encyclopedia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              도감 (선택사항)
            </label>
            <select
              id="encyclopedia"
              value={encyclopediaId}
              onChange={(e) => setEncyclopediaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">선택 안 함</option>
              {encyclopedias.map((encyclopedia) => (
                <option key={encyclopedia.id} value={encyclopedia.id}>
                  {encyclopedia.title}
                </option>
              ))}
            </select>
          </div>

          {/* Image field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              이미지 (선택사항)
            </label>

            {/* Image input type selector */}
            <div className="flex gap-4 mb-2 text-gray-700 dark:text-gray-300 transition-colors">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={imageInputType === 'url'}
                  onChange={() => setImageInputType('url')}
                  className="mr-2"
                />
                <span className="text-sm">URL 입력</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="upload"
                  checked={imageInputType === 'upload'}
                  onChange={() => setImageInputType('upload')}
                  className="mr-2"
                />
                <span className="text-sm">파일 업로드</span>
              </label>
            </div>

            {imageInputType === 'url' ? (
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="이미지 URL 입력"
                className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            )}

            {/* Image preview */}
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="미리보기"
                  className="w-32 h-32 object-cover rounded border border-gray-300 dark:border-purple-900/50 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Notes field */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              메모
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="메모 (선택사항)"
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isEditMode ? '수정' : alsoAddTransaction ? '아이템 & 가계부 추가' : '추가'}
            </button>
            <button
              type="button"
              onClick={() => {
                clearDraft()
                onCancel()
              }}
              className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              취소
            </button>
          </div>
        </form>

        {/* Right side: Transaction Form (only when checkbox is checked) */}
        {alsoAddTransaction && (
          <div className={`flex-1 space-y-4 border-l border-gray-200 dark:border-purple-900/30 pl-6 transition-colors ${
            !isEditMode || !item
              ? 'bg-blue-50 dark:bg-blue-900/20'  // Create mode = blue
              : transactionType === 'SALE' 
                ? 'bg-green-50 dark:bg-green-900/20' 
                : transactionType === 'PURCHASE'
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-blue-50 dark:bg-blue-900/20'
          } -m-6 p-6 rounded-r-lg`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">가계부 정보</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">거래 유형</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-purple-900/50 rounded-lg hover:bg-gray-50 dark:hover:bg-[#13112c] transition-colors flex-1 justify-center">
                  <input
                    type="radio"
                    name="transactionType"
                    value="PURCHASE"
                    checked={transactionType === 'PURCHASE'}
                    onChange={(e) => setTransactionType(e.target.value as 'PURCHASE' | 'SALE')}
                    className="text-blue-600 focus:ring-blue-500 bg-white dark:bg-[#13112c] border-gray-300 dark:border-purple-900/50 transition-colors"
                  />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400 transition-colors">구매 (지출)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-purple-900/50 rounded-lg hover:bg-gray-50 dark:hover:bg-[#13112c] transition-colors flex-1 justify-center">
                  <input
                    type="radio"
                    name="transactionType"
                    value="SALE"
                    checked={transactionType === 'SALE'}
                    onChange={(e) => setTransactionType(e.target.value as 'PURCHASE' | 'SALE')}
                    className="text-blue-600 focus:ring-blue-500 bg-white dark:bg-[#13112c] border-gray-300 dark:border-purple-900/50 transition-colors"
                  />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 transition-colors">판매 (수입)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">플랫폼/출처</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
                value={transactionPlatform}
                onChange={(e) => setTransactionPlatform(e.target.value)}
                placeholder="예: 번개장터, 트위터, 직접거래 등"
              />
            </div>

            {/* Price override for SALE */}
            {transactionType === 'SALE' && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800/50 rounded-lg p-3 transition-colors">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">판매가 (선택사항)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 outline-none bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors"
                  value={transactionPrice}
                  onChange={(e) => setTransactionPrice(e.target.value)}
                  placeholder={price ? `구입가: ₩${parseFloat(price).toLocaleString()}` : '판매 금액 입력'}
                  min="0"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 transition-colors">
                  {price 
                    ? '구입가와 다른 금액으로 판매한 경우 여기에 입력하세요' 
                    : '판매 금액을 입력하세요'}
                </p>
              </div>
            )}

            <div className={`border rounded-lg p-3 transition-colors ${
              !isEditMode || !item
                ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-800/50'  // Create mode = blue
                : transactionType === 'SALE' 
                  ? 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-800/50' 
                  : transactionType === 'PURCHASE'
                    ? 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800/50'
                    : 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-800/50'
            }`}>
              <p className={`text-xs transition-colors ${
                !isEditMode || !item
                  ? 'text-blue-800 dark:text-blue-300'  // Create mode = blue
                  : transactionType === 'SALE' 
                    ? 'text-green-800 dark:text-green-300' 
                    : transactionType === 'PURCHASE'
                      ? 'text-red-800 dark:text-red-300'
                      : 'text-blue-800 dark:text-blue-300'
              }`}>
                <strong>자동 입력:</strong> {transactionType === 'PURCHASE' ? '금액과 날짜는 아이템 정보에서 자동으로 가져옵니다.' : '날짜는 아이템 정보에서 자동으로 가져옵니다.'}
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
