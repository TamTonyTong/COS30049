import Header from '@/components/header'
import TradingChart from '@/components/trading-chart'
import TradingForm from '@/components/trading-form'
export default function TradingPage() {
    return (   
        <main className="container mx-auto px-4 py-8">
            <Header />
            <TradingChart />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TradingForm />
        </div>
        </main>
    )
}