/**
 * dashboard.ts — Single query that powers the home screen.
 *
 * The frontend calls exactly one query to get everything it needs to render
 * the dashboard. Aggregation happens server-side so the client stays simple.
 *
 * Frontend usage:
 *   const data = useQuery(api.dashboard.getDashboard);
 *   if (!data) return <LoadingScreen />;
 *   const { currentStreak, profile, todayCheckedIn, ... } = data;
 */

import { query } from "./_generated/server";
import { requireAuth } from "./lib/auth";
import { todayStart, todayEnd } from "./lib/dates";
import {
  calculateCurrentStreak,
  calculateDaysSinceQuit,
  calculateLongestStreak,
  calculateNextMilestone,
} from "./services/streak";

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    // ── Profile ──────────────────────────────────────────────────────────────
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    // ── Relapses (all, for streak maths) ─────────────────────────────────────
    const relapses = await ctx.db
      .query("relapses")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    const relapseTimestamps = relapses.map((r) => r.createdAt);
    const totalRelapses = relapses.length;

    // ── Streak calculations ───────────────────────────────────────────────────
    let currentStreak = 0;
    let longestStreak = 0;
    let daysSinceQuit = 0;
    let nextMilestone = 1;

    if (profile) {
      const streakInput = { quitDate: profile.quitDate, relapseTimestamps };
      currentStreak = calculateCurrentStreak(streakInput);
      longestStreak = calculateLongestStreak(streakInput);
      daysSinceQuit = calculateDaysSinceQuit(profile.quitDate);
      nextMilestone = calculateNextMilestone(currentStreak);
    }

    // ── Check-ins ─────────────────────────────────────────────────────────────
    const totalCheckIns = (
      await ctx.db
        .query("checkIns")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect()
    ).length;

    const todayCheckIn = await ctx.db
      .query("checkIns")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", todayStart()),
      )
      .filter((q) => q.lte(q.field("createdAt"), todayEnd()))
      .first();

    // Craving average over the last 30 check-ins
    const recentCheckIns = await ctx.db
      .query("checkIns")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);

    const cravingAverage =
      recentCheckIns.length > 0
        ? Math.round(
            (recentCheckIns.reduce((sum, c) => sum + c.cravingLevel, 0) /
              recentCheckIns.length) *
              10,
          ) / 10
        : 0;

    // Fetch display name from userProfiles table
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const avatarUri = userProfile?.avatarStorageId
      ? await ctx.storage.getUrl(userProfile.avatarStorageId)
      : null;

    return {
      profile,
      name: userProfile?.displayName ?? null,
      avatarUri,
      currentStreak,
      longestStreak,
      daysSinceQuit,
      nextMilestone,
      totalCheckIns,
      totalRelapses,
      todayCheckedIn: todayCheckIn !== null,
      cravingAverage,
    };
  },
});
