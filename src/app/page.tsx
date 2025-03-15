import Layout from "@/src/components/layout";
import { Search, Activity, Shield } from "lucide-react";

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

      {/* Transaction Explorer Section */}
      <div className="my-24 px-4">
        <div className="mx-auto max-w-6xl rounded-xl bg-[#172035] p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-8 md:mb-0 md:w-1/2">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Transaction <span className="text-blue-400">Explorer</span>
              </h2>
              <p className="mb-6 text-gray-400">
                Trade with confidence by investigating wallet addresses before
                making any transactions. Our powerful explorer tool lets you
                track wallet activity, view transaction history, and assess
                potential trading partners for enhanced security.
              </p>

              {/* New paragraph about scam prevention */}
              <p className="mb-6 text-gray-400">
                <span className="font-semibold text-red-400">
                  Protect yourself from scams:
                </span>{" "}
                In the crypto world, wallet history reveals everything.
                Suspicious transaction patterns, unusually new wallets, or
                addresses linked to known scams can all be red flags. Our
                explorer gives you the power to verify trustworthiness before
                risking your assets, significantly reducing your chances of
                falling victim to fraud.
              </p>

              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <span className="text-white">Verify wallet credibility</span>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-400" />
                  <span className="text-white">Review trading patterns</span>
                </div>
              </div>
              <Link href="/transaction_explorer">
                <Button className="rounded-full bg-blue-500 px-8 text-white hover:bg-blue-600">
                  Explore Transactions
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-lg border border-blue-500/30">
                <div className="absolute inset-0 bg-blue-500/10 blur-sm" />
                <div className="relative p-1">
                  <div className="rounded bg-[#0d1829] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-medium text-blue-400">
                        Wallet Explorer
                      </h4>
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-md bg-[#172035] p-2"
                        >
                          <div className="truncate text-sm text-gray-400">
                            0x7a2s...9f3d
                          </div>
                          <div className="text-sm font-medium text-white">
                            {i === 1
                              ? "+0.25 ETH"
                              : i === 2
                                ? "-1.05 ETH"
                                : "+2.40 ETH"}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-[#172035]">
                      <div className="h-2 w-3/4 rounded-full bg-blue-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Dashboard Preview */}
      <DashboardPreview />
    </Layout>
  );
}
