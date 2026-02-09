"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Droplets, ListChecks, Inbox, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

export function NotificationPanel() {
  const notifications = useQuery(api.functions.notifications.getRecentNotifications);
  const unreadCount = useQuery(api.functions.notifications.getUnreadCount);
  const markAsRead = useMutation(api.functions.notifications.markAsRead);
  const markAllAsRead = useMutation(api.functions.notifications.markAllAsRead);
  const router = useRouter();

  if (notifications === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <Inbox className="size-10" />
        <p className="text-sm">No tienes notificaciones</p>
      </div>
    );
  }

  const iconForType = (type: string) => {
    switch (type) {
      case "hydration_reminder":
        return <Droplets className="size-4 text-blue-500 shrink-0" />;
      case "habits_reminder":
        return <ListChecks className="size-4 text-green-500 shrink-0" />;
      default:
        return <Inbox className="size-4 text-muted-foreground shrink-0" />;
    }
  };

  const handleClick = async (notification: {
    _id: Id<"notifications">;
    read: boolean;
    actionUrl?: string;
  }) => {
    if (!notification.read) {
      await markAsRead({ notificationId: notification._id });
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {(unreadCount ?? 0) > 0 && (
        <div className="flex justify-end px-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => markAllAsRead()}
          >
            Marcar todo como leido
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                !n.read ? "bg-primary/5" : ""
              }`}
            >
              <div className="mt-0.5">{iconForType(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {n.body}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
              {!n.read && (
                <div className="mt-1.5 size-2 rounded-full bg-blue-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
