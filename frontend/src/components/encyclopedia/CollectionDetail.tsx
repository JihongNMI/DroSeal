import { CollectionProgressResponseDto, CollectionItemResponseDto } from '../../api/collection'
import { UserCollectionNoteDto } from '../../api/collectionNote'
import ProgressBar from './ProgressBar'

interface CollectionDetailProps {
  album: CollectionProgressResponseDto
  selectedCardItem: CollectionItemResponseDto | null
  selectedEmptySlotInfo: { slotNumber: number } | null
  selectedCollectionNote: UserCollectionNoteDto | null
  isEditingNote: boolean
  editNoteText: string
  editPrice: number | ''
  isSavingNote: boolean
  isUploadingImage: boolean
  onBackFromCard: () => void
  onBackFromEmpty: () => void
  onStartEditing: () => void
  onCancelEditing: () => void
  onEditNoteChange: (text: string) => void
  onEditPriceChange: (price: number | '') => void
  onSaveNote: () => void
  onImageEditClick: () => void
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSetThumbnail: () => void
}

export default function CollectionDetail({
  album,
  selectedCardItem,
  selectedEmptySlotInfo,
  selectedCollectionNote,
  isEditingNote,
  editNoteText,
  editPrice,
  isSavingNote,
  isUploadingImage,
  onBackFromCard,
  onBackFromEmpty,
  onStartEditing,
  onCancelEditing,
  onEditNoteChange,
  onEditPriceChange,
  onSaveNote,
  onImageEditClick,
  onImageFileChange,
  onSetThumbnail,
}: CollectionDetailProps) {
  return (
    <div className="w-full md:w-1/2 h-full p-8 border-r border-gray-300 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] bg-gradient-to-r from-[#fdfbf7] to-[#f4f1ea] relative overflow-y-auto custom-scrollbar">
      <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />
      <div className="relative z-10 h-full flex flex-col">

        {selectedCardItem ? (
          // --- 카드 상세 뷰 ---
          <div className="flex flex-col h-full animate-in slide-in-from-left-4 fade-in duration-300">
            <button
              onClick={onBackFromCard}
              className="flex items-center text-gray-500 hover:text-blue-600 font-semibold mb-4 transition-colors w-fit"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              돌아가기
            </button>

            {/* 이미지 영역 */}
            <div className="w-full h-64 bg-gray-100 rounded-lg shadow-md mb-6 overflow-hidden flex flex-col items-center justify-center border border-gray-200 shrink-0 relative group">
              {selectedCardItem.imageUrl ? (
                <img src={selectedCardItem.imageUrl} alt={selectedCardItem.name} className="object-contain w-full h-full" />
              ) : (
                <div className="text-gray-400 font-serif text-lg">이미지 없음</div>
              )}
              <div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm"
                onClick={onImageEditClick}
              >
                {isUploadingImage ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
                ) : (
                  <svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <span className="text-white font-semibold shadow-sm">{isUploadingImage ? '업로드 중...' : '이미지 변경'}</span>
              </div>
              <input
                type="file"
                id="edit-image-upload"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={onImageFileChange}
              />
            </div>

            {/* 카드 정보 */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold font-serif text-gray-800 mb-2 leading-tight">{selectedCardItem.name}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border
                    ${selectedCardItem.rarity === 'LEGENDARY' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      selectedCardItem.rarity === 'EPIC' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                      selectedCardItem.rarity === 'RARE' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-gray-100 text-gray-800 border-gray-300'}`}>
                    {selectedCardItem.rarity || 'COMMON'}
                  </span>
                </div>
                {selectedCardItem.imageUrl && (
                  <button
                    onClick={onSetThumbnail}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow transition-colors flex items-center gap-1"
                    title="이 카드의 이미지를 현재 도감의 겉표지(썸네일)로 사용합니다."
                  >
                    표지로 설정
                  </button>
                )}
              </div>

              {selectedCardItem.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">공식 설명</h4>
                  <p className="text-gray-700 font-serif leading-relaxed text-sm">{selectedCardItem.description}</p>
                </div>
              )}

              {/* 공개 메모 */}
              <div className="bg-yellow-50/80 border border-yellow-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="flex items-center text-sm font-bold text-yellow-800">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    공개 메모
                  </h4>
                  {!isEditingNote && (
                    <button
                      onClick={onStartEditing}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-yellow-100 transition-colors"
                    >
                      수정
                    </button>
                  )}
                </div>

                {isEditingNote ? (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <textarea
                      value={editNoteText}
                      onChange={(e) => onEditNoteChange(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none resize-none bg-white"
                      placeholder="남들에게 보여줄 코멘트를 적어보세요..."
                    />
                    <div className="flex justify-between items-center border-t border-yellow-200/50 pt-3">
                      <span className="text-gray-500 text-sm font-semibold">Asking Price (₩)</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => onEditPriceChange(e.target.value ? Number(e.target.value) : '')}
                        className="w-24 px-2 py-1 text-sm text-right border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={onCancelEditing}
                        className="px-3 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={onSaveNote}
                        disabled={isSavingNote}
                        className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                      >
                        {isSavingNote ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-200">
                    <p className="text-gray-700 text-sm font-serif italic mb-3 whitespace-pre-line">
                      {selectedCollectionNote?.displayNote || '등록된 표시 메모가 없습니다.'}
                    </p>
                    <div className="flex justify-between items-center text-sm font-semibold border-t border-yellow-200/50 pt-3">
                      <span className="text-gray-500">희망 가격</span>
                      <span className="text-gray-900 font-mono">
                        {selectedCollectionNote?.askingPrice
                          ? `₩ ${selectedCollectionNote.askingPrice.toLocaleString()}`
                          : '의향 없음'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        ) : selectedEmptySlotInfo ? (
          // --- 빈 슬롯 뷰 ---
          <div className="flex flex-col h-full animate-in slide-in-from-left-4 fade-in duration-300">
            <button
              onClick={onBackFromEmpty}
              className="flex items-center text-gray-500 hover:text-blue-600 font-semibold mb-4 transition-colors w-fit"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              돌아가기
            </button>
            <div className="w-full h-64 bg-gray-200 rounded-lg shadow-inner mb-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 shrink-0 opacity-70">
              <svg className="w-16 h-16 text-gray-400 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-400 font-bold font-serif text-2xl">빈 슬롯 # {selectedEmptySlotInfo.slotNumber}</span>
            </div>
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-gray-600 mb-3">미수집 아이템</h2>
              <p className="text-gray-500 font-serif">
                아직 이 슬롯의 아이템을 획득하지 못했습니다.<br />
                새로운 카드를 발견하고 컬렉션을 완성해 보세요!
              </p>
            </div>
          </div>

        ) : (
          // --- 기본 도감 정보 뷰 ---
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold font-serif text-gray-800 mb-2">{album.name}</h2>
            <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-300">
              카테고리: {album.categoryName}<br />
              레이아웃: {album.gridX} x {album.gridY} 그리드
            </p>
            <p className="text-gray-700 font-serif leading-relaxed flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {album.description || '이 도감에 작성된 설명이 없습니다.'}
            </p>
            <div className="mt-auto bg-white/50 p-4 rounded border border-gray-200 shrink-0">
              <ProgressBar owned={album.collectedItems} total={album.totalItems} label="수집 진행률" size="md" />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
