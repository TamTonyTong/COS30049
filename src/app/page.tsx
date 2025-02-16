import Layout from "@/src/components/layout";
import { Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Link from "next/link";
import DashboardPreview from "../components/dashboard-preview";

export default function Home() {
  return (
    <Layout>
      <div className="mb-24 flex flex-col items-center text-center">
        {/* Search Bar */}
        <div className="relative mb-16 w-full max-w-2xl">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
          <div className="relative flex items-center overflow-hidden rounded-full border border-blue-500/30 bg-[#1a2b4b]/80">
            <Search className="ml-4 h-5 w-5 text-blue-400" />
            <Input
              type="text"
              placeholder="Search Markets Here..."
              className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Hero Text */}
        <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
          Professional Trading with{" "}
          <span className="text-blue-400">TradePro</span>
        </h1>

        <p className="mb-12 max-w-3xl text-gray-400">
          Experience the power of advanced trading tools, real-time market data,
          and expert insights. Join TradePro today and elevate your trading
          strategy to new heights.
        </p>

        {/* Features */}
        <div className="mb-12 flex flex-wrap justify-center gap-8">
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/20">
              <span className="rotate-45 transform">↗</span>
            </div>
            Lightning-Fast Execution
          </div>
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/20">
              <span className="rotate-45 transform">↗</span>
            </div>
            Bank-Grade Security
          </div>
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/20">
              <span>↻</span>
            </div>
            24/7 Market Updates
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Link href="/login">
            <Button className="rounded-full bg-blue-500 px-8 text-white hover:bg-blue-600">
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
