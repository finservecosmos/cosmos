import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'
import Modal from '../shared/ui/Modal'
import DashboardLayout from '../widgets/DashboardLayout'
import { Users, Shield, FileText, Settings, Database, ArrowRight, ShieldCheck } from 'lucide-react'
import './ProfilePage.css'

const roleInfo = {
  admin: 'Full access to system settings, user management and backups.',
  advisor: 'Can manage clients, enquiries and payments.',
  staff: 'Can view records, follow-ups and daily tasks.',
}

const adminModules = [
  { 
    title: 'User Management', 
    path: '/admin/users', 
    icon: <Users size={24} />, 
    color: '#3b82f6',
    bgColor: '#dbeafe',
    desc: 'Manage user accounts, roles, and platform access.' 
  },
  { 
    title: 'Roles & Access', 
    path: '/admin/roles', 
    icon: <Shield size={24} />, 
    color: '#10b981',
    bgColor: '#d1fae5',
    desc: 'Configure role-based access control and security policies.' 
  },
  { 
    title: 'Audit Log', 
    path: '/admin/audit-log', 
    icon: <FileText size={24} />, 
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    desc: 'View system activity, login history, and audit trails.' 
  },
  { 
    title: 'System Settings', 
    path: '/admin/settings', 
    icon: <Settings size={24} />, 
    color: '#f59e0b',
    bgColor: '#fef3c7',
    desc: 'Configure system-wide preferences and session timeouts.' 
  },
  { 
    title: 'Backup Data', 
    path: '/backup', 
    icon: <Database size={24} />, 
    color: '#ef4444',
    bgColor: '#fee2e2',
    desc: 'Manage system data backups and retention policies.' 
  },
]

function ProfilePage() {
  const navigate = useNavigate()
  const { user, setUser } = useUser()
  const { addToast } = useToast()
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    document.title = 'Profile | Cosmos'
    setName(user?.name || '')
    setEmail(user?.email || '')
  }, [user])

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (Max 2MB)
    const maxSizeBytes = 2 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      addToast('File size exceeds the 2MB limit. Please upload a smaller file.', 'error')
      e.target.value = '' // Clear input value
      return
    }

    // Validate file mime-type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      addToast('Invalid file format. Only JPEG, PNG, GIF, and WEBP image uploads are allowed.', 'error')
      e.target.value = '' // Clear input value
      return
    }

    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    addToast('Profile photo preview ready.', 'success')
  }

  const saveProfile = () => {
    setUser({ ...user, name, email, initials: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() })
    addToast('Profile updated successfully.', 'success')
    setEditMode(false)
  }

  const handlePasswordChange = () => {
    if (!password || !confirmPassword) {
      setPasswordError('Both fields are required.')
      return
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordError('')
    addToast('Password updated successfully (mock).', 'success')
    setPassword('')
    setConfirmPassword('')
    setPasswordOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="profile-page">
        <h2 className="profile-page-title">My Profile</h2>

        <div className="profile-card">
          <div className="profile-avatar-section">
            <label htmlFor="profilePhotoUpload" className="profile-photo-upload">
              <div className="profile-big-avatar">{photoPreview ? <img src={photoPreview} alt="Profile preview" /> : (user?.initials || 'U')}</div>
              <span>Upload photo</span>
            </label>
            <input id="profilePhotoUpload" type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
          </div>

          <div className="profile-divider" />

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">Full name</span>
              {editMode ? (
                <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} />
              ) : (
                <span className="profile-info-value">{user?.name || 'User'}</span>
              )}
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Email</span>
              {editMode ? (
                <input className="profile-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              ) : (
                <span className="profile-info-value">{user?.email || '—'}</span>
              )}
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Role</span>
              <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user?.role || '—'}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Status</span>
              <span className="profile-status-badge">Active</span>
            </div>
            <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}>
              <span className="profile-info-label">Role details</span>
              <span className="profile-info-value">{roleInfo[user?.role] || 'Standard access.'}</span>
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-action-row">
            {editMode ? (
              <>
                <button className="profile-save-btn" onClick={saveProfile}>Save changes</button>
                <button className="profile-cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <button className="profile-edit-btn" onClick={() => setEditMode(true)}>Edit profile</button>
            )}
            <button className="profile-change-password-btn" onClick={() => setPasswordOpen(true)}>
              Change Password
            </button>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="profile-admin-section" style={{ marginTop: '32px' }}>
            <h3 style={{ 
              fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent)' }} /> 
              Admin Configuration Control
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {adminModules.map((module) => (
                <div 
                  key={module.path} 
                  onClick={() => navigate(module.path)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  className="profile-admin-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '10px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: module.bgColor, color: module.color
                    }}>
                      {module.icon}
                    </div>
                    <div style={{ color: 'var(--text-faint)' }}>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {module.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {module.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {passwordOpen && (
          <Modal title="Change password" onClose={() => setPasswordOpen(false)} size="sm">
            <div className="form-field">
              <label className="form-label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordError && <span className="form-error">{passwordError}</span>}
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setPasswordOpen(false)}>Cancel</button>
              <button type="button" className="btn-submit" onClick={handlePasswordChange}>Update password</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
