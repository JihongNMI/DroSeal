import { useState, useMemo } from 'react';
import { InventoryItem, InventoryCategory, HistoryRecord } from '../../types';
import { ItemSearchFilters } from './ItemSearch';
import { HistorySearchFilters } from './HistorySearch';

interface UseInventoryStateProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  history: HistoryRecord[];
  uncategorizedId: string;
  getEncyclopediaName: (id?: string) => string | undefined;
}

export function useInventoryState({
  items,
  categories,
  history,
  uncategorizedId,
  getEncyclopediaName
}: UseInventoryStateProps) {
  // UI state
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedItemIdForHistory, setSelectedItemIdForHistory] = useState<string | undefined>();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | undefined>();
  const [itemSearchFilters, setItemSearchFilters] = useState<ItemSearchFilters | null>(null);
  const [historySearchFilters, setHistorySearchFilters] = useState<HistorySearchFilters | null>(null);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | undefined>();
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [selectedItemForImageEdit, setSelectedItemForImageEdit] = useState<InventoryItem | undefined>();
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditQuantity, setBulkEditQuantity] = useState<string>('');
  const [bulkEditPrice, setBulkEditPrice] = useState<string>('');
  const [bulkEditEncyclopediaId, setBulkEditEncyclopediaId] = useState<string>('');
  const [expandedBulkCategories, setExpandedBulkCategories] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | undefined>();

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryParentId, setCategoryParentId] = useState<string | undefined>();
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 20;

  // Parse date string (supports YYYY-MM-DD, YYYY-MM, YYYY)
  const parseDate = (dateStr: string): { start: Date, end: Date } | null => {
    if (!dateStr) return null;

    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(dateStr);
      return { start: date, end: new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1) };
    } else if (parts.length === 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      return { start, end };
    } else if (parts.length === 1) {
      const year = parseInt(parts[0]);
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    return null;
  };

  // Apply item search filters
  const applyItemFilters = (itemsList: InventoryItem[], filters: ItemSearchFilters | null): InventoryItem[] => {
    if (!filters) return itemsList;

    return itemsList.filter(item => {
      // Text search
      if (filters.textSearch) {
        if (filters.textField === 'name') {
          if (!item.name.toLowerCase().includes(filters.textSearch.toLowerCase())) return false;
        } else if (filters.textField === 'notes') {
          if (!item.notes.toLowerCase().includes(filters.textSearch.toLowerCase())) return false;
        } else if (filters.textField === 'encyclopedia') {
          const encyclopediaName = getEncyclopediaName(item.encyclopediaId);
          if (!encyclopediaName || !encyclopediaName.toLowerCase().includes(filters.textSearch.toLowerCase())) return false;
        }
      }

      // Category filter
      if (filters.categoryId) {
        if (item.categoryId !== filters.categoryId) return false;
      }

      // // Verification status filter removed here as transactions are not passed to hook to keep it simpler
      // We will assume verification filtering is done separately or skip it in the hook to avoid circular logic
      
      // Quantity filter
      if (filters.quantityValue !== null) {
        if (filters.quantityOperator === '>=' && item.quantity < filters.quantityValue) return false;
        if (filters.quantityOperator === '=' && item.quantity !== filters.quantityValue) return false;
        if (filters.quantityOperator === '<=' && item.quantity > filters.quantityValue) return false;
      }

      // Price filter
      if (filters.priceValue !== null) {
        if (!item.price) return false;
        if (filters.priceOperator === '>=' && item.price < filters.priceValue) return false;
        if (filters.priceOperator === '=' && item.price !== filters.priceValue) return false;
        if (filters.priceOperator === '<=' && item.price > filters.priceValue) return false;
      }

      // Date range filter
      const itemDate = new Date(item.date);
      if (filters.dateFrom) {
        const fromRange = parseDate(filters.dateFrom);
        if (fromRange && itemDate < fromRange.start) return false;
      }
      if (filters.dateTo) {
        const toRange = parseDate(filters.dateTo);
        if (toRange && itemDate > toRange.end) return false;
      }

      return true;
    });
  };

  // Apply history search filters
  const applyHistoryFilters = (historyList: HistoryRecord[], filters: HistorySearchFilters | null): HistoryRecord[] => {
    if (!filters) return historyList;

    return historyList.filter(record => {
      // Change type filter
      if (filters.changeTypes.length > 0) {
        if (!filters.changeTypes.includes(record.changeType)) return false;
      }

      // Text search
      if (filters.textSearch) {
        if (filters.textField === 'itemName') {
          if (!record.itemName.toLowerCase().includes(filters.textSearch.toLowerCase())) return false;
        } else if (filters.textField === 'notes') {
          const hasNotesChange = record.changeType === 'notes_change';
          if (!hasNotesChange) return false;
          const prevNotes = record.previousNotes || '';
          const newNotes = record.newNotes || '';
          if (!prevNotes.toLowerCase().includes(filters.textSearch.toLowerCase()) &&
            !newNotes.toLowerCase().includes(filters.textSearch.toLowerCase())) return false;
        }
      }

      // Quantity filter
      if (filters.quantityValue !== null) {
        if (record.changeType !== 'quantity_change' && record.changeType !== 'item_deleted') return false;
        const qty = record.newQuantity ?? 0;
        if (filters.quantityOperator === '>=' && qty < filters.quantityValue) return false;
        if (filters.quantityOperator === '=' && qty !== filters.quantityValue) return false;
        if (filters.quantityOperator === '<=' && qty > filters.quantityValue) return false;
      }

      // Price filter
      if (filters.priceValue !== null) {
        if (record.changeType !== 'price_change') return false;
        const price = record.newPrice ?? 0;
        if (filters.priceOperator === '>=' && price < filters.priceValue) return false;
        if (filters.priceOperator === '=' && price !== filters.priceValue) return false;
        if (filters.priceOperator === '<=' && price > filters.priceValue) return false;
      }

      // Date range filter
      const recordDate = new Date(record.timestamp);
      if (filters.dateFrom) {
        const fromRange = parseDate(filters.dateFrom);
        if (fromRange && recordDate < fromRange.start) return false;
      }
      if (filters.dateTo) {
        const toRange = parseDate(filters.dateTo);
        if (toRange && recordDate > toRange.end) return false;
      }

      return true;
    });
  };

  // Filter items by search and selected category
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (selectedCategoryId) {
      filtered = filtered.filter(item => item.categoryId === selectedCategoryId);
    }

    filtered = applyItemFilters(filtered, itemSearchFilters);

    return filtered;
  }, [items, selectedCategoryId, itemSearchFilters]);

  // Filter history by search filters
  const filteredHistory = useMemo(() => {
    return applyHistoryFilters(history, historySearchFilters);
  }, [history, historySearchFilters]);

  // Paginate filtered items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, ITEMS_PER_PAGE]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Check if all visible items on current page are selected
  const allVisibleSelected = paginatedItems.length > 0 && paginatedItems.every(item => selectedItemIds.has(item.id));
  const someVisibleSelected = paginatedItems.some(item => selectedItemIds.has(item.id));

  return {
    // Basic state
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
    historySearchFilters, setHistorySearchFilters,
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
    
    // Computed state
    ITEMS_PER_PAGE,
    filteredItems,
    filteredHistory,
    paginatedItems,
    totalPages,
    allVisibleSelected,
    someVisibleSelected
  };
}
