import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../shared/api/supabaseClient'
// We keep dummy data as a fallback to avoid crashing if DB is empty,
// or just initialize with empty arrays. For this refactor, we initialize with empty arrays.

const AppStateContext = createContext()

/* ─── Unique ID Generator (used for non-client/invoice entities) ────── */
function uid(prefix = '') {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

/* ─── Sequential ID Helpers ─────────────────────────────────────────── */

// Client: CF-YY-XXD  (X = A-Z, D = 0-9)  →  6,760 IDs / year
function decodeClientSeq(suffix) {
  const l1 = suffix.charCodeAt(0) - 65
  const l2 = suffix.charCodeAt(1) - 65
  const d  = parseInt(suffix[2], 10)
  return l1 * 260 + l2 * 10 + d
}
function encodeClientSeq(seq) {
  const d  = seq % 10
  const l2 = Math.floor(seq / 10) % 26
  const l1 = Math.floor(seq / 260)
  return String.fromCharCode(65 + l1) + String.fromCharCode(65 + l2) + d
}

// Invoice: CFI-YY-XXX  (all A-Z)  →  17,576 IDs / year
function encodeInvoiceSeq(seq) {
  const c3 = seq % 26
  const c2 = Math.floor(seq / 26) % 26
  const c1 = Math.floor(seq / 676)
  return String.fromCharCode(65 + c1) + String.fromCharCode(65 + c2) + String.fromCharCode(65 + c3)
}

export async function nextClientId() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `CF-${yy}-`
  const { data } = await supabase.from('clients')
    .select('id').like('id', `${prefix}%`).order('id', { ascending: false }).limit(50)
  if (!data || data.length === 0) return `${prefix}AA0`
  const seqs = data
    .map(r => r.id.slice(prefix.length))
    .filter(s => /^[A-Z]{2}[0-9]$/.test(s))
    .map(decodeClientSeq)
  if (seqs.length === 0) return `${prefix}AA0`
  return `${prefix}${encodeClientSeq(Math.max(...seqs) + 1)}`
}

async function nextInvoiceId() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `CFI-${yy}-`
  const { data } = await supabase.from('invoices')
    .select('id').like('id', `${prefix}%`).order('id', { ascending: false }).limit(50)
  if (!data || data.length === 0) return `${prefix}AAA`
  const seqs = data
    .map(r => r.id.slice(prefix.length))
    .filter(s => /^[A-Z]{3}$/.test(s))
    .map(s => (s.charCodeAt(0) - 65) * 676 + (s.charCodeAt(1) - 65) * 26 + (s.charCodeAt(2) - 65))
  if (seqs.length === 0) return `${prefix}AAA`
  return `${prefix}${encodeInvoiceSeq(Math.max(...seqs) + 1)}`
}

