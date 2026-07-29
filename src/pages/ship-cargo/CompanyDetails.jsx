import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useParams } from "react-router-dom";
import { useSeaBatchAssign } from "../../store/useSeaBatchAssign";
import { Building2, Eye } from "lucide-react";
import Pagination from "../../components/Pagination";

const CompanyDetails = () => {
  const { seaContainerId, status = "active" } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const {
    seaCompanies,
    seaCompaniesError,
    seaCompaniesLoadMore,
    seaCompaniesLoading,
    paginationData,
    getSeaCompaniesByBatchAssign,
    seaContainerDetails,
  } = useSeaBatchAssign();

  const companyStatus = status === "pending" ? "active" : "completed";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (seaContainerId) {
      getSeaCompaniesByBatchAssign(
        seaContainerId,
        companyStatus,
        1,
        false,
        searchQuery
      );
    }
  }, [seaContainerId, searchQuery]);

  const handleViewClick = (companyCode, seaContainerId) => {
    navigate(
      `/dashboard/sea-voyage/company/${companyCode}/details/${seaContainerId}/${companyStatus}`
    );
  };

  const handlePageChange = (page) => {
    getSeaCompaniesByBatchAssign(
      seaContainerId,
      companyStatus,
      page,
      false,
      searchQuery
    );
  };

  const renderContent = () => {
    return (
      <div className="mt-4">
        {seaCompanies.map((company) => (
          <div
            key={company.companyCode}
            className="bg-white rounded-xl px-4 py-2.5 mb-2.5 shadow-sm hover:shadow-gray-400 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Building2 className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Company Name : {company.companyCode}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">
                    Total quantity : {company.totalQuantity}
                  </p>
                  <div className="h-3 w-0.5 bg-gray-300" />
                  <p className="text-xs text-gray-500">
                    Total CBM : {company.totalCBM}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <p className="text-[12px] text-gray-500">
                Created Date : {formatDate(company.createdAt)}
              </p>

              <div
                onClick={() =>
                  handleViewClick(company.companyCode, seaContainerId)
                }
                className="flex text-sm items-center gap-1.5 rounded-xl border px-2 py-1.5 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 cursor-pointer"
              >
                <Eye size={16} />
                <span>View</span>
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
        mainHead={`${seaContainerDetails.containerNumber} - Company Details`}
        subText={`${paginationData.totalItems} ${
          paginationData.totalItems > 1 ? "companies" : "company"
        } `}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
    </div>
  );
};

export default CompanyDetails;
