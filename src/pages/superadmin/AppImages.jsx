import React, { useEffect, useMemo, useState } from "react";
import { Edit2, ImageUp, Loader, Save, Trash2, Upload, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useAppImageStore } from "../../store/useAppImageStore";

const AppImages = () => {
  const {
    images,
    getAppImages,
    uploadAppImages,
    updateAppImage,
    deleteAppImage,
    isLoading,
    isUploading,
    editingImageId,
    deletingImageId,
  } = useAppImageStore();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedTexts, setSelectedTexts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingImage, setEditingImage] = useState(null);
  const [replacementFile, setReplacementFile] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    getAppImages();
  }, []);

  const selectedPreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  const replacementPreview = useMemo(() => {
    if (!replacementFile) return null;
    return URL.createObjectURL(replacementFile);
  }, [replacementFile]);

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedPreviews]);

  useEffect(() => {
    return () => {
      if (replacementPreview) URL.revokeObjectURL(replacementPreview);
    };
  }, [replacementPreview]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setSelectedTexts(files.map(() => ""));
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((files) =>
      files.filter((_, fileIndex) => fileIndex !== index)
    );
    setSelectedTexts((texts) =>
      texts.filter((_, textIndex) => textIndex !== index)
    );
  };

  const updateSelectedText = (index, value) => {
    setSelectedTexts((texts) =>
      texts.map((text, textIndex) => (textIndex === index ? value : text))
    );
  };

  const handleUpload = async () => {
    const uploadedImages = await uploadAppImages(selectedFiles, selectedTexts);
    if (uploadedImages.length > 0) {
      setSelectedFiles([]);
      setSelectedTexts([]);
    }
  };

  const openEditModal = (image) => {
    setEditingImage(image);
    setReplacementFile(null);
    setEditText(image.displayText || "");
  };

  const closeEditModal = () => {
    setEditingImage(null);
    setReplacementFile(null);
    setEditText("");
  };

  const handleUpdate = async () => {
    const updatedImage = await updateAppImage(editingImage._id, {
      file: replacementFile,
      displayText: editText,
    });
    if (updatedImage) closeEditModal();
  };

  const handleDelete = async (image) => {
    const shouldDelete = window.confirm(
      `Delete ${image.originalName || "this image"}?`
    );

    if (shouldDelete) {
      await deleteAppImage(image._id);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 KB";
    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    const size = bytes / 1024 ** index;
    return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const filteredImages = images.filter((image) => {
    const query = searchQuery.toLowerCase();
    return (
      image.originalName?.toLowerCase().includes(query) ||
      image.displayText?.toLowerCase().includes(query) ||
      image.uploadedBy?.username?.toLowerCase().includes(query) ||
      image.updatedBy?.username?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <PageHeader
        mainHead="App Images"
        subText={`${images.length} Images`}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="mt-5 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col gap-4">
          <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-black transition">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center text-center">
              <ImageUp className="h-10 w-10 text-gray-500" />
              <p className="mt-3 text-sm font-medium text-black">
                Select one or more app images
              </p>
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG, and WEBP images up to 10MB each
              </p>
            </div>
          </label>

          {selectedPreviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-black">
                  Selected Preview
                </h2>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {isUploading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedPreviews.map((preview, index) => (
                  <div
                    key={`${preview.name}-${index}`}
                    className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="h-44 w-full object-cover"
                    />
                    <p className="p-2 text-xs text-gray-700 truncate">
                      {preview.name}
                    </p>
                    <div className="p-2 pt-0">
                      <textarea
                        value={selectedTexts[index] || ""}
                        onChange={(event) =>
                          updateSelectedText(index, event.target.value)
                        }
                        maxLength={500}
                        rows={3}
                        placeholder="Text to display on app"
                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-10 animate-spin" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No app images found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">File Name</th>
                  <th className="px-4 py-3 font-medium">Text</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Added By</th>
                  <th className="px-4 py-3 font-medium">Added Date</th>
                  <th className="px-4 py-3 font-medium">Updated By</th>
                  <th className="px-4 py-3 font-medium">Updated Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredImages.map((image) => (
                  <tr key={image._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={image.imageUrl}
                        alt={image.originalName || "App image"}
                        className="h-14 w-20 rounded-lg object-cover border border-gray-200"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <p className="max-w-56 truncate font-medium">
                        {image.originalName}
                      </p>
                      <p className="max-w-56 truncate text-xs text-gray-500">
                        {image.mimetype}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <p className="max-w-72 line-clamp-2">
                        {image.displayText || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatBytes(image.size)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {image.uploadedBy?.username || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(image.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {image.updatedBy?.username || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(image.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(image)}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                          title="Edit image"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(image)}
                          disabled={deletingImageId === image._id}
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                          title="Delete image"
                        >
                          {deletingImageId === image._id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-medium text-black">Edit App Image</h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    Current Image
                  </p>
                  <img
                    src={editingImage.imageUrl}
                    alt={editingImage.originalName || "Current image"}
                    className="h-40 w-full rounded-lg object-cover border border-gray-200"
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    New Image
                  </p>
                  <label className="h-40 w-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) =>
                        setReplacementFile(event.target.files?.[0] || null)
                      }
                    />
                    {replacementPreview ? (
                      <img
                        src={replacementPreview}
                        alt="Replacement preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageUp className="h-8 w-8 text-gray-400" />
                    )}
                  </label>
                </div>
              </div>

              <p className="mt-3 text-sm font-medium text-black truncate">
                {replacementFile?.name || editingImage.originalName}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {replacementFile
                  ? formatBytes(replacementFile.size)
                  : formatBytes(editingImage.size)}
              </p>

              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-medium text-gray-500">
                  Text to display on app
                </span>
                <textarea
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  placeholder="Enter the text shown with this image in the app"
                />
                <span className="mt-1 block text-right text-xs text-gray-400">
                  {editText.length}/500
                </span>
              </label>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={editingImageId === editingImage._id}
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {editingImageId === editingImage._id ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppImages;
