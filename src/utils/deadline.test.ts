import { describe, expect, it } from 'vitest';
import { isOverdue } from './deadline';

describe('isOverdue', () => {
  it('is true when deadline is before today', () => {
    expect(isOverdue('2026-01-01', '2026-08-20')).toBe(true);
  });

  it('is false when deadline is today', () => {
    expect(isOverdue('2026-08-20', '2026-08-20')).toBe(false);
  });

  it('is false when deadline is after today', () => {
    expect(isOverdue('2026-12-31', '2026-08-20')).toBe(false);
  });

  it('is false when deadline is missing', () => {
    expect(isOverdue(null, '2026-08-20')).toBe(false);
  });
});
