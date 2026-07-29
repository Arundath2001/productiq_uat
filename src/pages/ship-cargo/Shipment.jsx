import React, { useEffect, useState } from "react";
import { Eye, Hammer, Loader, Ship, Trash2 } from "lucide-react";
import { useSeaVoyageStore } from "../../store/useSeaVoyageStore";
import { useAuthStore } from "../../store/useAuthStore";
import PageHeader from "../../components/PageHeader";
import CreateVoyage from "../../components/CreateVoyage";
import ConfirmAlert from "../../components/ConfirmAlert";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import VoyageCard from "../../components/VoyageCard";
import EmptyState from "../../components/EmptyState";

const Shipment = () => {
  const { authUser } = useAuthStore();
  const {
    getSeaVoyages,
    seaVoyages,
    seaVoyageError,
    paginationData,
    seaVoyageLoadMore,
    seaVoyageLoading,
    createSeaVoyage,
    deleteSeaVoyage,
    isCreating,
    isDeleting,
    resetVoyages,
  } = useSeaVoyageStore();

  const navigate = useNavigate();

  const [showCreateSeaVoyage, setShowCreateSeaVoyage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeaVoyageId, setSelectedSeaVoyageId] = useState(null);
  const [selectedSeaVoyageNum, setSelectedSeaVoyageNum] = useState(null);

  const status = "pending";

  useEffect(() => {
    resetVoyages();
    getSeaVoyages(status, false, 1, searchQuery);
  }, [authUser.branchId, searchQuery]);

  const handleCreateSeaVoyage = () => {
    setShowCreateSeaVoyage(true);
  };

  const handleShowDeleteConfirm = (seaVoyageId, seaVoyageNumber) => {
    setShowDeleteConfirm(true);
    setSelectedSeaVoyageId(seaVoyageId);
    setSelectedSeaVoyageNum(seaVoyageNumber);
  };

  const handleDeleteSeaVoyage = async () => {
    try {
      if (selectedSeaVoyageId) {
        const result = await deleteSeaVoyage(selectedSeaVoyageId);

        if (result.success) {
          setShowDeleteConfirm(false);
        }
      }
    } catch (error) {}
  };

  const handleViewClick = (seaVoageId, lineId) => {
    navigate(`/dashboard/sea-voyage/${seaVoageId}/container/${lineId}`);
  };

  const handlePageChange = (page) => {
    getSeaVoyages(authUser.branchId, status, false, page, searchQuery);
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
            title="No Sea voyages found"
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
          <VoyageCard
            key={voyage._id}
            voyage={voyage}
            type="sea"
            onDelete={handleShowDeleteConfirm}
            onViewClick={handleViewClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-2rem)]">
      <PageHeader
        mainHead="Created sea-voyages"
        subText={`${paginationData?.totalItems} ${
          paginationData.totalItems > 1 ? "Voyages" : "Voyage"
        } `}
        onCreate={handleCreateSeaVoyage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-1">{renderContent()}</div>

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

      {showCreateSeaVoyage && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <CreateVoyage
              setShowCreateVoyage={setShowCreateSeaVoyage}
              onCreateVoyage={createSeaVoyage}
              isCreating={isCreating}
              voyageType="sea"
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo={`Do you want to delete sea voyage ${selectedSeaVoyageNum} ?`}
            handleClose={() => setShowDeleteConfirm(false)}
            handleSubmit={handleDeleteSeaVoyage}
            isDeleting={isDeleting}
          />
        </div>
      )}
    </div>
  );
};

export default Shipment;
