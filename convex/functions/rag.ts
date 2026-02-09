import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { NUTRITION_KNOWLEDGE, EXERCISE_KNOWLEDGE } from "../lib/nutritionData";

// ═══ SEARCH ═══

export const searchKnowledge = internalQuery({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    const results = await ctx.db.query("wellnessKnowledge").collect();

    const filtered = args.category
      ? results.filter((r) => r.category === args.category)
      : results;

    return filtered.slice(0, limit).map((r) => ({
      text: r.text,
      category: r.category,
      subcategory: r.subcategory,
      source: r.source,
    }));
  },
});

// ═══ ADD KNOWLEDGE ═══

export const addKnowledge = internalMutation({
  args: {
    text: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    source: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wellnessKnowledge", {
      text: args.text,
      category: args.category,
      subcategory: args.subcategory,
      source: args.source,
      embedding: args.embedding,
    });
  },
});

// ═══ SEED DATA ═══

export const seedNutritionData = internalAction({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.runQuery(
      internal.functions.rag.searchKnowledge,
      { limit: 1 }
    );
    if (existing.length > 0) {
      console.log("Knowledge base already seeded, skipping.");
      return;
    }

    const allData = [...NUTRITION_KNOWLEDGE, ...EXERCISE_KNOWLEDGE];

    // Zero-vector placeholder — replace with real embeddings when
    // embedding pipeline (Google text-embedding-004) is configured
    const placeholderEmbedding = new Array(1536).fill(0);

    for (const item of allData) {
      await ctx.runMutation(internal.functions.rag.addKnowledge, {
        text: item.text,
        category: item.category,
        subcategory: item.subcategory,
        source: item.source,
        embedding: placeholderEmbedding,
      });
    }

    console.log(`Seeded ${allData.length} knowledge entries.`);
  },
});
