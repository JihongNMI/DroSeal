# Design Document: DroSeal Phase 1 Infrastructure

## Overview

This design document specifies the technical architecture for DroSeal Phase 1: Core Infrastructure. This phase adds two foundational capabilities to the existing React application:

1. **Global Navigation System**: A persistent navigation bar component that enables seamless navigation across all application pages
2. **Data Persistence Layer**: A localStorage-based storage service with custom React hooks for automatic data synchronization

The implementation follows React best practices with TypeScript, integrates with the existing React Router setup, and uses Tailwind CSS for styling consistency. The design prioritizes developer experience through clear APIs, type safety, and reusable abstractions.

### Key Design Principles

- **Non-invasive Integration**: Add infrastructure without modifying existing feature functionality
- **Type Safety**: Leverage TypeScript for compile-time guarantees and better developer experience
- **Separation of Concerns**: Clear boundaries between UI components, storage logic, and state management
- **Progressive Enhancement**: Graceful degradation when localStorage is unavailable
- **Performance**: Debounced saves and efficient rendering to maintain responsiveness

## Architecture

### System Components

The Phase 1 infrastructure consists of three primary layers:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│  ┌──────────────┐  ┌──────────────────────────────┐    │
│  │   Navbar     │  │   Page Components            │    │
│  │  Component   │  │  (Home, Encyclopedia, etc.)  │    │
│  └──────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 State Management Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │useEncyclopedias│ │useInventory │  │useTransactions│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐                                       │
│  │  useProfile  │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Storage Service Layer                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         LocalStorage Service                     │   │
│  │  - saveData / loadData                          │   │
│  │  - exportData / importData                      │   │
│  │  - Schema versioning & migration                │   │
│  │  - Error handling & fallbacks                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Browser LocalStorage API                    │
└─────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Navigation Flow:**
1. User clicks navigation link in Navbar
2. React Router updates URL and renders target page
3. Navbar automatically highlights active page via NavLink
4. Browser history is updated for back/forward navigation

**Data Persistence Flow:**
1. Component uses custom hook (e.g., `useInventory`)
2. Hook loads initial data from localStorage on mount
3. Component updates state via hook's setter function
4. Hook debounces changes (500ms) and saves to localStorage
5. Storage service handles serialization, versioning, and error handling

## Components and Interfaces

### 1. Navbar Component

**File:** `src/components/Navbar.tsx`

**Purpose:** Provides persistent navigation across all application pages with responsive design and active page indication.

**Component Structure:**

```typescript
interface NavbarProps {
  // No props needed - component is self-contained
}

export function Navbar(): JSX.Element
```

**Implementation Details:**

- Uses React Router's `NavLink` component for automatic active state styling
- Positioned with CSS `sticky` positioning (top: 0, z-index: 50)
- Responsive design:
  - Desktop (≥768px): Horizontal navigation with all links visible
  - Mobile (<768px): Hamburger menu or horizontal scroll
- Styling: Tailwind CSS classes matching blue/indigo gradient theme
- Active link indicator: Different background/text color for current page

**Navigation Links:**
- Home (/)
- Encyclopedia (/encyclopedia)
- Inventory (/inventory)
- Accounting (/accounting)
- My Page (/mypage)

### 2. LocalStorage Service

**File:** `src/services/localStorage.ts`

**Purpose:** Centralized service for all localStorage operations with error handling, versioning, and data migration support.

**Type Definitions:**

```typescript
interface StorageSchema {
  version: number
  data: unknown
}

interface StorageKeys {
  ENCYCLOPEDIAS: 'droseal_encyclopedias'
  INVENTORY_ITEMS: 'droseal_inventory_items'
  INVENTORY_CATEGORIES: 'droseal_inventory_categories'
  TRANSACTIONS: 'droseal_transactions'
  PROFILE: 'droseal_profile'
  FRIENDS: 'droseal_friends'
}

interface StorageQuotaInfo {
  used: number
  available: number
  percentage: number
}
```

**Public API:**

```typescript
// Core operations
function saveData<T>(key: string, data: T): void
function loadData<T>(key: string): T | null
function clearData(key: string): void
function clearAllData(): void

// Import/Export
function exportData(): string
function importData(jsonString: string): void

// Utilities
function getStorageQuota(): StorageQuotaInfo
function isLocalStorageAvailable(): boolean
function migrateData(key: string, oldVersion: number, newVersion: number): void
```

**Error Handling:**

