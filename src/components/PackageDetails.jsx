import React, { useEffect, useState } from "react";
import SearchableDropdown from "./SearchableDropdown ";
import { useCompanyStore } from "../store/useCompanyStore";
import { useVoyageStore } from "../store/useVoyageStore";
import { useAuthStore } from "../store/useAuthStore";
import { usePackage } from "../store/usePackageStore";
import {
  Building,
  Building2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader,
  PlaneTakeoff,
  RotateCcw,
  Trash2,
  Weight,
} from "lucide-react";
import Tooltip from "./Tooltip";
import { useNavigate } from "react-router-dom";
import {
  exportPackagesToExcel,
  exportPackagesToSingleSheet,
} from "../lib/excelPackage";
import ConfirmAlert from "./ConfirmAlert";

const PackageDetails = () => {
  const navigate = useNavigate();

  const { companies, getAllCompanies } = useCompanyStore();
  const { getAllVoyagesByBranch, allVoyagesByBranch, isVoyagesLoading } =
    useVoyageStore();
  const { authUser } = useAuthStore();
  const {
    packageDetailsByVoyageAndCompany,
    isLoadingPackages,
    packages,
    pkgCount,
    deletePackage,
    isDeleting,
  } = usePackage();

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedVoyage, setSelectedVoyage] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    getAllCompanies();
    getAllVoyagesByBranch(authUser.branchId);
  }, []);

  useEffect(() => {
    if (selectedVoyage) {
      const companyId = selectedCompany?.id || null;
      packageDetailsByVoyageAndCompany(companyId, selectedVoyage.id);
    }
  }, [selectedCompany, selectedVoyage, packageDetailsByVoyageAndCompany]);

  const totalWeight =
    packages?.reduce((sum, pkg) => sum + (pkg.packageWeight || 0), 0) || 0;

  const companyOptions = companies.map((company) => ({
    id: company.id,
    name: company.companyCode,
  }));

  const VoyageOptions = allVoyagesByBranch.map((voyage) => ({
    id: voyage.id,
    name: voyage.voyageName,
  }));

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
  };

  const handleSelectVoyage = (voyage) => {
    setSelectedVoyage(voyage);
  };

  const handleNavigate = (packageId) => {
    navigate(`/dashboard/packages/${packageId}/package-details`);
  };

  const handleDelete = (pkg) => {
    setSelectedPackage(pkg);
    setShowDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedPackage) {
      try {
        await deletePackage(selectedPackage._id);

        setShowDelete(false);
        setSelectedPackage(null);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleExportToExcel = async () => {
    if (!packages || packages.length === 0) {
      alert(
        "No packages data to export. Please select company and voyage first.",
      );
      return;
    }

    try {
      const companyName = selectedCompany?.name || "";
      const voyageName = selectedVoyage?.name || "";

      await exportPackagesToExcel(packages, companyName, voyageName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error occurred while exporting to Excel. Please try again.");
    }
  };

  const handleResetFields = () => {
    setSelectedCompany(null);
    setSelectedVoyage(null);
  };

  return (
    <div>
      <div className="flex gap-2.5 bg-white p-5 shadow-sm items-center">
        <div className="flex-1">
          <SearchableDropdown
            label="Client Company"
            placeholder="Select client"
            options={companyOptions}
            onSelect={handleSelectCompany}
            value={selectedCompany}
            LabelIcon={Building2}
          />
        </div>

        <div className="flex-1">
          <SearchableDropdown
            label="Voyage Number"
            placeholder="Select Voyage"
            options={VoyageOptions}
            onSelect={handleSelectVoyage}
            value={selectedVoyage}
            LabelIcon={PlaneTakeoff}
          />
        </div>

        <div>
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-500 text-white rounded-lg px-2 py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-600 hover:to-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleResetFields}
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        <Tooltip text="Export packages to Excel">
          <button
            onClick={handleExportToExcel}
            disabled={!packages || packages.length === 0}
            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg px-2 py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-600 hover:to-emerald-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={20} />
            <span>Export Excel</span>
            <Download size={20} />
          </button>
        </Tooltip>
      </div>

      {isLoadingPackages && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-2">
            <Loader className="size-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading packages...</p>
          </div>
        </div>
      )}

      {packages && packages.length > 0 && !isLoadingPackages && (
        <div className="mt-2.5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold mb-3">{`Package Details(${packages.length}) `}</h3>

            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              <Weight size={20} className="text-blue-700" />

              <span className="text-lg font-semibold text-blue-900">
                Total Weight: {totalWeight.toLocaleString()} Kg
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="p-3 rounded bg-white shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="text-lg">
                    Package Name : {pkg.goniId.goniName}
                  </p>
                  <p className="text-lg">Goni Number : {pkg.goniNumber}</p>
                  <p className="text-lg">
                    Goni Weight : {pkg.packageWeight} kg
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <Tooltip text="Delete Package" position="left">
                    <Trash2
                      className="cursor-pointer text-red-400 hover:text-red-600"
                      onClick={() => !isDeleting && handleDelete(pkg)}
                    />
                  </Tooltip>
                  <Tooltip text="Package Details" position="left">
                    <ChevronRight
                      className="cursor-pointer"
                      onClick={() => handleNavigate(pkg._id)}
                    />
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {packages &&
        packages.length === 0 &&
        selectedCompany &&
        selectedVoyage &&
        !isLoadingPackages && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-600 text-lg">
              No packages found for the selected company and voyage.
            </p>
          </div>
        )}

      {showDelete && (
        <div className="fixed flex inset-0 items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo={`Do you want to delete ${selectedPackage.goniId.goniName}?`}
            handleClose={() => setShowDelete(false)}
            handleSubmit={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        </div>
      )}
    </div>
  );
};

export default PackageDetails;
