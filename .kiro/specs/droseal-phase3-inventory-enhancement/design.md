# Design Document: DroSeal Phase 3 Inventory Enhancement

## Overview

This design document specifies the technical architecture for DroSeal Phase 3: Inventory Enhancement. This phase builds upon the Phase 1 infrastructure (navigation and localStorage) to add advanced inventory management capabilities:

1. **Hierarchical Category System**: Multi-level category structure with parent-child relationships
2. **Initial User Setup Flow**: First-time user onboarding with collection style selection
3. **Enhanced Item Management**: Additional fields for price, date, and encyclopedia linking
4. **Quantity History Tracking**: Complete audit trail of item quantity changes and deletions
5. **Advanced UI Features**: Collapsible tree view, category search, and enhanced item display

The implementation extends existing React hooks and localStorage services, maintains backward compatibility with Phase 1 data through migration logic, and provides a seamless user experience for managing hierarchical collections.

### Key Design Principles

- **Backward Compatibility**: Automatic migration of Phase 1 data to Phase 3 schema
- **Data Integrity**: Uncategorized category as immutable default with automatic item assignment
- **Hierarchical Flexibility**: Support for arbitrary depth category trees with duplicate names at different levels
- **Audit Trail**: Complete history tracking for all quantity changes and deletions
- **Progressive Enhancement**: Enhanced features without breaking existing functionality

## Architecture

### System Components

Phase 3 extends the Phase 1 architecture with new components and enhanced data models:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│  ┌──────────────┐  ┌──────────────────────────────┐    │
│  │   Navbar     │  │   Enhanced Inventory Page    │    │
│  │  (Phase 1)   │  │  - Category Tree View        │    │
│  └──────────────┘  │  - Initial Setup Modal       │    │
│                    │  - Item Form (Enhanced)      │    │
│                    │  - History Display           │    │
│                    └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 State Management Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │useCategories │  │useInventory  │  │useHistory    │  │
│  │   (New)      │  │  (Enhanced)  │  │   (New)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │useEncyclopedias│ │useTransactions│                   │
│  │  (Phase 1)   │  │  (Phase 1)   │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Storage Service Layer                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         LocalStorage Service (Phase 1)          │   │
│  │  - saveData / loadData                          │   │
│  │  - Migration logic (Phase 1 → Phase 3)         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Category Service (New)                  │   │
│  │  - getCategoryPath / getAncestors               │   │
│  │  - getDescendants / searchCategories            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Browser LocalStorage API                    │
└─────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Initial Setup Flow:**
1. User navigates to Inventory page for first time
2. System detects no categories exist
3. System creates "미분류" (Uncategorized) category
4. Modal displays collection style question with two options
5. User selects option and enters initial category names
6. System creates top-level categories (parentId: undefined)
7. Modal closes and user sees category tree

**Category Management Flow:**
1. User clicks "카테고리 추가" button
2. Dialog shows with parent category dropdown (optional)
3. User enters name and selects parent (or none for top-level)
4. System validates: no duplicate names under same parent
5. System creates category and saves to localStorage
6. UI updates to show new category in tree

**Item Creation Flow:**
1. User clicks "아이템 추가" button
2. Form displays with fields: name, category (default: Uncategorized), quantity, price (optional), date (default: now), encyclopedia (dropdown)
3. User fills form and submits
4. System creates item with all fields
5. System saves item to localStorage
6. UI updates to show new item

**Quantity Change Flow:**
1. User modifies item quantity
2. System creates history record: { itemId, changeType: 'quantity_change', previousQuantity, newQuantity, timestamp }
3. System updates item quantity
4. System saves both item and history to localStorage
5. UI updates to show new quantity

**Category Deletion Flow:**
1. User selects category and clicks delete
2. System checks for items in category
3. If items exist: reassign all to Uncategorized
4. System checks for child categories
5. If children exist: reassign to parent (or top-level if no parent)
6. System deletes category
7. System saves changes to localStorage
8. UI updates tree view

## Components and Interfaces

### 1. Enhanced Inventory Page

**File:** `src/pages/Inventory.tsx` (enhanced from Phase 1)

