import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useNavigate, useParams } from "react-router-dom";
import { useVoyageStore } from "../store/useVoyageStore.js";
import { Image, Loader, Package2, Pencil, Trash2 } from "lucide-react";
import ConfirmAlert from "../components/ConfirmAlert.jsx";
import ImagePreview from "../components/ImagePreview.jsx";
import { useVoyagesV2 } from "../store/useVoyagesV2.js";
import EmptyState from "../components/EmptyState.jsx";
import Pagination from "../components/Pagination.jsx";
import AirEditForm from "../components/AirEditForm.jsx";

const VoyageDetails = () => {
  const { voyageId, companyCode } = useParams();

  const {
    companyDetails,
    isCompanyDetailsLoading,
    getCompanyDetailsByVoyage,
    deleteVoyageData,
  } = useVoyageStore();

  const {
    getProductDetails,
    products,
    productError,
    productLoadMore,
    productLoading,
    paginationData,
    currentVoyageInfo,
    companyInfo,
    totalCompanyWeight,
    resetProducts,
    updateProduct,
  } = useVoyagesV2();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProductCode, setSelectedProductCode] = useState(null);
  const [selectedQuantityNumber, setSelectedQuantityNumber] = useState(null);
  const [selectedDataId, setSelectedDataId] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [product, setProduct] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (voyageId && companyCode) {
      resetProducts();

      getProductDetails(
        voyageId,
        companyCode,
        "pending",
        1,
        false,
        searchQuery
      );
    }
  }, [voyageId, companyCode, searchQuery]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const handleShowConfirm = (dataId) => {
    setSelectedDataId(dataId);
    setShowConfirm(true);
  };

  const handleShowImagePreview = (product) => {
    const imageData = product.image || product.images;

    setSelectedImage(imageData);
    setSelectedProductCode(product.productCode);
    setSelectedQuantityNumber(product.quantityNumber);
    setShowImagePreview(true);
  };

  const handleDeleteVoyageData = async () => {
    if (selectedDataId) {
      await deleteVoyageData(voyageId, selectedDataId);
      setShowConfirm(false);
    }
  };

  const handlePageChange = (page) => {
    getProductDetails(
      voyageId,
      companyCode,
      "pending",
      page,
      false,
      searchQuery
    );
  };

  const handleShowEdit = (product) => {
    setShowEdit(true);
    setProduct(product);
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    await updateProduct(productId, updatedData);

    await getProductDetails(
      voyageId,
      companyCode,
      "pending",
      paginationData.currentPage,
      false,
      searchQuery
    );

    setShowEdit(false);
  };

  const renderContent = () => {
    if (productLoading && products.length === 0) {
      return (
        <div className="flex justify-center items-center h-[90vh]">
          <Loader className="size-8 animate-spin" />
        </div>
      );
    }

    if (!productLoading && products.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <EmptyState
            Icon={Package2}
            title="No products details found"
            description={
              searchQuery
                ? "No products match your search criteria. Try adjusting your filters."
                : "Upload the products details to view and manage the data."
            }
          />
        </div>
      );
    }

    return (
      <div className="mt-4">
        {products.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full table-auto border-separate border-spacing-y-2">
              <thead className="bg-white">
                <tr>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    #
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Product Code
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    QTY No
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Tracking Number
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Client Company
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Weight
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Sent Date
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Created By
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Image
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 &&
                  products.map((product, index) => (
                    <tr
                      key={product._id}
                      className="bg-white rounded-xl overflow-hidden"
                    >
                      <td className="py-3 px-5 text-sm text-black">
                        {index + 1}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        {product.productCode}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        {product.sequenceNumber}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        {product.trackingNumber}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        {product.clientCompany}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        {product.weight}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        {product.amount ? product.amount : "-"}{" "}
                        {product.currency}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        {formatDate(product.uploadedDate)}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        {product.uploadedBy}
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        <button
                          onClick={() => handleShowImagePreview(product)}
                          className="cursor-pointer"
                        >
                          <Image />
                        </button>
                      </td>
                      <td className="py-3 px-5 text-sm text-black">
                        <div className="items-center flex gap-2">
                          <div
                            className="cursor-pointer"
                            onClick={() => handleShowConfirm(product._id)}
                          >
                            <Trash2
                              size={16}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            />
                          </div>

                          <div onClick={() => handleShowEdit(product)}>
                            <Pencil
                              size={16}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        mainHead={`Voyage: ${currentVoyageInfo?.voyageNumber || ""} - ${
          companyInfo?.companyCode || "Company"
        }`}
        subText={`${paginationData.totalItems} Products`}
        weight={totalCompanyWeight}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showDateFilter={true}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        placeholder="Search by productcode"
      />

      {renderContent()}

      {paginationData.totalItems > 10 && (
        <div className="mt-4">
          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.totalItems}
            hasPrevPage={paginationData.hasPrevPage}
            hasNextPage={paginationData.hasNextPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo="You want to delete this voyage data?"
            handleClose={() => setShowConfirm(false)}
            handleSubmit={handleDeleteVoyageData}
          />
        </div>
      )}

      {showEdit && (
        <AirEditForm
          data={product}
          close={() => setShowEdit(false)}
          onSubmit={handleUpdateProduct}
        />
      )}

      {showImagePreview && (
        <div
          className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        >
          <ImagePreview
            selectedImage={selectedImage}
            productCode={selectedProductCode}
            quantityNumber={selectedQuantityNumber}
            onClose={() => setShowImagePreview(false)}
          />
        </div>
      )}
    </div>
  );
};

export default VoyageDetails;
