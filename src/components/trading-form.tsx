"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function TradingForm() {
  const [orderType, setOrderType] = useState("limit")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy">
            <form className="space-y-4">
              <div>
                <Label htmlFor="buy-price">Price</Label>
                <Input id="buy-price" type="number" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="buy-amount">Amount</Label>
                <Input id="buy-amount" type="number" placeholder="0.00" />
              </div>
              <Link href="/trade/buy">
              <Button className="w-full bg-green-500 hover:bg-green-600">Buy BTC</Button>
              </Link>
            </form>
          </TabsContent>
          <TabsContent value="sell">
            <form className="space-y-4">
              <div>
                <Label htmlFor="sell-price">Price</Label>
                <Input id="sell-price" type="number" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="sell-amount">Amount</Label>
                <Input id="sell-amount" type="number" placeholder="0.00" />
              </div>
              <Link href="/trade/sell">
              <Button className="w-full bg-red-500 hover:bg-red-600">Sell BTC</Button>
              </Link>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

