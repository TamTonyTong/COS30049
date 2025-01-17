import Header from '@/components/header'
import TradingForm from '@/components/trading-form'
export default function TradingPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TradingForm />
        </div>
    )
}