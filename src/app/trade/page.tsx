import Header from "@/components/header"
import TradingChart from "@/components/trading-chart"
import TradingForm from "@/components/trading-form"

export default function TradingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Crypto Trading Platform</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TradingChart />
          </div>
          <div>
            <TradingForm />
          </div>
        </div>
      </main>
    </div>
  )
}

