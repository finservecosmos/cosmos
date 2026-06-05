import { useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../components/Modal'
import DashboardLayout from '../components/DashboardLayout'
import './ProfilePage.css'

const roleInfo = {
  admin: 'Full access to system settings, user management and backups.',
  advisor: 'Can manage clients, enquiries and payments.',
  staff: 'Can view records, follow-ups and daily tasks.',
}

function ProfilePage() {
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
