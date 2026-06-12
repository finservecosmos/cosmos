import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../shared/api/supabaseClient'
import { useToast } from '../context/ToastContext'
import { useUser } from '../context/UserContext'
import Modal from '../shared/ui/Modal'
import cosmosLogo from '../assets/cosmosLogo.jpeg'
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
  const [bioModalOpen, setBioModalOpen] = useState(false)
  const [bioState, setBioState] = useState('idle') // 'idle' | 'scanning' | 'success'
  const [regConfirmOpen, setRegConfirmOpen] = useState(false)

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

  const handleBiometricLogin = async () => {
    setError('')
    
    // Check WebAuthn support
    const isSupported = window.PublicKeyCredential && 
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
    
    if (!isSupported) {
      runSimulatedBypass();
      return;
    }

    try {
      const isPlatformAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isPlatformAvailable) {
        runSimulatedBypass();
        return;
      }
      
      const savedCredStr = localStorage.getItem('cosmos_passkey');
      if (savedCredStr) {
        setBioModalOpen(true);
        setBioState('scanning');
        
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        const savedCred = JSON.parse(savedCredStr);
        const options = {
          challenge: challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: new Uint8Array(savedCred.rawId),
            type: 'public-key'
          }],
          userVerification: "required"
        };
        
        const assertion = await navigator.credentials.get({ publicKey: options });
        if (assertion) {
          setBioState('success');
          setTimeout(() => {
            setBioModalOpen(false);
            sessionStorage.setItem('dev_auth', 'true');
            addToast('Passkey verified successfully!', 'success');
            navigate('/dashboard');
          }, 1200);
        }
      } else {
        setRegConfirmOpen(true);
      }
    } catch (err) {
      console.warn('WebAuthn process error, using simulation fallback:', err);
      addToast('Real Passkey verification not completed. Using simulation mode.', 'warning');
      runSimulatedBypass();
    }
  }

  const runSimulatedBypass = () => {
    setBioModalOpen(true);
    setBioState('scanning');

    setTimeout(() => {
      setBioState('success');
      setTimeout(() => {
        setBioModalOpen(false);
        sessionStorage.setItem('dev_auth', 'true');
        setUser({
          name: 'Admin User',
          email: 'admin@cosmos.com',
          role: 'admin',
          initials: 'AD'
        })
        addToast('Biometric authentication verified! (Simulation Mode)', 'success');
        navigate('/dashboard');
      }, 1200);
    }, 2000);
  }

  const handleRegisterPasskey = async () => {
    setRegConfirmOpen(false);
    setBioModalOpen(true);
    setBioState('scanning');

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);
      
      const options = {
        challenge: challenge,
        rp: {
          name: "Cosmos Finserve",
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: email || "dev@cosmos.com",
          displayName: email ? email.split('@')[0] : "Cosmos Developer"
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000
      };

      const credential = await navigator.credentials.create({ publicKey: options });
      if (credential) {
        const credInfo = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId))
        };
        localStorage.setItem('cosmos_passkey', JSON.stringify(credInfo));
        setBioState('success');
        
        setTimeout(() => {
          setBioModalOpen(false);
          sessionStorage.setItem('dev_auth', 'true');
          setUser({
            name: 'Admin User',
            email: 'admin@cosmos.com',
            role: 'admin',
            initials: 'AD'
          })
          addToast('Passkey registered and logged in successfully!', 'success');
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setBioModalOpen(false);
      addToast('Passkey registration not completed. Using simulation mode.', 'warning');
      runSimulatedBypass();
    }
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

              <div className="login-divider">
                <span>OR SECURE PASSKEY</span>
              </div>

              <button 
                type="button" 
                className="biometric-btn"
                onClick={handleBiometricLogin}
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="biometric-btn-icon">
                  <path d="M12 10a2 2 0 0 0-2 2v3a2 2 0 0 0 4 0v-3a2 2 0 0 0-2-2z" />
                  <path d="M14 10a4.5 4.5 0 0 0-4.5 4.5V17" />
                  <path d="M18.5 10a8.5 8.5 0 0 0-13 0v4.5" />
                  <path d="M8 10a4 4 0 0 1 8 0v2.5" />
                  <path d="M6 10a6 6 0 0 1 12 0v1.5" />
                </svg>
                Sign in with Passkey / Face ID
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

      {bioModalOpen && (
        <Modal 
          title="Biometric Authentication" 
          onClose={() => {
            if (bioState !== 'success') {
              setBioModalOpen(false)
            }
          }} 
          size="sm"
        >
          <div className="biometric-modal-content">
            <div className={`biometric-scanner-ring ${bioState}`}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="scanner-fingerprint">
                <path d="M12 10a2 2 0 0 0-2 2v3a2 2 0 0 0 4 0v-3a2 2 0 0 0-2-2z" />
                <path d="M14 10a4.5 4.5 0 0 0-4.5 4.5V17" />
                <path d="M18.5 10a8.5 8.5 0 0 0-13 0v4.5" />
                <path d="M8 10a4 4 0 0 1 8 0v2.5" />
                <path d="M6 10a6 6 0 0 1 12 0v1.5" />
              </svg>
              {bioState === 'scanning' && <div className="scanner-laser" />}
            </div>
            
            <h3 className="biometric-modal-title">
              {bioState === 'scanning' && 'Scanning biometric data...'}
              {bioState === 'success' && 'Verification Complete'}
            </h3>
            
            <p className="biometric-modal-desc">
              {bioState === 'scanning' && 'Please place your finger on the sensor or scan your face.'}
              {bioState === 'success' && 'Welcome back, Cosmos User!'}
            </p>
          </div>
        </Modal>
      )}

      {regConfirmOpen && (
        <Modal 
          title="Register Device Passkey" 
          onClose={() => setRegConfirmOpen(false)} 
          size="sm"
        >
          <div style={{ padding: '8px 0' }}>
            <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
              No passkey is registered on this device yet. Would you like to link your device's biometric authentication (Face ID, Touch ID, or Windows Hello) as a secure login method?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button 
                type="button" 
                className="biometric-btn" 
                style={{ width: 'auto', padding: '8px 16px', background: 'none', border: '1.5px solid var(--border-input)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                onClick={() => {
                  setRegConfirmOpen(false);
                  runSimulatedBypass();
                }}
              >
                Use Simulation Mode
              </button>
              <button 
                type="button" 
                className="data-btn data-btn-primary" 
                style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                onClick={handleRegisterPasskey}
              >
                Register Passkey
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default LoginPage
