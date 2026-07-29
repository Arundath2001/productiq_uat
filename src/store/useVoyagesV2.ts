import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

interface Voyage {
  _id: string;
  voyageName: string;
  voyageNumber: string;
  year: number;
  status: string;
  totalItems: number;
  trckingStatus: string;
  expectedDate: Date;
  dispatchDate: Date;
  location: string;
  branchName: string;
}

interface CompanyDetails {
  _id: string;
  company: string;
  itemCount: number;
  latestUpload: Date;
  totalWeight: number;
}

interface Products {
  _id: string;
  productCode: string;
  sequenceNumber: number;
  trackingNumber: string;
  weight: number;
  uploadedDate: Date;
  exportedDate: Date;
  status: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Company {
  companyCode: string;
}

interface voyageV2Store {
  pendingVoyages: Voyage[];
  pendingVoyageLoading: boolean;
  pendingError: string | null;
  pendingLoadingMore: boolean;

  clientCompletedVoyages: Voyage[];
  clientCompletedVoyageLoading: boolean;
  clientCompletedError: string | null;
  clientCompletedLoadingMore: boolean;

  clientPendingVoyages: Voyage[];
  clientPendingVoyageLoading: boolean;
  clientPendingError: string | null;
  clientPendingLoadingMore: boolean;

  completedVoyages: Voyage[];
  completedVoyageLoading: boolean;
  completedError: string | null;
  completedLoadingMore: boolean;

  companyDetails: CompanyDetails[];
  companyLoading: boolean;
  companyError: string | null;
  companyLoadMore: boolean;
  totalCompanies: number;

  currentVoyageInfo: Voyage | null;

  companyInfo: Company | null;

  totalVoyageWeight: number;

  totalCompanyWeight: number;

  products: Products[];
  productLoading: boolean;
  productError: string | null;
  productLoadMore: boolean;

  isDeleting: boolean;

  isCreateVoyage: boolean;

  paginationData: Pagination;

  getVoyageDetailsByBranch: (
    branchId: any,
    status: string,
    page?: number,
    loadMore?: boolean,
    search?: string
  ) => Promise<void>;

  getCompanyDetailsByVoyage: (
    voyageId: any,
    status: any,
    page?: number,
    loadMore?: boolean,
    search?: string
  ) => Promise<void>;

  getProductDetails: (
    voyageId: any,
    companyCode: any,
    status: any,
    page?: number,
    loadMore?: boolean,
    search?: string
  ) => Promise<void>;

  getCompanyCodeVoyage: (
    branchId: any,
    companyCode: string,
    status: string,
    page?: number,
    loadMore?: boolean,
    search?: string
  ) => Promise<void>;

  deleteAirVoyage: (voyageId: any) => Promise<void>;

  createVoyage: (data: any) => Promise<void>;

  updateProduct: (productId: any, data: any) => Promise<void>;

