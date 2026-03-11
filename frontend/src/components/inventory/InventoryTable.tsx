import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { InventoryItem, InventoryCategory } from '../../types';
import { formatCategoryPath } from '../../services/categoryService';

// --- Draggable Table Row Component ---
interface DraggableTableRowProps {
  item: InventoryItem;
  index: number;
  verification: 'verified' | 'mismatch' | 'none';
  linkedTransaction: any;
  encyclopediaName: string | undefined;
  selectedItemIds: Set<string>;
  categories: InventoryCategory[];
  handleToggleSelectItem: (itemId: string, index: number, event: React.MouseEvent) => void;
  handleShowImageEdit: (item: InventoryItem) => void;
  handleShowItemDetail: (item: InventoryItem) => void;
  getPriceComparisonStatus: (item: InventoryItem, transaction: any) => 'match' | 'higher' | 'lower';
  handleShowTransaction: (transactionId: string) => void;
  handleEditItem: (item: InventoryItem) => void;
  handleDeleteItem: (itemId: string) => void;
  setSelectedItemIdForHistory: (itemId: string) => void;
  setShowHistory: (show: boolean) => void;
}

export function DraggableTableRow({
  item,
  index,
  verification,
  linkedTransaction,
  encyclopediaName,
  selectedItemIds,
  categories,
  handleToggleSelectItem,
  handleShowImageEdit,
  handleShowItemDetail,
  getPriceComparisonStatus,
  handleShowTransaction,
  handleEditItem,
  handleDeleteItem,
  setSelectedItemIdForHistory,
  setShowHistory
}: DraggableTableRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  });

  return (
    <tr
      ref={setNodeRef}
      className={`hover:bg-gray-50 ${isDragging ? 'opacity-50' : ''}`}
    >
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div
            {...listeners}
            {...attributes}
            className="cursor-move text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="드래그하여 카테고리 이동"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 4h12v1H2V4zm0 3.5h12v1H2v-1zM2 11h12v1H2v-1z" />
            </svg>
          </div>
          <input
            type="checkbox"
            checked={selectedItemIds.has(item.id)}
            onClick={(e) => handleToggleSelectItem(item.id, index, e)}
            onChange={() => { }} // Prevent React warning
            className="w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
          />
        </div>
      </td>
      <td className="px-6 py-4">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-12 h-12 object-cover rounded cursor-pointer"
            onClick={() => handleShowImageEdit(item)}
          />
        ) : (
          <div
            className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300"
            onClick={() => handleShowImageEdit(item)}
          >
            <span className="text-gray-400 text-xs text-center">이미지<br />없음</span>
          </div>
        )}
      </td>
      <td
        className="px-6 py-4 text-sm text-gray-900 hover:text-blue-600 cursor-pointer"
        onClick={() => handleShowItemDetail(item)}
      >
        {item.name}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatCategoryPath(item.categoryId, categories)}
      </td>
      <td className="px-6 py-4 text-sm">
        {item.quantity === 0 ? (
          <span className="text-red-600 font-medium">재고 없음</span>
        ) : (
          <span className="text-gray-600">{item.quantity}</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {item.price ? (
          <span>₩{item.price.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {linkedTransaction ? (
          (() => {
            const status = getPriceComparisonStatus(item, linkedTransaction)
            const colorClass =
              status === 'match' ? 'text-green-600 hover:text-green-800' :
                status === 'higher' ? 'text-red-600 hover:text-red-800' :
                  'text-blue-600 hover:text-blue-800'
            const tooltip =
              status === 'match' ? '회계 기록과 가격 일치' :
                status === 'higher' ? `인벤토리 가격이 더 높음 (₩${item.price?.toLocaleString()} > ₩${linkedTransaction.amount.toLocaleString()})` :
                  `인벤토리 가격이 더 낮음 (₩${item.price?.toLocaleString()} < ₩${linkedTransaction.amount.toLocaleString()})`

            return (
              <button
                onClick={() => handleShowTransaction(linkedTransaction.id)}
                className={`${colorClass} cursor-pointer font-bold text-lg`}
                title={tooltip}
              >
                ✓
              </button>
            )
          })()
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {encyclopediaName || <span className="text-gray-400">-</span>}
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="flex gap-2">
          <button
            onClick={() => handleShowItemDetail(item)}
            className="text-gray-600 hover:text-gray-800"
          >
            상세
          </button>
          <button
            onClick={() => handleEditItem(item)}
            className="text-blue-600 hover:text-blue-800"
          >
            수정
          </button>
          <button
            onClick={() => handleDeleteItem(item.id)}
            className="text-red-600 hover:text-red-800"
          >
            삭제
          </button>
          <button
            onClick={() => {
              setSelectedItemIdForHistory(item.id)
              setShowHistory(true)
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            이력
          </button>
        </div>
      </td>
    </tr>
  );
}

// --- Main Inventory Table Component ---
interface InventoryTableProps {
  paginatedItems: InventoryItem[];
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  selectedItemIds: Set<string>;
  categories: InventoryCategory[];
  handleToggleSelectAll: () => void;
  handleToggleSelectItem: (itemId: string, index: number, event: React.MouseEvent) => void;
  getTransactionVerification: (item: InventoryItem) => 'verified' | 'mismatch' | 'none';
  getLinkedTransaction: (item: InventoryItem) => any;
  getEncyclopediaName: (encyclopediaId?: string) => string | undefined;
  handleShowImageEdit: (item: InventoryItem) => void;
  handleShowItemDetail: (item: InventoryItem) => void;
  getPriceComparisonStatus: (item: InventoryItem, transaction: any) => 'match' | 'higher' | 'lower';
  handleShowTransaction: (transactionId: string) => void;
  handleEditItem: (item: InventoryItem) => void;
  handleDeleteItem: (itemId: string) => void;
  setSelectedItemIdForHistory: (itemId: string) => void;
  setShowHistory: (show: boolean) => void;
}

export function InventoryTable({
  paginatedItems,
  allVisibleSelected,
  someVisibleSelected,
  selectedItemIds,
  categories,
  handleToggleSelectAll,
  handleToggleSelectItem,
  getTransactionVerification,
  getLinkedTransaction,
  getEncyclopediaName,
  handleShowImageEdit,
  handleShowItemDetail,
  getPriceComparisonStatus,
  handleShowTransaction,
  handleEditItem,
  handleDeleteItem,
  setSelectedItemIdForHistory,
  setShowHistory
}: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-4 flex-shrink-0"></div>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someVisibleSelected && !allVisibleSelected
                    }
                  }}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수량</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">증빙</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도감</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedItems.map((item, index) => {
            const verification = getTransactionVerification(item)
            const linkedTransaction = getLinkedTransaction(item)
            const encyclopediaName = getEncyclopediaName(item.encyclopediaId)

            return (
              <DraggableTableRow
                key={item.id}
                item={item}
                index={index}
                verification={verification}
                linkedTransaction={linkedTransaction}
                encyclopediaName={encyclopediaName}
                selectedItemIds={selectedItemIds}
                categories={categories}
                handleToggleSelectItem={handleToggleSelectItem}
                handleShowImageEdit={handleShowImageEdit}
                handleShowItemDetail={handleShowItemDetail}
                getPriceComparisonStatus={getPriceComparisonStatus}
                handleShowTransaction={handleShowTransaction}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
                setSelectedItemIdForHistory={setSelectedItemIdForHistory}
                setShowHistory={setShowHistory}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  );
}
