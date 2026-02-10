"use client";

import { Badge } from "@/components/ui/badge";
import { Watch } from "lucide-react";

export function WearableBadge() {
  return (
    <Badge variant="outline" className="text-xs gap-1">
      <Watch className="size-3" />
      Google Fit
    </Badge>
  );
}
