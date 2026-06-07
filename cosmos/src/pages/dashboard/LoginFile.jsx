/* eslint-disable no-useless-assignment */
import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../../widgets/DashboardLayout'
import Modal from '../../shared/ui/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import useConfirm from '../../shared/lib/useConfirm'
import '../../shared/ui/DataPage.css'
import { Check, Eye, Edit, CheckCircle, Trash2, ClipboardList, Hourglass, RefreshCw, AlertTriangle } from 'lucide-react'

/* ─── Constants ─────────────────────────────────────────────── */
const STAGES = [
  'LOGIN', 'QUERY DC', 'PD', 'TECHNICAL', 'LEGAL', 'OFFER', 'MOD', 'FUND TRANSFER', 'COSMOS PAYOUT'
]

const STAGE_OFFSETS = [0, 2, 5, 8, 12, 15, 18, 22, 26]

const LOAN_TYPES = [
  'All Loan Types', 'Home Loan', 'Business Loan', 'Personal Loan',
  'Gold Loan', 'Mortgage', 'Loan Against Property', 'LAP'
]

const STATUS_FILTERS = ['All Status', 'Processing', 'Completed', 'Delayed']

const PRIORITY_META = {
  Normal: { label: 'NORMAL', color: 'var(--text-muted)', bg: 'var(--bg-input)', border: 'var(--border)' },
  High:   { label: 'HIGH PRIORITY', color: '#dc2626', bg: 'var(--bg-hover)', border: '#fecaca' },
  Urgent: { label: 'URGENT', color: '#dc2626', bg: 'var(--bg-hover)', border: '#fecaca' },
}

const FILE_STATUS_META = {
  Processing: { label: 'PROCESSING', color: '#2563eb', bg: 'var(--bg-hover)', border: '#bfdbfe' },
  Completed:  { label: 'COMPLETED',  color: '#16a34a', bg: 'var(--bg-hover)', border: '#bbf7d0' },
  Delayed:    { label: 'DELAYED',    color: '#dc2626', bg: 'var(--bg-hover)', border: '#fecaca' },
}

/* ─── Helpers ────────────────────────────────────────────────── */
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatShortDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function daysOverdue(expected) {
  if (!expected) return 0
  const diff = Math.floor((Date.now() - new Date(expected + 'T00:00:00').getTime()) / 86400000)
  return Math.max(0, diff)
}

function createStageDates(startDate) {
  const stages = {}
  STAGES.forEach((name, i) => {
    stages[name] = { expected: addDays(startDate, STAGE_OFFSETS[i]), actual: null }
  })
  return stages
}

function normalizeFile(f) {
  if (f.stages && f.currentStageIndex != null) return f
  const submitted = f.submitted || todayStr()
  const stages = createStageDates(submitted)
  let idx = 0
  if (f.stage) {
    const legacyMap = {
      Submission: 0, 'Document Review': 2, 'Credit Check': 3,
      Verification: 4, Disbursement: 8,
    }
    idx = legacyMap[f.stage] ?? 0
    for (let i = 0; i < idx; i++) stages[STAGES[i]].actual = stages[STAGES[i]].expected
  }
  return {
    ...f,
    client_id: f.client_id || f.file_no || '',
    priority: f.priority || 'Normal',
    submitted,
    stages,
    currentStageIndex: f.done ? STAGES.length : idx,
    done: f.done ?? false,
  }
}

function getStageStatus(file, stageIndex) {
  const stageName = STAGES[stageIndex]
  const stageData = file.stages?.[stageName] || {}
  const today = todayStr()
  const currentIdx = file.currentStageIndex ?? 0

  if (file.done || stageIndex < currentIdx) return 'completed'
  if (stageIndex === currentIdx && !file.done) {
    if (stageData.expected && stageData.expected < today && !stageData.actual) return 'delayed'
    return 'current'
  }
  return 'pending'
}

function getFileStatus(file) {
  if (file.done) return 'Completed'
  if (STAGES.some((_, i) => getStageStatus(file, i) === 'delayed')) return 'Delayed'
  return 'Processing'
}

