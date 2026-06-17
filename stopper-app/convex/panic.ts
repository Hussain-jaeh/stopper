import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { calculateCurrentStreak, calculateLongestStreak } from "./services/streak";

/** Context the panic screen needs: streak counts + the user's "why". */
export const getContext = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const relapses = await ctx.db
      .query("relapses")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    const relapseTimestamps = relapses.map((r) => r.createdAt);
    const quitDate = profile?.quitDate ?? Date.now();

    return {
      streak: calculateCurrentStreak({ quitDate, relapseTimestamps }),
      longest: calculateLongestStreak({ quitDate, relapseTimestamps }),
      habit: profile?.addictionType ?? "",
      reason: profile?.reasonForQuitting ?? "",
    };
  },
});

/**
 * Called when the user makes it through a craving without slipping.
 * Increments the resisted-urges counter on their profile — streak is untouched.
 */
export const logResistedUrge = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return;

    await ctx.db.patch(profile._id, {
      resistedUrges: (profile.resistedUrges ?? 0) + 1,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Called on relapse. Inserts a relapse event (which automatically resets
 * currentStreak to 0 in all streak calculations). longestStreak is preserved
 * because it is computed dynamically from the full history.
 */
export const logRelapse = mutation({
  args: { trigger: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const trigger = args.trigger?.trim() || "Not specified";

    await ctx.db.insert("relapses", {
      userId,
      trigger,
      createdAt: Date.now(),
    });
  },
});
