# Design Document

## Introduction

This document describes the technical design for Phase 1 future enhancements and incomplete features. Phase 1 established the core infrastructure (Navbar, localStorage, hooks), but several important features remain unimplemented: data import/export, error handling, storage quota management, and performance optimizations. These features are essential for production readiness and will be particularly important when integrating with the backend API.

## System Architecture

### Current Phase 1 Architecture

```
React Components
├── Navbar (navigation)
├── Layout (wrapper)
└── Pages (Encyclopedia, Inventory, Accounting, MyPage)
    ↓
Custom Hooks (useEncyclopedias, useInventory, useTransactions, useProfile)
    ↓
localStorage Service (save/load with debouncing)
    ↓
Browser localStorage (5-10MB limit)
```

### Enhanced Architecture (with Future Features)

```
React Components
├── Navbar
├── Layout
├── StorageQuotaWarning (new)
└── Pages
    ├── Settings/MyPage
    │   ├── ExportButton (new)
    │   └── ImportButton (new)
    └── Other pages
        ↓
Custom Hooks (with error handling)
    ↓
localStorage Service (with quota monitoring, error handling, versioning)
    ↓
Browser localStorage
```

## Feature Designs

### 1. Data Import/Export

#### Purpose

Allow users to backup and restore their data as JSON files. Critical for:
- Data portability between browsers/devices
- Backup before major updates
- Recovery from localStorage corruption
- **Future: Migration to backend** (export → upload to server)

#### Technical Implementation

**Export Function**:
```typescript
interface ExportData {
  version: number
  exportDate: string
  data: {
    encyclopedias: Encyclopedia[]
    inventoryItems: InventoryItem[]
    inventoryCategories: InventoryCategory[]
    transactions: Transaction[]
    profile: UserProfile
    friends: Friend[]
  }
}

function exportData(): string {
  const exportData: ExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    data: {
      encyclopedias: loadData('droseal_encyclopedias') || [],
      inventoryItems: loadData('droseal_inventory_items') || [],
      inventoryCategories: loadData('droseal_inventory_categories') || [],
      transactions: loadData('droseal_transactions') || [],
      profile: loadData('droseal_profile') || {},
      friends: loadData('droseal_friends') || []
    }
  }
  
  return JSON.stringify(exportData, null, 2)
}
```

**File Download**:
```typescript
function downloadExport() {
  const jsonString = exportData()
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `droseal-backup-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}
```

**Import Function**:
```typescript
function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const importData: ExportData = JSON.parse(jsonString)
    
    // Validate structure
    if (!importData.version || !importData.data) {
      return { success: false, error: 'Invalid file format' }
    }
    
    // Validate version compatibility
    if (importData.version > CURRENT_VERSION) {
      return { success: false, error: 'File from newer version, please update app' }
    }
    
    // Save all data
    saveData('droseal_encyclopedias', importData.data.encyclopedias)
    saveData('droseal_inventory_items', importData.data.inventoryItems)
    saveData('droseal_inventory_categories', importData.data.inventoryCategories)
    saveData('droseal_transactions', importData.data.transactions)
    saveData('droseal_profile', importData.data.profile)
    saveData('droseal_friends', importData.data.friends)
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to parse file' }
  }
}
```

**UI Components**:
- Export button in MyPage/Settings: "데이터 백업"
- Import button in MyPage/Settings: "데이터 복원"
- File input (hidden, triggered by button)
- Success/error toast notifications

#### Data Model

Uses existing data structures. Export format includes version for future compatibility.

---

### 2. Error Handling

#### Purpose

Gracefully handle localStorage failures, corrupted data, and quota exceeded errors. Prevents data loss and provides clear user feedback.

#### Technical Implementation

**Corrupted Data Handling**:
```typescript
function loadData<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    
    const parsed = JSON.parse(item)
    
    // Validate basic structure
    if (!parsed.version || !parsed.data) {
      console.error(`Corrupted data in ${key}`)
      // Log to error tracking service
      return null
    }
    
    return deserialize(parsed.data)
  } catch (error) {
    console.error(`Failed to load ${key}:`, error)
    // Show user-friendly warning
    showWarning(`일부 데이터를 불러올 수 없습니다. 백업에서 복원하시겠습니까?`)
    return null
  }
}
```

**Quota Exceeded Handling**:
```typescript
function saveData<T>(key: string, data: T): void {
  try {
    const serialized = serialize(data)
    const wrapped = {
      version: CURRENT_VERSION,
      data: serialized
    }
    localStorage.setItem(key, JSON.stringify(wrapped))
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Show quota exceeded error
      showError(
        '저장 공간이 부족합니다. 데이터를 백업한 후 일부 항목을 삭제해주세요.',
        {
          actions: [
            { label: '데이터 백업', onClick: downloadExport },
            { label: '닫기', onClick: () => {} }
          ]
        }
      )
    } else {
      showError('데이터 저장에 실패했습니다.')
    }
    throw error // Re-throw to prevent UI from showing success
  }
}
```

**localStorage Unavailable Fallback**:
```typescript
// Already implemented in Phase 1
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

