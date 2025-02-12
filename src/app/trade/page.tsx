/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState} from "react";
import TradingChart from "@/src/components/trading/trading-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import TradeHistory from "@/src/components/trading/transactions/trading-history";
import Layout from "@/src/components/layout";
import BalanceCard from "@/src/components/trading/transactions/balance-card";
import OrderForm from "@/src/components/trading/transactions/order-form";
import TradingPairSelector from "@/src/components/trading/transactions/trading-pair-selector";

export default function TradingPage(this: any) {
  const [orderType, setOrderType] = useState<string>("buy");
  const [price, setPrice] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [tradingPair, setTradingPair] = useState<string>("bitcoin");
  const icon_order = <i className="bx bxs-cart"></i>;
  return (
    <Layout>
      <div className="grid gap-8 lg:grid-cols-3 mb-6">
        <BalanceCard/>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TradingChart tradingPair={tradingPair} />
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Place Order {icon_order}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Trading Pair Selector */}
              <TradingPairSelector tradingPair={tradingPair} setTradingPair={setTradingPair}/>
              <OrderForm
                orderType={orderType}
                setOrderType={setOrderType}
                price={price}
                setPrice={setPrice}
                amount={amount}
                setAmount={setAmount}
                tradingPair={tradingPair}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <TradeHistory/>
    </Layout>
  );
}
