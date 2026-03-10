import { useState, useEffect, useCallback } from 'react'
import {
  fetchCollections,
  createCollection,
  createCollectionItem,
  fetchCollectionItems,
  updateCollectionItemImage,
  CollectionItemResponseDto,
  CollectionProgressResponseDto
} from '../api/collection'
import {
  fetchUserCollectionNote,
  saveUserCollectionNote,
  UserCollectionNoteDto
} from '../api/collectionNote'
import { createInventoryItem } from '../api/inventory'
import { uploadImage, analyzeImage } from '../api/upload'
import { fetchCategoryTree, CategoryDto } from '../api/category'

export default function Encyclopedia(): JSX.Element {
  const [collections, setCollections] = useState<CollectionProgressResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string>('')

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState<number | string>('')

  // Album View Modal State
  const [selectedAlbum, setSelectedAlbum] = useState<CollectionProgressResponseDto | null>(null)
  const [collectionItems, setCollectionItems] = useState<CollectionItemResponseDto[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9 // 3x3 Grid

  // Selected Card States for Left Page
  const [selectedCardItem, setSelectedCardItem] = useState<CollectionItemResponseDto | null>(null)
  const [selectedEmptySlotInfo, setSelectedEmptySlotInfo] = useState<{ slotNumber: number } | null>(null)
  const [selectedCollectionNote, setSelectedCollectionNote] = useState<UserCollectionNoteDto | null>(null)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editNoteText, setEditNoteText] = useState('')
  const [editPrice, setEditPrice] = useState<number | ''>('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  const handleCardClick = async (item: CollectionItemResponseDto) => {
    setSelectedEmptySlotInfo(null)
    setSelectedCardItem(item)
    setSelectedCollectionNote(null)
    setIsEditingNote(false)

    try {
      const noteData = await fetchUserCollectionNote(item.itemId)
      if (noteData) {
        setSelectedCollectionNote(noteData)
        setEditNoteText(noteData.displayNote || '')
        setEditPrice(noteData.askingPrice || '')
      } else {
        setEditNoteText('')
        setEditPrice('')
      }
    } catch (error) {
      console.error('Failed to fetch collection note details', error)
      setEditNoteText('')
      setEditPrice('')
    }
  }

  const handleSaveNoteAndPrice = async () => {
    if (!selectedCardItem) return
    try {
      setIsSavingNote(true)
      const updatedNote = await saveUserCollectionNote(selectedCardItem.itemId, {
        displayNote: editNoteText,
        askingPrice: editPrice === '' ? undefined : Number(editPrice)
      })
      setSelectedCollectionNote(updatedNote)
      setIsEditingNote(false)
    } catch (error) {
      console.error('Failed to update note and price', error)
      alert('Failed to update details.')
    } finally {
      setIsSavingNote(false)
    }
  }

  const loadCollectionItems = async (collectionId: number) => {
    try {
      const data = await fetchCollectionItems(collectionId)
      setCollectionItems(data.content || [])
    } catch (error) {
      console.error('Failed to load collection items', error)
    }
  }

  const handleOpenAlbum = async (col: CollectionProgressResponseDto) => {
    setSelectedAlbum(col)
    setCurrentPage(1)
    setCollectionItems([]) // 화면 플리커 방지 및 이전 데이터 지우개
    setSelectedCardItem(null)
    setSelectedEmptySlotInfo(null)
    await loadCollectionItems(col.collectionId)
  }

  // Custom Entry Modal States
  const [customName, setCustomName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [gridX, setGridX] = useState(3)
  const [gridY, setGridY] = useState(12)

  // Add Card Modal States
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
  const [cardName, setCardName] = useState('')
  const [cardDescription, setCardDescription] = useState('')
  const [cardRarity, setCardRarity] = useState('COMMON')
  const [cardNote, setCardNote] = useState('')
  const [cardPrice, setCardPrice] = useState<number | ''>('')

  // Image Upload States
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('file')
  const [cardImageUrl, setCardImageUrl] = useState('')
  const [cardImageFile, setCardImageFile] = useState<File | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)

  // Detail View Image Edit State
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchCollections(0, 50,
        filterCategoryId === '' ? undefined : Number(filterCategoryId),
        searchKeyword.trim() === '' ? undefined : searchKeyword
      )
      setCollections(data.content || [])
    } catch (error) {
      console.error('Failed to load collections', error)
    } finally {
      setLoading(false)
    }
  }, [filterCategoryId, searchKeyword])

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategoryTree()
      setCategories(data || [])
    } catch (error) {
      console.error('Failed to load categories', error)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  const calculateProgress = (owned: number, total: number): number => {
    return total > 0 ? (owned / total) * 100 : 0
  }

  const handleSaveCustomEntry = async () => {
    if (!customName.trim()) {
      alert('Please enter a collection name')
      return
    }

    if (!selectedCategoryId) {
      alert('Please select a category!')
      return
    }

    try {
      console.log('Attempting to create collection with data:', {
        name: customName,
        description: description,
        categoryId: Number(selectedCategoryId),
        isPublic,
        gridX,
        gridY
      });

      await createCollection({
        name: customName,
        description: description,
        categoryId: Number(selectedCategoryId),
        isPublic,
        gridX,
        gridY
      })
      alert('Collection created successfully!')
      handleCloseModal()
      loadCollections()
    } catch (error: any) {
      console.error('Detailed Error creating collection:', error)
      // 서버에서 보내는 상세 에러 메시지가 있다면 출력
      const errorMsg = error.message || 'Unknown error occurred';
      alert(`Failed to create collection: ${errorMsg}`)
    }
  }

  const handleCloseModal = () => {
    setShowCustomModal(false)
    setCustomName('')
    setDescription('')
    setIsPublic(false)
    setGridX(3)
    setGridY(12)
    setSelectedCategoryId('')
  }

  const handleOpenAddCardModal = () => {
    setIsAddCardModalOpen(true)
    setCardName('')
    setCardDescription('')
    setCardRarity('COMMON')
    setCardNote('')
    setCardPrice('')
    setCardImageUrl('')
    setCardImageFile(null)
    setImageInputMode('file')
  }

  const handleAddCardSubmit = async () => {
    if (!selectedAlbum) return
    if (!cardName.trim()) {
      alert('Card name is required')
      return
    }

    try {
      setIsSubmitting(true)

      let finalImageUrl = cardImageUrl.trim()

      // Step 0: Upload image file if present
      if (imageInputMode === 'file' && cardImageFile) {
        try {
          finalImageUrl = await uploadImage(cardImageFile)
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          alert('Failed to upload image. Please try again.')
          setIsSubmitting(false)
          return
        }
      }

      // Step 1: Create Master Collection Item
      const newCollectionItem = await createCollectionItem({
        collectionId: selectedAlbum.collectionId,
        name: cardName,
        rarity: cardRarity,
        description: cardDescription,
        imageUrl: finalImageUrl || undefined,
        isOfficial: false // 유저가 수동 등록하는 카드는 항상 비공식 커스텀 카드로 취급
      })

      // Step 2: Add it to My Inventory
      await createInventoryItem({
        itemId: newCollectionItem.itemId,
        collectionId: selectedAlbum.collectionId,
        categoryId: selectedAlbum.categoryId,
        regType: 'MANUAL',
        quantity: 1, // 수량 필수값 추가
        userImageUrl: finalImageUrl || undefined,
        note: cardNote,
        purchasedPrice: cardPrice === '' ? 0 : Number(cardPrice)
      })

      alert('Card added to your inventory successfully!')
      setIsAddCardModalOpen(false)
      loadCollections() // Refresh progress on main board
      // 바로 카드 목록 새로고침
      await loadCollectionItems(selectedAlbum.collectionId)
    } catch (error) {
      console.error('Failed to add card:', error)
      alert('Failed to add card to inventory. Please check server logs.')
      alert('Failed to add card to inventory. Please check server logs.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAiAutoAnalyze = async () => {
    if (imageInputMode !== 'file' || !cardImageFile) {
      alert('AI 분석을 위해서는 파일 이미지를 업로드해야 합니다.');
      return;
    }

    try {
      setIsAiAnalyzing(true);
      const aiResults = await analyzeImage(cardImageFile);

      if (aiResults && aiResults.length > 0) {
        const bestMatch = aiResults[0];
        setCardName(bestMatch.name || '');
        setCardDescription(bestMatch.description || '');
        setCardRarity(bestMatch.rarity || 'COMMON');
        alert('AI 분석이 완료되었습니다. 추출된 정보를 확인하고 등록해주세요.');
      } else {
        alert('AI가 이미지에서 굿즈 정보를 찾지 못했습니다.');
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      alert('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAiAnalyzing(false);
    }
  }

  const handleImageEditClick = () => {
    // Hidden file input click trigger
    const fileInput = document.getElementById('edit-image-upload') as HTMLInputElement
    if (fileInput) fileInput.click()
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedCardItem) return
    const file = e.target.files[0]

    try {
      setIsUploadingImage(true)
      // Upload physical file
      const newImageUrl = await uploadImage(file)

      // Update CollectionItem record via PATCH
      const updatedItem = await updateCollectionItemImage(selectedCardItem.itemId, newImageUrl)

      // Update local state to reflect changes instantly (Left Page)
      setSelectedCardItem(updatedItem)

      // Also update the item inside the collectionItems list (Right Page layout)
      setCollectionItems(prev => prev.map(item =>
        item.itemId === updatedItem.itemId ? updatedItem : item
      ))

      alert('Card image updated successfully!')
    } catch (error) {
      console.error('Failed to update image', error)
      alert('Failed to update card image.')
    } finally {
      setIsUploadingImage(false)
      // Reset input value so the same file can be selected again if needed
      e.target.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Encyclopedia</h1>
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Custom Entry
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by collection name..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-700"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-3 text-sm">Loading from server...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No collections found</p>
            <p className="text-gray-400 text-sm">Click "Add Encyclopedia" to create a new one.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(
              collections.reduce((acc, col) => {
                const cat = col.categoryName || 'Unknown Category';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(col);
                return acc;
              }, {} as Record<string, CollectionProgressResponseDto[]>)
            ).map(([category, cols]) => (
              <div key={category} className="mb-8">
                {/* Bookshelf Shelf Header */}
                <div className="border-b-4 border-gray-800 pb-2 mb-6 flex items-baseline justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 font-serif tracking-wide">{category}</h2>
                  <span className="text-gray-500 font-medium text-sm">{cols.length} Volumes</span>
                </div>

                {/* Bookshelf Grid */}
                <div className="flex flex-wrap gap-6 px-4">
                  {cols.map(col => (
                    <div
                      key={col.collectionId}
                      onClick={() => handleOpenAlbum(col)}
                      className="relative w-40 h-56 cursor-pointer group perspective-1000"
                    >
                      {/* Book Cover Design */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-blue-900 rounded-r-lg rounded-l-sm shadow-[5px_5px_15px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[5px_15px_20px_rgba(0,0,0,0.4)] border-l-8 border-indigo-900 flex flex-col items-center justify-between p-4">

                        {/* Book Binding/Ribbon */}
                        <div className="absolute left-0 top-6 w-full h-8 bg-indigo-900 opacity-30 shadow-inner"></div>
                        <div className="absolute left-0 bottom-6 w-full h-8 bg-indigo-900 opacity-30 shadow-inner"></div>

                        {/* Title Wrapper */}
                        <div className="z-10 text-center w-full mt-2">
                          <h3 className="font-bold text-white text-md font-serif leading-tight line-clamp-2 drop-shadow-md">
                            {col.name}
                          </h3>
                          {col.isOfficial && (
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-yellow-300 font-bold border border-yellow-300 px-1 rounded">Official</span>
                          )}
                        </div>

                        {/* Progress Indicator on Cover */}
                        <div className="z-10 w-full mb-1">
                          <div className="text-center text-xs text-indigo-200 font-semibold mb-1">
                            {calculateProgress(col.collectedItems, col.totalItems).toFixed(0)}%
                          </div>
                          <div className="w-full bg-indigo-950 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-yellow-400 h-full rounded-full"
                              style={{ width: `${calculateProgress(col.collectedItems, col.totalItems)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fake Pages sticking out on the right (Book depth) */}
                      <div className="absolute right-[-4px] top-[2px] bottom-[2px] w-1 bg-white rounded-r-sm shadow-inner z-[-1]"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Static Album Open Modal (Skeleton) */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl h-[80vh] bg-[#fdfbf7] rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden border-2 border-gray-300">

            {/* Close Button */}
            <button
              onClick={() => setSelectedAlbum(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Left Page (Details & Index) */}
            <div className="w-full md:w-1/2 h-full p-8 border-r border-gray-300 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] bg-gradient-to-r from-[#fdfbf7] to-[#f4f1ea] relative overflow-y-auto custom-scrollbar">
              <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10"></div> {/* Spine shadow */}
              <div className="relative z-10 h-full flex flex-col">
                {selectedCardItem ? (
                  // --- Collected Card Detail View ---
                  <div className="flex flex-col h-full animate-in slide-in-from-left-4 fade-in duration-300">
                    <button
                      onClick={() => setSelectedCardItem(null)}
                      className="flex items-center text-gray-500 hover:text-blue-600 font-semibold mb-4 transition-colors w-fit"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      돌아가기
                    </button>

                    <div className="w-full h-64 bg-gray-100 rounded-lg shadow-md mb-6 overflow-hidden flex flex-col items-center justify-center border border-gray-200 shrink-0 relative group">
                      {selectedCardItem.imageUrl ? (
                        <img src={selectedCardItem.imageUrl} alt={selectedCardItem.name} className="object-contain w-full h-full" />
                      ) : (
                        <div className="text-gray-400 font-serif text-lg">No Image Available</div>
                      )}

                      {/* Hover Overlay for Image Edit */}
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm"
                        onClick={handleImageEditClick}
                      >
                        {isUploadingImage ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                        ) : (
                          <svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        )}
                        <span className="text-white font-semibold shadow-sm">{isUploadingImage ? 'Uploading...' : 'Change Image'}</span>
                      </div>
                      <input
                        type="file"
                        id="edit-image-upload"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageFileChange}
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <h2 className="text-3xl font-bold font-serif text-gray-800 mb-2 leading-tight">{selectedCardItem.name}</h2>
                      <div className="mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border
                          ${selectedCardItem.rarity === 'LEGENDARY' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            selectedCardItem.rarity === 'EPIC' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                              selectedCardItem.rarity === 'RARE' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                'bg-gray-100 text-gray-800 border-gray-300'}`}>
                          {selectedCardItem.rarity || 'COMMON'}
                        </span>
                      </div>

                      {selectedCardItem.description && (
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Official Description</h4>
                          <p className="text-gray-700 font-serif leading-relaxed text-sm">
                            {selectedCardItem.description}
                          </p>
                        </div>
                      )}

                      <div className="bg-yellow-50/80 border border-yellow-200 rounded-lg p-4 mt-auto">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="flex items-center text-sm font-bold text-yellow-800">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Public Display Note
                          </h4>
                          {!isEditingNote && (
                            <button
                              onClick={() => setIsEditingNote(true)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-yellow-100 transition-colors"
                            >
                              ✏️ 수정
                            </button>
                          )}
                        </div>

                        {isEditingNote ? (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <textarea
                              value={editNoteText}
                              onChange={(e) => setEditNoteText(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none resize-none bg-white"
                              placeholder="남들에게 보여줄 코멘트를 적어보세요..."
                            />
                            <div className="flex justify-between items-center border-t border-yellow-200/50 pt-3">
                              <span className="text-gray-500 text-sm font-semibold">Asking Price (₩)</span>
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : '')}
                                className="w-24 px-2 py-1 text-sm text-right border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none"
                                placeholder="0"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => {
                                  setIsEditingNote(false)
                                  setEditNoteText(selectedCollectionNote?.displayNote || '')
                                  setEditPrice(selectedCollectionNote?.askingPrice || '')
                                }}
                                className="px-3 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              >
                                취소
                              </button>
                              <button
                                onClick={handleSaveNoteAndPrice}
                                disabled={isSavingNote}
                                className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                              >
                                {isSavingNote ? '저장 중...' : '💾 저장'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="animate-in fade-in duration-200">
                            <p className="text-gray-700 text-sm font-serif italic mb-3 whitespace-pre-line">
                              {selectedCollectionNote?.displayNote || '등록된 표시 메모가 없습니다.'}
                            </p>
                            <div className="flex justify-between items-center text-sm font-semibold border-t border-yellow-200/50 pt-3">
                              <span className="text-gray-500">Asking Price</span>
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
                  // --- Uncollected Card Detail View ---
                  <div className="flex flex-col h-full animate-in slide-in-from-left-4 fade-in duration-300">
                    <button
                      onClick={() => setSelectedEmptySlotInfo(null)}
                      className="flex items-center text-gray-500 hover:text-blue-600 font-semibold mb-4 transition-colors w-fit"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      돌아가기
                    </button>

                    <div className="w-full h-64 bg-gray-200 rounded-lg shadow-inner mb-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 shrink-0 opacity-70">
                      <svg className="w-16 h-16 text-gray-400 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="text-gray-400 font-bold font-serif text-2xl">Slot # {selectedEmptySlotInfo.slotNumber}</span>
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
                  // --- Default Album Info View ---
                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                    <h2 className="text-3xl font-bold font-serif text-gray-800 mb-2">{selectedAlbum.name}</h2>
                    <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-300">
                      Category: {selectedAlbum.categoryName} <br />
                      Layout: {selectedAlbum.gridX} x {selectedAlbum.gridY} Grid
                    </p>
                    <p className="text-gray-700 font-serif leading-relaxed flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedAlbum.description || "No description written in this volume."}
                    </p>

                    <div className="mt-auto bg-white/50 p-4 rounded border border-gray-200 shrink-0">
                      <div className="flex justify-between font-bold text-gray-700 mb-2">
                        <span>Collection Progress</span>
                        <span>{selectedAlbum.collectedItems} / {selectedAlbum.totalItems}</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${calculateProgress(selectedAlbum.collectedItems, selectedAlbum.totalItems)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Page (Grid & Pagination) */}
            <div className="w-full md:w-1/2 h-full p-8 bg-gradient-to-l from-[#fdfbf7] to-[#f4f1ea] overflow-y-auto relative custom-scrollbar flex flex-col">
              <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div> {/* Spine shadow */}

              {/* Edge Click Zones for Pagination */}
              <div
                className={`absolute left-0 top-16 bottom-0 w-16 z-20 flex items-center justify-start transition-opacity bg-gradient-to-r from-black/5 to-transparent
                ${currentPage > 1 ? 'cursor-pointer opacity-0 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <svg className="w-10 h-10 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </div>

              <div
                className={`absolute right-0 top-16 bottom-0 w-16 z-20 flex items-center justify-end transition-opacity bg-gradient-to-l from-black/5 to-transparent
                ${currentPage < Math.ceil((selectedAlbum.gridX * selectedAlbum.gridY) / itemsPerPage) ? 'cursor-pointer opacity-0 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setCurrentPage(p => Math.min(Math.ceil((selectedAlbum.gridX * selectedAlbum.gridY) / itemsPerPage), p + 1))}
              >
                <svg className="w-10 h-10 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>

              <div className="relative z-10 w-full flex flex-col items-center flex-1">
                <div className="w-full flex justify-between items-center mb-6 px-4">
                  <h3 className="text-xl font-bold font-serif text-gray-800">Collection Items</h3>

                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 font-serif font-semibold">
                      [ {currentPage} / {Math.ceil((selectedAlbum.gridX * selectedAlbum.gridY) / itemsPerPage)} ]
                    </span>
                    <button
                      onClick={handleOpenAddCardModal}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow transition-colors flex items-center gap-1 z-30 relative"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      Add Card
                    </button>
                  </div>
                </div>

                {/* Grid 3x3 (9 slots) Layout */}
                <div
                  className="grid gap-3 mx-auto w-full flex-1"
                  style={{
                    gridTemplateColumns: `repeat(3, minmax(0, 1fr))`
                    // We only render `itemsPerPage` (9) slots per page
                  }}
                >
                  {Array.from({ length: itemsPerPage }).map((_, index) => {
                    const slotNumber = (currentPage - 1) * itemsPerPage + index + 1;

                    // Stop rendering if we exceed the album's total capacity
                    if (slotNumber > selectedAlbum.gridX * selectedAlbum.gridY) return null;

                    // 해당 슬롯에 맞는 카드를 찾습니다 (itemNumber 우선, 없으면 순서대로)
                    const item = collectionItems.find(c => c.itemNumber === slotNumber) || collectionItems[slotNumber - 1];

                    if (item) {
                      return (
                        <div
                          key={slotNumber}
                          onClick={() => handleCardClick(item)}
                          className={`aspect-[3/4] rounded-md flex flex-col items-center justify-center bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden relative group
                            ${selectedCardItem?.itemId === item.itemId ? 'ring-4 ring-blue-500 scale-105 z-10' : ''}`}
                          title={item.name}
                        >
                          {/* 홀로그램 반사광 효과 (보유 여부에 따라 다르게 줄 수 있음) */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>

                          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
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
                        </div>
                      )
                    }

                    return (
                      <div
                        key={slotNumber}
                        onClick={() => {
                          setSelectedCardItem(null)
                          setSelectedEmptySlotInfo({ slotNumber })
                        }}
                        className={`aspect-[3/4] border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer
                          ${selectedEmptySlotInfo?.slotNumber === slotNumber ? 'ring-4 ring-gray-400 bg-gray-100' : ''}`}
                        title={`Slot ${slotNumber} (Empty)`}
                      >
                        <span className="text-gray-300 font-bold font-serif text-xl">{slotNumber}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Entry Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Custom Encyclopedia Entry</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Right side - Form */}
              <div className="col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Entry Details</h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Encyclopedia Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. My Pokemon Stickers Series 1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe this collection..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grid Width (X)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={gridX}
                        onChange={(e) => setGridX(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grid Height (Y)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={gridY}
                        onChange={(e) => setGridY(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Defines the visual grid layout (e.g. 3x12 layout)</p>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Make Public</span>
                        <p className="text-xs text-gray-500">Allow other users to view this collection frame.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomEntry}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Item Registration Modal */}
      {isAddCardModalOpen && selectedAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 font-serif">Register New Card</h2>
            <p className="text-sm text-gray-500 mb-6">Adding to <span className="font-semibold">{selectedAlbum.name}</span></p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Name *</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  placeholder="E.g., Holographic Pikachu"
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
                  <select
                    value={cardRarity}
                    onChange={(e) => setCardRarity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="COMMON">Common</option>
                    <option value="RARE">Rare</option>
                    <option value="EPIC">Epic</option>
                    <option value="LEGENDARY">Legendary</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchased Price (₩)</label>
                  <input
                    type="number"
                    value={cardPrice}
                    onChange={(e) => setCardPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="E.g., 5000"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-medium text-gray-700">Image Source</label>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${imageInputMode === 'file' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setImageInputMode('file')}
                    >
                      File Upload
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${imageInputMode === 'url' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setImageInputMode('url')}
                    >
                      Web URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-6 h-6 mb-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setCardImageFile(e.target.files[0])
                            // 미리보기나 파일명 표시는 선택적으로 추가 가능
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={cardImageUrl}
                    onChange={(e) => setCardImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
                    placeholder="https://example.com/image.png (Optional)"
                  />
                )}

                {imageInputMode === 'file' && cardImageFile && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1 bg-green-50 p-1.5 rounded border border-green-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Selected: {cardImageFile.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Official Description</label>
                <textarea
                  value={cardDescription}
                  onChange={(e) => setCardDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
                  placeholder="Official details about this card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">My Secret Note</label>
                <textarea
                  value={cardNote}
                  onChange={(e) => setCardNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none bg-yellow-50"
                  placeholder="Where did you get it? Any damages?"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center gap-3">
              <button
                onClick={handleAiAutoAnalyze}
                disabled={isSubmitting || isAiAnalyzing || imageInputMode !== 'file' || !cardImageFile}
                className={`px-4 py-2 text-white rounded-lg font-medium shadow-md transition-all flex items-center justify-center gap-2 ${isAiAnalyzing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
                  }`}
                title="AI가 이미지를 분석하여 카드 정보를 자동으로 채워줍니다."
              >
                {isAiAnalyzing ? '🤖 분석 중...' : '✨ AI 자동 분석'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddCardModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting || isAiAnalyzing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCardSubmit}
                  disabled={isSubmitting || isAiAnalyzing}
                  className={`px-5 py-2 text-white rounded-lg font-medium shadow-md transition-all ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                    }`}
                >
                  {isSubmitting ? 'Registering...' : 'Add to Inventory'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
