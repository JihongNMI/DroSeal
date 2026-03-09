# Implementation Plan: DroSeal React Frontend

## Overview

This implementation plan creates a modern React 18 + Vite 5 + TypeScript 5 frontend application with Tailwind CSS 3 and React Router DOM 6 in the DroSeal-front directory. The approach follows a bottom-up strategy: first establishing the project foundation with proper tooling and configuration, then setting up Tailwind CSS and React Router DOM, building the core application structure with routing and styled pages, and finally implementing testing infrastructure to validate correctness properties.

The implementation emphasizes type safety, utility-first styling with Tailwind CSS, client-side routing with React Router DOM, fast development experience with HMR, and production-ready builds with optimized assets, CSS purging, and route-based code splitting.

## Tasks

- [x] 1. Initialize project structure and configuration files
  - Create DroSeal-front directory with proper folder structure (src/, public/, src/components/, src/pages/, src/routes/, src/styles/)
  - Create package.json with React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router DOM 6, and all required dependencies
  - Create tsconfig.json and tsconfig.node.json with strict TypeScript configuration
  - Create vite.config.ts with React plugin and build optimization settings
  - Create .eslintrc.cjs with TypeScript and React linting rules
  - Create .gitignore to exclude node_modules, dist, and build artifacts
  - Create .env.example documenting environment variable patterns
  - Create README.md with project setup and development instructions
  - _Requirements: 1.1, 1.4, 1.5, 3.1, 3.2, 3.3, 3.5, 5.1, 5.4, 8.1, 10.3, 11.1, 12.1_

- [x] 2. Set up Tailwind CSS configuration
  - [x] 2.1 Create tailwind.config.ts configuration file
    - Configure content paths for TypeScript and TSX files
    - Set up theme extensions for custom design tokens
    - _Requirements: 11.2, 11.7, 13.1, 13.5_
  
  - [x] 2.2 Create postcss.config.js configuration file
    - Configure tailwindcss plugin for processing Tailwind directives
    - Configure autoprefixer plugin for cross-browser compatibility
    - _Requirements: 11.3, 13.2, 13.3_
  
  - [x] 2.3 Create src/styles/index.css with Tailwind imports
    - Add @tailwind base, components, and utilities directives
    - Add custom base styles in @layer base
    - Add custom component classes in @layer components
    - Add custom utility classes in @layer utilities
    - _Requirements: 11.4, 13.4_

- [x] 3. Create core application files
  - [x] 3.1 Create index.html entry point
    - Write HTML file with root div and script reference to main.tsx
    - Include meta tags for viewport and charset
    - _Requirements: 3.3_
  
  - [x] 3.2 Create src/vite-env.d.ts for Vite type definitions
    - Include Vite client types reference
    - Define ImportMetaEnv interface for environment variables
    - _Requirements: 8.3, 10.2_
  
  - [x] 3.3 Create src/main.tsx application entry point
    - Import React, ReactDOM, and App component
    - Import global Tailwind CSS styles from src/styles/index.css
    - Mount App component to root element with StrictMode
    - _Requirements: 3.4, 11.4_
  
  - [x] 3.4 Add favicon to public directory
    - Create or copy favicon.ico to public/
    - _Requirements: 3.5_

- [x] 4. Set up React Router DOM structure
  - [x] 4.1 Create src/components/App.tsx root component with BrowserRouter
    - Implement App component with TypeScript
    - Wrap application with BrowserRouter from react-router-dom
    - Import and render AppRoutes component
    - _Requirements: 6.1, 6.2, 12.2_
  
  - [x] 4.2 Create src/routes/index.tsx with route configuration
    - Define Routes component with React Router
    - Configure lazy loading with React.lazy and Suspense
    - Set up route definitions for Home and NotFound pages
    - Add loading fallback UI with Tailwind CSS styling
    - _Requirements: 12.3, 12.4, 14.1, 14.5_
  
  - [x] 4.3 Create src/pages/Home.tsx landing page
    - Implement Home page component with TypeScript
    - Style with Tailwind CSS utility classes
    - Add welcome content and navigation links
    - _Requirements: 6.4, 11.5, 12.4_
  
  - [x] 4.4 Create src/pages/NotFound.tsx error page
    - Implement 404 error page component with TypeScript
    - Style with Tailwind CSS utility classes
    - Add Link component for navigation back to home
    - _Requirements: 12.6, 11.5_

