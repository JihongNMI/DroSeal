import { CollectionProgressResponseDto } from '../../api/collection'

interface CollectionCardProps {
  col: CollectionProgressResponseDto
  onClick: () => void
}

export default function CollectionCard({ col, onClick }: CollectionCardProps) {
  const progress = col.totalItems > 0 ? (col.collectedItems / col.totalItems) * 100 : 0
  const isComplete = progress === 100 && col.totalItems > 0

  return (
    <div
      onClick={onClick}
      className={`group relative w-52 h-72 rounded-r-lg rounded-l-sm overflow-hidden transition-all duration-500 hover:-translate-y-4 cursor-pointer
        ${isComplete
          ? 'shadow-[0_0_20px_rgba(250,204,21,0.4)] border-2 border-yellow-500/50'
          : 'bg-gray-900 shadow-2xl'}`}
    >
      {/* 이미지 레이어 */}
      <img
        src={col.thumbnailUrl || 'https://via.placeholder.com/160x224?text=No+Image'}
        alt={col.name}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out
          ${isComplete
            ? 'grayscale-0 opacity-100 brightness-110 scale-100'
            : 'grayscale opacity-70 brightness-75 scale-110 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-110 group-hover:scale-100'}`}
      />

      {/* 텍스트 및 UI 레이어 */}
      <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/30">
        <div>
          <h3 className={`font-extrabold text-lg drop-shadow-lg transition-transform duration-500 group-hover:scale-105 origin-left line-clamp-2
            ${isComplete ? 'text-yellow-400' : 'text-white'}`}>
            {col.name}
          </h3>
          <div className="flex gap-1 mt-1 flex-wrap">
            {col.isOfficial && (
              <span className="inline-block px-2 py-0.5 bg-yellow-400 text-[10px] font-black text-blue-900 rounded-sm">
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
