import { useState, useEffect } from 'react'
import { z } from 'zod'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../context/ToastContext'
import { useUser } from '../../context/UserContext'
import './DataPage.css'
import { User, Briefcase, Coins, Search, Eye, Edit, ClipboardCheck, Building2, FolderCheck, CheckCircle, Hourglass, FileText } from 'lucide-react';

function maskAadhaar(num) {
  if (!num) return ''
  const clean = num.toString().replace(/\s+/g, '')
  if (clean.length < 12) return num
  return `XXXX-XXXX-${clean.slice(-4)}`
}

function maskPAN(pan) {
  if (!pan) return ''
  const clean = pan.toString().toUpperCase().trim()
  if (clean.length < 10) return pan
  return `${clean.slice(0, 5)}••••${clean.slice(-1)}`
}

const step1Schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  pan_card: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN Card format (e.g. ABCDE1234F)'),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar Number must be exactly 12 digits'),
  residential_status: z.string().min(1, 'Residential status is required'),
  location: z.string().min(1, 'Location is required'),
})

const step2Schema = z.object({
  employment_status: z.string().min(1),
  monthly_net_income: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Monthly income must be a valid number' }).min(0, 'Income cannot be negative').optional()
  ),
  co_applicant_income: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Co-applicant income must be a valid number' }).min(0, 'Income cannot be negative').optional()
  ),
  dwelling_status: z.string().min(1),
  tenure_at_address: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Tenure must be a valid number' }).min(0, 'Tenure cannot be negative').optional()
  ),
})

const step3Schema = z.object({
  file_no: z.string().min(1, 'File number is required'),
  loan_type: z.string().min(1),
  amount: z.preprocess((val) => Number(val), z.number().min(0, 'Amount cannot be negative')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  associate: z.string().optional(),
  status: z.string().min(1),
})

const clientSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  pan_card: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN Card format (e.g. ABCDE1234F)'),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar Number must be exactly 12 digits'),
  residential_status: z.string().min(1, 'Residential status is required'),
  location: z.string().min(1, 'Location is required'),
  employment_status: z.string().optional(),
  monthly_net_income: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  co_applicant_income: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  dwelling_status: z.string().optional(),
  tenure_at_address: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  file_no: z.string().min(1, 'File number is required'),
  loan_type: z.string().min(1),
  amount: z.preprocess((val) => Number(val), z.number().min(0)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  associate: z.string().optional(),
  status: z.string().min(1),
})

const statusClass = (s) => 'status-badge status-' + s.toLowerCase().replace(' ', '-')

function formatAmount(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

const LOAN_TYPES = ['All', 'Home Loan', 'Business Loan', 'Personal Loan', 'Gold Loan', 'Mortgage']
const STATUSES = ['All', 'Enquiry', 'Processing', 'Approved', 'Disbursed', 'Closed']

const MAJOR_LOCATIONS = [
  'Mumbai, MH', 'Delhi NCR', 'Bengaluru, KA', 'Kolkata, WB',
  'Chennai, TN', 'Hyderabad, TG', 'Pune, MH', 'Ahmedabad, GJ',
  'Jaipur, RJ', 'Lucknow, UP', 'Indore, MP', 'Kochi, KL', 'Patna, BR'
]

function HybridLocationPicker({ value, onChange, disabled }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        list="indian-major-cities"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type custom or choose major city..."
        style={{ width: '100%' }}
      />
      <datalist id="indian-major-cities">
        {MAJOR_LOCATIONS.map((loc) => (
          <option key={loc} value={loc} />
        ))}
      </datalist>
    </div>
  )
}

const emptyClient = {
  name: '', phone: '', email: '', loan_type: 'Home Loan', amount: 0,
  status: 'Enquiry', file_no: '', date: new Date().toISOString().slice(0, 10), associate: '', id: null,
  pan_card: '', aadhaar_number: '', residential_status: 'Resident Indian',
  employment_status: 'Salaried', monthly_net_income: '', co_applicant_income: '',
  dwelling_status: 'Owned', tenure_at_address: '', location: ''
}

