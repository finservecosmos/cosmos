import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import './DataPage.css'
import './BackupData.css'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} minutes ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hours ago`
  return `${Math.floor(hrs / 24)} days ago`
}

export default function BackupData() {
  const { backups, addBackup } = useAppState()
  const { addToast } = useToast()
  const [backing, setBacking] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.title = 'Backup Data | Cosmos'
  }, [])

  const handleBackup = () => {
    setBacking(true)
    setDone(false)
    setTimeout(() => {
      const newBackup = {
        id: `B${String(backups.length + 1).padStart(3, '0')}`,
        type: 'Manual',
        size: '2.5 MB',
        date: new Date().toISOString(),
        status: 'Success',
      }
      addBackup(newBackup)
      setBacking(false)
      setDone(true)
      addToast('Backup completed successfully.', 'success')
    }, 1800)
  }

  const lastSuccess = backups.slice().reverse().find((b) => b.status === 'Success')

  const handleRestore = (backup) => {
    addToast(`${backup.id} restore started.`, 'success')
  }

  const handleDownload = (backup) => {
    const blob = new Blob([`Backup ${backup.id}\nType: ${backup.type}\nDate: ${backup.date}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${backup.id}-backup.txt`
    anchor.click()
    URL.revokeObjectURL(url)
    addToast(`${backup.id} downloaded.`, 'success')
  }

  return (
    <DashboardLayout>
      <div className="data-page">

        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Backup Data</h2>
            <p className="data-page-sub">Manage and monitor system data backups</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={handleBackup} disabled={backing}>
            {backing ? 'Backing up...' : '↑ Run Backup Now'}
          </button>
        </div>

        {done && (
          <div className="backup-success-banner">
            ✓ Backup completed successfully — {new Date().toLocaleTimeString()}
          </div>
        )}

        <div className="data-summary">
          <div className="data-summary-item">
            <div className="data-summary-label">Last Backup</div>
            <div className="data-summary-value" style={{ fontSize: 16 }}>{lastSuccess ? timeAgo(lastSuccess.date) : '—'}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Total Backups</div>
            <div className="data-summary-value">{backups.length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Successful</div>
            <div className="data-summary-value accent">{backups.filter((b) => b.status === 'Success').length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Failed</div>
            <div className="data-summary-value" style={{ color: '#c0392b' }}>{backups.filter((b) => b.status === 'Failed').length}</div>
          </div>
        </div>

        <div className="backup-settings-card">
          <h3 className="backup-settings-title">Backup Configuration</h3>
          <div className="backup-settings-grid">
            <div className="backup-setting-item">
              <span className="backup-setting-label">Schedule</span>
              <span className="backup-setting-value">Daily at 04:00 AM</span>
            </div>
            <div className="backup-setting-item">
              <span className="backup-setting-label">Retention</span>
              <span className="backup-setting-value">30 days</span>
            </div>
            <div className="backup-setting-item">
              <span className="backup-setting-label">Storage</span>
              <span className="backup-setting-value">Supabase Storage</span>
            </div>
            <div className="backup-setting-item">
              <span className="backup-setting-label">Encryption</span>
              <span className="backup-setting-value" style={{ color: '#16a34a', fontWeight: 700 }}>✓ Enabled (AES-256)</span>
            </div>
          </div>
        </div>

        <div className="data-table-card">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            Backup History
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Backup ID</th>
                <th>Type</th>
                <th>Size</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.id}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                      background: b.type === 'Manual' ? '#ede9fe' : '#f0f0f0',
                      color: b.type === 'Manual' ? '#7c3aed' : '#555',
                    }}>{b.type}</span>
                  </td>
                  <td className="cell-muted">{b.size}</td>
                  <td className="cell-muted">{new Date(b.date).toLocaleString('en-IN')}</td>
                  <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td>
                    <div className="row-actions">
                      {b.status === 'Success' && <button type="button" className="row-btn" onClick={() => handleRestore(b)}>Restore</button>}
                      {b.status === 'Success' && <button type="button" className="row-btn" onClick={() => handleDownload(b)}>Download</button>}
                      {b.status === 'Failed' && <button type="button" className="row-btn danger" onClick={() => handleBackup()}>Retry</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  )
}
