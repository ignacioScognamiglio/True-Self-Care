"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PastFoodPhotos } from "./past-food-photos";
import { FoodAnalysisEditor } from "./food-analysis-editor";

export function FoodPhotosSection() {
  const photos = useQuery(api.functions.foodAnalysis.getPastFoodPhotos, {});
  const [editingPhotoId, setEditingPhotoId] = useState<Id<"progressPhotos"> | null>(null);

  const selectedPhoto = editingPhotoId
    ? photos?.find((p) => p._id === editingPhotoId)
    : null;

  const analysis = selectedPhoto?.aiAnalysis as any;
  const editorValues = analysis && !analysis.error
    ? {
        foods: analysis.foods ?? [],
        calories: analysis.calories ?? 0,
        protein: analysis.protein ?? 0,
        carbs: analysis.carbs ?? 0,
        fat: analysis.fat ?? 0,
        description: analysis.description ?? "",
        mealType: analysis.mealType ?? "lunch",
        storageId: selectedPhoto!.storageId,
      }
    : null;

  return (
    <>
      <PastFoodPhotos
        onSelect={(id) => setEditingPhotoId(id as Id<"progressPhotos">)}
      />
      {editingPhotoId && editorValues && (
        <FoodAnalysisEditor
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingPhotoId(null);
          }}
          photoId={editingPhotoId}
          initialValues={editorValues}
          onSaved={() => setEditingPhotoId(null)}
        />
      )}
    </>
  );
}
