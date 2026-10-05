import { supabase } from '../api/supabaseClient'

/* ─── Sequential ID Helpers ─────────────────────────────────────────── */

// Client: CF-YY-XXD  (X = A-Z, D = 0-9)  →  6,760 IDs / year
function decodeClientSeq(suffix) {
  if (!suffix || suffix.length < 3) return 0;
  const l1 = suffix.charCodeAt(0) - 65;
  const l2 = suffix.charCodeAt(1) - 65;
  const d  = parseInt(suffix[2], 10);
  if (isNaN(l1) || isNaN(l2) || isNaN(d)) return 0;
  return l1 * 260 + l2 * 10 + d;
}

function encodeClientSeq(seq) {
  const safeSeq = Math.max(0, seq);
  const d  = safeSeq % 10;
  const l2 = Math.floor(safeSeq / 10) % 26;
  const l1 = Math.floor(safeSeq / 260) % 26;
  return String.fromCharCode(65 + l1) + String.fromCharCode(65 + l2) + d;
}

// Invoice: 1st/2nd digit A-Z (26), 3rd digit A-Z then 0-9 (36) → 24,336 IDs / year
function decodeInvoiceSeq(suffix) {
  if (!suffix || suffix.length < 3) return 0;
  const c1 = suffix.charCodeAt(0) - 65;
  const c2 = suffix.charCodeAt(1) - 65;
  const c3Char = suffix[2];
  let c3 = 0;
  if (c3Char >= 'A' && c3Char <= 'Z') c3 = c3Char.charCodeAt(0) - 65;
  else if (c3Char >= '0' && c3Char <= '9') c3 = 26 + parseInt(c3Char, 10);
  if (isNaN(c1) || isNaN(c2) || isNaN(c3)) return 0;
  return c1 * 936 + c2 * 36 + c3;
}

function encodeInvoiceSeq(seq) {
  const safeSeq = Math.max(0, seq);
  const chars3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const c3 = chars3[safeSeq % 36] || 'A';
  const c2 = String.fromCharCode(65 + (Math.floor(safeSeq / 36) % 26));
  const c1 = String.fromCharCode(65 + (Math.floor(safeSeq / 936) % 26));
  return c1 + c2 + c3;
}

export async function nextClientId() {
  try {
    const yy = String(new Date().getFullYear()).slice(-2);
    const prefix = `CF-${yy}-`;
    const { data, error } = await supabase.from('clients')
      .select('id').like('id', `${prefix}%`).order('id', { ascending: false }).limit(50);
    if (error || !data || data.length === 0) return `${prefix}AA0`;
    const seqs = data
      .map(r => r.id.slice(prefix.length))
      .filter(s => /^[A-Z]{2}[0-9]$/.test(s))
      .map(decodeClientSeq);
    if (seqs.length === 0) return `${prefix}AA0`;
    return `${prefix}${encodeClientSeq(Math.max(...seqs) + 1)}`;
  } catch (err) {
    console.error('Error generating next client ID:', err);
    return `CF-${String(new Date().getFullYear()).slice(-2)}-AA0`;
  }
}

export async function nextInvoiceId() {
  try {
    const yy = String(new Date().getFullYear()).slice(-2);
    const prefix = `CFI-${yy}-`;
    const { data, error } = await supabase.from('invoices')
      .select('id').like('id', `${prefix}%`).order('id', { ascending: false }).limit(50);
    if (error || !data || data.length === 0) return `${prefix}AAA`;
    const seqs = data
      .map(r => r.id.slice(prefix.length))
      .filter(s => /^[A-Z]{2}[A-Z0-9]$/.test(s))
      .map(decodeInvoiceSeq);
    if (seqs.length === 0) return `${prefix}AAA`;
    return `${prefix}${encodeInvoiceSeq(Math.max(...seqs) + 1)}`;
  } catch (err) {
    console.error('Error generating next invoice ID:', err);
    return `CFI-${String(new Date().getFullYear()).slice(-2)}-AAA`;
  }
}

export async function nextFinanceInvoiceId() {
  try {
    const yy = String(new Date().getFullYear()).slice(-2);
    const prefix = `FI-${yy}-`;
    const { data, error } = await supabase.from('finance_invoices')
      .select('id').like('id', `${prefix}%`).order('id', { ascending: false }).limit(50);
    if (error || !data || data.length === 0) return `${prefix}AAA`;
    const seqs = data
      .map(r => r.id.slice(prefix.length))
      .filter(s => /^[A-Z]{2}[A-Z0-9]$/.test(s))
      .map(decodeInvoiceSeq);
    if (seqs.length === 0) return `${prefix}AAA`;
    return `${prefix}${encodeInvoiceSeq(Math.max(...seqs) + 1)}`;
  } catch (err) {
    console.error('Error generating next finance invoice ID:', err);
    return `FI-${String(new Date().getFullYear()).slice(-2)}-AAA`;
  }
}

export async function nextAssociateId() {
  try {
    const { data, error } = await supabase.from('associates')
      .select('id').like('id', 'CFA-%').order('id', { ascending: false }).limit(50);
    if (error || !data || data.length === 0) return 'CFA-01';
    const nums = data
      .map(r => parseInt(r.id.slice(4), 10))
      .filter(n => !isNaN(n));
    if (nums.length === 0) return 'CFA-01';
    const next = Math.max(...nums) + 1;
    return `CFA-${String(next).padStart(2, '0')}`;
  } catch (err) {
    console.error('Error generating next associate ID:', err);
    return 'CFA-01';
  }
}
