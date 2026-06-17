/**
 * relapses.ts — Relapse event log.
 *
 * Each logged relapse resets the current streak counter. Recording the trigger
 * helps identify patterns over time.
 *
 * Frontend usage:
 *   const history = useQuery(api.relapses.getRelapses, { paginationOpts: { numItems: 20, cursor: null } });
 *   const log     = useMutation(api.relapses.logRelapse);
 *
 *   await log({ trigger: "stress at work", note: "Had a tough meeting." });
 */

import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";
import { relapseArgs, validateRelapse } from "./validators/relapse";

export const logRelapse = mutation({
  args: relapseArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    validateRelapse(args);

    return ctx.db.insert("relapses", { userId, ...args, createdAt: Date.now() });
  },
});

/** Paginated relapse history, newest first. */
export const getRelapses = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    return ctx.db
      .query("relapses")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
