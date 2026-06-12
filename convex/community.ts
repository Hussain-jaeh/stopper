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
import { v } from "convex/values";
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

    const result = [];
    for (const post of posts) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", post.userId))
        .unique();

      let streak = 0;
      if (profile) {
        const relapses = await ctx.db
          .query("relapses")
          .withIndex("by_userId_createdAt", (q) => q.eq("userId", post.userId))
          .order("asc")
          .take(500);
        streak = calculateCurrentStreak({
          quitDate: profile.quitDate,
          relapseTimestamps: relapses.map((r) => r.createdAt),
        });
      }

      let circle = "Recovery";
      if (post.circleId) {
        const c = await ctx.db.get(post.circleId);
        if (c) circle = c.name;
      }

      // MVP: bounded take for cheer count; replace with denormalized counter at scale.
      const cheers = await ctx.db
        .query("postCheers")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .take(1000);

      const myCheer = await ctx.db
        .query("postCheers")
        .withIndex("by_postId_userId", (q) =>
          q.eq("postId", post._id).eq("userId", userId),
        )
        .unique();

      result.push({
        id: post._id as string,
        type: post.type,
        handle: makeHandle(post.userId),
        streak,
        circle,
        time: relTime(post.createdAt),
        body: post.body,
        milestone: post.milestone,
        cheers: cheers.length,
        replies: 0,
        cheered: myCheer !== null,
      });
    }

    return result;
  },
});

export const getCircles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const circles = await ctx.db.query("circles").take(20);
    const memberships = await ctx.db
      .query("circleMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(100);

    const joinedIds = new Set(memberships.map((m) => m.circleId as string));

    const result = [];
    for (const c of circles) {
      const memberDocs = await ctx.db
        .query("circleMemberships")
        .withIndex("by_circleId", (q) => q.eq("circleId", c._id))
        .take(10000);

      result.push({
        id: c._id as string,
        name: c.name,
        iconKey: c.iconKey,
        tint: c.tint,
        members: memberDocs.length,
        activity: "Active",
        joined: joinedIds.has(c._id as string),
      });
    }

    return result;
  },
});

export const getLeaders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const profiles = await ctx.db.query("profiles").take(100);

    const entries = [];
    for (const p of profiles) {
      const relapses = await ctx.db
        .query("relapses")
        .withIndex("by_userId_createdAt", (q) => q.eq("userId", p.userId))
        .order("asc")
        .take(500);

      const streak = calculateCurrentStreak({
        quitDate: p.quitDate,
        relapseTimestamps: relapses.map((r) => r.createdAt),
      });

      entries.push({
        handle: makeHandle(p.userId),
        circle: p.addictionType,
        streak,
        you: p.userId === userId,
      });
    }

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
    return ctx.db.insert("posts", { userId, ...args, createdAt: Date.now() });
  },
});
