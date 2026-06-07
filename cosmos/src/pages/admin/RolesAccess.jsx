import DashboardLayout from '../../widgets/DashboardLayout'
import './AdminPages.css'
import { Check as CheckIcon, X } from 'lucide-react';

const permissions = [
  { feature: 'Dashboard',          admin: true,  advisor: true,  staff: true  },
  { feature: 'Client Record Book', admin: true,  advisor: true,  staff: true  },
  { feature: 'Associates Book',    admin: true,  advisor: true,  staff: false },
  { feature: 'Payments',           admin: true,  advisor: true,  staff: false },
  { feature: 'Invoice',            admin: true,  advisor: true,  staff: false },
  { feature: 'Backup Data',        admin: true,  advisor: false, staff: false },
  { feature: 'User Management',    admin: true,  advisor: false, staff: false },
  { feature: 'Roles & Access',     admin: true,  advisor: false, staff: false },
  { feature: 'Audit Log',          admin: true,  advisor: false, staff: false },
  { feature: 'System Settings',    admin: true,  advisor: false, staff: false },
]

function Check({ allowed }) {
  return allowed ? (
    <span className="perm-yes"><CheckIcon size={16} /></span>
  ) : (
    <span className="perm-no"><X size={16} /></span>
  )
}

function RolesAccess() {
  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <h2 className="admin-page-title">Roles & Access</h2>
          <p className="admin-page-sub">Permission matrix for all roles</p>
        </div>

        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th style={{ textAlign: 'center' }}>Admin</th>
                <th style={{ textAlign: 'center' }}>Advisor</th>
                <th style={{ textAlign: 'center' }}>Staff</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.feature}>
                  <td>{p.feature}</td>
                  <td style={{ textAlign: 'center' }}><Check allowed={p.admin} /></td>
                  <td style={{ textAlign: 'center' }}><Check allowed={p.advisor} /></td>
                  <td style={{ textAlign: 'center' }}><Check allowed={p.staff} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default RolesAccess