- [x] 5. Checkpoint - Verify development server starts with Tailwind CSS
  - Run npm install to install dependencies (including Tailwind CSS and React Router DOM)
  - Run npm run dev to start development server
  - Verify application loads in browser on localhost:5173
  - Verify Tailwind CSS styles are applied correctly
  - Verify routing navigation works without page reload
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement build and production configuration
  - [x] 6.1 Configure Vite build settings for production optimization
    - Set up output directory as dist/
    - Enable sourcemaps for debugging
    - Configure rollup options for asset hashing and code splitting
    - Add manual chunks for react-vendor and router bundles
    - _Requirements: 4.1, 4.4, 14.5_
  
  - [x] 6.2 Test production build process with Tailwind CSS purging
    - Run npm run build to generate production bundle
    - Verify dist/ directory contains minified JS and CSS with hashed filenames
    - Verify index.html references hashed assets correctly
    - Verify Tailwind CSS unused classes are purged from production CSS
    - _Requirements: 4.2, 4.3, 4.5, 11.6_
  
  - [x] 6.3 Configure preview server
    - Ensure vite preview command serves production build
    - _Requirements: 7.3_

- [ ] 7. Set up testing infrastructure
  - [ ] 7.1 Install testing dependencies
    - Add vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, fast-check
    - Add @vitest/ui for test UI
    - Add react-router-dom testing utilities (MemoryRouter, createMemoryHistory)
    - _Requirements: Testing Strategy_
  
  - [ ] 7.2 Create vitest.config.ts
    - Configure Vitest with React Testing Library
    - Set up test environment as jsdom
    - Configure coverage reporting
    - _Requirements: Testing Strategy_
  
  - [ ] 7.3 Create test setup file
    - Create src/__tests__/setup.ts with testing-library configuration
    - Import jest-dom matchers
    - _Requirements: Testing Strategy_
  
  - [ ] 7.4 Add test scripts to package.json
    - Add "test", "test:watch", "test:ui", "test:run" scripts
    - _Requirements: Testing Strategy_

