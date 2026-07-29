import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useSendNotification = create((set) => ({
  isLoading: false,
  error: null,
  notifications: [],
  unreadCount: 0,
  pagination: null,

  sendNotification: async (notificationData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await axiosInstance.post("/notification/sendNoti", {
        message: notificationData.message,
        title: notificationData.title || "Aswaq Forwarder",
        sendPushNotification: notificationData.sendPushNotification !== false,
        category: notificationData.category || "normal",
        type: notificationData.type || "manual",
      });
      
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error("Error sending notification:", error);
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  getNotifications: async ({ page = 1, limit = 20, category } = {}) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axiosInstance.get("/notification", {
        params: { page, limit, category },
      });

      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        pagination: response.data.pagination,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.patch(`/notification/${notificationId}/read`);

      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification._id === notificationId ? response.data.notification : notification
        ),
        unreadCount: Math.max(state.unreadCount - 1, 0),
      }));

      return response.data.notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await axiosInstance.patch("/notification/read-all");

      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          readAt: notification.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));

      return response.data;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      set({ error: error.response?.data?.message || error.message });
      throw error;
    }
  },
  
  clearError: () => set({ error: null })
}));
