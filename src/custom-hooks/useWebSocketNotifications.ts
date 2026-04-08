import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface UseWebSocketNotificationsOptions {
  wsBaseUrl: string; // e.g. "http://localhost:8090/api"
  getAccessToken: () => string;
  onNotification: (notification: any) => void;
  enabled: boolean;
}

/**
 * Connects to the notification-service WebSocket endpoint via STOMP/SockJS.
 * Subscribes to /user/queue/notifications and calls onNotification for each
 * incoming push. Automatically reconnects on disconnect.
 */
export default function useWebSocketNotifications({
  wsBaseUrl,
  getAccessToken,
  onNotification,
  enabled,
}: UseWebSocketNotificationsOptions): void {
  // Keep a stable ref to the callback so the STOMP handler doesn't go stale
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!enabled || !wsBaseUrl) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
      beforeConnect: () => {
        client.connectHeaders = {
          Authorization: `Bearer ${getAccessToken()}`,
        };
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/user/queue/notifications", (message) => {
          try {
            const notification = JSON.parse(message.body);
            onNotificationRef.current(notification);
          } catch (e) {
            console.error("[WS] Failed to parse WebSocket notification", e);
          }
        });
      },
      onDisconnect: () => {},
      onStompError: (frame) => {
        console.error("[WS] STOMP error", frame.headers["message"], frame.body);
      },
      onWebSocketError: (event) => {
        console.error("[WS] WebSocket error", event);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [enabled, wsBaseUrl]);
}
