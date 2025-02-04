import Layout from "./components/layout"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardPreview from "./components/dashboard-preview"

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center text-center mb-24">
        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mb-16">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <div className="relative flex items-center bg-[#1a2b4b]/80 rounded-full overflow-hidden border border-blue-500/30">
            <Search className="w-5 h-5 text-blue-400 ml-4" />
            <Input
              type="text"
              placeholder="Search Markets Here..."
              className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Professional Trading with <span className="text-blue-400">TradePro</span>
        </h1>

        <p className="text-gray-400 max-w-3xl mb-12">
          Experience the power of advanced trading tools, real-time market data, and expert insights. Join TradePro
          today and elevate your trading strategy to new heights.
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
              <span className="transform rotate-45">↗</span>
            </div>
            Lightning-Fast Execution
          </div>
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
              <span className="transform rotate-45">↗</span>
            </div>
            Bank-Grade Security
          </div>
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
              <span>↻</span>
            </div>
            24/7 Market Updates
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Button className="bg-blue-500 text-white hover:bg-blue-600 rounded-full px-8">Get Started</Button>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-[#1a2b4b] rounded-full px-8">
            Learn More
          </Button>
        </div>
      </div>

      {/* Dashboard Preview */}
      <DashboardPreview />
    </Layout>
  )
}

