import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Transaction } from "./type";
import {
  format,
  subDays,
  subHours,
  parseISO,
  isWithinInterval,
  formatISO,
} from "date-fns";

// Register ChartJS components including Filler for area charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface TransactionChartProps {
  transactions: Transaction[];
  timeRange: "24h" | "7d" | "30d";
}

const TransactionChart: React.FC<TransactionChartProps> = ({
  transactions,
  timeRange,
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<{
    total: number;
    valid: number;
    sample?: string;
  }>({ total: 0, valid: 0 });

  useEffect(() => {
    // Log received transactions for debugging
    console.log(
      "Transaction chart received",
      transactions.length,
      "transactions",
    );

    // Try to identify the timestamp format by inspecting the first transaction
    if (transactions.length > 0) {
      const sample = transactions[0];
      console.log("Sample transaction:", {
        hash: sample.hash?.substring(0, 10),
        timestamp: sample.timestamp,
        block_timestamp: sample.block_timestamp,
        time: sample.time,
        timeStamp: sample.timeStamp,
      });
    }

    const now = new Date();
    let startDate: Date;
    let intervalFormat: string = "MM/dd"; // Default format
    let intervals: Date[] = []; // Initialize with empty array

    // Set time range and format
    switch (timeRange) {
      case "24h":
        // Round to the current hour
        const roundedNow = new Date(now);
        roundedNow.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to 0

        startDate = subHours(roundedNow, 24);
        intervalFormat = "HH:mm";
        intervals = Array.from({ length: 25 }, (_, i) =>
          subHours(roundedNow, 24 - i),
        );
        break;
      case "7d":
        // Round to the current day
        const roundedDay = new Date(now);
        roundedDay.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, ms to 0

        startDate = subDays(roundedDay, 6); // Start 6 days ago from today (inclusive of today)
        intervalFormat = "MM/dd";
        intervals = Array.from(
          { length: 7 },
          (_, i) => subDays(roundedDay, 6 - i), // This creates intervals starting 6 days ago up to today
        );
        break;
      case "30d":
        // Round to the current day
        const roundedMonth = new Date(now);
        roundedMonth.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, ms to 0

        startDate = subDays(roundedMonth, 29); // Start 29 days ago from today (inclusive of today)
        intervalFormat = "MM/dd";
        intervals = Array.from(
          { length: 30 },
          (_, i) => subDays(roundedMonth, 29 - i), // This creates intervals starting 29 days ago up to today
        );
        break;
    }

    // Debug variable to track valid timestamps
    let validTransactionCount = 0;
    let sampleTimestampValue = "";

    // Count transactions for each interval
    const transactionCounts = intervals.map((date, index) => {
      // For the last element in each time range, we need to include the full day/hour
      const isLastInterval = index === intervals.length - 1;

      const nextDate = isLastInterval
        ? timeRange === "24h"
          ? new Date(date.getTime() + 3600000) // Add 1 hour for last hour interval
          : new Date(new Date(date).setHours(23, 59, 59, 999)) // End of day for weekly/monthly
        : intervals[index + 1];

      const matchingTransactions = transactions.filter((tx) => {
        try {
          // First check all possible timestamp fields (different APIs might use different field names)
          const timestampValue =
            tx.timestamp || tx.block_timestamp || tx.time || tx.timeStamp;

          if (!timestampValue) return false;

          // Save sample for debugging
          if (!sampleTimestampValue)
            sampleTimestampValue = String(timestampValue);

          let txDate: Date;

          if (typeof timestampValue === "string") {
            // Handle ISO date strings
            if (timestampValue.includes("T") || timestampValue.includes("-")) {
              txDate = parseISO(timestampValue);
            }
            // Handle Unix timestamps (seconds since epoch)
            else if (/^\d+$/.test(timestampValue)) {
              txDate = new Date(parseInt(timestampValue) * 1000);
            }
            // Try as direct date string
            else {
              txDate = new Date(timestampValue);
            }
          } else if (typeof timestampValue === "number") {
            // Handle Unix timestamps
            txDate = new Date(timestampValue * 1000);
          } else {
            // Try direct conversion
            txDate = new Date(timestampValue);
          }

          // Verify if the parsed date is valid
          if (isNaN(txDate.getTime())) return false;

          validTransactionCount++;
          return isWithinInterval(txDate, { start: date, end: nextDate });
        } catch (error) {
          console.warn("Error processing timestamp:", error);
          return false;
        }
      });

      return matchingTransactions.length;
    });

    // Update debug info
    setDebugInfo({
      total: transactions.length,
      valid: validTransactionCount,
      sample: sampleTimestampValue,
    });

    console.log("Valid transactions with timestamps:", validTransactionCount);
    console.log("Sample timestamp:", sampleTimestampValue);
    console.log("Transaction counts:", transactionCounts);

    // Prepare chart data
    const data = {
      labels: intervals.map((date) => format(date, intervalFormat)),
      datasets: [
        {
          label: "Transaction Count",
          data: transactionCounts,
          borderColor: "hsl(215, 25%, 27%)", // Darker outline
          backgroundColor: "hsla(215, 25%, 27%, 0.3)", // Lighter fill with transparency
          tension: 0.4,
          fill: true, // Enable area fill
          pointBackgroundColor: "hsl(215, 25%, 27%)",
          pointBorderColor: "#fff",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };

    setChartData(data);
  }, [transactions, timeRange]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: true,
        text: `Transaction Activity (${
          timeRange === "24h"
            ? "Last 24 Hours"
            : timeRange === "7d"
              ? "Last Week"
              : "Last Month"
        })`,
        color: "hsl(215, 0%, 100%)",
        font: {
          size: 16,
          weight: 600,
        },
        padding: {
          bottom: 15,
        },
      },
      tooltip: {
        backgroundColor: "hsl(0, 0%, 100%)",
        titleColor: "hsl(215, 25%, 27%)",
        bodyColor: "hsl(215, 16%, 47%)",
        borderColor: "hsl(210, 20%, 90%)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            return `Transactions: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        // grid: {
        //   color: "hsla(210, 20%, 90%, 0.5)",
        // },
        ticks: {
          precision: 0,
          stepSize: 1,
          color: "hsl(215, 16%, 47%)",
          font: {
            size: 11,
          },
        },
      },
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          color: "hsl(215, 16%, 47%)",
          font: {
            size: 10,
          },
          maxRotation: 0, // Prevent label rotation
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        hoverBorderWidth: 2,
      },
    },
    layout: {
      padding: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
      },
    },
  };

  if (!chartData) return null;

  // If we have no valid transactions with timestamps, show a message
  if (debugInfo.valid === 0) {
    return (
      <div className="flex h-[240px] w-full flex-col items-center justify-center rounded-lg bg-white p-4 shadow">
        <p className="mb-2 text-center text-gray-500">
          No transaction data with valid timestamps available
        </p>
        <p className="text-sm text-gray-400">
          Sample timestamp format: {debugInfo.sample || "None"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-1/2 rounded-lg bg-[hsl(215,25%,15%)] p-4 shadow">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TransactionChart;
