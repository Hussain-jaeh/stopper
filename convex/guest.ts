import { internalMutation, mutation, query, type QueryCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAuth } from "./lib/auth";
import { Id } from "./_generated/dataModel";

const TICKET_TTL_MS = 15 * 60 * 1000;

/**
 * Whether the user holds a real credential — any auth account that isn't the
 * anonymous provider.
 *
 * Guest-ness was read off users.isAnonymous, which NOTHING in the codebase
 * ever cleared. Registering therefore left the flag set: the Community tab
 * kept showing "Create a free account" to someone who had just made one, and
 * the account prompts stayed armed. Deriving it from the credentials is
 * self-correcting — there is no flag left to forget to clear.
 */
async function hasRealCredential(ctx: QueryCtx, userId: Id<"users">): Promise<boolean> {
  const accounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
    .collect();
  return accounts.some((a) => a.provider !== "anonymous");
}

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

    // Two independent signals, either of which ends guest mode:
    //  - a credential that isn't the anonymous provider, and
    //  - isAnonymous === false, written by redeemMigrationTicket when someone
    //    registers onto their existing record.
    // Deriving from credentials alone regressed the second case: an upgraded
    // guest still carries only an anonymous authAccount, so they stayed gated
    // even though the upgrade had explicitly marked them registered.
    const registered =
      user.isAnonymous === false || (await hasRealCredential(ctx, userId));

    return {
      isGuest: !registered,
      email: user.email ?? null,
      name: user.name ?? null,
      // Diagnostic only — which user the app is actually authenticated as.
      // Without it, "I made an account but I'm still a guest" is unanswerable
      // from the client, because the session may simply never have switched.
      userId,
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

    // Clear the flag on whoever is now signed in. If the provider linked the
    // new credential onto the SAME user record, this is the only thing that
    // ends guest mode — there is nothing to migrate.
    const target = await ctx.db.get(toUserId);
    if (target?.isAnonymous) await ctx.db.patch(toUserId, { isAnonymous: false });

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

    // Only true for a NEW registration, where the target is an empty shell.
    // A guest who taps "Create an account" and then "Sign in" lands here with
    // a target that already has a real recovery history — and the code below
    // deletes the target's profile and replaces it with the guest's. Someone
    // who reinstalled, used guest mode for a day and then signed back into an
    // account with a 200-day streak would have had that streak overwritten by
    // the one-day guest record. Migration is abandoned in that case: nothing
    // is moved, nothing is deleted, and the account they signed into is left
    // exactly as it was.
    if (targetRecovery) return { migrated: false, reason: "target-has-history" as const };

    // The guest's history is the real one — it replaces the empty shell a
    // freshly registered account starts with.
    if (guestUserProfile) {
      if (targetUserProfile) await ctx.db.delete(targetUserProfile._id);
      await ctx.db.patch(guestUserProfile._id, { userId: toUserId });
    }
    // targetRecovery is null past the guard above, so there is nothing here
    // to overwrite — the target is a fresh registration.
    if (guestRecovery) {
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

/**
 * Retires anonymous accounts that were created and never used — the residue of
 * people who opened Stopper once and deleted it. Every first launch now mints
 * a user row, so without this the table grows with empties forever.
 *
 * Deliberately conservative. An anonymous user who has been tracking for
 * months without registering is the most committed kind of user, not garbage,
 * so a row survives if it has ANY trace of use: an onboarding profile, a
 * recovery profile, a check-in, a relapse, or a vault recording.
 *
 * Ships with `dryRun` defaulted on: it reports what it would remove without
 * removing anything. Flip the cron to { dryRun: false } once the logged counts
 * look right.
 */
export const sweepAbandonedGuests = internalMutation({
  args: { dryRun: v.optional(v.boolean()), olderThanDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;
    const cutoff = Date.now() - (args.olderThanDays ?? 30) * 24 * 60 * 60 * 1000;

    const candidates = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isAnonymous"), true))
      .take(500);

    let swept = 0;
    let kept = 0;

    for (const user of candidates) {
      if (user._creationTime > cutoff) { kept++; continue; }

      const [userProfile, recovery, checkIn, relapse, recording] = await Promise.all([
        ctx.db.query("userProfiles").withIndex("by_userId", (q) => q.eq("userId", user._id)).first(),
        ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", user._id)).first(),
        ctx.db.query("checkIns").withIndex("by_userId", (q) => q.eq("userId", user._id)).first(),
        ctx.db.query("relapses").withIndex("by_userId", (q) => q.eq("userId", user._id)).first(),
        ctx.db.query("recordings").withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id)).first(),
      ]);

      if (userProfile || recovery || checkIn || relapse || recording) { kept++; continue; }

      // Belt and braces: isAnonymous is a flag, and a stale one previously
      // survived registration. This mutation DELETES accounts, so it checks
      // the credentials directly before touching anything.
      if (await hasRealCredential(ctx, user._id)) { kept++; continue; }

      swept++;
      if (dryRun) continue;

      const [accounts, sessions] = await Promise.all([
        ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", user._id)).collect(),
        ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", user._id)).collect(),
      ]);

      for (const session of sessions) {
        const tokens = await ctx.db
          .query("authRefreshTokens")
          .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
          .collect();
        await Promise.all(tokens.map((t) => ctx.db.delete(t._id)));
      }

      await Promise.all([
        ...accounts.map((a) => ctx.db.delete(a._id)),
        ...sessions.map((s) => ctx.db.delete(s._id)),
      ]);
      await ctx.db.delete(user._id);
    }

    console.log(
      `[sweepAbandonedGuests] dryRun=${dryRun} scanned=${candidates.length} ` +
      `${dryRun ? "would remove" : "removed"}=${swept} kept=${kept}`,
    );
    return { dryRun, scanned: candidates.length, swept, kept };
  },
});

/**
 * Fire-once gate for the "create an account" offers.
 *
 * Returns true at most once per prompt id, and only for someone who has not
 * registered — there is nothing to offer an account holder. Being a mutation
 * makes the "once" guarantee transactional, the same way
 * vault.claimMilestonePrompt does.
 *
 * Claim only at the moment you can actually show the prompt: claiming burns
 * it whether or not anything is rendered.
 */
export const claimAccountPrompt = mutation({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const userId = await requireAuth(ctx);

    const promptUser = await ctx.db.get(userId);
    if (promptUser?.isAnonymous === false) return false;
    if (await hasRealCredential(ctx, userId)) return false;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return false;

    const seen = profile.accountPromptsSeen ?? [];
    if (seen.includes(prompt)) return false;

    await ctx.db.patch(profile._id, { accountPromptsSeen: [...seen, prompt] });
    return true;
  },
});
