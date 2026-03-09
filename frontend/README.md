# DroSeal React Frontend

Modern React 18 + Vite 5 + TypeScript 5 frontend application with Tailwind CSS 3 and React Router DOM 6.

## Features

- ⚡️ **Vite 5** - Lightning-fast HMR and optimized builds
- ⚛️ **React 18** - Latest React with concurrent features
- 🔷 **TypeScript 5** - Type-safe development with strict mode
- 🎨 **Tailwind CSS 3** - Utility-first CSS framework with JIT compilation
- 🚦 **React Router DOM 6** - Client-side routing with lazy loading
- 📦 **Code Splitting** - Route-based automatic code splitting
- 🔍 **ESLint** - Code quality and consistency enforcement
- 🏗️ **Production Ready** - Optimized builds with asset hashing and CSS purging

## MVP Features

This application includes four main sections:

- **Encyclopedia** - Card-based collection view with quick edit and custom entries
- **Inventory** - List-based item management with hierarchical categories
- **Accounting** - Financial dashboard with transaction tracking
- **My Page** - User profile and social friend management

## Project Structure

```
DroSeal-front/
├── public/              # Static assets (copied as-is to dist/)
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components for routes
│   ├── routes/         # Routing configuration
│   ├── styles/         # Global styles and Tailwind CSS
│   ├── assets/         # Processed assets (images, fonts)
│   ├── main.tsx        # Application entry point
│   └── vite-env.d.ts   # Vite type definitions
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
└── .eslintrc.cjs       # ESLint configuration
```

## Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

Edit `.env` to set your environment-specific variables.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` with Hot Module Replacement enabled.

## Available Scripts

### `npm run dev`

Starts the Vite development server with Hot Module Replacement (HMR).

- **Port**: `http://localhost:5173`
- **HMR**: Changes appear instantly without page reload
- **Type Checking**: TypeScript errors appear in terminal and IDE
- **Fast Refresh**: React components update while preserving state

**Usage:**
```bash
npm run dev
```

### `npm run build`

Builds the application for production with full optimization.

**Build Process:**
1. **Type Checking**: Runs `tsc` to validate all TypeScript code
2. **Bundling**: Combines modules into optimized chunks
3. **Minification**: Reduces JavaScript and CSS file sizes
4. **CSS Purging**: Removes unused Tailwind CSS classes (90%+ reduction)
5. **Asset Hashing**: Adds content hashes to filenames for cache busting
6. **Code Splitting**: Creates separate chunks for routes and vendors
   - `react-vendor.js` - React and ReactDOM
   - `router.js` - React Router DOM
   - Individual route chunks for lazy-loaded pages

**Output**: Production-ready files in `dist/` directory

**Usage:**
```bash
npm run build
```

### `npm run preview`

Serves the production build locally for testing before deployment.

- **Port**: `http://localhost:4173` (default)
- **Purpose**: Test the production build behavior
- **Note**: Run `npm run build` first

**Usage:**
```bash
npm run build
npm run preview
```

### `npm run lint`

Runs ESLint to check code quality and style consistency.

- **Checks**: TypeScript and React best practices
- **Extensions**: `.ts`, `.tsx` files
- **Rules**: React Hooks, React Refresh, TypeScript recommended
- **Max Warnings**: 0 (all warnings treated as errors)

**Usage:**
```bash
npm run lint
```

**Fix automatically:**
```bash
npm run lint -- --fix
```

## Development Workflow

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Navigate to `http://localhost:5173`
   - Application loads with HMR enabled

### Daily Development

1. **Start the dev server**: `npm run dev`
2. **Make changes**: Edit files in `src/` - changes appear instantly via HMR
3. **Check types**: TypeScript errors appear in your IDE and terminal
4. **Lint code**: Run `npm run lint` to check for issues
5. **Build for production**: `npm run build` when ready to deploy
6. **Test production build**: `npm run preview` to verify the build

### Hot Module Replacement (HMR)

Vite's HMR updates modules in the browser without full page reload:

- **React Fast Refresh**: Component state is preserved during updates
- **CSS Updates**: Styles update instantly without reload
- **Speed**: Updates typically complete in <100ms

### Type Checking

TypeScript runs in two modes:

