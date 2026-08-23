import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../shared/api/supabaseClient'
import { nextClientId, nextAssociateId, nextInvoiceId, nextFinanceInvoiceId } from '../shared/lib/idGenerator'

const AppStateContext = createContext()

/* ─── Unique ID Generator (used for non-client/invoice entities) ────── */
function uid(prefix = '') {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
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
  const [financeEntries, setFinanceEntries] = useState([])
  
  const [loading, setLoading] = useState(true)

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const fetchWithTimeout = (promise, ms = 6000) =>
        Promise.race([
          promise,
          new Promise(resolve => setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), ms))
        ])

      const [
        { data: clientsData }, { data: associatesData }, { data: paymentsData },
        { data: invoicesData }, { data: financeInvoicesData }, { data: productsData },
        { data: remindersData }, { data: notificationsData }, { data: enquiriesData },
        { data: loginFilesData }, { data: backupsData }, { data: usersData },
        { data: investmentsData }, { data: transactionsData }, { data: financeEntriesData }
      ] = await Promise.all([
        fetchWithTimeout(supabase.from('clients').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('associates').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('payments').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('invoices').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('finance_invoices').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('products').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('reminders').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('notifications').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('enquiries').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('login_files').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('backups').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('system_users').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('investments').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('transactions').select('*').order('created_at', { ascending: false })),
        fetchWithTimeout(supabase.from('finance_entries').select('*').order('created_at', { ascending: false }))
      ])

      setClients((clientsData || []).map(unpackClient))
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
      setTransactions((transactionsData || []).map(tx => {
        let remarks = ''
        let particular = tx.particular || ''
        if (particular.includes(' | Remarks: ')) {
          const parts = particular.split(' | Remarks: ')
          particular = parts[0]
          remarks = parts[1]
        }
        return {
          ...tx,
          particular,
          remarks,
          status: tx.status || (tx.type === 'Income' ? 'Received' : 'Paid')
        }
      }))
      setFinanceEntries(financeEntriesData || [])
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
  const computedAssociates = useMemo(() => {
    return associates.map(a => {
      const assocClients = clients.filter(c => c.associate === a.name && c.loan_type !== 'Finance Entry')
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
  }, [associates, clients])

  /* ─── Clients ── */
  const unpackClient = (c) => {
    if (c.extended_data) {
      return { ...c, ...c.extended_data };
    }
    return c;
  };

  const pickClient = (c, id) => {
    const standardKeys = ['id', 'name', 'phone', 'drive_link', 'loan_type', 'amount', 'status', 'file_no', 'date', 'associate', 'extended_data', 'created_at', 'updated_at'];
    const extended = { ...(c.extended_data || {}) };
    
    Object.keys(c).forEach(key => {
      if (!standardKeys.includes(key)) {
        extended[key] = c[key];
      }
    });

    return {
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
      extended_data: Object.keys(extended).length > 0 ? extended : null,
    };
  }

  const addClient = async (c) => {
    const newClientId = await nextClientId()
    const newClient = pickClient(c, newClientId)

    const { data: clientData, error: clientError } = await supabase.from('clients').insert([newClient]).select().single()
    if (clientError) {
      console.error('addClient error:', clientError.message)
      throw new Error(clientError.message)
    }
    setClients(p => [unpackClient(clientData), ...p])

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
    if (clientError) {
      console.error('updateClient error:', clientError.message)
      throw new Error(clientError.message)
    }
    setClients(p => p.map(x => x.id === c.id ? unpackClient(clientData) : x))

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
    if (error) {
      console.error('addAssociate error:', error.message)
      throw new Error(error.message)
    }
    if (data) setAssociates(p => [data, ...p])
  }


  const updateAssociate = async (a) => {
    const { data, error } = await supabase.from('associates').update(pickAssociate(a)).eq('id', a.id).select().single()
    if (error) {
      console.error('updateAssociate error:', error.message)
      throw new Error(error.message)
    }
    if (data) setAssociates(p => p.map(x => x.id === a.id ? data : x))
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
    const item = pickPayment(pay, newId)
    const { data, error } = await supabase.from('payments').insert([item]).select().single()
    if (!error && data) {
      setPayments(p => [data, ...p])
      return data
    } else {
      if (error) console.error('addPayment error:', error.message)
      setPayments(p => [item, ...p])
      return item
    }
  }
  const updatePayment = async (pay) => {
    const item = pickPayment(pay)
    const { data, error } = await supabase.from('payments').update(item).eq('id', pay.id).select().single()
    if (!error && data) {
      setPayments(p => p.map(x => x.id === pay.id ? data : x))
      return data
    } else {
      if (error) console.error('updatePayment error:', error.message)
      setPayments(p => p.map(x => x.id === pay.id ? item : x))
      return item
    }
  }
  const removePayment = async (id) => {
    const { error } = await supabase.from('payments').delete().eq('id', id)
    if (error) console.error('removePayment error:', error.message)
    setPayments(p => p.filter(x => x.id !== id))
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
    const newId = await nextFinanceInvoiceId()
    const { data, error } = await supabase.from('finance_invoices').insert([pickFinanceInvoice(inv, newId)]).select().single()
    if (!error && data) setFinanceInvoices(p => [data, ...p])
    else if (error) console.error('addFinanceInvoice error:', error.message)
  }
  const updateFinanceInvoice = async (inv) => {
    const { data, error } = await supabase.from('finance_invoices').update(pickFinanceInvoice(inv)).eq('id', inv.id).select().single()
    if (!error && data) setFinanceInvoices(p => p.map(x => x.id === inv.id ? data : x))
    else if (error) console.error('updateFinanceInvoice error:', error.message)
  }
  const removeFinanceInvoice = async (id) => {
    const { error } = await supabase.from('finance_invoices').delete().eq('id', id)
    if (!error) setFinanceInvoices(p => p.filter(x => x.id !== id))
    else console.error('removeFinanceInvoice error:', error.message)
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
    start_date: r.start_date || null,
    end_date: r.end_date || null,
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
    if (lfError) console.error('addLoginFile error:', lfError.message)
    const fileToAdd = (!lfError && lfData) ? lfData : payload
    const merged = { ...fileToAdd, currentStageIndex: fileToAdd.current_stage_index ?? fileToAdd.currentStageIndex ?? 0 }
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
      if (!cErr && cData) {
        setClients(p => [cData, ...p])
      } else {
        setClients(p => [newClient, ...p])
      }
    }
  }

  const removeLoginFile = async (id) => {
    const { error } = await supabase.from('login_files').delete().eq('id', id)
    if (error) console.error('removeLoginFile error:', error.message)
    setLoginFiles(p => p.filter(x => x.id !== id))
  }

  const updateLoginFile = async (f) => {
    const payload = pickLoginFile(f)

    let updatedFile = { ...f, currentStageIndex: f.currentStageIndex ?? f.current_stage_index ?? 0 }
    const { data: updatedData, error: updateError } = await supabase.from('login_files').update(payload).eq('id', f.id).select().single()
    if (!updateError && updatedData) {
      updatedFile = { ...updatedData, currentStageIndex: updatedData.current_stage_index ?? updatedData.currentStageIndex ?? 0 }
    } else if (updateError) {
      console.error('updateLoginFile error:', updateError.message)
    }
    
    setLoginFiles(p => p.map(x => x.id === f.id ? updatedFile : x))

    if (f.done) {
      const today = new Date().toISOString().slice(0, 10)
      
      // Auto-transition Client Record to Disbursed
      const clientToUpdate = clients.find(c => c.file_no === f.client_id || c.name === f.client)
      if (clientToUpdate && clientToUpdate.status !== 'Disbursed') {
        const { data: upClient, error: cErr } = await supabase.from('clients').update({ status: 'Disbursed' }).eq('id', clientToUpdate.id).select().single()
        if (!cErr && upClient) {
          setClients(p => p.map(c => c.id === upClient.id ? upClient : c))
        } else {
          setClients(p => p.map(c => c.id === clientToUpdate.id ? { ...c, status: 'Disbursed' } : c))
        }
      }

      // Auto-append Disbursement/Collection transaction to Payment Ledger
      const isPayout = f.amount_paid !== undefined && f.amount_paid !== null
      const paymentType = isPayout ? 'Collection' : 'Disbursement'
      const existingPayments = payments.filter(x => 
        ((x.file_no && f.client_id && x.file_no === f.client_id) || 
         (x.client && f.client && x.client.toLowerCase().trim() === f.client.toLowerCase().trim())) && 
        x.type === paymentType
      )

      if (isPayout) {
        const actualPayout = Number(f.actual_payout || f.amount_paid || 0);
        const amountPaid = Number(f.amount_paid || 0);
        const pendingAmount = actualPayout - amountPaid;

        const paymentsToAdd = [];

        if (amountPaid > 0) {
          paymentsToAdd.push(pickPayment({
            client: f.client,
            file_no: f.client_id || f.file_no || '',
            type: paymentType,
            amount: amountPaid,
            bank: 'ICICI Bank',
            date: today,
            status: 'Completed',
            particular: 'Cosmos Payout Collection',
            category: 'Processing Fee'
          }, uid('P')));
        }

        if (pendingAmount > 0) {
          paymentsToAdd.push(pickPayment({
            client: f.client,
            file_no: f.client_id || f.file_no || '',
            type: paymentType,
            amount: pendingAmount,
            bank: 'ICICI Bank',
            date: today,
            status: 'Pending',
            particular: 'Cosmos Payout Pending',
            category: 'Processing Fee'
          }, uid('P')));
        }

        if (paymentsToAdd.length === 0) {
          paymentsToAdd.push(pickPayment({
            client: f.client,
            file_no: f.client_id || f.file_no || '',
            type: paymentType,
            amount: 0,
            bank: 'ICICI Bank',
            date: today,
            status: 'Completed',
            particular: 'Cosmos Payout Collection',
            category: 'Processing Fee'
          }, uid('P')));
        }

        // Delete any existing auto-generated payout records from DB so we don't accumulate duplicates on recalculation
        if (existingPayments.length > 0) {
          for (const ep of existingPayments) {
            await supabase.from('payments').delete().eq('id', ep.id)
          }
        }

        const { data: pData, error: pErr } = await supabase.from('payments').insert(paymentsToAdd).select()
        const newPaymentsList = (!pErr && pData && pData.length > 0) ? pData : paymentsToAdd

        setPayments(p => {
          const filtered = p.filter(x => !existingPayments.some(ep => ep.id === x.id))
          return [...newPaymentsList, ...filtered]
        })
      } else if (existingPayments.length === 0) {
        const payPayload = pickPayment({
          client: f.client,
          file_no: f.client_id || f.file_no || '',
          type: paymentType,
          amount: clientToUpdate?.amount || 2500000,
          bank: 'ICICI Bank',
          date: today,
          status: 'Completed'
        }, uid('P'))
        const { data: pData, error: pErr } = await supabase.from('payments').insert([payPayload]).select().single()
        const newPayment = (!pErr && pData) ? pData : payPayload
        setPayments(p => [newPayment, ...p])
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
    const { status, remarks, ...restTx } = tx
    const finalParticular = remarks ? `${restTx.particular} | Remarks: ${remarks}` : restTx.particular
    const payload = { ...restTx, particular: finalParticular, id: newId }

    const { data, error } = await supabase.from('transactions').insert([payload]).select().single()
    if (error) console.error('addTransaction error:', error.message)
    if (!error && data) {
      setTransactions(p => [{ ...data, particular: restTx.particular, status: status || (data.type === 'Income' ? 'Received' : 'Paid'), remarks }, ...p])
    }
  }
  const updateTransaction = async (tx) => {
    const { status, remarks, ...restTx } = tx
    const finalParticular = remarks ? `${restTx.particular} | Remarks: ${remarks}` : restTx.particular
    const payload = { ...restTx, particular: finalParticular }

    const { data, error } = await supabase.from('transactions').update(payload).eq('id', tx.id).select().single()
    if (error) console.error('updateTransaction error:', error.message)
    if (!error && data) {
      setTransactions(p => p.map(x => x.id === tx.id ? { ...data, particular: restTx.particular, status: status || (data.type === 'Income' ? 'Received' : 'Paid'), remarks } : x))
    }
  }
  const removeTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setTransactions(p => p.filter(x => x.id !== id))
  }

  const syncFinanceEntryToClientsTable = async (fe) => {
    try {
      const name = fe.client_name;
      const phone = fe.mobile_number || '—';
      const drive_link = fe.google_drive_link || '';
      const amount = Number(fe.loan_amount || 0);
      const status = fe.status || 'Active';
      const extended = {
        aadhaar: fe.aadhaar_number || '',
        pan: fe.pan_number || '',
        co_applicant_name: fe.co_applicant_name || '',
        address: fe.address || '',
        co_applicant_aadhaar: fe.co_applicant_aadhaar || '',
        eb_no: fe.eb_no || '',
        remarks: fe.remarks || ''
      };

      const existingClient = clients.find(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());

      if (existingClient) {
        const payload = {
          name,
          phone,
          drive_link,
          loan_type: 'Finance Entry',
          amount,
          status,
          extended_data: { ...(existingClient.extended_data || {}), ...extended }
        };
        const { data: updated, error } = await supabase.from('clients').update(payload).eq('id', existingClient.id).select().single();
        if (!error && updated) {
          setClients(p => p.map(c => c.id === updated.id ? { ...updated, ...updated.extended_data } : c));
        }
      } else {
        const newClientId = await nextClientId();
        const payload = {
          id: newClientId,
          name,
          phone,
          drive_link,
          loan_type: 'Finance Entry',
          amount,
          status,
          file_no: newClientId,
          date: fe.due_date || new Date().toISOString().slice(0, 10),
          associate: 'Unassigned',
          extended_data: extended
        };
        const { data: inserted, error } = await supabase.from('clients').insert([payload]).select().single();
        if (!error && inserted) {
          setClients(p => [{ ...inserted, ...inserted.extended_data }, ...p]);
        }
      }
    } catch (err) {
      console.error('Failed to sync finance entry to clients table:', err);
    }
  };

  const addFinanceEntry = async (entry) => {
    const newId = uid('FE')
    const { data, error } = await supabase.from('finance_entries').insert([{ ...entry, id: newId }]).select().single()
    if (!error && data) {
      setFinanceEntries(p => [data, ...p])
      // await syncFinanceEntryToClientsTable(data)
      return { success: true, data }
    } else {
      console.error('addFinanceEntry error:', error?.message || error)
      return { success: false, error: error?.message || 'Failed to save entry' }
    }
  }
  const updateFinanceEntry = async (entry) => {
    const { data, error } = await supabase.from('finance_entries').update(entry).eq('id', entry.id).select().single()
    if (!error && data) {
      setFinanceEntries(p => p.map(x => x.id === entry.id ? data : x))
      // await syncFinanceEntryToClientsTable(data)
      return { success: true, data }
    } else {
      console.error('updateFinanceEntry error:', error?.message || error)
      return { success: false, error: error?.message || 'Failed to update entry' }
    }
  }
  const removeFinanceEntry = async (id) => {
    const { error } = await supabase.from('finance_entries').delete().eq('id', id)
    if (!error) setFinanceEntries(p => p.filter(x => x.id !== id))
    else console.error('removeFinanceEntry error:', error.message)
  }

  return (
    <AppStateContext.Provider value={{
      clients, addClient, updateClient, removeClient,
      associates: computedAssociates, addAssociate, updateAssociate, deleteAssociate,
      payments, addPayment, updatePayment, removePayment,
      invoices, addInvoice, removeInvoice,
      financeInvoices, addFinanceInvoice, updateFinanceInvoice, removeFinanceInvoice,
      products, addProduct, updateProduct,
      reminders, addReminder, updateReminder, deleteReminder,
      notifications, markNotifRead, markAllNotifsRead,
      enquiries, addEnquiry, updateEnquiry, removeEnquiry,
      loginFiles, addLoginFile, updateLoginFile, removeLoginFile,
      backups, addBackup,
      users, addUser, updateUser, removeUser,
      investments, addInvestment, updateInvestment, removeInvestment,
      transactions, addTransaction, updateTransaction, removeTransaction,
      financeEntries, addFinanceEntry, updateFinanceEntry, removeFinanceEntry,
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
