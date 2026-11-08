import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/black-han-sans/400.css'
import '@fontsource/gaegu/400.css'
import '@fontsource/gaegu/700.css'
import '@/index.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
