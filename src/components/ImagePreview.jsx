import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React from "react";
import Tooltip from "./Tooltip";
import { useState } from "react";
import { useEffect } from "react";

const ImagePreview = ({
  onClose,
  selectedImage,
  productCode,
  quantityNumber,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (Array.isArray(selectedImage)) {
      setImages(selectedImage);
    } else if (selectedImage) {
      setImages([selectedImage]);
    } else {
      setImages([]);
    }
    setCurrentImageIndex(0);
  }, [selectedImage]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") handlePrevImage();
    if (e.key === "ArrowRight") handleNextImage();
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 max-w-md">
        <p className="text-center text-gray-500">No images available</p>

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg max-w-4xl w-full mx-4">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h3 className="text-lg font-medium">Product Image</h3>
          {(productCode || quantityNumber) && (
            <p className="mt-1 text-sm text-gray-500">
              {productCode && `Product Code : ${productCode}`}
              {quantityNumber && " | "}
              {quantityNumber && `QTY No : ${quantityNumber}`}
            </p>
          )}

          {images.length > 1 && (
            <p className="mt-1 text-sm text-gray-500">
              Image {currentImageIndex + 1} of {images.length}
            </p>
          )}
        </div>
        <button
          className="cursor-pointer hover:text-gray-600 hover:bg-gray-200 rounded-full p-1"
          onClick={onClose}
        >
          <Tooltip text="close (esc)" position="right">
            <X className="h-5 w-5" />
          </Tooltip>
        </button>
      </div>
      <div className="relative mt-2 mb-2">
        <img
          className="max-w-full max-h-[70vh] rounded-lg object-contain mx-auto"
          src={images[currentImageIndex]}
          alt={`Preview image ${currentImageIndex + 1}`}
        />

        {images.length > 1 && (
          <div>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 text-white cursor-pointer top-1/2 -translate-y-1/2  p-2 rounded-full bg-black/50 hover:bg-black/70"
              title="Previous (←)"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2  text-white cursor-pointer top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"
              title="Next (→)"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
