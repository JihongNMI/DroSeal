# Implementation Plan: DroSeal Phase 3 Inventory Enhancement

## Overview

This implementation plan builds upon Phase 1 infrastructure to add hierarchical category management, enhanced item tracking, and history functionality. The implementation uses TypeScript with React and follows an incremental approach where each task validates functionality through code before proceeding.

## Tasks

- [x] 1. Update data models and create migration logic
  - [x] 1.1 Enhance InventoryCategory interface with parentId field
    - Update interface in types file to add optional parentId field
    - Ensure backward compatibility with Phase 1 categories
    - _Requirements: 2.1_
  
  - [x] 1.2 Enhance InventoryItem interface with new fields
    - Add optional price field (number)
    - Add required date field (Date, defaults to current timestamp)
    - Add optional encyclopediaId field (string)
    - Make categoryId required (defaults to 'uncategorized')
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 1.3 Create HistoryRecord interface
    - Define interface with id, itemId, itemName, changeType, previousQuantity, newQuantity, timestamp
    - Add type definition for changeType: 'quantity_change' | 'item_deleted'
    - _Requirements: 7.5_
  
  - [x] 1.4 Implement Phase 1 to Phase 3 data migration
    - Create migratePhase1ToPhase3 function in localStorage service
    - Add parentId: undefined to existing categories
    - Assign null categoryId items to 'uncategorized'
    - Add default values for new item fields (price: undefined, date: createdAt or now, encyclopediaId: undefined)
    - Create backup before migration and restore on failure
    - Track migration version in localStorage
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 1.5 Write property test for Phase 1 data migration
    - **Property 16: Phase 1 Data Migration**
    - **Validates: Requirements 10.1, 10.3**

- [x] 2. Create category service utilities
  - [x] 2.1 Implement category hierarchy utility functions
    - Create getCategoryPath function (returns array from root to category)
    - Create getAncestors function (returns all ancestor categories)
    - Create getDescendants function (returns all descendant categories recursively)
    - Create getChildren function (returns direct children only)
    - Create formatCategoryPath function (returns "Parent > Child" string)
    - _Requirements: 2.1, 2.2, 8.1_
  
  - [x] 2.2 Implement category validation functions
    - Create validateCategoryName function (checks duplicate names under same parent)
    - Create isDescendant function (prevents circular references)
    - _Requirements: 2.6, 3.5_
  
  - [x] 2.3 Implement category search function
    - Create searchCategories function with query parameter
    - Return matched categories plus ancestors and descendants
    - Case-insensitive matching
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ]* 2.4 Write property tests for category service
    - **Property 9: Search Ancestor Inclusion**
    - **Property 10: Search Descendant Inclusion**
    - **Validates: Requirements 5.3, 5.4**

- [x] 3. Implement useCategories hook
  - [x] 3.1 Create useCategories hook with state management
    - Initialize with Uncategorized category if empty
    - Implement addCategory function with validation
    - Implement updateCategory function with circular reference check
    - Implement deleteCategory function with item/child reassignment
    - Load/save to localStorage with debouncing (500ms)
    - _Requirements: 1.1, 1.6, 1.8, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 9.1_
  
  - [ ]* 3.2 Write property tests for useCategories
    - **Property 1: Null Category Assignment**
    - **Property 2: Uncategorized Category Immutability**
    - **Property 3: Duplicate Name Validation**
    - **Property 5: Empty Category Deletion**
    - **Property 6: Item Reassignment on Category Deletion**
    - **Property 7: Child Category Reassignment (With Parent)**
    - **Property 8: Child Category Reassignment (Top-Level)**
    - **Property 18: Non-Uncategorized Category Deletion**
    - **Validates: Requirements 1.6, 1.7, 1.8, 2.4, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 10.2**
  
  - [ ]* 3.3 Write unit tests for useCategories edge cases
    - Test Uncategorized category protection
    - Test circular reference prevention
    - Test validation error messages
    - _Requirements: 1.6, 3.6_

- [x] 4. Implement useHistory hook
  - [x] 4.1 Create useHistory hook with state management
    - Implement addHistoryRecord function with auto-generated id and timestamp
    - Implement getItemHistory function for filtering
    - Load/save to localStorage with debouncing (500ms)
    - _Requirements: 7.2, 7.4, 7.5, 9.3_
  
  - [ ]* 4.2 Write property tests for useHistory
    - **Property 11: Quantity Change History Creation**
    - **Property 12: Item Deletion History Creation**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [x] 5. Enhance useInventory hook
  - [x] 5.1 Update useInventory hook with history integration
    - Modify addItem to support new fields (price, date, encyclopediaId)
    - Modify updateItem to support new fields
    - Create updateItemQuantity function that creates history record
    - Modify deleteItem to create history record with itemName
    - Ensure categoryId defaults to 'uncategorized' if null
    - _Requirements: 6.1, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 9.2_
  
  - [ ]* 5.2 Write property tests for enhanced useInventory
    - **Property 15: Data Persistence**
    - **Property 21: Optional Price Field**
    - **Validates: Requirements 6.2, 9.1, 9.2, 9.3**

- [x] 6. Checkpoint - Ensure all hooks and services pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create InitialSetupModal component
  - [x] 7.1 Implement InitialSetupModal with two-step wizard
    - Create modal component with isOpen and onComplete props
    - Step 1: Display two collection style options with examples
    - Step 2: Dynamic category name input fields with add/remove buttons
    - Validate non-empty category names
    - Call onComplete with array of category names
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 7.2 Write unit tests for InitialSetupModal
    - Test collection style option display
    - Test category name input validation
    - Test onComplete callback with entered categories
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 7.3 Write property test for initial setup
    - **Property 17: Initial Setup Category Creation**
    - **Validates: Requirements 1.5**

