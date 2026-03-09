# Requirements Document

## Introduction

This document specifies the requirements for Phase 3 Additional Features in the DroSeal inventory system. These features enhance the user experience by providing intuitive drag-and-drop functionality, efficient bulk operations, powerful search capabilities, and improved visual feedback. All features build upon the Phase 3 core infrastructure (hierarchical categories, history tracking, enhanced item data).

## Glossary

- **Drag_Handle**: The visual icon (≡) that users can grab to drag an item
- **Drag_Overlay**: The visual feedback element that follows the cursor during a drag operation
- **Bulk_Selection**: The set of items currently selected via checkboxes
- **Bulk_Actions_Panel**: The UI panel that appears when items are selected, offering bulk operations
- **Item_Search_Modal**: A modal dialog for filtering items with advanced criteria
- **History_Search_Modal**: A modal dialog for filtering history records with advanced criteria
- **Pagination_Controls**: UI elements for navigating between pages of items
- **Image_Edit_Modal**: A modal dialog for updating an item's image URL
- **Transaction_Verification**: The process of comparing item prices with linked transaction amounts
- **Verification_Status**: The result of price comparison (match, higher, lower, or none)
- **Filter_State**: The current set of active search/filter criteria
- **Date_Range**: A start and end date for filtering records

## Requirements

### Requirement 1: Drag-and-Drop Category Assignment

**User Story:** As a user, I want to drag items to categories, so that I can quickly reorganize my inventory without opening edit dialogs.

#### Acceptance Criteria

1. THE System SHALL display a Drag_Handle icon (≡) to the left of each item's checkbox
2. WHEN the user hovers over the Drag_Handle, THE System SHALL change the cursor to indicate draggability
3. WHEN the user drags an item by the Drag_Handle, THE System SHALL display a Drag_Overlay showing the item name
4. WHEN the user drags over a category in the category tree, THE System SHALL highlight that category as a drop target
5. WHEN the user drops an item on a category, THE System SHALL update the item's categoryId to the target category
6. WHEN the user drops an item outside a valid drop zone, THE System SHALL return the item to its original position
7. THE System SHALL create a history record when an item's category is changed via drag-and-drop

### Requirement 2: Multi-Item Drag

**User Story:** As a user, I want to drag multiple selected items at once, so that I can efficiently reorganize many items simultaneously.

#### Acceptance Criteria

1. WHEN the user drags a selected item, THE System SHALL move all items in the Bulk_Selection
2. WHEN dragging multiple items, THE Drag_Overlay SHALL display "N개 이동 중" where N is the count of selected items
3. WHEN the user drops multiple items on a category, THE System SHALL update all selected items' categoryId
4. THE System SHALL create history records for each item moved via multi-item drag
5. WHEN the user drags an unselected item, THE System SHALL select only that item and drag it alone

### Requirement 3: Bulk Selection

**User Story:** As a user, I want to select multiple items with checkboxes, so that I can perform actions on many items at once.

#### Acceptance Criteria

1. THE System SHALL display a checkbox to the right of the Drag_Handle for each item
2. WHEN the user clicks an item's checkbox, THE System SHALL toggle that item's selection state
3. WHEN the user Shift+clicks a checkbox, THE System SHALL select all items between the last selected item and the current item
4. THE System SHALL display a "select all" checkbox in the table header
5. WHEN the user clicks "select all", THE System SHALL toggle selection for all visible items on the current page
6. WHEN some but not all visible items are selected, THE "select all" checkbox SHALL display an indeterminate state
7. THE Bulk_Selection SHALL persist when the user navigates between pages

### Requirement 4: Bulk Actions Panel

**User Story:** As a user, I want a panel with bulk actions, so that I can easily perform operations on selected items.

#### Acceptance Criteria

1. WHEN items are selected, THE System SHALL display the Bulk_Actions_Panel
2. THE Bulk_Actions_Panel SHALL show the count of selected items (e.g., "5개 선택됨")
3. THE Bulk_Actions_Panel SHALL provide buttons for: 카테고리 변경, 일괄 수정, 삭제
4. WHEN no items are selected, THE System SHALL hide the Bulk_Actions_Panel

### Requirement 5: Bulk Category Change

**User Story:** As a user, I want to change the category of multiple items at once, so that I can reorganize my inventory efficiently.

#### Acceptance Criteria

1. WHEN the user clicks "카테고리 변경" in the Bulk_Actions_Panel, THE System SHALL display a modal with a hierarchical category tree
2. WHEN the user clicks a category in the tree, THE System SHALL update all selected items' categoryId to that category
3. THE System SHALL create history records for each item whose category was changed
4. THE System SHALL clear the Bulk_Selection after the category change
5. THE System SHALL close the modal after the category change

### Requirement 6: Bulk Edit

