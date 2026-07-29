import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAppImageStore = create((set, get) => ({
  images: [],
  isLoading: false,
  isUploading: false,
  editingImageId: null,
  deletingImageId: null,

  getAppImages: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/app/images");
      set({ images: res.data.images || [] });
      return res.data.images || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch app images");
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  uploadAppImages: async (files, displayTexts = []) => {
    if (!files?.length) {
      toast.error("Please choose at least one image");
      return [];
    }

    set({ isUploading: true });
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("images", file);
        formData.append("displayTexts", displayTexts[index] || "");
      });

      const res = await axiosInstance.post("/app/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedImages = res.data.images || [];
      set({ images: [...uploadedImages, ...get().images] });
      toast.success(res.data.message || "Images uploaded successfully");
      return uploadedImages;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload app images");
      return [];
    } finally {
      set({ isUploading: false });
    }
  },

  updateAppImage: async (imageId, { file, displayText }) => {
    if (!file && displayText === undefined) {
      toast.error("Please choose an image or enter text");
      return null;
    }

    set({ editingImageId: imageId });
    try {
      const formData = new FormData();
      if (file) formData.append("image", file);
      if (displayText !== undefined) formData.append("displayText", displayText);

      const res = await axiosInstance.put(`/app/images/${imageId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedImage = res.data.image;
      set((state) => ({
        images: state.images.map((image) =>
          image._id === imageId ? updatedImage : image
        ),
      }));
      toast.success(res.data.message || "Image updated successfully");
      return updatedImage;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update image");
      return null;
    } finally {
      set({ editingImageId: null });
    }
  },

  deleteAppImage: async (imageId) => {
    set({ deletingImageId: imageId });
    try {
      const res = await axiosInstance.delete(`/app/images/${imageId}`);
      set((state) => ({
        images: state.images.filter((image) => image._id !== imageId),
      }));
      toast.success(res.data.message || "Image deleted successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete image");
      return false;
    } finally {
      set({ deletingImageId: null });
    }
  },
}));
