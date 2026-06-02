import { createContext, useContext, useState } from 'react'
import {
  dummyClients, dummyAssociates, dummyPayments, dummyInvoices,
  dummyProducts, dummyReminders, dummyNotifications, dummyEnquiries,
  dummyLoginFiles, dummyBackups
} from '../lib/dummyData'

const AppStateContext = createContext()

/* ─── Constants for Stages ──────────────────────────────────── */
const STAGES = [
  'LOGIN', 'QUERY DC', 'PD', 'TECHNICAL', 'LEGAL', 'OFFER', 'MOD', 'FUND TRANSFER', 'COSMOS PAYOUT'
]
const STAGE_OFFSETS = [0, 2, 5, 8, 12, 15, 18, 22, 26]

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function createStageDates(startDate) {
  const stages = {}
  STAGES.forEach((name, i) => {
    stages[name] = { expected: addDays(startDate, STAGE_OFFSETS[i]), actual: null }
  })
  return stages
}

export function AppStateProvider({ children }) {
  const [clients, setClients]             = useState(dummyClients)
  const [associates, setAssociates]       = useState(dummyAssociates)
  const [payments, setPayments]           = useState(dummyPayments)
  const [invoices, setInvoices]           = useState(dummyInvoices)
  const [products, setProducts]           = useState(dummyProducts)
  const [reminders, setReminders]         = useState(dummyReminders)
  const [notifications, setNotifications] = useState(dummyNotifications)
  const [enquiries, setEnquiries]         = useState(dummyEnquiries)
  const [loginFiles, setLoginFiles]       = useState(dummyLoginFiles)
  const [backups, setBackups]             = useState(dummyBackups)
  const [users, setUsers]                 = useState([
    { id: 1, name: 'Dev User',      email: 'dev@cosmos.local',    role: 'admin',   status: 'active' },
    { id: 2, name: 'Meena Sharma',  email: 'meena@cosmos.local',  role: 'advisor', status: 'active' },
    { id: 3, name: 'Ravi Patel',    email: 'ravi@cosmos.local',   role: 'staff',   status: 'active' },
    { id: 4, name: 'Sunita Rao',    email: 'sunita@cosmos.local', role: 'advisor', status: 'inactive' },
  ])

  /* ─── Sync 1: Dynamic Associate Performance metrics ───────── */
  const computedAssociates = associates.map(a => {
    const assocClients = clients.filter(c => c.associate === a.name)
    const clientCount = assocClients.length
    const disbursed = assocClients
      .filter(c => ['Disbursed', 'Approved'].includes(c.status))
      .reduce((sum, c) => sum + Number(c.amount || 0), 0)
    const commission = Math.round(disbursed * 0.005) // standard 0.5% dynamic calculation
    return {
      ...a,
      clients: clientCount,
      disbursed,
      commission
    }
  })

  /* ─── Sync 2: Onboard Client ➔ Stage Tracking Auto-Initialization ── */
  const addClient = (c) => {
    const newClientId = `C${String(clients.length + 1).padStart(3, '0')}`
    const newClient = { ...c, id: newClientId }
    setClients(p => [newClient, ...p])

    if (['Processing', 'Approved', 'Disbursed'].includes(c.status)) {
      const today = new Date().toISOString().slice(0, 10)
      const filePayload = {
        id: `LF${String(loginFiles.length + 1).padStart(3, '0')}`,
        client: c.name,
        client_id: c.file_no || newClientId,
        loan_type: c.loan_type,
        priority: 'Normal',
        submitted: c.date || today,
        stages: createStageDates(c.date || today),
        currentStageIndex: c.status === 'Disbursed' ? STAGES.length : 0,
        done: c.status === 'Disbursed',
      }
      setLoginFiles(lf => {
        if (lf.some(x => x.client_id === filePayload.client_id || x.client === filePayload.client)) return lf
        return [filePayload, ...lf]
      })
    }
  }

  const updateClient = (c) => {
    setClients(p => p.map(x => x.id === c.id ? c : x))

    if (['Processing', 'Approved', 'Disbursed'].includes(c.status)) {
      const today = new Date().toISOString().slice(0, 10)
      setLoginFiles(lf => {
        const exists = lf.some(x => x.client_id === c.file_no || x.client === c.name)
        if (exists) {
          if (c.status === 'Disbursed') {
            return lf.map(f => {
              if (f.client_id === c.file_no || f.client === c.name) {
                const stages = { ...f.stages }
                STAGES.forEach(name => {
                  if (!stages[name].actual) stages[name].actual = stages[name].expected || today
                })
                return { ...f, stages, done: true, currentStageIndex: STAGES.length }
              }
              return f
            })
          }
          return lf
        }
        const filePayload = {
          id: `LF${String(lf.length + 1).padStart(3, '0')}`,
          client: c.name,
          client_id: c.file_no || c.id,
          loan_type: c.loan_type,
          priority: 'Normal',
          submitted: c.date || today,
          stages: createStageDates(c.date || today),
          currentStageIndex: c.status === 'Disbursed' ? STAGES.length : 0,
          done: c.status === 'Disbursed',
        }
        return [filePayload, ...lf]
      })
    }
  }

  const addAssociate    = (a) => setAssociates(p => [{ ...a, id: `A${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updateAssociate = (a) => setAssociates(p => p.map(x => x.id === a.id ? a : x))
  const addPayment    = (pay) => setPayments(p => [{ ...pay, id: `P${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updatePayment = (pay) => setPayments(p => p.map(x => x.id === pay.id ? pay : x))
  const removePayment = (id)  => setPayments(p => p.filter(x => x.id !== id))
  const addInvoice    = (inv) => setInvoices(p => [{ ...inv, id: `INV-${String(p.length+1).padStart(3,'0')}` }, ...p])
  const addProduct    = (pr)  => setProducts(p => [{ ...pr, id: `PS${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updateProduct = (pr)  => setProducts(p => p.map(x => x.id === pr.id ? pr : x))
  const addReminder    = (r)  => setReminders(p => [{ ...r, id: `R${String(p.length+1).padStart(3,'0')}`, done: false }, ...p])
  const updateReminder = (r)  => setReminders(p => p.map(x => x.id === r.id ? r : x))
  const deleteReminder = (id) => setReminders(p => p.filter(x => x.id !== id))
  const addEnquiry    = (e)   => setEnquiries(p => [{ ...e, id: `E${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updateEnquiry = (e)   => setEnquiries(p => p.map(x => x.id === e.id ? e : x))
  const removeEnquiry = (id)  => setEnquiries(p => p.filter(x => x.id !== id))

  const addLoginFile = (f) => {
    setLoginFiles(p => [{ ...f, id: `LF${String(p.length + 1).padStart(3, '0')}` }, ...p])

    setClients(p => {
      const exists = p.some(c => 
        (c.file_no && c.file_no === f.client_id) || 
        (c.name && c.name.toLowerCase().trim() === f.client.toLowerCase().trim())
      )
      if (exists) return p

      const today = new Date().toISOString().slice(0, 10)
      const cleanEmail = f.client.toLowerCase().replace(/\s+/g, '') + '@email.com'
      const newClientId = `C${String(p.length + 1).padStart(3, '0')}`
      const newClient = {
        id: newClientId,
        name: f.client,
        phone: '—',
        email: cleanEmail,
        loan_type: f.loan_type,
        amount: 2500000,
        status: f.done ? 'Disbursed' : 'Processing',
        file_no: f.client_id,
        date: f.submitted || today,
        associate: 'Unassigned',
        pan_card: '',
        aadhaar_number: '',
        residential_status: 'Resident Indian',
        employment_status: 'Salaried',
        monthly_net_income: '',
        co_applicant_income: '',
        dwelling_status: 'Owned',
        tenure_at_address: '',
        location: ''
      }
      return [newClient, ...p]
    })
  }
  const removeLoginFile = (id)  => setLoginFiles(p => p.filter(x => x.id !== id))

  /* ─── Sync 3: Stage Completion ➔ Client Disbursed & Payment LedgerSync ── */
  const updateLoginFile = (f) => {
    setLoginFiles(p => p.map(x => x.id === f.id ? f : x))

    if (f.done) {
      const today = new Date().toISOString().slice(0, 10)
      
      // Auto-transition Client Record to Disbursed
      setClients(p => p.map(c => {
        if (c.file_no === f.client_id || c.name === f.client) {
          return { ...c, status: 'Disbursed' }
        }
        return c
      }))

      // Auto-append Disbursement transaction to Payment Ledger
      setPayments(p => {
        const hasPayment = p.some(x => x.file_no === f.client_id && x.type === 'Disbursement')
        if (hasPayment) return p
        const payPayload = {
          id: `P${String(p.length + 1).padStart(3, '0')}`,
          client: f.client,
          file_no: f.client_id,
          type: 'Disbursement',
          amount: 2500000,
          bank: 'ICICI Bank',
          date: today,
          status: 'Completed'
        }
        const matchingClient = clients.find(c => c.file_no === f.client_id || c.name === f.client)
        if (matchingClient) {
          payPayload.amount = matchingClient.amount
        }
        return [payPayload, ...p]
      })
    }
  }

  const markNotifRead   = (id) => setNotifications(p => p.map(x => x.id === id ? { ...x, read: true } : x))
  const markAllNotifsRead = () => setNotifications(p => p.map(x => ({ ...x, read: true })))
  const addUser    = (u) => setUsers(p => [{ ...u, id: p.length + 1 }, ...p])
  const updateUser = (u) => setUsers(p => p.map(x => x.id === u.id ? u : x))
  const addBackup  = (b) => setBackups(p => [b, ...p])

  return (
    <AppStateContext.Provider value={{
      clients, addClient, updateClient,
      associates: computedAssociates, addAssociate, updateAssociate,
      payments, addPayment, updatePayment, removePayment,
      invoices, addInvoice,
      products, addProduct, updateProduct,
      reminders, addReminder, updateReminder, deleteReminder,
      notifications, markNotifRead, markAllNotifsRead,
      enquiries, addEnquiry, updateEnquiry, removeEnquiry,
      loginFiles, addLoginFile, updateLoginFile, removeLoginFile,
      backups, addBackup,
      users, addUser, updateUser,
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  return useContext(AppStateContext)
}
