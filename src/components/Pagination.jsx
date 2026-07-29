import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  hasNextPage,
  hasPrevPage,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    let start = currentPage - 2;
    let end = currentPage + 2;

    if (start < 1) {
      start = 1;
      end = Math.min(5, totalPages);
    } else if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - 4);
    }

    return [...Array(end - start + 1)].map((_, i) => start + i);
  };

  const handleFirstPage = () => {
    if (hasPrevPage) {
      onPageChange(1);
    }
  };

  const handleLastPage = () => {
    if (hasNextPage) {
      onPageChange(totalPages);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    if (onPageChange && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="bg-white px-4 py-6 rounded-[4px] flex justify-between items-center">
      <div>
        <p className="text-gray-600 text-sm">
          Showing {startItem} to {endItem} of {totalItems} entries
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:cursor-not-allowed disabled:bg-gray-50"
          disabled={!hasPrevPage}
          onClick={handleFirstPage}
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          className="w-10 h-10 flex items-center justify-center px-3 py-2 border-2 border-gray-300 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:cursor-not-allowed disabled:bg-gray-50"
          disabled={!hasPrevPage}
          onClick={handlePrevPage}
        >
          <ChevronLeft size={18} />
        </button>

        {getPageNumbers().map((page) => (
          <button
            className={`w-10 h-10 px-3 py-2 border-2 border-gray-300 hover:bg-blue-300 rounded transition-colors
                ${
                  currentPage === page
                    ? "bg-blue-400 text-white"
                    : "text-gray-600"
                }
              `}
            onClick={() => handlePageClick(page)}
            key={page}
          >
            {page}
          </button>
        ))}

        <button
          className="w-10 h-10 flex items-center justify-center px-3 py-2 border-2 border-gray-300 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:cursor-not-allowed disabled:bg-gray-50"
          disabled={!hasNextPage}
          onClick={handleNextPage}
        >
          <ChevronRight size={18} />
        </button>

        <button
          className="w-10 h-10 flex items-center justify-center px-3 py-2 border-2 border-gray-300 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:cursor-not-allowed disabled:bg-gray-50"
          disabled={!hasNextPage}
          onClick={handleLastPage}
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
