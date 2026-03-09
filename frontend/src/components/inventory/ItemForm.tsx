import { useState, useEffect } from 'react'
import type { InventoryItem, InventoryCategory, Encyclopedia } from '../../types'

interface ItemFormProps {
  item?: InventoryItem // undefined for create, defined for edit
  categories: InventoryCategory[]
  encyclopedias: Encyclopedia[]
  uncategorizedId: string
  onSubmit: (item: Partial<InventoryItem>) => void
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
      setName(item.name)
      setCategoryId(item.categoryId)
      setQuantity(item.quantity)
      setPrice(item.price?.toString() || '')
      setDate(new Date(item.date).toISOString().split('T')[0])
      setEncyclopediaId(item.encyclopediaId || '')
      setNotes(item.notes)
      setImageUrl(item.imageUrl || '')
    }
  }, [item])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '아이템 이름을 입력해주세요'
    }

    if (quantity < 0) {
      newErrors.quantity = '수량은 0 이상이어야 합니다'
    }

    if (price && isNaN(parseFloat(price))) {
      newErrors.price = '올바른 가격을 입력해주세요'
    }

    if (price && parseFloat(price) < 0) {
      newErrors.price = '가격은 0 이상이어야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const itemData: Partial<InventoryItem> = {
      name: name.trim(),
      categoryId,
      quantity,
      price: price ? parseFloat(price) : undefined,
      date: new Date(date),
      encyclopediaId: encyclopediaId || undefined,
      notes: notes.trim(),
      imageUrl: imageUrl || undefined
    }

    onSubmit(itemData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {isEditMode ? '아이템 수정' : '아이템 추가'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="아이템 이름"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              카테고리 *
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              수량 *
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Price field (optional) */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              구입 가격 (선택사항)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="가격 (선택사항)"
              min="0"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {/* Date field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              일자 *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Encyclopedia field (optional) */}
          <div>
            <label htmlFor="encyclopedia" className="block text-sm font-medium text-gray-700 mb-1">
              도감 (선택사항)
            </label>
            <select
              id="encyclopedia"
              value={encyclopediaId}
              onChange={(e) => setEncyclopediaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 (선택사항)
            </label>
            
            {/* Image input type selector */}
            <div className="flex gap-4 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {/* Image preview */}
            {imageUrl && (
              <div className="mt-2">
                <img 
                  src={imageUrl} 
                  alt="미리보기" 
                  className="w-32 h-32 object-cover rounded border"
                  onError={() => setImageUrl('')}
                />
              </div>
            )}
          </div>

          {/* Notes field */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {isEditMode ? '수정' : '추가'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
