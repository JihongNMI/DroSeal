# Design Document

## Introduction

This document describes the technical design of Phase 3 Additional Features for the DroSeal inventory system. These features enhance the user experience by adding drag-and-drop functionality, bulk operations, advanced search capabilities, pagination, and improved visual feedback. All features are built on top of the Phase 3 core infrastructure (hierarchical categories, history tracking, enhanced item data).

## System Architecture

### Component Hierarchy

```
Inventory (Page)
├── InitialSetupModal
├── CategoryTree (with droppable zones)
├── CategorySearch
├── ItemSearch (modal)
├── ItemForm
├── ImageEditModal
├── HistoryPanel
├── HistorySearch (modal)
└── Item Table
    ├── Header (with select all checkbox)
    └── DraggableTableRow (with drag handle)
```

### Data Flow

```
User Action → Component State → Hook (useInventory, useCategories) → localStorage
                                                                    ↓
                                                              History Record
```

## Feature Designs

### 1. Drag-and-Drop Category Assignment

#### Technical Implementation

**Library**: @dnd-kit/core v6.x
- Provides accessible drag-and-drop primitives
- Supports keyboard navigation
- Handles collision detection

**Components**:
- `DndContext`: Wraps the entire Inventory page
- `useDraggable`: Applied to drag handle in each table row
- `useDroppable`: Applied to each category in CategoryTree
- `DragOverlay`: Shows visual feedback during drag

**Drag Handle Design**:
```tsx
<div {...listeners} {...attributes} className="cursor-move">
  <svg>≡</svg> {/* Three horizontal lines icon */}
</div>
```

**Multi-Item Drag**:
- When dragging a selected item, all selected items move together
- Drag overlay shows "N개 이동 중" for multiple items
- Single item shows item name in overlay

**Event Handlers**:
```typescript
handleDragStart(event: DragStartEvent) {
  // Store dragged item
  // If not selected, select only it
  // Calculate cursor offset for overlay positioning
}

handleDragEnd(event: DragEndEvent) {
  // Get drop target category
  // Update all selected items' categoryId
  // Clear selection
  // Create history records
}
```

**Cursor Positioning**:
- Offset calculated on drag start: `clientX - rect.left`, `clientY - rect.top`
- Applied to DragOverlay via transform style
- Ensures cursor appears at click point on overlay

#### Data Model Impact

No schema changes. Uses existing `categoryId` field on InventoryItem.

#### Performance Considerations

- Drag overlay uses `pointer-events: none` to prevent interference
- Category tree re-renders minimized with React.memo
- Debounced localStorage save (500ms) prevents excessive writes

---

### 2. Bulk Operations

#### Technical Implementation

**Selection State**:
```typescript
const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
```

**Selection Modes**:
1. **Single Click**: Toggle individual item
2. **Shift+Click**: Select range from last selected to current
3. **Select All**: Toggle all visible items on current page

**Bulk Actions Panel**:
- Appears when `selectedItemIds.size > 0`
- Shows count: "N개 선택됨"
- Actions: 카테고리 변경, 일괄 수정, 삭제

**Bulk Category Change**:
- Modal with hierarchical category tree
- Expand/collapse categories
- Click category to apply to all selected items

**Bulk Edit Modal**:
```typescript
interface BulkEditState {
  quantity: string  // Optional: only update if filled
  price: string     // Optional: only update if filled
  encyclopediaId: string  // Optional: only update if filled
}
```
- Empty fields = no change
- Filled fields = update all selected items
- Applies partial updates via `updateItem(id, updates)`

**Bulk Delete**:
- Confirmation dialog: "N개의 아이템을 삭제하시겠습니까?"
- Deletes all selected items
- Creates history records for each deletion

#### Data Model Impact

No schema changes. Uses existing update/delete operations.

#### Performance Considerations

- Selection state uses Set for O(1) lookup
- Bulk operations batched: all updates in single render cycle
- History records created in batch

---

### 3. Advanced Item Search

#### Technical Implementation

**ItemSearch Component**:
- Modal overlay with backdrop
- Form with multiple filter fields
- Real-time filtering (no submit button)

