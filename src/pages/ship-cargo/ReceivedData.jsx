import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useSeaBatch } from "../../store/useSeaBatch";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Database,
  Image,
  Info,
  Loader,
  Loader2,
  Pen,
  Pencil,
  Trash2,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";
import QuantityTooltip from "../../components/QuantityTooltip";
import ConfirmAlert from "../../components/ConfirmAlert";
import ReceivedEditForm from "../../components/ReceivedEditForm";
import ImagePreview from "../../components/ImagePreview";

const ReceivedData = () => {
  const {
    getSeaBatchesByBranch,
    seaBatches,
    seaBatchesError,
    seaBatchesLoading,
    paginationData,
    deleteSeaBatch,
    isDeleting,
    updateSeaBatch,
    isUpdating,
  } = useSeaBatch();

  const { authUser } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [batchId, setBatchId] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProductCode, setSelectedProductCode] = useState(null);

  useEffect(() => {
    getSeaBatchesByBranch(authUser.branchId, searchQuery, "active");
  }, [authUser.branchId, searchQuery]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleShowDelete = (seaBatchId) => {
    setShowDelete(true);
    setBatchId(seaBatchId);
  };

  const handleShowEdit = (seaBatch) => {
    setShowEdit(true);
    setBatchId(seaBatch._id);
    setSelectedBatch(seaBatch);
  };

  const handleDeleteBatch = async () => {
    try {
      if (batchId) {
        const result = await deleteSeaBatch(batchId);

        if (result.success) {
          setShowDelete(false);
          setBatchId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
    }
  };

  const handleUpdateBatch = async (batchId, formData) => {
    try {
      // Prepare the update data
      const updateData = {
        deliveryPaperNumber: formData.deliveryPaperNumber,
        supplierName: formData.supplierName,
        totalCBM: parseFloat(formData.totalCBM),
        itemName: formData.itemName,
        // Handle containers if provided
        ...(formData.containerNumber && {
          seaContainers: [
            {
              seaContainerNumber: formData.containerNumber,
            },
          ],
        }),
        // Handle voyage numbers if provided
        ...(formData.voyageNumber && {
          voyageNumbers: [
            {
              seaVoyageNumber: formData.voyageNumber,
            },
          ],
        }),
      };

      const result = await updateSeaBatch(batchId, updateData);

      if (result.success) {
        // Close the modal
        setShowEdit(false);
        setBatchId(null);
        setSelectedBatch(null);
      }
    } catch (error) {
      console.error("Error updating batch:", error);
    }
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
    if (seaBatchesLoading) {
      return (
        <div className="flex justify-center items-center h-[90vh]">
          <Loader2 className="size-8 animate-spin" />
        </div>
      );
    }

    if (!seaBatchesLoading && seaBatches.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <EmptyState
            Icon={Database}
            title="There is no received data yet"
            description={
              searchQuery
                ? "No received data match your search criteria. Try adjusting your filters."
                : "No received data available. New entries will appear here once products are uploaded."
            }
          />
        </div>
      );
    }

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full table-auto border-separate border-spacing-y-2">
          <thead className="bg-white shadow-sm">
            <tr>
              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Received Date
              </th>

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
                Voyage Number
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Total Qty
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Total CBM
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Item Type
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Image
              </th>

              <th className="py-3 px-4 text-left  text-sm font-semibold text-[#000435]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {seaBatches.map((seaBatch) => (
              <tr
                key={seaBatch._id}
                className="bg-white shadow-sm rounded-xl overflow-hidden"
              >
                <td className="py-3 px-5 text-sm text-black">
                  {formatDate(seaBatch.createdAt)}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {seaBatch.productCode}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {seaBatch.deliveryPaperNumber}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {seaBatch.supplierName}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {seaBatch.seaContainers.length > 0
                    ? seaBatch.seaContainers
                        .map((container) => container.seaContainerNumber)
                        .join(", ")
                    : "No Container"}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {seaBatch.voyageNumbers.length > 0
                    ? seaBatch.voyageNumbers
                        .map((voyage) => voyage.seaVoyageNumber)
                        .join(", ")
                    : "No Voyage"}
                </td>

                <td className="py-3 px-5 text-sm text-black flex items-center gap-1 flex-row">
                  {seaBatch.totalQuantity}

                  <QuantityTooltip quantityTypes={seaBatch.quantityTypes} />
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {seaBatch.totalCBM}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  {seaBatch.itemName}
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  <button onClick={() => handleShowImagePreview(seaBatch)}>
                    <Image className="size-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                  </button>
                </td>

                <td className="py-3 px-5 text-sm text-black">
                  <div className="flex items-center gap-2">
                    <div onClick={() => handleShowDelete(seaBatch._id)}>
                      <Trash2 className="size-5 text-red-500 hover:text-red-700 cursor-pointer" />
                    </div>

                    <div onClick={() => handleShowEdit(seaBatch)}>
                      <Pencil className="size-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
            <ConfirmAlert
              alertInfo={`Do you want to delete this batch ?`}
              handleClose={() => setShowDelete(false)}
              handleSubmit={handleDeleteBatch}
              isDeleting={isDeleting}
            />
          </div>
        )}

        {showEdit && selectedBatch && (
          <ReceivedEditForm
            batchId={batchId}
            batchData={selectedBatch}
            onClose={() => {
              setShowEdit(false);
              setBatchId(null);
              setSelectedBatch(null);
            }}
            onSave={handleUpdateBatch}
            isUpdating={isUpdating}
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
              // quantityNumber={selectedQuantityNumber}
              onClose={() => setShowImagePreview(false)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mainHead="Received items"
        subText={`${paginationData?.totalItems} ${
          paginationData.totalItems > 1 ? "items" : "item"
        } `}
      />

      <div>{renderContent()}</div>
    </div>
  );
};

export default ReceivedData;
