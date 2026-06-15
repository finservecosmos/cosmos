import { describe, it, expect } from 'vitest';
import { formatAmountLakhs, formatDateDisplay } from '../shared/lib/utils';

describe('formatAmountLakhs', () => {
  it('formats numeric amounts to Indian Lakhs format', () => {
    expect(formatAmountLakhs(500000)).toBe('₹5.0L');
    expect(formatAmountLakhs(250000)).toBe('₹2.5L');
    expect(formatAmountLakhs(0)).toBe('₹0.0L');
    expect(formatAmountLakhs(NaN)).toBe('₹0.0L');
  });
});

describe('formatDateDisplay', () => {
  it('formats YYYY-MM-DD date strings into standard display format', () => {
    expect(formatDateDisplay('2026-06-20')).toBe('20 Jun 2026');
  });

  it('returns placeholder dash for empty date strings', () => {
    expect(formatDateDisplay(null)).toBe('—');
    expect(formatDateDisplay('')).toBe('—');
  });

  it('returns original input if date parsing fails', () => {
    expect(formatDateDisplay('invalid-date')).toBe('invalid-date');
  });
});
