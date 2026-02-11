import { v } from "convex/values";
import {
  query,
  mutation,
  internalAction,
  internalMutation,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// ═══ INTERNAL ═══

export const analyzeFoodPhoto = internalAction({
  args: {
    userId: v.id("users"),
    storageId: v.string(),
    photoId: v.id("progressPhotos"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      await ctx.runMutation(
        internal.functions.foodAnalysis.updatePhotoAnalysis,
        {
          photoId: args.photoId,
          analysis: { error: "No se pudo obtener la foto" },
        }
      );
      return;
    }

    try {
      const result = await generateText({
        model: google("gemini-2.5-flash"),
        messages: [
          {
            role: "user",
            content: [
              { type: "image", image: new URL(url) },
              {
                type: "text",
                text: `Analiza esta foto de comida. Responde UNICAMENTE con JSON valido (sin markdown, sin backticks) con este formato exacto:
{"foods": ["alimento1", "alimento2"], "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "description": "descripcion breve de la comida", "mealType": "lunch"}

Donde mealType es uno de: "breakfast", "lunch", "dinner", "snack".
Estima los valores nutricionales lo mas precisamente posible basandote en la imagen.`,
              },
            ],
          },
        ],
      });

      const text = result.text;
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      await ctx.runMutation(
        internal.functions.foodAnalysis.updatePhotoAnalysis,
        {
          photoId: args.photoId,
          analysis: {
            foods: parsed.foods ?? [],
            calories: parsed.calories ?? 0,
            protein: parsed.protein ?? 0,
            carbs: parsed.carbs ?? 0,
            fat: parsed.fat ?? 0,
            description: parsed.description ?? "",
            mealType: parsed.mealType ?? "snack",
            storageId: args.storageId,
          },
        }
      );
    } catch (e) {
      console.error("Food analysis error:", e);
      await ctx.runMutation(
        internal.functions.foodAnalysis.updatePhotoAnalysis,
        {
          photoId: args.photoId,
          analysis: {
            error:
              "Error al analizar la foto. Intenta de nuevo o registra manualmente.",
          },
        }
      );
    }
  },
});

export const updatePhotoAnalysis = internalMutation({
  args: {
    photoId: v.id("progressPhotos"),
    analysis: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.photoId, { aiAnalysis: args.analysis });
  },
});

// ═══ PUBLIC ═══

export const analyzeFoodPhotoPublic = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Save the photo reference
    const photoId = await ctx.db.insert("progressPhotos", {
      userId: user._id,
      type: "food",
      storageId: args.storageId,
      timestamp: Date.now(),
    });

    // Schedule the analysis
    await ctx.scheduler.runAfter(
      0,
      internal.functions.foodAnalysis.analyzeFoodPhoto,
      {
        userId: user._id,
        storageId: args.storageId,
        photoId,
      }
    );

    return photoId;
  },
});

export const getFoodAnalysisResult = query({
  args: { photoId: v.id("progressPhotos") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const photo = await ctx.db.get(args.photoId);
    if (!photo || photo.userId !== user._id) return null;

    return {
      storageId: photo.storageId,
      aiAnalysis: photo.aiAnalysis ?? null,
    };
  },
});

export const getPastFoodPhotos = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const photos = await ctx.db
      .query("progressPhotos")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "food")
      )
      .order("desc")
      .take(args.limit ?? 20);

    const withUrls = await Promise.all(
      photos.map(async (photo) => {
        const url = await ctx.storage.getUrl(photo.storageId);
        return { ...photo, url };
      })
    );

    return withUrls;
  },
});

export const updateFoodPhotoAnalysis = mutation({
  args: {
    photoId: v.id("progressPhotos"),
    analysis: v.object({
      foods: v.array(v.string()),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      description: v.string(),
      mealType: v.string(),
      storageId: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const photo = await ctx.db.get(args.photoId);

    if (!photo || photo.userId !== user._id) {
      throw new Error("Photo not found");
    }

    await ctx.db.patch(args.photoId, { aiAnalysis: args.analysis });
  },
});
