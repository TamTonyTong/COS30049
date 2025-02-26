import React from "react";

interface SearchBarProps {
  address: string;
  setAddress: (address: string) => void;
  handleSearch: () => void;
  loading: boolean;
  error: string | null;
}

const SearchBar: React.FC<SearchBarProps> = ({
  address,
  setAddress,
  handleSearch,
  loading,
  error,
}) => {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm text-gray-500">
        Example: 0xb0606f433496bf66338b8ad6b6d51fc4d84a44cd
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Address ID"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-grow rounded border bg-transparent p-2"
        />
        <button
          onClick={handleSearch}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default SearchBar;
