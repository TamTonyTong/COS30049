"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";

import { Brush, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import "boxicons/css/boxicons.min.css";

interface PriceData {
  time: string;
  price: number;
}

interface TradingChartProps {
  tradingPair: string;
}

export default function TradingChart({ tradingPair }: TradingChartProps) {
  const apiKey = process.env.GECKO_API_KEY;
  console.log(apiKey);
  const Currency = tradingPair;
  const baseCurrency = Currency.charAt(0).toUpperCase() + Currency.slice(1);
  console.log(baseCurrency);
  const [priceData, setPriceData] = useState<PriceData[]>([]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-yellow-400 bg-gray-800 p-4 text-lg text-white shadow-xl">
          <p className="font-semibold">{`Price: $${payload[0].value.toFixed(0)}`}</p>
          <p className="opacity-75">{`Date: ${payload[0].payload.time}`}</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const options = {
          method: "GET",
          headers: { accept: "application/json", "x-cg-api-key": `` },
        };
        const response = await fetch(
          // `https://api.coingecko.com/api/v3/coins/${baseCurrency.toLowerCase()}/market_chart?vs_currency=usd&days=7`
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=14`,
          options,
        );
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
  const icon_btc = <i className="bx bxl-bitcoin align-middle text-5xl"></i>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {baseCurrency} Price Chart {icon_btc}{" "}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-full w-full">
          <ChartContainer config={chartConfig}>
            <LineChart data={priceData}>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#aab8c2"
              />
              <XAxis dataKey="time" tickMargin={8} />
              <YAxis orientation="right" domain={["auto", "auto"]} />
              <ChartTooltip
                cursor={true}
                // content={<ChartTooltipContent indicator="dot" active = {true}/>}
                content={CustomTooltip}
              />

              <Line
                dataKey="price"
                type="monotone"
                stroke="#e5b10c"
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Brush dataKey="time" height={20} stroke="#e5b10c" />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
