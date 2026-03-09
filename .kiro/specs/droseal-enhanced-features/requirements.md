# Requirements Document

## Introduction

This document specifies requirements for enhanced features in the DroSeal React Frontend application. DroSeal is a collection management system built with React, TypeScript, Vite, and Tailwind CSS. The base MVP includes Encyclopedia, Inventory, Accounting, and MyPage features. This enhancement adds advanced functionality including custom encyclopedias, hierarchical inventory categories, enhanced accounting features, achievement systems, and social features.

## Glossary

- **Encyclopedia**: A collection catalog that displays items in a grid layout, tracking which items a user has collected
- **Certified_Encyclopedia**: An admin-managed encyclopedia available to all users
- **Custom_Encyclopedia**: A user-created encyclopedia that can be public or private
- **Inventory**: The user's collection of physical items with quantities and metadata
- **Inventory_Item**: A single item entry in the user's inventory with quantity, category, and optional pricing
- **Category**: A hierarchical classification system for organizing inventory items
- **Transaction**: A financial record of buying or selling items, linked to inventory
- **Achievement**: A title or badge awarded to users for completing specific milestones
- **Friend**: Another user who has accepted a friend request, enabling social features
- **Trade_Request**: A message sent to a friend proposing to exchange inventory items
- **Sheet_Image**: An image containing multiple items arranged in a grid
- **OCR_Service**: Optical Character Recognition service for extracting text from images
- **Progress_Percentage**: The ratio of collected unique items to total items in an encyclopedia
- **Draft**: Temporary saved state of encyclopedia creation stored in browser localStorage
- **Business_Income**: Revenue from selling items that have a recorded purchase price
- **Other_Income**: Revenue from selling items without a recorded purchase price
- **Receipt**: An image attachment documenting a transaction

## Requirements

### Requirement 1: Encyclopedia Type System

**User Story:** As a user, I want to distinguish between certified and custom encyclopedias, so that I can use official collections and create my own.

#### Acceptance Criteria

1. THE System SHALL support two encyclopedia types: Certified_Encyclopedia and Custom_Encyclopedia
2. THE Certified_Encyclopedia SHALL be managed by administrators only
3. THE Custom_Encyclopedia SHALL be created and managed by individual users
4. WHEN displaying an encyclopedia, THE System SHALL indicate whether it is certified or custom
5. THE System SHALL allow users to create unlimited Custom_Encyclopedia instances

### Requirement 2: Custom Encyclopedia Privacy

**User Story:** As a user, I want to control who can see my custom encyclopedias, so that I can keep some collections private.

#### Acceptance Criteria

1. WHEN creating a Custom_Encyclopedia, THE System SHALL require the user to select either Public or Private visibility
2. WHILE a Custom_Encyclopedia is set to Private, THE System SHALL prevent other users from viewing it
3. WHILE a Custom_Encyclopedia is set to Public, THE System SHALL allow friends to view it
4. WHEN a user changes a Custom_Encyclopedia from Private to Public, THE System SHALL display a consent confirmation dialog
5. THE System SHALL allow users to change encyclopedia visibility after creation

### Requirement 3: Encyclopedia-Inventory Relationship

**User Story:** As a user, I want encyclopedia quantities to reflect my inventory, so that I can track what I actually own.

#### Acceptance Criteria

1. THE System SHALL calculate encyclopedia item quantities based on linked Inventory_Item quantities
2. WHEN an Inventory_Item quantity changes, THE System SHALL update the corresponding encyclopedia item quantity
3. THE System SHALL allow users to create encyclopedia entries without corresponding Inventory_Items
4. WHEN adding an item to an encyclopedia, THE System SHALL only allow linking to existing Inventory_Items
5. THE System SHALL display zero quantity for encyclopedia items not linked to inventory

### Requirement 4: Achievement System

**User Story:** As a user, I want to earn achievements for milestones, so that I feel rewarded for my collection activities.

#### Acceptance Criteria