**User Story:** As a user, I want to edit quantity, price, or encyclopedia for multiple items at once, so that I can update common properties efficiently.

#### Acceptance Criteria

1. WHEN the user clicks "일괄 수정" in the Bulk_Actions_Panel, THE System SHALL display a bulk edit modal
2. THE bulk edit modal SHALL provide input fields for: quantity, price, encyclopedia
3. THE System SHALL allow any field to be left empty (meaning no change for that field)
4. WHEN the user submits the bulk edit form, THE System SHALL update only the non-empty fields for all selected items
5. THE System SHALL create history records for items whose quantity or price was changed
6. THE System SHALL clear the Bulk_Selection after the bulk edit
7. THE System SHALL close the modal after the bulk edit

### Requirement 7: Bulk Delete

**User Story:** As a user, I want to delete multiple items at once, so that I can quickly remove unwanted items from my inventory.

#### Acceptance Criteria

1. WHEN the user clicks "삭제" in the Bulk_Actions_Panel, THE System SHALL display a confirmation dialog
2. THE confirmation dialog SHALL show the count of items to be deleted (e.g., "5개의 아이템을 삭제하시겠습니까?")
3. WHEN the user confirms, THE System SHALL delete all selected items
4. THE System SHALL create history records for each deleted item
5. THE System SHALL clear the Bulk_Selection after deletion

### Requirement 8: Advanced Item Search

**User Story:** As a user, I want to search and filter items with multiple criteria, so that I can quickly find specific items in my inventory.

#### Acceptance Criteria

1. THE System SHALL provide an "아이템 검색" button that opens the Item_Search_Modal
2. THE Item_Search_Modal SHALL provide a text search field with field selector (name, notes, encyclopedia)
3. THE Item_Search_Modal SHALL provide a category filter with hierarchical tree
4. THE Item_Search_Modal SHALL provide a verification status filter (all, none, verified, mismatch)
5. THE Item_Search_Modal SHALL provide quantity filter with operator (>=, =, <=) and value
6. THE Item_Search_Modal SHALL provide price filter with operator (>=, =, <=) and value
7. THE Item_Search_Modal SHALL provide date range filters (from, to) supporting YYYY, YYYY-MM, YYYY-MM-DD formats
8. WHEN the user changes any filter, THE System SHALL immediately update the displayed items
9. WHEN the user clears filters, THE System SHALL show all items
10. WHEN filters are active, THE System SHALL reset to page 1

### Requirement 9: Date Range Parsing

**User Story:** As a user, I want to filter by year, month, or specific date, so that I can find items from different time periods flexibly.

#### Acceptance Criteria

1. WHEN the user enters a year (YYYY), THE System SHALL filter items from January 1 to December 31 of that year
2. WHEN the user enters a year-month (YYYY-MM), THE System SHALL filter items from the 1st to the last day of that month
3. WHEN the user enters a full date (YYYY-MM-DD), THE System SHALL filter items from that specific day
4. THE System SHALL support date ranges with different granularities (e.g., from 2024 to 2024-06-15)

### Requirement 10: Advanced History Search

**User Story:** As a user, I want to search and filter history records, so that I can track specific changes to my inventory over time.

#### Acceptance Criteria

1. THE System SHALL provide a "이력 검색" button that opens the History_Search_Modal
2. THE History_Search_Modal SHALL provide a change type filter with checkboxes (quantity_change, price_change, category_change, notes_change, item_deleted)
3. THE History_Search_Modal SHALL provide a text search field with field selector (itemName, notes)
4. THE History_Search_Modal SHALL provide quantity filter (only applies to quantity_change records)
5. THE History_Search_Modal SHALL provide price filter (only applies to price_change records)
6. THE History_Search_Modal SHALL provide date range filters
7. WHEN the user changes any filter, THE System SHALL immediately update the displayed history records
8. WHEN the user clears filters, THE System SHALL show all history records

### Requirement 11: Pagination

**User Story:** As a user, I want items displayed in pages, so that the interface remains responsive even with many items.

#### Acceptance Criteria

1. THE System SHALL display 20 items per page
2. THE System SHALL provide pagination controls showing: Previous, page numbers, Next
3. THE System SHALL highlight the current page number
4. THE System SHALL disable Previous button on page 1
5. THE System SHALL disable Next button on the last page
6. WHEN the user clicks a page number, THE System SHALL navigate to that page
7. WHEN filters change, THE System SHALL reset to page 1
8. WHEN the user changes category selection, THE System SHALL reset to page 1
9. THE Bulk_Selection SHALL persist across page navigation

### Requirement 12: Image Edit Modal

**User Story:** As a user, I want to update an item's image easily, so that I can keep my inventory visually organized.

#### Acceptance Criteria