**Filter State**:
```typescript
interface ItemSearchFilters {
  textSearch: string
  textField: 'name' | 'notes' | 'encyclopedia'
  categoryId: string | null
  verificationStatus: 'all' | 'none' | 'verified' | 'mismatch'
  quantityOperator: '>=' | '=' | '<='
  quantityValue: number | null
  priceOperator: '>=' | '=' | '<='
  priceValue: number | null
  dateFrom: string  // YYYY, YYYY-MM, or YYYY-MM-DD
  dateTo: string
}
```

**Filtering Logic**:
```typescript
const applyItemFilters = (items: InventoryItem[], filters: ItemSearchFilters) => {
  return items.filter(item => {
    // Text search
    if (filters.textSearch) {
      // Check selected field (name, notes, or encyclopedia)
    }
    
    // Category filter
    if (filters.categoryId && item.categoryId !== filters.categoryId) return false
    
    // Verification status
    const linkedTransaction = transactions.find(t => t.linkedInventoryItemId === item.id)
    // Check verification logic
    
    // Quantity filter
    if (filters.quantityValue !== null) {
      // Apply operator
    }
    
    // Price filter
    if (filters.priceValue !== null) {
      // Apply operator
    }
    
    // Date range
    const itemDate = new Date(item.date)
    // Parse date strings and compare
    
    return true
  })
}
```

**Date Parsing**:
- YYYY: Full year range (Jan 1 - Dec 31)
- YYYY-MM: Full month range (1st - last day)
- YYYY-MM-DD: Single day range (00:00:00 - 23:59:59)

#### Data Model Impact

No schema changes. Filters existing data.

#### Performance Considerations

- Filtering done in useMemo to prevent unnecessary recalculations
- Resets to page 1 when filters change
- Filter state lifted to Inventory page component

---

### 4. Advanced History Search

#### Technical Implementation

**HistorySearch Component**:
- Similar structure to ItemSearch
- Specialized for history records

**Filter State**:
```typescript
interface HistorySearchFilters {
  changeTypes: Array<'quantity_change' | 'price_change' | 'category_change' | 'notes_change' | 'item_deleted'>
  textSearch: string
  textField: 'itemName' | 'notes'
  quantityOperator: '>=' | '=' | '<='
  quantityValue: number | null
  priceOperator: '>=' | '=' | '<='
  priceValue: number | null
  dateFrom: string
  dateTo: string
}
```

**Filtering Logic**:
```typescript
const applyHistoryFilters = (history: HistoryRecord[], filters: HistorySearchFilters) => {
  return history.filter(record => {
    // Change type filter
    if (filters.changeTypes.length > 0 && !filters.changeTypes.includes(record.changeType)) {
      return false
    }
    
    // Text search in itemName or notes
    // Quantity/price filters only apply to relevant change types
    // Date range filtering
    
    return true
  })
}
```

#### Data Model Impact

No schema changes. Filters existing history records.

---

### 5. Pagination

#### Technical Implementation

**Pagination State**:
```typescript
const [currentPage, setCurrentPage] = useState(1)
const ITEMS_PER_PAGE = 20

const paginatedItems = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  return filteredItems.slice(startIndex, endIndex)
}, [filteredItems, currentPage])

const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
```

**Page Navigation UI**:
```
[이전] [1] [2] [3] ... [10] [다음]
```
- Current page highlighted
- Previous/Next buttons disabled at boundaries
- Page numbers clickable

**Reset Behavior**:
- Resets to page 1 when filters change
- Resets to page 1 when category selection changes
- Selection state persists across pages

#### Data Model Impact

No schema changes. Client-side pagination only.

#### Performance Considerations

- Only renders 20 items at a time
- useMemo prevents unnecessary recalculations
- Smooth performance even with 1000+ items

---

### 6. Image Edit Modal

#### Technical Implementation

**ImageEditModal Component**:
```typescript
interface ImageEditModalProps {
  isOpen: boolean
  item: InventoryItem | undefined
  onClose: () => void
  onSave: (imageUrl: string | undefined) => void
}
```

**UI Elements**:
- Current image display (or placeholder if none)
- URL input field
- "이미지 제거" button (sets imageUrl to undefined)
- "취소" and "저장" buttons

**Trigger**:
- Click on item image in table
- Opens modal with current item data