- [ ] 8. Implement MVP page components
  - [x] 8.1 Create Encyclopedia page component (src/pages/Encyclopedia.tsx)
    - Implement card-based grid layout with Tailwind CSS
    - Add CollectionItem interface with id, name, imageUrl, ownedQuantity, totalQuantity, notes, isCustom
    - Implement progress bar with percentage calculation
    - Add quick edit +/- buttons with quantity state management
    - Implement hover-based notes editing interface
    - Add "Add Custom Entry" button with modal state
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 18.1, 18.2, 19.1_
  
  - [x] 8.2 Create custom encyclopedia modal component
    - Implement modal with 5x12 grid for image cropping
    - Add custom data input fields (name, custom properties)
    - Implement grid position selection logic
    - Add save and cancel functionality
    - _Requirements: 19.2, 19.3, 19.4, 20.1, 20.2, 20.3, 20.4_
  
  - [x] 8.3 Create Inventory page component (src/pages/Inventory.tsx)
    - Implement list/table layout with Tailwind CSS
    - Add Category and InventoryItem interfaces
    - Create category sidebar with hierarchical tree structure
    - Implement checkbox-based category filtering
    - Add "Add Item" button with modal state
    - Implement item deletion functionality
    - _Requirements: 21.1, 21.2, 21.3, 22.1, 22.2, 22.3, 23.1, 23.3, 24.1, 24.2_
  
  - [x] 8.4 Implement category filtering logic
    - Create getChildCategories recursive function
    - Implement filteredItems calculation including child categories
    - Add category selection state management
    - Ensure filter updates trigger immediate re-render
    - _Requirements: 23.2, 23.4, 23.5, 24.3, 24.4, 24.5_
  
  - [x] 8.5 Create add item and category modals
    - Implement add item modal with name, category, quantity inputs
    - Create add category modal with name and parent selection
    - Add form validation and submission logic
    - _Requirements: 22.1, 22.2, 24.1, 24.2_
  
  - [x] 8.6 Create Accounting page component (src/pages/Accounting.tsx)
    - Implement dashboard cards for financial summaries
    - Add TransactionRecord interface with type, price, date, source, fees, linkedInventoryId
    - Create transaction list table with chronological sorting
    - Calculate totalExpenses, totalRevenue, currentAssetValue
    - Add "Add Transaction" button with modal state
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 26.1, 26.2, 26.3, 27.1_
  
  - [x] 8.7 Create add transaction modal
    - Implement form with type selection (purchase/sale)
    - Add price, date, source inputs for purchases
    - Add price, date, shipping cost, fee inputs for sales
    - Implement inventory item linking dropdown
    - Add form validation and submission logic
    - _Requirements: 26.1, 26.2, 27.1, 27.2_
  
  - [x] 8.8 Create My Page component (src/pages/MyPage.tsx)
    - Implement profile section with UserProfile interface
    - Add profile form with edit mode toggle
    - Create friends list display with Friend interface
    - Implement friend request cards with FriendRequest interface
    - Add accept/reject buttons for friend requests
    - Add "Add Friend" button functionality
    - Implement remove friend functionality
    - _Requirements: 28.1, 28.2, 29.1, 29.2, 29.4, 29.5_
  
  - [x] 8.9 Update routing configuration for MVP routes
    - Add lazy-loaded routes for Encyclopedia, Inventory, Accounting, MyPage
    - Update Home page with navigation cards to MVP routes
    - Verify all MVP routes render without page reload
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 9. Checkpoint - Verify MVP pages render correctly
  - Run npm run dev and navigate to each MVP route
  - Verify Encyclopedia page displays card grid layout
  - Verify Inventory page displays list with category sidebar
  - Verify Accounting page displays dashboard and transaction list
  - Verify My Page displays profile and friends sections
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement unit tests for MVP components
  - [ ] 10.1 Create src/pages/__tests__/Encyclopedia.test.tsx
    - Write unit tests for Encyclopedia page rendering
    - Test card grid layout displays correctly
    - Test progress bar calculation and display
    - Test +/- button functionality and state updates
    - Test notes editing interface on hover
    - Test custom entry modal open/close
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 17.2, 17.3, 18.1, 19.1_
  
  - [ ] 10.2 Create src/pages/__tests__/Inventory.test.tsx
    - Write unit tests for Inventory page rendering
    - Test list/table layout displays correctly
    - Test category sidebar tree structure
    - Test category filtering logic
    - Test add item modal functionality
    - Test delete item functionality
    - _Requirements: 21.1, 21.2, 22.1, 22.3, 22.4, 23.1, 23.2_
  
  - [ ] 10.3 Create src/pages/__tests__/Accounting.test.tsx
    - Write unit tests for Accounting page rendering
    - Test dashboard cards display financial summaries
    - Test transaction list displays chronologically
    - Test add transaction modal functionality
    - Test transaction-inventory linking UI
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 26.1, 26.2, 27.1_
  
  - [ ] 10.4 Create src/pages/__tests__/MyPage.test.tsx
    - Write unit tests for My Page rendering
    - Test profile form edit mode toggle
    - Test friend request accept/reject functionality
    - Test friends list display
    - Test add friend button
    - Test remove friend functionality
    - _Requirements: 28.1, 28.2, 29.1, 29.4, 29.5, 29.6_
  
  - [ ] 10.5 Create src/routes/__tests__/mvp-routes.test.tsx
    - Write unit tests for MVP route navigation
    - Test that /encyclopedia renders Encyclopedia component
    - Test that /inventory renders Inventory component
    - Test that /accounting renders Accounting component
    - Test that /mypage renders MyPage component
    - Test navigation without page reload
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 11. Implement unit tests for core components and routing
  - [ ] 11.1 Create src/components/__tests__/App.test.tsx
    - Write unit tests for App component rendering with BrowserRouter
    - Test that routing context is provided correctly
    - Test component renders without errors
    - _Requirements: 6.1, 6.2, 12.2_
  
  - [ ] 11.2 Create src/pages/__tests__/Home.test.tsx
    - Write unit tests for Home page rendering
    - Test that Tailwind CSS classes are applied
    - Test navigation links work correctly
    - _Requirements: 6.4, 11.5_
  
  - [ ] 11.3 Create src/pages/__tests__/NotFound.test.tsx
    - Write unit tests for NotFound page rendering
    - Test 404 message displays correctly
    - Test Link component navigates to home
    - _Requirements: 12.6_
  
  - [ ] 11.4 Create src/routes/__tests__/routes.test.tsx
    - Write unit tests for route configuration
    - Test that defined routes render correct components
    - Test lazy loading with Suspense fallback
    - Test 404 route for undefined paths
    - _Requirements: 12.3, 12.4, 12.6, 14.1_
  
  - [ ]* 11.5 Write unit tests for edge cases
    - Test empty states if applicable
    - Test error boundaries (future enhancement)
    - Test navigation with state
    - _Requirements: 6.1, 6.2, 12.5_

