"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useDebounce } from "@/lib/hooks/use-debounce";

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

export function JournalList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const entries = useQuery(api.functions.mental.getJournalEntries, {
    searchTerm: debouncedSearch || undefined,
  });

  if (!entries) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por titulo, contenido o tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {entries.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No hay entradas de journal.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const data = entry.data as any;
            const moodEmoji = data.mood ? MOOD_EMOJIS[data.mood] ?? "" : "";
            const preview =
              data.content?.length > 100
                ? data.content.substring(0, 100) + "..."
                : data.content;

            return (
              <Link
                key={entry._id}
                href={`/dashboard/mental/journal/${entry._id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">
                    {data.title?.length > 60
                      ? data.title.substring(0, 60) + "..."
                      : data.title}
                  </h3>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.timestamp), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{preview}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {data.mood && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {moodEmoji} {data.mood}
                    </Badge>
                  )}
                  {data.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
