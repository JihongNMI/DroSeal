# Implementation Plan: DroSeal Phase 1 Infrastructure

## Overview

This implementation plan establishes core infrastructure for the DroSeal React application, adding global navigation and persistent data storage. The plan follows a logical progression: infrastructure setup, storage layer, state management hooks, UI components, and integration. Each task builds incrementally to ensure the application remains functional throughout development.

## Tasks

- [x] 1. Set up project structure and type definitions
  - Create directory structure: `src/services/`, `src/hooks/`, `src/components/`
  - Define TypeScript interfaces for all data models (Encyclopedia, Inventory, Accounting, Profile)
  - Define storage-related types (StorageSchema, StorageKeys, StorageQuotaInfo)
  - Create constants file for storage keys
  - _Requirements: 4.1-4.6, 10.7_

- [ ] 2. Implement localStorage service core functionality
  - [x] 2.1 Create localStorage service with availability detection
    - Implement `isLocalStorageAvailable()` function
    - Set up memory storage fallback using Map
    - Implement `getItem()` and `setItem()` wrapper functions
    - _Requirements: 9.1, 9.2_
  
  - [x] 2.2 Implement data serialization and deserialization
    - Create `serialize()` function with Date to ISO string conversion
    - Create `deserialize()` function with ISO string to Date conversion
    - Handle undefined to null conversion during serialization
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 2.3 Write property test for date serialization round-trip
    - **Property 13: Date Serialization Round-Trip**
    - **Validates: Requirements 13.1, 13.2, 13.4**
  
  - [ ]* 2.4 Write property test for undefined to null conversion
    - **Property 14: Undefined to Null Conversion**
    - **Validates: Requirements 13.3**
  
  - [x] 2.5 Implement core storage operations
    - Implement `saveData<T>(key: string, data: T): void`
    - Implement `loadData<T>(key: string): T | null`
    - Implement `clearData(key: string): void`
    - Implement `clearAllData(): void`
    - Wrap data with schema version on save
    - _Requirements: 4.7, 4.8, 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 2.6 Write property tests for storage operations
    - **Property 2: Storage Key Consistency**
    - **Property 3: Schema Version Inclusion**
    - **Property 4: JSON Serialization Format**
    - **Property 8: Clear Data Removal**
    - **Validates: Requirements 4.1-4.8, 10.3**

- [ ] 3. Checkpoint - Verify storage service functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement error handling and quota management
  - [ ] 4.1 Add error handling for corrupted data
    - Wrap JSON parse in try-catch
    - Log errors and return default values
    - Display warning message for corrupted data
    - _Requirements: 6.3, 9.4_
  
  - [ ] 4.2 Add quota exceeded error handling
    - Catch QuotaExceededError in saveData
    - Display error message with export recommendation
    - Prevent data loss by not overwriting on error
    - _Requirements: 7.4, 9.3_
  
  - [ ] 4.3 Implement storage quota monitoring
    - Create `getStorageQuota(): StorageQuotaInfo` function
    - Calculate used storage across all droseal_ keys
    - Return usage percentage
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 4.4 Write unit tests for error handling
    - Test corrupted JSON handling
    - Test quota exceeded scenarios
    - Test localStorage unavailable fallback
    - _Requirements: 6.3, 7.4, 9.1, 9.2, 9.3, 9.4_

- [ ] 5. Implement data versioning and migration
  - [ ] 5.1 Add schema versioning support
    - Store version number with each data structure
    - Initialize new data with version 1
    - _Requirements: 8.1, 8.4_
  
  - [ ] 5.2 Implement data migration function
    - Create `migrateData(key: string, oldVersion: number, newVersion: number): void`
    - Check version on load and trigger migration if needed
    - Wrap migration in try-catch with error handling
    - _Requirements: 8.2, 8.3_
  
  - [ ]* 5.3 Write property test for data migration preservation
    - **Property 7: Data Migration Preservation**
    - **Validates: Requirements 8.2, 8.3**

