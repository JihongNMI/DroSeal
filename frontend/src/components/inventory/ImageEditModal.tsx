import { useState } from 'react'

interface ImageEditModalProps {
  currentImageUrl?: string
  itemName: string
  onSave: (imageUrl: string | undefined) => void
  onCancel: () => void
}

export function ImageEditModal({ currentImageUrl, itemName, onSave, onCancel }: ImageEditModalProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '')
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url')
  const [imageFile, setImageFile] = useState<File | null>(null)

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

  const handleSave = async () => {
    let finalImageUrl = imageUrl

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

    onSave(finalImageUrl || undefined)
  }

  const handleRemove = () => {
    onSave(undefined)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-white dark:bg-[#1a1740] rounded-lg p-6 max-w-md w-full transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">이미지 수정</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors">{itemName}</p>

        <div className="space-y-4">
          {/* Image input type selector */}
          <div className="flex gap-4 text-gray-700 dark:text-gray-300 transition-colors">
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">미리보기</label>
              <img
                src={imageUrl}
                alt="미리보기"
                className="w-full max-h-64 object-contain rounded border border-gray-300 dark:border-purple-900/50 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-400 transition-colors"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-purple-900/30 transition-colors">
          {currentImageUrl && (
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              이미지 제거
            </button>
          )}
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
