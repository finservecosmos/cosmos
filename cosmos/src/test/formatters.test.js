import { describe, it, expect } from 'vitest';
import { maskAadhaar, maskPAN, formatAmount, statusClass } from '../shared/lib/formatters';

describe('maskAadhaar', () => {
  it('masks 12-digit Aadhaar number showing only last 4 digits', () => {
    expect(maskAadhaar('123456789012')).toBe('XXXX-XXXX-9012');
    expect(maskAadhaar('1234 5678 9012')).toBe('XXXX-XXXX-9012');
  });

  it('returns original input for short/empty strings', () => {
    expect(maskAadhaar('')).toBe('');
    expect(maskAadhaar('1234')).toBe('1234');
    expect(maskAadhaar(null)).toBe('');
  });
});

describe('maskPAN', () => {
  it('masks 10-character PAN string', () => {
    expect(maskPAN('ABCDE1234F')).toBe('ABCDE••••F');
  });

  it('handles lowercase input and whitespace', () => {
    expect(maskPAN('abcde1234f')).toBe('ABCDE••••F');
  });

  it('returns original input for short/empty inputs', () => {
    expect(maskPAN('')).toBe('');
    expect(maskPAN('ABC')).toBe('ABC');
    expect(maskPAN(null)).toBe('');
  });
});

describe('formatAmount', () => {
  it('formats amounts into Cr, L, or comma-separated rupees', () => {
    expect(formatAmount(15000000)).toBe('₹1.50Cr');
    expect(formatAmount(250000)).toBe('₹2.5L');
    expect(formatAmount(5000)).toBe('₹5,000');
    expect(formatAmount(0)).toBe('₹0');
    expect(formatAmount(null)).toBe('₹0');
  });
});

describe('statusClass', () => {
  it('converts status strings to badge class names', () => {
    expect(statusClass('Approved')).toBe('status-badge status-approved');
    expect(statusClass('In Progress')).toBe('status-badge status-in-progress');
    expect(statusClass('')).toBe('status-badge status-');
  });
});