function advanceStage(file) {
  const today = todayStr()
  const idx = file.currentStageIndex ?? 0
  const stageName = STAGES[idx]
  const stages = { ...file.stages }
  stages[stageName] = { ...stages[stageName], actual: today }

  if (idx >= STAGES.length - 1) {
    return { ...file, stages, done: true, currentStageIndex: STAGES.length }
  }
  return { ...file, stages, currentStageIndex: idx + 1, done: false }
}

function buildNewFile({ client, client_id, loan_type, priority = 'Normal' }) {
  const submitted = todayStr()
  return {
    client,
    client_id,
    loan_type,
    priority,
    submitted,
    stages: createStageDates(submitted),
    currentStageIndex: 0,
    done: false,
  }
}

const emptyAddForm = { client: '', client_id: '', loan_type: 'Home Loan' }

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, iconBg, accent }) {
  return (
    <div className="kpi-card" style={{ flex: '1 1 0', minWidth: 0 }}>
      <div className="kpi-header">
        <div className="kpi-icon-wrap" style={{ background: iconBg }}>
          {icon}
        </div>
        {sub && <span className="kpi-tag muted">{sub}</span>}
      </div>
      <div className="kpi-body">
        <div className="kpi-title">{label}</div>
        <div className="kpi-value" style={{ color: accent || 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  )
}

/* ─── Badge ─────────────────────────────────────────────────── */
function Tag({ label, color, bg, border }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
      background: bg, color, border: `1px solid ${border}`,
      letterSpacing: '0.04em', whiteSpace: 'nowrap'
    }}>{label}</span>
  )
}