**Purpose:** Main inventory management interface with hierarchical categories, enhanced item forms, and history display.

**Component Structure:**

```typescript
interface InventoryPageProps {
  // No props - uses hooks for state
}

export function Inventory(): JSX.Element
```

**Sub-components:**
- `InitialSetupModal`: First-time user onboarding
- `CategoryTree`: Collapsible hierarchical category display
- `CategorySearch`: Search input with ancestor/descendant filtering
- `ItemForm`: Enhanced form with new fields
- `ItemList`: Display items with enhanced information
- `HistoryPanel`: Show quantity change history

### 2. Initial Setup Modal

**File:** `src/components/inventory/InitialSetupModal.tsx` (new)

**Purpose:** Guide first-time users through collection style selection and initial category creation.

**Component Structure:**

```typescript
interface InitialSetupModalProps {
  isOpen: boolean
  onComplete: (categories: string[]) => void
}

interface CollectionStyle {
  id: 'by-type' | 'by-content'
  title: string
  description: string
  examples: string[]
}

export function InitialSetupModal({ isOpen, onComplete }: InitialSetupModalProps): JSX.Element
```

**Implementation Details:**
- Two-step wizard: (1) Select collection style, (2) Enter category names
- Collection style options:
  - Option A: "아이템 종류별로 모으기" (examples: 씰, 카드, 피규어)
  - Option B: "작품/컨텐츠별로 모으기" (examples: 포켓몬, 블루아카, 산리오)
- Dynamic category input: Add/remove category name fields
- Validation: Prevent empty category names
- Creates all categories at top level (parentId: undefined)

### 3. Category Tree Component

**File:** `src/components/inventory/CategoryTree.tsx` (new)

**Purpose:** Display hierarchical categories with expand/collapse functionality.

**Component Structure:**

```typescript
interface CategoryTreeProps {
  categories: InventoryCategory[]
  selectedCategoryId?: string
  expandedCategoryIds: Set<string>
  onCategoryClick: (categoryId: string) => void
  onToggleExpand: (categoryId: string) => void
  onEdit: (categoryId: string) => void
  onDelete: (categoryId: string) => void
}

export function CategoryTree(props: CategoryTreeProps): JSX.Element
```

**Implementation Details:**
- Recursive rendering for nested categories
- Expand/collapse icons (▶/▼) for categories with children
- Indentation based on depth level
- Highlight selected category
- Context menu or buttons for edit/delete actions
- Disable delete button for Uncategorized category
- Show item count per category

### 4. Category Search Component

**File:** `src/components/inventory/CategorySearch.tsx` (new)

**Purpose:** Search categories with automatic ancestor/descendant inclusion.

**Component Structure:**

```typescript
interface CategorySearchProps {
  categories: InventoryCategory[]
  searchQuery: string
  onSearchChange: (query: string) => void
}

interface SearchResult {
  matchedCategories: Set<string>
  visibleCategories: Set<string> // includes ancestors and descendants
}

export function CategorySearch(props: CategorySearchProps): JSX.Element
```

**Implementation Details:**
- Real-time search as user types
- Case-insensitive matching
- Highlight matched text in category names
- Automatically expand ancestors of matched categories
- Show all descendants of matched categories
- Clear button to reset search

### 5. Enhanced Item Form

**File:** `src/components/inventory/ItemForm.tsx` (enhanced from Phase 1)

**Purpose:** Form for creating/editing items with additional fields.

**Component Structure:**

```typescript
interface ItemFormProps {
  item?: InventoryItem // undefined for create, defined for edit
  categories: InventoryCategory[]
  encyclopedias: Encyclopedia[]
  onSubmit: (item: Partial<InventoryItem>) => void
  onCancel: () => void
}

export function ItemForm(props: ItemFormProps): JSX.Element
```

**New Fields:**
- **Price** (optional): Number input, can be left empty
- **Date**: Date picker, defaults to current timestamp
- **Encyclopedia**: Dropdown of registered encyclopedias, optional selection

**Default Values:**
- Category: Uncategorized category ID
- Date: `new Date()`
- Quantity: 1
- Price: undefined (empty)
- Encyclopedia: undefined (none selected)