- [ ] 6. Implement import/export functionality
  - [ ] 6.1 Create export data function
    - Implement `exportData(): string` to collect all app data
    - Generate JSON string with all storage keys
    - _Requirements: 7.3, 10.5, 12.1_
  
  - [ ] 6.2 Create import data function
    - Implement `importData(jsonString: string): void`
    - Validate JSON structure before applying
    - Display error for invalid structure
    - Save imported data to localStorage
    - _Requirements: 10.6, 12.2, 12.4, 12.5, 12.6_
  
  - [ ]* 6.3 Write property test for import/export round-trip
    - **Property 9: Import Data Restoration**
    - **Property 12: Import Validation**
    - **Validates: Requirements 10.6, 12.4, 12.6**
  
  - [ ]* 6.4 Write unit tests for export/import edge cases
    - Test export with empty data
    - Test import with invalid JSON
    - Test import with missing fields
    - _Requirements: 12.4, 12.5_

- [ ] 7. Checkpoint - Verify storage service is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement custom React hooks for data management
  - [x] 8.1 Create useEncyclopedias hook
    - Set up useState for data, loading, and error
    - Load data from localStorage on mount
    - Implement debounced save with useEffect (500ms delay)
    - Return data, setData, loading, error
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 11.1, 11.5, 11.6_
  
  - [x] 8.2 Create useInventory hook
    - Follow same pattern as useEncyclopedias
    - Handle both items and categories
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 11.2, 11.5, 11.6_
  
  - [x] 8.3 Create useTransactions hook
    - Follow same pattern as useEncyclopedias
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 11.3, 11.5, 11.6_
  
  - [x] 8.4 Create useProfile hook
    - Follow same pattern as useEncyclopedias
    - Handle profile and friends data
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 11.4, 11.5, 11.6_
  
  - [ ]* 8.5 Write property tests for hooks
    - **Property 5: Automatic State Persistence**
    - **Property 6: Empty State Initialization**
    - **Property 10: Hook Initialization**
    - **Property 11: Hook Auto-Save**
    - **Validates: Requirements 5.1, 6.2, 11.5, 11.6**
  
  - [ ]* 8.6 Write unit tests for hook debouncing
    - Test that multiple rapid changes trigger only one save
    - Test 500ms debounce delay
    - _Requirements: 5.2, 5.3, 15.3_

- [ ] 9. Create Navbar component
  - [x] 9.1 Implement Navbar component structure
    - Create `src/components/Navbar.tsx`
    - Use React Router NavLink for all navigation links
    - Add links for Home, Encyclopedia, Inventory, Accounting, MyPage
    - _Requirements: 1.1, 1.2, 3.1, 3.2_
  
  - [x] 9.2 Add Navbar styling and positioning
    - Apply Tailwind CSS classes for blue/indigo gradient theme
    - Use sticky positioning (top: 0, z-index: 50)
    - Ensure no layout shift when rendered
    - _Requirements: 1.3, 1.5, 1.6, 1.7, 2.4, 2.5, 3.4_
  
  - [x] 9.3 Implement responsive design
    - Desktop (≥768px): Horizontal navigation with all links visible
    - Mobile (<768px): Hamburger menu or horizontal scroll
    - Add hover effects for desktop
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 9.4 Add active page indication
    - Configure NavLink activeClassName for active state styling
    - Ensure active link has distinct visual appearance
    - _Requirements: 1.4, 3.3_
  
  - [ ]* 9.5 Write property test for active page indication
    - **Property 1: Active Page Indication**
    - **Validates: Requirements 1.4, 3.3, 14.4**
  
  - [ ]* 9.6 Write unit tests for Navbar
    - Test all navigation links render
    - Test sticky positioning class applied
    - Test responsive classes at different breakpoints
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ] 10. Create Layout component
  - [x] 10.1 Implement Layout wrapper component
    - Create `src/components/Layout.tsx`
    - Include Navbar at top
    - Add main content area with padding offset for fixed navbar
    - Accept children prop for page content
    - _Requirements: 1.1, 1.7_
  
  - [ ]* 10.2 Write unit tests for Layout component
    - Test Navbar is rendered
    - Test children are rendered in main area
    - Test padding offset is applied

