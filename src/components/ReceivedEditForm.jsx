import React, { useState, useEffect } from "react";
import SolidButton from "./SolidButton";
import InputLine from "./InputLine";

const ReceivedEditForm = ({
  batchId,
  batchData,
  onClose,
  onSave,
  isUpdating,
}) => {
  const [formData, setFormData] = useState({
    deliveryPaperNumber: batchData?.deliveryPaperNumber || "",
    supplierName: batchData?.supplierName || "",
    containerNumber: batchData?.seaContainers?.[0]?.seaContainerNumber || "",
    voyageNumber: batchData?.voyageNumbers?.[0]?.seaVoyageNumber || "",
    totalCBM: batchData?.totalCBM || "",
    itemName: batchData?.itemName || "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await onSave(batchId, formData);
    } catch (error) {
      console.error("Error saving batch:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
        <h1 className="text-center font-medium text-base mb-3.5">
          EDIT RECEIVED DATA
        </h1>

        <div className="h-0.5 bg-gray-700 mb-6" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <InputLine
            label="Enter D.NO"
            placeholder="Enter D.NO"
            onChange={handleChange}
            value={formData.deliveryPaperNumber}
            name="deliveryPaperNumber"
          />

          <InputLine
            label="Enter Supplier"
            placeholder="Enter Supplier"
            onChange={handleChange}
            value={formData.supplierName}
            name="supplierName"
          />

          <InputLine
            label="Enter Container Number"
            placeholder="Enter Container Number"
            onChange={handleChange}
            value={formData.containerNumber}
            name="containerNumber"
          />

          {/* <InputLine
            label="Enter Voyage Number"
            placeholder="Enter Voyage Number"
            onChange={handleChange}
            value={formData.voyageNumber}
            name="voyageNumber"
          /> */}

          {/* <InputLine
            label="Enter Total CBM"
            placeholder="Enter Total CBM"
            onChange={handleChange}
            value={formData.totalCBM}
            name="totalCBM"
            type="number"
            step="0.01"
          /> */}

          <InputLine
            label="Enter Item Type"
            placeholder="Enter Item Type"
            onChange={handleChange}
            value={formData.itemName}
            name="itemName"
          />

          <div className="flex gap-4 justify-center mt-4">
            <SolidButton
              buttonName="Cancel"
              variant="outlined"
              onClick={onClose}
              disabled={isUpdating}
              type="button"
            />
            <SolidButton
              buttonName="Save"
              type="submit"
              disabled={isUpdating}
              isLoading={isUpdating}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceivedEditForm;
