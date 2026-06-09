import { useEffect } from 'react'
import './Modal.css'

function Modal({ title, subtitle, icon, headerTheme, headerAction, onClose, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal-box modal-${size}`} role="dialog" aria-modal="true">
        <div className={`modal-header ${headerTheme ? 'theme-' + headerTheme : ''}`}>
          <div className="modal-header-content">
            {icon && (
              <div className="modal-icon-wrap">
                {icon}
              </div>
            )}
            <div className="modal-title-wrap">
              <h3 className="modal-title">{title}</h3>
              {subtitle && <div className="modal-subtitle">{subtitle}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {headerAction && <div className="modal-header-action">{headerAction}</div>}
            <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
