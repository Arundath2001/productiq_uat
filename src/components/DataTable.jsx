import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const DataTable = ({
  columns = [],
  data = [],
  topContent,
  itemsPerPageOptions = [20, 50, 100, 500],
  defaultItemsPerPage = 50,
  serverSide = false,
  totalItems: externalTotalItems = 0,
  currentPage: externalCurrentPage = 1,
  isLoading = false,
  onPageChange,
  onPageSizeChange
}) => {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const currentPage = serverSide ? externalCurrentPage : internalCurrentPage;
  const totalItems = serverSide ? externalTotalItems : data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Ensure current page is within bounds when itemsPerPage changes
  if (!serverSide && currentPage > totalPages && totalPages > 0) {
    setInternalCurrentPage(totalPages);
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      if (!serverSide) setInternalCurrentPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newSize = Number(e.target.value);
    setItemsPerPage(newSize);
    if (!serverSide) setInternalCurrentPage(1);
    if (onPageSizeChange) onPageSizeChange(newSize);
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const paginatedData = serverSide ? data : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (start === 1) {
      end = 5;
    } else if (end === totalPages) {
      start = totalPages - 4;
    }
    return [...Array(end - start + 1)].map((_, i) => start + i);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Custom filter option on the top */}
      {topContent && <div className="w-full">{topContent}</div>}

      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      <p className="text-gray-500 font-medium mt-4">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors last:border-0"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="py-4 px-6 text-sm text-gray-700"
                      >
                        {col.render
                          ? col.render(row, rowIndex + (currentPage - 1) * itemsPerPage)
                          : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 px-5"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg width="180" height="150" viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 drop-shadow-sm">
                        <rect x="30" y="25" width="120" height="100" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="3" />
                        <line x1="50" y1="50" x2="130" y2="50" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                        <line x1="50" y1="70" x2="110" y2="70" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                        <line x1="50" y1="90" x2="90" y2="90" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="115" cy="95" r="20" fill="white" stroke="#3B82F6" strokeWidth="4" />
                        <line x1="130" y1="110" x2="145" y2="125" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
                        <circle cx="20" cy="30" r="4" fill="#94A3B8" />
                        <circle cx="160" cy="40" r="5" fill="#94A3B8" />
                        <circle cx="150" cy="20" r="3" fill="#CBD5E1" />
                        <circle cx="30" cy="120" r="6" fill="#CBD5E1" />
                      </svg>
                      <p className="text-gray-500 font-semibold text-lg">No data found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Area with Page Size and Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border-t border-gray-200 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${page === currentPage
                    ? "bg-blue-600 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>

            <span className="text-sm text-gray-600 hidden sm:inline-block border-l border-gray-200 pl-4">
              {startItem} - {endItem} of {totalItems} entries
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
