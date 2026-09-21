import { useEffect, useState } from "react";
import InputLine from "../components/InputLine";
import SolidButton from "./SolidButton";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore.js";
import SearchableDropdown from "./SearchableDropdown .jsx";
import { useLineStore } from "../store/useLineStore.js";
import { useAirlineStore } from "../store/useAirlineStore.js";

const CreateVoyage = ({
  setShowCreateVoyage,
  onCreateVoyage,
  isCreating,
  voyageType = "sea",
}) => {
  const { authUser } = useAuthStore();

  const { lines, getLines } = useLineStore();
  const { airlines, getAirlines } = useAirlineStore();

  useEffect(() => {
    getLines(authUser.branchId);
    getAirlines(authUser.branchId);
  }, [authUser.branchId, getLines, getAirlines]);

  const [voyageData, setVoyageData] = useState({
    voyageName: "",
    voyageNumber: "",
    year: new Date().getFullYear(),
    branchId: authUser.branchId,
    ...(voyageType === "air" && {
      expectedDispatchDate: "",
      expectedDate: "",
      airlineId: "",
    }),
    ...(voyageType === "sea" && { lineId: "" }),
  });

  const lineOptions = lines.map((line) => ({
    _id: line._id,
    name: line.lineName,
  }));

  const handleLineSelect = (selectedLine) => {
    setVoyageData({ ...voyageData, lineId: selectedLine._id });
  };

  const airlineOptions = airlines.map((airline) => ({
    _id: airline._id,
    name: airline.airlineName,
  }));

  const handleAirlineSelect = (selectedAirline) => {
    setVoyageData({ ...voyageData, airlineId: selectedAirline._id });
  };

  const validateForm = () => {
    if (!voyageData.voyageName.trim())
      return toast.error("Voyage name is required");
    if (!voyageData.voyageNumber.trim())
      return toast.error("Voyage number is required");
    if (!voyageData.year.toString().trim())
      return toast.error("Voyage year is required");
    if (voyageType === "air" && !voyageData.expectedDispatchDate)
      return toast.error("Expected dispatch date is required");
    if (voyageType === "air" && !voyageData.expectedDate)
      return toast.error("Expected arrival date is required");
    if (
      voyageType === "air" &&
      voyageData.expectedDate < voyageData.expectedDispatchDate
    )
      return toast.error(
        "Expected arrival date cannot be before expected dispatch date"
      );
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      await onCreateVoyage(voyageData);
      setShowCreateVoyage(false);
    }
  };

  const handleChange = (e) => {
    setVoyageData({ ...voyageData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white py-5 px-2.5">
      <h1 className="text-center font-medium text-base mb-3.5">
        ENTER VOYAGE DETAILS
      </h1>
      <div className="h-0.5 bg-gray-700 mb-6" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <InputLine
          label="Enter Voyage Name"
          placeholder="Voyage Name"
          name="voyageName"
          value={voyageData.voyageName}
          onChange={handleChange}
        />

        <InputLine
          label="Enter Voyage Number"
          placeholder="Enter Voyage Number"
          name="voyageNumber"
          value={voyageData.voyageNumber}
          onChange={handleChange}
        />

        <InputLine
          label="Year"
          placeholder="Enter the year"
          name="year"
          value={voyageData.year}
          onChange={handleChange}
        />

        {voyageType === "air" && (
          <>
            <InputLine
              label="Expected Dispatch"
              placeholder="Select expected dispatch date"
              name="expectedDispatchDate"
              type="date"
              value={voyageData.expectedDispatchDate}
              onChange={handleChange}
            />
            <InputLine
              label="Expected Arrival"
              placeholder="Select expected arrival date"
              name="expectedDate"
              type="date"
              min={voyageData.expectedDispatchDate}
              value={voyageData.expectedDate}
              onChange={handleChange}
            />
            <SearchableDropdown
              label="Airline Name"
              placeholder="Airline Name (Optional)"
              options={airlineOptions}
              onSelect={handleAirlineSelect}
            />
          </>
        )}

        {voyageType === "sea" && (
          <SearchableDropdown
            label="Line Name"
            placeholder="Line Name"
            options={lineOptions}
            onSelect={handleLineSelect}
          />
        )}

        <div className="flex gap-4 justify-center mt-6">
          <SolidButton
            buttonName="Cancel"
            variant="outlined"
            onClick={() => setShowCreateVoyage(false)}
            disabled={isCreating}
          />
          <SolidButton
            buttonName="Save"
            type="submit"
            disabled={isCreating}
            isLoading={isCreating}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateVoyage;
