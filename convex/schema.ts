import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Onboarding state — written during sign-up flow, read by App.tsx to gate routing.
  userProfiles: defineTable({
    userId: v.id("users"),
    onboardingComplete: v.boolean(),
    habitType: v.optional(v.string()),
    displayName: v.optional(v.string()),
    age: v.optional(v.string()),
    createdAt: v.number(),
    remindersOn: v.optional(v.boolean()),
    panicOn: v.optional(v.boolean()),
    anonymous: v.optional(v.boolean()),
    appLockEnabled: v.optional(v.boolean()),
    avatarStorageId: v.optional(v.id("_storage")),
  }).index("by_userId", ["userId"]),

  // Recovery profile — quit date, addiction type, reasons.
  // Separate from userProfiles so onboarding data and tracker data stay decoupled.
  profiles: defineTable({
    userId: v.id("users"),
    addictionType: v.string(),
    quitDate: v.number(),
    reasonForQuitting: v.string(),
    goal: v.optional(v.string()),
    resistedUrges: v.optional(v.number()),
    // Milestone days (7/30/90/365) for which the vault record prompt has fired.
    promptedVaultMilestones: v.optional(v.array(v.number())),
    // Money tracking — savings are derived client-side from quitDate; never stored as a running total.
    spendingAmount: v.optional(v.number()),
    spendingFrequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    currency: v.optional(v.string()),
    trackingEnabled: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Private "Message to Future You" video vault. Strictly per-user; no sharing surface.
  recordings: defineTable({
    userId: v.id("users"),
    title: v.string(),
    day: v.number(), // recovery day at record time (server-computed)
    durationSeconds: v.number(),
    storageId: v.id("_storage"),
    thumbStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_userId_createdAt", ["userId", "createdAt"]),

  // One check-in per user per calendar day.
  checkIns: defineTable({
    userId: v.id("users"),
    mood: v.string(),
    cravingLevel: v.number(), // 0–10
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  // Each relapse event resets the current streak.
  relapses: defineTable({
    userId: v.id("users"),
    trigger: v.string(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  // Community: topic circles (seeded server-side or user-created).
  circles: defineTable({
    name: v.string(),
    iconKey: v.string(),   // maps to a Lucide icon in the app
    tint: v.string(),      // hex accent colour
    description: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }),

  // Which circles a user has joined.
  circleMemberships: defineTable({
    userId: v.id("users"),
    circleId: v.id("circles"),
    joinedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_circleId", ["circleId"])
    .index("by_userId_circleId", ["userId", "circleId"]),

  // Community posts (wins, milestone announcements, support requests).
  posts: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("post"), v.literal("milestone")),
    circleId: v.optional(v.id("circles")),
    body: v.string(),
    milestone: v.optional(v.string()),  // e.g. "30 days clean"
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_userId", ["userId"])
    .index("by_circleId_createdAt", ["circleId", "createdAt"]),

  // Circle chat messages — real-time per-circle discussion.
  messages: defineTable({
    circleId: v.id("circles"),
    userId: v.id("users"),
    body: v.string(),
    replyToId: v.optional(v.id("messages")),
    createdAt: v.number(),
  }).index("by_circleId_createdAt", ["circleId", "createdAt"]),

  // One cheer per user per post (toggle: insert / delete).
  postCheers: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_postId_userId", ["postId", "userId"])
    .index("by_userId", ["userId"]),
});
