// --- imports ---
import { useState, useMemo } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useCategories } from '../hooks/useCategories'
import { useEncyclopedias } from '../hooks/useEncyclopedias'
import { useInventory } from '../hooks/useInventory'
import { useHistory } from '../hooks/useHistory'
import { useTransactions } from '../hooks/useTransactions'
import { useInventoryHandlers } from '../hooks/useInventoryHandlers'
import { useInventoryCategoryFilter } from '../hooks/useInventoryCategoryFilter'
import { useCategoryHandlers } from '../hooks/useCategoryHandlers'
import { HistoryPanel } from '../components/inventory/HistoryPanel'
import { InventoryHeader } from '../components/inventory/InventoryHeader'
import { InventoryTable } from '../components/inventory/InventoryTable'
import { useInventoryState } from '../components/inventory/useInventoryState'
import { formatCategoryPath } from '../services/categoryService'
import { CategorySidebar } from '../components/inventory/CategorySidebar'
import { Pagination } from '../components/inventory/Pagination'
import { InventoryModals } from '../components/inventory/InventoryModals'

export function Inventory() {
  const { categories, uncategorizedId, addCategory, updateCategory, deleteCategory, error: categoryError } = useCategories()
  const { data: encyclopedias } = useEncyclopedias()
  const { history, addHistoryRecord } = useHistory()
  const { data, addItem, updateItem, deleteItem } = useInventory({ addHistoryRecord })
  const { data: transactions } = useTransactions()

  const getEncyclopediaName = (encyclopediaId?: string) =>
    encyclopedias.find(e => e.id === encyclopediaId)?.title

  const {
    showItemForm, setShowItemForm,
    showCategoryForm, setShowCategoryForm,
    editingItem, setEditingItem,
    editingCategoryId, setEditingCategoryId,
    selectedCategoryId, setSelectedCategoryId,
    expandedCategoryIds, setExpandedCategoryIds,
    searchQuery, setSearchQuery,
    showHistory, setShowHistory,
    selectedItemIdForHistory, setSelectedItemIdForHistory,
    showTransactionModal, setShowTransactionModal,
    selectedTransactionId, setSelectedTransactionId,
    itemSearchFilters, setItemSearchFilters,
    setHistorySearchFilters,
    showItemDetailModal, setShowItemDetailModal,
    selectedItemForDetail, setSelectedItemForDetail,
    showImageEditModal, setShowImageEditModal,
    selectedItemForImageEdit, setSelectedItemForImageEdit,
    selectedItemIds, setSelectedItemIds,
    showBulkActions, setShowBulkActions,
    currentPage, setCurrentPage,
    lastSelectedIndex, setLastSelectedIndex,
    showBulkEditModal, setShowBulkEditModal,
    bulkEditQuantity, setBulkEditQuantity,
    bulkEditPrice, setBulkEditPrice,
    bulkEditEncyclopediaId, setBulkEditEncyclopediaId,
    expandedBulkCategories, setExpandedBulkCategories,
    draggedItem, setDraggedItem,
    dragOffset, setDragOffset,
    showDeleteModal, setShowDeleteModal,
    itemToDelete, setItemToDelete,
    categoryName, setCategoryName,
    categoryParentId, setCategoryParentId,
    categoryFormError, setCategoryFormError,
    ITEMS_PER_PAGE, filteredItems, filteredHistory,
    paginatedItems, totalPages, allVisibleSelected, someVisibleSelected
  } = useInventoryState({ items: data.items, categories, history, uncategorizedId, getEncyclopediaName })

  const [showInitialSetup, setShowInitialSetup] = useState(false)
  const needsInitialSetup = categories.length === 1 && categories[0].id === uncategorizedId

  const categoryHandlers = useCategoryHandlers({
    categories, uncategorizedId, selectedCategoryId,
    categoryName, categoryParentId, editingCategoryId,
    addCategory, updateCategory, deleteCategory,
    setCategoryName, setCategoryParentId, setEditingCategoryId,
    setCategoryFormError, setShowCategoryForm,
    setSelectedCategoryId, setExpandedCategoryIds, setShowInitialSetup,
  })

  const {
    handleAddItem, handleUpdateItem, handleEditItem,
    handleDeleteItem, handleConfirmDelete,
    getTransactionVerification, getPriceComparisonStatus, getLinkedTransaction,
    handleShowTransaction, handleShowItemDetail, handleShowImageEdit, handleSaveImage,
    handleToggleSelectItem, handleToggleSelectAll,
    handleBulkCategoryChange, handleBulkDelete, handleBulkEdit,
    toggleBulkCategoryExpand, handleDragStart, handleDragEnd,
  } = useInventoryHandlers({
    items: data.items, categories, transactions,
    editingItem, itemToDelete, selectedItemIds, lastSelectedIndex, paginatedItems,
    bulkEditQuantity, bulkEditPrice, bulkEditEncyclopediaId, selectedItemForImageEdit,
    addItem, updateItem, deleteItem,
    setShowItemForm, setEditingItem, setSelectedCategoryId, setExpandedCategoryIds,
    setItemToDelete, setShowDeleteModal,
    setSelectedTransactionId, setShowTransactionModal,
    setSelectedItemForDetail, setShowItemDetailModal,
    setSelectedItemForImageEdit, setShowImageEditModal,
    setSelectedItemIds, setLastSelectedIndex,
    setShowBulkActions, setShowBulkEditModal,
    setBulkEditQuantity, setBulkEditPrice, setBulkEditEncyclopediaId,
    setExpandedBulkCategories, setDraggedItem, setDragOffset,
  })

  useMemo(() => { setCurrentPage(1) }, [itemSearchFilters, selectedCategoryId, setCurrentPage])

  const { filteredCategories, matchedCategoryIds } = useInventoryCategoryFilter({
    categories, searchQuery, uncategorizedId, setExpandedCategoryIds,
  })

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-6 transition-colors duration-300">
        <div className="container mx-auto">
          <InventoryHeader
            selectedItemIds={selectedItemIds} showBulkActions={showBulkActions}
            setShowBulkActions={setShowBulkActions} categories={categories}
            uncategorizedId={uncategorizedId} expandedBulkCategories={expandedBulkCategories}
            toggleBulkCategoryExpand={toggleBulkCategoryExpand}
            handleBulkCategoryChange={handleBulkCategoryChange}
            setShowBulkEditModal={setShowBulkEditModal} handleBulkDelete={handleBulkDelete}
            showHistory={showHistory} setShowHistory={setShowHistory}
            setItemSearchFilters={setItemSearchFilters} setHistorySearchFilters={setHistorySearchFilters}
            setShowItemForm={setShowItemForm} setEditingItem={setEditingItem}
            setSelectedItemIdForHistory={setSelectedItemIdForHistory}
          />

          {categoryError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 mb-6 transition-colors">
              <p className="text-red-800 dark:text-red-400 font-medium">오류: {categoryError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <CategorySidebar
                categories={categories} filteredCategories={filteredCategories}
                matchedCategoryIds={matchedCategoryIds} selectedCategoryId={selectedCategoryId}
                expandedCategoryIds={expandedCategoryIds} searchQuery={searchQuery}
                items={data.items} onSearchChange={setSearchQuery}
                onAddCategoryClick={categoryHandlers.handleOpenAddCategoryForm}
                onCategoryClick={categoryHandlers.handleCategoryClick}
                onToggleExpand={categoryHandlers.handleToggleExpand}
                onEdit={categoryHandlers.handleEditCategory}
                onDelete={categoryHandlers.handleDeleteCategory}
                onShowAll={() => setSelectedCategoryId(undefined)}
              />
            </div>

            <div className="lg:col-span-3">
              {showHistory ? (
                <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 border border-transparent dark:border-purple-900/30 transition-colors">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">수량 변동 이력</h2>
                  <HistoryPanel itemId={selectedItemIdForHistory} categoryId={selectedCategoryId} history={filteredHistory} items={data.items} categories={categories} />
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md overflow-hidden border border-transparent dark:border-purple-900/30 transition-colors">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 transition-colors">아이템이 없습니다</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm transition-colors">아이템을 추가하여 인벤토리를 시작하세요</p>
                    </div>
                  ) : (
                    <>
                      <InventoryTable
                        paginatedItems={paginatedItems} allVisibleSelected={allVisibleSelected}
                        someVisibleSelected={someVisibleSelected} selectedItemIds={selectedItemIds}
                        categories={categories} handleToggleSelectAll={handleToggleSelectAll}
                        handleToggleSelectItem={handleToggleSelectItem}
                        getTransactionVerification={getTransactionVerification}
                        getLinkedTransaction={getLinkedTransaction}
                        getEncyclopediaName={getEncyclopediaName}
                        handleShowImageEdit={handleShowImageEdit} handleShowItemDetail={handleShowItemDetail}
                        getPriceComparisonStatus={getPriceComparisonStatus}
                        handleShowTransaction={handleShowTransaction} handleEditItem={handleEditItem}
                        handleDeleteItem={handleDeleteItem}
                        setSelectedItemIdForHistory={setSelectedItemIdForHistory}
                        setShowHistory={setShowHistory}
                      />
                      <Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredItems.length} onPageChange={setCurrentPage} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <InventoryModals
          categories={categories} encyclopedias={encyclopedias} transactions={transactions}
          uncategorizedId={uncategorizedId}
          needsInitialSetup={needsInitialSetup} showInitialSetup={showInitialSetup}
          showItemForm={showItemForm} showCategoryForm={showCategoryForm}
          showTransactionModal={showTransactionModal} showItemDetailModal={showItemDetailModal}
          showImageEditModal={showImageEditModal} showDeleteModal={showDeleteModal}
          showBulkEditModal={showBulkEditModal}
          editingItem={editingItem} editingCategoryId={editingCategoryId}
          selectedTransactionId={selectedTransactionId} selectedItemForDetail={selectedItemForDetail}
          selectedItemForImageEdit={selectedItemForImageEdit} itemToDelete={itemToDelete}
          selectedItemIds={selectedItemIds}
          categoryName={categoryName} categoryParentId={categoryParentId} categoryFormError={categoryFormError}
          bulkEditQuantity={bulkEditQuantity} bulkEditPrice={bulkEditPrice}
          bulkEditEncyclopediaId={bulkEditEncyclopediaId}
          setBulkEditQuantity={setBulkEditQuantity} setBulkEditPrice={setBulkEditPrice}
          setBulkEditEncyclopediaId={setBulkEditEncyclopediaId}
          onInitialSetupComplete={categoryHandlers.handleInitialSetupComplete}
          onAddItem={handleAddItem} onUpdateItem={handleUpdateItem}
          onCancelItemForm={() => { setShowItemForm(false); setEditingItem(undefined) }}
          onAddCategory={categoryHandlers.handleAddCategory}
          onUpdateCategory={categoryHandlers.handleUpdateCategory}
          onCloseCategoryForm={categoryHandlers.handleCloseCategoryForm}
          onCategoryNameChange={setCategoryName} onCategoryParentChange={setCategoryParentId}
          onCloseTransaction={() => { setShowTransactionModal(false); setSelectedTransactionId(undefined) }}
          onCloseItemDetail={() => { setShowItemDetailModal(false); setSelectedItemForDetail(undefined) }}
          onShowImageEdit={handleShowImageEdit} onEditItem={handleEditItem}
          onSaveImage={handleSaveImage}
          onCancelImageEdit={() => { setShowImageEditModal(false); setSelectedItemForImageEdit(undefined) }}
          onConfirmDelete={handleConfirmDelete}
          onCancelDelete={() => { setShowDeleteModal(false); setItemToDelete(undefined) }}
          onConfirmBulkEdit={handleBulkEdit}
          onCancelBulkEdit={() => { setShowBulkEditModal(false); setBulkEditQuantity(''); setBulkEditPrice(''); setBulkEditEncyclopediaId('') }}
          getEncyclopediaName={getEncyclopediaName}
          getLinkedTransaction={getLinkedTransaction}
          getPriceComparisonStatus={getPriceComparisonStatus}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {draggedItem ? (
          <div className="bg-white dark:bg-[#13112c] shadow-lg rounded px-3 py-2 border-2 border-blue-500 dark:border-blue-700 text-sm inline-block whitespace-nowrap pointer-events-none transition-colors"
            style={{ cursor: 'grabbing', transform: `translate(-${dragOffset.x}px, -${dragOffset.y}px)` }}>
            {selectedItemIds.size > 1 && selectedItemIds.has(draggedItem.id) ? (
              <div className="font-medium text-blue-600 dark:text-blue-400">{selectedItemIds.size}개 이동 중</div>
            ) : (
              <>
                <div className="font-medium text-gray-900 dark:text-gray-100">{draggedItem.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatCategoryPath(draggedItem.categoryId, categories)}</div>
              </>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default Inventory
