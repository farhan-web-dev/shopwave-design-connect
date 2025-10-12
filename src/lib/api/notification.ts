import { BASE_URL } from "../url";

// /lib/api/notification.ts
export interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export const fetchNotifications = async (
  token: string
): Promise<Notification[]> => {
  const res = await fetch(`${BASE_URL}/api/v1/notifications/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch notifications");

  const data = await res.json();

  // ✅ Correctly handle nested structure: data.data.notifications
  const notifications = data?.data?.notifications || data?.notifications || [];

  return notifications;
};

export const markAllNotificationsRead = async (
  token: string
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/v1/notifications/mark-all-read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Failed to mark notifications as read:", error);
    throw new Error("Failed to mark notifications as read");
  }
};
