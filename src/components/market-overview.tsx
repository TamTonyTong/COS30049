"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

interface MarketIndex {
  name: string
  value: number
  change: number
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<MarketIndex[]>([
    { name: "S&P 500", value: 4185.47, change: 0.75 },
    { name: "Dow Jones", value: 33875.4, change: -0.23 },
    { name: "NASDAQ", value: 12153.41, change: 2.19 },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {indices.map((index) => (
            <div key={index.name} className="text-center">
              <h3 className="font-semibold">{index.name}</h3>
              <p className="text-2xl font-bold">{index.value.toFixed(2)}</p>
              <p
                className={`flex items-center justify-center ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {index.change >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {Math.abs(index.change).toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

