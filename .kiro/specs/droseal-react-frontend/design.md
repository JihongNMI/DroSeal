# Design Document: DroSeal React Frontend

## Overview

The DroSeal React Frontend is a modern single-page application (SPA) built with React 18, Vite 5, and TypeScript. The application will be scaffolded using Vite's React-TypeScript template, providing a fast development experience with Hot Module Replacement (HMR) and optimized production builds.

The frontend will be located in the `DroSeal-front` directory and will serve as the user interface layer for the DroSeal system. The architecture emphasizes component reusability, type safety, and developer experience through modern tooling.

### MVP Scope

This design includes MVP (Minimum Viable Product) features for the DroSeal collector service:
- **Encyclopedia**: Card-based collection view with quick edit and custom entries
- **Inventory**: List-based item management with hierarchical categories
- **Accounting**: Financial dashboard with transaction tracking and item linking
- **My Page**: User profile and social friend management

**Important MVP Considerations:**
- Database schema is not finalized - data models are kept generic and flexible
- State management uses React built-in hooks (useState, useContext) for simplicity
- Focus on core functionality with basic UI/UX
- Backend API integration is future work - MVP uses local state
- Authentication and authorization are future requirements

Key technologies:
- **React 18**: UI framework with concurrent features and improved performance
- **Vite 5**: Next-generation build tool with lightning-fast HMR
- **TypeScript 5**: Type-safe JavaScript with enhanced IDE support
- **Tailwind CSS 3**: Utility-first CSS framework for rapid UI development
- **React Router DOM 6**: Declarative routing for React applications
- **ESLint**: Code quality and consistency enforcement

## Architecture

### High-Level Architecture

The application follows a standard React SPA architecture with Vite as the build system:

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │           React Application (SPA)                  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │    BrowserRouter (React Router DOM)          │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │         App Component (Root)           │  │  │  │
│  │  │  │  ┌─────────────────────────────────┐  │  │  │  │
│  │  │  │  │    Routes Configuration          │  │  │  │  │
│  │  │  │  │  - Page Components               │  │  │  │  │
│  │  │  │  │  - Layout Components             │  │  │  │  │
│  │  │  │  │  - Reusable UI Components        │  │  │  │  │
│  │  │  │  │    (styled with Tailwind CSS)    │  │  │  │  │
│  │  │  │  └─────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
                    Vite Dev Server
                    (Development)
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Build System (Vite)                     │
│  - TypeScript Compilation                                │
│  - PostCSS Processing (Tailwind CSS + Autoprefixer)     │
│  - Module Bundling                                       │
│  - Asset Processing                                      │
│  - Code Splitting (Route-based)                          │
│  - CSS Purging (Unused Tailwind classes)                 │
│  - Minification & Optimization                           │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
DroSeal-front/
├── public/                    # Static assets (copied as-is)
│   └── favicon.ico
├── src/
│   ├── components/           # Reusable React components
│   │   ├── App.tsx          # Root application component
│   │   └── Layout.tsx       # Shared layout component (future)
│   ├── pages/               # Page components for routes
│   │   ├── Home.tsx         # Home/landing page
│   │   ├── Encyclopedia.tsx # Encyclopedia page (MVP)
│   │   ├── Inventory.tsx    # Inventory page (MVP)
│   │   ├── Accounting.tsx   # Accounting page (MVP)
│   │   ├── MyPage.tsx       # My Page (MVP)
│   │   └── NotFound.tsx     # 404 error page
│   ├── routes/              # Routing configuration
│   │   └── index.tsx        # Route definitions
│   ├── assets/              # Processed assets (images, fonts)
│   ├── styles/              # Global styles
│   │   └── index.css        # Tailwind CSS imports and custom styles
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type definitions
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript config for Node (Vite config)
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── .eslintrc.cjs            # ESLint configuration
├── .gitignore               # Git ignore rules
├── .env.example             # Environment variable template
└── README.md                # Project documentation
```

### Build Pipeline

**Development Mode:**
1. Vite dev server starts on `http://localhost:5173`
2. TypeScript files are transpiled on-demand (no type checking in dev)
3. PostCSS processes Tailwind CSS directives with JIT (Just-In-Time) compilation
4. HMR updates modules in <100ms without full page reload
5. Source maps enable debugging of original TypeScript code

**Production Mode:**
1. TypeScript compilation with full type checking
2. Tailwind CSS purges unused utility classes based on content paths
3. PostCSS applies autoprefixer for cross-browser compatibility
4. Tree-shaking removes unused code
5. Code splitting creates optimized chunks (route-based lazy loading)
6. Assets are hashed for cache busting
7. Output written to `dist/` directory

### Styling Architecture (Tailwind CSS)

**Tailwind CSS Integration:**
- Utility-first approach for rapid UI development
- JIT mode for on-demand class generation in development
- Automatic purging of unused classes in production
- Custom theme configuration for brand-specific design tokens
- PostCSS pipeline for processing and optimization

**CSS Processing Pipeline:**
```
src/styles/index.css
  ↓
@tailwind directives
  ↓
PostCSS (tailwindcss plugin)
  ↓
Tailwind JIT Compiler (dev) / Full Build + Purge (prod)
  ↓
PostCSS (autoprefixer plugin)
  ↓
Optimized CSS output
```

### Routing Architecture (React Router DOM)

**Client-Side Routing:**
- BrowserRouter for HTML5 history API navigation
- Declarative route configuration with nested routes support
- Route-based code splitting for optimal bundle sizes
- Programmatic navigation via useNavigate hook
- URL parameter extraction via useParams hook
- 404 handling with catch-all route

