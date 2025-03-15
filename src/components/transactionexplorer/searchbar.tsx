import React from "react";

interface SearchBarProps {
  address: string;
  setAddress: (address: string) => void;
  handleSearch: () => void;
  loading: boolean;
  error: string | null;
  isTransactionHash?: boolean;
  setIsTransactionHash?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  address,
  setAddress,
  handleSearch,
  loading,
  error,
  isTransactionHash = false,
  setIsTransactionHash = () => {},
}) => {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm text-gray-500">
        Example: 0xb0606f433496bf66338b8ad6b6d51fc4d84a44cd<br></br> External:
        0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={
            isTransactionHash
              ? "Enter transaction hash..."
              : "Enter wallet address..."
          }
          className="flex-grow rounded border bg-transparent p-2"
          disabled={loading}
        />
        {loading && (
          <div className="absolute right-12 flex items-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-t-blue-500"></div>
          </div>
        )}
        <button
          onClick={handleSearch}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-blue-300"
          disabled={loading}
        >
          Search
        </button>
      </div>

      {/* Search mode toggle */}
      <div className="mt-2 flex items-center">
        <label className="flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isTransactionHash}
            onChange={() => setIsTransactionHash(!isTransactionHash)}
            className="h-4 w-4 cursor-pointer"
          />
          <span className="ml-2 text-sm">Search by Transaction Hash</span>
        </label>
      </div>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default SearchBar;
