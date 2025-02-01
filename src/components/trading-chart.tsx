"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface PriceData {
  time: number
  price: number
}

export default function TradingChart() {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Connect to Binance WebSocket
    ws.current = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade")

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const newPrice: PriceData = {
        time: message.E,
        price: Number.parseFloat(message.p),
      }

      setPriceData((prevData) => {
        const newData = [...prevData, newPrice]
        // Keep only the last 100 data points
        return newData.slice(-100)
      })
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const chartData = {
    labels: priceData.map((data) => new Date(data.time).toLocaleTimeString()),
    datasets: [
      {
        label: "BTC/USDT",
        data: priceData.map((data) => data.price),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (USDT)",
        },
        ticks: {
          callback: (value: number) => `$${value.toFixed(2)}`,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "BTC/USDT Real-time Price",
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Price: $${context.parsed.y.toFixed(2)}`,
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>BTC/USDT Real-time Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  )
}

