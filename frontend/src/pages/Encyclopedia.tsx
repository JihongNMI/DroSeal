import { useState, useEffect, useCallback } from 'react'
import {
  fetchCollections, fetchCollectionItems, fetchCollectionItemsWithOwnership,
  updateCollectionThumbnail, CollectionItemResponseDto, CollectionProgressResponseDto
} from '../api/collection'
import { fetchCategoryTree, CategoryDto } from '../api/category'
import { useCardDetail } from '../components/encyclopedia/useCardDetail'
import CollectionGrid from '../components/encyclopedia/CollectionGrid'
import CollectionDetail from '../components/encyclopedia/CollectionDetail'
import CollectionItemGrid from '../components/encyclopedia/CollectionItemGrid'
import CreateCollectionModal from '../components/encyclopedia/CreateCollectionModal'
import AddCardModal from '../components/encyclopedia/AddCardModal'

export default function Encyclopedia(): JSX.Element {
  const [collections, setCollections] = useState<CollectionProgressResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState<number | string>('')
  const [selectedAlbum, setSelectedAlbum] = useState<CollectionProgressResponseDto | null>(null)
  const [collectionItems, setCollectionItems] = useState<CollectionItemResponseDto[]>([])
  const [currentPage, setCurrentPage] = useState(1)
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

  const handleOpenAlbum = async (col: CollectionProgressResponseDto) => {
    setSelectedAlbum(col)
    setCurrentPage(1)
    setCollectionItems([])
    detail.setSelectedCardItem(null)
    detail.setSelectedEmptySlotInfo(null)
    await loadCollectionItems(col.collectionId, col.isOfficial)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">내 도감</h1>
          <button onClick={() => setShowCustomModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + 도감 추가하기
          </button>
        </div>
        <CollectionGrid
          collections={collections} loading={loading} categories={categories}
          searchKeyword={searchKeyword} filterCategoryId={filterCategoryId}
          onSearchChange={setSearchKeyword} onFilterChange={setFilterCategoryId}
          onAlbumOpen={handleOpenAlbum}
        />
      </div>

      {selectedAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl h-[80vh] bg-[#fdfbf7] rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden border-2 border-gray-300">
            <button onClick={() => setSelectedAlbum(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
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
              album={selectedAlbum} items={collectionItems} currentPage={currentPage}
              itemsPerPage={itemsPerPage} selectedCardItem={detail.selectedCardItem}
              selectedEmptySlotInfo={detail.selectedEmptySlotInfo}
              onPageChange={setCurrentPage} onAddCard={() => setIsAddCardModalOpen(true)}
              onCardClick={detail.handleCardClick}
              onEmptySlotClick={(n) => { detail.setSelectedCardItem(null); detail.setSelectedEmptySlotInfo({ slotNumber: n }) }}
            />
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
