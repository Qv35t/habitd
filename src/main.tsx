import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import '@fontsource/jetbrains-mono/300.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/space-grotesk/300.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import '@/styles/globals.css'
import '@/styles/finance.css'
import { App } from '@/app/App'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found in DOM')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
