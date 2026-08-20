import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const relapses = await ctx.db
      .query("relapses")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("asc")
      .take(2000);

    const relapseTimestamps = relapses.map((r) => r.createdAt);
    const totalRelapses = relapses.length;

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

    const allCheckIns = await ctx.db
      .query("checkIns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(10000);
    const totalCheckIns = allCheckIns.length;

    const todayCheckIn = await ctx.db
      .query("checkIns")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", todayStart()),
      )
      .filter((q) => q.lte(q.field("createdAt"), todayEnd()))
      .first();

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
      lastCelebratedShareDay: profile?.lastCelebratedShareDay ?? null,
      referralUrl: `https://stopper.app/u/${userId.slice(0, 8)}`,
    };
  },
});
