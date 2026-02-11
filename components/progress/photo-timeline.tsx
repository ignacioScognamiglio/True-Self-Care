"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, ImageIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { PhotoUploadDialog } from "./photo-upload-dialog";
import { BeforeAfterComparison } from "./before-after-comparison";
import { Id } from "@/convex/_generated/dataModel";

const TYPE_LABELS: Record<string, string> = {
  skin: "Piel",
  body: "Cuerpo",
  food: "Comida",
};

export function PhotoTimeline() {
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const photos = useQuery(api.functions.progress.getProgressPhotos, {
    type:
      filter === "all"
        ? undefined
        : (filter as "skin" | "body" | "food"),
  });
  const deletePhoto = useMutation(api.functions.progress.deleteProgressPhoto);

  const handleDelete = async (photoId: Id<"progressPhotos">) => {
    try {
      await deletePhoto({ photoId });
      toast.success("Foto eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fotos de progreso</h3>
        <Button
          size="sm"
          onClick={() => setShowUpload(true)}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Subir foto
        </Button>
      </div>

      <BeforeAfterComparison />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Todas
              </TabsTrigger>
              <TabsTrigger value="body" className="flex-1">
                Cuerpo
              </TabsTrigger>
              <TabsTrigger value="skin" className="flex-1">
                Piel
              </TabsTrigger>
              <TabsTrigger value="food" className="flex-1">
                Comida
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {!photos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <ImageIcon className="size-8" />
              <p className="text-sm">No hay fotos aun</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo._id}
                  className="group relative overflow-hidden rounded-lg border"
                >
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={TYPE_LABELS[photo.type] ?? photo.type}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-muted">
                      <ImageIcon className="size-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0"
                        >
                          {TYPE_LABELS[photo.type] ?? photo.type}
                        </Badge>
                        <p className="text-[10px] text-white/70 mt-0.5">
                          {format(photo.timestamp, "d MMM yyyy", {
                            locale: es,
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        onClick={() => handleDelete(photo._id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PhotoUploadDialog open={showUpload} onOpenChange={setShowUpload} />
    </div>
  );
}
