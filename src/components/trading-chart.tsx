"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartData,
//   ChartOptions,
//   TooltipItem,
// } from "chart.js";
// import { Line } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from "recharts";

interface PriceData {
  time: string;
  price: number;
}

interface TradingChartProps {
  tradingPair: string;
}

export default function TradingChart({ tradingPair }: TradingChartProps) {
  const baseCurrency = tradingPair.replace("usdt", " / usdt").toUpperCase();
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (ws.current) {
      ws.current.close();
    }

    // Connect to Binance WebSocket with dynamic trading pair
    ws.current = new WebSocket(
      `wss://stream.binance.com:9443/ws/${tradingPair}@trade`
    );

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      
      const newPrice: PriceData = {
        time: new Date(message.T).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,}),
        price: Number.parseFloat(message.p),
      };

      setPriceData((prevData) => {
        const newData = [...prevData, newPrice];
        return newData.slice(-50); // Keep only the last 100 data points
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [tradingPair]); // Reconnect WebSocket when trading pair changes

  // const chartData: ChartData<"line"> = {
  //   labels: priceData.map((data) => new Date(data.time).toLocaleTimeString()),
  //   datasets: [
  //     {
  //       label: tradingPair.toUpperCase(),
  //       data: priceData.map((data) => data.price),
  //       borderColor: "rgb(75, 192, 192)",
  //       tension: 0.1,
  //     },
  //   ],
  // };

  // const chartOptions: ChartOptions<"line"> = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   scales: {
  //     x: { title: { display: true, text: "Time" } },
  //     y: {
  //       title: { display: true, text: "Price (USDT)" },
  //       ticks: { callback: (value: number | string) => `$${Number(value).toFixed(2)}` },
  //     },
  //   },
  //   plugins: {
  //     legend: { position: "top" },
  //     title: { display: true, text: `${tradingPair.toUpperCase()} Real-time Price` },
  //     tooltip: { callbacks: { label: (context: TooltipItem<"line">) => `Price: $${context.parsed.y.toFixed(2)}` } },
  //   },
  // };

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--chart-1))",
    },
    time: {
      label: "Time",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{baseCurrency.toUpperCase()} Real-time Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-full">
          <ChartContainer config={chartConfig}>
            <LineChart accessibilityLayer data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickMargin={8}
              />
              <YAxis
               domain={[
                (dataMin: number) => Math.floor(dataMin * 1), // Slightly lower than min price
                (dataMax: number) => Math.ceil(dataMax * 1.00002),  // Slightly higher than max price
              ]}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="price"
                type="natural"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-desktop)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