- [ ] 12. Implement property-based tests for project structure and build
  - [ ]* 12.1 Create src/__tests__/project-structure.test.ts
    - **Property 1: Project Structure Completeness**
    - **Validates: Requirements 1.1, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.4, 8.1**
    - Test that all required files and directories exist
  
  - [ ]* 12.2 Create src/__tests__/package-dependencies.test.ts
    - **Property 2: Package Dependencies Completeness**
    - **Validates: Requirements 1.2, 1.3, 7.1, 7.2, 7.3, 8.3**
    - Test that package.json contains all required dependencies and scripts
    - Verify Tailwind CSS and React Router DOM are in dependencies
  
  - [ ]* 12.3 Create src/__tests__/build-output.properties.test.ts
    - **Property 3: Build Output Hash Consistency**
    - **Validates: Requirements 4.4**
    - Test that all asset filenames contain hash patterns
    - **Property 5: Build Output Structure**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
    - Test that dist/ contains index.html, minified JS, and CSS files
  
  - [ ]* 12.4 Create src/__tests__/public-assets.properties.test.ts
    - **Property 4: Public Asset Preservation**
    - **Validates: Requirements 9.4**
    - Test that files in public/ are copied to dist/ with same content
  
  - [ ]* 12.5 Create src/components/__tests__/App.properties.test.tsx
    - **Property 6: App Component Renderability**
    - **Validates: Requirements 6.1, 6.2, 6.4**
    - Test that App component renders without errors across various inputs
  
  - [ ]* 12.6 Create src/__tests__/environment.properties.test.ts
    - **Property 7: Environment Variable Exposure**
    - **Validates: Requirements 10.2, 10.4**
    - Test that VITE_ prefixed variables are accessible via import.meta.env
  
  - [ ]* 12.7 Create src/__tests__/typescript.properties.test.ts
    - **Property 8: TypeScript Compilation Success**
    - **Validates: Requirements 8.2, 8.4**
    - Test that valid TypeScript files compile without errors
  
  - [ ]* 12.8 Create src/__tests__/asset-imports.properties.test.ts
    - **Property 9: Asset Import Functionality**
    - **Validates: Requirements 9.1, 9.2, 9.3**
    - Test that images, CSS, and SVG imports work correctly
  
  - [ ]* 12.9 Create src/__tests__/dev-server.properties.test.ts
    - **Property 10: Development Server Startup**
    - **Validates: Requirements 2.1**
    - Test that dev server starts successfully
  
  - [ ]* 12.10 Create src/__tests__/linting.properties.test.ts
    - **Property 11: Linting Error Detection**
    - **Validates: Requirements 5.2**
    - Test that ESLint detects violations and reports errors

- [ ] 13. Implement property-based tests for Tailwind CSS
  - [ ]* 13.1 Create src/__tests__/tailwind.properties.test.ts
    - **Property 12: Tailwind CSS Purging Effectiveness**
    - **Validates: Requirements 11.6**
    - Test that production CSS does not contain unused Tailwind utility classes
    - Verify only classes used in source files are in production bundle

