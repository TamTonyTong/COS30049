"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TradingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>BTC/USDT</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px] bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Trading Chart Placeholder</p>
        </div>
      </CardContent>
    </Card>
  )
}

