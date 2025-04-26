import React from 'react';
import PropTypes from 'prop-types';

function PaginationControls({ paginationData, onPageChange }) {
  if (!paginationData || paginationData.total_pages <= 1) {
    return null;
  }

  const { page, total_pages, has_prev, has_next, total_items } = paginationData;

  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => has_prev && onPageChange(page - 1)}
          disabled={!has_prev}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            has_prev
              ? 'bg-white text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => has_next && onPageChange(page + 1)}
          disabled={!has_next}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            has_next
              ? 'bg-white text-gray-700 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{page}</span> of{' '}
            <span className="font-medium">{total_pages}</span> ({' '}
            <span className="font-medium">{total_items}</span> total items )
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => has_prev && onPageChange(page - 1)}
              disabled={!has_prev}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                has_prev
                  ? 'bg-white text-gray-500 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            
            {/* Current Page Number */}
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {page}
            </span>

            <button
              onClick={() => has_next && onPageChange(page + 1)}
              disabled={!has_next}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                has_next
                  ? 'bg-white text-gray-500 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

PaginationControls.propTypes = {
  paginationData: PropTypes.shape({
    page: PropTypes.number.isRequired,
    total_pages: PropTypes.number.isRequired,
    has_prev: PropTypes.bool.isRequired,
    has_next: PropTypes.bool.isRequired,
    total_items: PropTypes.number.isRequired,
  }),
  onPageChange: PropTypes.func.isRequired,
};

export default PaginationControls; 