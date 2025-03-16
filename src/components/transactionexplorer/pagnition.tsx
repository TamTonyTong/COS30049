import React from "react";

interface PaginationProps {
  currentPage: number;
  maxPage: number;
  navigateToPage: (page: number) => void;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  maxPage,
  navigateToPage,
  loadMore,
  hasMore,
  loading,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-10 pt-6">
      <div className="flex gap-2">
        <button
          onClick={() => navigateToPage(currentPage - 1)}
          className="rounded bg-gray-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          disabled={currentPage <= 1}
        >
          Previous
        </button>

        <div className="flex items-center px-2">
          <span className="text-sm">
            Page {currentPage} of {maxPage}
          </span>
        </div>

        <button
          onClick={() => navigateToPage(currentPage + 1)}
          className="rounded bg-gray-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          disabled={currentPage >= maxPage}
        >
          Next
        </button>
      </div>

      {(hasMore || loading) && (
        <button
          onClick={loadMore}
          className="rounded bg-green-500 px-4 py-2 text-white disabled:bg-green-300"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default Pagination;
