import {
  addDaysToKey,
  compareDateKeys,
  dayOfWeekForKey,
  formatDateKey,
  getMonthGridKeys,
  parseDateKey,
} from './dateUtils';

describe('formatDateKey / parseDateKey', () => {
  it('round-trips a date key', () => {
    expect(formatDateKey(parseDateKey('2026-09-24'))).toBe('2026-09-24');
  });

  it('round-trips a date key that falls on a DST transition day', () => {
    // 2024-03-10 is the US spring-forward transition.
    expect(formatDateKey(parseDateKey('2024-03-10'))).toBe('2024-03-10');
    // 2024-11-03 is the US fall-back transition.
    expect(formatDateKey(parseDateKey('2024-11-03'))).toBe('2024-11-03');
  });
});

describe('addDaysToKey', () => {
  it('advances by exactly one calendar day across a spring-forward DST transition', () => {
    expect(addDaysToKey('2024-03-09', 1)).toBe('2024-03-10');
    expect(addDaysToKey('2024-03-10', 1)).toBe('2024-03-11');
  });

  it('advances by exactly one calendar day across a fall-back DST transition', () => {
    expect(addDaysToKey('2024-11-02', 1)).toBe('2024-11-03');
    expect(addDaysToKey('2024-11-03', 1)).toBe('2024-11-04');
  });

  it('rolls over a month boundary', () => {
    expect(addDaysToKey('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('rolls over a non-leap-year February', () => {
    expect(addDaysToKey('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('rolls over a leap-year February', () => {
    expect(addDaysToKey('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDaysToKey('2024-02-29', 1)).toBe('2024-03-01');
  });

  it('rolls over a year boundary', () => {
    expect(addDaysToKey('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('supports negative offsets', () => {
    expect(addDaysToKey('2026-09-24', -1)).toBe('2026-09-23');
  });
});

describe('compareDateKeys', () => {
  it('orders chronologically', () => {
    expect(compareDateKeys('2026-09-20', '2026-09-24')).toBeLessThan(0);
    expect(compareDateKeys('2026-09-24', '2026-09-20')).toBeGreaterThan(0);
    expect(compareDateKeys('2026-09-24', '2026-09-24')).toBe(0);
  });
});

describe('dayOfWeekForKey', () => {
  it('matches the well-known Unix epoch weekday (Thursday)', () => {
    expect(dayOfWeekForKey('1970-01-01')).toBe(4);
  });

  it('increments by one (mod 7) for each consecutive day', () => {
    const base = dayOfWeekForKey('2026-09-24');
    for (let i = 1; i <= 10; i++) {
      expect(dayOfWeekForKey(addDaysToKey('2026-09-24', i))).toBe((base + i) % 7);
    }
  });
});

describe('getMonthGridKeys', () => {
  it('includes the first and last day of the month', () => {
    const grid = getMonthGridKeys(2026, 8); // September 2026 (0-indexed month)
    expect(grid).toContain('2026-09-01');
    expect(grid).toContain('2026-09-30');
  });

  it('starts on a Sunday and ends on a Saturday', () => {
    const grid = getMonthGridKeys(2026, 8);
    expect(dayOfWeekForKey(grid[0])).toBe(0);
    expect(dayOfWeekForKey(grid[grid.length - 1])).toBe(6);
  });

  it('has a length that is a multiple of 7 with no gaps', () => {
    const grid = getMonthGridKeys(2026, 8);
    expect(grid.length % 7).toBe(0);
    for (let i = 1; i < grid.length; i++) {
      expect(addDaysToKey(grid[i - 1], 1)).toBe(grid[i]);
    }
  });

  it('handles a February grid correctly', () => {
    const grid = getMonthGridKeys(2026, 1); // February 2026
    expect(grid).toContain('2026-02-01');
    expect(grid).toContain('2026-02-28');
  });
});
