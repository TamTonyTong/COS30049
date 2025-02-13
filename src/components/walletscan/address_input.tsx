// src/components/AddressInput.tsx
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
    <div className="relative w-full max-w-2xl mb-16">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
          <p>Example Address</p>
          <div className="relative flex items-center justify-end bg-[#1a2b4b]/80 rounded-full overflow-hidden border border-blue-500/30">
      <Input
        type="text"
        placeholder="Search by Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button onClick={fetchBalance} disabled={loading}>
        {loading ? (
          <p className="font-semibold text-green-400">Loading...</p>
        ) : (
          <Search className="w-5 h-5 mr-4 text-blue-400" />
        )}
      </Button>
      </div>
    </div>
  );
}
