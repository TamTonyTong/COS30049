import Layout from "@/components/layout"
import { Search } from "lucide-react"
<<<<<<< HEAD
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import Link from "next/link"
import DashboardPreview from "../components/dashboard-preview"
=======
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DashboardPreview from "@/components/dashboard-preview"
>>>>>>> ab0083807486c54e1e75856915deec4ce0efb9c5

export default function Home() {
  // const apiKey = process.env.NEXT_PUBLIC_GECKO_API_KEY
  
  // const options = {
  //   method: 'GET',
  //   headers: {
  //     accept: 'application/json',
  //     'x-cg-api-key': `${apiKey}`
  //   }
  // };

  // fetch('https://api.coingecko.com/api/v3/ping', options)
  // .then(res => res.json())
  // .then(res => console.log(res))
  // .catch(err => console.error(err));
  
  return (
    <Layout>
      <div className="flex flex-col items-center mb-24 text-center">
        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mb-16">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
          <div className="relative flex items-center bg-[#1a2b4b]/80 rounded-full overflow-hidden border border-blue-500/30">
            <Search className="w-5 h-5 ml-4 text-blue-400" />
            <Input
              type="text"
              placeholder="Search Markets Here..."
              className="text-white bg-transparent border-0 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Hero Text */}
        <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
          Professional Trading with <span className="text-blue-400">TradePro</span>
        </h1>

        <p className="max-w-3xl mb-12 text-gray-400">
          Experience the power of advanced trading tools, real-time market data, and expert insights. Join TradePro
          today and elevate your trading strategy to new heights.
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
          <Button className="px-8 text-white bg-blue-500 rounded-full hover:bg-blue-600">Get Started</Button>
          </Link>
          
          <Link href="/about">
          <Button variant="outline" className="border-gray-600 text-white hover:bg-[#1a2b4b] rounded-full px-8">
            Learn More
          </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Preview */}
      <DashboardPreview />
    </Layout>
  )
}

