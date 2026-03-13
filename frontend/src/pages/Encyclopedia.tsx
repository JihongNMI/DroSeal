import { useState, useEffect, useCallback } from 'react'
import {
  fetchCollections, fetchCollectionItems, fetchCollectionItemsWithOwnership,
  updateCollectionThumbnail, deleteCollection, deleteCollectionItem,
  CollectionItemResponseDto, CollectionProgressResponseDto
} from '../api/collection'
import { fetchCategoryTree, CategoryDto } from '../api/category'
import { useCardDetail } from '../components/encyclopedia/useCardDetail'
import CollectionGrid from '../components/encyclopedia/CollectionGrid'
import CollectionDetail from '../components/encyclopedia/CollectionDetail'
import CollectionItemGrid from '../components/encyclopedia/CollectionItemGrid'
import CreateCollectionModal from '../components/encyclopedia/CreateCollectionModal'
import AddCardModal from '../components/encyclopedia/AddCardModal'
import GalleryView from '../components/encyclopedia/GalleryView'

type ViewMode = 'detail' | 'gallery'

interface CollectionViewState {
  viewMode: ViewMode
  detailPage: number
  galleryPage: number
}

export default function Encyclopedia(): JSX.Element {
  const [collections, setCollections] = useState<CollectionProgressResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState<number | string>('')
  const [selectedAlbum, setSelectedAlbum] = useState<CollectionProgressResponseDto | null>(null)
  const [collectionItems, setCollectionItems] = useState<CollectionItemResponseDto[]>([])
  const [viewState, setViewState] = useState<CollectionViewState>({ viewMode: 'detail', detailPage: 1, galleryPage: 0 })
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const itemsPerPage = 9

  const detail = useCardDetail(setCollectionItems)

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchCollections(
        0, 50,
        filterCategoryId === '' ? undefined : Number(filterCategoryId),
        searchKeyword.trim() === '' ? undefined : searchKeyword
      )
      setCollections(data.content || [])
    } catch (error) { console.error('Failed to load collections', error) }
    finally { setLoading(false) }
  }, [filterCategoryId, searchKeyword])

  const loadCategories = useCallback(async () => {
    try { setCategories(await fetchCategoryTree() || []) }
    catch (error) { console.error('Failed to load categories', error) }
  }, [])

  useEffect(() => { loadCategories() }, [loadCategories])
  useEffect(() => { loadCollections() }, [loadCollections])

  const loadCollectionItems = async (collectionId: number, isOfficial = false) => {
    try {
      if (isOfficial) {
        setCollectionItems(await fetchCollectionItemsWithOwnership(collectionId) || [])
      } else {
        setCollectionItems((await fetchCollectionItems(collectionId)).content || [])
      }
    } catch (error) { console.error('Failed to load collection items', error) }
  }

  const handleDeleteCollectionItem = async (itemId: number) => {
    if (!selectedAlbum) return
    try {
      await deleteCollectionItem(selectedAlbum.collectionId, itemId)
      setCollectionItems(prev => prev.filter(i => i.itemId !== itemId))
      detail.setSelectedCardItem(null)
    } catch (error) {
      console.error('아이템 삭제 실패', error)
      alert('아이템 삭제에 실패했습니다.')
    }
  }

  const handleDeleteCollection = async (collectionId: number) => {
    try {
      await deleteCollection(collectionId)
      setCollections(prev => prev.filter(c => c.collectionId !== collectionId))
    } catch (error) {
      console.error('도감 삭제 실패', error)
      alert('도감 삭제에 실패했습니다.')
    }
  }

  const handleOpenAlbum = async (col: CollectionProgressResponseDto) => {
    setSelectedAlbum(col)
    setViewState({ viewMode: 'detail', detailPage: 1, galleryPage: 0 })
    setCollectionItems([])
    detail.setSelectedCardItem(null)
    detail.setSelectedEmptySlotInfo(null)
    await loadCollectionItems(col.collectionId, col.isOfficial)
  }

  return (
    <div className="p-6 min-h-screen dark:bg-[#0d0b2b] transition-colors duration-300">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">내 도감</h1>
          <button onClick={() => setShowCustomModal(true)} className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
            + 도감 추가하기
          </button>
        </div>
        <CollectionGrid
          collections={collections} loading={loading} categories={categories}
          searchKeyword={searchKeyword} filterCategoryId={filterCategoryId}
          onSearchChange={setSearchKeyword} onFilterChange={setFilterCategoryId}
          onAlbumOpen={handleOpenAlbum}
          onDelete={handleDeleteCollection}
        />
      </div>

      {selectedAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="w-[90vw] max-w-[1400px] h-[85vh] bg-[#fdfbf7] dark:bg-[#1a1740] rounded-lg shadow-2xl flex flex-col overflow-hidden border-2 border-gray-300 dark:border-purple-900/50 transition-colors duration-300">

            {/* 고정 헤더: 탭 전환 + 닫기 버튼 */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#fdfbf7] dark:bg-[#1a1740] border-b border-gray-200 dark:border-purple-900/30 z-20 transition-colors">
              <div className="w-10" />
              <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 gap-1 shadow-inner transition-colors">
                <button
                  onClick={() => setViewState(prev => ({ ...prev, viewMode: 'detail' }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                    ${viewState.viewMode === 'detail' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  상세
                </button>
                <button
                  onClick={() => setViewState(prev => ({ ...prev, viewMode: 'gallery' }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                    ${viewState.viewMode === 'gallery' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  갤러리
                </button>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="w-10 h-10 bg-gray-200 dark:bg-gray-800 hover:bg-red-500 dark:hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-500 dark:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* 스크롤 컨텐츠 영역 */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
              {viewState.viewMode === 'gallery' ? (
                <GalleryView
                  album={selectedAlbum}
                  items={collectionItems}
                  currentPage={viewState.galleryPage}
                  onPageChange={(page) => setViewState(prev => ({ ...prev, galleryPage: Math.max(0, page) }))}
                />
              ) : (
                <>
                  <CollectionDetail
                    album={selectedAlbum}
                    selectedCardItem={detail.selectedCardItem}
                    selectedEmptySlotInfo={detail.selectedEmptySlotInfo}
                    selectedCollectionNote={detail.selectedCollectionNote}
                    isEditingNote={detail.isEditingNote} editNoteText={detail.editNoteText}
                    editPrice={detail.editPrice} isSavingNote={detail.isSavingNote}
                    isUploadingImage={detail.isUploadingImage}
                    onBackFromCard={() => detail.setSelectedCardItem(null)}
                    onBackFromEmpty={() => detail.setSelectedEmptySlotInfo(null)}
                    onStartEditing={() => detail.setIsEditingNote(true)}
                    onCancelEditing={() => detail.cancelEditing(detail.selectedCollectionNote)}
                    onEditNoteChange={detail.setEditNoteText} onEditPriceChange={detail.setEditPrice}
                    onSaveNote={detail.handleSaveNoteAndPrice}
                    onImageEditClick={detail.handleImageEditClick}
                    onImageFileChange={detail.handleImageFileChange}
                    onSetThumbnail={async () => {
                      if (!detail.selectedCardItem?.imageUrl) return
                      try {
                        await updateCollectionThumbnail(selectedAlbum.collectionId, detail.selectedCardItem.imageUrl)
                        alert('대표 이미지로 설정되었습니다!')
                        loadCollections()
                      } catch { alert('대표 이미지 설정에 실패했습니다.') }
                    }}
                  />
                  <CollectionItemGrid
                    album={selectedAlbum} items={collectionItems} currentPage={viewState.detailPage}
                    itemsPerPage={itemsPerPage} selectedCardItem={detail.selectedCardItem}
                    selectedEmptySlotInfo={detail.selectedEmptySlotInfo}
                    onPageChange={(page) => setViewState(prev => ({ ...prev, detailPage: Math.max(1, page) }))}
                    onAddCard={() => setIsAddCardModalOpen(true)}
                    onCardClick={detail.handleCardClick}
                    onEmptySlotClick={(n) => { detail.setSelectedCardItem(null); detail.setSelectedEmptySlotInfo({ slotNumber: n }) }}
                    onDeleteItem={handleDeleteCollectionItem}
                  />
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {showCustomModal && (
        <CreateCollectionModal categories={categories} onClose={() => setShowCustomModal(false)} onSuccess={loadCollections} />
      )}

      {isAddCardModalOpen && selectedAlbum && (
        <AddCardModal
          album={selectedAlbum}
          onClose={() => setIsAddCardModalOpen(false)}
          onSuccess={async (collectionId, isOfficial) => {
            loadCollections()
            await loadCollectionItems(collectionId, isOfficial)
          }}
        />
      )}
    </div>
  )
}
