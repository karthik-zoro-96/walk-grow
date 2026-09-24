import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfDay,
  startOfWeek,
} from 'date-fns';

const DATE_KEY_FORMAT = 'yyyy-MM-dd';

/** All date-key helpers operate on the device's local calendar day, never UTC. */
export function formatDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT);
}

export function parseDateKey(dateKey: string): Date {
  return parse(dateKey, DATE_KEY_FORMAT, new Date());
}

export function todayKey(): string {
  return formatDateKey(new Date());
}

export function addDaysToKey(dateKey: string, amount: number): string {
  return formatDateKey(addDays(parseDateKey(dateKey), amount));
}

/** 0 = Sunday .. 6 = Saturday, matching UserSettings.restDays. */
export function dayOfWeekForKey(dateKey: string): number {
  return getDay(parseDateKey(dateKey));
}

/**
 * True local midnight for a date key. Unlike parseDateKey (which keeps the current
 * wall-clock time), this is exact and safe to use as a health-query range boundary.
 */
export function startOfLocalDayForKey(dateKey: string): Date {
  return startOfDay(parseDateKey(dateKey));
}

export function compareDateKeys(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Date keys for a full calendar-grid month view: the given month plus leading/trailing
 * days from adjacent months so the grid always starts on a Sunday and ends on a Saturday.
 */
export function getMonthGridKeys(year: number, month: number /* 0-11 */): string[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = endOfMonth(firstOfMonth);
  const gridStart = startOfWeek(firstOfMonth, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(lastOfMonth, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map(formatDateKey);
}
