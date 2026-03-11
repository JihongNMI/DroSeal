import React from 'react';
import { InventoryItem, InventoryCategory } from '../../types';

interface ItemDetailModalProps {
  item: InventoryItem;
  categories: InventoryCategory[];
  formatCategoryPath: (categoryId: string, categories: InventoryCategory[]) => string;
  getEncyclopediaName: (encyclopediaId?: string) => string | undefined;
  getLinkedTransaction: (item: InventoryItem) => any;
  getPriceComparisonStatus: (item: InventoryItem, transaction: any) => 'match' | 'higher' | 'lower';
  onClose: () => void;
  onEditImage: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
}

export function ItemDetailModal({
  item,
  categories,
  formatCategoryPath,
  getEncyclopediaName,
  getLinkedTransaction,
  getPriceComparisonStatus,
  onClose,
  onEditImage,
  onEditItem
}: ItemDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">아이템 상세 정보</h2>

        <div className="space-y-4">
          {/* Image */}
          {item.imageUrl ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이미지</label>
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full max-w-md rounded-lg cursor-pointer hover:opacity-80"
                onClick={() => {
                  onClose();
                  onEditImage(item);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">클릭하여 이미지 수정</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이미지</label>
              <div
                className="w-full max-w-md h-48 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300"
                onClick={() => {
                  onClose();
                  onEditImage(item);
                }}
              >
                <span className="text-gray-400">이미지 없음 (클릭하여 추가)</span>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <p className="text-gray-900 text-lg font-semibold">{item.name}</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <p className="text-gray-900">{formatCategoryPath(item.categoryId, categories)}</p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
            <p className="text-gray-900">{item.quantity}</p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
            <p className="text-gray-900">
              {item.price ? `₩${item.price.toLocaleString()}` : '-'}
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">일자</label>
            <p className="text-gray-900">
              {new Date(item.date).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* Encyclopedia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">도감</label>
            <p className="text-gray-900">
              {getEncyclopediaName(item.encyclopediaId) || '-'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <p className="text-gray-900 whitespace-pre-wrap">
              {item.notes || '-'}
            </p>
          </div>

          {/* Verification Status */}
          {(() => {
            const linkedTransaction = getLinkedTransaction(item)
            if (linkedTransaction) {
              const status = getPriceComparisonStatus(item, linkedTransaction)
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">증빙 상태</label>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${status === 'match' ? 'text-green-600' :
                      status === 'higher' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                      ✓
                    </span>
                    <span className="text-gray-900">
                      {status === 'match' ? '회계 기록과 가격 일치' :
                        status === 'higher' ? `인벤토리 가격이 더 높음 (₩${item.price?.toLocaleString()} > ₩${linkedTransaction.amount.toLocaleString()})` :
                          `인벤토리 가격이 더 낮음 (₩${item.price?.toLocaleString()} < ₩${linkedTransaction.amount.toLocaleString()})`}
                    </span>
                  </div>
                </div>
              )
            }
            return null
          })()}

          {/* Created/Updated dates */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">생성일:</span> {new Date(item.createdAt).toLocaleString('ko-KR')}
              </div>
              <div>
                <span className="font-medium">수정일:</span> {new Date(item.updatedAt).toLocaleString('ko-KR')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            닫기
          </button>
          <button
            onClick={() => {
              onClose();
              onEditItem(item);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
}
