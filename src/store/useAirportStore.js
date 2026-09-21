import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAirportStore = create((set, get) => ({
    airports: [],
    airportLoading: false,
    airportError: null,
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

    getAirports: async (branchId) => {
        set({ airportLoading: true, airportError: null })
        try {
            const response = await axiosInstance.get(`/airport/${branchId}`);

            const { airports, pagination } = response.data;

            set({
                airports: airports,
                airportError: null,
                airportLoading: false,
                paginationData: pagination
            });

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch airports";

            set({
                airportError: errorMessage,
                airportLoading: false
            });

        }
    },

    createAirport: async (airportData) => {

        set({ isCreating: true });

        try {

            const response = await axiosInstance.post('/airport/create', airportData);

            if (response.data.success) {
                toast.success(response.data.message || "Airport created successfully");
                await get().getAirports(airportData.branchId);
            }

            set({ isCreating: false });

            return response.data;

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to create Airport";

            set({ airportError: errorMessage, isCreating: false });

            throw error;

        }
    },

    updateAirport: async (airportId, airportData) => {
        set({ isUpdating: true });
        
        try {
            const response = await axiosInstance.put(`/airport/${airportId}`, airportData);
            
            if (response.data.success) {
                toast.success(response.data.message || "Airport updated successfully");
                
                // Update local state directly instead of refetching everything
                set((state) => ({
                    airports: state.airports.map(airport => 
                        airport._id === airportId ? response.data.airport : airport
                    ),
                    isUpdating: false
                }));
            }
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update airport";
            set({ airportError: errorMessage, isUpdating: false });
            throw error;
        }
    },

    deleteAirport: async (airportId) => {
        set({ isDeleting: true })
        try {
            const response = await axiosInstance.delete(`/airport/${airportId}`);

            if (response.data.success) {
                toast.success(response.data.message || "Airport deleted successfully");
            }

            set({
                airports: get().airports.filter(airport => airport._id !== airportId),
                isDeleting: false,
                paginationData: {
                    ...get().paginationData,
                    totalItems: get().paginationData.totalItems - 1
                }
            });

            return { success: true, data: response.data };


        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to delete airport";

            set({ isDeleting: false, airportError: errorMessage });

            toast.error(errorMessage);

            return { success: false, error: errorMessage };
        }
    }

}));
