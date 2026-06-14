import { supabase } from '../../shared/api/supabaseClient'

/** Summary counts for stat cards — derived from real tables */
export async function getDashboardStats() {
  const [enquiries, loginFiles, payments] = await Promise.all([
    supabase.from('enquiries').select('id', { count: 'exact', head: true }),
    supabase.from('login_files').select('id', { count: 'exact', head: true }).eq('done', false),
    supabase.from('payments').select('amount').eq('status', 'Completed'),
  ])

  const totalPayments = payments.data?.reduce((sum, p) => sum + Number(p.amount || 0), 0) ?? 0

  return {
    newEnquiries: enquiries.count ?? 0,
    newEnquiriesLastPeriod: 0,
    loginFiles: loginFiles.count ?? 0,
    loginFilesLastPeriod: 0,
    totalCollections: totalPayments,
    totalCollectionsLastPeriod: 0,
  }
}

/** Loan type breakdown for donut chart — from enquiries + clients */
export async function getLoanEnquiryBreakdown() {
  const { data, error } = await supabase
    .from('enquiries')
    .select('loan_type')

  if (error || !data || data.length === 0) {
    // Fall back to clients if no enquiries
    const { data: clientData } = await supabase.from('clients').select('loan_type')
    if (!clientData || clientData.length === 0) return []
    const counts = {}
    clientData.forEach(({ loan_type }) => {
      if (loan_type) counts[loan_type] = (counts[loan_type] || 0) + 1
    })
    const total = clientData.length || 1
    return Object.entries(counts).map(([type, count]) => ({
      type, count, percent: Math.round((count / total) * 100),
    }))
  }

  const counts = {}
  data.forEach(({ loan_type }) => {
    if (loan_type) counts[loan_type] = (counts[loan_type] || 0) + 1
  })
  const total = data.length || 1
  return Object.entries(counts).map(([type, count]) => ({
    type, count, percent: Math.round((count / total) * 100),
  }))
}

/** Recent activities — derived from recent payments and login files */
export async function getRecentActivities() {
  const [{ data: recentPayments }, { data: recentFiles }] = await Promise.all([
    supabase.from('payments').select('id, client, amount, status, date, type').order('created_at', { ascending: false }).limit(3),
    supabase.from('login_files').select('id, client, loan_type, done, created_at').order('created_at', { ascending: false }).limit(3),
  ])

  const activities = []

  ;(recentPayments || []).forEach((p, i) => {
    activities.push({
      id: `pay-${p.id || i}`,
      type: 'payment',
      title: p.type === 'Collection' ? 'Payment Collected' : 'Payment Disbursed',
      description: `${p.client} — ₹${Number(p.amount || 0).toLocaleString('en-IN')} (${p.status})`,
      created_at: new Date(p.date || Date.now()).toISOString(),
    })
  })

  ;(recentFiles || []).forEach((f, i) => {
    activities.push({
      id: `file-${f.id || i}`,
      type: f.done ? 'approval' : 'file',
      title: f.done ? `${f.loan_type || 'Loan'} Disbursed` : 'New File Logged',
      description: `Client: ${f.client} (${f.loan_type || 'Loan'})`,
      created_at: f.created_at || new Date().toISOString(),
    })
  })

  // Sort by date descending
  activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return activities.slice(0, 5)
}

/** Pending follow-ups — from enquiries with status New/Contacted */
export async function getPendingFollowUps() {
  const { data, error } = await supabase
    .from('enquiries')
    .select('id, client_name, loan_type, created_at, associate_name, status')
    .in('status', ['New', 'Contacted'])
    .order('created_at', { ascending: true })
    .limit(10)

  if (error || !data) return []

  return data.map(e => ({
    id: e.id,
    client_name: e.client_name,
    loan_type: e.loan_type,
    last_contact: new Date(e.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    priority: e.status === 'New' ? 'high' : 'medium',
    contact_method: 'phone',
  }))
}

/** Today's schedule — derived from reminders due today */
export async function getTodaySchedule() {
  const { data, error } = await supabase
    .from('reminders')
    .select('id, title, description, date, start_date, end_date, priority, done')
    .eq('done', false)
    .order('created_at', { ascending: true })
    .limit(5)

  if (error || !data) return []

  const formatDate = (dStr) => {
    if (!dStr) return '—'
    const dateObj = new Date(dStr)
    if (isNaN(dateObj.getTime())) return dStr
    return dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  return data.map((r, i) => {
    let timeLabel = formatDate(r.date)
    if (r.start_date && r.end_date) {
      timeLabel = `${formatDate(r.start_date)} - ${formatDate(r.end_date)}`
    } else if (r.start_date) {
      timeLabel = `From ${formatDate(r.start_date)}`
    }

    return {
      id: r.id || i,
      time: timeLabel,
      title: r.title,
      description: r.description || '',
      highlight: r.priority === 'high',
    }
  })
}
