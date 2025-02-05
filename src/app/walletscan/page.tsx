import { Search } from "lucide-react";
import Layout from "../components/layout";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

export default function WalletScan() {
  return (
    <Layout>
      <div className="flex flex-col items-left text-center mb-24">
        <div className="relative w-full max-w-2xl mb-16">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <p>Example Address</p>
          <div className="relative flex items-center justify-end bg-[#1a2b4b]/80 rounded-full overflow-hidden border border-blue-500/30">
            <Input
              type="text"
              placeholder="Search by Address"
              className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 ml-2"
              value = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5 "
            />
            
            <Button className = "bg-transparent hover:bg-inherit">
            <Search className="w-5 h-5 text-blue-400 mr-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
