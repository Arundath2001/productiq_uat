import React, { useState } from "react";
import InputLine from "./InputLine";
import SolidButton from "./SolidButton";

const AirEditForm = ({ data, close, onSubmit }) => {
  const [formData, setFormData] = useState({
    trackingNumber: data.trackingNumber || "",
    weight: data.weight || "",
    amount: data.amount || "",
    currency: data.currency || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await onSubmit(data._id, formData);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
        <h3 className="text-center font-bold text-lg border-b-2">
          Edit Product Details
        </h3>

        <div className="mt-2.5">
          <InputLine
            label="Tracking Number"
            value={formData.trackingNumber}
            onChange={(e) => handleChange("trackingNumber", e.target.value)}
          />
          <InputLine
            label="Weight"
            value={formData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
          />
          <InputLine
            label="Amount"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
          />
          <div className="w-full flex flex-col mt-2">
            <label className="text-gray-400 text-[12px]">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full focus:outline-none px-4 py-2 border-b border-gray-500 focus:border-black focus:border-b-2 bg-transparent"
            >
              <option value="">Select Currency</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="QAR">QAR - Qatari Riyal</option>
              <option value="KWD">KWD - Kuwaiti Dinar</option>
              <option value="BHD">BHD - Bahraini Dinar</option>
              <option value="OMR">OMR - Omani Rial</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="MYR">MYR - Malaysian Ringgit</option>
              <option value="THB">THB - Thai Baht</option>
              <option value="KRW">KRW - South Korean Won</option>
              <option value="BRL">BRL - Brazilian Real</option>
              <option value="ZAR">ZAR - South African Rand</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center gap-3.5 mt-4">
          <SolidButton buttonName="Cancel" variant="outline" onClick={close} />
          <SolidButton buttonName="Update" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default AirEditForm;
