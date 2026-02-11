"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export function ProfileEditor() {
  const user = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState<string | null>(null);

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const displayName = name ?? user.name;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    if (!name || name === user.name) return;
    setSaving(true);
    try {
      await updateProfile({ name });
      setName(null);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = name !== null && name !== user.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-name">Nombre</Label>
          <div className="flex gap-2">
            <Input
              id="profile-name"
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              size="icon"
              variant="outline"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
