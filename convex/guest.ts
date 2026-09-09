import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAuth } from "./lib/auth";
import { Id } from "./_generated/dataModel";

const TICKET_TTL_MS = 15 * 60 * 1000;

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Whether the caller is using Stopper as a guest (no registration) and, if not,
 * the identity they registered with. Drives the "Create an account" prompts.
 */
export const getAccountStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      isGuest: user.isAnonymous === true,
      email: user.email ?? null,
      name: user.name ?? null,
    };
  },
});

/**
 * Step 1 of the guest upgrade. Called while still signed in as the guest, so
 * only the guest themselves can authorise the handoff. The client holds the
 * returned token in memory for the length of the sign-in flow.
 */
export const issueMigrationTicket = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const user = await ctx.db.get(userId);
    if (!user?.isAnonymous) throw new ConvexError("NotAGuestAccount");

    // One live ticket per guest.
    const existing = await ctx.db
      .query("migrationTickets")
      .withIndex("by_fromUserId", (q) => q.eq("fromUserId", userId))
      .collect();
    await Promise.all(existing.map((t) => ctx.db.delete(t._id)));

    const token = randomToken();
    await ctx.db.insert("migrationTickets", {
      token,
      fromUserId: userId,
      expiresAt: Date.now() + TICKET_TTL_MS,
      createdAt: Date.now(),
    });

    return token;
  },
});

/**
 * Step 2 of the guest upgrade. Once the user has registered, this moves
 * everything they built as a guest onto the new account and retires the guest
 * record — so choosing to register later costs them nothing.
 *
 * Only personal recovery data is moved. Community content is not: posting
 * requires an account, so a guest has none.
 */
export const redeemMigrationTicket = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const toUserId = await requireAuth(ctx);

    const ticket = await ctx.db
      .query("migrationTickets")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!ticket) throw new ConvexError("InvalidTicket");

    const fromUserId = ticket.fromUserId;
    const expired = ticket.expiresAt < Date.now();
    await ctx.db.delete(ticket._id);

    if (expired) throw new ConvexError("ExpiredTicket");
    if (fromUserId === toUserId) return { migrated: false };

    const fromUser = await ctx.db.get(fromUserId);
    if (!fromUser?.isAnonymous) throw new ConvexError("NotAGuestAccount");

    const [guestUserProfile, guestRecovery, targetUserProfile, targetRecovery] =
      await Promise.all([
        ctx.db.query("userProfiles").withIndex("by_userId", (q) => q.eq("userId", fromUserId)).unique(),
        ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", fromUserId)).unique(),
        ctx.db.query("userProfiles").withIndex("by_userId", (q) => q.eq("userId", toUserId)).unique(),
        ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", toUserId)).unique(),
      ]);

    // The guest's history is the real one — it replaces the empty shell a
    // freshly registered account starts with.
    if (guestUserProfile) {
      if (targetUserProfile) await ctx.db.delete(targetUserProfile._id);
      await ctx.db.patch(guestUserProfile._id, { userId: toUserId });
    }
    if (guestRecovery) {
      if (targetRecovery) await ctx.db.delete(targetRecovery._id);
      await ctx.db.patch(guestRecovery._id, { userId: toUserId });
    }

    const [recordings, checkIns, relapses] = await Promise.all([
      ctx.db.query("recordings").withIndex("by_userId_createdAt", (q) => q.eq("userId", fromUserId)).take(500),
      ctx.db.query("checkIns").withIndex("by_userId", (q) => q.eq("userId", fromUserId)).take(5000),
      ctx.db.query("relapses").withIndex("by_userId", (q) => q.eq("userId", fromUserId)).take(2000),
    ]);

    await Promise.all(
      [...recordings, ...checkIns, ...relapses].map((d) =>
        ctx.db.patch(d._id as Id<any>, { userId: toUserId }),
      ),
    );

    // Retire the guest record and its auth rows so nothing dangles.
    const [accounts, sessions] = await Promise.all([
      ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", fromUserId)).collect(),
      ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", fromUserId)).collect(),
    ]);

    for (const session of sessions) {
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();
      await Promise.all(refreshTokens.map((t) => ctx.db.delete(t._id)));
    }

    await Promise.all([
      ...accounts.map((a) => ctx.db.delete(a._id)),
      ...sessions.map((s) => ctx.db.delete(s._id)),
    ]);
    await ctx.db.delete(fromUserId);

    return { migrated: true };
  },
});
