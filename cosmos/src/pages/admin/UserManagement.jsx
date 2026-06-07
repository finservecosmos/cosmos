import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../widgets/DashboardLayout'
import Modal from '../../shared/ui/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../../shared/lib/useConfirm'
import './AdminPages.css'

const roleBadge = {
  admin:   { color: '#c0392b', bg: '#fde8e8' },
  advisor: { color: '#d97706', bg: '#fef3c7' },
  staff:   { color: '#16a34a', bg: '#dcfce7' },
}

const defaultForm = { id: null, name: '', email: '', role: 'staff', status: 'active' }

function UserManagement() {
  const { users, addUser, updateUser, removeUser } = useAppState()
  const { addToast } = useToast()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    document.title = 'User Management | Cosmos'
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, users])

  const openAddModal = () => {
    setFormData(defaultForm)
    setModalOpen(true)
  }

  const openEditModal = (user) => {
    setFormData(user)
    setModalOpen(true)
  }

  const saveUser = () => {
    if (!formData.name || !formData.email) {
      addToast('Name and email are required.', 'error')
      return
    }
    if (formData.id) {
      updateUser(formData)
      addToast('User updated successfully.', 'success')
    } else {
      addUser(formData)
      addToast('User added successfully.', 'success')
    }
    setModalOpen(false)
  }

  const toggleStatus = (user) => {
    updateUser({ ...user, status: user.status === 'active' ? 'inactive' : 'active' })
    addToast(`User ${user.status === 'active' ? 'deactivated' : 'activated'}.`, 'success')
  }

  const handleDeleteUser = async (user) => {
    const ok = await confirm({
      title: 'Delete User Account?',
      message: `Are you sure you want to permanently delete the user account for ${user.name} (${user.email})? This action cannot be undone.`,
      confirmLabel: 'Delete User',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (ok) {
      removeUser(user.id)
      addToast('User deleted successfully.', 'success')
    }
  }

  return (
    <DashboardLayout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h2 className="admin-page-title">User Management</h2>
            <p className="admin-page-sub">Manage users, edit roles and activation status.</p>
          </div>
          <div className="admin-header-actions">
            <input
              className="admin-search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="admin-primary-btn" onClick={openAddModal}>+ Add User</button>
          </div>
        </div>

        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const rb = roleBadge[u.role] || roleBadge.staff
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">{u.name.charAt(0)}</div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="admin-muted">{u.email}</td>
                    <td>
                      <span className="admin-badge" style={{ color: rb.color, background: rb.bg }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status ${u.status}`}>{u.status}</span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn" onClick={() => openEditModal(u)}>Edit</button>
                        <button className="admin-action-btn danger" onClick={() => toggleStatus(u)}>
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="admin-action-btn" style={{ color: '#c0392b' }} onClick={() => handleDeleteUser(u)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <Modal title={formData.id ? 'Edit user' : 'Add user'} onClose={() => setModalOpen(false)}>
            <div className="form-field">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Role</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="advisor">Advisor</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="admin-primary-btn" onClick={saveUser}>Save user</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}

export default UserManagement
