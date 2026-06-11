import { daysBetween } from "../lib/dates";

export interface StreakInput {
  quitDate: number;
  /** Relapse timestamps sorted ascending (oldest first). */
  relapseTimestamps: number[];
}

/**
 * Calendar days elapsed since the user's quit date, regardless of relapses.
 * This represents total time in recovery, not cleanliness.
 */
export function calculateDaysSinceQuit(quitDate: number): number {
  return daysBetween(quitDate, Date.now());
}

/**
 * Days since the most recent relapse (or since quit date if never relapsed).
 * A relapse today yields 0; a relapse yesterday yields 1.
 */
export function calculateCurrentStreak(input: StreakInput): number {
  const { quitDate, relapseTimestamps } = input;

  if (relapseTimestamps.length === 0) {
    return daysBetween(quitDate, Date.now());
  }

  const lastRelapse = relapseTimestamps[relapseTimestamps.length - 1];
  return daysBetween(lastRelapse, Date.now());
}

/**
 * Longest continuous clean period across the entire recovery history.
 * Considers all gaps: quit→first relapse, between relapses, and last relapse→now.
 */
export function calculateLongestStreak(input: StreakInput): number {
  const { quitDate, relapseTimestamps } = input;
  const now = Date.now();

  if (relapseTimestamps.length === 0) {
    return daysBetween(quitDate, now);
  }

  let longest = 0;

  // Gap from quit date to first relapse
  longest = Math.max(longest, daysBetween(quitDate, relapseTimestamps[0]));

  // Gaps between consecutive relapses
  for (let i = 1; i < relapseTimestamps.length; i++) {
    longest = Math.max(
      longest,
      daysBetween(relapseTimestamps[i - 1], relapseTimestamps[i]),
    );
  }

  // Gap from last relapse to now (this is the current streak)
  longest = Math.max(
    longest,
    daysBetween(relapseTimestamps[relapseTimestamps.length - 1], now),
  );

  return longest;
}

/**
 * Recovery percentage based on the 90-day milestone — the most widely cited
 * threshold in addiction recovery where cravings significantly diminish.
 * Capped at 100%.
 */
export function calculateRecoveryPercentage(currentStreak: number): number {
  const TARGET_DAYS = 90;
  return Math.min(100, Math.round((currentStreak / TARGET_DAYS) * 100));
}

// Standard recovery milestones in days.
const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

/**
 * The next milestone (in days) the user is working toward.
 * Beyond 365 days, rounds up to the next full year.
 */
export function calculateNextMilestone(currentStreak: number): number {
  for (const m of MILESTONES) {
    if (m > currentStreak) return m;
  }
  return Math.ceil((currentStreak + 1) / 365) * 365;
}
