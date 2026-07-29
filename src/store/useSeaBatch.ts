import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

interface SeaBatches {
  _id: string;
  seaBatchNumber: string;
  productCode: string;
  companyCode: string;
  itemName: string;
  deliveryPaperNumber: string;
  supplierName: string;
  totalQuantity: number;
  availableQuantity: number;
  loadedQuantity: number;
  loadingStatus: string;
  status: string;
  deliveryPaperImages: [];
  productImages: [];
  createdBy: string;
  createdAt: Date;
  voyageNumbers: [];
  seaContainers: [];
  totalCBM: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UpdateSeaBatchData {
  deliveryPaperNumber?: string;
  supplierName?: string;
  totalCBM?: number;
  itemName?: string;
  seaContainers?: { seaContainerNumber: string }[];
  voyageNumbers?: { seaVoyageNumber: string }[];
}

interface SeabatchStore {
  seaBatches: SeaBatches[];
  seaBatchesLoading: boolean;
  seaBatchesError: string | null;

  isDeleting: boolean;
  isUpdating: boolean;

  paginationData: Pagination;

  getSeaBatchesByBranch: (
    branchId: any,
    search: string,
    status: string
  ) => Promise<void>;

  deleteSeaBatch: (seaBatchId: string) => Promise<any>;

  updateSeaBatch: (
    seaBatchId: string,
    updateData: UpdateSeaBatchData
  ) => Promise<any>;
}

export const useSeaBatch = create<SeabatchStore>((set, get) => ({
  seaBatches: [],
  seaBatchesLoading: false,
  seaBatchesError: null,

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

  getSeaBatchesByBranch: async (branchId, search = "", status) => {
    set({ seaBatchesLoading: true, seaBatchesError: null });
    try {
      const response = await axiosInstance.get(
        `sea-batch/branch/${branchId}?search=${search}`
      );

      if (response.data.success) {
        set({
          seaBatches: response.data.seaBatches,
          seaBatchesLoading: false,
          seaBatchesError: null,
          paginationData: response.data.pagination,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch received data";

      set({
        seaBatchesError: errorMessage,
        seaBatchesLoading: false,
      });
    }
  },

  deleteSeaBatch: async (seaBatchId: string) => {
    set({ isDeleting: true });

    try {
      const response = await axiosInstance.delete(`sea-batch/${seaBatchId}`);

      if (response.data.success) {
        toast.success(
          response.data.message || "sea batch deleted successfully"
        );
      }

      set({
        seaBatches: get().seaBatches.filter(
          (seaBatch) => seaBatch._id !== seaBatchId
        ),
        isDeleting: false,
        paginationData: {
          ...get().paginationData,
          totalItems: get().paginationData.totalItems - 1,
        },
      });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete sea batch";

      set({ isDeleting: false, seaBatchesError: errorMessage });

      toast.error(errorMessage);

      return { success: false };
    }
  },

  updateSeaBatch: async (
    seaBatchId: string,
    updateData: UpdateSeaBatchData
  ) => {
    set({ isUpdating: true, seaBatchesError: null });

    try {
      const response = await axiosInstance.put(
        `sea-batch/${seaBatchId}`,
        updateData
      );

      console.log(updateData);

      if (response.data.success) {
        // Update the sea batch in the local state
        set({
          seaBatches: get().seaBatches.map((seaBatch) =>
            seaBatch._id === seaBatchId
              ? { ...seaBatch, ...response.data.seaBatch }
              : seaBatch
          ),
          isUpdating: false,
        });

        toast.success(
          response.data.message || "Sea batch updated successfully"
        );

        return { success: true, data: response.data.seaBatch };
      }

      return { success: false, message: "Update failed" };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update sea batch";

      set({ isUpdating: false, seaBatchesError: errorMessage });

      toast.error(errorMessage);

      return { success: false, message: errorMessage };
    }
  },
}));
