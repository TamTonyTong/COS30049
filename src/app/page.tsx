import Layout from "@/src/components/layout";
import { Search } from "lucide-react";
import EnhancedSearchBar from "@/src/components/enhanced-search-bar"
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Link from "next/link";
import DashboardPreview from "../components/dashboard-preview";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center mb-24 text-center">
        {/* Enhanced Search Bar */}
        <div className="w-full max-w-3xl mb-16">
          <EnhancedSearchBar />
        </div>

        {/* Hero Text */}
        <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
          Professional Trading with{" "}
          <span className="text-blue-400">TradePro</span>
        </h1>

        <p className="max-w-3xl mb-12 text-gray-400">
          Experience the power of advanced trading tools, real-time market data,
          and expert insights. Join TradePro today and elevate your trading
          strategy to new heights.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-white">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-500/20">
              <span className="transform rotate-45">↗</span>
            </div>
            Lightning-Fast Execution
          </div>
          <div className="flex items-center gap-2 text-white">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-500/20">
              <span className="transform rotate-45">↗</span>
            </div>
            Bank-Grade Security
          </div>
          <div className="flex items-center gap-2 text-white">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-500/20">
              <span>↻</span>
            </div>
            24/7 Market Updates
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Link href="/login">
            <Button className="px-8 text-white bg-blue-500 rounded-full hover:bg-blue-600">
              Get Started
            </Button>
          </Link>

          <Link href="/about">
            <Button
              variant="outline"
              className="rounded-full border-gray-600 px-8 text-white hover:bg-[#1a2b4b]"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Preview */}
      <DashboardPreview />
    </Layout>
  );
}
