import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useParams } from "react-router-dom";
import { useSeaBatchAssign } from "../../store/useSeaBatchAssign";
import Pagination from "../../components/Pagination";
import ImagePreview from "../../components/ImagePreview";
import { Image } from "lucide-react";

const CompanyData = () => {
  const { companyCode, seaContainerId, status = "active" } = useParams();

  const [searchQuery, setSearchQuery] = useState("");

  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProductCode, setSelectedProductCode] = useState(null);

  const {
    seaBatchAssignCompanyData,
    companyDetails,
    seaBatchAssignCompanyLoading,
    seaBatchAssignCompanyLoadMore,
    seaBatchAssignCompanyError,
    getSeaBatchAssignCompanyData,
    paginationData,
  } = useSeaBatchAssign();

  console.log(seaBatchAssignCompanyData);

  // const status = "active";

  useEffect(() => {
    if (companyCode && seaContainerId && status) {
      getSeaBatchAssignCompanyData(
        companyCode,
        seaContainerId,
        status,
        1,
        false,
        searchQuery
      );
    }
  }, [companyCode, seaContainerId, searchQuery]);

  const handlePageChange = (page) => {
    getSeaBatchAssignCompanyData(
      companyCode,
      seaContainerId,
      status,
      page,
      false,
      searchQuery
    );
  };

  const handleShowImagePreview = (seaBatch) => {
    const imageData = [
      ...(seaBatch.deliveryPaperImages || []),
      ...(seaBatch.productImages || []),
    ];
    setSelectedImage(imageData);
    setSelectedProductCode(seaBatch.productCode);
    setShowImagePreview(true);
  };

  const renderContent = () => {
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full table-auto border-separate border-spacing-y-2">
          <thead className="bg-white shadow-sm">
            <tr>
              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Product Code
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                D.No
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Supplier
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Container Number
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Total Qty
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                CBM Type
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Total CBM
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Updated By
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Images
              </th>
            </tr>
          </thead>
          <tbody>
            {seaBatchAssignCompanyData.map((companyData) => (
              <tr
                key={companyData._id}
                className="bg-white shadow-sm rounded-xl overflow-hidden"
              >
                <td className="py-3 px-5 text-sm text-black">
                  {companyData.productCode}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {companyData.seaBatchId.deliveryPaperNumber}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {companyData.seaBatchId.supplierName}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {companyData.seaContainerId.containerNumber}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {companyData.quantityLoaded}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {companyData.cbmCaluculationType}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {companyData.totalCBM}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {companyData.createdBy.username}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  <button
                    onClick={() =>
                      handleShowImagePreview(companyData.seaBatchId)
                    }
                  >
                    <Image className="size-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        mainHead={`${companyDetails.companyCode} - Product details`}
        subText={`${paginationData.totalItems} ${
          paginationData.totalItems > 1 ? "Products" : "Product"
        }`}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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

      {showImagePreview && (
        <div
          className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        >
          <ImagePreview
            selectedImage={selectedImage}
            productCode={selectedProductCode}
            // quantityNumber={selectedQuantityNumber}
            onClose={() => setShowImagePreview(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CompanyData;