1. WHEN a user creates their first public Custom_Encyclopedia, THE System SHALL award the "첫 도감" (First Encyclopedia) achievement
2. WHEN a user registers one or more items in any encyclopedia, THE System SHALL award the "첫 발걸음" (First Step) achievement
3. WHEN a user's public encyclopedia data is adopted into a Certified_Encyclopedia, THE System SHALL award a contributor achievement
4. THE System SHALL display all earned achievements on the user's profile
5. THE System SHALL prevent duplicate achievement awards for the same milestone

### Requirement 5: Manual Encyclopedia Creation

**User Story:** As a user, I want to create encyclopedias by uploading and cropping images, so that I can build collections from sheet images or individual photos.

#### Acceptance Criteria

1. THE System SHALL allow users to upload a Sheet_Image for manual encyclopedia creation
2. WHEN a Sheet_Image is uploaded, THE System SHALL provide cropping tools to extract individual item images
3. THE System SHALL allow users to upload two or more individual images for non-sheet items
4. WHEN cropping is complete, THE System SHALL generate individual item entries from cropped regions
5. THE System SHALL preserve image quality during the cropping process

### Requirement 6: AI-Powered Encyclopedia Creation

**User Story:** As a user, I want AI to automatically extract item names from images, so that I can create encyclopedias faster.

#### Acceptance Criteria

1. THE System SHALL provide an auto-creation mode using OCR_Service
2. WHEN auto-creation is selected, THE System SHALL analyze uploaded images and extract text via OCR_Service
3. WHEN OCR_Service completes, THE System SHALL auto-fill item name fields with extracted text
4. THE System SHALL allow users to review and edit all auto-filled names before saving
5. WHEN an upload contains 20 or more items, THE System SHALL display a warning that AI accuracy may be reduced

### Requirement 7: Flexible Encyclopedia Grid

**User Story:** As a user, I want to configure encyclopedia grid dimensions, so that I can match my collection's layout.

#### Acceptance Criteria

1. THE System SHALL replace the fixed 5×12 grid with a user-configurable n×m grid
2. WHEN creating an encyclopedia, THE System SHALL allow users to specify row count and column count
3. THE System SHALL support grid dimensions from 1×1 to 50×50
4. WHEN grid dimensions change, THE System SHALL preserve existing item placements where possible
5. THE System SHALL display the current grid dimensions during encyclopedia creation

### Requirement 8: Encyclopedia Description and Privacy Controls

**User Story:** As a user, I want to add descriptions and set privacy when creating encyclopedias, so that I can document and control my collections.

#### Acceptance Criteria

1. THE System SHALL provide a description text field below the encyclopedia name field
2. THE System SHALL allow descriptions up to 500 characters
3. THE System SHALL provide a Public/Private toggle before the final save button
4. WHEN saving an encyclopedia, THE System SHALL store the description and privacy setting
5. THE System SHALL display the description on the encyclopedia detail page

### Requirement 9: Inline Property Input with Auto-Numbering

**User Story:** As a user, I want to input item properties inline with flexible numbering, so that I can efficiently enter encyclopedia data.

#### Acceptance Criteria

1. THE System SHALL replace popup prompts with inline input fields for item properties
2. THE System SHALL auto-number items based on their grid position
3. THE System SHALL provide a toggle between horizontal numbering (row-first) and vertical numbering (column-first)
4. WHEN a user enters an item name, THE System SHALL highlight the corresponding grid cell
5. THE System SHALL update all item numbers when the numbering order toggle changes

### Requirement 10: Draft Auto-Save

**User Story:** As a user, I want my encyclopedia creation progress saved automatically, so that I don't lose data if I close the browser.

#### Acceptance Criteria

1. WHILE creating an encyclopedia, THE System SHALL save progress to localStorage every 30 seconds
2. WHEN a user returns to encyclopedia creation, THE System SHALL detect saved drafts and offer to restore them
3. THE System SHALL store draft data including grid dimensions, item names, images, and properties
4. WHEN an encyclopedia is successfully saved, THE System SHALL delete the corresponding draft
5. THE System SHALL allow users to manually discard drafts

### Requirement 11: Encyclopedia Progress Display

**User Story:** As a user, I want to see collection progress for each encyclopedia, so that I know how complete my collections are.

#### Acceptance Criteria

