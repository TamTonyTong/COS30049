"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
<<<<<<< HEAD
} from "@/components/ui/card";
=======
} from "@/components/ui/card"

>>>>>>> parent of 4b913a2 (Update Chart)
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
<<<<<<< HEAD
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface PriceData {
  time: string; // Time in "HH:MM AM/PM" format
=======
} from "@/components/ui/chart"

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

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"


interface PriceData {
  time: number;
>>>>>>> parent of 4b913a2 (Update Chart)
  price: number;
}

interface TradingChartProps {
  tradingPair: string;
}

export default function TradingChart({ tradingPair }: TradingChartProps) {
  const baseCurrency = tradingPair.replace("usdt", " / usdt").toUpperCase();
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const ws = useRef<WebSocket | null>(null);

  // Fetch historical data from Binance API
  const fetchHistoricalData = async () => {
    const interval = "1h"; // 1-hour interval
    const limit = 24; // Fetch last 24 hours of data
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${tradingPair.toUpperCase()}&interval=${interval}&limit=${limit}`
    );
    const data = await response.json();

    // Format historical data
    const historicalData: PriceData[] = data.map((kline: any) => ({
      time: new Date(kline[0]).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      price: parseFloat(kline[4]), // Use the closing price
    }));

    setPriceData(historicalData);
  };

  // Aggregate data by hour
  const aggregateDataByHour = (data: PriceData[]) => {
    const hourlyData = new Map<string, number[]>();

    data.forEach((entry) => {
      const date = new Date(`1970-01-01 ${entry.time}`); // Use a dummy date to parse time
      const hour = `${date.getHours()}:00`; // Group by hour

      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, []);
      }
      hourlyData.get(hour)?.push(entry.price);
    });

    // Calculate average price for each hour
    const aggregatedData: PriceData[] = [];
    hourlyData.forEach((prices, hour) => {
      const averagePrice =
        prices.reduce((sum, price) => sum + price, 0) / prices.length;
      aggregatedData.push({ time: hour, price: averagePrice });
    });

    // Sort by time
    aggregatedData.sort((a, b) => a.time.localeCompare(b.time));

    return aggregatedData;
  };

  useEffect(() => {
    // Fetch historical data on component mount
    fetchHistoricalData();

    if (ws.current) {
      ws.current.close();
    }

    // Connect to Binance WebSocket with dynamic trading pair
    ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${tradingPair}@trade`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
<<<<<<< HEAD

      const newPrice: PriceData = {
        time: new Date(message.T).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
=======
      const newPrice: PriceData = {
        time: message.E,
>>>>>>> parent of 4b913a2 (Update Chart)
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

<<<<<<< HEAD
  // Aggregate data by hour
  const hourlyData = aggregateDataByHour(priceData);
=======
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

const chartData = {
  labels: priceData.map
} 


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
>>>>>>> parent of 4b913a2 (Update Chart)

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{baseCurrency.toUpperCase()} Hourly Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          {/* <Line data={chartData} options={chartOptions} /> */}
          <ChartContainer config={chartConfig}>
<<<<<<< HEAD
            <LineChart accessibilityLayer data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickMargin={8} />
              <YAxis
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 0.99), // Slightly lower than min price
                  (dataMax: number) => Math.ceil(dataMax * 1.01), // Slightly higher than max price
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
=======
          <LineChart

            ></LineChart>
            </ChartContainer>
>>>>>>> parent of 4b913a2 (Update Chart)
        </div>
      </CardContent>
    </Card>
  );
}