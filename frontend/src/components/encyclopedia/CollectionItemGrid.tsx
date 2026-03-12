import { useState } from 'react'
import { CollectionProgressResponseDto, CollectionItemResponseDto } from '../../api/collection'
import CollectionItemCard from './CollectionItemCard'
import ProgressBar from './ProgressBar'

interface CollectionItemGridProps {
  album: CollectionProgressResponseDto
  items: CollectionItemResponseDto[]
  currentPage: number
  itemsPerPage: number
  selectedCardItem: CollectionItemResponseDto | null
  selectedEmptySlotInfo: { slotNumber: number } | null
  onPageChange: (page: number) => void
  onAddCard: () => void
  onCardClick: (item: CollectionItemResponseDto) => void
  onEmptySlotClick: (slotNumber: number) => void
}

export default function CollectionItemGrid({
  album,
  items,
  currentPage,
  itemsPerPage,
  selectedCardItem,
  selectedEmptySlotInfo,
  onPageChange,
  onAddCard,
  onCardClick,
  onEmptySlotClick,
}: CollectionItemGridProps) {
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null)
  const maxPage = Math.ceil((album.gridX * album.gridY) / itemsPerPage)

  const goToPrev = () => {
    if (currentPage > 1 && !isFlipping) {
      setIsFlipping('prev')
      setTimeout(() => onPageChange(Math.max(1, currentPage - 1)), 300)
      setTimeout(() => setIsFlipping(null), 600)
    }
  }

  const goToNext = () => {
    if (currentPage < maxPage && !isFlipping) {
      setIsFlipping('next')
      setTimeout(() => onPageChange(Math.min(maxPage, currentPage + 1)), 300)
      setTimeout(() => setIsFlipping(null), 600)
    }
  }

  return (
    <>
    <style>{`
      @keyframes pageFlipNext {
        0% { transform: perspective(1500px) rotateY(0deg); opacity: 1; }
        49% { transform: perspective(1500px) rotateY(-90deg); opacity: 0; }
        50% { transform: perspective(1500px) rotateY(90deg); opacity: 0; }
        100% { transform: perspective(1500px) rotateY(0deg); opacity: 1; }
      }
      @keyframes pageFlipPrev {
        0% { transform: perspective(1500px) rotateY(0deg); opacity: 1; }
        49% { transform: perspective(1500px) rotateY(90deg); opacity: 0; }
        50% { transform: perspective(1500px) rotateY(-90deg); opacity: 0; }
        100% { transform: perspective(1500px) rotateY(0deg); opacity: 1; }
      }
    `}</style>
    <div className="w-full md:w-1/2 h-full p-8 bg-gradient-to-l from-[#fdfbf7] to-[#f4f1ea] dark:from-[#1a1740] dark:to-[#13112c] overflow-y-auto relative custom-scrollbar flex flex-col transition-colors duration-300">
      {/* 책등 그림자 */}
      <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10" />

      {/* 이전 페이지 클릭 영역 */}
      <div
        className={`absolute left-0 top-16 bottom-0 w-16 z-20 flex items-center justify-start transition-opacity bg-gradient-to-r from-black/5 dark:from-white/5 to-transparent
          ${currentPage > 1 && !isFlipping ? 'cursor-pointer opacity-0 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={goToPrev}
      >
        <svg className="w-10 h-10 text-gray-500 dark:text-gray-400 ml-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </div>

      {/* 다음 페이지 클릭 영역 */}
      <div
        className={`absolute right-0 top-16 bottom-0 w-16 z-20 flex items-center justify-end transition-opacity bg-gradient-to-l from-black/5 dark:from-white/5 to-transparent
          ${currentPage < maxPage && !isFlipping ? 'cursor-pointer opacity-0 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={goToNext}
      >
        <svg className="w-10 h-10 text-gray-500 dark:text-gray-400 mr-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* 페이지 플립 애니메이션 래퍼 */}
      <div className={`relative z-10 w-full flex flex-col items-center flex-1 origin-left
        ${isFlipping === 'next' ? 'animate-[pageFlipNext_0.6s_ease-in-out]' : ''}
        ${isFlipping === 'prev' ? 'animate-[pageFlipPrev_0.6s_ease-in-out]' : ''}`}
      >
        {/* 헤더 */}
        <div className="w-full flex justify-between items-center mb-6 px-4">
          <h3 className="text-xl font-bold font-serif text-gray-800 dark:text-gray-100 transition-colors">컬렉션 아이템</h3>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 dark:text-gray-400 font-serif font-semibold transition-colors">
              [ {currentPage} / {maxPage} ]
            </span>
            <button
              onClick={onAddCard}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow transition-colors flex items-center gap-1 z-30 relative"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              카드 추가
            </button>
          </div>
        </div>

        {/* 공식 도감 보유 현황 바 */}
        {album.isOfficial && (
          <div className="w-full px-4 mb-4">
            <ProgressBar owned={album.collectedItems} total={album.totalItems} label="보유 현황" size="sm" />
          </div>
        )}

        {/* 3×3 그리드 */}
        <div
          className="grid gap-3 mx-auto w-full flex-1"
          style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
        >
          {Array.from({ length: itemsPerPage }).map((_, index) => {
            const slotNumber = (Math.max(1, currentPage) - 1) * itemsPerPage + index + 1
            if (slotNumber > album.gridX * album.gridY) return null
            const item = items.find(c => c.itemNumber === slotNumber) || items[slotNumber - 1] || null
            return (
              <CollectionItemCard
                key={slotNumber}
                item={item}
                slotNumber={slotNumber}
                isOfficial={album.isOfficial}
                isSelected={selectedCardItem?.itemId === item?.itemId}
                isSelectedEmpty={selectedEmptySlotInfo?.slotNumber === slotNumber}
                onCardClick={onCardClick}
                onEmptySlotClick={onEmptySlotClick}
              />
            )
          })}
        </div>
      </div>
    </div>
    </>
  )
}
