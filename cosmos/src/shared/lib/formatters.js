/**
 * Centralized formatting and masking utilities for Cosmos Finserve
 */

/**
 * Masks an Aadhaar number displaying only the last 4 digits (e.g. XXXX-XXXX-1234).
 * @param {string|number} num 
 * @returns {string}
 */
export function maskAadhaar(num) {
  if (!num) return '';
  const clean = num.toString().replace(/\s+/g, '');
  if (clean.length < 12) return num;
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

/**
 * Masks a PAN number displaying the first 5 characters and last character (e.g. ABCDE••••F).
 * @param {string} pan 
 * @returns {string}
 */
export function maskPAN(pan) {
  if (!pan) return '';
  const clean = pan.toString().toUpperCase().trim();
  if (clean.length < 10) return pan;
  return `${clean.slice(0, 5)}••••${clean.slice(-1)}`;
}

/**
 * Formats a numeric currency value into Indian numbering format (Cr, L, or ₹ Standard).
 * @param {number} n 
 * @returns {string}
 */
export function formatAmount(n) {
  const num = Number(n) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Generates a CSS status badge class name from a status string.
 * @param {string} s 
 * @returns {string}
 */
export function statusClass(s) {
  return 'status-badge status-' + String(s || '').toLowerCase().replace(/\s+/g, '-');
}
