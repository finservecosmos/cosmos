import { useState } from 'react'
import DashboardLayout from '../../widgets/DashboardLayout'
import './AdminPages.css'
import { Check } from 'lucide-react';

function SystemSettings() {
  const [company, setCompany] = useState('Cosmos Finserve')
  const [email, setEmail] = useState('admin@cosmos.local')
  const [backupFreq, setBackupFreq] = useState('daily')
  const [timeoutEnabled, setTimeoutEnabled] = useState(
    localStorage.getItem('session_timeout_enabled') !== 'false'
  )
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('session_timeout_enabled', String(timeoutEnabled))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <h2 className="admin-page-title">System Settings</h2>
          <p className="admin-page-sub">Configure system-wide preferences</p>
        </div>

        <form className="settings-form" onSubmit={handleSave}>

          <div className="settings-section">
            <h3 className="settings-section-title">Company Information</h3>
            <div className="settings-field">
              <label>Company Name</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="settings-field">
              <label>Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Backup Settings</h3>
            <div className="settings-field">
              <label>Backup Frequency</label>
              <select value={backupFreq} onChange={(e) => setBackupFreq(e.target.value)}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Security</h3>
            <div className="settings-toggle-row">
              <div>
                <p className="settings-toggle-label">Require 2FA for Admin</p>
                <p className="settings-toggle-sub">All admin accounts must use two-factor authentication</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="settings-toggle-row">
              <div>
                <p className="settings-toggle-label">Session Timeout</p>
                <p className="settings-toggle-sub">Auto-logout after 30 minutes of inactivity</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={timeoutEnabled} 
                  onChange={(e) => setTimeoutEnabled(e.target.checked)} 
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="settings-footer">
            {saved && <span className="settings-saved"><Check size={14} style={{marginRight: 4, verticalAlign: "middle"}} /> Settings saved</span>}
            <button type="submit" className="admin-primary-btn">Save Changes</button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  )
}

export default SystemSettings