**Route Structure:**
```
/                    → Home page
/encyclopedia        → Encyclopedia page (card-based collection view)
/inventory           → Inventory page (list-based item management)
/accounting          → Accounting page (financial dashboard and transactions)
/mypage              → My Page (user profile and friends)
/*                   → 404 Not Found page
```

**Navigation Flow:**
```
User clicks link/button
  ↓
React Router intercepts navigation
  ↓
Updates browser URL (no page reload)
  ↓
Matches URL to route configuration
  ↓
Lazy loads component if needed
  ↓
Renders matched component
  ↓
Updates browser history
```

## Components and Interfaces

### Core Components

#### 1. App Component (`src/components/App.tsx`)

The root component that configures routing and serves as the application entry point.

```typescript
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '../routes'

interface AppProps {
  // Future: theme, global state providers
}

export function App(props: AppProps): JSX.Element {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
```

**Responsibilities:**
- Wrap application with BrowserRouter
- Provide routing context to child components
- Serve as mounting point for global providers (future)

#### 2. Routes Configuration (`src/routes/index.tsx`)

Centralized route definitions with lazy loading support.

```typescript
import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Eager loading for critical routes
import Home from '../pages/Home'

// Lazy loading for MVP routes
const Encyclopedia = lazy(() => import('../pages/Encyclopedia'))
const Inventory = lazy(() => import('../pages/Inventory'))
const Accounting = lazy(() => import('../pages/Accounting'))
const MyPage = lazy(() => import('../pages/MyPage'))
const NotFound = lazy(() => import('../pages/NotFound'))

export function AppRoutes(): JSX.Element {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/encyclopedia" element={<Encyclopedia />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}


**Responsibilities:**
- Define all application routes
- Configure lazy loading for route components
- Provide loading fallback UI
- Handle 404 with catch-all route

#### 3. Home Page Component (`src/pages/Home.tsx`)

Landing page component with Tailwind CSS styling.

```typescript
import { Link } from 'react-router-dom'

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to DroSeal
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Modern React application with Vite, TypeScript, and Tailwind CSS
        </p>
        
        {/* MVP Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link 
            to="/encyclopedia" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Encyclopedia</h2>
            <p className="text-gray-600">View your collection in card format</p>
          </Link>
          
          <Link 
            to="/inventory" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Inventory</h2>
            <p className="text-gray-600">Manage individual items</p>
          </Link>
          
          <Link 
            to="/accounting" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Accounting</h2>
            <p className="text-gray-600">Track finances and transactions</p>
          </Link>
          
          <Link 
            to="/mypage" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Page</h2>
            <p className="text-gray-600">Profile and friends</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**Responsibilities:**
- Render landing page content
- Demonstrate Tailwind CSS utility classes
- Provide navigation to MVP routes

#### 4. NotFound Page Component (`src/pages/NotFound.tsx`)

404 error page for undefined routes.

```typescript
import { Link } from 'react-router-dom'

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
```

**Responsibilities:**
- Display user-friendly 404 error message
- Provide navigation back to home page
- Demonstrate Tailwind CSS styling

### MVP Page Components

#### 5. Encyclopedia Page Component (`src/pages/Encyclopedia.tsx`)

Card-based collection view with quick edit functionality and custom entry support.

```typescript
import { useState } from 'react'

interface CollectionItem {
  id: string
  name: string
  imageUrl: string
  ownedQuantity: number
  totalQuantity: number
  notes?: string
  isCustom?: boolean
}

export default function Encyclopedia(): JSX.Element {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [showCustomModal, setShowCustomModal] = useState(false)

  const calculateProgress = (owned: number, total: number): number => {
    return total > 0 ? (owned / total) * 100 : 0
  }

  const handleQuantityChange = (id: string, delta: number) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ownedQuantity: Math.max(0, item.ownedQuantity + delta) }
        : item
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Encyclopedia</h1>
          <button 
            onClick={() => setShowCustomModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Custom Entry
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow group"
            >
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-md mb-3"
              />
              <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{calculateProgress(item.ownedQuantity, item.totalQuantity).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${calculateProgress(item.ownedQuantity, item.totalQuantity)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {item.ownedQuantity} / {item.totalQuantity}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={item.ownedQuantity === 0}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Notes edit interface - shown on hover */}
              <div className="hidden group-hover:block mt-3 pt-3 border-t border-gray-200">
                <textarea 
                  placeholder="Add notes (damaged, unopened, etc.)"
                  className="w-full text-sm border border-gray-300 rounded p-2"
                  rows={2}
                  defaultValue={item.notes}
                />
              </div>
              
              {item.notes && (
                <p className="text-xs text-gray-500 mt-2 group-hover:hidden">{item.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Responsibilities:**
- Display collection items in card-based grid layout
- Calculate and display progress percentage for each item
- Provide quick quantity adjustment with +/- buttons
- Show notes edit interface on hover
- Support custom encyclopedia entry creation

#### 6. Inventory Page Component (`src/pages/Inventory.tsx`)

List-based inventory management with category filtering and hierarchical organization.

```typescript
import { useState } from 'react'

interface Category {
  id: string
  name: string
  parentId?: string
}

interface InventoryItem {
  id: string
  name: string
  categoryId: string
  quantity: number
  notes?: string
}

export default function Inventory(): JSX.Element {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const getChildCategories = (parentId: string): string[] => {
    const children = categories.filter(c => c.parentId === parentId).map(c => c.id)
    const grandChildren = children.flatMap(id => getChildCategories(id))
    return [...children, ...grandChildren]
  }

  const filteredItems = selectedCategories.length === 0 
    ? items 
    : items.filter(item => {
        const allCategories = selectedCategories.flatMap(catId => 
          [catId, ...getChildCategories(catId)]
        )
        return allCategories.includes(item.categoryId)
      })

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Item
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category filter sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.filter(c => !c.parentId).map(category => (
                  <div key={category.id}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories(prev => [...prev, category.id])
                          } else {
                            setSelectedCategories(prev => prev.filter(id => id !== category.id))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                    {/* Child categories */}
                    {categories.filter(c => c.parentId === category.id).map(child => (
                      <div key={child.id} className="ml-6 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={selectedCategories.includes(child.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories(prev => [...prev, child.id])
                              } else {
                                setSelectedCategories(prev => prev.filter(id => id !== child.id))
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-600">{child.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items list */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map(item => {
                      const category = categories.find(c => c.id === item.categoryId)
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{category?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-6 py-4 text-sm">
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Responsibilities:**
- Display inventory items in list-based layout
- Support category filtering with hierarchical relationships
- Provide add/delete functionality for items
- Show category tree structure in sidebar
- Filter items by parent categories including all children

#### 7. Accounting Page Component (`src/pages/Accounting.tsx`)

Financial dashboard with transaction history and inventory linking.

```typescript
import { useState } from 'react'

interface TransactionRecord {
  id: string
  type: 'purchase' | 'sale'
  price: number
  date: Date
  source?: string
  shippingCost?: number
  fee?: number
  linkedInventoryId?: string
}

export default function Accounting(): JSX.Element {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const totalExpenses = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.price, 0)

  const totalRevenue = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.price - (t.shippingCost || 0) - (t.fee || 0), 0)

  const currentAssetValue = transactions
    .filter(t => t.type === 'purchase' && !transactions.some(s => s.type === 'sale' && s.linkedInventoryId === t.linkedInventoryId))
    .reduce((sum, t) => sum + t.price, 0)

  const sortedTransactions = [...transactions].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Accounting</h1>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-red-600">¥{totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">¥{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current Asset Value</h3>
            <p className="text-3xl font-bold text-blue-600">¥{currentAssetValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Transaction list */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Transaction
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Linked Item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'purchase' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ¥{transaction.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.type === 'purchase' && transaction.source && (
                        <span>Source: {transaction.source}</span>
                      )}
                      {transaction.type === 'sale' && (
                        <span>
                          Shipping: ¥{transaction.shippingCost || 0}, Fee: ¥{transaction.fee || 0}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.linkedInventoryId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Responsibilities:**
- Display financial dashboard with summary cards
- Calculate total expenses, revenue, and asset value
- Show transaction history in chronological order
- Support linking transactions to inventory items
- Provide add transaction functionality

#### 8. My Page Component (`src/pages/MyPage.tsx`)

User profile management and social friend system.

```typescript
import { useState } from 'react'

interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
}

interface Friend {
  id: string
  username: string
  displayName: string
}

interface FriendRequest {
  id: string
  fromUserId: string
  fromUsername: string
  status: 'pending' | 'accepted' | 'rejected'
}

export default function MyPage(): JSX.Element {
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    username: 'user123',
    email: 'user@example.com',
    displayName: 'User Name'
  })
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [isEditing, setIsEditing] = useState(false)

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId)
    if (request) {
      setFriends(prev => [...prev, {
        id: request.fromUserId,
        username: request.fromUsername,
        displayName: request.fromUsername
      }])
      setFriendRequests(prev => prev.filter(r => r.id !== requestId))
    }
  }

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const handleRemoveFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Page</h1>

        {/* Profile section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text"
                value={profile.username}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input 
                type="text"
                value={profile.displayName}
                disabled={!isEditing}
                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email"
                value={profile.email}
                disabled={!isEditing}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Friend requests section */}
        {friendRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Friend Requests</h2>
            <div className="space-y-3">
              {friendRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{request.fromUsername}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Friends</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Friend
            </button>
          </div>
          
          <div className="space-y-2">
            {friends.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No friends yet</p>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{friend.displayName}</p>
                    <p className="text-sm text-gray-500">@{friend.username}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Responsibilities:**
- Display and edit user profile information
- Show pending friend requests with accept/reject actions
- Display friends list with remove functionality
- Provide add friend interface
- Validate profile changes before saving

#### 9. Main Entry (`src/main.tsx`)

Application bootstrap file that mounts React to the DOM and imports global styles.

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### Build System Interfaces

#### Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Optional HTTPS configuration
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Route-based code splitting
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom']
        }
      }
    }
  }
})
```

#### Tailwind CSS Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions (colors, spacing, etc.)
      colors: {
        // Example: brand colors
        // 'brand-primary': '#...',
      },
      fontFamily: {
        // Example: custom fonts
        // 'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

**Key Configuration:**
- `content`: Paths to scan for class names (enables proper purging)
- `theme.extend`: Custom design tokens without overriding defaults
- `plugins`: Tailwind plugins for additional utilities (future)

#### PostCSS Configuration (`postcss.config.js`)

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Plugin Pipeline:**
1. `tailwindcss`: Processes @tailwind directives and generates utility classes
2. `autoprefixer`: Adds vendor prefixes for cross-browser compatibility

#### Global Styles (`src/styles/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  body {
    @apply antialiased;
  }
}

/* Custom component classes */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
  }
}

/* Custom utility classes */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Tailwind Layers:**
- `@tailwind base`: Normalize styles and base element styles
- `@tailwind components`: Component-level utility combinations
- `@tailwind utilities`: All utility classes
- `@layer`: Custom styles that respect Tailwind's cascade order

#### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Navigation Hooks and Utilities

#### useNavigate Hook

Programmatic navigation between routes:

```typescript
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()
  
  const handleClick = () => {
    navigate('/about')
    // Or with state: navigate('/about', { state: { from: 'home' } })
  }
  
  return <button onClick={handleClick}>Go to About</button>
}
```

#### useParams Hook

Extract URL parameters from dynamic routes:

```typescript
import { useParams } from 'react-router-dom'

function UserProfile() {
  const { userId } = useParams<{ userId: string }>()
  
  return <div>User ID: {userId}</div>
}

// Route definition: <Route path="/users/:userId" element={<UserProfile />} />
```

#### Link Component

Declarative navigation with accessibility:

```typescript
import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <Link to="/" className="text-blue-600 hover:text-blue-800">
        Home
      </Link>
      <Link to="/about" className="text-blue-600 hover:text-blue-800">
        About
      </Link>
    </nav>
  )
}
```

## Data Models

### MVP Component Interfaces

TypeScript interfaces for MVP feature data models. Note: These are frontend-only interfaces for MVP. Database schema is not finalized, so these models are kept generic and flexible.

#### Collection and Encyclopedia Models

```typescript
// Collection item in encyclopedia view
interface CollectionItem {
  id: string
  name: string
  imageUrl: string
  ownedQuantity: number
  totalQuantity: number
  notes?: string
  isCustom?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Custom encyclopedia entry with cropped image
interface CustomEncyclopediaEntry {
  id: string
  name: string
  originalImageUrl: string
  croppedImageUrl: string
  gridPosition: { row: number; col: number }
  customData: Record<string, any>
  createdAt: Date
}
```

#### Inventory Models

```typescript
// Category with hierarchical structure
interface Category {
  id: string
  name: string
  parentId?: string
  children?: Category[]
  createdAt: Date
}

// Individual inventory item
interface InventoryItem {
  id: string
  name: string
  categoryId: string
  quantity: number
  notes?: string
  purchasePrice?: number
  purchaseDate?: Date
  condition?: 'new' | 'used' | 'damaged'
  createdAt: Date
  updatedAt: Date
}
```

#### Accounting Models

```typescript
// Transaction record for purchases and sales
interface TransactionRecord {
  id: string
  type: 'purchase' | 'sale'
  price: number
  date: Date
  source?: string // For purchases (store, online, etc.)
  shippingCost?: number // For sales
  fee?: number // For sales (platform fees, etc.)
  linkedInventoryId?: string
  notes?: string
  createdAt: Date
}

// Financial summary calculations
interface FinancialSummary {
  totalExpenses: number
  totalRevenue: number
  currentAssetValue: number
  netProfit: number
  transactionCount: number
}
```

#### Social and Profile Models

```typescript
// User profile information
interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl?: string
  bio?: string
  settings?: UserSettings
  createdAt: Date
  updatedAt: Date
}

// User preferences and settings
interface UserSettings {
  theme?: 'light' | 'dark'
  language?: string
  notifications?: boolean
  privacy?: 'public' | 'friends' | 'private'
}

// Friend connection
interface Friend {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  friendsSince: Date
}

// Friend request
interface FriendRequest {
  id: string
  fromUserId: string
  fromUsername: string
  toUserId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  respondedAt?: Date
}
```

### State Management Approach

For MVP, we'll use React's built-in state management:

- **useState**: Component-local state for UI interactions
- **useContext**: Shared state across components (future: user auth, theme)
- **Props drilling**: Simple parent-to-child data flow

Future considerations:
- Zustand or Redux for complex global state
- React Query for server state management
- Local storage for persistence

### Environment Configuration

Environment variables are prefixed with `VITE_` to be exposed to the application:

```typescript
// src/vite-env.d.ts (extended)
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_APP_TITLE?: string
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Example `.env.example`:
```
# API Configuration
VITE_API_URL=http://localhost:3000

# Application Configuration
VITE_APP_TITLE=DroSeal
```

### Route Configuration Model

Routes are defined using a declarative structure:

```typescript
interface RouteConfig {
  path: string
  element: React.ComponentType
  children?: RouteConfig[]
  lazy?: boolean
  protected?: boolean  // Future: authentication
}

// Example route configuration
const routes: RouteConfig[] = [
  {
    path: '/',
    element: Home,
    lazy: false
  },
  {
    path: '/about',
    element: About,
    lazy: true
  },
  {
    path: '*',
    element: NotFound,
    lazy: true
  }
]
```

### Tailwind Theme Configuration Model

Custom theme extensions follow Tailwind's configuration schema:

```typescript
// tailwind.config.ts
interface TailwindTheme {
  extend: {
    colors?: Record<string, string | Record<string, string>>
    spacing?: Record<string, string>
    fontFamily?: Record<string, string[]>
    fontSize?: Record<string, [string, { lineHeight: string }]>
    // ... other theme properties
  }
}

// Example custom theme
const theme: TailwindTheme = {
  extend: {
    colors: {
      'brand-blue': '#0066CC',
      'brand-gray': {
        50: '#F9FAFB',
        100: '#F3F4F6',
        // ... other shades
      }
    },
    spacing: {
      '128': '32rem',
      '144': '36rem',
    }
  }
}
```

### Asset Import Types

Vite provides built-in type definitions for various asset imports:

```typescript
// Images
import logo from './assets/logo.png'  // string (URL)

// CSS (Tailwind processed)
import './styles/index.css'  // void (side effect)

// SVG as React Component
import { ReactComponent as Icon } from './icon.svg'  // React.FC

// Raw text
import text from './data.txt?raw'  // string
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Project Structure Completeness

*For any* properly initialized DroSeal React Frontend project, the following directory structure and files SHALL exist: `DroSeal-front/` root directory, `src/` directory, `src/components/` directory, `public/` directory, `index.html` at root, `src/main.tsx` entry file, `package.json`, `tsconfig.json`, `vite.config.ts`, `.eslintrc.cjs`, and `.gitignore`.

**Validates: Requirements 1.1, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.4, 8.1**

### Property 2: Package Dependencies Completeness

*For any* valid package.json file in the DroSeal React Frontend, it SHALL contain React in dependencies, Vite in devDependencies, TypeScript in devDependencies, @types/react in devDependencies, and scripts for "dev", "build", and "preview".

**Validates: Requirements 1.2, 1.3, 7.1, 7.2, 7.3, 8.3**

### Property 3: Build Output Hash Consistency

*For any* production build, all generated JavaScript and CSS asset filenames (excluding index.html) SHALL contain a hash pattern in the format `[name].[hash].[ext]` for cache busting.

**Validates: Requirements 4.4**

### Property 4: Public Asset Preservation

*For any* file placed in the `public/` directory, after running the production build, that file SHALL exist in the `dist/` directory with the same filename and content.

**Validates: Requirements 9.4**

### Property 5: Build Output Structure

*For any* successful production build, the `dist/` directory SHALL contain: an `index.html` file, at least one minified JavaScript bundle (`.js` file with no unnecessary whitespace), and at least one CSS file if styles are present in the source.

**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

### Property 6: App Component Renderability

*For any* valid App component implementation, rendering it with React Testing Library SHALL complete without throwing errors and SHALL produce a non-empty DOM output.

**Validates: Requirements 6.1, 6.2, 6.4**

### Property 7: Environment Variable Exposure

*For any* environment variable prefixed with `VITE_` in a `.env` file, that variable SHALL be accessible in the application code via `import.meta.env.[VARIABLE_NAME]` and SHALL be replaced with its value in the production build.

**Validates: Requirements 10.2, 10.4**

### Property 8: TypeScript Compilation Success

*For any* TypeScript file (`.ts` or `.tsx`) in the `src/` directory with valid syntax and types, running the build command SHALL successfully compile it to JavaScript without type errors.

**Validates: Requirements 8.2, 8.4**

### Property 9: Asset Import Functionality

*For any* supported asset type (image, CSS, SVG), importing it in a TypeScript component SHALL not cause compilation errors, and the asset SHALL be included in the production build output.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 10: Development Server Startup

*For any* properly configured project, running the `npm run dev` command SHALL start the Vite development server successfully and serve the application on a local port (default 5173).

**Validates: Requirements 2.1**

### Property 11: Linting Error Detection

*For any* TypeScript file that violates configured ESLint rules, running the `npm run lint` command SHALL report warnings or errors and exit with a non-zero status code.

**Validates: Requirements 5.2**

### Property 12: Tailwind CSS Purging Effectiveness

*For any* production build, the generated CSS file SHALL NOT contain Tailwind utility classes that are not referenced in any of the source files specified in the tailwind.config content paths.

**Validates: Requirements 11.6**

### Property 13: Route Navigation Without Reload

*For any* defined route in the application, navigating to that route using React Router's Link component or navigate function SHALL render the corresponding component without triggering a full page reload (window.location change).

**Validates: Requirements 12.4**

### Property 14: Programmatic Navigation

*For any* valid route path, calling the navigate function from useNavigate hook SHALL update the browser URL and render the corresponding route component.

**Validates: Requirements 12.5**

### Property 15: 404 Route Handling

*For any* undefined route path (not matching any configured routes), navigating to that path SHALL render the NotFound component.

**Validates: Requirements 12.6**

### Property 16: Browser History Preservation

*For any* sequence of route navigations, using the browser's back button SHALL navigate to the previous route in the history stack, and using the forward button SHALL navigate to the next route.

**Validates: Requirements 12.8**

### Property 17: URL Parameter Extraction

*For any* route with URL parameters (e.g., `/users/:userId`), navigating to that route with specific parameter values SHALL make those values accessible via the useParams hook in the rendered component.

**Validates: Requirements 14.3**

### Property 18: Lazy Loading Code Splitting

*For any* route component loaded with React.lazy, the production build SHALL create a separate JavaScript chunk for that component, and that chunk SHALL only be loaded when the route is accessed.

**Validates: Requirements 14.5**

### MVP Feature Properties

### Property 19: MVP Route Rendering

*For any* MVP route path (/encyclopedia, /inventory, /accounting, /mypage), navigating to that route SHALL render the corresponding component without triggering a full page reload.

**Validates: Requirements 15.5**

### Property 20: Collection Progress Calculation

*For any* collection item with owned quantity and total quantity values, the displayed progress percentage SHALL equal (ownedQuantity / totalQuantity) * 100, rounded to the nearest integer.

**Validates: Requirements 16.3**

### Property 21: Collection Item Display Completeness

*For any* collection item rendered in the encyclopedia, the card SHALL display the item name, image, owned quantity, total quantity, and progress percentage.

**Validates: Requirements 16.2, 16.4**

### Property 22: Quantity Adjustment State Update

*For any* collection item, when the plus or minus button is clicked, the owned quantity SHALL be updated immediately and the progress percentage SHALL recalculate automatically.

**Validates: Requirements 17.2, 17.3, 17.5**

### Property 23: Notes Persistence

*For any* collection item, when notes are edited and saved, retrieving that item SHALL return the updated notes value.

**Validates: Requirements 18.3**

### Property 24: Custom Encyclopedia Deletion

*For any* custom encyclopedia entry, when deleted, the entry SHALL no longer appear in the encyclopedia display and SHALL be removed from data storage.

**Validates: Requirements 20.5**

### Property 25: Inventory Item Display

*For any* inventory item rendered in the list, the row SHALL display the item name, category name, and quantity.

**Validates: Requirements 21.2**

### Property 26: Inventory Item Deletion

*For any* inventory item, when the delete function is called, the item SHALL be removed from the displayed list and from data storage.

**Validates: Requirements 22.4**

### Property 27: Inventory Display Update

*For any* add or delete operation on inventory items, the displayed list SHALL update immediately to reflect the change.

**Validates: Requirements 22.5**

### Property 28: Category Filtering

*For any* category selection, the displayed inventory items SHALL include only items whose categoryId matches the selected category or any of its child categories.

**Validates: Requirements 23.2, 24.5**

### Property 29: Filter Update Responsiveness

*For any* change to category filter selection, the filtered inventory list SHALL update immediately without delay.

**Validates: Requirements 23.5**

### Property 30: Hierarchical Category Support

*For any* category hierarchy (parent-child relationships), selecting a parent category for filtering SHALL include all inventory items from that parent and all descendant categories.

**Validates: Requirements 24.3**

### Property 31: Total Expenses Calculation

*For any* set of transaction records, the total expenses SHALL equal the sum of all purchase transaction prices.

**Validates: Requirements 25.2**

### Property 32: Total Revenue Calculation

*For any* set of transaction records, the total revenue SHALL equal the sum of all sale transaction prices minus shipping costs and fees.

**Validates: Requirements 25.3**

### Property 33: Current Asset Value Calculation

*For any* set of inventory items with associated purchase transactions, the current asset value SHALL equal the sum of purchase prices for items that have not been sold.

**Validates: Requirements 25.4**

### Property 34: Transaction Chronological Ordering

*For any* list of transaction records, the displayed transactions SHALL be ordered by date with the most recent transaction first.

**Validates: Requirements 26.4**

### Property 35: Transaction-Inventory Bidirectional Linking

*For any* transaction linked to an inventory item, the transaction SHALL display the inventory item information, and viewing the inventory item SHALL display the linked transaction.

**Validates: Requirements 27.2, 27.3**

### Property 36: Financial Calculation Update

*For any* transaction linked to an inventory item, the financial summary calculations (expenses, revenue, asset value) SHALL update to reflect the linked transaction.

**Validates: Requirements 27.5**

### Property 37: Profile Edit Validation

*For any* user profile edit operation, the system SHALL validate the changes before saving, and invalid data SHALL be rejected with an error message.

**Validates: Requirements 28.3**

### Property 38: Friend Request Creation

*For any* friend addition operation, the system SHALL create a friend request with status 'pending' and SHALL not immediately add the user to the friends list.

**Validates: Requirements 29.3**

### Property 39: Friend Request Acceptance

*For any* pending friend request, when accepted, the requesting user SHALL be added to the friends list and the request SHALL be removed from pending requests.

**Validates: Requirements 29.6**

### Property 40: Friend Management Display Update

*For any* friend request rejection or friend deletion, the display SHALL update immediately to reflect the change.

**Validates: Requirements 29.7**

## Error Handling

### Build-Time Errors

**TypeScript Compilation Errors:**
- The build script includes `tsc &&` before `vite build` to ensure type checking
- Type errors will fail the build with clear error messages indicating file and line number
- Developers should fix type errors before the build can succeed

**ESLint Violations:**
- Linting errors are reported during development via IDE integration
- The lint script can be run manually: `npm run lint`
- CI/CD pipelines should run linting as a separate step before build

**Tailwind CSS Configuration Errors:**
- Missing or invalid tailwind.config.ts will cause PostCSS to fail
- Invalid content paths will result in all utility classes being purged in production
- Missing @tailwind directives in CSS will cause build warnings
- Vite will display clear error messages for PostCSS processing failures

**Missing Dependencies:**
- If required dependencies are missing, npm/yarn will fail during install
- The package.json lock file (package-lock.json or yarn.lock) ensures consistent installs
- Error messages will indicate which package is missing

### Runtime Errors

**Component Rendering Errors:**
- React error boundaries should be added in future iterations to catch component errors
- In development, React will display error overlays with stack traces
- In production, errors should be logged to a monitoring service (future requirement)

**Routing Errors:**
- Invalid route paths will be caught by the 404 route handler
- Missing route components will cause build errors (import failures)
- Lazy-loaded components that fail to load will trigger Suspense error boundaries (future)
- Navigation to protected routes without authentication will redirect (future requirement)

**Asset Loading Errors:**
- Missing assets will result in 404 errors in the browser console
- Images should have alt text and fallback handling
- CSS imports that fail will be caught at build time

**Environment Variable Errors:**
- Missing required environment variables should be validated at application startup
- The .env.example file documents all required variables
- Runtime checks should provide clear error messages if variables are undefined

### Development Server Errors

**Port Conflicts:**
- If port 5173 is in use, Vite will automatically try the next available port
- The console will display the actual port being used

**Module Resolution Errors:**
- Invalid imports will be caught by TypeScript and displayed in the browser
- HMR will show errors in the browser overlay without crashing the dev server

**Tailwind CSS JIT Errors:**
- Invalid utility class names will be ignored (no error, just no styling)
- Malformed custom classes in @layer directives will cause PostCSS errors
- Content path mismatches will result in missing styles in development

## Testing Strategy

### Overview

The DroSeal React Frontend will employ a dual testing approach combining unit tests for specific scenarios and property-based tests for universal correctness guarantees. This strategy ensures both concrete bug detection and general correctness validation.

### Testing Tools

**Unit Testing:**
- **Vitest**: Fast unit test runner with Vite integration
- **React Testing Library**: Component testing with user-centric queries
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: Simulate user interactions

**Property-Based Testing:**
- **fast-check**: Property-based testing library for TypeScript/JavaScript
- Minimum 100 iterations per property test to ensure comprehensive input coverage

**Routing Testing:**
- **React Router Testing**: Use MemoryRouter for isolated route testing
- **history**: Mock browser history for navigation testing

### Test Organization

```
DroSeal-front/
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   └── __tests__/
│   │       ├── App.test.tsx           # Unit tests
│   │       └── App.properties.test.tsx # Property tests
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── NotFound.tsx
│   │   └── __tests__/
│   │       ├── Home.test.tsx
│   │       └── NotFound.test.tsx
│   ├── routes/
│   │   ├── index.tsx
│   │   └── __tests__/
│   │       ├── routes.test.tsx
│   │       └── routes.properties.test.tsx
│   └── __tests__/
│       ├── setup.ts                    # Test configuration
│       ├── project-structure.test.ts   # Project setup tests
│       ├── tailwind.test.ts            # Tailwind config tests
│       └── build.properties.test.ts    # Build output properties
└── vitest.config.ts                    # Vitest configuration
```

### Unit Testing Strategy

Unit tests will focus on:

1. **Component Rendering**: Verify specific components render expected content
2. **User Interactions**: Test button clicks, form submissions, navigation
3. **Edge Cases**: Empty states, loading states, error states
4. **Integration Points**: Component composition and prop passing
5. **Routing Behavior**: Route matching, navigation, 404 handling
6. **Tailwind Styling**: Verify critical utility classes are applied

Example unit test:
```typescript
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { App } from '../App'

describe('App Component', () => {
  it('renders home page by default', () => {
    render(<App />)
    expect(screen.getByText(/welcome to droseal/i)).toBeInTheDocument()
  })
})
```

Example routing test:
```typescript
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../routes'

describe('Routing', () => {
  it('renders 404 page for undefined routes', () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })
})
```

### Property-Based Testing Strategy

Property tests will validate universal correctness properties across all inputs. Each property test will:
- Run minimum 100 iterations with randomized inputs
- Reference the design document property in a comment tag
- Use fast-check generators for input creation

**Property Test Configuration:**

Each property test must include a comment tag in this format:
```typescript
// Feature: droseal-react-frontend, Property 1: Project Structure Completeness
```

**Example Property Tests:**

```typescript
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// Feature: droseal-react-frontend, Property 1: Project Structure Completeness
describe('Property 1: Project Structure Completeness', () => {
  it('should have all required files and directories', () => {
    const requiredPaths = [
      'DroSeal-front',
      'DroSeal-front/src',
      'DroSeal-front/src/components',
      'DroSeal-front/public',
      'DroSeal-front/index.html',
      'DroSeal-front/src/main.tsx',
      'DroSeal-front/package.json',
      'DroSeal-front/tsconfig.json',
      'DroSeal-front/vite.config.ts',
      'DroSeal-front/.eslintrc.cjs',
      'DroSeal-front/.gitignore'
    ]
    
    requiredPaths.forEach(p => {
      expect(fs.existsSync(p)).toBe(true)
    })
  })
})

// Feature: droseal-react-frontend, Property 3: Build Output Hash Consistency
describe('Property 3: Build Output Hash Consistency', () => {
  it('all asset filenames should contain hash patterns', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getBuiltAssets()),
        (filename) => {
          if (filename === 'index.html') return true
          // Check for hash pattern: [name].[hash].[ext]
          const hashPattern = /\.[a-f0-9]{8,}\.(js|css)$/
          return hashPattern.test(filename)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 4: Public Asset Preservation
describe('Property 4: Public Asset Preservation', () => {
  it('all files in public/ should exist in dist/ after build', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getPublicFiles()),
        (filename) => {
          const publicPath = path.join('DroSeal-front/public', filename)
          const distPath = path.join('DroSeal-front/dist', filename)
          
          const publicContent = fs.readFileSync(publicPath, 'utf-8')
          const distContent = fs.readFileSync(distPath, 'utf-8')
          
          return publicContent === distContent
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 6: App Component Renderability
describe('Property 6: App Component Renderability', () => {
  it('App component should render without errors', () => {
    fc.assert(
      fc.property(
        fc.record({}), // Future: add props when App accepts them
        (props) => {
          const { container } = render(<App {...props} />)
          return container.innerHTML.length > 0
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 12: Tailwind CSS Purging Effectiveness
describe('Property 12: Tailwind CSS Purging Effectiveness', () => {
  it('production CSS should not contain unused utility classes', () => {
    const cssContent = fs.readFileSync(
      path.join('DroSeal-front/dist/assets', getCSSFilename()),
      'utf-8'
    )
    const sourceFiles = getAllSourceFiles('DroSeal-front/src')
    const usedClasses = extractTailwindClasses(sourceFiles)
    
    fc.assert(
      fc.property(
        fc.constantFrom(...getUnusedTailwindClasses()),
        (unusedClass) => {
          // Verify unused classes are not in production CSS
          return !cssContent.includes(unusedClass)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 13: Route Navigation Without Reload
describe('Property 13: Route Navigation Without Reload', () => {
  it('navigating between routes should not reload the page', () => {
    const routes = ['/', '/about', '/contact']
    
    fc.assert(
      fc.property(
        fc.constantFrom(...routes),
        (route) => {
          const { container } = render(
            <MemoryRouter initialEntries={['/']}>
              <AppRoutes />
            </MemoryRouter>
          )
          
          const initialHTML = container.innerHTML
          // Simulate navigation
          act(() => {
            window.history.pushState({}, '', route)
          })
          
          // Verify DOM updated without full reload
          return container.innerHTML !== initialHTML
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 14: Programmatic Navigation
describe('Property 14: Programmatic Navigation', () => {
  it('navigate function should update route and render component', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/', '/about', '/contact'),
        (targetRoute) => {
          let navigateFn: any
          
          function TestComponent() {
            navigateFn = useNavigate()
            return <div>Test</div>
          }
          
          render(
            <MemoryRouter>
              <Routes>
                <Route path="*" element={<TestComponent />} />
              </Routes>
            </MemoryRouter>
          )
          
          act(() => {
            navigateFn(targetRoute)
          })
          
          return window.location.pathname === targetRoute
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 15: 404 Route Handling
describe('Property 15: 404 Route Handling', () => {
  it('undefined routes should render NotFound component', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !['/', '/about', '/contact'].includes(s)),
        (undefinedRoute) => {
          const { container } = render(
            <MemoryRouter initialEntries={[undefinedRoute]}>
              <AppRoutes />
            </MemoryRouter>
          )
          
          return container.textContent?.includes('404') || 
                 container.textContent?.includes('not found')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 16: Browser History Preservation
describe('Property 16: Browser History Preservation', () => {
  it('back and forward navigation should work correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('/', '/about', '/contact'), { minLength: 2, maxLength: 5 }),
        (routeSequence) => {
          const history = createMemoryHistory()
          
          render(
            <Router location={history.location} navigator={history}>
              <AppRoutes />
            </Router>
          )
          
          // Navigate through sequence
          routeSequence.forEach(route => history.push(route))
          
          // Go back
          history.back()
          const previousRoute = history.location.pathname
          
          // Go forward
          history.forward()
          const currentRoute = history.location.pathname
          
          return currentRoute === routeSequence[routeSequence.length - 1]
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 17: URL Parameter Extraction
describe('Property 17: URL Parameter Extraction', () => {
  it('useParams should extract URL parameters correctly', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.length > 0 && !s.includes('/')),
        (userId) => {
          let extractedParam: string | undefined
          
          function UserComponent() {
            const { userId: id } = useParams()
            extractedParam = id
            return <div>{id}</div>
          }
          
          render(
            <MemoryRouter initialEntries={[`/users/${userId}`]}>
              <Routes>
                <Route path="/users/:userId" element={<UserComponent />} />
              </Routes>
            </MemoryRouter>
          )
          
          return extractedParam === userId
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: droseal-react-frontend, Property 18: Lazy Loading Code Splitting
describe('Property 18: Lazy Loading Code Splitting', () => {
  it('lazy loaded routes should create separate chunks', () => {
    const distAssets = fs.readdirSync('DroSeal-front/dist/assets')
    const jsChunks = distAssets.filter(f => f.endsWith('.js'))
    
    // Verify multiple JS chunks exist (main + lazy loaded)
    expect(jsChunks.length).toBeGreaterThan(1)
    
    fc.assert(
      fc.property(
        fc.constantFrom(...jsChunks),
        (chunkFile) => {
          // Each chunk should have a hash in filename
          return /\.[a-f0-9]{8,}\.js$/.test(chunkFile)
        }
      ),
      { numRuns: Math.min(100, jsChunks.length) }
    )
  })
})
```

### Test Execution

**Development:**
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Open Vitest UI
```

**CI/CD Pipeline:**
```bash
npm run lint          # Lint code
npm run test:run      # Run tests once (no watch)
npm run build         # Build for production
```

### Coverage Goals

- **Unit Test Coverage**: Aim for 80%+ coverage of component logic
- **Property Test Coverage**: All 40 correctness properties (18 base + 22 MVP) must have corresponding property tests
- **Integration Coverage**: Test critical user flows end-to-end (future requirement)
- **Routing Coverage**: All defined routes including MVP routes should have navigation tests
- **Styling Coverage**: Verify Tailwind configuration and purging behavior
- **MVP Component Coverage**: Test Encyclopedia, Inventory, Accounting, and My Page components

### MVP Testing Focus

**Encyclopedia Component:**
- Unit tests: Card rendering, custom entry modal, image cropping grid
- Property tests: Progress calculation, quantity adjustments, notes persistence
- Edge cases: Zero quantity (disabled minus button), empty notes

**Inventory Component:**
- Unit tests: List rendering, category tree display, add/delete modals
- Property tests: Category filtering, hierarchical filtering, display updates
- Edge cases: Empty category list, deeply nested categories

**Accounting Component:**
- Unit tests: Dashboard cards, transaction form, linking UI
- Property tests: Financial calculations, chronological sorting, bidirectional linking
- Edge cases: Zero transactions, negative values, missing linked items

**My Page Component:**
- Unit tests: Profile form, friend request cards, friends list
- Property tests: Profile validation, friend request state transitions, display updates
- Edge cases: Empty friends list, invalid profile data

### Testing Balance

- **Avoid over-testing with unit tests**: Property-based tests handle comprehensive input coverage
- **Focus unit tests on**: Specific examples, edge cases, and integration points
- **Use property tests for**: Universal rules that should hold for all inputs
- **Both approaches are complementary**: Unit tests catch concrete bugs, property tests verify general correctness
- **MVP priority**: Focus on core functionality first, polish and edge cases second

