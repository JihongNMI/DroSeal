import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '../routes'
import { Layout } from './Layout'
import { useCursorSkin } from '../hooks/useCursorSkin'

export function App(): JSX.Element {
  useCursorSkin({ applyGlobalCursor: true })
  // Example: Access environment variables using import.meta.env
  // These variables are replaced at build time by Vite
  const apiUrl = import.meta.env.VITE_API_URL
  const appTitle = import.meta.env.VITE_APP_TITLE

  // Log environment variables for verification (development only)
  if (import.meta.env.DEV) {
    console.log('Environment Variables:', {
      apiUrl,
      appTitle,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
    })
  }

  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  )
}