- [ ] 11. Checkpoint - Verify UI components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Integrate navigation with React Router
  - [x] 12.1 Update App.tsx to use Layout component
    - Wrap all routes with Layout component
    - Ensure Navbar appears on all pages
    - _Requirements: 1.1, 14.1_
  
  - [x] 12.2 Verify browser navigation integration
    - Test that NavLink updates URL via React Router
    - Verify back/forward buttons work correctly
    - Ensure active page indicator updates with URL changes
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [ ]* 12.3 Write property test for navigation URL updates
    - **Property 15: Navigation URL Update**
    - **Validates: Requirements 14.1**
  
  - [ ]* 12.4 Write integration tests for navigation flow
    - Test clicking navigation links updates URL
    - Test browser back/forward navigation
    - Test active indicator follows route changes
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 13. Integrate storage hooks with existing pages
  - [x] 13.1 Update Encyclopedia page to use useEncyclopedias hook
    - Replace local state with useEncyclopedias hook
    - Remove any manual localStorage calls
    - Verify data persists across page refreshes
    - _Requirements: 5.1, 6.1, 11.1_
  
  - [x] 13.2 Update Inventory page to use useInventory hook
    - Replace local state with useInventory hook
    - Remove any manual localStorage calls
    - Verify data persists across page refreshes
    - _Requirements: 5.1, 6.1, 11.2_
  
  - [x] 13.3 Update Accounting page to use useTransactions hook
    - Replace local state with useTransactions hook
    - Remove any manual localStorage calls
    - Verify data persists across page refreshes
    - _Requirements: 5.1, 6.1, 11.3_
  
  - [x] 13.4 Update MyPage to use useProfile hook
    - Replace local state with useProfile hook
    - Remove any manual localStorage calls
    - Verify data persists across page refreshes
    - _Requirements: 5.1, 6.1, 11.4_

- [ ] 14. Add export/import UI controls
  - [ ] 14.1 Add export button to settings or MyPage
    - Create "Export Data" button
    - Trigger file download with filename format "droseal-backup-YYYY-MM-DD.json"
    - _Requirements: 12.1, 12.3_
  
  - [ ] 14.2 Add import button to settings or MyPage
    - Create "Import Data" button with file input
    - Validate imported JSON structure
    - Display success/error messages
    - Update displayed state after successful import
    - _Requirements: 12.2, 12.4, 12.5, 12.6_
  
  - [ ]* 14.3 Write integration tests for export/import UI
    - Test export button downloads file
    - Test import button accepts file and updates state
    - Test import validation rejects invalid files
    - _Requirements: 12.1, 12.2, 12.4, 12.5_

- [ ] 15. Add storage quota warning UI
  - [ ] 15.1 Create quota warning banner component
    - Display warning when storage > 80% full
    - Show urgent warning when > 90% full
    - Include "Export Data" button in warning
    - _Requirements: 7.2, 7.3_
  
  - [ ] 15.2 Integrate quota monitoring into app
    - Check quota after each save operation
    - Update warning banner state
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 15.3 Write unit tests for quota warning
    - Test warning displays at 80% threshold
    - Test urgent warning at 90% threshold
    - Test export button in warning banner
    - _Requirements: 7.2_

- [ ] 16. Performance optimization and validation
  - [ ] 16.1 Verify debouncing performance
    - Ensure saves don't block main thread > 16ms
    - Verify 500ms debounce delay is working
    - _Requirements: 5.2, 5.3, 15.1, 15.3_
  
  - [ ] 16.2 Optimize Navbar rendering
    - Ensure Navbar renders in < 100ms
    - Verify no unnecessary re-renders
    - _Requirements: 15.4_
  
  - [ ] 16.3 Add loading indicator for slow data loads
    - Display loading indicator if load takes > 100ms
    - _Requirements: 15.2_
  
  - [ ]* 16.4 Write performance tests
    - Test save operation doesn't block main thread
    - Test Navbar render time
    - Test loading indicator appears for slow loads
    - _Requirements: 15.1, 15.2, 15.4_

- [ ] 17. Final checkpoint - End-to-end validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breaks
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation uses TypeScript, React, React Router, Tailwind CSS, and Vitest
- Storage service is the foundation - complete it before building hooks and UI
- Hooks provide the state management layer - complete before integrating with pages
- UI components (Navbar, Layout) can be developed in parallel with hooks
- Integration tasks wire everything together at the end
