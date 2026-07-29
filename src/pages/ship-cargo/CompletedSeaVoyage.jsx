import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useAuthStore } from "../../store/useAuthStore";
import { useSeaVoyageStore } from "../../store/useSeaVoyageStore";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Eye,
  Loader,
  Ship,
  TruckIcon,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { useNavigate } from "react-router-dom";
import { FaCalendarCheck } from "react-icons/fa";
import VoyageStatusForm from "../../components/VoyageStatusForm";

const CompletedSeaVoyage = () => {
  const { authUser } = useAuthStore();
  const {
    getSeaVoyages,
    seaVoyages,
    seaVoyageError,
    paginationData,
    seaVoyageLoadMore,
    seaVoyageLoading,
    resetVoyages,
    updateCompletedVoyageStatus,
  } = useSeaVoyageStore();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVoyageData, setSelectedVoyageData] = useState(null);
  const [showVoyageForm, setShowVoyageForm] = useState(false);

  useEffect(() => {
    resetVoyages();
    getSeaVoyages("completed", false, 1, searchQuery);
  }, [authUser.branchId, searchQuery]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleViewClick = (seaVoageId, lineId) => {
    navigate(
      `/dashboard/sea-voyage/${seaVoageId}/container/${lineId}/completed`
    );
  };

  const handleShowForm = (voyageId) => {
    const voyage = seaVoyages.find((v) => v._id === voyageId);

    if (voyage) {
      setSelectedVoyageData(voyage);
    }
    setShowVoyageForm(true);
  };

  const handleVoyageUpdate = async (updateData) => {
    try {
      await updateCompletedVoyageStatus({
        updatedData: updateData,
        voyageId: selectedVoyageData._id,
      });

      setShowVoyageForm(false);

      await getSeaVoyages();

      setSelectedVoyageData(null);
    } catch (error) {
      console.error("Failed to update voyage:", error);
    }
  };

  const renderContent = () => {
    if (seaVoyageLoading && seaVoyages.length === 0) {
      return (
        <div className="flex justify-center items-center h-[90vh]">
          <Loader className="size-8 animate-spin" />
        </div>
      );
    }

    if (!seaVoyageLoading && seaVoyages.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <EmptyState
            Icon={Ship}
            title="No completed Sea voyages found"
            description={
              searchQuery
                ? "No sea voyages match your search criteria. Try adjusting your filters."
                : "Start by creating your first sea voyage to manage your shipments."
            }
          />
        </div>
      );
    }

    return (
      <div className="mt-4">
        {seaVoyages.map((voyage) => (
          <div
            key={voyage._id}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-gray-500 flex justify-between items-center px-4 py-2.5 mb-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Ship className="size-5 text-blue-500" />
              </div>
              <div className="flex gap-0.5 flex-col">
                <div className="flex flex-row gap-2.5">
                  <p className="text-sm font-semibold text-gray-800">
                    Sea voyage No: {voyage.seaVoyageNumber}
                  </p>

                  <div>
                    {voyage.trackingStatus && (
                      <div
                        className={`flex gap-0.5 px-2 py-0.5 rounded-full 
      ${
        voyage.trackingStatus === "delayed"
          ? "bg-yellow-100 text-yellow-600"
          : ""
      }
      ${
        voyage.trackingStatus === "dispatched"
          ? "bg-blue-100 text-blue-600"
          : ""
      }
      ${
        voyage.trackingStatus === "received"
          ? "bg-green-100 text-green-600"
          : ""
      }`}
                      >
                        {voyage.trackingStatus === "delayed" && (
                          <AlertTriangle size={15} strokeWidth={3} />
                        )}
                        {voyage.trackingStatus === "dispatched" && (
                          <TruckIcon size={15} strokeWidth={3} />
                        )}
                        {voyage.trackingStatus === "received" && (
                          <CheckCircle size={15} strokeWidth={3} />
                        )}

                        <span className="text-xs font-semibold">
                          {voyage.trackingStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Line : {voyage.lineId.lineName}
                </p>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Calendar size={12} color="gray" className="mr-0.5" />
                    <span className="text-xs text-gray-500 mr-1 leading-none">
                      Expected Date :
                    </span>
                    <p className="text-xs text-black bg-gray-100 px-2 py-0.5 rounded-md">
                      {formatDate(voyage.expectedDate)}
                    </p>
                  </div>

                  {voyage.delayMessage && (
                    <div className="border-r-2 border-gray-400 h-4" />
                  )}

                  {voyage.delayMessage && (
                    <div className="flex items-center bg-red-100 px-2 py-0.5 rounded-md">
                      <p className="text-xs text-red-400 mr-1 font-semibold">
                        Delay Message :
                      </p>
                      <p className="text-xs text-red-400 ">
                        {voyage.delayMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <p className="text-[12px] text-gray-500">
                Created Date : {formatDate(voyage.createdAt)}
              </p>

              <div
                onClick={() => handleViewClick(voyage._id, voyage.lineId._id)}
                className="flex text-sm items-center gap-1.5 rounded-xl border px-2 py-1.5 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 cursor-pointer"
              >
                <Eye size={16} />
                <span>View</span>
              </div>

              <div
                className="cursor-pointer"
                onClick={() => handleShowForm(voyage._id)}
              >
                <FaCalendarCheck color="gray" />
              </div>

              {/* <div
                onClick={() =>
                  handleShowDeleteConfirm(voyage._id, voyage.seaVoyageNumber)
                }
              >
                <Trash2
                  size={16}
                  className="text-gray-500 hover:text-red-500 cursor-pointer"
                />
              </div> */}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        mainHead={`Completed Sea Voyages`}
        subText={`${paginationData.totalItems} ${
          paginationData.totalItems > 1 ? "voyages" : "voyage"
        }`}
      />

      {renderContent()}

      {showVoyageForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <VoyageStatusForm
            voyageName={selectedVoyageData.voyageName}
            expectedDate={selectedVoyageData.expectedDate}
            delayMessage={selectedVoyageData.delayMessage}
            onClose={() => setShowVoyageForm(false)}
            onUpdate={handleVoyageUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default CompletedSeaVoyage;
