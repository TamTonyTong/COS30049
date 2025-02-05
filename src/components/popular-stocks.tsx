"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
}

export default function PopularStocks() {
  const [stocks, setStocks] = useState<Stock[]>([])

  useEffect(() => {
    fetch("/api/stocks")
      .then((res) => res.json())
      .then((data) => setStocks(data))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {stocks.map((stock) => (
            <li key={stock.symbol} className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{stock.symbol}</h3>
                <p className="text-sm text-muted-foreground">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${stock.price.toFixed(2)}</p>
                <p className={`flex items-center ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stock.change >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(stock.change).toFixed(2)}%
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