// Use memoryStorage as fallback (already in place)
```

#### UI Components

- Toast notifications for errors
- Modal dialogs for critical errors (quota exceeded)
- Warning banner for corrupted data

---

### 3. Storage Quota Management

#### Purpose

Monitor localStorage usage and warn users before hitting the limit. Prevents unexpected save failures.

#### Technical Implementation

**Quota Calculation**:
```typescript
interface StorageQuotaInfo {
  used: number        // bytes
  available: number   // bytes (estimated)
  percentage: number  // 0-100
}

function getStorageQuota(): StorageQuotaInfo {
  let used = 0
  
  // Calculate size of all droseal_ keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('droseal_')) {
      const value = localStorage.getItem(key)
      if (value) {
        // Approximate size in bytes (UTF-16)
        used += (key.length + value.length) * 2
      }
    }
  }
  
  // localStorage limit is typically 5-10MB
  const available = 5 * 1024 * 1024 // Assume 5MB
  const percentage = (used / available) * 100
  
  return { used, available, percentage }
}
```

**Quota Monitoring**:
```typescript
// Check quota after each save
function saveDataWithQuotaCheck<T>(key: string, data: T): void {
  saveData(key, data)
  
  const quota = getStorageQuota()
  
  if (quota.percentage > 90) {
    showUrgentWarning(
      `저장 공간이 ${quota.percentage.toFixed(0)}% 사용되었습니다. 곧 저장이 불가능해집니다.`,
      { action: '데이터 백업', onClick: downloadExport }
    )
  } else if (quota.percentage > 80) {
    showWarning(
      `저장 공간이 ${quota.percentage.toFixed(0)}% 사용되었습니다.`,
      { action: '데이터 백업', onClick: downloadExport }
    )
  }
}
```

**UI Components**:
```tsx
function StorageQuotaWarning() {
  const [quota, setQuota] = useState<StorageQuotaInfo | null>(null)
  
  useEffect(() => {
    const checkQuota = () => {
      const info = getStorageQuota()
      if (info.percentage > 80) {
        setQuota(info)
      } else {
        setQuota(null)
      }
    }
    
    checkQuota()
    const interval = setInterval(checkQuota, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])
  
  if (!quota) return null
  
  const isUrgent = quota.percentage > 90
  
  return (
    <div className={`p-4 ${isUrgent ? 'bg-red-100' : 'bg-yellow-100'}`}>
      <p className="font-medium">
        저장 공간이 {quota.percentage.toFixed(0)}% 사용되었습니다
        {isUrgent && ' - 곧 저장이 불가능해집니다!'}
      </p>
      <button onClick={downloadExport} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        데이터 백업
      </button>
    </div>
  )
}
```

---

### 4. Data Versioning and Migration

#### Purpose

Support schema changes over time without breaking existing user data. Essential for long-term maintenance.

#### Technical Implementation

**Version Tracking**:
```typescript
const CURRENT_VERSION = 1

interface VersionedData<T> {
  version: number
  data: T
}

function saveData<T>(key: string, data: T): void {
  const wrapped: VersionedData<T> = {
    version: CURRENT_VERSION,
    data: serialize(data)
  }
  localStorage.setItem(key, JSON.stringify(wrapped))
}

function loadData<T>(key: string): T | null {
  const item = localStorage.getItem(key)
  if (!item) return null
  
  const parsed: VersionedData<T> = JSON.parse(item)
  
  // Check if migration needed
  if (parsed.version < CURRENT_VERSION) {
    const migrated = migrateData(key, parsed.data, parsed.version, CURRENT_VERSION)
    saveData(key, migrated) // Save migrated version
    return migrated
  }
  
  return deserialize(parsed.data)
}
```

**Migration Function**:
```typescript
function migrateData<T>(key: string, data: T, fromVersion: number, toVersion: number): T {
  let migrated = data
  
  // Apply migrations sequentially
  for (let v = fromVersion; v < toVersion; v++) {
    migrated = applyMigration(key, migrated, v, v + 1)
  }
  
  return migrated
}

function applyMigration<T>(key: string, data: T, fromVersion: number, toVersion: number): T {
  // Example: Version 1 to 2 migration
  if (fromVersion === 1 && toVersion === 2) {
    // Add new field, rename field, etc.
    return {
      ...data,
      // migration logic here
    }
  }
  
  return data
}
```

**Backup Before Migration**:
```typescript
function migrateData<T>(key: string, data: T, fromVersion: number, toVersion: number): T {
  // Create backup
  const backupKey = `${key}_backup_v${fromVersion}`
  localStorage.setItem(backupKey, JSON.stringify({ version: fromVersion, data }))
  
  try {
    let migrated = data
    for (let v = fromVersion; v < toVersion; v++) {
      migrated = applyMigration(key, migrated, v, v + 1)
    }
    return migrated
  } catch (error) {
    // Restore from backup on failure
    console.error('Migration failed, restoring backup:', error)
    const backup = localStorage.getItem(backupKey)
    if (backup) {
      const parsed = JSON.parse(backup)
      return parsed.data
    }
    throw error
  }
}
```

---

### 5. Performance Optimizations

#### Purpose

Ensure the app remains responsive even with large datasets and frequent updates.

#### Technical Implementation

**Debouncing (Already Implemented)**:
```typescript
// Already in Phase 1
useEffect(() => {
  const timer = setTimeout(() => {
    saveData(STORAGE_KEY, data)
  }, 500)
  
  return () => clearTimeout(timer)
}, [data])
```

**Save Operation Performance**:
```typescript
// Ensure saves don't block main thread
function saveDataAsync<T>(key: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use setTimeout to defer to next tick
    setTimeout(() => {
      try {
        saveData(key, data)
        resolve()
      } catch (error) {
        reject(error)
      }
    }, 0)
  })
}
```

**Loading Indicator**:
```typescript
function useDataWithLoading<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const startTime = Date.now()
    const loaded = loadData<T>(key)
    const loadTime = Date.now() - startTime
    
    setData(loaded || defaultValue)
    
    // Only show loading if it took > 100ms
    if (loadTime > 100) {
      setLoading(false)
    } else {
      // Delay to prevent flash
      setTimeout(() => setLoading(false), 100)
    }
  }, [key])
  
  return { data, setData, loading }
}
```

**Navbar Render Optimization**:
```typescript
// Memoize Navbar to prevent unnecessary re-renders
export const Navbar = React.memo(function Navbar() {
  // ... navbar implementation
})
```

---

## Integration with Backend (Future)

### Hybrid Storage Strategy

When backend API is available, localStorage will serve as a **local cache** with periodic sync:

```
User Action → localStorage (immediate) → Backend API (async sync)
                ↓
          UI updates instantly
