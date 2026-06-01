import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { UserProvider } from './context/UserContext'
import { ToastProvider } from './context/ToastContext'
import { AppStateProvider } from './context/AppStateContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <AppStateProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppStateProvider>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
)
