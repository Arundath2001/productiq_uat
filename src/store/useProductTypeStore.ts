import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

interface ProductTypeData {
  _id: any;
  itemName: string;
}

interface ProductType {
  isCreate: boolean;
  createError: string | null;

  productTypes: ProductTypeData[];
  productTypeLoading: boolean;
  productTypeError: string | null;

  isDelete: boolean;
  deleteError: string | null;

  createProductType: (itemName: string) => Promise<void>;

  getProductType: (search?: string) => void;

  deleteProductType: (itemTypeId: any) => Promise<void>;
}

export const useProductType = create<ProductType>((set, get) => ({
  isCreate: false,
  createError: null,

  isDelete: false,
  deleteError: null,

  productTypes: [],
  productTypeLoading: false,
  productTypeError: null,

  createProductType: async (itemName) => {
    set({ isCreate: true });
    try {
      const response = await axiosInstance.post("/product-type/create", {
        itemName: itemName,
      });

      set({ isCreate: false, createError: null });

      if (response.data.success) {
        toast.success(response.data.message || "Item created successfully!");

        get().getProductType();
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create product type";

      toast.success(errorMessage || "failed to created!");

      set({ isCreate: false, createError: errorMessage });
    }
  },

  getProductType: async (search = "") => {
    set({ productTypeLoading: true, productTypeError: null });

    try {
      const response = await axiosInstance.get(
        `/product-type?search=${search}`
      );

      set({
        productTypes: response.data.productTypes,
        productTypeLoading: false,
        productTypeError: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch product types";
      set({
        productTypeLoading: false,
        productTypeError: errorMessage,
      });
    }
  },

  deleteProductType: async (itemTypeId) => {
    set({ isDelete: true });
    try {
      const response = await axiosInstance.delete(
        `/product-type/${itemTypeId}`
      );

      set({
        isDelete: false,
        deleteError: null,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Item deleted successfully!");
        get().getProductType();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete item";

      toast.success(errorMessage);

      set({ isDelete: false, deleteError: errorMessage });
    }
  },
}));