- **Development**: No type checking during HMR for speed
- **Build**: Full type checking with `tsc` before bundling

**Check types manually:**
```bash
npx tsc --noEmit
```

## Environment Variables

Environment variables in Vite must be prefixed with `VITE_` to be exposed to the application.

### Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_TITLE=DroSeal
   ```

### Usage in Code

Access environment variables via `import.meta.env`:

```typescript
// Access environment variables
const apiUrl = import.meta.env.VITE_API_URL
const appTitle = import.meta.env.VITE_APP_TITLE

// Type-safe access (define in vite-env.d.ts)
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}
```

### Important Notes

- **Prefix Required**: Only `VITE_` prefixed variables are exposed
- **Build Time**: Variables are replaced at build time (not runtime)
- **Client-Side Only**: Never store secrets in environment variables
- **Type Definitions**: Add types in `src/vite-env.d.ts` for autocomplete

### Built-in Variables

Vite provides these built-in variables:

- `import.meta.env.MODE` - Current mode (`development` or `production`)
- `import.meta.env.DEV` - Boolean, true in development
- `import.meta.env.PROD` - Boolean, true in production
- `import.meta.env.BASE_URL` - Base URL for the app

## Tailwind CSS

Tailwind CSS is a utility-first CSS framework that provides low-level utility classes for building custom designs.

### Using Utility Classes

Build UIs by composing utility classes directly in your JSX:

```tsx
<div className="flex items-center justify-center min-h-screen bg-gray-50">
  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
    Click Me
  </button>
</div>
```

**Common Patterns:**

```tsx
// Flexbox layout
<div className="flex flex-col gap-4">
  <div className="flex items-center justify-between">
    {/* Content */}
  </div>
</div>

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Grid items */}
</div>

// Responsive design
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Responsive width */}
</div>

// Hover and focus states
<button className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
  Button
</button>
```

### Customizing Theme

Edit `tailwind.config.ts` to customize the design system:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Add custom colors
      colors: {
        'brand-primary': '#0066CC',
        'brand-secondary': '#FF6B35',
      },
      // Add custom fonts
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'sans-serif'],
      },
      // Add custom spacing
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      // Add custom breakpoints
      screens: {
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

**Use custom values:**
```tsx
<div className="bg-brand-primary text-white font-display">
  Custom styled content
</div>
```

### Custom Styles with @layer

Add custom component classes in `src/styles/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Custom base styles */
  h1 {
    @apply text-4xl font-bold text-gray-900;
  }
}

@layer components {
  /* Reusable component classes */
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow;
  }
}

@layer utilities {
  /* Custom utility classes */
  .text-balance {
    text-wrap: balance;
  }
}
```

**Use custom classes:**
```tsx
<button className="btn-primary">
  Primary Button
</button>

<div className="card">
  Card content