### 6. History Panel Component

**File:** `src/components/inventory/HistoryPanel.tsx` (new)

**Purpose:** Display quantity change and deletion history for items.

**Component Structure:**

```typescript
interface HistoryPanelProps {
  itemId?: string // undefined shows all history, defined shows item-specific
  history: HistoryRecord[]
}

export function HistoryPanel({ itemId, history }: HistoryPanelProps): JSX.Element
```

**Implementation Details:**
- Chronological list (newest first)
- Filter by item if itemId provided
- Display format: "[Date] [Item Name]: [Change Description]"
- Change descriptions:
  - Quantity change: "수량 변경: 5 → 8"
  - Deletion: "아이템 삭제 (수량: 5)"
- Pagination or infinite scroll for large histories

### 7. Category Service

**File:** `src/services/categoryService.ts` (new)

**Purpose:** Utility functions for hierarchical category operations.

**Public API:**

```typescript
// Get full path from root to category
function getCategoryPath(categoryId: string, categories: InventoryCategory[]): InventoryCategory[]

// Get all ancestor categories
function getAncestors(categoryId: string, categories: InventoryCategory[]): InventoryCategory[]

// Get all descendant categories (recursive)
function getDescendants(categoryId: string, categories: InventoryCategory[]): InventoryCategory[]

// Get direct children only
function getChildren(parentId: string | undefined, categories: InventoryCategory[]): InventoryCategory[]

// Search categories and return matches with ancestors/descendants
function searchCategories(query: string, categories: InventoryCategory[]): SearchResult

// Validate category name uniqueness under same parent
function validateCategoryName(name: string, parentId: string | undefined, categories: InventoryCategory[], excludeId?: string): boolean

// Format category path as string (e.g., "Parent > Child > Grandchild")
function formatCategoryPath(categoryId: string, categories: InventoryCategory[]): string
```

### 8. Custom React Hooks

#### useCategories Hook

**File:** `src/hooks/useCategories.ts` (new)

**Purpose:** Manage category state with localStorage persistence.

```typescript
interface UseCategoriesReturn {
  categories: InventoryCategory[]
  uncategorizedId: string
  addCategory: (name: string, parentId?: string) => void
  updateCategory: (id: string, updates: Partial<InventoryCategory>) => void
  deleteCategory: (id: string) => void
  loading: boolean
  error: string | null
}

function useCategories(): UseCategoriesReturn
```

**Implementation Details:**
- Initialize with Uncategorized category if empty
- Prevent deletion of Uncategorized category
- Handle item reassignment on category deletion
- Handle child category reassignment on parent deletion
- Debounced save to localStorage (500ms)

#### useHistory Hook

**File:** `src/hooks/useHistory.ts` (new)

**Purpose:** Manage quantity change history with localStorage persistence.

```typescript
interface UseHistoryReturn {
  history: HistoryRecord[]
  addHistoryRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void
  getItemHistory: (itemId: string) => HistoryRecord[]
  loading: boolean
  error: string | null
}

function useHistory(): UseHistoryReturn
```

**Implementation Details:**
- Auto-generate ID and timestamp for new records
- Debounced save to localStorage (500ms)
- Filter methods for item-specific history

#### Enhanced useInventory Hook

**File:** `src/hooks/useInventory.ts` (enhanced from Phase 1)

**Purpose:** Manage inventory items with enhanced fields and history integration.

**New Methods:**
```typescript
interface UseInventoryReturn {
  // ... existing Phase 1 methods ...
  updateItemQuantity: (id: string, newQuantity: number) => void // Creates history record
  deleteItem: (id: string) => void // Creates history record
}
```

**Integration:**
- Call `useHistory().addHistoryRecord()` when quantity changes
- Call `useHistory().addHistoryRecord()` when item deleted
- Assign items to Uncategorized if categoryId is null

## Data Models

### Enhanced Inventory Category

```typescript
interface InventoryCategory {
  id: string
  name: string
  parentId?: string // undefined for top-level categories
  color?: string // Optional color for UI display
  createdAt: Date
  updatedAt: Date
}
```

