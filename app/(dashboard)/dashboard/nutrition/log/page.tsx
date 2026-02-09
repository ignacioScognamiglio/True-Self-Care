"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { MealLogForm } from "@/components/wellness/nutrition/meal-log-form";
import {
  FoodPhotoUpload,
  type FoodAnalysis,
} from "@/components/wellness/nutrition/food-photo-upload";
import { FoodAnalysisResult } from "@/components/wellness/nutrition/food-analysis-result";

export default function NutritionLogPage() {
  return (
    <Suspense fallback={<div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>}>
      <NutritionLogContent />
    </Suspense>
  );
}

function NutritionLogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get("mode") === "photo" ? "photo" : "manual";

  const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(
    null
  );
  const [prefillData, setPrefillData] = useState<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    description?: string;
  } | null>(null);

  const logMeal = useMutation(api.functions.nutrition.logMealEntryPublic);

  function handleAnalysisComplete(result: FoodAnalysis) {
    setAnalysisResult(result);
  }

  async function handleSaveFromAnalysis() {
    if (!analysisResult) return;
    await logMeal({
      meal: {
        name: analysisResult.description || "Comida analizada con IA",
        calories: analysisResult.calories,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs,
        fat: analysisResult.fat,
        mealType: analysisResult.mealType as any,
        items: analysisResult.foods,
        photoId: analysisResult.storageId,
      },
    });
    toast.success("Comida registrada");
    router.push("/dashboard/nutrition");
  }

  function handleEditFromAnalysis() {
    if (!analysisResult) return;
    setPrefillData({
      name: analysisResult.description || "",
      calories: analysisResult.calories,
      protein: analysisResult.protein,
      carbs: analysisResult.carbs,
      fat: analysisResult.fat,
      mealType: (analysisResult.mealType as any) || "lunch",
      description: analysisResult.foods.join(", "),
    });
    setAnalysisResult(null);
  }

  function handleRetry() {
    setAnalysisResult(null);
  }

  function handleFormSuccess() {
    router.push("/dashboard/nutrition");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/nutrition">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Registrar comida
          </h2>
          <p className="text-muted-foreground">
            Registra tu comida manualmente o con una foto
          </p>
        </div>
      </div>

      {/* If we have prefill data from photo analysis, show form directly */}
      {prefillData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Editar datos de la comida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MealLogForm
              defaultValues={prefillData}
              onSuccess={handleFormSuccess}
              onCancel={() => setPrefillData(null)}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">
              Manual
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex-1">
              Con foto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <MealLogForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => router.push("/dashboard/nutrition")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photo" className="mt-4">
            {analysisResult ? (
              <FoodAnalysisResult
                analysis={analysisResult}
                onSave={handleSaveFromAnalysis}
                onEdit={handleEditFromAnalysis}
                onRetry={handleRetry}
              />
            ) : (
              <FoodPhotoUpload
                onAnalysisComplete={handleAnalysisComplete}
                onCancel={() => router.push("/dashboard/nutrition")}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
