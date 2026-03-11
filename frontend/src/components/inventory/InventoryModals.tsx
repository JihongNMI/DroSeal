import { InitialSetupModal } from './InitialSetupModal'
import { ItemForm } from './ItemForm'
import { ImageEditModal } from './ImageEditModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { ItemDetailModal } from './ItemDetailModal'
import { TransactionDetailModal } from './TransactionDetailModal'
import { BulkEditModal } from './BulkEditModal'
import { CategoryFormModal } from './CategoryFormModal'
import { formatCategoryPath } from '../../services/categoryService'
import type { InventoryItem, InventoryCategory } from '../../types'

interface InventoryModalsProps {
  // Data
  categories: InventoryCategory[]
  encyclopedias: any[]
  transactions: any[]
  uncategorizedId: string
  // Visibility state
  needsInitialSetup: boolean
  showInitialSetup: boolean
  showItemForm: boolean
  showCategoryForm: boolean
  showTransactionModal: boolean
  showItemDetailModal: boolean
  showImageEditModal: boolean
  showDeleteModal: boolean
  showBulkEditModal: boolean
  // Selected items
  editingItem: InventoryItem | undefined
  editingCategoryId: string | undefined
  selectedTransactionId: string | undefined
  selectedItemForDetail: InventoryItem | undefined
  selectedItemForImageEdit: InventoryItem | undefined
  itemToDelete: InventoryItem | undefined
  selectedItemIds: Set<string>
  // Category form state
  categoryName: string
  categoryParentId: string | undefined
  categoryFormError: string | null
  // Bulk edit state
  bulkEditQuantity: string
  bulkEditPrice: string
  bulkEditEncyclopediaId: string
  setBulkEditQuantity: (v: string) => void
  setBulkEditPrice: (v: string) => void
  setBulkEditEncyclopediaId: (v: string) => void
  // Handlers
  onInitialSetupComplete: (names: string[]) => void
  onAddItem: (item: Partial<InventoryItem>, transaction?: any) => void
  onUpdateItem: (item: Partial<InventoryItem>, transaction?: any) => void
  onCancelItemForm: () => void
  onAddCategory: () => void
  onUpdateCategory: () => void
  onCloseCategoryForm: () => void
  onCategoryNameChange: (name: string) => void
  onCategoryParentChange: (id: string | undefined) => void
  onCloseTransaction: () => void
  onCloseItemDetail: () => void
  onShowImageEdit: (item: InventoryItem) => void
  onEditItem: (item: InventoryItem) => void
  onSaveImage: (url: string | undefined) => void
  onCancelImageEdit: () => void
  onConfirmDelete: (addToAccounting: boolean, platform?: string, salePrice?: number) => void
  onCancelDelete: () => void
  onConfirmBulkEdit: () => void
  onCancelBulkEdit: () => void
  getEncyclopediaName: (id?: string) => string | undefined
  getLinkedTransaction: (item: InventoryItem) => any
  getPriceComparisonStatus: (item: InventoryItem, transaction: any) => 'match' | 'higher' | 'lower'
}

export function InventoryModals({
  categories, encyclopedias, transactions, uncategorizedId,
  needsInitialSetup, showInitialSetup,
  showItemForm, showCategoryForm, showTransactionModal,
  showItemDetailModal, showImageEditModal, showDeleteModal, showBulkEditModal,
  editingItem, editingCategoryId, selectedTransactionId,
  selectedItemForDetail, selectedItemForImageEdit, itemToDelete, selectedItemIds,
  categoryName, categoryParentId, categoryFormError,
  bulkEditQuantity, bulkEditPrice, bulkEditEncyclopediaId,
  setBulkEditQuantity, setBulkEditPrice, setBulkEditEncyclopediaId,
  onInitialSetupComplete, onAddItem, onUpdateItem, onCancelItemForm,
  onAddCategory, onUpdateCategory, onCloseCategoryForm,
  onCategoryNameChange, onCategoryParentChange,
  onCloseTransaction, onCloseItemDetail,
  onShowImageEdit, onEditItem,
  onSaveImage, onCancelImageEdit,
  onConfirmDelete, onCancelDelete,
  onConfirmBulkEdit, onCancelBulkEdit,
  getEncyclopediaName, getLinkedTransaction, getPriceComparisonStatus,
}: InventoryModalsProps) {
  return (
    <>
      {(needsInitialSetup || showInitialSetup) && (
        <InitialSetupModal isOpen={true} onComplete={onInitialSetupComplete} />
      )}

      {showItemForm && (
        <ItemForm
          item={editingItem} categories={categories}
          encyclopedias={encyclopedias} uncategorizedId={uncategorizedId}
          onSubmit={editingItem ? onUpdateItem : onAddItem}
          onCancel={onCancelItemForm}
        />
      )}

      {showCategoryForm && (
        <CategoryFormModal
          editingCategoryId={editingCategoryId} uncategorizedId={uncategorizedId}
          categories={categories} categoryName={categoryName}
          categoryParentId={categoryParentId} categoryFormError={categoryFormError}
          onCategoryNameChange={onCategoryNameChange} onCategoryParentChange={onCategoryParentChange}
          onSubmit={editingCategoryId ? onUpdateCategory : onAddCategory}
          onClose={onCloseCategoryForm}
        />
      )}

      {showTransactionModal && selectedTransactionId && (
        <TransactionDetailModal
          transaction={transactions?.find(t => t.id === selectedTransactionId)}
          onClose={onCloseTransaction}
        />
      )}

      {showItemDetailModal && selectedItemForDetail && (
        <ItemDetailModal
          item={selectedItemForDetail} categories={categories}
          formatCategoryPath={formatCategoryPath}
          getEncyclopediaName={getEncyclopediaName}
          getLinkedTransaction={getLinkedTransaction}
          getPriceComparisonStatus={getPriceComparisonStatus}
          onClose={onCloseItemDetail}
          onEditImage={onShowImageEdit} onEditItem={onEditItem}
        />
      )}

      {showImageEditModal && selectedItemForImageEdit && (
        <ImageEditModal
          currentImageUrl={selectedItemForImageEdit.imageUrl}
          itemName={selectedItemForImageEdit.name}
          onSave={onSaveImage} onCancel={onCancelImageEdit}
        />
      )}

      {showDeleteModal && itemToDelete && (
        <DeleteConfirmModal
          itemName={itemToDelete.name} itemPrice={itemToDelete.price}
          onConfirm={onConfirmDelete} onCancel={onCancelDelete}
        />
      )}

      {showBulkEditModal && (
        <BulkEditModal
          selectedCount={selectedItemIds.size}
          bulkEditQuantity={bulkEditQuantity} setBulkEditQuantity={setBulkEditQuantity}
          bulkEditPrice={bulkEditPrice} setBulkEditPrice={setBulkEditPrice}
          bulkEditEncyclopediaId={bulkEditEncyclopediaId} setBulkEditEncyclopediaId={setBulkEditEncyclopediaId}
          encyclopedias={encyclopedias || []}
          onConfirm={onConfirmBulkEdit} onCancel={onCancelBulkEdit}
        />
      )}
    </>
  )
}
