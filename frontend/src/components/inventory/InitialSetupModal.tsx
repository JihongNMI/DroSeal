import { useState } from 'react'

interface InitialSetupModalProps {
  isOpen: boolean
  onComplete: (categories: string[]) => void
}

interface CollectionStyle {
  id: 'by-type' | 'by-content'
  title: string
  description: string
  examples: string[]
}

const COLLECTION_STYLES: CollectionStyle[] = [
  {
    id: 'by-type',
    title: '아이템 종류별로 모으기',
    description: '수집품의 종류에 따라 분류합니다',
    examples: ['씰', '카드', '피규어']
  },
  {
    id: 'by-content',
    title: '작품/컨텐츠별로 모으기',
    description: '작품이나 캐릭터별로 분류합니다',
    examples: ['포켓몬', '블루아카', '산리오']
  }
]

export function InitialSetupModal({ isOpen, onComplete }: InitialSetupModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedStyle, setSelectedStyle] = useState<'by-type' | 'by-content' | null>(null)
  const [categoryNames, setCategoryNames] = useState<string[]>([''])
  const [errors, setErrors] = useState<string[]>([])

  if (!isOpen) return null

  const handleStyleSelect = (styleId: 'by-type' | 'by-content') => {
    setSelectedStyle(styleId)
    setStep(2)
  }

  const handleCategoryNameChange = (index: number, value: string) => {
    const newNames = [...categoryNames]
    newNames[index] = value
    setCategoryNames(newNames)
    
    // Clear error for this field
    const newErrors = [...errors]
    newErrors[index] = ''
    setErrors(newErrors)
  }

  const handleAddCategory = () => {
    setCategoryNames([...categoryNames, ''])
    setErrors([...errors, ''])
  }

  const handleRemoveCategory = (index: number) => {
    if (categoryNames.length > 1) {
      setCategoryNames(categoryNames.filter((_, i) => i !== index))
      setErrors(errors.filter((_, i) => i !== index))
    }
  }

  const validateAndSubmit = () => {
    const newErrors: string[] = []
    let hasError = false

    categoryNames.forEach((name, index) => {
      if (name.trim() === '') {
        newErrors[index] = '카테고리 이름을 입력해주세요'
        hasError = true
      } else {
        newErrors[index] = ''
      }
    })

    setErrors(newErrors)

    if (!hasError) {
      const validNames = categoryNames.map(name => name.trim()).filter(name => name !== '')
      onComplete(validNames)
    }
  }

  const handleBack = () => {
    setStep(1)
    setSelectedStyle(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-colors">
      <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 transition-colors">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 transition-colors">수집품을 어떤 방식으로 관리하고 싶으신가요?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
              나중에 언제든지 카테고리를 추가하거나 변경할 수 있습니다.
            </p>
            
            <div className="space-y-4">
              {COLLECTION_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className="w-full text-left p-6 border-2 border-gray-200 dark:border-purple-900/30 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 transition-colors">{style.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 transition-colors">{style.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-sm text-gray-500 dark:text-gray-500 transition-colors">예:</span>
                    {style.examples.map((example, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 dark:bg-[#13112c] text-gray-700 dark:text-gray-300 rounded-full text-sm transition-colors"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4 transition-colors">
              <button
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mr-4 transition-colors"
              >
                ← 뒤로
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors">카테고리 이름 입력</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
              {selectedStyle === 'by-type' 
                ? '수집하는 아이템 종류를 입력해주세요 (예: 씰, 카드, 피규어)'
                : '수집하는 작품이나 캐릭터를 입력해주세요 (예: 포켓몬, 블루아카, 산리오)'}
            </p>

            <div className="space-y-3 mb-6">
              {categoryNames.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleCategoryNameChange(index, e.target.value)}
                      placeholder="카테고리 이름"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors ${
                        errors[index] ? 'border-red-500 dark:border-red-900' : 'border-gray-300 dark:border-purple-900/50'
                      }`}
                    />
                    {errors[index] && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors">{errors[index]}</p>
                    )}
                  </div>
                  {categoryNames.length > 1 && (
                    <button
                      onClick={() => handleRemoveCategory(index)}
                      className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 transition-colors">
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                + 카테고리 추가
              </button>
              <button
                onClick={validateAndSubmit}
                className="ml-auto px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                완료
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
