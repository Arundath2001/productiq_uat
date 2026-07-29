import { Eye, PlaneTakeoff, Ship, Trash2 } from "lucide-react";
import React from "react";

const VoyageCard = ({ voyage, type = "sea", onDelete, onViewClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getVoyageInfo = () => {
    if (type === "sea") {
      return {
        voyageNumber: voyage.seaVoyageNumber,
        voyageTitle: `Sea Voyage No: ${voyage.seaVoyageNumber}`,
        voyageSubTitle: `Line: ${voyage.lineId?.lineName || "N/A"}`,
      };
    } else if (type === "air") {
      return {
        voyageNumber: voyage.voyageNumber,
        voyageTitle: `Air Voyage No: ${voyage.voyageNumber}`,
        voyageSubTitle: null,
      };
    }
  };

  const voyageInfo = getVoyageInfo();

  const handleViewClick = () => {
    if (type === "sea") {
      onViewClick(voyage._id, voyage.lineId?._id);
    } else {
      onViewClick(voyage._id);
    }
  };

  const handleDeleteVoyage = () => {
    onDelete(voyage._id, voyageInfo.voyageNumber);
  };

  return (
    <div
      key={voyage._id}
      className="bg-white p-4 rounded-xl shadow-sm hover:shadow-gray-500 flex justify-between items-center px-4 py-2.5 mb-2.5"
    >
      <div className="flex items-center gap-3">
        <div className="bg-blue-50 p-2 rounded-lg">
          {type === "sea" ? (
            <Ship className="size-5 text-blue-500" />
          ) : (
            <PlaneTakeoff className="size-5 text-blue-500" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {voyageInfo.voyageTitle}
          </p>
          {voyageInfo.voyageSubTitle && (
            <p className="text-xs text-gray-500">{voyageInfo.voyageSubTitle}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <p className="text-[12px] text-gray-500">
          Created Date : {formatDate(voyage.createdAt)}
        </p>

        <div
          onClick={handleViewClick}
          className="flex text-sm items-center gap-1.5 rounded-xl border px-2 py-1.5 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 cursor-pointer"
        >
          <Eye size={16} />
          <span>View</span>
        </div>

        <div onClick={handleDeleteVoyage}>
          <Trash2
            size={16}
            className="text-gray-500 hover:text-red-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default VoyageCard;
