import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVoyageStore } from "../store/useVoyageStore.js";
import { Building, Loader } from "lucide-react";
import PageHeader from "../components/PageHeader";
import images from "../lib/images.js";
import { exportVoyageData } from "../lib/excel.js";
import ConfirmAlert from "../components/ConfirmAlert.jsx";
import { useVoyagesV2 } from "../store/useVoyagesV2.js";
import EmptyState from "../components/EmptyState.jsx";
import Pagination from "../components/Pagination.jsx";
import ExportAirVoyageModal from "../components/ExportAirVoyageModal.jsx";

const VoyageByCompany = () => {
  const { voyageId } = useParams();
  const navigate = useNavigate();

  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showCloseVoyageConfirm, setShowCloseVoyageConfirm] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const {
    companiesSummary,
    isCompaniesSummaryLoading,
    getCompaniesSummaryByVoyage,
    exportVoyage,
    closeVoyage,
    getAllPendingVoyageProducts,
  } = useVoyageStore();

  const {
    getCompanyDetailsByVoyage,
    companyDetails,
    companyError,
    companyLoadMore,
    companyLoading,
    paginationData,
    totalCompanies,
    currentVoyageInfo,
    totalVoyageWeight,
  } = useVoyagesV2();

  useEffect(() => {
    if (voyageId) {
      getCompanyDetailsByVoyage(voyageId, "pending", 1, false, searchQuery);
    }
  }, [voyageId, searchQuery]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const handleViewClick = (companyCode) => {
    navigate(`/dashboard/voyage/${voyageId}/companies/${companyCode}`);
  };

  const handleExport = () => {
    setShowExportConfirm(true);
  };

  const handleCloseVoyage = () => {
    setShowCloseVoyageConfirm(true);
  };

  const confirmExport = async (eta, landingAirportId, airlineId) => {
    try {
      const allProducts = await getAllPendingVoyageProducts(voyageId);

      if (!allProducts || allProducts.length === 0) {
        alert("No products found for this voyage. Export cancelled.");
        setShowExportConfirm(false);
        return;
      }

      const exportResult = await exportVoyage(voyageId, { eta, landingAirportId, airlineId });
      const voyageDetails = exportResult?.voyageInfo || currentVoyageInfo;

      exportVoyageData(allProducts, voyageDetails?.voyageName || currentVoyageInfo?.voyageName, voyageId, voyageDetails);

      setShowExportConfirm(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error.message}`);
      setShowExportConfirm(false);
    }
  };

  const confirmCloseVoyage = async (destinationDate) => {
    try {
      await closeVoyage(voyageId, destinationDate);
      setShowCloseVoyageConfirm(false);
      window.location.href = "/dashboard/completed";
    } catch (error) {
      console.error("Close voyage failed:", error);
      alert(`Close voyage failed: ${error.message}`);
      setShowCloseVoyageConfirm(false);
    }
  };

  const handlePageChange = (page) => {
    getCompanyDetailsByVoyage(voyageId, "pending", page, false, searchQuery);
  };

  const renderContent = () => {
    if (companyLoading && companyDetails.length === 0) {
      return (
        <div className="flex justify-center items-center h-[90vh]">
          <Loader className="size-8 animate-spin" />
        </div>
      );
    }

    if (!companyLoading && companyDetails.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <EmptyState
            Icon={Building}
            title="No company details found"
            description={
              searchQuery
                ? "No company match your search criteria. Try adjusting your filters."
                : "Upload the company details to view and manage the data."
            }
          />
        </div>
      );
    }

    return (
      <div className="mt-4">
        {companyDetails.map((company, index) => (
          <div
            key={index}
            className="flex rounded-xl items-center justify-between bg-white px-4 py-2.5 mb-2.5"
          >
            <div className="flex flex-col">
              <p className="text-black text-sm font-medium">
                {company.companyCode}
              </p>
              <p className="text-gray-600 text-xs">
                {company.itemCount} Items | Weight: {company.totalWeight}kg
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <p className="text-sm text-gray-600">
                Latest Upload: {formatDate(company.latestUpload)}
              </p>

              <div
                onClick={() => handleViewClick(company.companyCode)}
                className="rounded-xl border px-2.5 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                View
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        mainHead={`Voyage: ${currentVoyageInfo?.voyageNumber}`}
        subText={`${totalCompanies} Companies | ${paginationData.totalItems} Items`}
        weight={`${totalVoyageWeight}`}
        onExport={handleExport}
        onCloseVoyage={handleCloseVoyage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {renderContent()}

      {totalCompanies > 10 && (
        <div className="mt-4">
          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            totalItems={totalCompanies}
            hasPrevPage={paginationData.hasPrevPage}
            hasNextPage={paginationData.hasNextPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {showExportConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ExportAirVoyageModal
            onClose={() => setShowExportConfirm(false)}
            onConfirm={confirmExport}
            currentVoyageInfo={currentVoyageInfo}
          />
        </div>
      )}

      {showCloseVoyageConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo="Closing this voyage will reset all product quantities to zero, send notifications to clients, and move it to Completed Voyages. This action cannot be undone."
            handleClose={() => setShowCloseVoyageConfirm(false)}
            handleSubmit={confirmCloseVoyage}
            showDateInput={true}
            dateLabel="Expected arrival date"
            datePlaceholder="Select arrival date"
          />
        </div>
      )}
    </div>
  );
};

export default VoyageByCompany;