- [x] 8. Create CategoryTree component
  - [x] 8.1 Implement CategoryTree with recursive rendering
    - Display categories with expand/collapse icons (▶/▼)
    - Implement indentation based on depth level
    - Highlight selected category
    - Show item count per category
    - Provide edit/delete buttons (disable delete for Uncategorized)
    - Handle onCategoryClick, onToggleExpand, onEdit, onDelete callbacks
    - _Requirements: 2.2, 2.3, 3.4, 3.6_
  
  - [ ]* 8.2 Write unit tests for CategoryTree
    - Test expand/collapse functionality
    - Test Uncategorized delete button disabled
    - Test recursive rendering of nested categories
    - _Requirements: 2.2, 2.3, 3.6_
  
  - [ ]* 8.3 Write property test for category toggle
    - **Property 4: Category Toggle Round-Trip**
    - **Property 19: Category Expand Display**
    - **Validates: Requirements 2.2, 2.3**

- [x] 9. Create CategorySearch component
  - [x] 9.1 Implement CategorySearch with real-time filtering
    - Create search input field with onChange handler
    - Use searchCategories utility to get matched and visible categories
    - Highlight matched text in category names
    - Provide clear button to reset search
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 9.2 Write unit tests for CategorySearch
    - Test search filtering
    - Test clear button functionality
    - Test case-insensitive matching
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ]* 9.3 Write property test for search filtering
    - **Property 20: Search Filtering**
    - **Validates: Requirements 5.2**

- [x] 10. Enhance ItemForm component
  - [x] 10.1 Update ItemForm with new fields
    - Add price input field (optional, number type)
    - Add date picker field (defaults to current date)
    - Add encyclopedia dropdown (populated from useEncyclopedias)
    - Set category dropdown default to Uncategorized
    - Support both create and edit modes
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 10.2 Write unit tests for enhanced ItemForm
    - Test default values (category: uncategorized, date: now, quantity: 1)
    - Test optional price field
    - Test encyclopedia dropdown population
    - Test form submission with all fields
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Create HistoryPanel component
  - [x] 11.1 Implement HistoryPanel with chronological display
    - Display history records in reverse chronological order (newest first)
    - Filter by itemId if provided, otherwise show all
    - Format display: "[Date] [Item Name]: [Change Description]"
    - Show "수량 변경: X → Y" for quantity changes
    - Show "아이템 삭제 (수량: X)" for deletions
    - Implement pagination or infinite scroll for large histories
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 11.2 Write unit tests for HistoryPanel
    - Test chronological ordering
    - Test item-specific filtering
    - Test change description formatting
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 12. Create enhanced item display utilities
  - [x] 12.1 Implement item display helper functions
    - Create getTransactionVerification function (checks if item price matches transaction)
    - Create formatCategoryPath wrapper for item display
    - Create getEncyclopediaName function (returns encyclopedia name or undefined)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 12.2 Write property test for enhanced item display
    - **Property 13: Enhanced Item Display**
    - **Property 14: Category Path Display**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 13. Checkpoint - Ensure all components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Integrate components into Inventory page
  - [x] 14.1 Update Inventory page with initial setup flow
    - Detect first-time user (no categories exist)
    - Show InitialSetupModal on first visit
    - Create Uncategorized category automatically
    - Create user-entered categories on modal completion
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 14.2 Add category management UI to Inventory page
    - Add "카테고리 추가" button in header
    - Integrate CategoryTree component with expand/collapse state
    - Integrate CategorySearch component
    - Handle category selection, edit, and delete actions
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 14.3 Update item management UI with enhanced features
    - Replace existing ItemForm with enhanced version
    - Update item list display to show category path, price, encyclopedia
    - Add transaction verification checkmark with tooltip
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 14.4 Add history display to Inventory page
    - Integrate HistoryPanel component
    - Add toggle to show/hide history panel
    - Support both all-history and item-specific views
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 14.5 Write integration tests for Inventory page
    - Test initial setup flow
    - Test category creation and deletion with item reassignment
    - Test item creation with history tracking
    - Test search and filter functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.2, 7.1, 7.2, 7.3, 7.4_

- [x] 15. Implement error handling and validation
  - [x] 15.1 Add error handling for category operations
    - Display error message for duplicate category names
    - Prevent circular reference in parent selection
    - Show tooltip on disabled Uncategorized delete button
    - Handle migration failures with backup restoration
    - _Requirements: 2.6, 3.5, 3.6, 10.5_
  
  - [x] 15.2 Add error handling for storage operations
    - Display error message on localStorage save failure
    - Implement quota exceeded handling with cleanup option
    - Validate encyclopedia link before saving item
    - _Requirements: 9.5_
  
  - [ ]* 15.3 Write unit tests for error handling
    - Test duplicate name validation error
    - Test circular reference prevention error
    - Test migration failure and backup restoration
    - Test localStorage quota exceeded handling
    - _Requirements: 2.6, 9.5, 10.5_

- [x] 16. Final checkpoint - Ensure all tests pass and features work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- All code uses TypeScript with React hooks and localStorage for persistence
- Migration logic ensures backward compatibility with Phase 1 data
