import axios from "../config/Axiosconfig";

const NOTIF_API = "notifications";

export const getNotifications = async () => {
  const response = await axios.get(`/${NOTIF_API}`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await getNotifications();
  return {
    success: response.success,
    data: {
      count: (response.data || []).filter((notification) => notification.unread !== false).length,
    },
  };
};

export const markAsRead = async () => ({ success: true });
export const markAllAsRead = async () => ({ success: true });
export const deleteNotification = async () => ({ success: true });
export const clearAllNotifications = async () => ({ success: true });
export const getNotificationSettings = async () => ({ success: true, data: null });
export const updateNotificationSettings = async (settings) => ({ success: true, data: settings });
