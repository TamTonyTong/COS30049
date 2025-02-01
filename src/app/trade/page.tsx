"use client"
import { useState } from "react";
import Header from '@/components/header'
import TradingChart from '@/components/trading-chart'
import TradingForm from '@/components/trading-form'
export default function TradingPage() {
    const [tradingPair, setTradingPair] = useState("BTC/USDT");
    return (
        <main className="container mx-auto px-4 py-8">
            <Header />
            <div>
                {/* Trading Pair Selector */}
                <select
                    value={tradingPair}
                    onChange={(e) => setTradingPair(e.target.value)}
                    className="w-full p-2 border rounded-md">
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="ADA/USDT">ADA/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                </select>
                
            </div>
            <TradingChart tradingPair={tradingPair} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <TradingForm tradingPair={tradingPair} />
            </div>
        </main>
    )
}