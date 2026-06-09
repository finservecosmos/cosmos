import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { UserProvider } from './context/UserContext'
import { ToastProvider } from './context/ToastContext'
import { ConfirmProvider } from './context/ConfirmContext'
import { AppStateProvider } from './context/AppStateContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <ToastProvider>
          <AppStateProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </AppStateProvider>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
)