```

**Sync Strategy**:
1. **On Load**: Fetch from backend → Update localStorage
2. **On Change**: Save to localStorage → Queue API call
3. **Periodic Sync**: Every 30 seconds, sync pending changes
4. **Conflict Resolution**: Last-write-wins or user prompt

**Export/Import for Migration**:
1. User exports data from localStorage
2. Backend provides "bulk import" endpoint
3. User uploads JSON file
4. Backend populates database
5. Future sessions load from backend

---

## Error Handling Strategy

### Error Types and Responses

| Error Type | User Message | Action |
|------------|--------------|--------|
| Corrupted Data | "일부 데이터를 불러올 수 없습니다" | Offer restore from backup |
| Quota Exceeded | "저장 공간이 부족합니다" | Offer export + cleanup |
| localStorage Unavailable | "브라우저 저장소를 사용할 수 없습니다" | Use memory fallback |
| Import Invalid | "잘못된 파일 형식입니다" | Show format requirements |
| Migration Failed | "데이터 업데이트에 실패했습니다" | Restore from backup |

### Error Logging

```typescript
interface ErrorLog {
  timestamp: string
  type: string
  message: string
  stack?: string
  context?: any
}

function logError(error: Error, context?: any) {
  const log: ErrorLog = {
    timestamp: new Date().toISOString(),
    type: error.name,
    message: error.message,
    stack: error.stack,
    context
  }
  
  // Log to console
  console.error('DroSeal Error:', log)
  
  // Future: Send to error tracking service (Sentry, etc.)
}
```

---

## Testing Strategy

### Unit Tests

- Export/import round-trip
- Quota calculation accuracy
- Migration logic for each version
- Error handling for each error type

### Integration Tests

- Export → Import → Verify data integrity
- Quota warning triggers at correct thresholds
- Migration preserves all data
- Corrupted data recovery

### Manual Testing

- Export on different browsers
- Import on different browsers
- Fill localStorage to quota limit
- Corrupt localStorage manually and test recovery

---

## Future Enhancements

### Potential Improvements

1. **Automatic Backups**: Periodic auto-export to downloads folder
2. **Cloud Sync**: Sync to Google Drive, Dropbox, etc.
3. **Compression**: Compress data before storing (LZ-string)
4. **Incremental Export**: Export only changes since last export
5. **Import Merge**: Merge imported data with existing data (not replace)
6. **Data Validation**: JSON schema validation on import
7. **Encryption**: Encrypt sensitive data in localStorage

---

## Conclusion

Phase 1 Future Plan features are essential for production readiness. Import/export provides data portability and backup capabilities, error handling ensures robustness, quota management prevents unexpected failures, and versioning enables long-term maintenance. These features will be particularly valuable when integrating with the backend API, as they provide a smooth migration path and fallback mechanisms.
