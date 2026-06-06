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
  const [investments, setInvestments] = useState([
    { id: 'I001', partner: 'Charles', amount: 500000, interest_rate: 0.08, duration: '12 Months', start_date: '2025-12-15', nominee_name: 'Jane Doe', remarks: 'Seed funding', status: 'Active', pan_card: 'ABCDE1234F', aadhaar_number: '987654321012', mobile: '9000080000', nominee_aadhaar: '123456789012', nominee_pan: 'FGHIJ5678K', address: '123, Main Street, Mumbai' },
    { id: 'I002', partner: 'Prabhu', amount: 200000, interest_rate: 0.07, duration: '6 Months', start_date: '2026-03-05', nominee_name: 'Rajesh P', remarks: 'Core investment', status: 'Active', pan_card: 'FGHIJ5678K', aadhaar_number: '876543210987', mobile: '9000080000', nominee_aadhaar: '234567890123', nominee_pan: 'KLMNO9012P', address: '456, Park Road, Bangalore' },
    { id: 'I003', partner: 'MP Kumar', amount: 1000000, interest_rate: 0.09, duration: '24 Months', start_date: '2026-01-01', nominee_name: 'Suresh Kumar', remarks: 'Expansion capital', status: 'Active', pan_card: 'KLMNO9012P', aadhaar_number: '765432109876', mobile: '9000080000', nominee_aadhaar: '345678901234', nominee_pan: 'PQRST3456Q', address: '789, Residency Lane, Pune' }
  ])
  const [transactions, setTransactions] = useState([
    { id: 'TX001', date: '2026-06-20', type: 'Income', name: 'Prabhu', particular: 'Processing Fee Received', category: 'Processing Fee', amount: 10000, status: 'Received', remarks: '' },
    { id: 'TX002', date: '2026-06-20', type: 'Expense', name: 'Office Rent', particular: 'Office Rent Payment', category: 'Office Rent', amount: 50000, status: 'Paid', remarks: 'June 2026' },
    { id: 'TX003', date: '2026-06-19', type: 'Income', name: 'Ravi Varma', particular: 'Interest Collection', category: 'Interest Collection', amount: 5000, status: 'Received', remarks: '' },
    { id: 'TX004', date: '2026-06-19', type: 'Expense', name: 'Manikandan', particular: 'Petrol Expense', category: 'Petrol', amount: 2500, status: 'Paid', remarks: 'Local Travel' },
    { id: 'TX005', date: '2026-06-18', type: 'Expense', name: 'HDFC Bank', particular: 'Loan Processing Service', category: 'Operational', amount: 10000, status: 'Paid', remarks: 'Direct Debit' },
    { id: 'TX006', date: '2026-06-18', type: 'Income', name: 'Rajesh Kumar', particular: 'Home Loan processing fee', category: 'Processing Fee', amount: 120000, status: 'Received', remarks: 'HDFC Payout' },
    { id: 'TX007', date: '2026-06-17', type: 'Income', name: 'Meena Sharma', particular: 'Partner Commission Recd', category: 'Commission', amount: 45000, status: 'Received', remarks: 'June Cycle' },
    { id: 'TX008', date: '2026-06-17', type: 'Expense', name: 'Salary Staff', particular: 'Monthly staff salary', category: 'Salaries', amount: 84000, status: 'Paid', remarks: 'June Salaries' },
    { id: 'TX009', date: '2026-06-16', type: 'Income', name: 'MP Kumar', particular: 'Partner Interest Collection', category: 'Interest Collection', amount: 35000, status: 'Received', remarks: 'P2P ledger' },
    { id: 'TX010', date: '2026-06-15', type: 'Expense', name: 'Office Rent Addl', particular: 'Storage room rent', category: 'Office Rent', amount: 76000, status: 'Paid', remarks: 'Godown rent' },
    { id: 'TX011', date: '2026-06-14', type: 'Income', name: 'Kiran Mehta', particular: 'Processing Fee Received', category: 'Processing Fee', amount: 140000, status: 'Received', remarks: 'Axis Payout' },
    { id: 'TX012', date: '2026-06-13', type: 'Income', name: 'Sunita Rao', particular: 'Advisor Commission Recd', category: 'Commission', amount: 67500, status: 'Received', remarks: 'Q2 cycle' },
    { id: 'TX013', date: '2026-06-12', type: 'Income', name: 'Charles', particular: 'Partner Interest Collection', category: 'Interest Collection', amount: 27500, status: 'Received', remarks: 'P2P ledger' },
    { id: 'TX014', date: '2026-06-11', type: 'Expense', name: 'Aadhaar verification', particular: 'API verification usage fee', category: 'Operational', amount: 2000, status: 'Paid', remarks: 'UIDAI Portal' },
    { id: 'TX015', date: '2026-06-10', type: 'Expense', name: 'Sulekha Media', particular: 'Lead generation ads', category: 'Operational', amount: 15000, status: 'Paid', remarks: 'Google Ads' },
    { id: 'TX016', date: '2026-06-09', type: 'Expense', name: 'Tata Power', particular: 'Electricity bill', category: 'Operational', amount: 8000, status: 'Paid', remarks: 'June bill' },
    { id: 'TX017', date: '2026-06-08', type: 'Expense', name: 'Stationery Hub', particular: 'Printers and papers', category: 'Operational', amount: 4000, status: 'Paid', remarks: 'Office Supplies' },
    { id: 'TX018', date: '2026-06-07', type: 'Expense', name: 'Manikandan', particular: 'Petrol Expense', category: 'Petrol', amount: 2500, status: 'Paid', remarks: 'Site visits' },
    { id: 'TX019', date: '2026-06-06', type: 'Expense', name: 'Swiggy Client Meeting', particular: 'Food & beverage', category: 'Operational', amount: 2000, status: 'Paid', remarks: 'Client lunch' },
    { id: 'TX020', date: '2026-06-05', type: 'Expense', name: 'ACT Fiber', particular: 'Internet subscription', category: 'Operational', amount: 1000, status: 'Paid', remarks: 'June broadband' },
    { id: 'TX021', date: '2026-06-04', type: 'Expense', name: 'Coffee Vendor', particular: 'Pantry supplies', category: 'Operational', amount: 3000, status: 'Paid', remarks: 'Milk and tea' },
    { id: 'TX022', date: '2026-06-03', type: 'Expense', name: 'ZOHO Books', particular: 'Accounting software renewal', category: 'Operational', amount: 4000, status: 'Paid', remarks: 'Annual plan' },
    { id: 'TX023', date: '2026-06-02', type: 'Expense', name: 'Shiva Travels', particular: 'Cab service for client site', category: 'Operational', amount: 8000, status: 'Paid', remarks: 'Travel exp' },
    { id: 'TX024', date: '2026-06-01', type: 'Expense', name: 'Water Supplier', particular: 'Drinking water cans', category: 'Operational', amount: 6000, status: 'Paid', remarks: 'June supply' },
    { id: 'TX025', date: '2026-06-01', type: 'Expense', name: 'Miscellaneous', particular: 'Office petty cash', category: 'Operational', amount: 2000, status: 'Paid', remarks: 'Sundry expenses' }
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
  const removeUser = (id) => setUsers(p => p.filter(x => x.id !== id))
  const addBackup  = (b) => setBackups(p => [b, ...p])

  const addInvestment = (inv) => setInvestments(p => [{ ...inv, id: `I${String(p.length + 1).padStart(3, '0')}` }, ...p])
  const updateInvestment = (inv) => setInvestments(p => p.map(x => x.id === inv.id ? inv : x))
  const removeInvestment = (id) => setInvestments(p => p.filter(x => x.id !== id))

  const addTransaction = (tx) => setTransactions(p => [{ ...tx, id: `TX${String(p.length + 1).padStart(3, '0')}` }, ...p])
  const updateTransaction = (tx) => setTransactions(p => p.map(x => x.id === tx.id ? tx : x))
  const removeTransaction = (id) => setTransactions(p => p.filter(x => x.id !== id))

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
      users, addUser, updateUser, removeUser,
      investments, addInvestment, updateInvestment, removeInvestment,
      transactions, addTransaction, updateTransaction, removeTransaction,
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  return useContext(AppStateContext)
}
