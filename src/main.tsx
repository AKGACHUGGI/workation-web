import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import '@fontsource/black-han-sans/400.css'
import '@fontsource/gaegu/400.css'
import '@fontsource/gaegu/700.css'
import '@/index.css'
import App from '@/App'
import { queryClient } from '@/lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
