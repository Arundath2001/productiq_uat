import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useSeaBatchAssign = create((set, get) => ({

    seaCompanies: [],
    seaCompaniesLoading: false,
    seaCompaniesLoadMore: false,
    seaCompaniesError: null,
    seaContainerDetails: {},

    seaBatchAssignCompanyData: [],
    companyDetails: {},
    seaBatchAssignCompanyLoading: false,
    seaBatchAssignCompanyLoadMore: false,
    seaBatchAssignCompanyError: null,

    exportData: [],
    exportLoading: false,
    seaVoyageInfo: {},
    seaContainerInfo: {},
    exportError: null,

    paginationData: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
    },

    getSeaCompaniesByBatchAssign: async (seaContainerId, status, page = 1, loadMore = false, search = '') => {
        if (loadMore) {
            set({
                seaCompaniesLoadMore: true
            });
        } else {
            set({
                seaCompaniesLoading: true, seaCompaniesError: null
            });
        }
        try {
            const response = await axiosInstance.get(`/sea-batch-assignment/companies/${seaContainerId}?page=${page}&status=${status}&search=${search}`);

            const { seaCompanies, pagination, seaContainerDetails } = response.data;

            set({
                seaCompanies: loadMore ? [...get().seaCompanies, ...seaCompanies] : seaCompanies,
                seaCompaniesError: null,
                seaCompaniesLoadMore: false,
                seaCompaniesLoading: false,
                paginationData: pagination,
                seaContainerDetails: seaContainerDetails
            });

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch companies details'

            set({
                seaCompaniesError: errorMessage,
                seaCompaniesLoading: false,
                seaCompaniesLoadMore: false
            })
        }
    },

    getSeaBatchAssignCompanyData: async (companyCode, seaContainerId, status, page = 1, loadMore = false, search = '') => {
        if (loadMore) {
            set({
                seaBatchAssignCompanyLoadMore: true
            });
        } else {
            set({
                seaBatchAssignCompanyLoading: true,
                seaBatchAssignCompanyError: null
            });
        }

        try {
            const response = await axiosInstance.get(`/sea-batch-assignment/company-data/${companyCode}/container/${seaContainerId}?status=${status}&page=${page}&search=${search}`);

            const { seaBatchAssignCompanyData, companyDetails, pagination } = response.data;

            if (response.data.success) {
                set({
                    seaBatchAssignCompanyData: loadMore ? [...get().seaBatchAssignCompanyData, ...seaBatchAssignCompanyData] : seaBatchAssignCompanyData,
                    seaBatchAssignCompanyLoadMore: false,
                    seaBatchAssignCompanyLoading: false,
                    seaBatchAssignCompanyError: null,
                    companyDetails: companyDetails,
                    paginationData: pagination
                })
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || `Failed to fetch ${companyCode} data`;

            set({
                seaBatchAssignCompanyLoadMore: false,
                seaBatchAssignCompanyLoading: false,
                seaBatchAssignCompanyError: errorMessage
            })

        }
    },

    getContainerExportData: async (seaVoyageId, seaContainerId, status) => {
        set({ exportLoading: true, exportError: null });
        try {
            const query = status ? `?status=${encodeURIComponent(status)}` : "";
            const response = await axiosInstance.get(`/sea-batch-assignment/sea-voyage/${seaVoyageId}/sea-container/${seaContainerId}${query}`);

            set({
                seaVoyageInfo: response.data.seaVoyageInfo,
                seaContainerInfo: response.data.seaContainerInfo,
                exportData: response.data.batchAssignments,
                exportError: null,
                exportLoading: false
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to get export data";

            set({
                exportError: errorMessage,
                exportLoading: false
            });

            return null;
        }
    }

}));
