import { useState } from 'react'
import { CollectionProgressResponseDto, createCollectionItem } from '../../api/collection'
import { createInventoryItem } from '../../api/inventory'
import { uploadImage, analyzeImage } from '../../api/upload'

interface AddCardModalProps {
  album: CollectionProgressResponseDto
  onClose: () => void
  onSuccess: (collectionId: number, isOfficial: boolean) => void
}

export default function AddCardModal({ album, onClose, onSuccess }: AddCardModalProps) {
  const [cardName, setCardName] = useState('')
  const [cardDescription, setCardDescription] = useState('')
  const [cardRarity, setCardRarity] = useState('COMMON')
  const [cardNote, setCardNote] = useState('')
  const [cardPrice, setCardPrice] = useState<number | ''>('')
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('file')
  const [cardImageUrl, setCardImageUrl] = useState('')
  const [cardImageFile, setCardImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)

  const handleSubmit = async () => {
    if (!cardName.trim()) { alert('카드 이름은 필수 항목입니다.'); return }

    try {
      setIsSubmitting(true)
      let finalImageUrl = cardImageUrl.trim()

      if (imageInputMode === 'file' && cardImageFile) {
        try {
          finalImageUrl = await uploadImage(cardImageFile)
        } catch {
          alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
          return
        }
      }

      const newCollectionItem = await createCollectionItem({
        collectionId: album.collectionId,
        name: cardName,
        rarity: cardRarity,
        description: cardDescription,
        imageUrl: finalImageUrl || undefined,
        isOfficial: false,
      })

      await createInventoryItem({
        itemId: newCollectionItem.itemId,
        collectionId: album.collectionId,
        categoryId: album.categoryId,
        regType: 'MANUAL',
        quantity: 1,
        userImageUrl: finalImageUrl || undefined,
        note: cardNote,
        purchasedPrice: cardPrice === '' ? 0 : Number(cardPrice),
      })

      alert('카드가 인벤토리에 성공적으로 추가되었습니다!')
      onSuccess(album.collectionId, album.isOfficial)
      onClose()
    } catch (error) {
      console.error('Failed to add card:', error)
      alert('카드 추가에 실패했습니다. 서버 로그를 확인해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAiAnalyze = async () => {
    if (imageInputMode !== 'file' || !cardImageFile) {
      alert('AI 분석을 위해서는 파일 이미지를 업로드해야 합니다.')
      return
    }
    try {
      setIsAiAnalyzing(true)
      const aiResults = await analyzeImage(cardImageFile)
      if (aiResults && aiResults.length > 0) {
        const best = aiResults[0]
        setCardName(best.name || '')
        setCardDescription(best.description || '')
        setCardRarity(best.rarity || 'COMMON')
        alert('AI 분석이 완료되었습니다. 추출된 정보를 확인하고 등록해주세요.')
      } else {
        alert('AI가 이미지에서 굿즈 정보를 찾지 못했습니다.')
      }
    } catch {
      alert('AI 분석 중 오류가 발생했습니다.')
    } finally {
      setIsAiAnalyzing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-colors">
      <div className="bg-white dark:bg-[#1a1740] rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200 dark:border-purple-900/50 transition-colors">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 font-serif transition-colors">새 카드 등록</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors"><span className="font-semibold text-gray-700 dark:text-gray-200">{album.name}</span> 에 추가 중</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">카드 이름 *</label>
            <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow transition-colors"
              placeholder="예: 홀로그램 피카츄" />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">등급 (Rarity)</label>
              <select value={cardRarity} onChange={(e) => setCardRarity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 transition-colors">
                <option value="COMMON">일반 (Common)</option>
                <option value="RARE">레어 (Rare)</option>
                <option value="EPIC">에픽 (Epic)</option>
                <option value="LEGENDARY">전설 (Legendary)</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">구매 가격 (₩)</label>
              <input type="number" value={cardPrice} onChange={(e) => setCardPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow transition-colors"
                placeholder="예: 5000" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">이미지 첨부</label>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 transition-colors">
                {(['file', 'url'] as const).map(mode => (
                   <button key={mode}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${imageInputMode === mode ? 'bg-white dark:bg-[#1a1740] shadow text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => setImageInputMode(mode)}>
                    {mode === 'file' ? '파일 업로드' : '웹 URL'}
                  </button>
                ))}
              </div>
            </div>

            {imageInputMode === 'file' ? (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 dark:border-purple-900/50 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-[#13112c]/50 hover:bg-gray-100 dark:hover:bg-[#1a1740] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-6 h-6 mb-2 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold transition-colors">업로드하려면 클릭하세요</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors">PNG, JPG, WEBP 지원</p>
                </div>
                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => { if (e.target.files?.[0]) setCardImageFile(e.target.files[0]) }} />
              </label>
            ) : (
              <input type="text" value={cardImageUrl} onChange={(e) => setCardImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                placeholder="https://example.com/image.png (선택사항)" />
            )}

            {imageInputMode === 'file' && cardImageFile && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 p-1.5 rounded border border-green-200 dark:border-green-800/50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                선택된 파일: {cardImageFile.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">상세 정보 및 메모</label>
            <textarea value={cardDescription} onChange={(e) => setCardDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
              placeholder="카드에 대한 설명이나 특징을 기록해주세요..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">My Secret Note</label>
            <textarea value={cardNote} onChange={(e) => setCardNote(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 bg-yellow-50 dark:bg-yellow-900/10 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
              placeholder="어디서 구했나요? 특징이나 상태를 적어주세요." />
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center gap-3">
          <button onClick={handleAiAnalyze}
            disabled={isSubmitting || isAiAnalyzing || imageInputMode !== 'file' || !cardImageFile}
            className={`px-4 py-2 text-white rounded-lg font-medium shadow-md transition-all flex items-center gap-2 ${isAiAnalyzing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            title="AI가 이미지를 분석하여 카드 정보를 자동으로 채워줍니다.">
            {isAiAnalyzing ? '🤖 분석 중...' : '✨ AI 자동 분석'}
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isSubmitting || isAiAnalyzing}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
              취소
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting || isAiAnalyzing}
              className={`px-5 py-2 text-white rounded-lg font-medium shadow-md transition-all ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isSubmitting ? '등록 중...' : '인벤토리에 추가'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