export default function ClientRecordBook() {
  const { clients, addClient, updateClient } = useAppState()
  const { addToast } = useToast()
  const { user } = useUser()
  const [search, setSearch] = useState('')
  const [loanFilter, setLoan] = useState('All')
  const [statusFilter, setStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [formData, setFormData] = useState(emptyClient)

  // Data Masking reveal state
  const [revealAadhaar, setRevealAadhaar] = useState(false)
  const [revealPAN, setRevealPAN] = useState(false)

  // Form Validation state
  const [validationErrors, setValidationErrors] = useState({})

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 5

  // Stepper Wizard states
  const [showAddWizard, setShowAddWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  // Three-dot ellipsis menu states
  const [activeMenuId, setActiveMenuId] = useState(null)

  // KYC Mock document upload statuses per client ID
  const [clientDocs, setClientDocs] = useState({
    'C001': { 'PAN Card': 'success', 'Aadhaar Card': 'success', 'IT Return': 'success', 'Bank Statement': 'pending' },
    'C002': { 'PAN Card': 'success', 'Aadhaar Card': 'success', 'IT Return': 'pending', 'Bank Statement': 'success' },
    'C003': { 'PAN Card': 'success', 'Aadhaar Card': 'success', 'IT Return': 'pending', 'Bank Statement': 'pending' },
  })
  const [uploadProgress, setUploadProgress] = useState({}) // { docType: progress }

  // Camera scanner states
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanType, setScanType] = useState(null) // 'pan' | 'aadhaar'
  const [videoStream, setVideoStream] = useState(null)
  const [scanStatus, setScanStatus] = useState('idle') // 'idle' | 'camera_active' | 'mock_active' | 'capturing' | 'extracting' | 'success'

  const handleStartScan = async (type) => {
    setScanType(type)
    setScannerOpen(true)
    setScanStatus('idle')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      setVideoStream(stream)
      setScanStatus('camera_active')
    } catch (err) {
      console.warn('Camera access denied or not available, falling back to simulation', err)
      setScanStatus('mock_active')
    }
  }

  const handleStopScan = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    setScannerOpen(false)
    setScanStatus('idle')
  }

  const handleCapture = () => {
    setScanStatus('capturing')
    setTimeout(() => {
      setScanStatus('extracting')
      setTimeout(() => {
        setScanStatus('success')

        if (scanType === 'pan') {
          const mockPan = 'BPDPM' + Math.floor(1000 + Math.random() * 9000) + 'K'
          setFormData(prev => ({ ...prev, pan_card: mockPan }))
          setValidationErrors(prev => ({ ...prev, pan_card: null }))
          addToast(`Extracted PAN Card successfully: ${mockPan}`, 'success')
        } else {
          const mockAadhaar = Math.floor(100000000000 + Math.random() * 900000000000).toString()
          setFormData(prev => ({ ...prev, aadhaar_number: mockAadhaar }))
          setValidationErrors(prev => ({ ...prev, aadhaar_number: null }))
          addToast(`Extracted Aadhaar Number successfully: ${mockAadhaar}`, 'success')
        }

        setTimeout(() => {
          handleStopScan()
        }, 1200)
      }, 1500)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [videoStream])

  useEffect(() => {
    let videoEl = document.getElementById('scanner-video-feed')
    if (videoEl && videoStream) {
      videoEl.srcObject = videoStream
      videoEl.play().catch(err => console.log('Video play error:', err))
    }
  }, [videoStream, scannerOpen])

  // Auto-close three-dot popovers when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null)
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, loanFilter, statusFilter])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.file_no.includes(q) || c.phone.includes(q)
    const matchLoan = loanFilter === 'All' || c.loan_type === loanFilter
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchLoan && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedClients = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const totalDisbursed = clients
    .filter(c => ['Approved', 'Disbursed'].includes(c.status))
    .reduce((s, c) => s + c.amount, 0)

  const openAddModal = () => {
    setModalMode('add')
    setFormData(emptyClient)
    setValidationErrors({})
    setShowAddWizard(true)
    setWizardStep(1)
  }

  const openEditModal = (client) => {
    setModalMode('edit')
    setFormData(client)
    setValidationErrors({})
    setModalOpen(true)
  }

  const openViewModal = (client) => {
    setModalMode('view')
    setFormData(client)
    setRevealAadhaar(false)
    setRevealPAN(false)
    setValidationErrors({})
    setModalOpen(true)
  }

  const validateStep1 = () => {
    const step1Data = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      pan_card: formData.pan_card,
      aadhaar_number: formData.aadhaar_number,
      residential_status: formData.residential_status || 'Resident Indian',
      location: formData.location
    }
    const result = step1Schema.safeParse(step1Data)
    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })
      setValidationErrors(fieldErrors)
      addToast('Please correct the validation errors to proceed.', 'error')
      return false
    }
    setValidationErrors({})
    return true
  }

  const validateStep2 = () => {
    const step2Data = {
      employment_status: formData.employment_status || 'Salaried',
      monthly_net_income: formData.monthly_net_income,
      co_applicant_income: formData.co_applicant_income,
      dwelling_status: formData.dwelling_status || 'Owned',
      tenure_at_address: formData.tenure_at_address
    }
    const result = step2Schema.safeParse(step2Data)
    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })
      setValidationErrors(fieldErrors)
      addToast('Please correct the validation errors to proceed.', 'error')
      return false
    }
    setValidationErrors({})
    return true
  }

  const validateStep3 = () => {
    const step3Data = {
      file_no: formData.file_no,
      loan_type: formData.loan_type,
      amount: formData.amount,
      date: formData.date,
      associate: formData.associate,
      status: formData.status
    }
    const result = step3Schema.safeParse(step3Data)
    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })
      setValidationErrors(fieldErrors)
      addToast('Please correct the validation errors to submit.', 'error')
      return false
    }
    setValidationErrors({})
    return true
  }

  const saveClient = () => {
    const result = clientSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })
      setValidationErrors(fieldErrors)
      addToast('Please fix the validation errors before saving.', 'error')
      return
    }
    const payload = { ...formData, amount: Number(formData.amount) }
    if (modalMode === 'edit') {
      updateClient(payload)
      addToast('Client updated successfully.', 'success')
    } else {
      addClient(payload)
      addToast('Client added successfully.', 'success')
    }
    setModalOpen(false)
  }

  if (showAddWizard) {
    return (
      <DashboardLayout>
        <div className="data-page">
          <div className="data-page-header">
            <div>
              <h2 className="data-page-title">Onboard New Client</h2>
              <p className="data-page-sub">Step-by-step institutional compliance and profiling wizard</p>
            </div>
            <button className="data-btn data-btn-outline" onClick={() => setShowAddWizard(false)}>Cancel Onboarding</button>
          </div>

          <div className="wizard-container">
            <div className="wizard-steps-header">
              <div className={`wizard-step-indicator ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
                <span className="wizard-step-label-num">Step 1</span>
                <span className="wizard-step-label-title">Identity & Contacts</span>
              </div>
              <div className={`wizard-step-indicator ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`}>
                <span className="wizard-step-label-num">Step 2</span>
                <span className="wizard-step-label-title">Financial & Income Profile</span>
              </div>
              <div className={`wizard-step-indicator ${wizardStep === 3 ? 'active' : ''}`}>
                <span className="wizard-step-label-num">Step 3</span>
                <span className="wizard-step-label-title">Lending & Assignment</span>
              </div>
            </div>

            <div className="wizard-form-body">
              {wizardStep === 1 && (
                <div className="wizard-panel">
                  <h3 className="wizard-panel-title"><User size={18} style={{ marginRight: 8, verticalAlign: "middle" }} /> Verify Identity & Setup Contacts</h3>
                  <div className="form-grid">
                    <label>
                      Client Name *
                      <input
                        type="text"
                        placeholder="Full Name"
                        className={validationErrors.name ? 'error' : ''}
                        value={formData.name || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          setValidationErrors(prev => ({ ...prev, name: null }))
                        }}
                      />
                      {validationErrors.name && <span className="form-error">{validationErrors.name}</span>}
                    </label>
                    <label>
                      Phone Number *
                      <input
                        type="text"
                        placeholder="Mobile Number"
                        className={validationErrors.phone ? 'error' : ''}
                        value={formData.phone || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value })
                          setValidationErrors(prev => ({ ...prev, phone: null }))
                        }}
                      />
                      {validationErrors.phone && <span className="form-error">{validationErrors.phone}</span>}
                    </label>
                    <label className="form-grid-full">
                      Email Address
                      <input
                        type="email"
                        placeholder="client@email.com"
                        className={validationErrors.email ? 'error' : ''}
                        value={formData.email || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          setValidationErrors(prev => ({ ...prev, email: null }))
                        }}
                      />
                      {validationErrors.email && <span className="form-error">{validationErrors.email}</span>}
                    </label>
                    <label>
                      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        PAN Card Number *
                        <button type="button" className="scanner-trigger-btn" onClick={() => handleStartScan('pan')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          Scan Card
                        </button>
                      </span>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        className={validationErrors.pan_card ? 'error' : ''}
                        value={formData.pan_card || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, pan_card: e.target.value.toUpperCase() })
                          setValidationErrors(prev => ({ ...prev, pan_card: null }))
                        }}
                      />
                      {validationErrors.pan_card && <span className="form-error">{validationErrors.pan_card}</span>}
                    </label>
                    <label>
                      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        Aadhaar Number *
                        <button type="button" className="scanner-trigger-btn" onClick={() => handleStartScan('aadhaar')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          Scan Card
                        </button>
                      </span>
                      <input
                        type="text"
                        placeholder="12-digit Aadhaar number"
                        className={validationErrors.aadhaar_number ? 'error' : ''}
                        value={formData.aadhaar_number || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, aadhaar_number: e.target.value })
                          setValidationErrors(prev => ({ ...prev, aadhaar_number: null }))
                        }}
                      />
                      {validationErrors.aadhaar_number && <span className="form-error">{validationErrors.aadhaar_number}</span>}
                    </label>
                    <label>
                      Residential Status
                      <select
                        value={formData.residential_status || 'Resident Indian'}
                        onChange={(e) => setFormData({ ...formData, residential_status: e.target.value })}
                      >
                        <option value="Resident Indian">Resident Indian</option>
                        <option value="NRI">NRI</option>
                        <option value="PIO">PIO</option>
                        <option value="Foreign National">Foreign National</option>
                      </select>
                    </label>
                    <label>
                      Location / City *
                      <div className={validationErrors.location ? 'error' : ''}>
                        <HybridLocationPicker
                          value={formData.location || ''}
                          onChange={(value) => {
                            setFormData({ ...formData, location: value })
                            setValidationErrors(prev => ({ ...prev, location: null }))
                          }}
                        />
                      </div>
                      {validationErrors.location && <span className="form-error">{validationErrors.location}</span>}
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="wizard-panel">
                  <h3 className="wizard-panel-title"><Briefcase size={18} style={{ marginRight: 8, verticalAlign: "middle" }} /> Employment, Income & Stability Profile</h3>
                  <div className="form-grid">
                    <label>
                      Employment Status
                      <select value={formData.employment_status || 'Salaried'} onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}>
                        <option value="Salaried">Salaried</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Professional">Professional</option>
                        <option value="Business Owner">Business Owner</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </label>
                    <label>
                      Monthly Net Income (₹)
                      <input
                        type="number"
                        min="0"
                        placeholder="Monthly Take Home"
                        className={validationErrors.monthly_net_income ? 'error' : ''}
                        value={formData.monthly_net_income || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, monthly_net_income: e.target.value })
                          setValidationErrors(prev => ({ ...prev, monthly_net_income: null }))
                        }}
                      />
                      {validationErrors.monthly_net_income && <span className="form-error">{validationErrors.monthly_net_income}</span>}
                    </label>
                    <label>
                      Co-Applicant Net Income (₹)
                      <input
                        type="number"
                        min="0"
                        placeholder="Co-Applicant Monthly Take Home"
                        className={validationErrors.co_applicant_income ? 'error' : ''}
                        value={formData.co_applicant_income || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, co_applicant_income: e.target.value })
                          setValidationErrors(prev => ({ ...prev, co_applicant_income: null }))
                        }}
                      />
                      {validationErrors.co_applicant_income && <span className="form-error">{validationErrors.co_applicant_income}</span>}
                    </label>
                    <label>
                      Dwelling Ownership Status
                      <select value={formData.dwelling_status || 'Owned'} onChange={(e) => setFormData({ ...formData, dwelling_status: e.target.value })}>
                        <option value="Owned">Owned</option>
                        <option value="Rented">Rented</option>
                        <option value="Company Provided">Company Provided</option>
                        <option value="Mortgaged">Mortgaged</option>
                      </select>
                    </label>
                    <label className="form-grid-full">
                      Tenure at Current Address (Years)
                      <input
                        type="number"
                        min="0"
                        placeholder="Years of occupancy"
                        className={validationErrors.tenure_at_address ? 'error' : ''}
                        value={formData.tenure_at_address || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, tenure_at_address: e.target.value })
                          setValidationErrors(prev => ({ ...prev, tenure_at_address: null }))
                        }}
                      />
                      {validationErrors.tenure_at_address && <span className="form-error">{validationErrors.tenure_at_address}</span>}
                    </label>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="wizard-panel">
                  <h3 className="wizard-panel-title"><Coins size={18} style={{ marginRight: 8, verticalAlign: "middle" }} /> Lending Parameters & Office Assignment</h3>
                  <div className="form-grid">
                    <label>
                      File No. *
                      <input
                        type="text"
                        placeholder="e.g. F-983"
                        className={validationErrors.file_no ? 'error' : ''}
                        value={formData.file_no || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, file_no: e.target.value })
                          setValidationErrors(prev => ({ ...prev, file_no: null }))
                        }}
                      />
                      {validationErrors.file_no && <span className="form-error">{validationErrors.file_no}</span>}
                    </label>
                    <label>
                      Loan Type
                      <select value={formData.loan_type} onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}>
                        {LOAN_TYPES.slice(1).map((loan) => <option key={loan} value={loan}>{loan}</option>)}
                      </select>
                    </label>
                    <label>
                      Amount (₹) *
                      <input
                        type="number"
                        min="0"
                        placeholder="Requested Amount"
                        className={validationErrors.amount ? 'error' : ''}
                        value={formData.amount || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, amount: e.target.value })
                          setValidationErrors(prev => ({ ...prev, amount: null }))
                        }}
                      />
                      {validationErrors.amount && <span className="form-error">{validationErrors.amount}</span>}
                    </label>
                    <label>
                      Application Date *
                      <input
                        type="date"
                        className={validationErrors.date ? 'error' : ''}
                        value={formData.date || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value })
                          setValidationErrors(prev => ({ ...prev, date: null }))
                        }}
                      />
                      {validationErrors.date && <span className="form-error">{validationErrors.date}</span>}
                    </label>
                    <label>
                      Assigned Associate
                      <input type="text" placeholder="Associate Name" value={formData.associate || ''} onChange={(e) => setFormData({ ...formData, associate: e.target.value })} />
                    </label>
                    <label>
                      Workflow Status
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        {STATUSES.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-actions">
              <button
                type="button"
                className="data-btn data-btn-outline"
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(s => s - 1)}
              >
                Back
              </button>
              {wizardStep < 3 ? (
                <button
                  type="button"
                  className="data-btn data-btn-primary"
                  onClick={() => {
                    if (wizardStep === 1 && !validateStep1()) return;
                    if (wizardStep === 2 && !validateStep2()) return;
                    setWizardStep(s => s + 1);
                  }}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="data-btn data-btn-primary"
                  style={{ background: '#10b981' }}
                  onClick={() => {
                    if (!validateStep3()) return;
                    saveClient();
                    setShowAddWizard(false);
                  }}
                >
                  Complete Onboarding & Save
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="data-page">

        {/* Header */}
        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Client Record Book</h2>
            <p className="data-page-sub">{clients.length} total clients</p>
          </div>
          <button className="data-btn data-btn-primary" onClick={openAddModal}>+ Add Client</button>
        </div>

        {/* Summary */}
        <div className="data-summary">
          <div className="data-summary-item">
            <div className="data-summary-label">Total Clients</div>
            <div className="data-summary-value">{clients.length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Active Files</div>
            <div className="data-summary-value">{clients.filter(c => c.status === 'Processing').length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Approved</div>
            <div className="data-summary-value">{clients.filter(c => c.status === 'Approved').length}</div>
          </div>
          <div className="data-summary-item">
            <div className="data-summary-label">Total Disbursed</div>
            <div className="data-summary-value accent">{formatAmount(totalDisbursed)}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="data-toolbar">
          <div className="data-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search by name, file no, phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="data-filter-select" value={loanFilter} onChange={e => setLoan(e.target.value)}>
            {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="data-filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="data-btn data-btn-outline">Export</button>
        </div>

        {/* Table */}
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>File No.</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Associate</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="data-empty">
                    <div className="data-empty-icon"><Search size={48} /></div>
                    <div className="data-empty-title">No clients found</div>
                    <div className="data-empty-sub">Try adjusting your search or filters</div>
                  </div>
                </td></tr>
              ) : paginatedClients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-name">
                      <div className="cell-avatar">{c.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="cell-muted" style={{ fontSize: 11 }}>{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-muted">{c.file_no}</td>
                  <td>{c.loan_type}</td>
                  <td className="cell-amount">{formatAmount(c.amount)}</td>
                  <td className="cell-muted">{c.associate}</td>
                  <td className="cell-muted">{c.date}</td>
                  <td><span className={statusClass(c.status)}>{c.status}</span></td>
                  <td>
                    <div className="action-menu-container">
                      <button
                        type="button"
                        className="three-dot-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === c.id ? null : c.id);
                        }}
                        aria-label="Actions"
                      >
                        ⋮
                      </button>
                      {activeMenuId === c.id && (
                        <div className="action-popover" onClick={(e) => e.stopPropagation()}>
                          <button className="popover-item" onClick={() => { openViewModal(c); setActiveMenuId(null); }}>
                            <Eye size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> View details
                          </button>
                          <button className="popover-item" onClick={() => { openEditModal(c); setActiveMenuId(null); }}>
                            <Edit size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Edit record
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="data-pagination">
              <span className="data-pagination-info">
                Showing {Math.min(filtered.length, (currentPage - 1) * PAGE_SIZE + 1)} to {Math.min(filtered.length, currentPage * PAGE_SIZE)} of {filtered.length} clients
              </span>
              <div className="data-pagination-btns">
                <button className="data-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} className={`data-page-btn${currentPage === i + 1 ? ' active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="data-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
              </div>
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal title={modalMode === 'view' ? 'Client details' : modalMode === 'edit' ? 'Edit client' : 'Add client'} onClose={() => setModalOpen(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <User size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Personal Details
                </h4>
                <div className="form-grid">
                  <label>
                    Client Name
                    <input
                      type="text"
                      className={validationErrors.name ? 'error' : ''}
                      value={formData.name}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        setValidationErrors(prev => ({ ...prev, name: null }))
                      }}
                    />
                    {validationErrors.name && <span className="form-error">{validationErrors.name}</span>}
                  </label>
                  <label>
                    Phone Number
                    <input
                      type="text"
                      className={validationErrors.phone ? 'error' : ''}
                      value={formData.phone}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value })
                        setValidationErrors(prev => ({ ...prev, phone: null }))
                      }}
                    />
                    {validationErrors.phone && <span className="form-error">{validationErrors.phone}</span>}
                  </label>
                  <label className="form-grid-full">
                    Email Address
                    <input
                      type="email"
                      className={validationErrors.email ? 'error' : ''}
                      value={formData.email}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        setValidationErrors(prev => ({ ...prev, email: null }))
                      }}
                    />
                    {validationErrors.email && <span className="form-error">{validationErrors.email}</span>}
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <ClipboardCheck size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> KYC & Identification Profile
                </h4>
                <div className="form-grid">
                  <label>
                    PAN Card Number
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <input
                        type="text"
                        placeholder="e.g. ABCDE1234F"
                        className={validationErrors.pan_card ? 'error' : ''}
                        value={
                          modalMode === 'view'
                            ? (revealPAN ? (formData.pan_card || '') : maskPAN(formData.pan_card))
                            : (formData.pan_card || '')
                        }
                        disabled={modalMode === 'view'}
                        onChange={(e) => {
                          setFormData({ ...formData, pan_card: e.target.value.toUpperCase() })
                          setValidationErrors(prev => ({ ...prev, pan_card: null }))
                        }}
                        style={{ flex: 1 }}
                      />
                      {modalMode === 'view' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (user?.role === 'admin' || user?.role === 'advisor') {
                              setRevealPAN(!revealPAN)
                            } else {
                              addToast('Access Denied: Only Admins and Advisors can view sensitive details.', 'error')
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={revealPAN ? "Hide sensitive details" : "Reveal sensitive details"}
                        >
                          {revealPAN ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          )}
                        </button>
                      )}
                    </div>
                    {validationErrors.pan_card && <span className="form-error">{validationErrors.pan_card}</span>}
                  </label>
                  <label>
                    Aadhaar Number
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <input
                        type="text"
                        placeholder="12-digit Aadhaar number"
                        className={validationErrors.aadhaar_number ? 'error' : ''}
                        value={
                          modalMode === 'view'
                            ? (revealAadhaar ? (formData.aadhaar_number || '') : maskAadhaar(formData.aadhaar_number))
                            : (formData.aadhaar_number || '')
                        }
                        disabled={modalMode === 'view'}
                        onChange={(e) => {
                          setFormData({ ...formData, aadhaar_number: e.target.value })
                          setValidationErrors(prev => ({ ...prev, aadhaar_number: null }))
                        }}
                        style={{ flex: 1 }}
                      />
                      {modalMode === 'view' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (user?.role === 'admin' || user?.role === 'advisor') {
                              setRevealAadhaar(!revealAadhaar)
                            } else {
                              addToast('Access Denied: Only Admins and Advisors can view sensitive details.', 'error')
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={revealAadhaar ? "Hide sensitive details" : "Reveal sensitive details"}
                        >
                          {revealAadhaar ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          )}
                        </button>
                      )}
                    </div>
                    {validationErrors.aadhaar_number && <span className="form-error">{validationErrors.aadhaar_number}</span>}
                  </label>
                  <label>
                    Residential Status
                    <select value={formData.residential_status || 'Resident Indian'} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, residential_status: e.target.value })}>
                      <option value="Resident Indian">Resident Indian</option>
                      <option value="NRI">NRI</option>
                      <option value="PIO">PIO</option>
                      <option value="Foreign National">Foreign National</option>
                    </select>
                  </label>
                  <label>
                    Location / City
                    <div className={validationErrors.location ? 'error' : ''}>
                      <HybridLocationPicker
                        value={formData.location || ''}
                        disabled={modalMode === 'view'}
                        onChange={(value) => {
                          setFormData({ ...formData, location: value })
                          setValidationErrors(prev => ({ ...prev, location: null }))
                        }}
                      />
                    </div>
                    {validationErrors.location && <span className="form-error">{validationErrors.location}</span>}
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <Briefcase size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Employment & Financial Profile
                </h4>
                <div className="form-grid">
                  <label>
                    Employment Status
                    <select value={formData.employment_status || 'Salaried'} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}>
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Professional">Professional</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </label>
                  <label>
                    Monthly Net Income (₹)
                    <input
                      type="number"
                      min="0"
                      className={validationErrors.monthly_net_income ? 'error' : ''}
                      value={formData.monthly_net_income || ''}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, monthly_net_income: e.target.value })
                        setValidationErrors(prev => ({ ...prev, monthly_net_income: null }))
                      }}
                    />
                    {validationErrors.monthly_net_income && <span className="form-error">{validationErrors.monthly_net_income}</span>}
                  </label>
                  <label>
                    Co-Applicant Net Income (₹)
                    <input
                      type="number"
                      min="0"
                      className={validationErrors.co_applicant_income ? 'error' : ''}
                      value={formData.co_applicant_income || ''}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, co_applicant_income: e.target.value })
                        setValidationErrors(prev => ({ ...prev, co_applicant_income: null }))
                      }}
                    />
                    {validationErrors.co_applicant_income && <span className="form-error">{validationErrors.co_applicant_income}</span>}
                  </label>
                  <label>
                    Dwelling Ownership Status
                    <select value={formData.dwelling_status || 'Owned'} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, dwelling_status: e.target.value })}>
                      <option value="Owned">Owned</option>
                      <option value="Rented">Rented</option>
                      <option value="Company Provided">Company Provided</option>
                      <option value="Mortgaged">Mortgaged</option>
                    </select>
                  </label>
                  <label className="form-grid-full">
                    Tenure at Current Address (Years)
                    <input
                      type="number"
                      min="0"
                      className={validationErrors.tenure_at_address ? 'error' : ''}
                      value={formData.tenure_at_address || ''}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, tenure_at_address: e.target.value })
                        setValidationErrors(prev => ({ ...prev, tenure_at_address: null }))
                      }}
                    />
                    {validationErrors.tenure_at_address && <span className="form-error">{validationErrors.tenure_at_address}</span>}
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <Coins size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Lending Parameters
                </h4>
                <div className="form-grid">
                  <label>
                    File No.
                    <input
                      type="text"
                      className={validationErrors.file_no ? 'error' : ''}
                      value={formData.file_no}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, file_no: e.target.value })
                        setValidationErrors(prev => ({ ...prev, file_no: null }))
                      }}
                    />
                    {validationErrors.file_no && <span className="form-error">{validationErrors.file_no}</span>}
                  </label>
                  <label>
                    Loan Type
                    <select value={formData.loan_type} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}>
                      {LOAN_TYPES.slice(1).map((loan) => <option key={loan} value={loan}>{loan}</option>)}
                    </select>
                  </label>
                  <label>
                    Amount (₹)
                    <input
                      type="number"
                      min="0"
                      className={validationErrors.amount ? 'error' : ''}
                      value={formData.amount}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, amount: e.target.value })
                        setValidationErrors(prev => ({ ...prev, amount: null }))
                      }}
                    />
                    {validationErrors.amount && <span className="form-error">{validationErrors.amount}</span>}
                  </label>
                  <label>
                    Application Date
                    <input
                      type="date"
                      className={validationErrors.date ? 'error' : ''}
                      value={formData.date}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value })
                        setValidationErrors(prev => ({ ...prev, date: null }))
                      }}
                    />
                    {validationErrors.date && <span className="form-error">{validationErrors.date}</span>}
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <Building2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Status & Assignment
                </h4>
                <div className="form-grid">
                  <label>
                    Assigned Associate
                    <input type="text" value={formData.associate} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, associate: e.target.value })} />
                  </label>
                  <label>
                    Workflow Status
                    <select value={formData.status} disabled={modalMode === 'view'} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      {STATUSES.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>
            {modalMode !== 'add' && (
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                  <FolderCheck size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> KYC Documents Verification
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {['PAN Card', 'Aadhaar Card', 'IT Return', 'Bank Statement'].map((doc) => {
                    const clientKey = formData.id || 'new'
                    const clientDocStatus = (clientDocs[clientKey] && clientDocs[clientKey][doc]) || 'pending'
                    const progress = uploadProgress[doc]

                    return (
                      <div key={doc} style={{
                        display: 'flex', alignItems: 'center',
                        padding: '10px 14px', borderRadius: 8, background: 'var(--bg-muted)',
                        border: '1px solid var(--border)', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>
                            {clientDocStatus === 'success' ? <CheckCircle size={16} color="green" /> : progress !== undefined ? <Hourglass size={16} /> : <FileText size={16} />}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>{doc}</div>
                            {progress !== undefined && progress < 100 && (
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Uploading: {progress}%</div>
                            )}
                          </div>
                        </div>

                        <div>
                          {clientDocStatus === 'success' ? (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                              background: '#dcfce7', color: '#16a34a'
                            }}>Verified</span>
                          ) : progress !== undefined && progress < 100 ? (
                            <div style={{ width: 80, height: 6, background: 'var(--border-input)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)' }} />
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="row-btn"
                              style={{ padding: '3px 8px', fontSize: 11, background: 'var(--bg-surface)' }}
                              onClick={() => {
                                setUploadProgress(prev => ({ ...prev, [doc]: 0 }))
                                let currentProgress = 0
                                const interval = setInterval(() => {
                                  currentProgress += 20
                                  setUploadProgress(prev => ({ ...prev, [doc]: currentProgress }))
                                  if (currentProgress >= 100) {
                                    clearInterval(interval)
                                    setClientDocs(prev => {
                                      const old = prev[clientKey] || {}
                                      return {
                                        ...prev,
                                        [clientKey]: { ...old, [doc]: 'success' }
                                      }
                                    })
                                    setUploadProgress(prev => {
                                      const copy = { ...prev }
                                      delete copy[doc]
                                      return copy
                                    })
                                    addToast(`${doc} uploaded and verified successfully.`, 'success')
                                  }
                                }, 150)
                              }}
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="admin-action-btn" onClick={() => setModalOpen(false)}>Close</button>
              {modalMode !== 'view' && (
                <button type="button" className="admin-primary-btn" onClick={saveClient}>Save</button>
              )}
            </div>
          </Modal>
        )}

        {scannerOpen && (
          <Modal
            title={`KYC ${scanType === 'pan' ? 'PAN Card' : 'Aadhaar Card'} Camera Scanner`}
            onClose={handleStopScan}
            size="md"
          >
            <div className="camera-scanner-modal-body">
              <div className="camera-feed-container">
                <div className="scanner-frame-overlay">
                  <div className="scanner-corner corner-tl" />
                  <div className="scanner-corner corner-tr" />
                  <div className="scanner-corner corner-bl" />
                  <div className="scanner-corner corner-br" />
                  <div className="scanner-identity-guide">
                    Align {scanType === 'pan' ? 'PAN Card' : 'Aadhaar Card'} within this frame
                  </div>
                  {['capturing', 'extracting'].includes(scanStatus) && (
                    <div className="scanner-processing-overlay">
                      <div className="spinner" />
                      <span>
                        {scanStatus === 'capturing' ? 'Capturing image...' : 'Running OCR text extraction...'}
                      </span>
                    </div>
                  )}
                  {scanStatus === 'success' && (
                    <div className="scanner-success-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="scanner-success-check">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Verification Match Found!</span>
                    </div>
                  )}
                </div>

                {scanStatus === 'mock_active' ? (
                  <div className="mock-camera-feed">
                    <div className="mock-card-graphic">
                      <span className="mock-card-title">{scanType === 'pan' ? 'INCOME TAX DEPARTMENT' : 'UNIQUE IDENTIFICATION AUTHORITY OF INDIA'}</span>
                      <div className="mock-card-avatar" />
                      <div className="mock-card-text-lines">
                        <span className="line-sm" />
                        <span className="line-md" />
                        <span className="line-lg" />
                      </div>
                    </div>
                    <div className="mock-camera-badge">Simulated Camera Stream Active</div>
                  </div>
                ) : (
                  <video
                    id="scanner-video-feed"
                    className="camera-video-element"
                    muted
                    playsInline
                  />
                )}
              </div>

              <div className="camera-scanner-controls">
                <button
                  type="button"
                  className="data-btn data-btn-outline"
                  onClick={handleStopScan}
                >
                  Cancel
                </button>
                {['camera_active', 'mock_active'].includes(scanStatus) && (
                  <button
                    type="button"
                    className="data-btn data-btn-primary"
                    onClick={handleCapture}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Capture & Autofill
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  )
}
