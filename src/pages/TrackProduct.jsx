import React from "react";
import { useState } from "react";
import { useTrackProduct } from "../store/useTrackProductStore.js";
import {
  Image,
  Loader,
  Package,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  XCircle,
  Box,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ImagePreview from "../components/ImagePreview.jsx";

const PackageDetails = ({ pkg, formatDate }) => {
  const [expanded, setExpanded] = useState(false);

  if (!pkg) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-400">
          <Box className="h-4 w-4" />
          <p className="text-sm">Not yet added to any package</p>
        </div>
      </div>
    );
  }

  const statusColor =
    pkg.status === "shipped"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="items-center flex w-full justify-between"
      >
        <div className="items-center flex gap-2">
          <Box className="h-4 w-4 text-indigo-400" />
          <p className="text-sm font-semibold text-gray-600">Package Details</p>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${statusColor}`}
          >
            {pkg.status === "shipped" ? "Shipped" : "Packed"}
          </span>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">Goni Name</p>
              <p className="text-base font-semibold text-gray-900">
                {pkg.goniId?.goniName}
              </p>
            </div>

            <div className="bg-indigo-50 p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">Goni Number</p>
              <p className="text-base font-semibold text-gray-900">
                {pkg.goniNumber}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">Package Weight</p>
              <p className="text-base font-semibold text-gray-900">
                {pkg.packageWeight} kg
              </p>
            </div>

            <div className="bg-indigo-50 p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">Packaged By</p>
              <p className="text-base font-semibold text-gray-900">
                {pkg.packagedBy?.username || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="bg-indigo-50 p-2 rounded">
              <p className="text-xs text-gray-500 mb-1">Packaged Date</p>
              <p className="text-base font-semibold text-gray-900">
                {formatDate(pkg.packagedDate)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrackProduct = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProductCode, setSelectedProductCode] = useState(null);
  const [selectedQuantityNumber, setSelectedQuantityNumber] = useState(null);

  const {
    productDetails,
    isLoading,
    error,
    trackProduct,
    resetTracking,
    clearProductDetails,
  } = useTrackProduct();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    try {
      await trackProduct(trackingNumber);
    } catch (error) {}
  };

  const handleClearInput = () => {
    setTrackingNumber("");
    clearProductDetails();
  };

  const handleShowImagePreview = (productDetails) => {
    const imageData = productDetails.images || productDetails.image;

    setSelectedImage(imageData);
    setSelectedProductCode(productDetails.productCode);
    setSelectedQuantityNumber(productDetails.quantityNumber);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
      timeZone: "Asia/Dubai",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-2xl font-semibold mb-6">Track Product</p>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="flex items-stretch gap-4">
            <div className="flex flex-1 items-center gap-4 rounded-lg shadow-sm border border-gray-400 p-4">
              <Search className="text-gray-400 h-5 w-5" />
              <input
                className="w-full outline-none"
                type="text"
                placeholder="Enter Tracking Number (e.g., AWF123456789)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                disabled={isLoading}
              />
              {trackingNumber && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <button
              className="px-8 py-3 text-sm bg-black text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              Track Product
            </button>
          </form>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <Loader className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-xl text-gray-600 mb-2">Tracking Product...</p>
          <p className="text-gray-500">
            Please wait while we fetch your shipment details
          </p>
        </div>
      )}

      {!isLoading && !productDetails && trackingNumber === "" && (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">Track Your Product</p>
          <p className="text-gray-500">
            Enter a tracking number above to get detailed information about your
            shipment
          </p>
        </div>
      )}

      {!isLoading && !productDetails && trackingNumber !== "" && !error && (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <Search className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <p className="text-xl text-blue-600 mb-2">Ready to Track</p>
          <p className="text-gray-500 mb-4">
            Press{" "}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              Enter
            </kbd>{" "}
            or click "Track Product" to search for "{trackingNumber}"
          </p>
        </div>
      )}

      {!isLoading && !productDetails && trackingNumber !== "" && error && (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-red-600 mb-2">Product Not Found</p>
          <p className="text-gray-500 mb-4">
            We couldn't find any product with tracking number "{trackingNumber}
            ". Please check the number and try again.
          </p>
          <button
            onClick={handleClearInput}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Track New Item
          </button>
        </div>
      )}

      <div className="space-y-4">
        {productDetails &&
          productDetails.map((product) => (
            <div
              key={product._id}
              className={`bg-white p-6 rounded-xl shadow-sm border-l-4  ${
                product.status === "completed"
                  ? "border-green-400"
                  : "border-orange-400"
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Product Code</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {product.productCode}
                  </p>
                </div>
                <button
                  onClick={() => handleShowImagePreview(product)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <Image className="h-5 w-5" />
                  <span className="text-sm font-medium">View Image</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="bg-gray-100 p-2">
                  <p className="text-sm text-gray-500 mb-2">Quantity</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {product.sequenceNumber}
                  </p>
                </div>
                <div className="bg-gray-100 p-2">
                  <p className="text-sm text-gray-500 mb-2">Weight</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {product.weight}
                  </p>
                </div>
                <div className="bg-gray-100 p-2">
                  <p className="text-sm text-gray-500 mb-2">Voyage</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {product.voyageNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="bg-gray-100 p-2">
                  <p className="text-sm text-gray-500 mb-2">Company</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {product.clientCompany}
                  </p>
                </div>
                <div className="bg-gray-100 p-2">
                  <p className="text-sm text-gray-500 mb-2">Uploaded By</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {product.uploadedBy.username}
                  </p>
                </div>
                <div className="bg-gray-100 p-2">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {product.status === "completed" ? "Exported" : "Received"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ArrowDown className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Received Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(product.uploadedDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ArrowUp className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Exported Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(product.exportedDate)}
                    </p>
                  </div>
                </div>
              </div>

              <PackageDetails
                pkg={product.packageDetails}
                formatDate={formatDate}
              />
            </div>
          ))}
      </div>

      {showImageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        >
          <ImagePreview
            selectedImage={selectedImage}
            productCode={selectedProductCode}
            quantityNumber={selectedQuantityNumber}
            onClose={() => setShowImageModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default TrackProduct;
