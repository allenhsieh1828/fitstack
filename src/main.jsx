import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 建議補上這一行，確保 App 的樣式有被載入
import './App.css' 
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)