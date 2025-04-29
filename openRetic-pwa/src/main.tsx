import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// FullCalendar CSS is now imported in index.css

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
