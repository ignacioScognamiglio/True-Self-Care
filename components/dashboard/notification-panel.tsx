"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  ListChecks,
  Inbox,
  Loader2,
  UtensilsCrossed,
  Dumbbell,
  Brain,
  Moon,
  Sun,
  Lightbulb,
  BarChart3,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

const NOTIFICATION_ICONS: Record<
  string,
  { icon: typeof Droplets; color: string }
> = {
  hydration_reminder: { icon: Droplets, color: "text-blue-500" },
  habits_reminder: { icon: ListChecks, color: "text-green-500" },
  nutrition_reminder: { icon: UtensilsCrossed, color: "text-orange-500" },
  workout_reminder: { icon: Dumbbell, color: "text-red-500" },
  mood_checkin_reminder: { icon: Brain, color: "text-purple-500" },
  crisis_incident: { icon: AlertTriangle, color: "text-red-600" },
  cross_domain_insight: { icon: Lightbulb, color: "text-yellow-500" },
  sleep_bedtime_reminder: { icon: Moon, color: "text-indigo-500" },
  sleep_log_reminder: { icon: Moon, color: "text-indigo-400" },
  daily_plan: { icon: Sun, color: "text-amber-500" },
  weekly_summary: { icon: BarChart3, color: "text-teal-500" },
  google_fit_sync: { icon: Smartphone, color: "text-green-500" },
  google_fit_error: { icon: AlertTriangle, color: "text-orange-500" },
};

export function NotificationPanel() {
  const notifications = useQuery(
    api.functions.notifications.getRecentNotifications
  );
  const unreadCount = useQuery(api.functions.notifications.getUnreadCount);
  const markAsRead = useMutation(api.functions.notifications.markAsRead);
  const markAllAsRead = useMutation(
    api.functions.notifications.markAllAsRead
  );
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
    const config = NOTIFICATION_ICONS[type];
    if (config) {
      const Icon = config.icon;
      return <Icon className={`size-4 ${config.color} shrink-0`} />;
    }
    return <Inbox className="size-4 text-muted-foreground shrink-0" />;
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
