import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

type AddressInputProps = {
  address: string;
  setAddress: (address: string) => void;
  loading: boolean;
  fetchBalance: () => void;
};

export default function AddressInput({
  address,
  setAddress,
  loading,
  fetchBalance,
}: AddressInputProps) {
  return (
    <div className="relative mb-16 w-full max-w-2xl">
      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
      <p>Example Address</p>
      <div className="relative flex items-center justify-end overflow-hidden rounded-full border border-blue-500/30 bg-[#1a2b4b]/80">
        <Input
          type="text"
          placeholder="Search by Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button
          onClick={fetchBalance}
          disabled={loading}
          className="bg-transparent hover:bg-current"
        >
          {loading ? (
            <p className="font-semibold text-green-400">Loading...</p>
          ) : (
            <Search className="mr-4 h-5 w-5 text-blue-400" />
          )}
        </Button>
      </div>
    </div>
  );
}
