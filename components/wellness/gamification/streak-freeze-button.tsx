"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { toast } from "sonner";

export function StreakFreezeButton() {
  const profile = useQuery(api.functions.gamification.getGamificationProfile);
  const useFreeze = useMutation(api.functions.gamification.useStreakFreezePublic);

  const hasFreeze = profile && profile.streakFreezes > 0;

  async function handleUseFreeze() {
    try {
      const result = await useFreeze();
      if (result.success) {
        toast.success("Streak freeze activado! Tu racha esta protegida.");
      } else {
        toast.error("No se pudo usar el streak freeze. Puede estar en cooldown.");
      }
    } catch {
      toast.error("Error al usar el streak freeze");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!hasFreeze}
      onClick={handleUseFreeze}
      title="Protege tu racha por 1 dia si olvidas completar habitos"
    >
      <Shield className="size-4 mr-1.5 text-blue-500" />
      Usar Streak Freeze
      {profile && (
        <span className="ml-1 text-muted-foreground">({profile.streakFreezes})</span>
      )}
    </Button>
  );
}
