import { supabase } from '../api/supabaseClient'

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

// Invoice: 1st/2nd digit A-Z (26), 3rd digit A-Z then 0-9 (36) → 24,336 IDs / year
function decodeInvoiceSeq(suffix) {
  const c1 = suffix.charCodeAt(0) - 65
  const c2 = suffix.charCodeAt(1) - 65
  const c3Char = suffix[2]
  let c3
  if (c3Char >= 'A' && c3Char <= 'Z') c3 = c3Char.charCodeAt(0) - 65
  else c3 = 26 + parseInt(c3Char, 10)
  return c1 * 936 + c2 * 36 + c3
}
function encodeInvoiceSeq(seq) {
  const chars3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const c3 = chars3[seq % 36]
  const c2 = String.fromCharCode(65 + Math.floor(seq / 36) % 26)
  const c1 = String.fromCharCode(65 + Math.floor(seq / 936))
  return c1 + c2 + c3
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

export async function nextInvoiceId() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `CFI-${yy}-`
  const { data } = await supabase.from('invoices')
    .select('id').like('id', `${prefix}%`).order('id', { ascending: false }).limit(50)
  if (!data || data.length === 0) return `${prefix}AAA`
  const seqs = data
    .map(r => r.id.slice(prefix.length))
    .filter(s => /^[A-Z]{2}[A-Z0-9]$/.test(s))
    .map(decodeInvoiceSeq)
  if (seqs.length === 0) return `${prefix}AAA`
  return `${prefix}${encodeInvoiceSeq(Math.max(...seqs) + 1)}`
}

export async function nextFinanceInvoiceId() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `FI-${yy}-`
  const { data } = await supabase.from('finance_invoices')
    .select('id').like('id', `${prefix}%`).order('id', { ascending: false }).limit(50)
  if (!data || data.length === 0) return `${prefix}AAA`
  const seqs = data
    .map(r => r.id.slice(prefix.length))
    .filter(s => /^[A-Z]{2}[A-Z0-9]$/.test(s))
    .map(decodeInvoiceSeq)
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
