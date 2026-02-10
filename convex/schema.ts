import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ═══ USERS ═══
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    preferences: v.object({
      activeModules: v.array(v.string()),
      unitSystem: v.union(v.literal("metric"), v.literal("imperial")),
      language: v.string(),
      notificationsEnabled: v.boolean(),
      wakeUpTime: v.optional(v.string()),
      bedTime: v.optional(v.string()),
    }),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // ═══ HEALTH PROFILES ═══
  healthProfiles: defineTable({
    userId: v.id("users"),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    skinType: v.optional(v.string()),
    skinConcerns: v.optional(v.array(v.string())),
    dietaryRestrictions: v.optional(v.array(v.string())),
    allergies: v.optional(v.array(v.string())),
    fitnessLevel: v.optional(v.string()),
    healthGoals: v.optional(v.array(v.string())),
    medicalConditions: v.optional(v.array(v.string())),
    googleFitTokens: v.optional(v.object({
      accessToken: v.string(),
      refreshToken: v.string(),
      expiresAt: v.number(),
      scopes: v.array(v.string()),
      connectedAt: v.number(),
    })),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ═══ WELLNESS ENTRIES (polymorphic) ═══
  wellnessEntries: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("mood"),
      v.literal("journal"),
      v.literal("exercise"),
      v.literal("nutrition"),
      v.literal("sleep"),
      v.literal("water"),
      v.literal("skincare"),
      v.literal("weight"),
      v.literal("habit")
    ),
    data: v.any(),
    timestamp: v.number(),
    source: v.union(
      v.literal("manual"),
      v.literal("wearable"),
      v.literal("ai")
    ),
  })
    .index("by_user_type", ["userId", "type"])
    .index("by_user_time", ["userId", "timestamp"])
    .index("by_type_time", ["type", "timestamp"]),

  // ═══ AI-GENERATED PLANS ═══
  aiPlans: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("daily"),
      v.literal("meal"),
      v.literal("workout"),
      v.literal("skincare_routine"),
      v.literal("sleep_routine"),
      v.literal("weekly"),
      v.literal("challenge")
    ),
    content: v.any(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    generatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user_type", ["userId", "type"])
    .index("by_user_status", ["userId", "status"]),

  // ═══ HABITS ═══
  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    category: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("custom")
    ),
    targetPerPeriod: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ═══ PROGRESS PHOTOS ═══
  progressPhotos: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("skin"), v.literal("body"), v.literal("food")),
    storageId: v.string(),
    aiAnalysis: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_user_type", ["userId", "type"])
    .index("by_user_time", ["userId", "timestamp"]),

  // ═══ GOALS ═══
  goals: defineTable({
    userId: v.id("users"),
    category: v.string(),
    title: v.string(),
    targetValue: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    unit: v.optional(v.string()),
    deadline: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused")
    ),
    createdAt: v.number(),
  }).index("by_user_category", ["userId", "category"]),

  // ═══ NOTIFICATIONS ═══
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_read", ["userId", "read"])
    .index("by_user_time", ["userId", "createdAt"]),

  // ═══ GAMIFICATION ═══
  gamification: defineTable({
    userId: v.id("users"),
    totalXP: v.number(),
    level: v.number(),
    currentLevelXP: v.number(),
    xpToNextLevel: v.number(),
    streakFreezes: v.number(),
    lastStreakFreezeUsedAt: v.optional(v.number()),
    lastStreakFreezeEarnedAt: v.optional(v.number()),
    lastXPActionAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_level", ["level"])
    .index("by_total_xp", ["totalXP"]),

  // ═══ ACHIEVEMENTS ═══
  achievements: defineTable({
    userId: v.id("users"),
    code: v.string(),
    earnedAt: v.number(),
    xpAwarded: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_code", ["userId", "code"]),

  // ═══ PUSH SUBSCRIPTIONS ═══
  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),
});
