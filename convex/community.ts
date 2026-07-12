/**
 * community.ts — Feed, Circles, and Leaderboard.
 *
 * Frontend usage:
 *   const me       = useQuery(api.community.getMe);
 *   const feed     = useQuery(api.community.getFeed);
 *   const circles  = useQuery(api.community.getCircles);
 *   const leaders  = useQuery(api.community.getLeaders);
 *   const cheer    = useMutation(api.community.cheer);
 *   const join     = useMutation(api.community.toggleJoin);
 *
 *   await cheer({ postId });
 *   await join({ circleId });
 */

import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAuth } from "./lib/auth";
import { calculateCurrentStreak } from "./services/streak";
import { makeHandle } from "./lib/handle";

function relTime(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Circle seeding ────────────────────────────────────────────────────────────
const DEFAULT_CIRCLES = [
  { name: 'Quitting Alcohol', iconKey: 'alcohol', tint: '#2E7DD1' },
  { name: 'Vaping Free',      iconKey: 'vaping',  tint: '#9B6FE4' },
  { name: 'Digital Detox',    iconKey: 'digital', tint: '#14B888' },
  { name: 'Mindful Living',   iconKey: 'mindful', tint: '#F2B23E' },
  { name: 'Better Sleep',     iconKey: 'night',   tint: '#FF6B4A' },
];

export const seedCircles = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const existing = await ctx.db.query("circles").take(1);
    if (existing.length > 0) return;
    const now = Date.now();
    for (const c of DEFAULT_CIRCLES) {
      await ctx.db.insert("circles", { ...c, createdAt: now });
    }
  },
});

// ── Queries ───────────────────────────────────────────────────────────────────

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return { handle: makeHandle(userId) };
  },
});

export const getFeed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(50);

    if (posts.length === 0) return [];

    // Deduplicate author IDs and circle IDs to avoid redundant fetches
    const uniqueUserIds = [...new Set(posts.map((p) => p.userId as string))];
    const uniqueCircleIds = [
      ...new Set(
        posts
          .map((p) => p.circleId as string | undefined)
          .filter((id): id is string => !!id),
      ),
    ];

    // Batch-fetch author streaks, circle names, and per-post cheer data in parallel
    const [userStreaks, circleNames, cheerData] = await Promise.all([
      Promise.all(
        uniqueUserIds.map(async (uid) => {
          const profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", uid as any))
            .unique();
          if (!profile) return [uid, 0] as const;
          const relapses = await ctx.db
            .query("relapses")
            .withIndex("by_userId_createdAt", (q) => q.eq("userId", uid as any))
            .order("asc")
            .take(500);
          return [
            uid,
            calculateCurrentStreak({
              quitDate: profile.quitDate,
              relapseTimestamps: relapses.map((r) => r.createdAt),
            }),
          ] as const;
        }),
      ),
      Promise.all(
        uniqueCircleIds.map(async (cid) => {
          const c = await ctx.db.get(cid as any);
          return [cid, (c as any)?.name ?? "Recovery"] as const;
        }),
      ),
      // MVP: bounded take for cheer count; replace with denormalized counter at scale.
      Promise.all(
        posts.map(async (post) => {
          const [cheers, myCheer] = await Promise.all([
            ctx.db
              .query("postCheers")
              .withIndex("by_postId", (q) => q.eq("postId", post._id))
              .take(1000),
            ctx.db
              .query("postCheers")
              .withIndex("by_postId_userId", (q) =>
                q.eq("postId", post._id).eq("userId", userId),
              )
              .unique(),
          ]);
          return [post._id as string, cheers.length, myCheer !== null] as const;
        }),
      ),
    ]);

    const streakMap = new Map(userStreaks);
    const circleMap = new Map(circleNames);
    const cheerMap = new Map(
      cheerData.map(([id, count, cheered]) => [id, { count, cheered }]),
    );

    return posts.map((post) => ({
      id: post._id as string,
      type: post.type,
      handle: makeHandle(post.userId),
      streak: streakMap.get(post.userId as string) ?? 0,
      circle: post.circleId
        ? (circleMap.get(post.circleId as string) ?? "Recovery")
        : "Recovery",
      time: relTime(post.createdAt),
      body: post.body,
      milestone: post.milestone,
      cheers: cheerMap.get(post._id as string)?.count ?? 0,
      replies: 0,
      cheered: cheerMap.get(post._id as string)?.cheered ?? false,
    }));
  },
});

export const getCircles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const [circles, memberships] = await Promise.all([
      ctx.db.query("circles").take(20),
      ctx.db
        .query("circleMemberships")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(100),
    ]);

    const joinedIds = new Set(memberships.map((m) => m.circleId as string));

    return Promise.all(
      circles.map(async (c) => {
        const memberDocs = await ctx.db
          .query("circleMemberships")
          .withIndex("by_circleId", (q) => q.eq("circleId", c._id))
          .take(10000);

        return {
          id: c._id as string,
          name: c.name,
          iconKey: c.iconKey,
          tint: c.tint,
          members: memberDocs.length,
          activity: "Active",
          joined: joinedIds.has(c._id as string),
        };
      }),
    );
  },
});

export const getLeaders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const profiles = await ctx.db.query("profiles").take(100);

    const entries = await Promise.all(
      profiles.map(async (p) => {
        const relapses = await ctx.db
          .query("relapses")
          .withIndex("by_userId_createdAt", (q) => q.eq("userId", p.userId))
          .order("asc")
          .take(500);

        const streak = calculateCurrentStreak({
          quitDate: p.quitDate,
          relapseTimestamps: relapses.map((r) => r.createdAt),
        });

        return {
          handle: makeHandle(p.userId),
          circle: p.addictionType,
          streak,
          you: p.userId === userId,
        };
      }),
    );

    return entries.sort((a, b) => b.streak - a.streak).slice(0, 10);
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const cheer = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const existing = await ctx.db
      .query("postCheers")
      .withIndex("by_postId_userId", (q) =>
        q.eq("postId", args.postId).eq("userId", userId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("postCheers", {
        postId: args.postId,
        userId,
        createdAt: Date.now(),
      });
    }
  },
});

export const toggleJoin = mutation({
  args: { circleId: v.id("circles") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const existing = await ctx.db
      .query("circleMemberships")
      .withIndex("by_userId_circleId", (q) =>
        q.eq("userId", userId).eq("circleId", args.circleId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("circleMemberships", {
        userId,
        circleId: args.circleId,
        joinedAt: Date.now(),
      });
    }
  },
});

export const createPost = mutation({
  args: {
    type: v.union(v.literal("post"), v.literal("milestone")),
    body: v.string(),
    circleId: v.optional(v.id("circles")),
    milestone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const body = args.body.trim();
    if (!body) throw new ConvexError("Post body cannot be empty");
    if (body.length > 500) throw new ConvexError("Post body must be 500 characters or fewer");
    return ctx.db.insert("posts", { userId, ...args, body, createdAt: Date.now() });
  },
});