**Changes from Phase 1:**
- Added `parentId` field for hierarchical structure
- Made `color` optional

**Special Category:**
- Uncategorized category: `{ id: 'uncategorized', name: '미분류', parentId: undefined }`
- Cannot be deleted
- Items with null categoryId are automatically assigned to this category

### Enhanced Inventory Item

```typescript
interface InventoryItem {
  id: string
  name: string
  categoryId: string // Required, defaults to 'uncategorized'
  quantity: number
  price?: number // New: Optional purchase price
  date: Date // New: Purchase/acquisition date
  encyclopediaId?: string // New: Link to encyclopedia
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

**Changes from Phase 1:**
- Added `price` (optional)
- Added `date` (required, defaults to current timestamp)
- Added `encyclopediaId` (optional)
- Changed `categoryId` to required (defaults to 'uncategorized')

### History Record

```typescript
interface HistoryRecord {
  id: string
  itemId: string
  itemName: string // Denormalized for display after item deletion
  changeType: 'quantity_change' | 'item_deleted'
  previousQuantity: number
  newQuantity: number // 0 for deletions
  timestamp: Date
}
```

**Storage Key:** `droseal_inventory_history`

### Data Migration Schema

**Phase 1 to Phase 3 Migration:**

```typescript
interface MigrationResult {
  success: boolean
  categoriesCreated: number
  itemsMigrated: number
  errors: string[]
}

