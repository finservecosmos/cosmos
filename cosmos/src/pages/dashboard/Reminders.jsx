import { useEffect, useMemo, useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../shared/ui/Modal'
import DashboardLayout from '../../widgets/DashboardLayout'
import '../../shared/ui/DataPage.css'
import './Reminders.css'
import { CheckCircle } from 'lucide-react';

const priorityConfig = {
  high:   { color: '#c0392b', bg: '#fde8e8', label: 'High' },
  medium: { color: '#d97706', bg: '#fef3c7', label: 'Medium' },
  low:    { color: '#16a34a', bg: '#dcfce7', label: 'Low' },
}

const tabs = ['All', 'Pending', 'High', 'Completed']

export default function Reminders() {
  const {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
  } = useAppState()
  const { addToast } = useToast()

  const [filter, setFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [activeReminder, setActiveReminder] = useState(null)
  const [formState, setFormState] = useState({ title: '', description: '', date: '', priority: 'medium' })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    document.title = 'Reminders | Cosmos'
  }, [])

  const filtered = useMemo(() => reminders.filter((r) => {
    if (filter === 'Pending') return !r.done
    if (filter === 'Completed') return r.done
    if (filter === 'High') return r.priority === 'high' && !r.done
    return true
  }), [filter, reminders])

  const pending = reminders.filter((r) => !r.done).length

  const openAddModal = () => {
    setActiveReminder(null)
    setFormState({ title: '', description: '', date: '', priority: 'medium' })
    setFormErrors({})
    setModalOpen(true)
  }

  const openEditModal = (reminder) => {
    setActiveReminder(reminder)
    setFormState({
      title: reminder.title,
      description: reminder.description,
      date: reminder.date,
      priority: reminder.priority,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setActiveReminder(null)
  }

  const handleSave = () => {
    const errors = {}
    if (!formState.title) errors.title = 'Title is required'
    if (!formState.description) errors.description = 'Description is required'
    if (!formState.date) errors.date = 'Due date is required'
    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    if (activeReminder) {
      updateReminder({ ...activeReminder, ...formState })
      addToast('Reminder updated successfully.', 'success')
    } else {
      addReminder({ ...formState, done: false })
      addToast('Reminder added successfully.', 'success')
    }
    closeModal()
  }

  const toggleDone = (id) => {
    const reminder = reminders.find((r) => r.id === id)
    if (reminder) updateReminder({ ...reminder, done: !reminder.done })
  }

  const handleDelete = (id) => {
    deleteReminder(id)
    addToast('Reminder deleted.', 'success')
  }

  return (
    <DashboardLayout>
      <div className="data-page">
        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Reminders</h2>
            <p className="data-page-sub">{pending} pending reminders</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openAddModal}>+ Add Reminder</button>
        </div>

        <div className="data-summary">
          <div className="data-summary-item">
            <div className="data-summary-label">Total</div>
            <div className="data-summary-value">{reminders.length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Pending</div>
            <div className="data-summary-value accent">{pending}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">High Priority</div>
            <div className="data-summary-value" style={{ color: '#c0392b' }}>{reminders.filter((r) => r.priority === 'high' && !r.done).length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Completed</div>
            <div className="data-summary-value">{reminders.filter((r) => r.done).length}</div>
          </div>
        </div>

        <div className="reminder-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`reminder-tab${filter === tab ? ' active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="reminder-list">
          {filtered.length === 0 ? (
            <div className="data-empty">
              <div className="data-empty-icon"><CheckCircle size={48} /></div>
              <div className="data-empty-title">All clear!</div>
              <div className="data-empty-sub">No reminders in this category</div>
            </div>
          ) : filtered.map((r) => {
            const cfg = priorityConfig[r.priority]
            return (
              <div key={r.id} className={`reminder-item${r.done ? ' done' : ''}`}>
                <button className="reminder-check" onClick={() => toggleDone(r.id)} aria-label={r.done ? 'Mark pending' : 'Mark done'}>
                  {r.done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : null}
                </button>
                <div className="reminder-body">
                  <div className="reminder-top">
                    <p className="reminder-title">{r.title}</p>
                    <span className="reminder-priority" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    <span className="reminder-date">{r.date}</span>
                  </div>
                  <p className="reminder-desc">{r.description}</p>
                </div>
                <div className="row-actions">
                  <button type="button" className="row-btn" onClick={() => openEditModal(r)}>Edit</button>
                  <button type="button" className="row-btn danger" onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>

        {modalOpen && (
          <Modal title={activeReminder ? 'Edit Reminder' : 'Add Reminder'} onClose={closeModal} size="md">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="reminderTitle">Title</label>
                <input
                  id="reminderTitle"
                  className={`form-input${formErrors.title ? ' error' : ''}`}
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                />
                {formErrors.title && <span className="form-error">{formErrors.title}</span>}
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reminderPriority">Priority</label>
                <select
                  id="reminderPriority"
                  className="form-select"
                  value={formState.priority}
                  onChange={(e) => setFormState((prev) => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="reminderDate">Due date</label>
                <input
                  id="reminderDate"
                  type="date"
                  className={`form-input${formErrors.date ? ' error' : ''}`}
                  value={formState.date}
                  onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                />
                {formErrors.date && <span className="form-error">{formErrors.date}</span>}
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="reminderDescription">Description</label>
                <textarea
                  id="reminderDescription"
                  className={`form-textarea${formErrors.description ? ' error' : ''}`}
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                />
                {formErrors.description && <span className="form-error">{formErrors.description}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button type="button" className="btn-submit" onClick={handleSave}>Save reminder</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
