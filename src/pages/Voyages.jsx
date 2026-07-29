import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import CreateVoyage from "../components/CreateVoyage.jsx";
import { useNavigate } from "react-router-dom";
import ConfirmAlert from "../components/ConfirmAlert.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { Loader, PlaneTakeoff } from "lucide-react";
import { useVoyagesV2 } from "../store/useVoyagesV2.js";
import VoyageCard from "../components/VoyageCard.jsx";
import Pagination from "../components/Pagination.jsx";
import EmptyState from "../components/EmptyState.jsx";

const Voyages = () => {
  const {
    getVoyageDetailsByBranch,
    pendingVoyages,
    pendingLoadingMore,
    pendingVoyageLoading,
    pendingError,
    deleteAirVoyage,
    isDeleting,
    createVoyage,
    isCreateVoyage,
    paginationData,
  } = useVoyagesV2();

  const { authUser } = useAuthStore();

  const [showCreateVoyage, setShowCreateVoyage] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedVoyageId, setSelectedVoyageId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (authUser && authUser.branchId) {
      getVoyageDetailsByBranch(
        authUser.branchId,
        "pending",
        1,
        false,
        searchQuery
      );
    }
  }, [authUser, authUser?.branchId, searchQuery]);

  const handleViewClick = (voyageId) => {
    navigate(`/dashboard/voyage/${voyageId}/companies`);
  };

  const handleCreateVoyage = () => {
    setShowCreateVoyage(true);
  };

  const handleShowConfirm = (voyageId) => {
    setSelectedVoyageId(voyageId);
    setShowConfirm(true);
  };

  const handleDeleteVoyage = async () => {
    console.log(selectedVoyageId);

    if (selectedVoyageId) {
      await deleteAirVoyage(selectedVoyageId);
      setShowConfirm(false);
    }
  };

  const handlePageChange = (page) => {
    getVoyageDetailsByBranch(
      authUser.branchId,
      "pending",
      page,
      false,
      searchQuery
    );
  };

  const renderContent = () => {
    if (pendingVoyageLoading && pendingVoyages.length === 0) {
      return (
        <div className="flex justify-center items-center h-[90vh]">
          <Loader className="size-8 animate-spin" />
        </div>
      );
    }

    if (!pendingVoyageLoading && pendingVoyages.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <EmptyState
            Icon={PlaneTakeoff}
            title="No Air voyages found"
            description={
              searchQuery
                ? "No voyages match your search criteria. Try adjusting your filters."
                : "Start by creating your first air voyage to manage your shipments."
            }
          />
        </div>
      );
    }

    return (
      <div className="mt-4">
        {pendingVoyages.map((voyage) => (
          <VoyageCard
            key={voyage._id}
            voyage={voyage}
            type="air"
            onViewClick={handleViewClick}
            onDelete={handleShowConfirm}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        mainHead="Created air-voyages"
        subText={`${paginationData.totalItems} ${
          paginationData.totalItems > 1 ? "Voyages" : "Voyage"
        }`}
        onCreate={handleCreateVoyage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showDateFilter={true}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        placeholder="Search by voyage name..."
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

      {showCreateVoyage && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <CreateVoyage
              setShowCreateVoyage={setShowCreateVoyage}
              onCreateVoyage={createVoyage}
              voyageType="air"
              isCreating={isCreateVoyage}
            />
          </div>
        </div>
      )}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo="You want to delete this voyage ?"
            handleClose={() => setShowConfirm(false)}
            handleSubmit={handleDeleteVoyage}
            isDeleting={isDeleting}
          />
        </div>
      )}
    </div>
  );
};

export default Voyages;
