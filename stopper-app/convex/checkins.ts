/**
 * checkins.ts — Daily check-in log.
 *
 * One check-in per user per calendar day. Records mood and craving level
 * so the dashboard can show trends and averages.
 *
 * Frontend usage:
 *   const today    = useQuery(api.checkins.getTodayCheckIn);
 *   const history  = useQuery(api.checkins.getCheckIns, { paginationOpts: { numItems: 20, cursor: null } });
 *   const checkIn  = useMutation(api.checkins.createCheckIn);
 *
 *   await checkIn({ mood: "good", cravingLevel: 3, note: "Busy day, managed well." });
 */

import { ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";
import { todayStart, todayEnd } from "./lib/dates";
import { checkInArgs, validateCheckIn } from "./validators/checkin";

export const createCheckIn = mutation({
  args: checkInArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    validateCheckIn(args);

    // Enforce one check-in per calendar day
    const existing = await ctx.db
      .query("checkIns")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", todayStart()),
      )
      .filter((q) => q.lte(q.field("createdAt"), todayEnd()))
      .first();

    if (existing) throw new ConvexError("Already checked in today");

    return ctx.db.insert("checkIns", { userId, ...args, createdAt: Date.now() });
  },
});

/** Returns today's check-in, or null if the user hasn't checked in yet. */
export const getTodayCheckIn = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    return ctx.db
      .query("checkIns")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", todayStart()),
      )
      .filter((q) => q.lte(q.field("createdAt"), todayEnd()))
      .first();
  },
});

/** Paginated check-in history, newest first. */
export const getCheckIns = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    return ctx.db
      .query("checkIns")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
