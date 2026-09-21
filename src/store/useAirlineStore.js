import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAirlineStore = create((set, get) => ({
    airlines: [],
    airlineLoading: false,
    airlineError: null,
    isCreating: false,
    isDeleting: false,
    isUpdating: false,

    paginationData: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
    },

    getAirlines: async (branchId) => {
        set({ airlineLoading: true, airlineError: null })
        try {
            const response = await axiosInstance.get(`/airline/${branchId}`);

            const { airlines, pagination } = response.data;

            set({
                airlines: airlines,
                airlineError: null,
                airlineLoading: false,
                paginationData: pagination
            });

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch airlines";

            set({
                airlineError: errorMessage,
                airlineLoading: false
            });

        }
    },

    createAirline: async (airlineData) => {

        set({ isCreating: true });

        try {

            const response = await axiosInstance.post('/airline/create', airlineData);

            if (response.data.success) {
                toast.success(response.data.message || "Airline created successfully");
                await get().getAirlines(airlineData.branchId);
            }

            set({ isCreating: false });

            return response.data;

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to create Airline";

            set({ airlineError: errorMessage, isCreating: false });

            throw error;

        }
    },

    updateAirline: async (airlineId, airlineData) => {
        set({ isUpdating: true });
        
        try {
            const response = await axiosInstance.put(`/airline/${airlineId}`, airlineData);
            
            if (response.data.success) {
                toast.success(response.data.message || "Airline updated successfully");
                
                // Update local state directly instead of refetching everything
                set((state) => ({
                    airlines: state.airlines.map(airline => 
                        airline._id === airlineId ? response.data.airline : airline
                    ),
                    isUpdating: false
                }));
            }
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update airline";
            set({ airlineError: errorMessage, isUpdating: false });
            throw error;
        }
    },

    deleteAirline: async (airlineId) => {
        set({ isDeleting: true })
        try {
            const response = await axiosInstance.delete(`/airline/${airlineId}`);

            if (response.data.success) {
                toast.success(response.data.message || "Airline deleted successfully");
            }

            set({
                airlines: get().airlines.filter(airline => airline._id !== airlineId),
                isDeleting: false,
                paginationData: {
                    ...get().paginationData,
                    totalItems: get().paginationData.totalItems - 1
                }
            });

            return { success: true, data: response.data };


        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete airline";

            set({ isDeleting: false, airlineError: errorMessage });

            toast.error(errorMessage);

            return { success: false, error: errorMessage };
        }
    }

}));