- [ ] 14. Implement property-based tests for React Router DOM
  - [ ]* 14.1 Create src/routes/__tests__/routes.properties.test.tsx
    - **Property 13: Route Navigation Without Reload**
    - **Validates: Requirements 12.4**
    - Test that navigating between routes does not trigger full page reload
    - **Property 14: Programmatic Navigation**
    - **Validates: Requirements 12.5**
    - Test that navigate function updates route and renders component
    - **Property 15: 404 Route Handling**
    - **Validates: Requirements 12.6**
    - Test that undefined routes render NotFound component
    - **Property 16: Browser History Preservation**
    - **Validates: Requirements 12.8**
    - Test that back and forward navigation work correctly
  
  - [ ]* 14.2 Create src/__tests__/url-params.properties.test.tsx
    - **Property 17: URL Parameter Extraction**
    - **Validates: Requirements 14.3**
    - Test that useParams hook extracts URL parameters correctly
  
  - [ ]* 14.3 Create src/__tests__/lazy-loading.properties.test.ts
    - **Property 18: Lazy Loading Code Splitting**
    - **Validates: Requirements 14.5**
    - Test that lazy loaded routes create separate JavaScript chunks
    - Verify multiple JS chunks exist in production build

- [ ] 15. Implement property-based tests for MVP features
  - [ ]* 15.1 Create src/pages/__tests__/Encyclopedia.properties.test.tsx
    - **Property 19: MVP Route Rendering**
    - **Validates: Requirements 15.5**
    - Test that /encyclopedia route renders without page reload
    - **Property 20: Collection Progress Calculation**
    - **Validates: Requirements 16.3**
    - Test that progress percentage equals (ownedQuantity / totalQuantity) * 100
    - **Property 21: Collection Item Display Completeness**
    - **Validates: Requirements 16.2, 16.4**
    - Test that all collection item fields are displayed
    - **Property 22: Quantity Adjustment State Update**
    - **Validates: Requirements 17.2, 17.3, 17.5**
    - Test that +/- buttons update quantity and recalculate progress
    - **Property 23: Notes Persistence**
    - **Validates: Requirements 18.3**
    - Test that edited notes are saved and retrieved correctly
    - **Property 24: Custom Encyclopedia Deletion**
    - **Validates: Requirements 20.5**
    - Test that deleted custom entries are removed from display and storage
  
  - [ ]* 15.2 Create src/pages/__tests__/Inventory.properties.test.tsx
    - **Property 25: Inventory Item Display**
    - **Validates: Requirements 21.2**
    - Test that inventory items display name, category, and quantity
    - **Property 26: Inventory Item Deletion**
    - **Validates: Requirements 22.4**
    - Test that deleted items are removed from list and storage
    - **Property 27: Inventory Display Update**
    - **Validates: Requirements 22.5**
    - Test that add/delete operations update display immediately
    - **Property 28: Category Filtering**
    - **Validates: Requirements 23.2, 24.5**
    - Test that filtering includes items from selected category and children
    - **Property 29: Filter Update Responsiveness**
    - **Validates: Requirements 23.5**
    - Test that filter changes update list immediately
    - **Property 30: Hierarchical Category Support**
    - **Validates: Requirements 24.3**
    - Test that parent category selection includes all descendant items
  
  - [ ]* 15.3 Create src/pages/__tests__/Accounting.properties.test.tsx
    - **Property 31: Total Expenses Calculation**
    - **Validates: Requirements 25.2**
    - Test that total expenses equals sum of purchase prices
    - **Property 32: Total Revenue Calculation**
    - **Validates: Requirements 25.3**
    - Test that total revenue equals sum of sale prices minus costs
    - **Property 33: Current Asset Value Calculation**
    - **Validates: Requirements 25.4**
    - Test that asset value equals sum of unsold item purchase prices
    - **Property 34: Transaction Chronological Ordering**
    - **Validates: Requirements 26.4**
    - Test that transactions are ordered by date (most recent first)
    - **Property 35: Transaction-Inventory Bidirectional Linking**
    - **Validates: Requirements 27.2, 27.3**
    - Test that linked transactions and items reference each other
    - **Property 36: Financial Calculation Update**
    - **Validates: Requirements 27.5**
    - Test that financial summaries update when transactions are linked
  
  - [ ]* 15.4 Create src/pages/__tests__/MyPage.properties.test.tsx
    - **Property 37: Profile Edit Validation**
    - **Validates: Requirements 28.3**
    - Test that invalid profile data is rejected with error message
    - **Property 38: Friend Request Creation**
    - **Validates: Requirements 29.3**
    - Test that friend addition creates pending request, not immediate friend
    - **Property 39: Friend Request Acceptance**
    - **Validates: Requirements 29.6**
    - Test that accepting request adds friend and removes request
    - **Property 40: Friend Management Display Update**
    - **Validates: Requirements 29.7**
    - Test that friend operations update display immediately