1. THE System SHALL display progress as "collected/total" (e.g., "10/60") for each encyclopedia
2. THE System SHALL calculate Progress_Percentage as unique items collected divided by total items
3. THE System SHALL cap Progress_Percentage at 100% regardless of item quantities
4. WHEN Progress_Percentage reaches 50% or more, THE System SHALL apply a slight visual emphasis effect
5. WHEN Progress_Percentage reaches 100%, THE System SHALL apply a strong visual emphasis effect

### Requirement 12: Encyclopedia List Actions

**User Story:** As a user, I want to edit and delete encyclopedias from the list view, so that I can manage my collections.

#### Acceptance Criteria

1. THE System SHALL replace +/- buttons with Edit and Delete buttons in encyclopedia list view
2. WHEN the Edit button is clicked, THE System SHALL open the encyclopedia in edit mode
3. WHEN the Delete button is clicked, THE System SHALL display a confirmation dialog
4. WHEN deletion is confirmed, THE System SHALL remove the encyclopedia and all its data
5. THE System SHALL prevent deletion of Certified_Encyclopedia instances by non-admin users

### Requirement 13: Friend Encyclopedia Visibility

**User Story:** As a user, I want to see which friends have the same encyclopedia, so that I can compare collections and trade.

#### Acceptance Criteria

1. THE System SHALL display a list of friends who have the same encyclopedia
2. THE System SHALL only show friends who have public versions of the encyclopedia
3. WHEN clicking a friend's name, THE System SHALL navigate to that friend's encyclopedia detail page
4. THE System SHALL update the friend list when friend relationships change
5. THE System SHALL display "No friends have this encyclopedia" when the list is empty

### Requirement 14: Encyclopedia Detail Navigation

**User Story:** As a user, I want to click an encyclopedia to view its details, so that I can see and manage individual items.

#### Acceptance Criteria

1. WHEN an encyclopedia is clicked in list view, THE System SHALL navigate to the encyclopedia detail page
2. THE System SHALL display all encyclopedia items in the configured grid layout
3. THE System SHALL show item images, names, and current quantities
4. THE System SHALL provide navigation back to the encyclopedia list
5. THE System SHALL load detail page data within 500ms for encyclopedias with up to 100 items

### Requirement 15: Encyclopedia Item Quantity Management

**User Story:** As a user, I want to adjust item quantities in encyclopedia detail view, so that I can link inventory and track what I have.

#### Acceptance Criteria

1. THE System SHALL display -/quantity/+ buttons for each encyclopedia item
2. WHEN clicking + on an unlinked item, THE System SHALL search inventory by item name and display linkable Inventory_Items
3. WHEN clicking a linkable Inventory_Item, THE System SHALL create a link between encyclopedia item and Inventory_Item
4. WHEN clicking - or +, THE System SHALL stage the quantity change without immediate save
5. WHEN the Save button is clicked, THE System SHALL batch update all staged quantity changes

### Requirement 16: Encyclopedia Item Detail Modal

**User Story:** As a user, I want to view detailed information about encyclopedia items, so that I can see history, add notes, and compare with friends.

#### Acceptance Criteria

1. WHEN an encyclopedia item image is clicked, THE System SHALL open a detail modal
2. THE System SHALL provide a memo field for user notes up to 1000 characters
3. IF the item is linked to inventory, THE System SHALL display transaction history showing all +/- changes
4. IF a friend has the same encyclopedia, THE System SHALL display the friend's quantity for comparison
5. THE System SHALL provide a Remove button to unlink the item from the encyclopedia

### Requirement 17: Trade Request System

**User Story:** As a user, I want to propose trades with friends who have items I need, so that we can exchange collection items.

#### Acceptance Criteria

1. WHEN viewing an encyclopedia item that a friend has (quantity ≥ 1), THE System SHALL display an active Trade button
2. WHEN the Trade button is clicked, THE System SHALL display the user's inventory item list
3. WHEN the user selects an item to trade, THE System SHALL display a comparison image showing both items
4. WHEN the user confirms the trade, THE System SHALL send a Trade_Request message to the friend
5. THE System SHALL disable the Trade button if the friend's quantity is zero

### Requirement 18: First-Time Inventory Setup

