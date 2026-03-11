import React from 'react'
import type { InventoryCategory } from '../types'

interface UseCategoryHandlersParams {
  categories: InventoryCategory[]
  uncategorizedId: string
  selectedCategoryId: string | undefined
  categoryName: string
  categoryParentId: string | undefined
  editingCategoryId: string | undefined
  addCategory: (name: string, parentId: string | undefined) => void
  updateCategory: (id: string, updates: { name: string; parentId?: string }) => void
  deleteCategory: (id: string) => void
  setCategoryName: (name: string) => void
  setCategoryParentId: (id: string | undefined) => void
  setEditingCategoryId: (id: string | undefined) => void
  setCategoryFormError: (error: string | null) => void
  setShowCategoryForm: (show: boolean) => void
  setSelectedCategoryId: (id: string | undefined) => void
  setExpandedCategoryIds: React.Dispatch<React.SetStateAction<Set<string>>>
  setShowInitialSetup: (show: boolean) => void
}

export function useCategoryHandlers({
  categories,
  uncategorizedId,
  selectedCategoryId,
  categoryName,
  categoryParentId,
  editingCategoryId,
  addCategory,
  updateCategory,
  deleteCategory,
  setCategoryName,
  setCategoryParentId,
  setEditingCategoryId,
  setCategoryFormError,
  setShowCategoryForm,
  setSelectedCategoryId,
  setExpandedCategoryIds,
  setShowInitialSetup,
}: UseCategoryHandlersParams) {

  const handleInitialSetupComplete = (categoryNames: string[]) => {
    try {
      categoryNames.forEach(name => addCategory(name, undefined))
      setShowInitialSetup(false)
    } catch (error) { console.error('Failed to create initial categories:', error) }
  }

  const handleAddCategory = () => {
    setCategoryFormError(null)
    try {
      if (!categoryName.trim()) { setCategoryFormError('카테고리 이름을 입력해주세요.'); return }
      addCategory(categoryName, categoryParentId)
      setShowCategoryForm(false); setCategoryName(''); setCategoryParentId(undefined)
    } catch (error) {
      setCategoryFormError(error instanceof Error ? error.message : '카테고리 추가에 실패했습니다.')
    }
  }

  const handleUpdateCategory = () => {
    setCategoryFormError(null)
    if (!editingCategoryId) return
    try {
      if (!categoryName.trim()) { setCategoryFormError('카테고리 이름을 입력해주세요.'); return }
      updateCategory(editingCategoryId, { name: categoryName, parentId: categoryParentId })
      setShowCategoryForm(false); setCategoryName(''); setCategoryParentId(undefined); setEditingCategoryId(undefined)
    } catch (error) {
      setCategoryFormError(error instanceof Error ? error.message : '카테고리 수정에 실패했습니다.')
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (categoryId === uncategorizedId) return
    if (confirm('이 카테고리를 삭제하시겠습니까? 카테고리 내 아이템은 미분류로 이동됩니다.')) {
      try { deleteCategory(categoryId) }
      catch (error) { alert(error instanceof Error ? error.message : '카테고리 삭제에 실패했습니다.') }
    }
  }

  const handleEditCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return
    setCategoryName(category.name); setCategoryParentId(category.parentId)
    setEditingCategoryId(categoryId); setShowCategoryForm(true); setCategoryFormError(null)
  }

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategoryIds(prev => {
      const next = new Set(prev)
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId)
      return next
    })
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    handleToggleExpand(categoryId)
  }

  const handleOpenAddCategoryForm = () => {
    setCategoryName('')
    setCategoryParentId(selectedCategoryId)
    setEditingCategoryId(undefined)
    setShowCategoryForm(true)
    setCategoryFormError(null)
  }

  const handleCloseCategoryForm = () => {
    setShowCategoryForm(false)
    setCategoryName('')
    setCategoryParentId(undefined)
    setEditingCategoryId(undefined)
    setCategoryFormError(null)
  }

  return {
    handleInitialSetupComplete,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleEditCategory,
    handleToggleExpand,
    handleCategoryClick,
    handleOpenAddCategoryForm,
    handleCloseCategoryForm,
  }
}
