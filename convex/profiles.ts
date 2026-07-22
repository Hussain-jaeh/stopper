/**
 * profiles.ts — Recovery profile CRUD.
 *
 * One profile per user. Contains addiction type, quit date, and reasons.
 * Distinct from userProfiles (which stores onboarding/app state).
 *
 * Frontend usage:
 *   const profile = useQuery(api.profiles.getProfile);
 *   const create  = useMutation(api.profiles.createProfile);
 *   const update  = useMutation(api.profiles.updateProfile);
 *
 *   await create({ addictionType: "alcohol", quitDate: Date.now(), reasonForQuitting: "family" });
 *   await update({ goal: "Stay clean for 90 days" });
 */

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";
import {
  createProfileArgs,
  updateProfileArgs,
  validateCreateProfile,
  validateUpdateProfile,
} from "./validators/profile";

export const createProfile = mutation({
  args: createProfileArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    validateCreateProfile(args);

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) throw new ConvexError("Duplicate profile");

    const now = Date.now();
    return ctx.db.insert("profiles", { userId, ...args, createdAt: now, updatedAt: now });
  },
});

export const updateProfile = mutation({
  args: updateProfileArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    validateUpdateProfile(args);

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) throw new ConvexError("Profile not found");

    await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
  },
});

export const upsertProfile = mutation({
  args: {
    ...createProfileArgs,
    spendingAmount: v.optional(v.number()),
    spendingFrequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    currency: v.optional(v.string()),
    trackingEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const { spendingAmount, spendingFrequency, currency, trackingEnabled, ...profileArgs } = args;
    validateCreateProfile(profileArgs);

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const spendingFields = {
      ...(spendingAmount !== undefined && { spendingAmount }),
      ...(spendingFrequency !== undefined && { spendingFrequency }),
      ...(currency !== undefined && { currency }),
      ...(trackingEnabled !== undefined && { trackingEnabled }),
    };

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...profileArgs, ...spendingFields, updatedAt: now });
    } else {
      await ctx.db.insert("profiles", { userId, ...profileArgs, ...spendingFields, createdAt: now, updatedAt: now });
    }
  },
});

export const updateSpending = mutation({
  args: {
    spendingAmount: v.optional(v.number()),
    spendingFrequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    currency: v.optional(v.string()),
    trackingEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!existing) throw new ConvexError("Profile not found");
    await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const markShareMilestoneCelebrated = mutation({
  args: { day: v.number() },
  handler: async (ctx, { day }) => {
    const userId = await requireAuth(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;
    if (profile.lastCelebratedShareDay === day) return null;
    await ctx.db.patch(profile._id, { lastCelebratedShareDay: day, updatedAt: Date.now() });
    return day;
  },
});