- Quota exceeded: Display error message with export recommendation
- localStorage unavailable: Fall back to in-memory storage with warning
- Corrupted data: Log error, return null, initialize with empty state
- Invalid JSON: Catch parse errors, return null

**Data Versioning:**

Each stored item includes a version field:
```typescript
{
  version: 1,
  data: { /* actual data */ }
}
```

Migration function checks version and transforms data structure when needed.

### 3. Custom React Hooks

**Files:** `src/hooks/useEncyclopedias.ts`, `useInventory.ts`, `useTransactions.ts`, `useProfile.ts`

**Purpose:** Provide stateful data management with automatic localStorage synchronization.

**Hook Pattern:**

```typescript
interface UseDataHook<T> {
  data: T
  setData: (data: T) => void
  loading: boolean
  error: string | null
}

function useEncyclopedias(): UseDataHook<Encyclopedia[]>
function useInventory(): UseDataHook<InventoryState>
function useTransactions(): UseDataHook<Transaction[]>
function useProfile(): UseDataHook<ProfileData>
```

**Hook Implementation Pattern:**

1. **Initialization:** Load data from localStorage on mount
2. **State Management:** Use `useState` for data, loading, and error states
3. **Debounced Save:** Use `useEffect` with debounce to save changes
4. **Error Handling:** Catch and expose errors to consuming components

**Debounce Implementation:**

```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    saveData(STORAGE_KEY, data)
  }, 500) // 500ms debounce delay

  return () => clearTimeout(timeoutId)
}, [data])
```

### 4. Layout Component Integration

**File:** `src/components/Layout.tsx` (new)

**Purpose:** Wrapper component that includes Navbar and provides consistent page structure.

```typescript
interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <>
      <Navbar />
      <main className="pt-16"> {/* Offset for fixed navbar */}
        {children}
      </main>
    </>
  )
}
```

**Integration:** Update `AppRoutes` to wrap all routes with Layout component.

## Data Models

### Encyclopedia Data

```typescript
interface EncyclopediaItem {
  id: string
  name: string
  quantity: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

interface Encyclopedia {
  id: string
  title: string
  description: string
  items: EncyclopediaItem[]
  createdAt: Date
  updatedAt: Date
}

type EncyclopediaData = Encyclopedia[]
```

**Storage Key:** `droseal_encyclopedias`

### Inventory Data

```typescript
interface InventoryCategory {
  id: string
  name: string
  color: string
}

interface InventoryItem {
  id: string
  name: string
  categoryId: string
  quantity: number
  price: number
  purchaseDate: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

interface InventoryState {
  items: InventoryItem[]
  categories: InventoryCategory[]
}
```

**Storage Keys:** 
- Items: `droseal_inventory_items`
- Categories: `droseal_inventory_categories`

### Accounting Data

```typescript
interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: Date
  linkedInventoryItemId?: string
  createdAt: Date
  updatedAt: Date
}

type AccountingData = Transaction[]
```

**Storage Key:** `droseal_transactions`

### Profile Data

```typescript
interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  createdAt: Date
  updatedAt: Date
}

interface Friend {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

interface ProfileData {
  profile: UserProfile
  friends: Friend[]
  friendRequests: Friend[]
}
```

**Storage Keys:**
- Profile: `droseal_profile`
- Friends: `droseal_friends`

### Storage Schema Wrapper

All data stored in localStorage is wrapped with versioning:

```typescript
interface StoredData<T> {
  version: number
  timestamp: string // ISO 8601 format
  data: T
}
```

### Date Serialization

Dates are serialized as ISO 8601 strings and deserialized back to Date objects:

