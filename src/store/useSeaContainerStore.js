import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSeaContainerStore = create((set, get) => ({

    seaContainers: [],
    seaContainerLoading: false,
    seaContainerLoadMore: false,
    seaContainerError: null,
    seaVoyage: {},
    isDeleting: false,
    isCreating: false,
    isChangingVoyage: false,

    paginationData: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
    },

    getSeaContainers: async (seaVoyageId, status, page = 1, loadMore = false, search = "") => {

        if (loadMore) {
            set({ seaContainerLoadMore: true });
        } else {
            set({ seaContainerLoading: true, seaContainerError: null })
        }

        try {

            const response = await axiosInstance.get(`/sea-container/sea-voyage/${seaVoyageId}?page=${page}&status=${status}&search=${search}`);

            const { seaContainers, pagination, seaVoyage } = response.data;

            set({
                seaContainers: loadMore ? [...get().seaContainers, ...seaContainers] : seaContainers,
                seaContainerLoading: false,
                seaContainerLoadMore: false,
                seaContainerError: null,
                paginationData: pagination,
                seaVoyage: seaVoyage
            });

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch containers";

            set({
                seaContainerLoading: false,
                seaContainerLoadMore: false,
                seaContainerError: errorMessage
            });

        }
    },

    createSeaContainer: async (containerData) => {
        set({ isCreating: true });
        try {
            const response = await axiosInstance.post('/sea-container/create', containerData);

            if (response.data.success) {
                toast.success(response.data.message || "Sea-container created successfully!");
                await get().getSeaContainers(containerData.seaVoyageId, "pending");
            }

            set({ isCreating: false });

            return response.data;

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to create container";
            set({ isCreating: false });

            toast.error(errorMessage);

            throw error;
        }
    },

    changeSeaContainerVoyage: async (containerId, seaVoyageId) => {
        set({ isChangingVoyage: true });

        try {
            const response = await axiosInstance.patch(
                `/sea-container/${containerId}/voyage`,
                { seaVoyageId }
            );

            set({
                seaContainers: get().seaContainers.filter(
                    container => container._id !== containerId
                ),
                isChangingVoyage: false,
                paginationData: {
                    ...get().paginationData,
                    totalItems: Math.max(0, get().paginationData.totalItems - 1)
                }
            });

            toast.success(response.data.message || "Container voyage changed successfully");
            return { success: true };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to change container voyage";

            set({ isChangingVoyage: false, seaContainerError: errorMessage });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    deleteSeaContainer: async (containerId) => {

        set({ isDeleting: true });

        try {

            const response = await axiosInstance.delete(`/sea-container/${containerId}`);

            if (response.data.success) {
                toast.success(response.data.message || "Container deleted successfully");
            }

            set({
                seaContainers: get().seaContainers.filter(container => container._id !== containerId),
                isDeleting: false,
                paginationData: {
                    ...get().paginationData,
                    totalItems: get().paginationData.totalItems - 1
                }
            });

            return { success: true }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete container";

            set({ isDeleting: false, seaContainerError: errorMessage });

            toast.error(errorMessage);

            return { success: false, error: errorMessage };
        }
    }

}));
