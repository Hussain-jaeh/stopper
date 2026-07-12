import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { requireAuth } from "./lib/auth";
import { calculateCurrentStreak } from "./services/streak";
import {
  saveRecordingArgs,
  validateSaveRecording,
  validateTitle,
  VAULT_MILESTONES,
} from "./validators/vault";

/** Current recovery day — same recipe as panic.getContext / dashboard streak. */
async function currentRecoveryDay(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  const relapses = await ctx.db
    .query("relapses")
    .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
    .order("asc")
    .take(2000);

  return calculateCurrentStreak({
    quitDate: profile?.quitDate ?? Date.now(),
    relapseTimestamps: relapses.map((r) => r.createdAt),
  });
}

/** Maps a recordings doc to the client's Recording shape. */
async function toRecording(ctx: QueryCtx | MutationCtx, doc: Doc<"recordings">) {
  const videoUrl = await ctx.storage.getUrl(doc.storageId);
  const thumbUrl = doc.thumbStorageId
    ? await ctx.storage.getUrl(doc.thumbStorageId)
    : null;

  const s = doc.durationSeconds;
  return {
    id: doc._id,
    title: doc.title,
    day: doc.day,
    date: new Date(doc.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    duration: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`,
    ...(videoUrl ? { videoUri: videoUrl } : {}),
    ...(thumbUrl ? { thumbUri: thumbUrl } : {}),
  };
}

/** Loads a recording and asserts the caller owns it. */
async function requireOwnedRecording(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  id: Id<"recordings">,
): Promise<Doc<"recordings">> {
  const doc = await ctx.db.get(id);
  if (!doc || doc.userId !== userId)
    throw new ConvexError("Recording not found");
  return doc;
}

/** Step 1 of upload. URLs are single-use — call once per file (video, thumb). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Step 2 — persists metadata. `day` is computed server-side, never trusted from the client. */
export const saveRecording = mutation({
  args: saveRecordingArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    validateSaveRecording(args);

    const day = await currentRecoveryDay(ctx, userId);

    return await ctx.db.insert("recordings", {
      userId,
      title: "Untitled message",
      day,
      durationSeconds: args.durationSeconds,
      storageId: args.storageId,
      thumbStorageId: args.thumbStorageId,
      createdAt: Date.now(),
    });
  },
});

export const listRecordings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const docs = await ctx.db
      .query("recordings")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(200);

    return await Promise.all(docs.map((doc) => toRecording(ctx, doc)));
  },
});

export const latestRecording = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const doc = await ctx.db
      .query("recordings")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    return doc ? await toRecording(ctx, doc) : null;
  },
});

export const renameRecording = mutation({
  args: { id: v.id("recordings"), title: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    validateTitle(args.title);

    const doc = await requireOwnedRecording(ctx, userId, args.id);
    await ctx.db.patch(doc._id, { title: args.title.trim() });
  },
});

export const deleteRecording = mutation({
  args: { id: v.id("recordings") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const doc = await requireOwnedRecording(ctx, userId, args.id);

    await ctx.storage.delete(doc.storageId);
    if (doc.thumbStorageId) await ctx.storage.delete(doc.thumbStorageId);
    await ctx.db.delete(doc._id);
  },
});

/**
 * Fire-once milestone gate, called after a successful check-in.
 * Returns the milestone day (7/30/90/365) exactly once per milestone, else null.
 * Being a mutation makes the "once" guarantee transactional.
 */
export const claimMilestonePrompt = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    const streak = await currentRecoveryDay(ctx, userId);
    if (!(VAULT_MILESTONES as readonly number[]).includes(streak)) return null;

    const prompted = profile.promptedVaultMilestones ?? [];
    if (prompted.includes(streak)) return null;

    await ctx.db.patch(profile._id, {
      promptedVaultMilestones: [...prompted, streak],
      updatedAt: Date.now(),
    });
    return streak;
  },
});
