import { createContext, useContext, useState, useCallback } from 'react'
import Modal from '../frontend/components/Modal'

const ConfirmContext = createContext()

export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState(null) // { title, message, confirmLabel, cancelLabel, variant, resolve }

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialogState({
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        variant: options.variant || 'warning',
        resolve
      })
    })
  }, [])

  const handleClose = () => {
    if (dialogState) {
      dialogState.resolve(false)
      setDialogState(null)
    }
  }

  const handleConfirm = () => {
    if (dialogState) {
      dialogState.resolve(true)
      setDialogState(null)
    }
  }

  const getConfirmButtonStyles = (variant) => {
    if (variant === 'danger') {
      return { background: '#dc2626', color: '#fff' } // Crimson red
    }
    if (variant === 'info') {
      return { background: '#2563eb', color: '#fff' } // Blue
    }
    return { background: 'var(--accent)', color: '#fff' } // Default accent (often gold/amber)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialogState && (
        <Modal 
          title={dialogState.title} 
          onClose={handleClose} 
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {dialogState.message}
            </p>
            <div className="form-actions" style={{ marginTop: 8, paddingOriginal: 0, border: 'none' }}>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleClose}
              >
                {dialogState.cancelLabel}
              </button>
              <button 
                type="button" 
                className="btn-submit" 
                style={getConfirmButtonStyles(dialogState.variant)}
                onClick={handleConfirm}
              >
                {dialogState.confirmLabel}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}