```typescript
// Serialization
const serialize = (obj: unknown): string => {
  return JSON.stringify(obj, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString()
    }
    return value
  })
}

// Deserialization
const deserialize = <T>(json: string): T => {
  return JSON.parse(json, (key, value) => {
    // Check if value matches ISO 8601 date format
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value)
    }
    return value
  })
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Requirements 1.4, 3.3, and 14.4 all test active page indication (consolidated into Property 1)
- Requirements 4.1-4.6 all test storage key usage (consolidated into Property 2)
- Requirements 4.8 and 8.1 both test schema version inclusion (consolidated into Property 3)
- Requirements 7.4 and 9.3 both test quota exceeded error handling (consolidated into example tests)
- Requirements 7.3 and 10.5 both test export functionality (consolidated into example tests)
- Requirements 5.2 and 15.3 both test debouncing behavior (consolidated into example tests)

### Property 1: Active Page Indication

*For any* valid application route, when that route is active, the corresponding navigation link in the Navbar SHALL display active state styling.

**Validates: Requirements 1.4, 3.3, 14.4**

### Property 2: Storage Key Consistency

*For any* data type (encyclopedias, inventory items, inventory categories, transactions, profile, friends), saving that data SHALL use the correct predefined localStorage key for that data type.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

### Property 3: Schema Version Inclusion

*For any* data stored in localStorage, the stored structure SHALL include a version field with a numeric value.

**Validates: Requirements 4.8, 8.1**

### Property 4: JSON Serialization Format

*For any* data saved to localStorage, the stored value SHALL be valid JSON that can be parsed without errors.

**Validates: Requirements 4.7**

### Property 5: Automatic State Persistence

*For any* application state change, the updated data SHALL be saved to localStorage (after debounce delay).

**Validates: Requirements 5.1**

### Property 6: Empty State Initialization

*For any* localStorage key that does not exist, loading data for that key SHALL return an empty/default state without errors.

**Validates: Requirements 6.2**

### Property 7: Data Migration Preservation

*For any* stored data with an older schema version, loading that data SHALL migrate it to the current version while preserving all data fields.

**Validates: Requirements 8.2**

### Property 8: Clear Data Removal

*For any* localStorage key, calling clearData with that key SHALL remove the data from localStorage such that subsequent loads return empty state.

**Validates: Requirements 10.3**

### Property 9: Import Data Restoration

*For any* valid exported data JSON string, importing that data SHALL restore the application state to match the exported state.

**Validates: Requirements 10.6, 12.6**

### Property 10: Hook Initialization

*For any* custom data hook (useEncyclopedias, useInventory, useTransactions, useProfile), mounting a component that uses the hook SHALL load data from localStorage.

**Validates: Requirements 11.5**

### Property 11: Hook Auto-Save

*For any* custom data hook, when the state changes, the hook SHALL trigger a save to localStorage after the debounce delay.

**Validates: Requirements 11.6**

### Property 12: Import Validation

*For any* imported data, the application SHALL validate the JSON structure before applying it, rejecting invalid structures.

**Validates: Requirements 12.4**

### Property 13: Date Serialization Round-Trip

*For any* application state object containing Date objects, serializing then deserializing SHALL produce an equivalent object with Date objects preserved.

**Validates: Requirements 13.1, 13.2, 13.4**

### Property 14: Undefined to Null Conversion

*For any* data containing undefined values, serialization SHALL convert undefined to null in the JSON output.

**Validates: Requirements 13.3**

### Property 15: Navigation URL Update

*For any* navigation link click, the browser URL SHALL update to match the target route.

**Validates: Requirements 14.1**

## Error Handling

### LocalStorage Unavailability

**Scenario:** User is in private browsing mode or localStorage is disabled

**Handling:**
1. Detect localStorage availability on application startup
2. Display warning message to user: "Local storage is unavailable. Your data will not be saved between sessions."
3. Fall back to in-memory storage using a Map object
4. All storage operations continue to work, but data is lost on page refresh

**Implementation:**
```typescript
let storageBackend: 'localStorage' | 'memory' = 'localStorage'
const memoryStorage = new Map<string, string>()

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

