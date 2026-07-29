import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";

export const useUserActivityStore = create((set) => ({
  activities: [],
  summary: {
    loginsLast24Hours: 0,
    uploadsToday: 0,
    voyageChangesToday: 0,
    destructiveActionsToday: 0,
  },
  availableFilters: {
    modules: [],
    actions: [],
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,

  getActivities: async ({
    page = 1,
    search = "",
    module = "",
    action = "",
    startDate = "",
    endDate = "",
  } = {}) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/user-activity", {
        params: {
          page,
          limit: 20,
          search,
          module,
          action,
          startDate,
          endDate,
        },
      });
      set({
        activities: response.data.activities,
        pagination: response.data.pagination,
        summary: response.data.summary,
        availableFilters: response.data.filters,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch user activities"
      );
    } finally {
      set({ isLoading: false });
    }
  },
}));