function migratePhase1ToPhase3(): MigrationResult {
  // 1. Check if Uncategorized category exists, create if not
  // 2. Load Phase 1 categories (no parentId field)
  // 3. Add parentId: undefined to all existing categories
  // 4. Load Phase 1 items
  // 5. For each item:
  //    - If categoryId is null/undefined: set to 'uncategorized'
  //    - Add price: undefined
  //    - Add date: createdAt (or current date if missing)
  //    - Add encyclopediaId: undefined
  // 6. Save migrated data with version: 2
  // 7. Return migration result
}
```

**Version Tracking:**
- Phase 1 data: version 1
- Phase 3 data: version 2
- Migration runs automatically on first Phase 3 load if version < 2

### Storage Keys

```typescript
const STORAGE_KEYS = {
  CATEGORIES: 'droseal_inventory_categories', // Enhanced with parentId
  ITEMS: 'droseal_inventory_items', // Enhanced with price, date, encyclopediaId
  HISTORY: 'droseal_inventory_history', // New
  ENCYCLOPEDIAS: 'droseal_encyclopedias', // Phase 1, unchanged
  TRANSACTIONS: 'droseal_transactions', // Phase 1, unchanged
  DATA_VERSION: 'droseal_data_version' // New: Track migration version
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

- Requirements 1.7 and 10.2 both test null categoryId assignment to Uncategorized (consolidated into Property 1)
- Requirements 4.2 and 4.3 both test item/child reassignment on deletion (consolidated into Property 5 and 6)
- Requirements 7.1 and 7.2 both occur on quantity change (consolidated into Property 11)
- Requirements 9.1, 9.2, and 9.3 all test localStorage persistence (consolidated into Property 15)
- Requirements 2.4 and 2.5 both test duplicate names at different levels (consolidated into Property 3)
- Requirements 8.2, 8.3, and 8.4 all test conditional display (consolidated into Property 13)

### Property 1: Null Category Assignment

*For any* item with null or undefined categoryId, the system SHALL assign that item to the Uncategorized category.

**Validates: Requirements 1.7, 10.2**

### Property 2: Uncategorized Category Immutability

*For any* delete operation, if the target category is the Uncategorized category, the operation SHALL be rejected.

**Validates: Requirements 1.6**

### Property 3: Duplicate Name Validation

*For any* two categories with different parentId values, they MAY have the same name; for any two categories with the same parentId value, they SHALL have different names.

**Validates: Requirements 2.4, 2.5, 2.6**

### Property 4: Category Toggle Round-Trip

*For any* category with children, clicking to expand then clicking again to collapse SHALL return the UI to its original collapsed state.

**Validates: Requirements 2.3**

### Property 5: Empty Category Deletion

*For any* category with no items and no children (excluding Uncategorized), deleting that category SHALL remove it from the category list.

**Validates: Requirements 4.1**

### Property 6: Item Reassignment on Category Deletion

*For any* category with items, deleting that category SHALL reassign all items to the Uncategorized category.

**Validates: Requirements 4.2**

### Property 7: Child Category Reassignment (With Parent)

*For any* category with children and a parent, deleting that category SHALL reassign all children to the parent category.

**Validates: Requirements 4.3**

### Property 8: Child Category Reassignment (Top-Level)

*For any* top-level category with children, deleting that category SHALL reassign all children to top-level (parentId: undefined).

**Validates: Requirements 4.4**

### Property 9: Search Ancestor Inclusion

*For any* category matching a search query, all ancestor categories SHALL be visible in the search results.

**Validates: Requirements 5.3**

### Property 10: Search Descendant Inclusion

*For any* category matching a search query, all descendant categories SHALL be visible in the search results.

**Validates: Requirements 5.4**

### Property 11: Quantity Change History Creation

*For any* item quantity change, the system SHALL create a history record containing itemId, changeType: 'quantity_change', previousQuantity, newQuantity, and timestamp.

**Validates: Requirements 7.1, 7.2, 7.5**

### Property 12: Item Deletion History Creation

*For any* item deletion, the system SHALL create a history record containing itemId, changeType: 'item_deleted', previousQuantity, newQuantity: 0, and timestamp.

**Validates: Requirements 7.3, 7.4, 7.5**

### Property 13: Enhanced Item Display

*For any* item with a price, encyclopediaId, or linked transaction, the item display SHALL include the corresponding information (price value, encyclopedia name, or verification checkmark).

**Validates: Requirements 8.2, 8.3, 8.4**

### Property 14: Category Path Display

*For any* item with a category that has ancestors, the category display SHALL show the full path in "Parent > Child" format.

**Validates: Requirements 8.1**

### Property 15: Data Persistence

*For any* category, item, or history operation (create, update, delete), the changes SHALL be saved to localStorage.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 16: Phase 1 Data Migration

*For any* Phase 1 format data in localStorage, loading the data SHALL migrate it to Phase 3 format with parentId: undefined for categories and default values for new item fields.

**Validates: Requirements 10.1, 10.3**

### Property 17: Initial Setup Category Creation

*For any* category names entered during initial setup, the system SHALL create those categories with parentId: undefined (top-level).

**Validates: Requirements 1.5**

### Property 18: Non-Uncategorized Category Deletion

*For any* category that is not the Uncategorized category, the system SHALL allow deletion of that category.

**Validates: Requirements 1.8**

### Property 19: Category Expand Display

*For any* category with children, clicking to expand SHALL display only the direct children of that category.

**Validates: Requirements 2.2**

### Property 20: Search Filtering

*For any* search query, only categories whose names contain the query string SHALL be marked as matches (plus their ancestors and descendants for visibility).

**Validates: Requirements 5.2**

### Property 21: Optional Price Field

*For any* item, the price field MAY be undefined, and the item SHALL be valid without a price value.

**Validates: Requirements 6.2**

## Error Handling

### Category Validation Errors

**Scenario:** User attempts to create duplicate category name under same parent

**Handling:**
1. Validate category name before creation
2. Display error message: "같은 위치에 동일한 이름의 카테고리가 이미 존재합니다."
3. Keep dialog open with user's input preserved
4. Highlight the name field with error styling
5. Do not create the category

**Implementation:**
```typescript
function validateCategoryName(name: string, parentId: string | undefined, categories: InventoryCategory[], excludeId?: string): boolean {
  return !categories.some(cat => 
    cat.name === name && 
    cat.parentId === parentId && 
    cat.id !== excludeId
  )
}
```

### Uncategorized Category Protection

**Scenario:** User attempts to delete or modify Uncategorized category

**Handling:**
1. Disable delete button when Uncategorized is selected
2. If delete attempted programmatically: throw error and log
3. Allow name/color changes but prevent parentId changes
4. Display tooltip on disabled delete button: "기본 카테고리는 삭제할 수 없습니다."

**Implementation:**
```typescript
function deleteCategory(id: string) {
  if (id === 'uncategorized') {
    throw new Error('Cannot delete Uncategorized category')
  }
  // ... proceed with deletion
}
```

### Migration Errors

**Scenario:** Phase 1 to Phase 3 migration fails

**Handling:**
1. Wrap migration in try-catch block
2. Create backup of original data before migration
3. If migration fails:
   - Restore backup data
   - Log detailed error information
   - Display error message: "데이터 마이그레이션에 실패했습니다. 원본 데이터가 복원되었습니다."
   - Set migration flag to prevent repeated attempts
4. Allow user to export data for manual recovery
5. Provide "재시도" button to attempt migration again

**Implementation:**
```typescript
function migratePhase1ToPhase3(): MigrationResult {
  const backup = {
    categories: loadData(STORAGE_KEYS.CATEGORIES),
    items: loadData(STORAGE_KEYS.ITEMS)
  }
  
  try {
    // ... migration logic ...
    saveData(STORAGE_KEYS.DATA_VERSION, 2)
    return { success: true, categoriesCreated, itemsMigrated, errors: [] }
  } catch (error) {
    // Restore backup
    saveData(STORAGE_KEYS.CATEGORIES, backup.categories)
    saveData(STORAGE_KEYS.ITEMS, backup.items)
    
    console.error('Migration failed:', error)
    return { 
      success: false, 
      categoriesCreated: 0, 
      itemsMigrated: 0, 
      errors: [error.message] 
    }
  }
}
```

### Circular Reference Prevention

**Scenario:** User attempts to set a category's parent to one of its descendants

**Handling:**
1. Validate parent selection before update
2. Check if selected parent is a descendant of current category
3. Display error message: "하위 카테고리를 부모로 설정할 수 없습니다."
4. Keep dialog open with error highlighted
5. Do not update the category

**Implementation:**
```typescript
function isDescendant(categoryId: string, potentialDescendantId: string, categories: InventoryCategory[]): boolean {
  const descendants = getDescendants(categoryId, categories)
  return descendants.some(cat => cat.id === potentialDescendantId)
}

function updateCategory(id: string, updates: Partial<InventoryCategory>) {
  if (updates.parentId && isDescendant(id, updates.parentId, categories)) {
    throw new Error('Cannot set descendant as parent')
  }
  // ... proceed with update
}
```

### History Storage Quota

**Scenario:** History records consume too much localStorage space

**Handling:**
1. Monitor history record count
2. If count > 1000 records:
   - Display warning: "이력 기록이 많습니다. 오래된 기록을 정리하시겠습니까?"
   - Provide "정리" button to delete records older than 90 days
3. If localStorage quota exceeded:
   - Display error with export option
   - Suggest clearing old history
4. Implement automatic cleanup option in settings

**Implementation:**
```typescript
function cleanupOldHistory(daysToKeep: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  
  const history = loadData<HistoryRecord[]>(STORAGE_KEYS.HISTORY) || []
  const filtered = history.filter(record => record.timestamp > cutoffDate)
  
  saveData(STORAGE_KEYS.HISTORY, filtered)
  return history.length - filtered.length // number of records deleted
}
```

### Encyclopedia Link Validation

**Scenario:** User selects encyclopedia that no longer exists

**Handling:**
1. Validate encyclopediaId before saving item
2. If encyclopedia not found:
   - Display warning: "선택한 도감을 찾을 수 없습니다."
   - Reset encyclopediaId to undefined
   - Allow user to select different encyclopedia or proceed without
3. On item display, check if encyclopedia exists
4. If missing, show "(삭제된 도감)" instead of name

**Implementation:**
```typescript
function validateEncyclopediaId(encyclopediaId: string | undefined, encyclopedias: Encyclopedia[]): boolean {
  if (!encyclopediaId) return true
  return encyclopedias.some(enc => enc.id === encyclopediaId)
}
```

### Transaction Link Verification

**Scenario:** Display verification checkmark for items linked to transactions

**Handling:**
1. Check if item has price field
2. Search transactions for matching item ID
3. If transaction found with matching price:
   - Display checkmark icon next to price
   - Show tooltip: "거래로 인증됨"
4. If transaction found with different price:
   - Display warning icon
   - Show tooltip: "거래 가격과 일치하지 않음"
5. If no transaction found:
   - No icon displayed

**Implementation:**
```typescript
function getTransactionVerification(item: InventoryItem, transactions: Transaction[]): 'verified' | 'mismatch' | 'none' {
  if (!item.price) return 'none'
  
  const linkedTransaction = transactions.find(t => t.linkedInventoryItemId === item.id)
  if (!linkedTransaction) return 'none'
  
  return linkedTransaction.amount === item.price ? 'verified' : 'mismatch'
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific UI examples (Initial setup modal, category tree rendering)
- Edge cases (Uncategorized category protection, circular reference prevention)
- Error conditions (Migration failures, validation errors)
- Integration points (Hook interactions, localStorage operations)

**Property-Based Tests** focus on:
- Universal properties across all categories and items
- Hierarchical operations (ancestor/descendant calculations)
- Data migration for any Phase 1 data structure
- History tracking for any quantity change
- Search filtering with any query string

### Property-Based Testing Configuration

**Library:** Use `fast-check` for TypeScript property-based testing (already configured in Phase 1)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with comment referencing design property
- Tag format: `// Feature: droseal-phase3-inventory-enhancement, Property {number}: {property_text}`

**Custom Generators:**

```typescript
// Generate random category with optional parent
const categoryArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  parentId: fc.option(fc.uuid(), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date()
})

// Generate random item with enhanced fields
const itemArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  categoryId: fc.uuid(),
  quantity: fc.integer({ min: 0, max: 1000 }),
  price: fc.option(fc.float({ min: 0, max: 1000000 }), { nil: undefined }),
  date: fc.date(),
  encyclopediaId: fc.option(fc.uuid(), { nil: undefined }),
  notes: fc.string(),
  createdAt: fc.date(),
  updatedAt: fc.date()
})

// Generate random history record
const historyArb = fc.record({
  id: fc.uuid(),
  itemId: fc.uuid(),
  itemName: fc.string(),
  changeType: fc.constantFrom('quantity_change', 'item_deleted'),
  previousQuantity: fc.integer({ min: 0, max: 1000 }),
  newQuantity: fc.integer({ min: 0, max: 1000 }),
  timestamp: fc.date()
})

// Generate hierarchical category tree
const categoryTreeArb = fc.array(categoryArb, { minLength: 1, maxLength: 20 })
  .map(categories => {
    // Ensure valid parent references
    const validCategories = categories.map((cat, idx) => ({
      ...cat,
      parentId: idx > 0 && Math.random() > 0.5 
        ? categories[Math.floor(Math.random() * idx)].id 
        : undefined
    }))
    return validCategories
  })
```

**Example Property Tests:**

```typescript
// Feature: droseal-phase3-inventory-enhancement, Property 1: Null Category Assignment
describe('Null Category Assignment', () => {
  it('should assign items with null categoryId to Uncategorized', () => {
    fc.assert(
      fc.property(
        itemArb.map(item => ({ ...item, categoryId: null })),
        (item) => {
          const processed = processItem(item, uncategorizedId)
          expect(processed.categoryId).toBe(uncategorizedId)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-phase3-inventory-enhancement, Property 9: Search Ancestor Inclusion
describe('Search Ancestor Inclusion', () => {
  it('should include all ancestors of matched categories in search results', () => {
    fc.assert(
      fc.property(
        categoryTreeArb,
        fc.string({ minLength: 1 }),
        (categories, query) => {
          const result = searchCategories(query, categories)
          
          result.matchedCategories.forEach(matchedId => {
            const ancestors = getAncestors(matchedId, categories)
            ancestors.forEach(ancestor => {
              expect(result.visibleCategories).toContain(ancestor.id)
            })
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-phase3-inventory-enhancement, Property 11: Quantity Change History Creation
describe('Quantity Change History Creation', () => {
  it('should create history record for any quantity change', () => {
    fc.assert(
      fc.property(
        itemArb,
        fc.integer({ min: 0, max: 1000 }),
        (item, newQuantity) => {
          const history: HistoryRecord[] = []
          updateItemQuantity(item, newQuantity, history)
          
          expect(history).toHaveLength(1)
          expect(history[0].itemId).toBe(item.id)
          expect(history[0].changeType).toBe('quantity_change')
          expect(history[0].previousQuantity).toBe(item.quantity)
          expect(history[0].newQuantity).toBe(newQuantity)
          expect(history[0].timestamp).toBeInstanceOf(Date)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Unit Test Examples

**Initial Setup Modal Tests:**
```typescript
describe('InitialSetupModal', () => {
  it('should display collection style options', () => {
    render(<InitialSetupModal isOpen={true} onComplete={vi.fn()} />)
    expect(screen.getByText(/아이템 종류별로 모으기/)).toBeInTheDocument()
    expect(screen.getByText(/작품\/컨텐츠별로 모으기/)).toBeInTheDocument()
  })
  
  it('should create top-level categories on completion', () => {
    const onComplete = vi.fn()
    render(<InitialSetupModal isOpen={true} onComplete={onComplete} />)
    
    // Select option and enter categories
    fireEvent.click(screen.getByText(/아이템 종류별로 모으기/))
    fireEvent.change(screen.getByPlaceholderText(/카테고리 이름/), { target: { value: '씰' } })
    fireEvent.click(screen.getByText(/완료/))
    
    expect(onComplete).toHaveBeenCalledWith(['씰'])
  })
})
```

**Category Tree Tests:**
```typescript
describe('CategoryTree', () => {
  it('should disable delete button for Uncategorized category', () => {
    const categories = [{ id: 'uncategorized', name: '미분류', parentId: undefined }]
    render(<CategoryTree categories={categories} selectedCategoryId="uncategorized" />)
    
    const deleteButton = screen.getByRole('button', { name: /삭제/ })
    expect(deleteButton).toBeDisabled()
  })
  
  it('should expand and collapse categories on click', () => {
    const categories = [
      { id: '1', name: 'Parent', parentId: undefined },
      { id: '2', name: 'Child', parentId: '1' }
    ]
    const onToggle = vi.fn()
    render(<CategoryTree categories={categories} onToggleExpand={onToggle} />)
    
    fireEvent.click(screen.getByText('Parent'))
    expect(onToggle).toHaveBeenCalledWith('1')
  })
})
```

**Migration Tests:**
```typescript
describe('Phase 1 to Phase 3 Migration', () => {
  it('should add parentId to Phase 1 categories', () => {
    const phase1Categories = [
      { id: '1', name: 'Category 1', color: 'blue' }
    ]
    localStorage.setItem('droseal_inventory_categories', JSON.stringify({ version: 1, data: phase1Categories }))
    
    const result = migratePhase1ToPhase3()
    
    expect(result.success).toBe(true)
    const migrated = loadData<InventoryCategory[]>('droseal_inventory_categories')
    expect(migrated[0].parentId).toBeUndefined()
  })
  
  it('should assign null categoryId items to Uncategorized', () => {
    const phase1Items = [
      { id: '1', name: 'Item 1', categoryId: null, quantity: 5 }
    ]
    localStorage.setItem('droseal_inventory_items', JSON.stringify({ version: 1, data: phase1Items }))
    
    const result = migratePhase1ToPhase3()
    
    const migrated = loadData<InventoryItem[]>('droseal_inventory_items')
    expect(migrated[0].categoryId).toBe('uncategorized')
  })
})
```

### Test Coverage Goals

- **Unit Test Coverage:** >80% line coverage for all new code
- **Property Test Coverage:** All 21 correctness properties implemented
- **Integration Tests:** Key user flows (initial setup, category management, item creation with history)
- **Accessibility Tests:** Modal keyboard navigation, tree view ARIA labels, form field labels

### Testing Tools

- **Test Runner:** Vitest (configured in Phase 1)
- **React Testing:** @testing-library/react
- **Property Testing:** fast-check
- **Accessibility:** @testing-library/jest-dom, axe-core
- **Mocking:** vi.mock for localStorage and hooks