**Save Logic**:
```typescript
const handleSaveImage = (imageUrl: string | undefined) => {
  updateItem(selectedItem.id, { imageUrl })
  setShowImageEditModal(false)
}
```

#### Data Model Impact

Uses existing `imageUrl` field on InventoryItem (optional string).

---

### 7. Transaction Verification Details

#### Technical Implementation

**Verification Status Calculation**:
```typescript
const getPriceComparisonStatus = (item: InventoryItem, transaction: Transaction) => {
  if (!item.price) return 'match'
  if (item.price === transaction.amount) return 'match'
  if (item.price > transaction.amount) return 'higher'
  return 'lower'
}
```

**Visual Indicators**:
- ✓ symbol in "증빙" column
- Color coding:
  - Green: match (prices equal)
  - Red: higher (inventory price > transaction amount)
  - Blue: lower (inventory price < transaction amount)

**Tooltip Content**:
- Match: "회계 기록과 가격 일치"
- Higher: "인벤토리 가격이 더 높음 (₩X > ₩Y)"
- Lower: "인벤토리 가격이 더 낮음 (₩X < ₩Y)"

**Click Behavior**:
- Opens transaction detail modal
- Shows full transaction information

#### Data Model Impact

No schema changes. Uses existing `linkedInventoryItemId` field on Transaction.

---

## Integration Points

### With Phase 3 Core

- Uses `useCategories` hook for category data
- Uses `useInventory` hook for item CRUD operations
- Uses `useHistory` hook for history tracking
- Uses `useTransactions` hook for verification
- Uses `categoryService` utilities for hierarchy operations

### With localStorage

- All state changes automatically saved via hooks
- 500ms debounce prevents excessive writes
- No additional storage keys needed

---

## Error Handling

### Drag-and-Drop Errors

- Invalid drop target: No action taken
- Drag outside droppable area: Item returns to original position
- Network/storage error: Alert user, don't update UI

### Bulk Operation Errors

- Empty selection: Bulk actions panel hidden
- Invalid input: Validation messages in modal
- Partial failure: Show which items failed

### Search Errors

- Invalid date format: Ignored, no filtering applied
- Invalid number: Ignored, no filtering applied
- No results: Show "검색 결과가 없습니다" message

---

## Accessibility

### Keyboard Navigation

- Drag-and-drop: @dnd-kit provides keyboard support
- Modals: Esc to close, Tab navigation
- Checkboxes: Space to toggle
- Buttons: Enter to activate

### Screen Readers

- Drag handle: aria-label="드래그하여 카테고리 이동"
- Checkboxes: aria-label with item name
- Status indicators: aria-label with status description

### Visual Feedback

- Focus indicators on all interactive elements
- High contrast colors for status indicators
- Loading states for async operations

---

## Testing Strategy

### Unit Tests

- Filter functions (applyItemFilters, applyHistoryFilters)
- Date parsing logic
- Price comparison logic
- Selection state management

### Integration Tests

- Drag-and-drop flow
- Bulk operations flow
- Search and filter flow
- Pagination navigation

### Manual Testing

- Cross-browser compatibility
- Mobile responsiveness
- Keyboard-only navigation
- Screen reader compatibility

---

## Future Enhancements

### Potential Improvements

1. **Saved Searches**: Save frequently used filter combinations
2. **Export Filtered Results**: Download filtered items as CSV/JSON
3. **Undo/Redo**: Revert bulk operations
4. **Drag-and-Drop Reordering**: Custom sort order within categories
5. **Advanced Bulk Edit**: Formula-based updates (e.g., "increase all prices by 10%")
6. **Search History**: Recently used search terms
7. **Keyboard Shortcuts**: Hotkeys for common actions

### Performance Optimizations

1. **Virtual Scrolling**: For very large item lists (1000+ items)
2. **Lazy Loading**: Load categories on-demand
3. **Web Workers**: Move filtering logic off main thread
4. **IndexedDB**: For larger datasets beyond localStorage limits

---

## Conclusion

Phase 3 Additional Features significantly enhance the usability of the DroSeal inventory system. The drag-and-drop interface provides intuitive category management, bulk operations enable efficient data management, and advanced search capabilities help users find items quickly. All features are built on the solid foundation of Phase 3 core infrastructure and integrate seamlessly with existing functionality.
