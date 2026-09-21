import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { useAirlineStore } from "../store/useAirlineStore";
import { useAuthStore } from "../store/useAuthStore";
import { Edit, Loader, Trash2 } from "lucide-react";
import CreateAirlineForm from "../components/CreateAirlineForm";
import ConfirmAlert from "../components/ConfirmAlert";

const Airlines = () => {
  const {
    airlines,
    airlineLoading,
    airlineError,
    isCreating,
    isUpdating,
    isDeleting,
    getAirlines,
    createAirline,
    updateAirline,
    paginationData,
    deleteAirline,
  } = useAirlineStore();

  const { authUser } = useAuthStore();

  const [showCreateAirline, setShowCreateAirline] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAirlineId, setSelectedAirlineId] = useState(null);
  const [selectedAirlineName, setSelectedAirlineName] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (authUser?.branchId) {
      getAirlines(authUser.branchId);
    }
  }, [authUser?.branchId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleShowDeleteConfirm = (airlineId, airlineName) => {
    setShowDeleteConfirm(true);
    setSelectedAirlineId(airlineId);
    setSelectedAirlineName(airlineName);
  };

  const handleDeleteAirline = async () => {
    try {
      if (selectedAirlineId) {
        const result = await deleteAirline(selectedAirlineId);
        if (result.success) {
          setShowDeleteConfirm(false);
        }
      }
    } catch (error) {}
  };

  const handleCreateAirline = () => {
    setEditData(null);
    setShowCreateAirline(true);
  };

  const handleEditAirline = (airline) => {
    setEditData(airline);
    setShowCreateAirline(true);
  };

  const renderContent = () => {
    if (airlineLoading && airlines.length === 0) {
      return (
        <div className="flex justify-center items-center h-[50vh]">
          <Loader className="size-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (airlines.length === 0) {
      return (
        <div className="flex justify-center items-center h-[50vh] text-gray-500">
          No airlines found. Create one to get started.
        </div>
      );
    }

    return (
      <div className="mt-5">
        {airlines.map((airline) => (
          <div
            key={airline._id}
            className="flex items-center rounded-xl bg-white shadow-sm p-2 mb-2.5 justify-between"
          >
            <p className="text-sm text-black">{airline.airlineName}</p>
            
            <div className="flex gap-3 items-center">
              <p className="text-sm text-black">
                Created Date: {formatDate(airline.createdAt)}
              </p>
              
              <button
                type="button"
                onClick={() => handleEditAirline(airline)}
                className="rounded-xl border px-2.5 py-2 cursor-pointer text-gray-700 hover:text-black"
                title="Edit Airline"
              >
                <Edit className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => handleShowDeleteConfirm(airline._id, airline.airlineName)}
                className="rounded-xl border px-2.5 py-2 cursor-pointer text-gray-700 hover:text-red-500"
                title="Delete Airline"
              >
                <Trash2 className="size-4" />
              </button>
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
          mainHead="Airlines Management"
          subText={`${paginationData.totalItems || airlines.length} ${
            (paginationData.totalItems || airlines.length) === 1 ? "airline" : "airlines"
          } found`}
          onCreate={handleCreateAirline}
          createButtonText="Create Airline"
        />
      </div>
      
      {airlineError && !isCreating && !isUpdating && !isDeleting && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          {airlineError}
        </div>
      )}
      
      {renderContent()}

      {showCreateAirline && (
        <CreateAirlineForm
          onCreateAirline={createAirline}
          onUpdateAirline={updateAirline}
          setShowCreateAirline={setShowCreateAirline}
          isCreating={isCreating}
          isUpdating={isUpdating}
          initialData={editData}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo={`Do you want to delete the airline "${selectedAirlineName}"?`}
            handleClose={() => setShowDeleteConfirm(false)}
            handleSubmit={handleDeleteAirline}
            isDeleting={isDeleting}
          />
        </div>
      )}
    </div>
  );
};

export default Airlines;
