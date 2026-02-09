"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Loader2, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export interface FoodAnalysis {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  mealType: string;
  storageId: string;
}

interface FoodPhotoUploadProps {
  onAnalysisComplete: (result: FoodAnalysis) => void;
  onCancel?: () => void;
}

type UploadState = "idle" | "preview" | "uploading" | "analyzing" | "error";

export function FoodPhotoUpload({
  onAnalysisComplete,
  onCancel,
}: FoodPhotoUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoId, setPhotoId] = useState<Id<"progressPhotos"> | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.functions.files.generateUploadUrl);
  const analyzeFoodPhoto = useMutation(
    api.functions.foodAnalysis.analyzeFoodPhotoPublic
  );

  const analysisResult = useQuery(
    api.functions.foodAnalysis.getFoodAnalysisResult,
    photoId ? { photoId } : "skip"
  );

  // When analysis result arrives, forward it
  if (analysisResult?.aiAnalysis && state === "analyzing") {
    const analysis = analysisResult.aiAnalysis;
    if (analysis.error) {
      setError(analysis.error);
      setState("error");
    } else {
      setState("idle");
      onAnalysisComplete(analysis as FoodAnalysis);
    }
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;

      if (!selected.type.startsWith("image/")) {
        toast.error("Por favor selecciona una imagen");
        return;
      }

      // Max 10MB
      if (selected.size > 10 * 1024 * 1024) {
        toast.error("La imagen no puede superar 10MB");
        return;
      }

      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setState("preview");
      setError(null);
    },
    []
  );

  const handleAnalyze = async () => {
    if (!file) return;

    try {
      setState("uploading");

      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Error al subir la foto");

      const { storageId } = await result.json();

      setState("analyzing");
      const id = await analyzeFoodPhoto({ storageId });
      setPhotoId(id);
    } catch (e) {
      console.error("Upload error:", e);
      setError("Error al subir la foto. Intenta de nuevo.");
      setState("error");
    }
  };

  const handleCancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setState("idle");
    setError(null);
    setPhotoId(null);
  };

  const handleRetry = () => {
    handleCancel();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Idle state: show action buttons */}
        {state === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-wellness-nutrition/10 p-4">
              <Camera className="size-8 text-wellness-nutrition" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Toma o sube una foto de tu comida para analizar su contenido
              nutricional
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="size-4" />
                Tomar foto
              </Button>
              <Button
                variant="outline"
                onClick={() => galleryInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="size-4" />
                Subir imagen
              </Button>
            </div>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        )}

        {/* Preview state: show selected image */}
        {state === "preview" && preview && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={preview}
                alt="Vista previa de comida"
                className="max-h-64 rounded-lg object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 size-7 rounded-full"
                onClick={handleCancel}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAnalyze} className="gap-2">
                <Camera className="size-4" />
                Analizar comida
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Uploading state */}
        {state === "uploading" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="size-8 animate-spin text-wellness-nutrition" />
            <p className="text-sm text-muted-foreground">Subiendo foto...</p>
          </div>
        )}

        {/* Analyzing state */}
        {state === "analyzing" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="size-8 animate-spin text-wellness-nutrition" />
            <p className="text-sm text-muted-foreground">
              Analizando comida con IA...
            </p>
            <p className="text-xs text-muted-foreground">
              Esto puede tomar unos segundos
            </p>
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <p className="text-center text-sm text-destructive">
              {error ?? "Error desconocido"}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRetry} className="gap-2">
                Reintentar
              </Button>
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
