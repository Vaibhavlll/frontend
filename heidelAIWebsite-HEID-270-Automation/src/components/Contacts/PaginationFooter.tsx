import { useEffect, useCallback } from 'react';

interface PaginationFooterProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function PaginationFooter({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: PaginationFooterProps) {

  const calculateOptimalItemsPerPage = useCallback(() => {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    
    const itemHeight = 80;
    const headerHeight = 120;
    const paginationHeight = 80;
    const padding = 100;

    const availableHeight = screenHeight - headerHeight - paginationHeight - padding;
    const maxItemsBasedOnHeight = Math.floor(availableHeight / itemHeight);

    let optimalItems;
    if (screenWidth < 1440) {
      optimalItems = Math.max(10, Math.min(20, maxItemsBasedOnHeight));
    } else if (screenWidth < 1920) {
      optimalItems = Math.max(10, Math.min(25, maxItemsBasedOnHeight));
    } else {
      optimalItems = Math.max(10, Math.min(30, maxItemsBasedOnHeight));
    }

    // Ensure minimum of 10 items, maximum of 30
    return Math.max(10, Math.min(optimalItems, 30));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newItemsPerPage = calculateOptimalItemsPerPage();
      if (newItemsPerPage !== itemsPerPage && onItemsPerPageChange) {
        onItemsPerPageChange(newItemsPerPage);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateOptimalItemsPerPage, itemsPerPage, onItemsPerPageChange]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    // Desktop always shows 7 visible pages
    const maxVisiblePages = 7;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

return (
  <div className="border-t bg-white">
    <div className="px-6 py-3">
      <div className="flex justify-between items-center">
        {/* Items info */}
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs font-medium text-gray-700">
            Showing {startItem} to {endItem} of {totalItems} contacts
          </span>
          <span className="font-sans text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {itemsPerPage} per page
          </span>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* First page button if not in view */}
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-6 h-6 font-sans text-[11px] font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="font-sans text-xs text-gray-400">...</span>
              )}
            </>
          )}

          {/* Page number buttons */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-6 h-6 font-sans text-[11px] font-medium rounded-md transition-colors ${
                currentPage === page
                  ? "bg-gray-300 text-gray-900 shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Last page button if not in view */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="font-sans text-xs text-gray-400">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-6 h-6 font-sans text-[11px] font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Previous/Next buttons */}
          <div className="flex items-center gap-1 ml-3 border-l pl-3">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-2 py-1 font-sans text-[11px] font-medium rounded-md bg-gray-100 text-gray-700 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              Prev
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-2 py-1 font-sans text-[11px] font-medium rounded-md bg-gray-100 text-gray-700 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
