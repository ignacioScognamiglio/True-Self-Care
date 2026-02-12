"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
}: PhotoUploadDialogProps) {
  const generateUploadUrl = useMutation(api.functions.files.generateUploadUrl);
  const uploadPhoto = useMutation(api.functions.progress.uploadProgressPhoto);
  const type = "body" as const;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Selecciona una imagen");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("La imagen no puede superar 10MB");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      await uploadPhoto({ storageId, type });
      toast.success("Foto subida");
      handleClose();
    } catch {
      toast.error("Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir foto de progreso</DialogTitle>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="space-y-4 py-2">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Vista previa"
                className="w-full max-h-64 rounded-lg object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 size-7 rounded-full"
                onClick={() => {
                  URL.revokeObjectURL(preview);
                  setFile(null);
                  setPreview(null);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-4" />
                Seleccionar imagen
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Camera className="mr-2 size-4" />
            )}
            Subir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