1. WHEN the user clicks an item's image in the table, THE System SHALL open the Image_Edit_Modal
2. THE Image_Edit_Modal SHALL display the current image or a placeholder if none exists
3. THE Image_Edit_Modal SHALL provide a URL input field for entering a new image URL
4. THE Image_Edit_Modal SHALL provide a "이미지 제거" button to remove the image
5. WHEN the user saves, THE System SHALL update the item's imageUrl field
6. WHEN the user removes the image, THE System SHALL set imageUrl to undefined
7. THE System SHALL close the modal after saving

### Requirement 13: Transaction Verification Display

**User Story:** As a user, I want to see if my item prices match transaction records, so that I can ensure my inventory and accounting data are consistent.

#### Acceptance Criteria

1. WHEN an item has a linked transaction, THE System SHALL display a checkmark (✓) in the "증빙" column
2. WHEN the item price matches the transaction amount, THE checkmark SHALL be green
3. WHEN the item price is higher than the transaction amount, THE checkmark SHALL be red
4. WHEN the item price is lower than the transaction amount, THE checkmark SHALL be blue
5. WHEN the user hovers over the checkmark, THE System SHALL display a tooltip with price comparison details
6. WHEN the user clicks the checkmark, THE System SHALL open a transaction detail modal

### Requirement 14: Verification Status Calculation

**User Story:** As a system, I need to accurately compare item prices with transaction amounts, so that users can trust the verification indicators.

#### Acceptance Criteria

1. WHEN an item has no price, THE Verification_Status SHALL be "none"
2. WHEN an item has no linked transaction, THE Verification_Status SHALL be "none"
3. WHEN the item price equals the transaction amount, THE Verification_Status SHALL be "match"
4. WHEN the item price is greater than the transaction amount, THE Verification_Status SHALL be "higher"
5. WHEN the item price is less than the transaction amount, THE Verification_Status SHALL be "lower"

### Requirement 15: Accessibility

**User Story:** As a user with accessibility needs, I want all features to be keyboard-navigable and screen-reader friendly, so that I can use the inventory system effectively.

#### Acceptance Criteria

1. THE Drag_Handle SHALL have an aria-label "드래그하여 카테고리 이동"
2. THE System SHALL support keyboard-based drag-and-drop via @dnd-kit
3. ALL modals SHALL be closable with the Escape key
4. ALL modals SHALL trap focus within the modal while open
5. ALL checkboxes SHALL have aria-labels including the item name
6. ALL status indicators SHALL have aria-labels describing the status
7. ALL interactive elements SHALL have visible focus indicators

### Requirement 16: Performance

**User Story:** As a user, I want the interface to remain responsive, so that I can work efficiently even with large inventories.

#### Acceptance Criteria

1. THE System SHALL render pagination controls in less than 100ms
2. THE System SHALL apply filters in less than 200ms for up to 1000 items
3. THE System SHALL use React.memo to prevent unnecessary re-renders of category tree
4. THE System SHALL use useMemo for filtered and paginated item calculations
5. THE System SHALL debounce localStorage saves to 500ms to prevent excessive writes

### Requirement 17: Error Handling

**User Story:** As a user, I want clear feedback when operations fail, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. WHEN a drag operation fails, THE System SHALL return the item to its original position without error messages
2. WHEN bulk operations encounter errors, THE System SHALL display which items failed and why
3. WHEN search filters produce no results, THE System SHALL display "검색 결과가 없습니다"
4. WHEN invalid date formats are entered, THE System SHALL ignore them without error messages
5. WHEN invalid numbers are entered in quantity/price filters, THE System SHALL ignore them without error messages

## Correctness Properties

### Property 1: Selection Consistency
**For all items i in Bulk_Selection, i must exist in the current filtered item list OR in a different page of the filtered results**

### Property 2: Drag-Drop Category Update
**When item i is dropped on category c, item i's categoryId must equal c after the operation completes**

### Property 3: Multi-Item Drag Atomicity
**When dragging N selected items to category c, either all N items' categoryId equals c, or none do (no partial updates)**

### Property 4: Filter Idempotence
**Applying the same Filter_State twice must produce the same filtered results**

### Property 5: Pagination Boundary
**The last page must contain between 1 and ITEMS_PER_PAGE items (inclusive)**

### Property 6: Date Range Inclusivity
**An item with date d is included in results if dateFrom <= d <= dateTo (inclusive on both ends)**

### Property 7: Bulk Edit Partial Update
**When bulk editing with some fields empty, only non-empty fields are updated; empty fields remain unchanged**

### Property 8: History Record Creation
**Every state-changing operation (drag-drop, bulk edit, bulk delete) must create corresponding history records**

### Property 9: Verification Status Determinism
**For a given item price and transaction amount, the Verification_Status must always be the same**

### Property 10: Selection Persistence
**Bulk_Selection must remain unchanged when navigating between pages (unless explicitly cleared)**
