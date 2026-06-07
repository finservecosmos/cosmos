import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string or text to protect against XSS injection attacks.
 * @param {string} val 
 * @returns {string}
 */
export function sanitizeHtml(val) {
  if (typeof val !== 'string') return val;
  return DOMPurify.sanitize(val);
}

/**
 * Formats a monetary amount into Indian Lakhs (e.g. ₹4.5L).
 * @param {number} amount 
 * @returns {string}
 */
export function formatAmountLakhs(amount) {
  const num = Number(amount) || 0;
  return `₹${(num / 100000).toFixed(1)}L`;
}

/**
 * Formats a date string into standard display format (e.g. 20 Jun 2026).
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return d.toLocaleDateString('en-GB', options);
}
