import { supabase } from '../supabaseClient'

/** Summary counts for stat cards */
export async function getDashboardStats() {
  const [enquiries, loginFiles, payments] = await Promise.all([
    supabase.from('enquiries').select('id', { count: 'exact', head: true }),
    supabase.from('login_files').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('payments').select('amount').eq('status', 'collected'),
  ])

  const totalPayments = payments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0

  return {
    newEnquiries: enquiries.count ?? 0,
    loginFiles: loginFiles.count ?? 0,
    totalCollections: totalPayments,
  }
}

/** Loan type breakdown for donut chart */
export async function getLoanEnquiryBreakdown() {
  const { data, error } = await supabase
    .from('enquiries')
    .select('loan_type')

  if (error || !data) return []

  const counts = {}
  data.forEach(({ loan_type }) => {
    counts[loan_type] = (counts[loan_type] || 0) + 1
  })

  const total = data.length || 1
  return Object.entries(counts).map(([type, count]) => ({
    type,
    count,
    percent: Math.round((count / total) * 100),
  }))
}

/** Recent activities */
export async function getRecentActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('id, title, description, created_at, type')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return []
  return data ?? []
}

/** Pending follow-ups */
export async function getPendingFollowUps() {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('id, client_name, loan_type, last_contact, priority, contact_method')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .limit(10)

  if (error) return []
  return data ?? []
}

/** Today's schedule */
export async function getTodaySchedule() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('schedule')
    .select('id, time, title, description, highlight')
    .eq('date', today)
    .order('time', { ascending: true })

  if (error) return []
  return data ?? []
}