**User Story:** As a new user, I want helpful default categories, so that I can start organizing my inventory quickly.

#### Acceptance Criteria

1. WHEN a user accesses inventory for the first time, THE System SHALL prompt "Use default categories?"
2. IF the user selects Yes, THE System SHALL create categories: "씰, 카드, 굿즈, 피규어, 책, 기본"
3. IF the user selects No, THE System SHALL create only the "기본" category
4. THE System SHALL designate "기본" as the default category for uncategorized items
5. THE System SHALL prevent deletion of the "기본" category

### Requirement 19: Hierarchical Category Management

**User Story:** As a user, I want to organize inventory in hierarchical categories, so that I can create detailed classification systems.

#### Acceptance Criteria

1. THE System SHALL support multi-level category hierarchies with unlimited depth
2. THE System SHALL provide Add Category, Edit Category, and Delete Category buttons
3. WHEN no category is selected, THE System SHALL show only the Add Category button
4. WHEN a category is selected, THE System SHALL show Edit Category and Delete Category buttons
5. WHEN adding or editing a category, THE System SHALL allow selection of a parent category

### Requirement 20: Collapsible Category Tree

**User Story:** As a user, I want to expand and collapse category levels, so that I can navigate large category hierarchies easily.

#### Acceptance Criteria

1. THE System SHALL display only top-level categories initially in collapsed state
2. WHEN a category with children is clicked, THE System SHALL expand to show immediate children only
3. WHEN an expanded category is clicked, THE System SHALL collapse and hide its children
4. THE System SHALL display expand/collapse indicators for categories with children
5. THE System SHALL preserve expansion state during the current session

### Requirement 21: Category Search

**User Story:** As a user, I want to search categories, so that I can quickly find specific classifications.

#### Acceptance Criteria

1. THE System SHALL provide a category search field below category management buttons
2. WHEN search text is entered, THE System SHALL display matching categories
3. THE System SHALL include all parent categories of matching results in search results
4. THE System SHALL include all child categories of matching results in search results
5. WHEN search is cleared, THE System SHALL restore the previous category tree state

### Requirement 22: Duplicate Category Names

**User Story:** As a user, I want to use the same category name in different contexts, so that I can organize logically without name conflicts.

#### Acceptance Criteria

1. THE System SHALL allow duplicate category names at different hierarchy levels
2. THE System SHALL allow duplicate category names under different parent categories
3. THE System SHALL prevent duplicate category names under the same parent category
4. WHEN displaying categories, THE System SHALL show the full hierarchical path to distinguish duplicates
5. THE System SHALL validate category name uniqueness within the same parent during creation and editing

### Requirement 23: Enhanced Inventory Item Input

**User Story:** As a user, I want to record purchase details and link to encyclopedias when adding inventory, so that I can track item history and collections.

#### Acceptance Criteria

1. THE System SHALL provide an optional purchase price field for Inventory_Items
2. THE System SHALL provide an optional purchase date field defaulting to current timestamp
3. THE System SHALL provide a dropdown to select and link a registered encyclopedia
4. THE System SHALL allow users to edit Inventory_Item quantities after creation
5. THE System SHALL record all quantity changes in a separate history table

### Requirement 24: Inventory Item Display Enhancements

**User Story:** As a user, I want to see comprehensive item information in inventory view, so that I understand item context and verification status.

#### Acceptance Criteria

1. THE System SHALL display the full category path (parent > child > ...) for each Inventory_Item
2. THE System SHALL display the purchase price if available
3. THE System SHALL display the linked encyclopedia name if available
4. IF an Inventory_Item price is linked to a Transaction, THE System SHALL display a checkmark indicator
5. THE System SHALL use consistent formatting for all displayed metadata

### Requirement 25: Accounting Transaction Types

**User Story:** As a user, I want to distinguish between business income and other income, so that I can track profit margins accurately.

#### Acceptance Criteria

1. THE System SHALL classify transactions as Business_Income when linked to Inventory_Items with purchase prices
2. THE System SHALL classify transactions as Other_Income when not linked to Inventory_Items with purchase prices
3. THE System SHALL calculate profit for Business_Income as revenue minus cost
4. THE System SHALL calculate profit for Other_Income as revenue only
5. THE System SHALL provide a filter to view Business_Income and Other_Income separately

