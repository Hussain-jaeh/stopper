/**
 * progress.ts — Progress screen query.
 *
 * Aggregates streak data, calendar heatmap, resistance trend, and a contextual
 * insight from the user's check-in and relapse history.
 *
 * Frontend usage:
 *   const data = useQuery(api.progress.getProgress, { range: 'Month' });
 */

import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { daysBetween } from "./lib/dates";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from "./services/streak";

export const getProgress = query({
  args: {
    range: v.union(v.literal("Week"), v.literal("Month"), v.literal("Year")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return null;

    const relapses = await ctx.db
      .query("relapses")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("asc")
      .take(500);

    const relapseTimestamps = relapses.map((r) => r.createdAt);
    const streakInput = { quitDate: profile.quitDate, relapseTimestamps };

    const cleanDays = calculateCurrentStreak(streakInput);
    const bestStreak = calculateLongestStreak(streakInput);

    const totalDays = daysBetween(profile.quitDate, Date.now());
    const successRate =
      totalDays > 0
        ? Math.round(
            Math.max(0, (totalDays - relapses.length) / totalDays) * 100,
          )
        : 100;

    // One read serves three things below: the trend (14), the craving average
    // (30) and the total count.
    const allCheckIns = await ctx.db
      .query("checkIns")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5000);

    const totalCheckIns = allCheckIns.length;

    const averageWindow = allCheckIns.slice(0, 30);
    const cravingAverage =
      averageWindow.length > 0
        ? Math.round(
            (averageWindow.reduce((sum, c) => sum + c.cravingLevel, 0) /
              averageWindow.length) *
              10,
          ) / 10
        : 0;

    // Resistance trend: last 14 check-ins, oldest → newest, scaled 0–100.
    const trendValues = [...allCheckIns.slice(0, 14)]
      .reverse()
      .map((c) => Math.max(5, (10 - c.cravingLevel) * 10));

    const padding = Array<number>(Math.max(0, 14 - trendValues.length)).fill(50);
    const trend = [...padding, ...trendValues];

    // Calendar for current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDay = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
    const firstDowJS = new Date(year, month, 1).getDay();
    const monthStartDow = (firstDowJS + 6) % 7; // 0 = Monday
    const monthLabel = now.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const monthRelapses = relapses.filter(
      (r) => r.createdAt >= monthStart && r.createdAt <= monthEnd,
    );
    const relapsesDays = monthRelapses.map((r) => new Date(r.createdAt).getDate());
    const relapsesDaySet = new Set(relapsesDays);

    // First day of this month that counts: the quit day if it falls in this
    // month, day 1 if earlier, past the end if later. Days before it were
    // previously painted "clean", which contradicted a 0-day streak.
    const quit = new Date(profile.quitDate);
    const startDay =
      profile.quitDate < monthStart ? 1
      : quit.getFullYear() === year && quit.getMonth() === month ? quit.getDate()
      : daysInMonth + 1;

    // Completed days only (today is still in progress), matching the streak.
    let calendarCleanDays = 0;
    for (let d = startDay; d < todayDay; d++) {
      if (!relapsesDaySet.has(d)) calendarCleanDays++;
    }

    return {
      cleanDays,
      bestStreak,
      successRate,
      cravingAverage,
      totalCheckIns,
      totalRelapses: relapses.length,
      trend,
      calendar: {
        monthLabel,
        monthStartDow,
        daysInMonth,
        today: todayDay,
        startDay,
        cleanDays: calendarCleanDays,
        relapses: relapsesDays,
      },
      insight: buildInsight(cleanDays, successRate),
    };
  },
});

function buildInsight(
  cleanDays: number,
  successRate: number,
): { title: string; body: string } {
  if (cleanDays >= 90) {
    return {
      title: "90 days — a turning point",
      body: "Research shows cravings drop significantly around this mark. What you've built is real neurological change. Keep protecting it.",
    };
  }
  if (cleanDays >= 30) {
    return {
      title: "A full month strong",
      body: `${cleanDays} days in — your brain's reward pathways are rebuilding. The cravings are getting quieter, even if it doesn't always feel that way.`,
    };
  }
  if (cleanDays >= 7) {
    return {
      title: "One week in",
      body: "The first week is the hardest. You've made it here — that means you have what it takes to keep going. Stay close to your reasons.",
    };
  }
  if (successRate >= 80) {
    return {
      title: "Strong track record",
      body: `${successRate}% of your days have been clean. That's not luck — that's a pattern you've built. Protect it.`,
    };
  }
  return {
    title: "Every day counts",
    body: "Recovery isn't linear. What matters is that you keep showing up. Each clean day rewires a little more.",
  };
}
