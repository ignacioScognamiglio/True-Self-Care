"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Target } from "lucide-react";
import { GoalCard } from "./goal-card";
import { GoalFormDialog } from "./goal-form-dialog";

export function GoalsManagement() {
  const [showForm, setShowForm] = useState(false);
  const goals = useQuery(api.functions.goals.getUserGoals, {});

  if (!goals) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const active = goals.filter((g) => g.status === "active");
  const paused = goals.filter((g) => g.status === "paused");
  const completed = goals.filter((g) => g.status === "completed");

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
      <Target className="size-8" />
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Metas</h3>
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="size-4" />
          Nueva meta
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Activas ({active.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Pausadas ({paused.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {active.length === 0 ? (
            <EmptyState message="No hay metas activas. Crea una para empezar!" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((goal) => (
                <GoalCard key={goal._id} goal={goal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paused" className="mt-4">
          {paused.length === 0 ? (
            <EmptyState message="No hay metas pausadas" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {paused.map((goal) => (
                <GoalCard key={goal._id} goal={goal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completed.length === 0 ? (
            <EmptyState message="No hay metas completadas aun" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {completed.map((goal) => (
                <GoalCard key={goal._id} goal={goal} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <GoalFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}
