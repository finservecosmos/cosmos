import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../widgets/DashboardLayout'
import { Users, Shield, FileText, Settings, Database, ArrowRight } from 'lucide-react'
import './AdminPages.css'

const adminModules = [
  { 
    title: 'User Management', 
    path: '/admin/users', 
    icon: <Users size={28} />, 
    color: '#3b82f6',
    bgColor: '#dbeafe',
    desc: 'Manage user accounts, roles, and platform access.' 
  },
  { 
    title: 'Roles & Access', 
    path: '/admin/roles', 
    icon: <Shield size={28} />, 
    color: '#10b981',
    bgColor: '#d1fae5',
    desc: 'Configure role-based access control and security policies.' 
  },
  { 
    title: 'Audit Log', 
    path: '/admin/audit-log', 
    icon: <FileText size={28} />, 
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    desc: 'View system activity, login history, and audit trails.' 
  },
  { 
    title: 'System Settings', 
    path: '/admin/settings', 
    icon: <Settings size={28} />, 
    color: '#f59e0b',
    bgColor: '#fef3c7',
    desc: 'Configure system-wide preferences and session timeouts.' 
  },
  { 
    title: 'Backup Data', 
    path: '/backup', 
    icon: <Database size={28} />, 
    color: '#ef4444',
    bgColor: '#fee2e2',
    desc: 'Manage system data backups and retention policies.' 
  },
]

function AdminSettingsHub() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <h2 className="admin-page-title">Admin & Settings</h2>
          <p className="admin-page-sub">Centralized hub for all administrative and system configuration tasks</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
          {adminModules.map((module) => (
            <div 
              key={module.path} 
              onClick={() => navigate(module.path)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: module.bgColor, color: module.color
                }}>
                  {module.icon}
                </div>
                <div style={{ color: 'var(--text-faint)' }}>
                  <ArrowRight size={20} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {module.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {module.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminSettingsHub
