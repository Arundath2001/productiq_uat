import React, { useState, useEffect } from "react";
import InputLine from "../components/InputLine";
import BillOfLadingPDF from "./test";
import Modal from "../components/Modal";
import { useBillStore } from "../store/useBillStore";
import toast from "react-hot-toast";
import { Edit, Trash2 } from "lucide-react";
import SearchableDropdown from "../components/SearchableDropdown ";

const BillofLading = ({ bill, onClose }) => {
  const [formData, setFormData] = useState({
    billNo: "",
    codeName: "",
    shipper: "",
    consignee: "",
    agentDestination: "",
    vessel: "",
    voyNo: "",
    originalAndCopy: "",
    preCarriageBy: "",
    notifyAddress: "",
    portLoading: "",
    placeReceipt: "",
    portDischarge: "",
    portDelivery: "",
    telephone: "",
    freeDays: "FREE",
    freightStatus: "",
    typeofService: "",
    fax: "",
    issuePlace: "",
    issueDate: "",
    oceanVessel: "",
    voyageNumber: "",
    freightPayableAt: "",
    items: [],
    draft: false,
    negotiable: false,
    blType: "",
    shipOnDate: false,
    shipDate: "",
  });

  const { saveBill, updateBill, editingBill, getBillById } = useBillStore();

  const [isSameAsConsigned, setIsSameAsConsigned] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [goodsData, setGoodsData] = useState({
    marksNos: "",
    sealNo: "",
    grossWeight: "",
    measurement: "",
    ctnType: "",
    noofPieces: "",
    quantityDescription: "",
  });

  const [goodsList, setGoodsList] = useState([]);

  useEffect(() => {
    if (editingBill) {
      setFormData(editingBill);
      setGoodsList(editingBill.items || []);
    } else if (bill && Object.keys(bill).length > 0) {
      setFormData(bill);
      setGoodsList(bill.items || []);
    }
  }, [bill, editingBill]);

  const handleOpenPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleSave = async () => {
    try {
      await saveBill(formData);
      toast.success("Bill of Lading saved successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving Bill of Lading:", error);
      toast.error("Failed to save Bill of Lading.");
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoodsChange = (e) => {
    setGoodsData({
      ...goodsData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddGoods = () => {
    // if (
    //   !goodsData.marksNos ||
    //   !goodsData.grossWeight ||
    //   !goodsData.measurement ||
    //   !goodsData.quantityDescription
    // ) {
    //   toast.error("Please fill all fields before adding.");
    //   return;
    // }

    let newGoodsList;

    if (editingIndex !== null) {
      // Update existing item
      newGoodsList = goodsList.map((item, index) =>
        index === editingIndex ? goodsData : item,
      );
      toast.success("Item updated successfully!");
      setEditingIndex(null);
    } else {
      // Add new item
      newGoodsList = [...goodsList, goodsData];
      toast.success("Item added successfully!");
    }

    setGoodsList(newGoodsList);
    setFormData((prevState) => ({
      ...prevState,
      items: newGoodsList,
    }));

    // Reset goods data
    setGoodsData({
      marksNos: "",
      sealNo: "",
      grossWeight: "",
      measurement: "",
      noofPieces: "",
      ctnType: "",
      hsCode: "",
      qtyType: "",
      quantityDescription: "",
    });
  };

  const handleEditItem = (index) => {
    const itemToEdit = goodsList[index];
    setGoodsData({
      marksNos: itemToEdit.marksNos,
      sealNo: itemToEdit.sealNo,
      grossWeight: itemToEdit.grossWeight,
      measurement: itemToEdit.measurement,
      ctnType: itemToEdit.ctnType,
      noofPieces: itemToEdit.noofPieces,
      quantityDescription: itemToEdit.quantityDescription,
    });
    setEditingIndex(index);

    // Scroll to the goods form
    window.scrollTo({
      top: document.querySelector('[name="marksNos"]')?.offsetTop - 100 || 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setGoodsData({
      marksNos: "",
      sealNo: "",
      grossWeight: "",
      measurement: "",
      noofPieces: "",
      ctnType: "",
      quantityDescription: "",
    });
  };

  const handleRemoveItem = (index) => {
    setGoodsList((prevGoodsList) => {
      const updatedList = prevGoodsList.filter((_, i) => i !== index);

      setFormData((prevFormData) => ({
        ...prevFormData,
        items: updatedList,
      }));

      toast.success("Item removed successfully!");
      return updatedList;
    });

    // If we were editing this item, cancel the edit
    if (editingIndex === index) {
      handleCancelEdit();
    }
  };

  const handleDraftChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      draft: !!e.target.checked,
    }));
  };

  const handleShipOnDateChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      shipOnDate: !!e.target.checked,
    }));
  };

  const handleNegoChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      negotiable: e.target.checked,
    }));
  };

  const handleConsignedCheckbox = (e) => {
    const isChecked = e.target.checked;
    setIsSameAsConsigned(isChecked);

    setFormData((prev) => ({
      ...prev,
      notifyAddress: isChecked ? "SAME AS CONSIGNED" : "",
    }));
  };

  const splitItemsIntoPages = (items, itemsPerPage = 12) => {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage));
    }
    return pages;
  };

  const blTypeOptions = [
    { name: "DRAFT" },
    { name: "ORIGINAL" },
    { name: "TELEX RELEASE" },
    { name: "COPY" },
  ];

  const qtyType = [{ name: "PACKAGES" }, { name: "CARTONS" }, { name: "-" }];

  const handleQtyType = (selectedType) => {
    setFormData({
      ...formData,
      qtyType: selectedType.name,
    });
  };

  const handleBLTypeSelect = (selectedType) => {
    setFormData({
      ...formData,
      blType: selectedType.name,
    });
  };

  return (
    <div>
      <p className="text-black font-semibold mb-5">Bill of Lading</p>

      <p className="text-black font-semibold bg-gray-300 px-1 py-1 mb-2">
        Shipping Details
      </p>

      <div className="flex flex-row items-center mb-2">
        <input
          type="checkbox"
          checked={formData.draft}
          onChange={handleDraftChange}
        />
        <p className="text-gray-400 text-sm ml-2">Draft</p>
      </div>

      <SearchableDropdown
        label="BL Type"
        placeholder="Select Type"
        options={blTypeOptions}
        onSelect={handleBLTypeSelect}
        value={formData.blType ? { name: formData.blType } : null}
      />

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          label="Bill No"
          name="billNo"
          value={formData.billNo}
          onChange={handleInputChange}
          placeholder="Enter Billing Number"
        />
        <InputLine
          label="MBL"
          name="codeName"
          value={formData.codeName}
          onChange={handleInputChange}
          placeholder="Enter MBL"
        />
      </div>

      <div className="w-full flex flex-col gap-1">
        <label className="text-[12px] text-gray-400">Shipper</label>
        <textarea
          name="shipper"
          value={formData.shipper}
          onChange={handleInputChange}
          className="h-20 border border-gray-400 px-2"
          placeholder="Enter the details"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <div className="w-full flex flex-col gap-1">
          <label className="text-[12px] text-gray-400">
            Consigned order to
          </label>
          <textarea
            name="consignee"
            value={formData.consignee}
            onChange={handleInputChange}
            className="h-20 border border-gray-400 px-2"
            placeholder="Enter the details"
          />
        </div>
        <InputLine
          label="Phone Number"
          name="telephone"
          value={formData.telephone}
          onChange={handleInputChange}
          placeholder="Enter Phone Number"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <div className="w-full flex flex-col gap-1">
          <label className="text-[12px] text-gray-400">Notify Address</label>
          <textarea
            name="notifyAddress"
            value={formData.notifyAddress}
            onChange={handleInputChange}
            className="h-20 border border-gray-400 px-2"
            placeholder="Enter the details"
            disabled={isSameAsConsigned}
          />
        </div>
        <div className="w-full flex flex-row items-center mb-2">
          <input
            type="checkbox"
            checked={isSameAsConsigned}
            onChange={handleConsignedCheckbox}
          />
          <p className="text-gray-400 text-sm ml-2">
            Same as Consigned Address
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col gap-1">
        <label className="text-[12px] text-gray-400">
          Agent at Destination
        </label>
        <textarea
          name="agentDestination"
          value={formData.agentDestination}
          onChange={handleInputChange}
          className="h-20 border border-gray-400 px-2"
          placeholder="Enter the details"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          name="portLoading"
          value={formData.portLoading}
          onChange={handleInputChange}
          label="Port of loading"
          placeholder="Enter Port of loading"
        />

        <InputLine
          name="portDelivery"
          value={formData.portDelivery}
          onChange={handleInputChange}
          label="Place of Final Delivery"
          placeholder="Enter place of final delivery"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          name="portDischarge"
          value={formData.portDischarge}
          onChange={handleInputChange}
          label="Port of Discharge"
          placeholder="Enter port of discharge"
        />

        <InputLine
          name="placeReceipt"
          value={formData.placeReceipt}
          onChange={handleInputChange}
          label="Place of Receipt"
          placeholder="Enter place of receipt"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          name="preCarriageBy"
          value={formData.preCarriageBy}
          onChange={handleInputChange}
          label="Pre Carriage By"
          placeholder="Enter Pre Carriage By"
        />

        <InputLine
          name="originalAndCopy"
          value={formData.originalAndCopy}
          onChange={handleInputChange}
          label="No. of Original & Copy"
          placeholder="Enter No. of Original & Copy"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          name="vessel"
          value={formData.vessel}
          onChange={handleInputChange}
          label="vessel"
          placeholder="Enter vessel"
        />

        <InputLine
          name="voyNo"
          value={formData.voyNo}
          onChange={handleInputChange}
          label="Voy No"
          placeholder="Enter Voy No"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <div className="w-full flex flex-col gap-1">
          <label className="text-[12px] text-gray-400">
            For Delivery Apply to
          </label>
          <textarea
            className="h-20 border border-gray-400 px-2"
            placeholder="Enter the details"
          />
        </div>
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          name="oceanVessel"
          value={formData.oceanVessel}
          onChange={handleInputChange}
          label="Ocean Vessel"
          placeholder="Enter ocean vessel"
        />
        <InputLine
          name="voyageNumber"
          value={formData.voyageNumber}
          onChange={handleInputChange}
          label="Voyage Number"
          placeholder="Enter voyage Number"
        />
        <InputLine
          name="freightPayableAt"
          value={formData.freightPayableAt}
          onChange={handleInputChange}
          label="Freight Payable at"
          placeholder="Enter Freight Payable at"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          name="telephone"
          value={formData.telephone}
          onChange={handleInputChange}
          label="Phone Number"
          placeholder="Enter Phone Number"
        />
        <InputLine
          name="fax"
          value={formData.fax}
          onChange={handleInputChange}
          label="Fax Number"
          placeholder="Enter Fax Number"
        />

        <InputLine
          name="freeDays"
          value={formData.freeDays}
          onChange={handleInputChange}
          label="Free Days"
          placeholder="Enter Free Days"
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          name="freightStatus"
          value={formData.freightStatus}
          onChange={handleInputChange}
          label="Freight Status"
          placeholder="Enter Freight Status"
        />

        <InputLine
          name="typeofService"
          value={formData.typeofService}
          onChange={handleInputChange}
          label="Type of Service"
          placeholder="Enter Type of Service"
        />
      </div>

      <p className="text-black font-semibold bg-gray-300 px-1 py-1 mb-2">
        Goods Details{" "}
        {editingIndex !== null && (
          <span className="text-blue-600">
            (Editing Item #{editingIndex + 1})
          </span>
        )}
      </p>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          label="Marks and Nos."
          name="marksNos"
          value={goodsData.marksNos}
          onChange={handleGoodsChange}
          placeholder="Enter Marks and Nos."
        />

        <InputLine
          label="Seal"
          name="sealNo"
          value={goodsData.sealNo}
          onChange={handleGoodsChange}
          placeholder="Enter Seal"
        />

        <InputLine
          label="Gross Weight, Kg"
          name="grossWeight"
          value={goodsData.grossWeight}
          onChange={handleGoodsChange}
          placeholder="Enter Gross Weight"
        />
        <InputLine
          label="Measurement, meter cube"
          name="measurement"
          value={goodsData.measurement}
          onChange={handleGoodsChange}
          placeholder="Enter Measurement"
        />
      </div>

      <div className="flex gap-10">
        <InputLine
          label="No of Pieces"
          name="noofPieces"
          value={goodsData.noofPieces}
          onChange={handleGoodsChange}
          placeholder="Enter No of Pieces"
        />

        <InputLine
          label="Container Type"
          name="ctnType"
          value={goodsData.ctnType}
          onChange={handleGoodsChange}
          placeholder="Enter Container Type"
        />

        <InputLine
          label="HS Code"
          name="hsCode"
          value={goodsData.hsCode}
          onChange={handleGoodsChange}
          placeholder="Enter Container Type"
        />

        <SearchableDropdown
          label="Quantity Type"
          placeholder="Select Quantity Type"
          options={qtyType}
          onSelect={handleQtyType}
          value={formData.qtyType ? { name: formData.qtyType } : null}
        />
      </div>

      <div className="flex flex-row gap-10 mb-4">
        <div className="w-full">
          <label className="text-[12px] text-gray-400">
            Quantity & Description of Goods
          </label>
          <textarea
            name="quantityDescription"
            value={goodsData.quantityDescription}
            onChange={handleGoodsChange}
            className="border border-gray-400 px-2 py-1 w-full h-20"
            placeholder="Enter Quantity & Description"
          />
        </div>
        <div className="w-full flex flex-row gap-2 items-center mb-4">
          <button
            onClick={handleAddGoods}
            className="bg-black px-4 py-2 text-white rounded-xl hover:bg-gray-800"
          >
            {editingIndex !== null ? "Update Item" : "+ Add"}
          </button>
          {editingIndex !== null && (
            <button
              onClick={handleCancelEdit}
              className="bg-gray-500 px-4 py-2 text-white rounded-xl hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
        <div className="flex flex-row items-center mb-2">
          <input
            type="checkbox"
            checked={formData.negotiable}
            onChange={handleNegoChange}
          />

          <p className="text-gray-400 text-sm ml-2">Negotiable</p>
        </div>
      </div>

      {goodsList.length > 0 && (
        <div className="mt-4 mb-4">
          <p className="text-black font-semibold bg-gray-300 px-1 py-1 mb-2">
            Added Goods
          </p>

          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2">
                  Marks & Nos.
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  Gross Weight (Kg)
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  Measurement (m³)
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  No of Pieces
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  Container Type
                </th>
                <th className="border border-gray-400 px-4 py-2">HS Code</th>
                <th className="border border-gray-400 px-4 py-2">
                  Quantity & Description
                </th>
                <th className="border border-gray-400 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {goodsList.map((item, index) => (
                <tr
                  key={index}
                  className={`text-center ${
                    editingIndex === index ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="border border-gray-400 px-4 py-2">
                    {item.marksNos}
                    <br />
                    SEAL#{item.sealNo}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {item.grossWeight}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {item.measurement}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {item.noofPieces}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {item.ctnType}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {item.hsCode}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {item.quantityDescription}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditItem(index)}
                        title="Edit"
                      >
                        <Edit className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        title="Delete"
                      >
                        <Trash2 className="text-red-500 hover:text-red-700 cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-black font-semibold bg-gray-300 px-1 py-1 mb-2">
        Signed By
      </p>

      <div className="flex flex-row gap-10 mb-4">
        <InputLine
          label="Place of Issue"
          name="issuePlace"
          value={formData.issuePlace}
          onChange={handleInputChange}
          placeholder="Enter place of issue"
        />
        <InputLine
          label="Date of Issue"
          name="issueDate"
          value={formData.issueDate}
          onChange={handleInputChange}
          placeholder="Enter date of issue"
        />
      </div>

      <p className="text-black font-semibold bg-gray-300 px-1 py-1 mb-2">
        Shipped On Board
      </p>

      <div className="flex flex-row items-center mb-2">
        <input
          type="checkbox"
          checked={formData.shipOnDate}
          onChange={handleShipOnDateChange}
        />
        <p className="text-gray-400 text-sm ml-2">Shipped on Date</p>
      </div>

      {formData.shipOnDate && (
        <div className="mb-3">
          <InputLine
            label="Ship Date"
            name="shipDate"
            type="date"
            value={formData.shipDate}
            onChange={handleInputChange}
            placeholder="Enter ship date"
          />
        </div>
      )}

      <p className="text-black font-semibold bg-gray-300 px-1 py-1 mb-2">
        Save your PDF
      </p>

      <div className="justify-center flex items-center mt-8 mb-8">
        <button
          onClick={handleSave}
          className="bg-black rounded-xl px-5 py-3 text-white hover:bg-gray-800"
        >
          Save Bill of Lading
        </button>
      </div>
    </div>
  );
};

export default BillofLading;
