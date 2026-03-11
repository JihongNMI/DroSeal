import { useState } from 'react'
import { CollectionItemResponseDto, updateCollectionItemImage } from '../../api/collection'
import { fetchUserCollectionNote, saveUserCollectionNote, UserCollectionNoteDto } from '../../api/collectionNote'
import { uploadImage } from '../../api/upload'

export function useCardDetail(setCollectionItems: React.Dispatch<React.SetStateAction<CollectionItemResponseDto[]>>) {
  const [selectedCardItem, setSelectedCardItem] = useState<CollectionItemResponseDto | null>(null)
  const [selectedEmptySlotInfo, setSelectedEmptySlotInfo] = useState<{ slotNumber: number } | null>(null)
  const [selectedCollectionNote, setSelectedCollectionNote] = useState<UserCollectionNoteDto | null>(null)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editNoteText, setEditNoteText] = useState('')
  const [editPrice, setEditPrice] = useState<number | ''>('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleCardClick = async (item: CollectionItemResponseDto) => {
    setSelectedEmptySlotInfo(null)
    setSelectedCardItem(item)
    setSelectedCollectionNote(null)
    setIsEditingNote(false)
    try {
      const noteData = await fetchUserCollectionNote(item.itemId)
      setSelectedCollectionNote(noteData)
      setEditNoteText(noteData?.displayNote || '')
      setEditPrice(noteData?.askingPrice || '')
    } catch {
      setEditNoteText('')
      setEditPrice('')
    }
  }

  const handleSaveNoteAndPrice = async () => {
    if (!selectedCardItem) return
    try {
      setIsSavingNote(true)
      const updated = await saveUserCollectionNote(selectedCardItem.itemId, {
        displayNote: editNoteText,
        askingPrice: editPrice === '' ? undefined : Number(editPrice)
      })
      setSelectedCollectionNote(updated)
      setIsEditingNote(false)
    } catch {
      alert('상세 정보 저장에 실패했습니다.')
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleImageEditClick = () => {
    (document.getElementById('edit-image-upload') as HTMLInputElement)?.click()
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selectedCardItem) return
    try {
      setIsUploadingImage(true)
      const newImageUrl = await uploadImage(e.target.files[0])
      const updatedItem = await updateCollectionItemImage(selectedCardItem.itemId, newImageUrl)
      setSelectedCardItem(updatedItem)
      setCollectionItems(prev => prev.map(i => i.itemId === updatedItem.itemId ? updatedItem : i))
      alert('카드 이미지가 성공적으로 변경되었습니다!')
    } catch {
      alert('카드 이미지 변경에 실패했습니다.')
    } finally {
      setIsUploadingImage(false)
      e.target.value = ''
    }
  }

  const cancelEditing = (note: UserCollectionNoteDto | null) => {
    setIsEditingNote(false)
    setEditNoteText(note?.displayNote || '')
    setEditPrice(note?.askingPrice || '')
  }

  return {
    selectedCardItem, setSelectedCardItem,
    selectedEmptySlotInfo, setSelectedEmptySlotInfo,
    selectedCollectionNote,
    isEditingNote, setIsEditingNote,
    editNoteText, setEditNoteText,
    editPrice, setEditPrice,
    isSavingNote, isUploadingImage,
    handleCardClick, handleSaveNoteAndPrice,
    handleImageEditClick, handleImageFileChange, cancelEditing,
  }
}
