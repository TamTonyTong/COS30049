"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface PriceData {
  time: string;
  price: number;
}

interface TradingChartProps {
  tradingPair: string;
}

export default function TradingChart({ tradingPair }: TradingChartProps) {
  const apiKey = process.env.NEXT_PUBLIC_GECKO_API_KEY;
  const baseCurrency = tradingPair.replace("usdt", "").toLowerCase();
  console.log(baseCurrency)
  const [priceData, setPriceData] = useState<PriceData[]>([]);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const options = {
          method: 'GET',
          headers: {accept: 'application/json', 'x-cg-api-key': `${apiKey}`}
        };
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${baseCurrency}/market_chart?vs_currency=usd&days=30`
          
          , options)
          // {
          //   method: "GET",
          //   headers: {
          //     accept: "application/json",
          //     "x-cg-api-key": apiKey || "",
          //   },
          // }
        ;
        console.log("Response status:", response.status); // Logs HTTP status
    console.log("Response headers:", response.headers); // Logs headers

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Raw API data:", data); // Logs the entire API response
        // Transform the API response into the required format
        const formattedData = data.prices.map((entry: [number, number]) => ({
          time: new Date(entry[0]).toLocaleDateString(),
          price: entry[1],
        }));

        setPriceData(formattedData);
      } catch (error) {
        console.error("Failed to fetch price data:", error);
      }
    };

    fetchPriceData();
  }, [tradingPair, apiKey]);

  const chartConfig = {
    price: {
      label: "Price ",
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
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="5" />
              <XAxis dataKey="time" tickMargin={8} />
              <YAxis domain={["auto", "auto"]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="price"
                type="monotone"
                stroke="#e5b10c"
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 1 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
