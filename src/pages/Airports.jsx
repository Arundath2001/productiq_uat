import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { useAirportStore } from "../store/useAirportStore";
import { Edit, Loader, Trash2 } from "lucide-react";
import CreateAirportForm from "../components/CreateAirportForm";
import ConfirmAlert from "../components/ConfirmAlert";
import { useAuthStore } from "../store/useAuthStore";

const Airports = () => {
  const {
    airports,
    airportLoading,
    airportError,
    isCreating,
    isUpdating,
    isDeleting,
    getAirports,
    createAirport,
    updateAirport,
    paginationData,
    deleteAirport,
  } = useAirportStore();

  const { authUser } = useAuthStore();

  const [showCreateAirport, setShowCreateAirport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAirportId, setSelectedAirportId] = useState(null);
  const [selectedAirportName, setSelectedAirportName] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (authUser?.branchId) {
      getAirports(authUser.branchId);
    }
  }, [authUser?.branchId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleShowDeleteConfirm = (airportId, airportName) => {
    setShowDeleteConfirm(true);
    setSelectedAirportId(airportId);
    setSelectedAirportName(airportName);
  };

  const handleDeleteAirport = async () => {
    try {
      if (selectedAirportId) {
        const result = await deleteAirport(selectedAirportId);
        if (result.success) {
          setShowDeleteConfirm(false);
        }
      }
    } catch (error) {}
  };

  const handleCreateAirport = () => {
    setEditData(null);
    setShowCreateAirport(true);
  };

  const handleEditAirport = (airport) => {
    setEditData(airport);
    setShowCreateAirport(true);
  };

  const renderContent = () => {
    if (airportLoading && airports.length === 0) {
      return (
        <div className="flex justify-center items-center h-[50vh]">
          <Loader className="size-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (airports.length === 0) {
      return (
        <div className="flex justify-center items-center h-[50vh] text-gray-500">
          No airports found. Create one to get started.
        </div>
      );
    }

    return (
      <div className="mt-5">
        {airports.map((airport) => (
          <div
            key={airport._id}
            className="flex items-center rounded-xl bg-white shadow-sm p-2 mb-2.5 justify-between"
          >
            <p className="text-sm text-black">{airport.airportName}</p>
            
            <div className="flex gap-3 items-center">
              <p className="text-sm text-black">
                Created Date: {formatDate(airport.createdAt)}
              </p>
              
              <button
                type="button"
                onClick={() => handleEditAirport(airport)}
                className="rounded-xl border px-2.5 py-2 cursor-pointer text-gray-700 hover:text-black"
                title="Edit Airport"
              >
                <Edit className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => handleShowDeleteConfirm(airport._id, airport.airportName)}
                className="rounded-xl border px-2.5 py-2 cursor-pointer text-gray-700 hover:text-red-500"
                title="Delete Airport"
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
          mainHead="Airports Management"
          subText={`${paginationData.totalItems || airports.length} ${
            (paginationData.totalItems || airports.length) === 1 ? "airport" : "airports"
          } found`}
          onCreate={handleCreateAirport}
          createButtonText="Create Airport"
        />
      </div>
      
      {airportError && !isCreating && !isUpdating && !isDeleting && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          {airportError}
        </div>
      )}
      
      {renderContent()}

      {showCreateAirport && (
        <CreateAirportForm
          onCreateAirport={createAirport}
          onUpdateAirport={updateAirport}
          setShowCreateAirport={setShowCreateAirport}
          isCreating={isCreating}
          isUpdating={isUpdating}
          initialData={editData}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo={`Do you want to delete the airport "${selectedAirportName}"?`}
            handleClose={() => setShowDeleteConfirm(false)}
            handleSubmit={handleDeleteAirport}
            isDeleting={isDeleting}
          />
        </div>
      )}
    </div>
  );
};

export default Airports;
