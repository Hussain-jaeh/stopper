/** All timestamps are Unix milliseconds (Date.now() format). */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Returns midnight (00:00:00.000) of the calendar day containing `ts`. */
export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Returns 23:59:59.999 of the calendar day containing `ts`. */
export function endOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/** True when both timestamps fall on the same calendar day. */
export function isSameDay(ts1: number, ts2: number): boolean {
  return startOfDay(ts1) === startOfDay(ts2);
}

/**
 * Number of complete calendar days between two timestamps.
 * daysBetween(yesterday, today) === 1
 * daysBetween(today, today)     === 0
 */
export function daysBetween(fromTs: number, toTs: number): number {
  return Math.max(
    0,
    Math.floor((startOfDay(toTs) - startOfDay(fromTs)) / MS_PER_DAY),
  );
}

/** Midnight of today in the server's local timezone. */
export function todayStart(): number {
  return startOfDay(Date.now());
}

/** End of today (23:59:59.999) in the server's local timezone. */
export function todayEnd(): number {
  return endOfDay(Date.now());
}