  resetVoyages: (status: string) => void;
  resetCompanies: () => void;
  resetProducts: () => void;
  resetClientVoyages: (status: string) => void;
}

export const useVoyagesV2 = create<voyageV2Store>((set, get) => ({
  pendingVoyages: [],
  pendingVoyageLoading: false,
  pendingError: null,
  pendingLoadingMore: false,

  completedVoyages: [],
  completedVoyageLoading: false,
  completedError: null,
  completedLoadingMore: false,

  clientPendingVoyages: [],
  clientPendingVoyageLoading: false,
  clientPendingError: null,
  clientPendingLoadingMore: false,

  clientCompletedVoyages: [],
  clientCompletedVoyageLoading: false,
  clientCompletedError: null,
  clientCompletedLoadingMore: false,

  companyDetails: [],
  companyLoading: false,
  companyError: null,
  companyLoadMore: false,
  totalCompanies: 0,

  currentVoyageInfo: null,

  companyInfo: null,

  totalVoyageWeight: 0,

  totalCompanyWeight: 0,

  products: [],
  productLoading: false,
  productError: null,
  productLoadMore: false,

  isDeleting: false,

  isCreateVoyage: false,

  paginationData: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },

  resetProducts: async () => {
    set({
      products: [],
      productError: null,
      paginationData: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  },

  resetVoyages: (status) => {
    if (status === "pending") {
      set({
        pendingVoyages: [],
        pendingError: null,
        paginationData: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    } else {
      set({
        completedVoyages: [],
        completedError: null,
        paginationData: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }
  },

  resetClientVoyages: async (status) => {
    if (status === "pending") {
      set({
        clientPendingVoyages: [],
        clientCompletedError: null,
        paginationData: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    } else {
      set({
        clientCompletedVoyages: [],
        clientCompletedError: null,
        paginationData: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }
  },

  resetCompanies: () => {
    set({
      companyDetails: [],
      companyError: null,
      totalCompanies: 0,
      currentVoyageInfo: null,
      paginationData: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  },

  getVoyageDetailsByBranch: async (
    branchId,
    status,
    page = 1,
    loadMore = false,
    search = ""
  ) => {
    if (loadMore) {
      set({ pendingLoadingMore: true });
    } else {
      set({ pendingVoyageLoading: true, pendingError: null });
    }

    try {
      const response = await axiosInstance.get(
        `/voyage/v2/voyage-details/${branchId}?status=${status}&page=${page}&search=${search}`
      );

      const { voyages, pagination } = response.data;

      set({
        pendingVoyages: loadMore
          ? [...get().pendingVoyages, ...voyages]
          : voyages,
        pendingVoyageLoading: false,
        pendingLoadingMore: false,
        paginationData: pagination,
        pendingError: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Failed to fetch ${status} voyages!`;

      console.error(`Error fetching ${status} voyages:`, errorMessage);

      set({
        pendingError: errorMessage,
        pendingVoyageLoading: false,
        pendingLoadingMore: false,
      });
    }
  },

  getCompanyDetailsByVoyage: async (
    voyageId,
    status,
    page = 1,
    loadMore = false,
    search = ""
  ) => {
    if (loadMore) {
      set({ companyLoadMore: true });
    } else {
      set({ companyLoading: true, companyError: null });
    }

    try {
      const response = await axiosInstance.get(
        `/voyage/v2/companies-details/${voyageId}?status=${status}&page=${page}&search=${search}`
      );

      const { companies, pagination, totalCompanies, voyage, totalWeight } =
        response.data;

      set({
        companyDetails: loadMore
          ? [...get().companyDetails, ...companies]
          : companies,
        totalCompanies: totalCompanies,
        currentVoyageInfo: voyage,
        companyLoading: false,
        companyLoadMore: false,
        totalVoyageWeight: totalWeight,
        paginationData: pagination,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch company details!";

      set({
        companyError: errorMessage,
        companyLoading: false,
        companyLoadMore: false,
      });
    }
  },

  getProductDetails: async (
    voyageId,
    companyCode,
    status,
    page = 1,
    loadMore = false,
    search = ""
  ) => {
    if (loadMore) {
      set({ productLoadMore: true });
    } else {
      set({ productLoading: true });
    }
    try {
      const response = await axiosInstance(
        `/voyage/v2/${voyageId}/companies/${companyCode}?status=${status}&page=${page}&search=${search}`
      );

      const { products, pagination, voyage, company, totalWeight } =
        response.data;

      set({
        products: loadMore ? [...get().products, ...products] : products,
        productLoading: false,
        productLoadMore: false,
        currentVoyageInfo: voyage,
        paginationData: pagination,
        companyInfo: company,
        totalCompanyWeight: totalWeight,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch product details!";
      set({
        productError: errorMessage,
        productLoading: false,
        productLoadMore: false,
      });
    }
  },

  getCompanyCodeVoyage: async (
    branchId,
    companyCode,
    status,
    page = 1,
    loadMore = false,
    search = ""
  ) => {
    if (status === "pending") {
      if (loadMore) {
        set({ clientPendingLoadingMore: true });
      } else {
        set({ clientPendingVoyageLoading: true, clientPendingError: null });
      }
    } else {
      if (loadMore) {
        set({ clientCompletedLoadingMore: true });
      } else {
        set({ clientCompletedVoyageLoading: true, clientCompletedError: null });
      }
    }

    try {
      console.log(branchId, companyCode, status, page, loadMore, search);

      const response = await axiosInstance.get(
        `/voyage/v2/company-voyage/${branchId}/${companyCode}?search=${search}&page=${page}&status=${status}`
      );

      const { voyages, pagination } = response.data;

      if (status === "pending") {
        set({
          clientPendingVoyages: loadMore
            ? [...get().clientPendingVoyages, ...voyages]
            : [...voyages],
          clientPendingLoadingMore: false,
          clientPendingVoyageLoading: false,
          clientPendingError: null,
          paginationData: pagination,
        });
      } else {
        set({
          clientCompletedVoyages: loadMore
            ? [...get().clientCompletedVoyages, ...voyages]
            : [...voyages],
          clientCompletedLoadingMore: false,
          clientCompletedVoyageLoading: false,
          clientCompletedError: null,
          paginationData: pagination,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || `Failed to fetch ${status} voyages`;

      if (status === "pending") {
        set({
          clientPendingError: errorMessage,
          clientPendingLoadingMore: false,
          clientPendingVoyageLoading: false,
        });
      } else {
        set({
          clientCompletedError: errorMessage,
          clientCompletedLoadingMore: false,
          clientCompletedVoyageLoading: false,
        });
      }
    }
  },

  deleteAirVoyage: async (voyageId) => {
    set({ isDeleting: true, pendingError: null });
    try {
      const response = await axiosInstance.delete(`/voyage/${voyageId}`);

      if (response.data.success) {
        toast.success(
          response.data.message || "Sea voyage deleted successfully"
        );
      }

      set({
        pendingVoyages: get().pendingVoyages.filter(
          (voyage) => voyage._id !== voyageId
        ),
        isDeleting: false,
        paginationData: {
          ...get().paginationData,
          totalItems: get().paginationData.totalItems - 1,
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete air voyage";

      set({ isDeleting: false, pendingError: errorMessage });

      toast.error(errorMessage);
    }
  },

  createVoyage: async (data) => {
    set({ isCreateVoyage: true });

    try {
      const response = await axiosInstance.post("/voyage/create", data);

      if (response.data.success) {
        toast.success(
          response.data.message || "Air voyage created successfully"
        );

        await get().getVoyageDetailsByBranch(data.branchId, "pending");
      }
    } catch (error: any) {
      console.error("Error creating voyage", error);

      const errorMessage =
        error.response?.data?.message || "Failed to create voyage";

      set({
        isCreateVoyage: false,
        pendingError: errorMessage,
      });

      toast.error(errorMessage);
    }
  },

  updateProduct: async (productId, data) => {
    console.log(productId);

    try {
      const response = await axiosInstance.put(
        `/voyage/update-product/${productId}`,
        data
      );

      if (response.data.success) {
        toast.success(response.data.message || "Product Updated successfully");
      }
    } catch (error) {}
  },
}));
