import DashboardLayout from '../../widgets/DashboardLayout'
import './AdminPages.css'

const dummyLogs = [
  { id: 1, user: 'Dev User',     action: 'Logged in',                  target: 'System',          time: '2 mins ago' },
  { id: 2, user: 'Meena Sharma', action: 'Created client record',       target: 'Rajesh Kumar',    time: '1 hour ago' },
  { id: 3, user: 'Dev User',     action: 'Updated payment status',      target: 'File #8821',      time: '3 hours ago' },
  { id: 4, user: 'Ravi Patel',   action: 'Viewed client record',        target: 'Priya Nair',      time: '5 hours ago' },
  { id: 5, user: 'Dev User',     action: 'Exported backup',             target: 'Database',        time: 'Yesterday' },
  { id: 6, user: 'Meena Sharma', action: 'Added follow-up',             target: 'Amitabh S.',      time: 'Yesterday' },
  { id: 7, user: 'Dev User',     action: 'Changed user role',           target: 'Ravi Patel → staff', time: '2 days ago' },
]

function AuditLog() {
  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <h2 className="admin-page-title">Audit Log</h2>
          <p className="admin-page-sub">All system actions are recorded here</p>
        </div>

        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {dummyLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-avatar">{log.user.charAt(0)}</div>
                      <span>{log.user}</span>
                    </div>
                  </td>
                  <td>{log.action}</td>
                  <td className="admin-muted">{log.target}</td>
                  <td className="admin-muted">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AuditLog
