import React, { useEffect, useState } from "react";
import InputLine from "./InputLine";
import SearchableDropdown from "./SearchableDropdown .jsx";
import SolidButton from "./SolidButton";
import { useAuthStore } from "../store/useAuthStore";
import { useAirportStore } from "../store/useAirportStore";
import { useAirlineStore } from "../store/useAirlineStore";
import toast from "react-hot-toast";

const ExportAirVoyageModal = ({ onClose, onConfirm, currentVoyageInfo, isExporting = false }) => {
  const { authUser } = useAuthStore();
  const { airports, getAirports } = useAirportStore();
  const { airlines, getAirlines } = useAirlineStore();

  const [exportData, setExportData] = useState({
    eta: "",
    landingAirportId: "",
    airlineId: "",
  });

  useEffect(() => {
    if (authUser?.branchId) {
      getAirports(authUser.branchId);
      getAirlines(authUser.branchId);
    }
  }, [authUser?.branchId, getAirports, getAirlines]);

  useEffect(() => {
    if (currentVoyageInfo?.airlineId) {
      const id = typeof currentVoyageInfo.airlineId === 'object' ? currentVoyageInfo.airlineId._id : currentVoyageInfo.airlineId;
      setExportData(prev => ({ ...prev, airlineId: id }));
    }
  }, [currentVoyageInfo]);

  const airportOptions = airports.map((airport) => ({
    _id: airport._id,
    name: airport.airportName,
  }));

  const airlineOptions = airlines.map((airline) => ({
    _id: airline._id,
    name: airline.airlineName,
  }));

  const selectedAirlineOption = airlineOptions.find(opt => opt._id === exportData.airlineId);

  const handleAirportSelect = (selectedAirport) => {
    setExportData({ ...exportData, landingAirportId: selectedAirport._id });
  };

  const handleAirlineSelect = (selectedAirline) => {
    setExportData({ ...exportData, airlineId: selectedAirline._id });
  };

  const handleChange = (e) => {
    setExportData({ ...exportData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exportData.eta) {
      return toast.error("ETA is required");
    }
    if (!exportData.landingAirportId) {
      return toast.error("Landing airport is required");
    }
    onConfirm(exportData.eta, exportData.landingAirportId, exportData.airlineId);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-[400px] relative">
      <h1 className="text-center font-medium text-lg mb-2">Export Voyage</h1>
      <p className="text-center text-sm text-gray-500 mb-4">
        Please fill in the landing details before exporting.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputLine
          label="ETA (Estimated Time of Arrival)"
          placeholder="Select ETA"
          name="eta"
          type="date"
          value={exportData.eta}
          onChange={handleChange}
        />

        <SearchableDropdown
          label="Airline Name"
          placeholder="Select Airline (Optional)"
          options={airlineOptions}
          onSelect={handleAirlineSelect}
          value={selectedAirlineOption}
        />

        <SearchableDropdown
          label="Landing Airport"
          placeholder="Select Airport"
          options={airportOptions}
          onSelect={handleAirportSelect}
        />

        <div className="flex justify-end gap-3 mt-4">
          <SolidButton
            buttonName="Cancel"
            variant="outlined"
            onClick={onClose}
            disabled={isExporting}
          />
          <SolidButton
            buttonName="Export"
            type="submit"
            isLoading={isExporting}
            disabled={isExporting}
          />
        </div>
      </form>
    </div>
  );
};

export default ExportAirVoyageModal;