### Requirement 26: Accounting Time Filters

**User Story:** As a user, I want to filter transactions by time period, so that I can analyze financial performance over specific periods.

#### Acceptance Criteria

1. THE System SHALL provide a monthly filter for transactions
2. THE System SHALL provide a yearly filter for transactions
3. WHEN a monthly filter is applied, THE System SHALL display only transactions within the selected month
4. WHEN a yearly filter is applied, THE System SHALL display only transactions within the selected year
5. THE System SHALL calculate summary statistics based on filtered transactions

### Requirement 27: Inventory Linking in Accounting

**User Story:** As a user, I want to easily link transactions to inventory items, so that I can track item sales accurately.

#### Acceptance Criteria

1. THE System SHALL position the inventory link field after the transaction type field
2. THE System SHALL replace ID input with a searchable dropdown of Inventory_Items
3. WHEN typing in the dropdown, THE System SHALL filter Inventory_Items by name
4. WHEN an Inventory_Item is selected, THE System SHALL auto-fill relevant transaction details
5. THE System SHALL allow transactions without inventory links

### Requirement 28: Receipt Attachment

**User Story:** As a user, I want to attach receipt images to transactions, so that I can document my purchases and sales.

#### Acceptance Criteria

1. THE System SHALL provide an optional receipt image upload field for transactions
2. THE System SHALL accept common image formats (JPEG, PNG, WebP)
3. THE System SHALL store receipt images with maximum dimension of 2048 pixels
4. WHEN a receipt is attached, THE System SHALL display a thumbnail in transaction view
5. WHEN a receipt thumbnail is clicked, THE System SHALL display the full-size image

### Requirement 29: Accounting Export Functions

**User Story:** As a user, I want to export transaction data, so that I can use it in other applications or for record-keeping.

#### Acceptance Criteria

1. THE System SHALL provide an Export to Excel function for transactions
2. THE System SHALL provide an Export to PDF function for transactions
3. WHEN exporting, THE System SHALL include all visible filtered transactions
4. THE System SHALL include transaction date, type, amount, linked inventory, and profit in exports
5. THE System SHALL generate export files with filename including current date

### Requirement 30: Profile Achievement Display

**User Story:** As a user, I want to see my achievements on my profile, so that I can showcase my collection milestones.

#### Acceptance Criteria

1. THE System SHALL add an achievements section to the user profile page
2. THE System SHALL display all earned achievements with icons and titles
3. THE System SHALL show achievement earn dates
4. THE System SHALL display locked achievements that haven't been earned yet
5. THE System SHALL order achievements by earn date, most recent first

### Requirement 31: Friend Request Status

**User Story:** As a user, I want to see the status of friend requests I've sent, so that I know if they're pending or accepted.

#### Acceptance Criteria

1. THE System SHALL display "Friend request pending" status for sent requests awaiting response
2. THE System SHALL update status to "Friends" when a request is accepted
3. THE System SHALL remove pending status if a request is declined
4. THE System SHALL allow users to cancel pending friend requests
5. THE System SHALL display the date when friend requests were sent

### Requirement 32: Friend Encyclopedia Access

**User Story:** As a user, I want to view my friends' public encyclopedias, so that I can see their collections and find trade opportunities.

#### Acceptance Criteria

1. WHEN clicking a friend's profile, THE System SHALL display a list of their public Custom_Encyclopedia instances
2. THE System SHALL hide private encyclopedias from friend view
3. WHEN clicking a friend's encyclopedia, THE System SHALL navigate to that encyclopedia's detail page
4. THE System SHALL display the friend's collection progress for each encyclopedia
5. THE System SHALL enable trade functionality when viewing friend encyclopedias

### Requirement 33: Global Navigation Bar

**User Story:** As a user, I want a persistent navigation bar, so that I can move between features from anywhere in the application.

#### Acceptance Criteria

