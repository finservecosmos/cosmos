import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../shared/api/supabaseClient'
import { useToast } from '../context/ToastContext'
import { useUser } from '../context/UserContext'
import Modal from '../shared/ui/Modal'
import cosmosLogo from '../assets/cosmosLogo.webp'
import heroImg from '../assets/login_img1.png'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { setUser } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    document.title = 'Login | Cosmos'
    const savedEmail = localStorage.getItem('cosmos_remember_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const errors = {}
    if (!email) errors.email = 'Email is required'
    if (!password) errors.password = 'Password is required'
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setError('Please fill in the highlighted fields.')
      return
    }

    setLoading(true)

    if (rememberMe) {
      localStorage.setItem('cosmos_remember_email', email)
    } else {
      localStorage.removeItem('cosmos_remember_email')
    }

    const devEmail = import.meta.env.VITE_DEV_EMAIL
    const devPassword = import.meta.env.VITE_DEV_PASSWORD
    if (devEmail && devPassword && email === devEmail && password === devPassword) {
      sessionStorage.setItem('dev_auth', 'true')

      // Attempt to sign in to Supabase Auth in the background so that RLS is satisfied if the database is configured.
      const { error: devAuthError } = await supabase.auth.signInWithPassword({ email: devEmail, password: devPassword })
      if (devAuthError) {
        console.warn('Developer bypass background Supabase authentication failed:', devAuthError.message)
      }

      setUser({
        name: 'Admin User',
        email: 'admin@cosmos.com',
        role: 'admin',
        initials: 'AD'
      })
      addToast('Logged in as dev user', 'success')
      setLoading(false)
      navigate('/dashboard')
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    addToast('Welcome back! Redirecting to your dashboard.', 'success')
    navigate('/dashboard')
  }

  const handleResetPassword = async () => {
    setResetError('')
    if (!resetEmail) {
      setResetError('Enter your registered email to continue.')
      return
    }

    setResetLoading(true)
    if (import.meta.env.VITE_DEV_EMAIL) {
      setTimeout(() => {
        setResetLoading(false)
        addToast('Password reset link sent (dev mode).', 'success')
        setResetOpen(false)
      }, 1000)
      return
    }

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    })

    setResetLoading(false)
    if (resetErr) {
      setResetError(resetErr.message)
      return
    }

    addToast('Password reset link sent. Check your email.', 'success')
    setResetOpen(false)
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-left">
          <img src={heroImg} alt="Institutional wealth management" />
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-logo">
              <img src={cosmosLogo} alt="Cosmos Finery" />
            </div>

            <h1 className="login-title">Secure Access</h1>
            <p className="login-subtitle">Log in to your institutional wealth dashboard.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">EMAIL ID</label>
                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <polyline points="3,5 12,13 21,5" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="EMAIL ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className={fieldErrors.email ? 'error' : ''}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">PASSWORD</label>
                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className={fieldErrors.password ? 'error' : ''}
                    required
                  />
                </div>
              </div>

              <div className="login-actions">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <button type="button" className="login-forgot" onClick={() => setResetOpen(true)}>
                  Forgot password?
                </button>
              </div>

              {error && <p className="error-message" role="alert">{error}</p>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </button>

            </form>
          </div>
        </div>
      </div>

      {resetOpen && (
        <Modal title="Reset password" onClose={() => setResetOpen(false)} size="sm">
          <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
            Enter the email address for your account and we’ll send you a reset link.
          </p>
          <div className="form-field">
            <label className="form-label" htmlFor="resetEmail">Email address</label>
            <input
              id="resetEmail"
              type="email"
              className={`form-input ${resetError ? 'error' : ''}`}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {resetError && <span className="form-error">{resetError}</span>}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setResetOpen(false)}>Cancel</button>
            <button type="button" className="btn-submit" onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default LoginPage
