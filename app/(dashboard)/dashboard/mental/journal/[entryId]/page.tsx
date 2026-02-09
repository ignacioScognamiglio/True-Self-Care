"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MentalHealthDisclaimer } from "@/components/wellness/mental/mental-health-disclaimer";

const MOOD_EMOJIS: Record<string, string> = {
  feliz: "\u{1F60A}",
  calmado: "\u{1F60C}",
  neutral: "\u{1F610}",
  triste: "\u{1F622}",
  ansioso: "\u{1F630}",
  enojado: "\u{1F621}",
  estresado: "\u{1F624}",
  agotado: "\u{1F634}",
};

export default function JournalEntryPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = params.entryId as Id<"wellnessEntries">;
  const entry = useQuery(api.functions.mental.getJournalEntry, { entryId });
  const deleteEntry = useMutation(api.functions.mental.deleteJournalEntry);

  if (entry === undefined) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (entry === null) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push("/dashboard/mental/journal")}>
          <ArrowLeft className="mr-2 size-4" />
          Volver
        </Button>
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Entrada no encontrada
        </div>
      </div>
    );
  }

  const data = entry.data as any;
  const moodEmoji = data.mood ? MOOD_EMOJIS[data.mood] ?? "" : "";

  async function handleDelete() {
    try {
      await deleteEntry({ entryId });
      toast.success("Entrada eliminada");
      router.push("/dashboard/mental/journal");
    } catch {
      toast.error("Error al eliminar la entrada");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/mental/journal")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Volver
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 size-4" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar entrada</AlertDialogTitle>
              <AlertDialogDescription>
                Estas seguro de que queres eliminar esta entrada? Esta accion no
                se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <MentalHealthDisclaimer />

      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {new Date(entry.timestamp).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.prompt && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
              <span className="font-medium">Prompt:</span> {data.prompt}
            </div>
          )}

          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {data.content}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {data.mood && (
              <Badge variant="outline" className="capitalize">
                {moodEmoji} {data.mood}
              </Badge>
            )}
            {data.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