export async function nextAssociateId() {
  const { data } = await supabase.from('associates')
    .select('id').like('id', 'CFA-%').order('id', { ascending: false }).limit(50)
  if (!data || data.length === 0) return 'CFA-01'
  const nums = data
    .map(r => parseInt(r.id.slice(4), 10))
    .filter(n => !isNaN(n))
  if (nums.length === 0) return 'CFA-01'
  const next = Math.max(...nums) + 1
  return `CFA-${String(next).padStart(2, '0')}`
}

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

  const [clients, setClients]             = useState([])
  const [associates, setAssociates]       = useState([])
  const [payments, setPayments]           = useState([])
  const [invoices, setInvoices]           = useState([])
  const [financeInvoices, setFinanceInvoices] = useState([])
  const [products, setProducts]           = useState([])
  const [reminders, setReminders]         = useState([])
  const [notifications, setNotifications] = useState([])
  const [enquiries, setEnquiries]         = useState([])
  const [loginFiles, setLoginFiles]       = useState([])
  const [backups, setBackups]             = useState([])
  const [users, setUsers]                 = useState([])
  const [investments, setInvestments]     = useState([])
  const [transactions, setTransactions]   = useState([])
  
  const [loading, setLoading] = useState(true)

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        { data: clientsData }, { data: associatesData }, { data: paymentsData },
        { data: invoicesData }, { data: financeInvoicesData }, { data: productsData },
        { data: remindersData }, { data: notificationsData }, { data: enquiriesData },
        { data: loginFilesData }, { data: backupsData }, { data: usersData },
        { data: investmentsData }, { data: transactionsData }
      ] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('associates').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('finance_invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('login_files').select('*').order('created_at', { ascending: false }),
        supabase.from('backups').select('*').order('created_at', { ascending: false }),
        supabase.from('system_users').select('*').order('created_at', { ascending: false }),
        supabase.from('investments').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ])

      setClients(clientsData || [])
      setAssociates(associatesData || [])
      setPayments(paymentsData || [])
      setInvoices(invoicesData || [])
      setFinanceInvoices(financeInvoicesData || [])
      setProducts(productsData || [])
      setReminders(remindersData || [])
      setNotifications(notificationsData || [])
      setEnquiries(enquiriesData || [])
      setLoginFiles(loginFilesData || [])
      setBackups(backupsData || [])
      setUsers(usersData || [])
      setInvestments(investmentsData || [])
      setTransactions(transactionsData || [])
    } catch (error) {
      console.error('Error fetching data from Supabase:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])



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
      clients: clientCount, // Note: returning property 'clients' because components use a.clients
      disbursed,
      commission
    }
  })

  /* ─── Clients ── */
  const pickClient = (c, id) => ({
    id: id || c.id,
    name: c.name,
    phone: c.phone || '',
    drive_link: c.drive_link || '',
    loan_type: c.loan_type || '',
    amount: Number(c.amount || 0),
    status: c.status || 'Enquiry',
    file_no: c.file_no || id || c.id,
    date: c.date || new Date().toISOString().slice(0, 10),
    associate: c.associate || '',
    extended_data: c.extended_data || null,
  })

  const addClient = async (c) => {
    const newClientId = await nextClientId()
    const newClient = pickClient(c, newClientId)

    const { data: clientData, error: clientError } = await supabase.from('clients').insert([newClient]).select().single()
    if (clientError) { console.error('addClient error:', clientError.message); return }
    setClients(p => [clientData, ...p])

    if (['Processing', 'Approved', 'Disbursed'].includes(c.status)) {
      const today = new Date().toISOString().slice(0, 10)
      const filePayload = pickLoginFile({
        client: c.name,
        client_id: c.file_no || newClientId,
        loan_type: c.loan_type,
        priority: 'Normal',
        submitted: c.date || today,
        stages: createStageDates(c.date || today),
        currentStageIndex: c.status === 'Disbursed' ? STAGES.length : 0,
        done: c.status === 'Disbursed',
      }, uid('LF'))
      const { data: lfData, error: lfError } = await supabase.from('login_files').insert([filePayload]).select().single()
      if (!lfError && lfData) setLoginFiles(lf => [{ ...lfData, currentStageIndex: lfData.current_stage_index ?? 0 }, ...lf])
    }
  }

  const updateClient = async (c) => {
    const payload = pickClient(c)
    const { data: clientData, error: clientError } = await supabase.from('clients').update(payload).eq('id', c.id).select().single()
    if (clientError) { console.error('updateClient error:', clientError.message); return }
    setClients(p => p.map(x => x.id === c.id ? clientData : x))

    if (['Processing', 'Approved', 'Disbursed'].includes(c.status)) {
      const today = new Date().toISOString().slice(0, 10)
      const existingLF = loginFiles.find(x => x.client_id === c.file_no || x.client === c.name)

      if (existingLF) {
        if (c.status === 'Disbursed' && !existingLF.done) {
          const stages = { ...existingLF.stages }
          STAGES.forEach(name => { if (!stages[name].actual) stages[name].actual = stages[name].expected || today })
          const updatePayload = { stages, done: true, current_stage_index: STAGES.length }
          const { data: upData, error: upErr } = await supabase.from('login_files').update(updatePayload).eq('id', existingLF.id).select().single()
          if (!upErr && upData) setLoginFiles(lf => lf.map(f => f.id === upData.id ? { ...upData, currentStageIndex: upData.current_stage_index ?? 0 } : f))
        }
      } else {
        const filePayload = pickLoginFile({
          client: c.name,
          client_id: c.file_no || c.id,
          loan_type: c.loan_type,
          priority: 'Normal',
          submitted: c.date || today,
          stages: createStageDates(c.date || today),
          currentStageIndex: c.status === 'Disbursed' ? STAGES.length : 0,
          done: c.status === 'Disbursed',
        }, uid('LF'))
        const { data: lfData, error: lfError } = await supabase.from('login_files').insert([filePayload]).select().single()
        if (!lfError && lfData) setLoginFiles(lf => [{ ...lfData, currentStageIndex: lfData.current_stage_index ?? 0 }, ...lf])
      }
    }
  }

  const removeClient = async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { console.error('removeClient error:', error.message); return }
    setClients(p => p.filter(x => x.id !== id))
  }

  /* ─── Associates ── */
  const pickAssociate = (a, id) => ({
    id: id || a.id,
    name: a.name,
    phone: a.phone || '',
    email: a.email || '',
    joined: a.joined || new Date().toISOString().slice(0, 10),
    clients: Number(a.clients || 0),
    disbursed: Number(a.disbursed || 0),
    commission: Number(a.commission || 0),
    associate_id: a.associate_id || '',
    expertise: a.expertise || '',
    vintage: a.vintage || '',
    financial_institution: a.financial_institution || '',
    institution_type: a.institution_type || 'Bank',
    branch: a.branch || '',
  })

  const addAssociate = async (a) => {
    const newId = await nextAssociateId()
    const { data, error } = await supabase.from('associates').insert([pickAssociate(a, newId)]).select().single()
    if (!error && data) setAssociates(p => [data, ...p])
    else if (error) console.error('addAssociate error:', error.message)
  }
  const updateAssociate = async (a) => {
    const { data, error } = await supabase.from('associates').update(pickAssociate(a)).eq('id', a.id).select().single()
    if (!error && data) setAssociates(p => p.map(x => x.id === a.id ? data : x))
    else if (error) console.error('updateAssociate error:', error.message)
  }
  const deleteAssociate = async (id) => {
    const { error } = await supabase.from('associates').delete().eq('id', id)
    if (!error) setAssociates(p => p.filter(x => x.id !== id))
    else console.error('deleteAssociate error:', error.message)
  }

  /* ─── Payments ── */
  const pickPayment = (p, id) => ({
    id: id || p.id,
    client: p.client || '',
    file_no: p.file_no || '',
    type: p.type || '',
    amount: Number(p.amount || 0),
    bank: p.bank || '',
    date: p.date || new Date().toISOString().slice(0, 10),
    status: p.status || 'Pending',
  })

  const addPayment = async (pay) => {
    const newId = uid('P')
    const { data, error } = await supabase.from('payments').insert([pickPayment(pay, newId)]).select().single()
    if (!error && data) setPayments(p => [data, ...p])
    else if (error) console.error('addPayment error:', error.message)
  }
  const updatePayment = async (pay) => {
    const { data, error } = await supabase.from('payments').update(pickPayment(pay)).eq('id', pay.id).select().single()
    if (!error && data) setPayments(p => p.map(x => x.id === pay.id ? data : x))
    else if (error) console.error('updatePayment error:', error.message)
  }
  const removePayment = async (id) => {
    const { error } = await supabase.from('payments').delete().eq('id', id)
    if (!error) setPayments(p => p.filter(x => x.id !== id))
  }

  /* ─── Invoices ── */
  const pickInvoice = (inv, id) => ({
    id: id || inv.id,
    client: inv.client || '',
    service: inv.service || '',
    amount: Number(inv.amount || 0),
    date: inv.date || new Date().toISOString().slice(0, 10),
  })

  const pickFinanceInvoice = (inv, id) => ({
    id: id || inv.id,
    name: inv.name || '',
    particular: inv.particular || '',
    type: inv.type || 'Income',
    amount: Number(inv.amount || 0),
    date: inv.date || new Date().toISOString().slice(0, 10),
  })

  const addInvoice = async (inv) => {
    const newId = await nextInvoiceId()
    const { data, error } = await supabase.from('invoices').insert([pickInvoice(inv, newId)]).select().single()
    if (!error && data) setInvoices(p => [data, ...p])
    else if (error) console.error('addInvoice error:', error.message)
  }
  const removeInvoice = async (id) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (!error) setInvoices(p => p.filter(x => x.id !== id))
    else console.error('removeInvoice error:', error.message)
  }
  const addFinanceInvoice = async (inv) => {
    const newId = uid('FINV')
    const { data, error } = await supabase.from('finance_invoices').insert([pickFinanceInvoice(inv, newId)]).select().single()
    if (!error && data) setFinanceInvoices(p => [data, ...p])
    else if (error) console.error('addFinanceInvoice error:', error.message)
  }
  const updateFinanceInvoice = async (inv) => {
    const { data, error } = await supabase.from('finance_invoices').update(pickFinanceInvoice(inv)).eq('id', inv.id).select().single()
    if (!error && data) setFinanceInvoices(p => p.map(x => x.id === inv.id ? data : x))
    else if (error) console.error('updateFinanceInvoice error:', error.message)
  }

  /* ─── Products ── */
  const pickProduct = (pr, id) => ({
    id: id || pr.id,
    name: pr.name || '',
    category: pr.category || '',
    fee: Number(pr.fee || 0),
    gst: Number(pr.gst || 0),
    description: pr.description || '',
    active: pr.active ?? true,
  })

  const addProduct = async (pr) => {
    const newId = uid('PS')
    const { data, error } = await supabase.from('products').insert([pickProduct(pr, newId)]).select().single()
    if (!error && data) setProducts(p => [data, ...p])
    else if (error) console.error('addProduct error:', error.message)
  }
  const updateProduct = async (pr) => {
    const { data, error } = await supabase.from('products').update(pickProduct(pr)).eq('id', pr.id).select().single()
    if (!error && data) setProducts(p => p.map(x => x.id === pr.id ? data : x))
    else if (error) console.error('updateProduct error:', error.message)
  }

  /* ─── Reminders ── */
  const pickReminder = (r, id) => ({
    id: id || r.id,
    title: r.title || '',
    description: r.description || '',
    date: r.date || new Date().toISOString().slice(0, 10),
    priority: r.priority || 'Normal',
    done: r.done ?? false,
  })

  const addReminder = async (r) => {
    const newId = uid('R')
    const { data, error } = await supabase.from('reminders').insert([pickReminder({ ...r, done: false }, newId)]).select().single()
    if (!error && data) setReminders(p => [data, ...p])
    else if (error) console.error('addReminder error:', error.message)
  }
  const updateReminder = async (r) => {
    const { data, error } = await supabase.from('reminders').update(pickReminder(r)).eq('id', r.id).select().single()
    if (!error && data) setReminders(p => p.map(x => x.id === r.id ? data : x))
    else if (error) console.error('updateReminder error:', error.message)
  }
  const deleteReminder = async (id) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id)
    if (!error) setReminders(p => p.filter(x => x.id !== id))
  }

  /* ─── Enquiries ── */
  const pickEnquiry = (e) => ({
    id: e.id,
    client_name: e.client_name,
    co_applicate_name: e.co_applicate_name || '',
    loan_type: e.loan_type,
    loan_amount: e.loan_amount,
    associate_name: e.associate_name,
    client_mobile_number: String(e.client_mobile_number || ''),
    status: e.status || 'New',
    note: e.note || '',
    google_drive_link: e.google_drive_link || '',
  })

  const addEnquiry = async (e) => {
    const newId = uid('E')
    const payload = pickEnquiry({ ...e, id: newId })
    const { data, error } = await supabase.from('enquiries').insert([payload]).select().single()
    if (!error && data) setEnquiries(p => [data, ...p])
    else if (error) console.error('Error adding enquiry:', error.message)
  }
  const updateEnquiry = async (e) => {
    const payload = pickEnquiry(e)
    const { data, error } = await supabase.from('enquiries').update(payload).eq('id', e.id).select().single()
    if (!error && data) setEnquiries(p => p.map(x => x.id === e.id ? data : x))
    else if (error) console.error('Error updating enquiry:', error.message)
  }
  const removeEnquiry = async (id) => {
    const { error } = await supabase.from('enquiries').delete().eq('id', id)
    if (!error) setEnquiries(p => p.filter(x => x.id !== id))
  }

  /* ─── Login Files ── */
  const pickLoginFile = (f, id) => ({
    id: id || f.id,
    client: f.client,
    client_id: f.client_id,
    loan_type: f.loan_type,
    priority: f.priority || 'Normal',
    submitted: f.submitted || new Date().toISOString().slice(0, 10),
    stages: f.stages || null,
    current_stage_index: f.currentStageIndex ?? f.current_stage_index ?? 0,
    done: f.done ?? false,
    amount_paid: f.amount_paid ?? null,
    actual_payout: f.actual_payout ?? null,
  })

  const addLoginFile = async (f) => {
    const newId = uid('LF')
    const payload = pickLoginFile(f, newId)
    const { data: lfData, error: lfError } = await supabase.from('login_files').insert([payload]).select().single()
    if (lfError) { console.error('addLoginFile error:', lfError.message); return }
    const merged = { ...lfData, currentStageIndex: lfData.current_stage_index ?? 0 }
    setLoginFiles(p => [merged, ...p])

    const exists = clients.some(c => 
      (c.file_no && c.file_no === f.client_id) || 
      (c.name && c.name.toLowerCase().trim() === f.client.toLowerCase().trim())
    )
    if (!exists) {
      const today = new Date().toISOString().slice(0, 10)
      const newClientId = await nextClientId()
      const newClient = {
        id: newClientId,
        name: f.client,
        phone: '—',
        loan_type: f.loan_type,
        amount: 2500000,
        status: f.done ? 'Disbursed' : 'Processing',
        file_no: f.client_id,
        date: f.submitted || today,
        associate: 'Unassigned',
        extended_data: null
      }
      const { data: cData, error: cErr } = await supabase.from('clients').insert([newClient]).select().single()
      if (!cErr && cData) setClients(p => [cData, ...p])
    }
  }

  const removeLoginFile = async (id) => {
    const { error } = await supabase.from('login_files').delete().eq('id', id)
    if (!error) setLoginFiles(p => p.filter(x => x.id !== id))
  }

  const updateLoginFile = async (f) => {
    const payload = pickLoginFile(f)

    const { data: updatedFile, error: updateError } = await supabase.from('login_files').update(payload).eq('id', f.id).select().single()
    if (updateError) { console.error('updateLoginFile error:', updateError.message); return }
    
    const merged = { ...updatedFile, currentStageIndex: updatedFile.current_stage_index ?? 0 }
    setLoginFiles(p => p.map(x => x.id === f.id ? merged : x))

    if (f.done) {
      const today = new Date().toISOString().slice(0, 10)
      
      // Auto-transition Client Record to Disbursed
      const clientToUpdate = clients.find(c => c.file_no === f.client_id || c.name === f.client)
      if (clientToUpdate && clientToUpdate.status !== 'Disbursed') {
        const { data: upClient, error: cErr } = await supabase.from('clients').update({ status: 'Disbursed' }).eq('id', clientToUpdate.id).select().single()
        if (!cErr && upClient) setClients(p => p.map(c => c.id === upClient.id ? upClient : c))
      }

      // Auto-append Disbursement/Collection transaction to Payment Ledger
      const isPayout = f.amount_paid !== undefined && f.amount_paid !== null
      const paymentType = isPayout ? 'Collection' : 'Disbursement'
      const hasPayment = payments.some(x => x.file_no === f.client_id && x.type === paymentType)
      
      if (!hasPayment) {
        if (isPayout) {
          const actualPayout = Number(f.actual_payout || f.amount_paid || 0);
          const amountPaid = Number(f.amount_paid || 0);
          const pendingAmount = actualPayout - amountPaid;

          const paymentsToAdd = [];

          if (amountPaid > 0) {
            paymentsToAdd.push({
              id: uid('P'),
              client: f.client,
              file_no: f.client_id,
              type: paymentType,
              amount: amountPaid,
              bank: 'ICICI Bank',
              date: today,
              status: 'Completed',
              particular: 'Cosmos Payout Collection',
              category: 'Processing Fee'
            });
          }

          if (pendingAmount > 0) {
            paymentsToAdd.push({
              id: uid('P'),
              client: f.client,
              file_no: f.client_id,
              type: paymentType,
              amount: pendingAmount,
              bank: 'ICICI Bank',
              date: today,
              status: 'Pending',
              particular: 'Cosmos Payout Pending',
              category: 'Processing Fee'
            });
          }

          if (paymentsToAdd.length === 0) {
            paymentsToAdd.push({
              id: uid('P'),
              client: f.client,
              file_no: f.client_id,
              type: paymentType,
              amount: 0,
              bank: 'ICICI Bank',
              date: today,
              status: 'Completed',
              particular: 'Cosmos Payout Collection',
              category: 'Processing Fee'
            });
          }

          const { data: pData, error: pErr } = await supabase.from('payments').insert(paymentsToAdd).select()
          if (!pErr && pData) setPayments(p => [...pData, ...p])
        } else {
          const payPayload = {
            id: uid('P'),
            client: f.client,
            file_no: f.client_id,
            type: paymentType,
            amount: clientToUpdate?.amount || 2500000,
            bank: 'ICICI Bank',
            date: today,
            status: 'Completed'
          }
          const { data: pData, error: pErr } = await supabase.from('payments').insert([payPayload]).select().single()
          if (!pErr && pData) setPayments(p => [pData, ...p])
        }
      }
    }
  }

  /* ─── Misc ── */
  const markNotifRead = async (id) => {
    const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).select().single()
    if (!error && data) setNotifications(p => p.map(x => x.id === id ? data : x))
  }
  const markAllNotifsRead = async () => {
    const { error } = await supabase.from('notifications').update({ read: true }).neq('read', true)
    if (!error) setNotifications(p => p.map(x => ({ ...x, read: true })))
  }

  const addUser = async (u) => {
    const { data, error } = await supabase.from('system_users').insert([u]).select().single()
    if (!error && data) setUsers(p => [data, ...p])
  }
  const updateUser = async (u) => {
    const { data, error } = await supabase.from('system_users').update(u).eq('id', u.id).select().single()
    if (!error && data) setUsers(p => p.map(x => x.id === u.id ? data : x))
  }
  const removeUser = async (id) => {
    const { error } = await supabase.from('system_users').delete().eq('id', id)
    if (!error) setUsers(p => p.filter(x => x.id !== id))
  }

  const addBackup = async (b) => {
    const newId = uid('B')
    const { data, error } = await supabase.from('backups').insert([{ ...b, id: newId }]).select().single()
    if (!error && data) setBackups(p => [data, ...p])
  }

  const addInvestment = async (inv) => {
    const newId = uid('I')
    const { data, error } = await supabase.from('investments').insert([{ ...inv, id: newId }]).select().single()
    if (!error && data) setInvestments(p => [data, ...p])
  }
  const updateInvestment = async (inv) => {
    const { data, error } = await supabase.from('investments').update(inv).eq('id', inv.id).select().single()
    if (!error && data) setInvestments(p => p.map(x => x.id === inv.id ? data : x))
  }
  const removeInvestment = async (id) => {
    const { error } = await supabase.from('investments').delete().eq('id', id)
    if (!error) setInvestments(p => p.filter(x => x.id !== id))
  }

  const addTransaction = async (tx) => {
    const newId = uid('TX')
    const { data, error } = await supabase.from('transactions').insert([{ ...tx, id: newId }]).select().single()
    if (!error && data) setTransactions(p => [data, ...p])
  }
  const updateTransaction = async (tx) => {
    const { data, error } = await supabase.from('transactions').update(tx).eq('id', tx.id).select().single()
    if (!error && data) setTransactions(p => p.map(x => x.id === tx.id ? data : x))
  }
  const removeTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setTransactions(p => p.filter(x => x.id !== id))
  }

  return (
    <AppStateContext.Provider value={{
      clients, addClient, updateClient, removeClient,
      associates: computedAssociates, addAssociate, updateAssociate, deleteAssociate,
      payments, addPayment, updatePayment, removePayment,
      invoices, addInvoice, removeInvoice,
      financeInvoices, addFinanceInvoice,
      products, addProduct, updateProduct,
      reminders, addReminder, updateReminder, deleteReminder,
      notifications, markNotifRead, markAllNotifsRead,
      enquiries, addEnquiry, updateEnquiry, removeEnquiry,
      loginFiles, addLoginFile, updateLoginFile, removeLoginFile,
      backups, addBackup,
      users, addUser, updateUser, removeUser,
      investments, addInvestment, updateInvestment, removeInvestment,
      transactions, addTransaction, updateTransaction, removeTransaction,
      loading
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  return useContext(AppStateContext)
}
