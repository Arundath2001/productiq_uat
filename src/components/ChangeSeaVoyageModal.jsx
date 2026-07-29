/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSeaVoyageStore } from "../store/useSeaVoyageStore";
import SearchableDropdown from "./SearchableDropdown ";
import SolidButton from "./SolidButton";

const ChangeSeaVoyageModal = ({
  container,
  currentVoyageId,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const {
    getPendingSeaVoyageOptions,
    seaVoyageOptions,
    seaVoyageOptionsLoading,
  } = useSeaVoyageStore();
  const [selectedVoyageId, setSelectedVoyageId] = useState("");

  useEffect(() => {
    getPendingSeaVoyageOptions();
  }, [getPendingSeaVoyageOptions]);

  const availableVoyages = seaVoyageOptions.filter(
    (voyage) => voyage._id !== currentVoyageId
  );

  const voyageOptions = availableVoyages.map((voyage) => ({
    _id: voyage._id,
    name: `${voyage.seaVoyageName} - ${voyage.seaVoyageNumber}`,
  }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedVoyageId) {
      onSubmit(selectedVoyageId);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
        <h1 className="text-center font-medium text-base mb-3.5">
          CHANGE CONTAINER VOYAGE
        </h1>
        <div className="h-0.5 bg-gray-700 mb-6" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500">Container Number</p>
            <p className="text-sm font-medium text-gray-800">
              {container.containerNumber}
            </p>
          </div>

          <SearchableDropdown
            label="Select New Sea Voyage"
            placeholder={
              seaVoyageOptionsLoading
                ? "Loading Voyages..."
                : "Sea Voyage"
            }
            options={voyageOptions}
            onSelect={(voyage) => setSelectedVoyageId(voyage._id)}
          />

          {!seaVoyageOptionsLoading && availableVoyages.length === 0 && (
            <p className="text-xs text-center text-amber-600">
              No other pending sea voyages are available.
            </p>
          )}

          <div className="flex gap-4 justify-center mt-4">
            <SolidButton
              buttonName="Cancel"
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
            />
            <SolidButton
              buttonName="Save"
              type="submit"
              disabled={!selectedVoyageId || isSubmitting}
              isLoading={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeSeaVoyageModal;
