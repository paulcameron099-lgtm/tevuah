"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type UnreadCountResponse = {
  count?: number;
};

const REFRESH_INTERVAL_MS =
  20_000;

export function useUnreadNotificationCount(
  initialCount: number,
) {
  const [
    unreadCount,
    setUnreadCount,
  ] = useState(
    initialCount,
  );

  const refreshUnreadCount =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/notifications/unread-count",
              {
                method:
                  "GET",

                cache:
                  "no-store",
              },
            );

          if (!response.ok) {
            return;
          }

          const data =
            (await response.json()) as UnreadCountResponse;

          if (
            typeof data.count ===
            "number"
          ) {
            setUnreadCount(
              data.count,
            );
          }
        } catch (
          error
        ) {
          console.error(
            "Unable to refresh unread notification count:",
            error,
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      const intervalId =
        window.setInterval(
          () => {
            void refreshUnreadCount();
          },
          REFRESH_INTERVAL_MS,
        );

      function handleFocus() {
        void refreshUnreadCount();
      }

      function handleVisibilityChange() {
        if (
          document.visibilityState ===
          "visible"
        ) {
          void refreshUnreadCount();
        }
      }

      function handleNotificationsChanged() {
        void refreshUnreadCount();
      }

      window.addEventListener(
        "focus",
        handleFocus,
      );

      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.addEventListener(
        "tevuah:notifications-changed",
        handleNotificationsChanged,
      );

      return () => {
        window.clearInterval(
          intervalId,
        );

        window.removeEventListener(
          "focus",
          handleFocus,
        );

        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );

        window.removeEventListener(
          "tevuah:notifications-changed",
          handleNotificationsChanged,
        );
      };
    },
    [
      refreshUnreadCount,
    ],
  );

return {
  count: unreadCount,
  refreshUnreadCount,
};
}