import { CollectionProgressResponseDto } from '../../api/collection'

interface CollectionCardProps {
  col: CollectionProgressResponseDto
  onClick: () => void
  onDelete: (collectionId: number) => void
}

export default function CollectionCard({ col, onClick, onDelete }: CollectionCardProps) {
  const progress = col.totalItems > 0 ? (col.collectedItems / col.totalItems) * 100 : 0
  const isComplete = progress === 100 && col.totalItems > 0

  return (
    <div
      onMouseDown={(e) => { if (e.button === 0) onClick() }}
      className={`group relative w-52 h-72 rounded-r-lg rounded-l-sm overflow-hidden transition-all duration-500 hover:-translate-y-4 cursor-pointer
        ${isComplete
          ? 'shadow-[0_0_20px_rgba(250,204,21,0.4)] border-2 border-yellow-500/50'
          : 'bg-gray-900 shadow-2xl'}`}
    >
      {/* 이미지 레이어 */}
      <img
        src={col.thumbnailUrl || 'https://via.placeholder.com/160x224?text=No+Image'}
        alt={col.name}
        style={{
          filter: isComplete
            ? 'grayscale(0%) brightness(1.1)'
            : `grayscale(${100 - progress}%) brightness(${0.7 + (progress / 100) * 0.3})`,
          opacity: 0.7 + (progress / 100) * 0.3
        }}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
      />

      {/* 삭제 버튼 */}
      <button
        onMouseDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (window.confirm(`"${col.name}" 도감을 삭제하시겠습니까?\n도감에 속한 모든 카드도 함께 삭제됩니다.`)) {
            onDelete(col.collectionId)
          }
        }}
        className="absolute top-2 right-2 z-20 w-10 h-10 bg-black/50 hover:bg-red-600 text-white/80 hover:text-white rounded-full flex items-center justify-center invisible group-hover:visible transition-all duration-200"
        title="도감 삭제"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 텍스트 및 UI 레이어 */}
      <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/30">
        <div>
          <h3 className={`font-extrabold text-lg drop-shadow-lg transition-transform duration-500 group-hover:scale-105 origin-left line-clamp-2
            ${isComplete ? 'text-yellow-400' : 'text-white'}`}>
            {col.name}
          </h3>
          <div className="flex gap-1 mt-1 flex-wrap">
            {col.isOfficial && (
              <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">
                OFFICIAL
              </span>
            )}
            {isComplete && (
              <span className="inline-block px-2 py-0.5 bg-yellow-500 text-[10px] text-black font-black rounded-sm animate-pulse">
                COMPLETE
              </span>
            )}
          </div>
        </div>

        {/* 진행도 바 */}
        <div className="w-full">
          <div className="flex justify-between items-end mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isComplete ? 'text-yellow-400/80' : 'text-white/70'}`}>
              Progress
            </span>
            <span className="text-yellow-400 text-xs font-black">{progress.toFixed(0)}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden backdrop-blur-sm ${isComplete ? 'bg-yellow-900/50' : 'bg-white/20'}`}>
            <div
              className={`h-full transition-all duration-1000 ${isComplete
                ? 'bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,1)]'
                : 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
