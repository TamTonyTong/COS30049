"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceData {
  time: number;
  price: number;
}

interface TradingChartProps {
  tradingPair: string;
}

export default function TradingChart({ tradingPair }: TradingChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (ws.current) {
      ws.current.close();
    }

    // Connect to Binance WebSocket with dynamic trading pair
    ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${tradingPair}@trade`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const newPrice: PriceData = {
        time: message.E,
        price: Number.parseFloat(message.p),
      };

      setPriceData((prevData) => {
        const newData = [...prevData, newPrice];
        return newData.slice(-100); // Keep only the last 100 data points
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [tradingPair]); // Reconnect WebSocket when trading pair changes

  const chartData: ChartData<"line"> = {
    labels: priceData.map((data) => new Date(data.time).toLocaleTimeString()),
    datasets: [
      {
        label: tradingPair.toUpperCase(),
        data: priceData.map((data) => data.price),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { 
        title: { display: true, text: "Price (USDT)" },
        ticks: { callback: (value: number | string) => `$${Number(value).toFixed(2)}` },
      },
    },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${tradingPair.toUpperCase()} Real-time Price` },
      tooltip: { callbacks: { label: (context: TooltipItem<"line">) => `Price: $${context.parsed.y.toFixed(2)}` } },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tradingPair.toUpperCase()} Real-time Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