function getItem(key: string): string | null {
  if (storageBackend === 'localStorage') {
    return localStorage.getItem(key)
  }
  return memoryStorage.get(key) ?? null
}
```

### Quota Exceeded

**Scenario:** User has stored too much data (>5-10MB typically)

**Handling:**
1. Catch QuotaExceededError during save operations
2. Display error message: "Storage quota exceeded. Please export your data as a backup and consider removing old items."
3. Provide "Export Data" button in error message
4. Log error details for debugging
5. Do not overwrite existing data

**Implementation:**
```typescript
function saveData<T>(key: string, data: T): void {
  try {
    const serialized = serialize(data)
    localStorage.setItem(key, serialized)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      showQuotaExceededError()
    } else {
      console.error('Failed to save data:', error)
      throw error
    }
  }
}
```

### Corrupted Data

**Scenario:** localStorage contains invalid JSON or corrupted data

**Handling:**
1. Catch JSON parse errors during load operations
2. Log error with key and corrupted data (truncated)
3. Display warning message: "Some saved data could not be loaded. Starting with empty state."
4. Return empty/default state for that data type
5. Do not overwrite corrupted data (allow user to export/recover if possible)

**Implementation:**
```typescript
function loadData<T>(key: string, defaultValue: T): T {
  try {
    const item = getItem(key)
    if (!item) return defaultValue
    return deserialize<T>(item)
  } catch (error) {
    console.error(`Failed to load data for key "${key}":`, error)
    showDataCorruptionWarning(key)
    return defaultValue
  }
}
```

### Storage Quota Monitoring

**Scenario:** User is approaching storage limits

**Handling:**
1. Calculate storage usage after each save operation
2. If usage > 80% of estimated quota (4MB of 5MB):
   - Display warning banner: "You're using 80% of available storage. Consider exporting data as backup."
   - Show "Export Data" button in banner
3. If usage > 90%:
   - Display urgent warning with export recommendation
4. Update warning state in React context for UI display

**Implementation:**
```typescript
function getStorageQuota(): StorageQuotaInfo {
  let used = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('droseal_')) {
      const value = localStorage.getItem(key)
      used += (key.length + (value?.length ?? 0)) * 2 // UTF-16 encoding
    }
  }
  
  const available = 5 * 1024 * 1024 // Assume 5MB quota
  const percentage = (used / available) * 100
  
  return { used, available, percentage }
}
```

### Migration Errors

**Scenario:** Data migration fails due to unexpected data structure

**Handling:**
1. Wrap migration logic in try-catch
2. If migration fails, log error with version information
3. Display error message: "Failed to migrate data from version X to Y. Please export your data and contact support."
4. Return unmigrated data (allow app to attempt to work with old structure)
5. Set error flag to prevent repeated migration attempts

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific UI examples (Navbar rendering, button clicks)
- Edge cases (empty data, corrupted JSON, quota exceeded)
- Error conditions (localStorage unavailable, parse failures)
- Integration points (React Router integration, hook mounting)

**Property-Based Tests** focus on:
- Universal properties across all data types and inputs
- Round-trip serialization/deserialization
- Storage key consistency across all data types
- State persistence for any valid state change
- Data migration for any version combination

### Property-Based Testing Configuration

**Library:** Use `fast-check` for TypeScript property-based testing

**Installation:**
```bash
npm install --save-dev fast-check @types/fast-check
```

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with comment referencing design property
- Tag format: `// Feature: droseal-phase1-infrastructure, Property {number}: {property_text}`

**Example Property Test:**

```typescript
import fc from 'fast-check'

// Feature: droseal-phase1-infrastructure, Property 13: Date Serialization Round-Trip
describe('Date Serialization Round-Trip', () => {
  it('should preserve Date objects through serialize/deserialize cycle', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string(),
          createdAt: fc.date(),
          updatedAt: fc.date(),
          data: fc.anything()
        }),
        (obj) => {
          const serialized = serialize(obj)
          const deserialized = deserialize(serialized)
          
          expect(deserialized.createdAt).toBeInstanceOf(Date)
          expect(deserialized.updatedAt).toBeInstanceOf(Date)
          expect(deserialized.createdAt.getTime()).toBe(obj.createdAt.getTime())
          expect(deserialized.updatedAt.getTime()).toBe(obj.updatedAt.getTime())
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Unit Test Examples

**Navbar Component Tests:**
```typescript
describe('Navbar Component', () => {
  it('should render all navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Encyclopedia')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Accounting')).toBeInTheDocument()
    expect(screen.getByText('My Page')).toBeInTheDocument()
  })
  
  it('should have sticky positioning', () => {
    const { container } = render(<Navbar />)
    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('sticky')
  })
})
```

**Storage Service Tests:**
```typescript
describe('LocalStorage Service', () => {
  it('should handle corrupted JSON gracefully', () => {
    localStorage.setItem('droseal_test', 'invalid json{')
    const result = loadData('droseal_test', [])
    expect(result).toEqual([])
  })
  
  it('should show warning when quota exceeded', () => {
    const largeData = 'x'.repeat(10 * 1024 * 1024) // 10MB
    expect(() => saveData('test', largeData)).toThrow()
    // Verify warning message displayed
  })
})
```

### Test Coverage Goals

- **Unit Test Coverage:** >80% line coverage for all new code
- **Property Test Coverage:** All 15 correctness properties implemented
- **Integration Tests:** Key user flows (navigation, data persistence, import/export)
- **Accessibility Tests:** Navbar keyboard navigation, ARIA labels, contrast ratios

### Testing Tools

- **Test Runner:** Vitest (already configured with Vite)
- **React Testing:** @testing-library/react
- **Property Testing:** fast-check
- **Accessibility:** @testing-library/jest-dom, axe-core
- **Mocking:** vi.mock for localStorage and React Router