/* ─── Progress Step ─────────────────────────────────────────── */
function StepNode({ status, stageName, stageData }) {
  const today = todayStr()
  const overdue = status === 'delayed' ? daysOverdue(stageData?.expected) : 0

  const nodeStyle = {
    completed: { bg: '#16a34a', border: '#16a34a', icon: <Check size={14} />, color: '#fff' },
    current:   { bg: '#fbbf24', border: '#f59e0b', icon: <Hourglass size={14} />, color: '#78350f' },
    delayed:   { bg: '#dc2626', border: '#dc2626', icon: '!', color: '#fff' },
    pending:   { bg: '#fff', border: 'var(--border-input)', icon: '', color: 'var(--text-faint)' },
  }[status]

  let subLabel = ''
  let subColor = 'var(--text-faint)'
  if (status === 'completed') {
    subLabel = `Act ${formatShortDate(stageData?.actual)}`
    subColor = '#16a34a'
  } else if (status === 'current') {
    if (stageData?.expected === today) {
      subLabel = 'Due Today'
      subColor = '#d97706'
    } else {
      subLabel = 'In Progress'
      subColor = '#d97706'
    }
  } else if (status === 'delayed') {
    subLabel = overdue === 1 ? 'Delayed 1 Day' : `Delayed ${overdue} Days`
    subColor = '#dc2626'
  } else {
    subLabel = `Exp ${formatShortDate(stageData?.expected)}`
    subColor = 'var(--text-faint)'
  }

  return (
    <div style={{ flex: '1 1 0', minWidth: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: nodeStyle.bg, border: `2px solid ${nodeStyle.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: status === 'delayed' ? 14 : 12, fontWeight: 700, color: nodeStyle.color,
        flexShrink: 0, zIndex: 1,
      }}>{nodeStyle.icon}</div>
      <div style={{
        fontSize: 9, fontWeight: 700, color: status === 'pending' ? 'var(--text-faint)' : 'var(--text-secondary)',
        textAlign: 'center', letterSpacing: '0.02em', lineHeight: 1.2,
      }}>{stageName}</div>
      {(status === 'completed' || status === 'current' || status === 'delayed') && stageData?.expected && (
        <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>Exp {formatShortDate(stageData.expected)}</div>
      )}
      <div style={{ fontSize: 9, fontWeight: 600, color: subColor, textAlign: 'center' }}>{subLabel}</div>
    </div>
  )
}

/* ─── Progress Timeline ─────────────────────────────────────── */
function ProgressTimeline({ file }) {
  return (
    <div style={{ position: 'relative', padding: '8px 0 4px' }}>
      <div style={{
        position: 'absolute', top: 22, left: '5%', right: '5%', height: 2,
        background: 'var(--border)', zIndex: 0,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
        {STAGES.map((name, i) => (
          <StepNode
            key={name}
            status={getStageStatus(file, i)}
            stageName={name}
            stageData={file.stages?.[name]}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── File Card ─────────────────────────────────────────────── */
function FileCard({ file, onMenu, activeMenuId,  onView, onEdit, onRemove, onMarkDone }) {
  const fileStatus = getFileStatus(file)
  const statusMeta = FILE_STATUS_META[fileStatus]
  const priorityMeta = PRIORITY_META[file.priority || 'Normal']
  const currentStage = file.done ? null : STAGES[file.currentStageIndex] ?? STAGES[0]

  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid #f0f0f0',
      padding: '18px 20px', marginBottom: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{file.client}</span>
            {file.client_id && (
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>ID: {file.client_id}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{file.loan_type}</span>
            {(file.priority === 'High' || file.priority === 'Urgent') && (
              <Tag {...priorityMeta} label={priorityMeta.label} />
            )}
            <Tag {...statusMeta} label={statusMeta.label} />
          </div>
        </div>

        {/* Three-dot menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            type="button"
            onClick={(ev) => { ev.stopPropagation(); onMenu(file.id) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: 'var(--text-faint)', padding: '4px 6px',
              borderRadius: 6, lineHeight: 1
            }}
          >⋮</button>

          {activeMenuId === file.id && (
            <div
              onClick={ev => ev.stopPropagation()}
              style={{
                position: 'absolute', right: 0, top: '110%', zIndex: 999,
                background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid #e5e7eb',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)', minWidth: 185, overflow: 'hidden'
              }}
            >
              <button onClick={() => onView(file)}
                style={menuBtn}><Eye size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> View Details</button>
              <button onClick={() => onEdit(file)}
                style={menuBtn}><Edit size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Edit File</button>
              {!file.done && (
                <button onClick={() => onMarkDone(file)}
                  style={{ ...menuBtn, color: '#16a34a' }}>
                  <CheckCircle size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Mark as Done{currentStage ? ` (${currentStage})` : ''}
                </button>
              )}
              <div style={{ borderTop: '1px solid #f5f5f5', margin: '4px 0' }} />
              <button onClick={() => onRemove(file)}
                style={{ ...menuBtn, color: '#dc2626' }}><Trash2 size={16} style={{marginRight: 8, verticalAlign: "middle"}} /> Remove</button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <ProgressTimeline file={file} />
    </div>
  )
}

const menuBtn = {
  width: '100%', padding: '10px 16px', background: 'none', border: 'none',
  cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text-secondary)',
  display: 'flex', alignItems: 'center', gap: 8,
}

/* ══════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════ */
export default function LoginFile() {
  const { loginFiles, addLoginFile, updateLoginFile, removeLoginFile } = useAppState()
  const { addToast } = useToast()

  const files = useMemo(() => loginFiles.map(normalizeFile), [loginFiles])

  const [search, setSearch]         = useState('')
  const [loanFilter, setLoan]       = useState('All Loan Types')
  const [fromDate, setFromDate]     = useState('')
  const [toDate, setToDate]         = useState('')
  const [statusFilter, setStatus]   = useState('All Status')

  const [modalOpen, setModalOpen]   = useState(false)
  const [modalMode, setModalMode]   = useState('add')
  const [formData, setFormData]     = useState(emptyAddForm)
  const [editData, setEditData]     = useState(null)

  const [activeMenuId, setActiveMenuId] = useState(null)
  useEffect(() => {
    const handler = () => setActiveMenuId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const confirm = useConfirm()

  /* ── Filtering ── */
  const filtered = files.filter((f) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || (f.client && f.client.toLowerCase().includes(q))
      || (f.client_id && f.client_id.toLowerCase().includes(q))
    const matchLoan = loanFilter === 'All Loan Types' || f.loan_type === loanFilter
    const matchStatus = statusFilter === 'All Status' || getFileStatus(f) === statusFilter
    let matchDate = true
    if (fromDate && f.submitted) matchDate = matchDate && f.submitted >= fromDate
    if (toDate && f.submitted) matchDate = matchDate && f.submitted <= toDate
    return matchSearch && matchLoan && matchStatus && matchDate
  })

  /* ── Stats ── */
  const total      = files.length
  const completed  = files.filter(f => f.done).length
  const delayed    = files.filter(f => !f.done && getFileStatus(f) === 'Delayed').length
  const processing = files.filter(f => !f.done && getFileStatus(f) === 'Processing').length

  const stats = [
    { label: 'Total Files', value: total,      sub: total > 0 ? `+${Math.round((processing / total) * 100)}% active` : '', icon: <ClipboardList size={20} color="#3b82f6" />, iconBg: 'var(--bg-hover)' },
    { label: 'Processing',  value: processing, sub: 'Currently in pipeline', icon: <RefreshCw size={20} color="#f59e0b" />, iconBg: 'var(--bg-hover)' },
    { label: 'Completed',   value: completed,  sub: 'Fully disbursed',       icon: <CheckCircle size={20} color="#16a34a" />, iconBg: 'var(--bg-hover)', accent: '#16a34a' },
    { label: 'Delayed',     value: delayed,    sub: 'Needs attention',       icon: <AlertTriangle size={20} color="#dc2626" />, iconBg: 'var(--bg-hover)', accent: '#dc2626' },
  ]

  /* ── Handlers ── */
  const openAddModal = () => {
    setModalMode('add')
    setFormData(emptyAddForm)
    setEditData(null)
    setModalOpen(true)
  }

  const openEditModal = (f) => {
    setModalMode('edit')
    setEditData({ ...f, stages: { ...f.stages } })
    setModalOpen(true)
  }

  const openViewModal = (f) => {
    setModalMode('view')
    setEditData({ ...f })
    setModalOpen(true)
  }

  const saveAddFile = () => {
    if (!formData.client.trim()) {
      addToast('Customer name is required.', 'error')
      return
    }
    if (!formData.client_id.trim()) {
      addToast('Customer ID is required.', 'error')
      return
    }
    const payload = buildNewFile(formData)
    addLoginFile(payload)
    addToast('New file added successfully.', 'success')
    setModalOpen(false)
  }

  const saveEditFile = () => {
    if (!editData?.client?.trim()) {
      addToast('Customer name is required.', 'error')
      return
    }
    updateLoginFile(editData)
    addToast('File updated successfully.', 'success')
    setModalOpen(false)
  }

  const handleMarkDoneRequest = async (f) => {
    const ok = await confirm({
      title: 'Mark Stage as Done?',
      message: `This will complete "${STAGES[f.currentStageIndex]}" and advance to the next stage for ${f.client}.`,
      confirmLabel: 'Yes, Mark Done',
      cancelLabel: 'Cancel',
      variant: 'info',
    })
    if (ok) {
      const updated = advanceStage(f)
      updateLoginFile(updated)
      const stageName = STAGES[f.currentStageIndex]
      if (updated.done) {
        addToast(`${f.client} — all stages completed!`, 'success')
      } else {
        addToast(`${stageName} marked done. Now at ${STAGES[updated.currentStageIndex]}.`, 'success')
      }
    }
  }

  const handleDelete = async (f) => {
    const ok = await confirm({
      title: 'Remove File?',
      message: `Are you sure you want to remove the file for ${f.client}? This action cannot be undone.`,
      confirmLabel: 'Yes, Remove',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (ok) {
      removeLoginFile(f.id)
      addToast('File removed successfully.', 'success')
    }
  }

  const updateEditStage = (stageName, field, value) => {
    setEditData(prev => ({
      ...prev,
      stages: {
        ...prev.stages,
        [stageName]: { ...prev.stages[stageName], [field]: value || null },
      },
    }))
  }

  const setCurrentStage = (stageIndex) => {
    const idx = Number(stageIndex)
    setEditData(prev => {
      const stages = { ...prev.stages }
      STAGES.forEach((name, i) => {
        if (i < idx && !stages[name]?.actual) {
          stages[name] = { ...stages[name], actual: stages[name]?.expected || todayStr() }
        }
        if (i >= idx) {
          stages[name] = { ...stages[name], actual: null }
        }
      })
      return {
        ...prev,
        stages,
        currentStageIndex: idx,
        done: idx >= STAGES.length,
      }
    })
  }

  const handleStageStatusChange = (stageIndex, newStatus) => {
    const k = Number(stageIndex)
    const stageName = STAGES[k]
    
    if (newStatus === 'completed') {
      setCurrentStage(k + 1)
    } else if (newStatus === 'pending') {
      setCurrentStage(k)
    } else if (newStatus === 'delayed') {
      const yesterday = addDays(todayStr(), -1)
      setCurrentStage(k)
      setEditData(prev => {
        const stages = { ...prev.stages }
        stages[stageName] = { ...stages[stageName], expected: yesterday, actual: null }
        return { ...prev, stages }
      })
    }
  }

  const clearFilters = () => {
    setSearch('')
    setLoan('All Loan Types')
    setFromDate('')
    setToDate('')
    setStatus('All Status')
  }

  const inputStyle = {
    border: '1.5px solid var(--border-input)', borderRadius: 8, padding: '8px 12px',
    fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-surface)', outline: 'none', width: '100%',
  }

  const labelStyle = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }

  /* ══════════════════════════════════════════
     Render
  ══════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className="data-page">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Login File Tracking</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Real-time monitoring of loan application lifecycles and compliance stages.
            </p>
          </div>
          <button onClick={openAddModal} style={{
            background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(229,62,62,0.3)',
          }}>+ Add New File</button>
        </div>

        {/* Stats */}
        <div className="kpi-row" style={{ marginBottom: 24 }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Filters */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border)',
          padding: '16px 20px', marginBottom: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={labelStyle}>Search File/Customer
                <input type="text" placeholder="Name or ID..." value={search}
                  onChange={e => setSearch(e.target.value)} style={inputStyle} />
              </label>
            </div>
            <div style={{ minWidth: 140 }}>
              <label style={labelStyle}>FROM DATE
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
              </label>
            </div>
            <div style={{ minWidth: 140 }}>
              <label style={labelStyle}>TO DATE
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
              </label>
            </div>
            <div style={{ minWidth: 150 }}>
              <label style={labelStyle}>STATUS
                <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                  {STATUS_FILTERS.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div style={{ minWidth: 160 }}>
              <label style={labelStyle}>Loan Type
                <select value={loanFilter} onChange={e => setLoan(e.target.value)} style={inputStyle}>
                  {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
            <button onClick={clearFilters} style={{
              background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1.5px solid var(--border-input)',
              borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Clear</button>
          </div>
        </div>

        {/* File cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-faint)', fontSize: 15 }}>
            No files found. Try adjusting your filters or add a new file.
          </div>
        ) : (
          filtered.map(f => (
            <FileCard
              key={f.id}
              file={f}
              activeMenuId={activeMenuId}
              onMenu={(id) => setActiveMenuId(activeMenuId === id ? null : id)}
              setActiveMenuId={setActiveMenuId}
              onView={(file) => { openViewModal(file); setActiveMenuId(null) }}
              onEdit={(file) => { openEditModal(file); setActiveMenuId(null) }}
              onRemove={(file) => { handleDelete(file); setActiveMenuId(null) }}
              onMarkDone={(file) => { handleMarkDoneRequest(file); setActiveMenuId(null) }}
            />
          ))
        )}

        {/* FAB */}
        <button onClick={openAddModal} title="Add New File" style={{
          position: 'fixed', bottom: 32, right: 32, width: 56, height: 56,
          borderRadius: '50%', background: '#e53e3e', color: '#fff', border: 'none',
          fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 16px rgba(229,62,62,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>+</button>

        {/* Add Modal */}
        {modalOpen && modalMode === 'add' && (
          <Modal title="Add New File" onClose={() => setModalOpen(false)}>
            <div className="form-grid">
              <label>Customer Name *
                <input type="text" placeholder="Full name" value={formData.client}
                  onChange={e => setFormData({ ...formData, client: e.target.value })} />
              </label>
              <label>Customer ID *
                <input type="text" placeholder="e.g. CF_931" value={formData.client_id}
                  onChange={e => setFormData({ ...formData, client_id: e.target.value })} />
              </label>
              <label>Loan Type
                <select value={formData.loan_type}
                  onChange={e => setFormData({ ...formData, loan_type: e.target.value })}>
                  {LOAN_TYPES.slice(1).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 0' }}>
              The file will start at the <strong>LOGIN</strong> stage with expected dates auto-calculated for all stages.
            </p>
            <div className="modal-actions">
              <button type="button" className="data-btn data-btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="data-btn data-btn-primary" onClick={saveAddFile}>Add File</button>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {modalOpen && modalMode === 'edit' && editData && (
          <Modal title="Edit File" onClose={() => setModalOpen(false)} size="lg">
            <div className="form-grid">
              <label>Customer Name *
                <input type="text" value={editData.client}
                  onChange={e => setEditData({ ...editData, client: e.target.value })} />
              </label>
              <label>Customer ID
                <input type="text" value={editData.client_id || ''}
                  onChange={e => setEditData({ ...editData, client_id: e.target.value })} />
              </label>
              <label>Loan Type
                <select value={editData.loan_type}
                  onChange={e => setEditData({ ...editData, loan_type: e.target.value })}>
                  {LOAN_TYPES.slice(1).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label>Priority
                <select value={editData.priority || 'Normal'}
                  onChange={e => setEditData({ ...editData, priority: e.target.value })}>
                  {['Normal', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label>Current Stage
                <select value={editData.currentStageIndex ?? 0}
                  onChange={e => setCurrentStage(e.target.value)}>
                  {STAGES.map((s, i) => <option key={s} value={i}>{s}</option>)}
                </select>
              </label>
              <label>Submitted Date
                <input type="date" value={editData.submitted || ''}
                  onChange={e => setEditData({ ...editData, submitted: e.target.value })} />
              </label>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Stage Dates — adjust expected &amp; actual dates to reflect delays
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Stage</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Expected</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Actual</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STAGES.map((name, i) => {
                      const st = getStageStatus(editData, i)
                      const sd = editData.stages?.[name] || {}
                      const stColors = { completed: '#16a34a', current: '#d97706', delayed: '#dc2626', pending: 'var(--text-faint)' }
                      return (
                        <tr key={name} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600 }}>{name}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <input type="date" value={sd.expected || ''} style={{ ...inputStyle, width: 'auto' }}
                              onChange={e => updateEditStage(name, 'expected', e.target.value)} />
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <input type="date" value={sd.actual || ''} style={{ ...inputStyle, width: 'auto' }}
                              onChange={e => updateEditStage(name, 'actual', e.target.value)} />
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <select
                              value={st === 'current' ? 'pending' : st}
                              onChange={(e) => handleStageStatusChange(i, e.target.value)}
                              style={{
                                border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 8px',
                                fontSize: 12, fontWeight: 600, color: stColors[st], background: 'var(--bg-surface)',
                                outline: 'none', cursor: 'pointer'
                              }}
                            >
                              <option value="pending" style={{ color: 'var(--text-faint)' }}>Not started</option>
                              <option value="completed" style={{ color: '#16a34a' }}>Completed</option>
                              <option value="delayed" style={{ color: '#dc2626' }}>Delayed</option>
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="data-btn data-btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="button" className="data-btn data-btn-primary" onClick={saveEditFile}>Save Changes</button>
            </div>
          </Modal>
        )}

        {/* View Modal */}
        {modalOpen && modalMode === 'view' && editData && (
          <Modal title="File Details" onClose={() => setModalOpen(false)} size="lg">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 20 }}>
              {[
                ['Customer', editData.client],
                ['ID', editData.client_id],
                ['Loan Type', editData.loan_type],
                ['Priority', editData.priority || 'Normal'],
                ['Submitted', editData.submitted],
                ['Status', getFileStatus(editData)],
                ['Current Stage', editData.done ? 'All Complete' : STAGES[editData.currentStageIndex]],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{v || '—'}</div>
                </div>
              ))}
            </div>
            <ProgressTimeline file={editData} />
            <div className="modal-actions">
              <button type="button" className="data-btn data-btn-outline" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
