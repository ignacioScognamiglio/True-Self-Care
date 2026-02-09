"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Bell } from "lucide-react";
import { NotificationPanel } from "./notification-panel";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useQuery(api.functions.notifications.getUnreadCount);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Bell className="size-4" />
        {(unreadCount ?? 0) > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 size-5 p-0 text-[10px] flex items-center justify-center"
          >
            {unreadCount! > 99 ? "99+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notificaciones</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Notificaciones</SheetTitle>
            <SheetDescription className="sr-only">
              Panel de notificaciones recientes
            </SheetDescription>
          </SheetHeader>
          <NotificationPanel />
        </SheetContent>
      </Sheet>
    </>
  );
}
