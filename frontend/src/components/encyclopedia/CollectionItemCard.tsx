import { CollectionItemResponseDto } from '../../api/collection'

interface CollectionItemCardProps {
  item: CollectionItemResponseDto | null
  slotNumber: number
  isOfficial: boolean
  isSelected: boolean
  isSelectedEmpty: boolean
  onCardClick: (item: CollectionItemResponseDto) => void
  onEmptySlotClick: (slotNumber: number) => void
}

export default function CollectionItemCard({
  item,
  slotNumber,
  isOfficial,
  isSelected,
  isSelectedEmpty,
  onCardClick,
  onEmptySlotClick,
}: CollectionItemCardProps) {
  if (item) {
    const isOwned = item.isOwned ?? true // 커스텀 도감은 항상 보유로 처리

    return (
      <div
        onClick={() => onCardClick(item)}
        className={`aspect-[3/4] rounded-md flex flex-col items-center justify-center bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden relative group
          ${isSelected ? 'ring-4 ring-blue-500 scale-105 z-10' : ''}`}
        title={item.name}
      >
        {/* 이미지 영역 */}
        <div className={`w-full h-full bg-gray-100 flex flex-col items-center justify-center transition-all
          ${isOfficial && !isOwned ? 'grayscale opacity-70' : ''}`}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
          ) : (
            <div className="text-center p-2 flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-50 to-indigo-100 w-full">
              <span className="text-gray-400 text-xs font-bold mb-1">#{slotNumber}</span>
              <span className="text-indigo-900 font-bold text-xs leading-tight line-clamp-2 px-1">{item.name}</span>
              <span className="text-[10px] text-gray-500 mt-2 bg-white/50 px-1 rounded">{item.rarity}</span>
            </div>
          )}
        </div>

        {/* 보유 여부 배지 (공식 도감만) */}
        {isOfficial && (
          <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow z-20
            ${isOwned ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
            {isOwned ? '보유중' : '미보유'}
          </span>
        )}

        {/* 미보유 hover 오버레이 (공식 도감만) */}
        {isOfficial && !isOwned && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
            <span className="text-white text-xs font-bold bg-gray-700/80 px-2 py-1 rounded">미획득</span>
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
      className={`aspect-[3/4] border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer
        ${isSelectedEmpty ? 'ring-4 ring-gray-400 bg-gray-100' : ''}`}
      title={`Slot ${slotNumber} (Empty)`}
    >
      <span className="text-gray-300 font-bold font-serif text-xl">{slotNumber}</span>
    </div>
  )
}
