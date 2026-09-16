"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

const ADMIN_NOTIFICATION_EVENT =
  "tevuah:admin-notifications-changed";

export function notifyAdminNotificationsChanged() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new Event(
      ADMIN_NOTIFICATION_EVENT,
    ),
  );
}

export function useUnreadAdminNotificationCount(
  initialCount = 0,
) {
  const [
    count,
    setCount,
  ] = useState(
    initialCount,
  );

  const refresh =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/admin/notifications/unread-count",
              {
                method:
                  "GET",

                cache:
                  "no-store",
              },
            );

          if (
            !response.ok
          ) {
            return;
          }

          const data =
            (await response.json()) as {
              count?: number;
            };

          setCount(
            Number(
              data.count ??
                0,
            ),
          );
        } catch (error) {
          console.error(
            "Admin notification count refresh error:",
            error,
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      const handleChange =
        () => {
          void refresh();
        };

      window.addEventListener(
        ADMIN_NOTIFICATION_EVENT,
        handleChange,
      );

      /*
       * Refresh when returning to the tab.
       */
      const handleVisibility =
        () => {
          if (
            document.visibilityState ===
            "visible"
          ) {
            void refresh();
          }
        };

      document.addEventListener(
        "visibilitychange",
        handleVisibility,
      );

      /*
       * Keep the badge reasonably fresh while an
       * administrator is working in the dashboard.
       */
      const interval =
        window.setInterval(
          () => {
            void refresh();
          },
          30_000,
        );

      return () => {
        window.removeEventListener(
          ADMIN_NOTIFICATION_EVENT,
          handleChange,
        );

        document.removeEventListener(
          "visibilitychange",
          handleVisibility,
        );

        window.clearInterval(
          interval,
        );
      };
    },
    [
      refresh,
    ],
  );

  return {
    count,
    refresh,
  };
}