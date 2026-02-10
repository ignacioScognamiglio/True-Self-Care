"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function usePushNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isSupported, setIsSupported] = useState(false);
  const saveSubscription = useMutation(
    api.functions.notifications.savePushSubscription
  );
  const removeSubscription = useMutation(
    api.functions.notifications.removePushSubscription
  );
  const subscriptionCount = useQuery(
    api.functions.notifications.getPushSubscriptionCount
  );

  useEffect(() => {
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      // Check for existing subscription
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        setSubscription(sub);

        await saveSubscription({
          endpoint: sub.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(sub.getKey("p256dh")!),
            auth: arrayBufferToBase64(sub.getKey("auth")!),
          },
        });
      }
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
    }
  }, [isSupported, saveSubscription]);

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      try {
        await removeSubscription({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
        setSubscription(null);
      } catch (error) {
        console.error("Error unsubscribing from push notifications:", error);
      }
    }
  }, [subscription, removeSubscription]);

  return {
    permission,
    subscription,
    isSupported,
    isSubscribed: !!subscription,
    subscriptionCount: subscriptionCount ?? 0,
    subscribe,
    unsubscribe,
  };
}
