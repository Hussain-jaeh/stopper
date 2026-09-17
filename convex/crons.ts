import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Anonymous accounts are created on first launch now, so abandoned ones
 * accumulate. Runs in report-only mode — check the logs for a week, then set
 * dryRun to false once the counts look sane.
 */
crons.daily(
  "sweep abandoned guest accounts",
  { hourUTC: 3, minuteUTC: 30 },
  internal.guest.sweepAbandonedGuests,
  { dryRun: true, olderThanDays: 30 },
);

export default crons;
