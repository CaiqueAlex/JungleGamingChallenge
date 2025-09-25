import { createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { routeTree } from './routeTree.gen'
import { AuthProvider } from './contexts/AuthContext'
import { queryClient } from './lib/queryClient'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster 
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App