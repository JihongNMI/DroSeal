import { CollectionItemResponseDto } from '../../api/collection'

interface CollectionItemCardProps {
  item: CollectionItemResponseDto | null
  slotNumber: number
  isOfficial: boolean
  isSelected: boolean
  isSelectedEmpty: boolean
  onCardClick: (item: CollectionItemResponseDto) => void
  onEmptySlotClick: (slotNumber: number) => void
  onDeleteItem?: (itemId: number) => void
}

export default function CollectionItemCard({
  item,
  slotNumber,
  isOfficial,
  isSelected,
  isSelectedEmpty,
  onCardClick,
  onEmptySlotClick,
  onDeleteItem,
}: CollectionItemCardProps) {
  if (item) {
    const isOwned = item.isOwned ?? true // 커스텀 도감은 항상 보유로 처리

    return (
      <div
        onMouseDown={(e) => { if (e.button === 0) onCardClick(item) }}
        className={`h-full w-full rounded-md flex flex-col items-center justify-center bg-white dark:bg-[#1a1740] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden relative group
          ${isSelected ? 'ring-4 ring-blue-500 scale-105 z-10' : ''}`}
        title={item.name}
      >
        {/* 이미지 영역 */}
        <div className={`w-full h-full bg-gray-100 dark:bg-[#13112c] flex flex-col items-center justify-center transition-all
          ${isOfficial && !isOwned ? 'grayscale opacity-70' : ''}`}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
          ) : (
            <div className="text-center p-2 flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-[#1a1740] dark:to-[#13112c] w-full">
              <span className="text-gray-400 dark:text-gray-500 text-xs font-bold mb-1">#{slotNumber}</span>
              <span className="text-indigo-900 dark:text-indigo-300 font-bold text-xs leading-tight line-clamp-2 px-1">{item.name}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 bg-white/50 dark:bg-black/30 px-1 rounded">{item.rarity}</span>
            </div>
          )}
        </div>

        {/* 삭제 버튼 */}
        {onDeleteItem && (
          <button
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (window.confirm(`"${item.name}" 아이템을 삭제하시겠습니까?`)) {
                onDeleteItem(item.itemId)
              }
            }}
            className="absolute top-1 right-1 z-30 w-8 h-8 bg-black/50 hover:bg-red-600 text-white/80 hover:text-white rounded-full flex items-center justify-center invisible group-hover:visible transition-all duration-200"
            title="아이템 삭제"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 보유 여부 배지 (공식 도감만) */}
        {isOfficial && (
          <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow z-20
            ${isOwned ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
            {isOwned ? '보유중' : '미보유'}
          </span>
        )}

        {/* 미보유 hover 오버레이 (공식 도감만) */}
        {isOfficial && !isOwned && (
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
            <span className="text-white text-xs font-bold bg-gray-700/80 dark:bg-[#0d0b2b]/90 px-2 py-1 rounded border border-white/10">미획득</span>
          </div>
        )}

        {/* 보유 카드 홀로그램 효과 */}
        {(!isOfficial || isOwned) && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
        )}
      </div>
    )
  }

  // 빈 슬롯
  return (
    <div
      onClick={() => onEmptySlotClick(slotNumber)}
      className={`h-full w-full border-2 border-dashed border-gray-300 dark:border-purple-900/50 rounded-md flex items-center justify-center bg-gray-50/50 dark:bg-[#13112c]/50 hover:bg-gray-100 dark:hover:bg-[#1a1740] transition-colors cursor-pointer
        ${isSelectedEmpty ? 'ring-4 ring-gray-400 dark:ring-gray-600 bg-gray-100 dark:bg-[#1a1740]' : ''}`}
      title={`Slot ${slotNumber} (Empty)`}
    >
      <span className="text-gray-300 dark:text-gray-600 font-bold font-serif text-xl transition-colors">{slotNumber}</span>
    </div>
  )
}