- [ ] 16. Verify environment variable handling
  - [x] 16.1 Create .env.example with sample variables
    - Document VITE_API_URL and VITE_APP_TITLE
    - _Requirements: 10.1, 10.3_
  
  - [x] 16.2 Test environment variable access in code
    - Add example usage of import.meta.env in App component
    - Verify variables are replaced at build time
    - _Requirements: 10.2, 10.4_

- [ ] 17. Implement asset handling examples
  - [x] 17.1 Add sample image to src/assets/
    - Create assets directory if not exists
    - Add a sample image file (e.g., logo.png)
    - _Requirements: 9.1_
  
  - [x] 17.2 Import and display image in Home page component
    - Import image in Home.tsx
    - Render image element with imported URL and Tailwind CSS classes
    - Verify image appears in browser
    - _Requirements: 9.1, 11.5_
  
  - [ ]* 17.3 Test CSS import functionality
    - Verify Tailwind CSS utility classes work correctly
    - Test that styles are applied as expected
    - _Requirements: 9.2, 11.5_

- [ ] 18. Final validation and documentation
  - [x] 18.1 Run full test suite
    - Execute npm run test:run to run all tests
    - Verify all property tests pass with 100+ iterations
    - Verify all unit tests pass
    - _Requirements: All_
  
  - [x] 18.2 Run linting
    - Execute npm run lint
    - Fix any linting errors or warnings
    - _Requirements: 5.1, 5.2_
  
  - [x] 18.3 Test production build with Tailwind CSS purging
    - Run npm run build
    - Verify no TypeScript errors
    - Verify dist/ output is correct
    - Verify Tailwind CSS classes are purged correctly
    - Verify route-based code splitting creates multiple chunks
    - Run npm run preview and test in browser
    - Test navigation between routes in production build
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 11.6, 14.5_
  
  - [x] 18.4 Update README.md with final instructions
    - Document all npm scripts
    - Add development workflow instructions
    - Add environment variable setup instructions
    - Add build and deployment instructions
    - Document Tailwind CSS customization
    - Document routing structure and navigation
    - _Requirements: 7.3, 7.4_

- [x] 19. Checkpoint - Final verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify development server starts without errors
  - Verify Tailwind CSS styles are applied correctly
  - Verify routing navigation works without page reload
  - Verify production build completes successfully with CSS purging
  - Confirm all requirements are met

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- The implementation follows TypeScript best practices with strict type checking
- All configuration files use modern standards (ES2020, React 18, Vite 5)
- Tailwind CSS is configured with JIT mode for development and automatic purging for production
- React Router DOM provides client-side routing with lazy loading for optimal bundle sizes
- The project structure supports future scalability with organized directories for pages, routes, and components
- Checkpoints ensure incremental validation of development server, routing, and Tailwind CSS functionality
- MVP features include Encyclopedia (card-based collection), Inventory (list-based items), Accounting (financial dashboard), and My Page (profile and friends)
- All MVP components use React built-in state management (useState) for simplicity
- Database schema is not finalized - MVP uses local state only
- Backend API integration is future work - focus on frontend functionality first
