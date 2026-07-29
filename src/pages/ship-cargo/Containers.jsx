import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useSeaContainerStore } from "../../store/useSeaContainerStore";
import { useAuthStore } from "../../store/useAuthStore";
import {
  ArrowRightLeft,
  Container,
  Eye,
  FileSpreadsheet,
  Loader,
  PlusCircle,
  Trash2,
} from "lucide-react";
import ConfirmAlert from "../../components/ConfirmAlert";
import CreateContainer from "../../components/CreateContainer";
import { useSeaVoyageStore } from "../../store/useSeaVoyageStore";
import Pagination from "../../components/Pagination";
import { useSeaBatchAssign } from "../../store/useSeaBatchAssign";
import { generateSeaContainerExcel } from "../../lib/seaContainerExcel";
import ChangeSeaVoyageModal from "../../components/ChangeSeaVoyageModal";

const Containers = () => {
  const { seaVoyageId, lineId, status = "pending" } = useParams();

  const { closeSeaVoyage } = useSeaVoyageStore();

  const {
    getSeaContainers,
    seaContainers,
    seaContainerLoading,
    deleteSeaContainer,
    isDeleting,
    createSeaContainer,
    isCreating,
    seaVoyage,
    paginationData,
    changeSeaContainerVoyage,
    isChangingVoyage,
  } = useSeaContainerStore();

  const {
    getContainerExportData,
    exportLoading,
  } = useSeaBatchAssign();

  const { authUser } = useAuthStore();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedContainerId, setSelectedContainerId] = useState(null);
  const [selectedContainerNum, setSelectedContainerNum] = useState(null);
  const [showCreateContainer, setShowCreateContainer] = useState(false);
  const [showSeaVoyageCloseForm, setShowSeaVoyageCloseForm] = useState(false);
  const [containerToMove, setContainerToMove] = useState(null);

  useEffect(() => {
    if (seaVoyageId && authUser.branchId) {
      getSeaContainers(seaVoyageId, status, 1, false, searchQuery);
    }
  }, [seaVoyageId, authUser.branchId, searchQuery, getSeaContainers, status]);

  const handleViewClick = (seaContainerId) => {
    navigate(
      `/dashboard/sea-voyage/${seaContainerId}/company-details/${status}`
    );
  };

  const handleCreateContainer = () => {
    setShowCreateContainer(true);
  };

  const handleCloseSeaVoyage = () => {
    setShowSeaVoyageCloseForm(true);
  };

  const handleConfirmCloseSeaVoyage = async (destinationDate) => {
    console.log(seaVoyageId, destinationDate);

    try {
      await closeSeaVoyage(seaVoyageId, destinationDate);
      setShowSeaVoyageCloseForm(false);
      window.location.href = "/dashboard/completed-sea-voyage";
    } catch (error) {
      console.error("Close sea voyage failed:", error);
    }
  };

  const handleExportSeaVoyage = () => {};

  const handleShowDeleteConfirm = (containerId, containerNumber) => {
    console.log(containerNumber);

    setShowDeleteConfirm(true);
    setSelectedContainerId(containerId);
    setSelectedContainerNum(containerNumber);
  };

  const handleDeleteContainer = async () => {
    try {
      if (selectedContainerId) {
        const result = await deleteSeaContainer(selectedContainerId);

        if (result.success) {
          setShowDeleteConfirm(false);
        }
      }
    } catch (error) {
      console.error("Delete container failed:", error);
    }
  };

  const handleChangeVoyage = async (newSeaVoyageId) => {
    const result = await changeSeaContainerVoyage(
      containerToMove._id,
      newSeaVoyageId
    );

    if (result.success) {
      setContainerToMove(null);
    }
  };

  const handlePageChange = (page) => {
    getSeaContainers(seaVoyageId, status, page, false, searchQuery);
  };

  const handleExportContainer = async (containerId) => {
    console.log("Fetching export data for container:", containerId);

    try {
      const exportResponse = await getContainerExportData(
        seaVoyageId,
        containerId,
        status
      );

      if (!exportResponse?.batchAssignments?.length) {
        alert("No batch data found for this container.");
        return;
      }

      await generateSeaContainerExcel(exportResponse);
    } catch (error) {
      console.error("Error fetching export data:", error);
    }
  };

  const renderContent = () => {
    if (seaContainerLoading && seaContainers.length === 0) {
      return (
        <div className="flex justify-center items-center h-[90vh]">
          <Loader className="size-8 animate-spin" />
        </div>
      );
    }

    return (
      <div className="mt-4">
        {seaContainers.map((container) => (
          <div
            key={container._id}
            className="bg-white rounded-xl px-4 py-2.5 mb-2.5 shadow-sm hover:shadow-gray-400 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Container className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Container No : {container.containerNumber}
                </p>
                <p className="text-xs text-gray-500">
                  Company : {container.containerCompanyId.containerCompanyName}
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <p className="text-[12px] text-gray-500">
                Created Date : {formatDate(container.createdAt)}
              </p>

              <div
                onClick={() => handleViewClick(container._id)}
                className="flex text-sm items-center gap-1.5 rounded-xl border px-2 py-1.5 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 cursor-pointer"
              >
                <Eye size={16} />
                <span>View</span>
              </div>

              <div onClick={() => handleExportContainer(container._id)}>
                <FileSpreadsheet
                  size={16}
                  className={`cursor-pointer ${
                    exportLoading
                      ? "text-gray-400"
                      : "text-green-600 hover:text-green-800"
                  }`}
                />
              </div>

              <div
                onClick={() =>
                  handleShowDeleteConfirm(
                    container._id,
                    container.containerNumber
                  )
                }
              >
                <Trash2
                  size={16}
                  className="text-gray-500 hover:text-red-500 cursor-pointer"
                />
              </div>

              {status === "pending" && (
                <button
                  type="button"
                  onClick={() => setContainerToMove(container)}
                  className="rounded-lg p-1 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  title="Move container to another voyage"
                  aria-label={`Change voyage for container ${container.containerNumber}`}
                >
                  <ArrowRightLeft size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div>
        <PageHeader
          mainHead={`Sea Voyage ${seaVoyage.seaVoyageName}-${seaVoyage.seaVoyageNumber} Containers`}
          subText={`${paginationData.totalItems} ${
            paginationData.totalItems > 1 ? "Conatiners" : "Container"
          }`}
          // onCreate={handleCreateContainer}
          onCloseVoyage={handleCloseSeaVoyage}
          onExport={handleExportSeaVoyage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

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

      <div
        onClick={handleCreateContainer}
        className="fixed bottom-10 right-10 cursor-pointer p-3 bg-black rounded-full text-white"
      >
        <PlusCircle />
      </div>

      {showCreateContainer && (
        <CreateContainer
          setShowCreateContainer={setShowCreateContainer}
          onCreateContainer={createSeaContainer}
          isCreating={isCreating}
          seaVoyageId={seaVoyageId}
          lineId={lineId}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo={`Do you want to delete sea container ${selectedContainerNum} ?`}
            handleClose={() => setShowDeleteConfirm(false)}
            handleSubmit={handleDeleteContainer}
            isDeleting={isDeleting}
          />
        </div>
      )}

      {showSeaVoyageCloseForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo="Closing this voyage will reset all product quantities to zero, send notifications to clients, and move it to Completed Voyages. This action cannot be undone."
            showDateInput={true}
            handleClose={() => setShowSeaVoyageCloseForm(false)}
            dateLabel="Expected arrival date"
            datePlaceholder="Select arrival date"
            handleSubmit={handleConfirmCloseSeaVoyage}
          />
        </div>
      )}

      {containerToMove && (
        <ChangeSeaVoyageModal
          container={containerToMove}
          currentVoyageId={seaVoyageId}
          isSubmitting={isChangingVoyage}
          onClose={() => setContainerToMove(null)}
          onSubmit={handleChangeVoyage}
        />
      )}
    </div>
  );
};

export default Containers;
