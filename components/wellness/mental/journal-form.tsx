"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

const journalSchema = z.object({
  title: z.string().min(1, "El titulo es obligatorio").max(200),
  content: z
    .string()
    .min(10, "El contenido debe tener al menos 10 caracteres")
    .max(5000),
});

type FormData = z.infer<typeof journalSchema>;

interface JournalFormProps {
  initialPrompt?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function JournalForm({ initialPrompt, onSuccess, onCancel }: JournalFormProps) {
  const createEntry = useMutation(api.functions.mental.createJournalEntryPublic);
  const moodSummary = useQuery(api.functions.mental.getTodayMoodSummaryPublic);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  async function onSubmit(data: FormData) {
    try {
      await createEntry({
        journal: {
          title: data.title,
          content: data.content,
          prompt: initialPrompt || undefined,
          mood: moodSummary?.latestMood ?? undefined,
          tags: tags.length > 0 ? tags : undefined,
        },
      });
      toast.success("Entrada de journal creada");
      onSuccess?.();
    } catch {
      toast.error("Error al crear la entrada");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {initialPrompt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <span className="font-medium">Prompt:</span> {initialPrompt}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Titulo</Label>
        <Input
          id="title"
          placeholder="Ej: Reflexion de hoy..."
          aria-required="true"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenido</Label>
        <Textarea
          id="content"
          placeholder="Escribi lo que sientas..."
          rows={10}
          aria-required="true"
          {...register("content")}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (opcional)</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Agregar tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Agregar
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1"
                  aria-label="Eliminar etiqueta"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar entrada"}
        </Button>
      </div>
    </form>
  );
}
