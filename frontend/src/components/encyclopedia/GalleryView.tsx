import { useState } from 'react'
import { CollectionProgressResponseDto, CollectionItemResponseDto } from '../../api/collection'
import ProgressBar from './ProgressBar'

const ITEMS_PER_PAGE = 12

interface GalleryViewProps {
  album: CollectionProgressResponseDto
  items: CollectionItemResponseDto[]
  currentPage: number   // 0 = 표지, 1..N = 아이템, N+1 = 종권
  onPageChange: (page: number) => void
}

const rarityBorder = (rarity?: string) => {
  switch (rarity) {
    case 'LEGENDARY': return 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10'
    case 'EPIC':      return 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/10'
    case 'RARE':      return 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10'
    default:          return 'border-gray-300 dark:border-purple-900/30 bg-gray-50 dark:bg-gray-800/20'
  }
}

const rarityBadgeColor = (rarity: string) => {
  switch (rarity) {
    case 'LEGENDARY': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700/50'
    case 'EPIC':      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-700/50'
    case 'RARE':      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-700/50'
    default:          return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
  }
}

export default function GalleryView({ album, items, currentPage, onPageChange }: GalleryViewProps) {
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null)

  const totalSlots = album.gridX * album.gridY
  const contentPages = Math.max(1, Math.ceil(totalSlots / ITEMS_PER_PAGE))
  const totalPages = contentPages + 2  // 0: 표지, 1..contentPages: 아이템, contentPages+1: 종권

  const goTo = (page: number, dir: 'next' | 'prev') => {
    if (isFlipping) return
    setIsFlipping(dir)
    setTimeout(() => onPageChange(page), 300)
    setTimeout(() => setIsFlipping(null), 600)
  }

  const goNext = () => { if (currentPage < totalPages - 1) goTo(currentPage + 1, 'next') }
  const goPrev = () => { if (currentPage > 0) goTo(currentPage - 1, 'prev') }

  const isCover   = currentPage === 0
  const isClosing = currentPage === totalPages - 1
  const isContent = !isCover && !isClosing

  // 현재 콘텐츠 페이지에서 표시할 슬롯 범위 (1-indexed)
  const slotStart = isContent ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0
  const slotEnd   = isContent ? Math.min(slotStart + ITEMS_PER_PAGE - 1, totalSlots) : 0

  // 보유 통계
  const ownedCount = album.isOfficial ? items.filter(i => i.isOwned).length : items.length

  // 1. 계산 과정 콘솔 로그 (owned / total)
  const totalItems = album.totalItems || 1
  console.log(`[GalleryView] Calculation: owned(${ownedCount}) / total(${totalItems})`)
  
  // 2 & 3. 100% 초과 방지 및 Math.round 적용
  const rawProgress = (ownedCount / totalItems) * 100
  const progress = Math.max(0, Math.min(100, Math.round(rawProgress)))
  
  console.log(`[GalleryView] Result: ${progress}% (raw: ${rawProgress.toFixed(2)})`)

  // 레어도별 보유 현황
  const rarityStats = items.reduce((acc, item) => {
    if (!album.isOfficial || item.isOwned) {
      const r = item.rarity || 'COMMON'
      acc[r] = (acc[r] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <style>{`
        @keyframes galleryFlipNext {
          0%  { transform: perspective(1500px) rotateY(0deg);   opacity: 1; }
          49% { transform: perspective(1500px) rotateY(-90deg); opacity: 0; }
          50% { transform: perspective(1500px) rotateY(90deg);  opacity: 0; }
          100%{ transform: perspective(1500px) rotateY(0deg);   opacity: 1; }
        }
        @keyframes galleryFlipPrev {
          0%  { transform: perspective(1500px) rotateY(0deg);  opacity: 1; }
          49% { transform: perspective(1500px) rotateY(90deg); opacity: 0; }
          50% { transform: perspective(1500px) rotateY(-90deg);opacity: 0; }
          100%{ transform: perspective(1500px) rotateY(0deg);  opacity: 1; }
        }
      `}</style>

      <div className="w-full h-full flex flex-col bg-gradient-to-br from-[#fdfbf7] to-[#f4f1ea] dark:from-[#1a1740] dark:to-[#13112c] relative overflow-hidden transition-colors duration-300">

        {/* 이전 페이지 버튼 */}
        <div
          onClick={goPrev}
          className={`absolute left-0 top-16 bottom-12 w-16 z-20 flex items-center justify-start
            bg-gradient-to-r from-black/5 dark:from-white/5 to-transparent transition-opacity
            ${currentPage > 0 && !isFlipping ? 'cursor-pointer opacity-0 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <svg className="w-10 h-10 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </div>

        {/* 다음 페이지 버튼 */}
        <div
          onClick={goNext}
          className={`absolute right-0 top-16 bottom-12 w-16 z-20 flex items-center justify-end
            bg-gradient-to-l from-black/5 dark:from-white/5 to-transparent transition-opacity
            ${currentPage < totalPages - 1 && !isFlipping ? 'cursor-pointer opacity-0 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <svg className="w-10 h-10 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* 페이지 내용 (플립 애니메이션 적용) */}
        <div
          className={`flex-1 px-16 pt-16 pb-2 overflow-hidden origin-center
            ${isFlipping === 'next' ? 'animate-[galleryFlipNext_0.6s_ease-in-out]' : ''}
            ${isFlipping === 'prev' ? 'animate-[galleryFlipPrev_0.6s_ease-in-out]' : ''}`}
        >

          {/* ─── 표지 ─── */}
          {isCover && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-7 animate-in fade-in duration-300">
              <div className="w-44 h-60 rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 ring-2 ring-gray-200 dark:ring-purple-900/50 bg-white dark:bg-gray-800 shrink-0 transition-all">
                {album.thumbnailUrl ? (
                  <img src={album.thumbnailUrl} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 dark:from-gray-600 to-gray-400 dark:to-gray-800 flex items-center justify-center transition-colors">
                    <svg className="w-16 h-16 text-white/60 dark:text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="text-center">
                <h2 className="text-4xl font-bold font-serif text-gray-800 dark:text-gray-100 mb-1 transition-colors">{album.name}</h2>
                <p className="text-gray-400 dark:text-gray-500 text-xs tracking-widest uppercase transition-colors">{album.categoryName}</p>
              </div>

              <div className="w-72">
                <ProgressBar owned={album.collectedItems} total={album.totalItems} label="수집 진행률" size="md" />
              </div>

              <p className="text-gray-400 dark:text-gray-500 text-xs animate-pulse transition-colors">▶ 옆으로 넘겨 컬렉션을 펼쳐보세요</p>
            </div>
          )}

          {/* ─── 아이템 그리드 페이지 ─── */}
          {isContent && (
            <div className="w-full h-full flex flex-col animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">
                  # {slotStart} — {Math.min(slotEnd, totalSlots)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-serif transition-colors">
                  {currentPage} / {contentPages}
                </span>
              </div>

              <div
                className="grid gap-2 flex-1"
                style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}
              >
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => {
                  const slotNumber = slotStart + idx
                  if (slotNumber > totalSlots) return <div key={idx} />

                  const item = album.isOfficial
                    ? items.find(i => i.itemNumber === slotNumber)
                    : items[slotNumber - 1]

                  const isOwned = album.isOfficial ? !!item?.isOwned : !!item

                  return (
                    <div
                      key={slotNumber}
                      className={`relative rounded-lg border-2 overflow-hidden flex flex-col items-center justify-center
                        transition-all duration-200 hover:scale-105 hover:shadow-md
                        ${item ? rarityBorder(item.rarity) : 'border-dashed border-gray-300 dark:border-purple-900/50 bg-gray-100/50 dark:bg-gray-800/30'}
                        ${album.isOfficial && !isOwned ? 'opacity-40 grayscale' : ''}`}
                    >
                      {item?.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-1 left-0 right-0 px-1 text-center">
                            <p className="text-white text-[10px] font-bold leading-tight line-clamp-2 drop-shadow">
                              {item.name}
                            </p>
                          </div>
                        </>
                      ) : item ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 gap-0.5 pointer-events-none">
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold">#{slotNumber}</span>
                          <p className="text-gray-700 dark:text-gray-300 text-[10px] font-bold text-center leading-tight line-clamp-3">
                            {item.name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs font-bold pointer-events-none">#{slotNumber}</span>
                      )}

                      {/* 미수집 자물쇠 오버레이 (공식 도감) */}
                      {album.isOfficial && !isOwned && item && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── 종권 ─── */}
          {isClosing && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
              {progress === 100 ? (
                <div className="text-center">
                  <div className="text-5xl mb-3">🏆</div>
                  <h2 className="text-3xl font-bold font-serif text-yellow-600 dark:text-yellow-400 mb-1 transition-colors">컬렉션 완성!</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">모든 아이템을 수집했습니다</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-3">📖</div>
                  <h2 className="text-3xl font-bold font-serif text-gray-700 dark:text-gray-200 mb-1 transition-colors">수집 요약</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">{album.name}</p>
                </div>
              )}

              {/* 통계 카드 */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="bg-white/80 dark:bg-black/20 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-purple-900/30 transition-colors">
                  <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{album.collectedItems}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">보유</p>
                </div>
                <div className="bg-white/80 dark:bg-black/20 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-purple-900/30 transition-colors">
                  <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{album.totalItems}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">전체</p>
                </div>
                <div className={`rounded-xl p-4 text-center shadow-sm border transition-colors
                  ${progress === 100 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700/50' : 'bg-white/80 dark:bg-black/20 border-gray-200 dark:border-purple-900/30'}`}
                >
                  <p className={`text-2xl font-black ${progress === 100 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {progress.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">달성률</p>
                </div>
              </div>

              {/* 레어도별 보유 분포 */}
              {Object.keys(rarityStats).length > 0 && (
                <div className="w-full max-w-md bg-white/60 dark:bg-black/10 rounded-xl p-4 border border-gray-200 dark:border-purple-900/30 transition-colors">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">레어도 분포</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(['LEGENDARY', 'EPIC', 'RARE', 'COMMON'] as const).map(r => {
                      const count = rarityStats[r]
                      if (!count) return null
                      return (
                        <span key={r} className={`px-3 py-1 rounded-full text-xs font-bold border ${rarityBadgeColor(r)}`}>
                          {r} × {count}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              <button 
                onClick={() => goTo(0, 'prev')}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs animate-pulse transition-colors mt-2"
              >
                ◀ 처음으로 돌아가기
              </button>
            </div>
          )}

        </div>

        {/* 하단 페이지 도트 네비게이션 */}
        <div className="flex items-center justify-center gap-1.5 pb-3 shrink-0">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`rounded-full transition-all duration-200
                ${i === currentPage ? 'w-4 h-2 bg-gray-600 dark:bg-gray-400' : 'w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
            />
          ))}
        </div>

      </div>
    </>
  )
}
