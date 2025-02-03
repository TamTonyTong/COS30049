"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TradingView() {
  const [symbol, setSymbol] = useState("AAPL")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter stock symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <Button>Search</Button>
        </div>
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="order">Place Order</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Trading chart for {symbol} will be displayed here</p>
            </div>
          </TabsContent>
          <TabsContent value="order">
            <form className="space-y-4">
              <div>
                <label htmlFor="order-type" className="block text-sm font-medium mb-1">
                  Order Type
                </label>
                <select id="order-type" className="w-full p-2 border rounded">
                  <option>Market</option>
                  <option>Limit</option>
                  <option>Stop</option>
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <Input type="number" id="quantity" min="1" />
              </div>
              <div className="flex space-x-2">
                <Button className="w-full">Buy</Button>
                <Button variant="secondary" className="w-full">
                  Sell
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