1. THE System SHALL display a navigation bar at the top of all pages
2. THE System SHALL include links to Encyclopedia, Inventory, Accounting, and MyPage in the navigation bar
3. THE System SHALL highlight the current page in the navigation bar
4. THE System SHALL maintain navigation bar visibility during scrolling
5. THE System SHALL make the navigation bar responsive for mobile devices

### Requirement 34: Certified Encyclopedia Creation from Public Data

**User Story:** As an administrator, I want to analyze public encyclopedia data to create certified encyclopedias, so that high-quality user contributions become official collections.

#### Acceptance Criteria

1. THE System SHALL provide an admin interface to analyze public Custom_Encyclopedia data
2. WHEN analyzing, THE System SHALL identify encyclopedias with high data quality and user adoption
3. WHEN creating a Certified_Encyclopedia from public data, THE System SHALL notify contributing users
4. THE System SHALL award contributor achievements to users whose data was adopted
5. THE System SHALL maintain attribution records for contributed data

### Requirement 35: Encyclopedia Item Removal

**User Story:** As a user, I want to remove items from my custom encyclopedias, so that I can correct mistakes or reorganize collections.

#### Acceptance Criteria

1. THE System SHALL provide a Remove button in the encyclopedia item detail modal
2. WHEN Remove is clicked, THE System SHALL display a confirmation dialog
3. WHEN removal is confirmed, THE System SHALL unlink the item from the encyclopedia
4. THE System SHALL preserve the Inventory_Item if one was linked
5. THE System SHALL update encyclopedia progress after item removal

### Requirement 36: Data Persistence Strategy

**User Story:** As a user, I want my data saved reliably in the browser, so that I can use the application without a backend server.

#### Acceptance Criteria

1. THE System SHALL use localStorage for all data persistence
2. THE System SHALL structure data to be compatible with future REST API integration
3. THE System SHALL implement data versioning for localStorage schema changes
4. WHEN localStorage quota is exceeded, THE System SHALL display a warning and prevent data loss
5. THE System SHALL provide data export functionality to backup localStorage data

### Requirement 37: Encyclopedia Pretty Printer

**User Story:** As a user, I want to export encyclopedias in a readable format, so that I can share or print my collections.

#### Acceptance Criteria

1. THE System SHALL provide an export function for encyclopedias
2. THE Encyclopedia_Printer SHALL format encyclopedia data into a printable HTML layout
3. THE Encyclopedia_Printer SHALL include item images, names, quantities, and descriptions
4. THE Encyclopedia_Printer SHALL preserve grid layout in the exported format
5. FOR ALL valid encyclopedia objects, exporting then importing SHALL produce an equivalent encyclopedia (round-trip property)

### Requirement 38: Image Processing Quality

**User Story:** As a user, I want uploaded images to maintain quality, so that my collection items are clearly visible.

#### Acceptance Criteria

1. THE System SHALL preserve original image aspect ratios during upload
2. THE System SHALL compress images only when dimensions exceed 2048 pixels
3. WHEN compressing, THE System SHALL maintain image quality above 85% JPEG quality
4. THE System SHALL support PNG transparency for item images
5. THE System SHALL display images at appropriate resolutions for grid and detail views

### Requirement 39: Inventory Category Default Assignment

**User Story:** As a user, I want new inventory items assigned to a default category, so that all items are organized even if I forget to categorize them.

#### Acceptance Criteria

1. WHEN creating an Inventory_Item without selecting a category, THE System SHALL assign it to the "기본" category
2. THE System SHALL allow users to change the default category assignment
3. THE System SHALL display uncategorized items under "기본" in inventory view
4. THE System SHALL count items in "기본" toward total inventory statistics
5. THE System SHALL allow moving items from "기본" to other categories

### Requirement 40: Transaction History Tracking

**User Story:** As a user, I want to see complete transaction history for inventory items, so that I can understand item value changes over time.

#### Acceptance Criteria

1. THE System SHALL record all quantity changes to Inventory_Items in a history table
2. THE System SHALL record timestamp, quantity change, and reason for each history entry
3. WHEN viewing an encyclopedia item linked to inventory, THE System SHALL display all transaction history
4. THE System SHALL display history in reverse chronological order (newest first)
5. THE System SHALL distinguish between manual adjustments and transaction-linked changes