</div>
```

### Content Configuration

The `content` array in `tailwind.config.ts` tells Tailwind which files to scan for class names:

```typescript
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
]
```

**Important**: Add any new file patterns here to ensure Tailwind processes them.

### Production Optimization

In production builds, Tailwind automatically:

1. **Purges unused classes** - Only includes classes used in your code
2. **Minifies CSS** - Reduces file size
3. **Removes comments** - Strips development comments

This typically reduces CSS bundle size by 90%+ compared to the full Tailwind CSS file.

### JIT Mode

Tailwind uses Just-In-Time (JIT) mode by default:

- **On-demand generation**: Only generates classes you use
- **Arbitrary values**: Use any value with square brackets
  ```tsx
  <div className="w-[137px] bg-[#1da1f2]">
    Custom values
  </div>
  ```
- **Fast builds**: No need to generate all possible classes

## React Router DOM

React Router DOM provides client-side routing with lazy loading and code splitting.

### Routing Structure

The application uses the following route structure:

```
/                    → Home page (eager loaded)
/encyclopedia        → Encyclopedia page (lazy loaded)
/inventory           → Inventory page (lazy loaded)
/accounting          → Accounting page (lazy loaded)
/mypage              → My Page (lazy loaded)
/*                   → 404 Not Found page (lazy loaded)
```

**Route Configuration** (`src/routes/index.tsx`):

```typescript
import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Eager loading for critical routes
import Home from '../pages/Home'

// Lazy loading for other routes
const Encyclopedia = lazy(() => import('../pages/Encyclopedia'))
const Inventory = lazy(() => import('../pages/Inventory'))
const Accounting = lazy(() => import('../pages/Accounting'))
const MyPage = lazy(() => import('../pages/MyPage'))
const NotFound = lazy(() => import('../pages/NotFound'))

export function AppRoutes(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
```

### Navigation

#### Declarative Navigation with Link

Use the `Link` component for navigation without page reload:

```tsx
import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <Link to="/" className="text-blue-600 hover:text-blue-800">
        Home
      </Link>
      <Link to="/encyclopedia" className="text-blue-600 hover:text-blue-800">
        Encyclopedia
      </Link>
      <Link to="/inventory" className="text-blue-600 hover:text-blue-800">
        Inventory
      </Link>
    </nav>
  )
}
```

#### Programmatic Navigation

Use the `useNavigate` hook for programmatic navigation:

```tsx
import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()
  
  const handleSubmit = () => {
    // Do something...
    navigate('/encyclopedia')
  }
  
  const handleBack = () => {
    navigate(-1) // Go back one page
  }
  
  return (
    <>
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={handleBack}>Back</button>
    </>
  )
}
```

### Route Parameters

Extract URL parameters with `useParams`:

```tsx
import { useParams } from 'react-router-dom'

// Route definition
<Route path="/items/:itemId" element={<ItemDetail />} />

// Component
function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>()
  
  return <div>Item ID: {itemId}</div>
}
```

### Query Parameters

Access query parameters with `useSearchParams`:

```tsx
import { useSearchParams } from 'react-router-dom'

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const query = searchParams.get('q')
  const page = searchParams.get('page') || '1'
  
  const updateSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery, page: '1' })
  }
  
  return <div>Search: {query}, Page: {page}</div>
}
```

### Lazy Loading and Code Splitting

Routes are lazy loaded to optimize bundle size:

```typescript
// Lazy load a component
const Encyclopedia = lazy(() => import('../pages/Encyclopedia'))

// Wrap with Suspense to show loading state
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/encyclopedia" element={<Encyclopedia />} />
  </Routes>
</Suspense>
```

**Benefits:**
- **Smaller initial bundle**: Only load code for the current route
- **Faster page load**: Critical routes load first
- **Automatic code splitting**: Vite creates separate chunks for each lazy-loaded route

**Build output example:**
```
dist/assets/
  index-abc123.js          # Main bundle
  react-vendor-def456.js   # React vendor chunk
  router-ghi789.js         # Router chunk
  Encyclopedia-jkl012.js   # Encyclopedia route chunk
  Inventory-mno345.js      # Inventory route chunk
  ...
```

### Navigation State

Pass state between routes:

```tsx
// Navigate with state
navigate('/encyclopedia', { state: { from: 'home' } })

// Access state in target component
import { useLocation } from 'react-router-dom'

function Encyclopedia() {
  const location = useLocation()
  const from = location.state?.from
  
  return <div>Navigated from: {from}</div>
}
```

### Protected Routes (Future Enhancement)

Example pattern for protected routes:

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth() // Your auth logic
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Usage
<Route 
  path="/mypage" 
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  } 
/>
```

## Building for Production

### Build Process

Run the production build:

```bash
npm run build
```

**Build Steps:**

1. **Type Checking** (`tsc`)
   - Validates all TypeScript code
   - Ensures type safety across the codebase
   - Fails build if type errors exist

2. **Bundling** (Vite)
   - Combines modules into optimized chunks
   - Tree-shakes unused code
   - Processes imports and dependencies

3. **Minification**
   - Reduces JavaScript file sizes
   - Removes whitespace and comments
   - Shortens variable names

4. **CSS Processing**
   - Purges unused Tailwind CSS classes (90%+ reduction)
   - Minifies CSS output
   - Adds vendor prefixes via autoprefixer

5. **Asset Optimization**
   - Adds content hashes to filenames (e.g., `index-abc123.js`)
   - Enables long-term caching
   - Optimizes images and static assets

6. **Code Splitting**
   - Creates separate chunks for vendors and routes
   - `react-vendor.js` - React and ReactDOM
   - `router.js` - React Router DOM
   - Individual chunks for lazy-loaded pages

### Build Output

The `dist/` directory contains the production-ready application:

```
dist/
├── index.html                    # Entry HTML file
├── assets/
│   ├── index-abc123.js          # Main application bundle
│   ├── index-def456.css         # Optimized CSS (purged)
│   ├── react-vendor-ghi789.js   # React vendor chunk
│   ├── router-jkl012.js         # Router chunk
│   ├── Encyclopedia-mno345.js   # Encyclopedia route chunk
│   ├── Inventory-pqr678.js      # Inventory route chunk
│   ├── Accounting-stu901.js     # Accounting route chunk
│   ├── MyPage-vwx234.js         # MyPage route chunk
│   └── NotFound-yz567.js        # NotFound route chunk
└── favicon.ico                   # Static assets from public/
```

### Testing Production Build

Preview the production build locally:

```bash
npm run preview
```

This serves the `dist/` folder on `http://localhost:4173` (default).

**Test checklist:**
- [ ] All routes load correctly
- [ ] Navigation works without page reload
- [ ] Tailwind CSS styles are applied
- [ ] Images and assets load properly
- [ ] No console errors
- [ ] Performance is acceptable

### Build Optimization Tips

1. **Analyze Bundle Size**
   ```bash
   npm run build -- --mode analyze
   ```

2. **Check for Large Dependencies**
   - Review `dist/assets/` file sizes
   - Consider lazy loading heavy components
   - Use dynamic imports for large libraries

3. **Optimize Images**
   - Use appropriate image formats (WebP, AVIF)
   - Compress images before adding to project
   - Consider using image CDN for production

4. **Enable Compression**
   - Configure your hosting to serve gzip/brotli compressed files
   - Most static hosts do this automatically

### Performance Metrics

Expected production bundle sizes (approximate):

- **Main bundle**: 50-100 KB (gzipped)
- **React vendor**: 40-50 KB (gzipped)
- **Router chunk**: 10-15 KB (gzipped)
- **CSS**: 5-10 KB (gzipped, after purging)
- **Route chunks**: 5-20 KB each (gzipped)

**Total initial load**: ~100-150 KB (gzipped)

## Deployment

The `dist/` folder contains a static site that can be deployed to any hosting service.

### Deployment Options

#### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run build
   vercel deploy --prod
   ```

**Or use Vercel GitHub integration:**
- Connect your repository to Vercel
- Automatic deployments on push to main branch
- Preview deployments for pull requests

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

**Or use Netlify UI:**
- Drag and drop `dist/` folder to Netlify
- Or connect GitHub repository for automatic deployments

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json:**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages:**
   - Go to repository Settings → Pages
   - Select `gh-pages` branch
   - Save

**Note**: Update `vite.config.ts` for GitHub Pages:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... other config
})
```

#### AWS S3 + CloudFront

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure S3 bucket:**
   - Enable static website hosting
   - Set index document to `index.html`
   - Set error document to `index.html` (for client-side routing)

4. **Configure CloudFront:**
   - Create distribution pointing to S3 bucket
   - Set custom error response: 404 → /index.html (200)

#### Docker

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Build and run:**
```bash
docker build -t droseal-front .
docker run -p 8080:80 droseal-front
```

### Important Deployment Notes

#### Client-Side Routing

For client-side routing to work, configure your server to:
- Serve `index.html` for all routes
- Return 200 status (not 404) for non-file requests

**Why?** When users navigate to `/encyclopedia` directly, the server needs to serve `index.html` so React Router can handle the route.

#### Environment Variables

- Build-time variables are baked into the bundle
- Set environment variables before building:
  ```bash
  VITE_API_URL=https://api.example.com npm run build
  ```
- Different builds needed for different environments

#### HTTPS

- Always use HTTPS in production
- Most hosting providers (Vercel, Netlify) provide free SSL
- Required for secure features (geolocation, camera, etc.)

#### Caching Strategy

The build output uses content hashing for optimal caching:

- **HTML files**: No cache or short cache (1 hour)
- **JS/CSS with hashes**: Long cache (1 year)
- **Static assets**: Long cache (1 year)

**Example nginx configuration:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location = /index.html {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## TypeScript

### Strict Mode

The project uses TypeScript strict mode for maximum type safety:

- `strict: true` - Enables all strict type checking options
- `noUnusedLocals: true` - Reports unused local variables
- `noUnusedParameters: true` - Reports unused function parameters
- `noFallthroughCasesInSwitch: true` - Reports fallthrough cases in switch

### Type Definitions

Vite provides type definitions for environment variables and asset imports in `src/vite-env.d.ts`.

## Browser Support

- Modern browsers with ES2020 support
- Chrome, Firefox, Safari, Edge (latest versions)

## Troubleshooting

### Common Issues

#### Port Already in Use

**Problem**: Port 5173 is already in use

**Solution**: Vite will automatically try the next available port, or specify a different port:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000, // Use different port
  },
})
```

#### TypeScript Errors

**Problem**: TypeScript compilation errors during build

**Solution**:
1. Check errors in terminal output
2. Fix type errors in your code
3. Run type check manually:
   ```bash
   npx tsc --noEmit
   ```

**Common TypeScript issues:**
- Missing type definitions: `npm install --save-dev @types/package-name`
- Strict mode errors: Review `tsconfig.json` strict options
- Import errors: Check file paths and extensions

#### Tailwind Classes Not Working

**Problem**: Tailwind CSS classes not applying styles

**Solutions**:

1. **Check content paths in `tailwind.config.ts`:**
   ```typescript
   content: [
     './index.html',
     './src/**/*.{js,ts,jsx,tsx}', // Ensure this matches your files
   ]
   ```

2. **Verify CSS import in `main.tsx`:**
   ```typescript
   import './styles/index.css'
   ```

3. **Check `index.css` has Tailwind directives:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

5. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

#### HMR Not Working

**Problem**: Changes not appearing in browser

**Solutions**:

1. **Check browser console for errors**
2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Clear browser cache**
4. **Check file is saved**
5. **Verify file is in `src/` directory**

#### Build Fails

**Problem**: `npm run build` fails

**Solutions**:

1. **Check TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

2. **Check for linting errors:**
   ```bash
   npm run lint
   ```

3. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

#### Routing Not Working in Production

**Problem**: Direct navigation to routes returns 404

**Solution**: Configure server to serve `index.html` for all routes

**Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** (automatic, no config needed)

**Nginx**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Blank Page in Production

**Problem**: Production build shows blank page

**Solutions**:

1. **Check browser console for errors**
2. **Verify base URL in `vite.config.ts`:**
   ```typescript
   export default defineConfig({
     base: '/', // Or '/your-repo-name/' for GitHub Pages
   })
   ```
3. **Check all assets loaded correctly** (Network tab)
4. **Verify environment variables are set** before build

#### Slow Development Server

**Problem**: Dev server is slow or unresponsive

**Solutions**:

1. **Reduce file watching:**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     server: {
       watch: {
         ignored: ['**/node_modules/**', '**/dist/**'],
       },
     },
   })
   ```

2. **Close unused applications**
3. **Check system resources** (CPU, memory)
4. **Disable browser extensions** that might interfere

#### Import Errors

**Problem**: Cannot find module or import errors

**Solutions**:

1. **Check file path is correct:**
   ```typescript
   // Correct
   import Home from '../pages/Home'
   
   // Wrong
   import Home from '../pages/Home.tsx' // Don't include extension
   ```

2. **Check file exists and is named correctly**
3. **Use absolute imports (optional):**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     resolve: {
       alias: {
         '@': '/src',
       },
     },
   })
   
   // Usage
   import Home from '@/pages/Home'
   ```

### Getting Help

If you encounter issues not covered here:

1. **Check Vite documentation**: https://vitejs.dev
2. **Check React Router documentation**: https://reactrouter.com
3. **Check Tailwind CSS documentation**: https://tailwindcss.com
4. **Search GitHub issues** for similar problems
5. **Check browser console** for error messages
6. **Review build output** for warnings or errors

## License

Private project - All rights reserved

## Contributing

This is a private project. Contact the maintainer for contribution guidelines.
