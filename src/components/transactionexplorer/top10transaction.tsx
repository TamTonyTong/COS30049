import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Transaction } from "./type";
import TransactionDetail from "./transactiondetail";

interface TopTransactionsChartProps {
  transactions: Transaction[];
}

const TopTransactionsChart: React.FC<TopTransactionsChartProps> = ({
  transactions,
}) => {
  // Add state for selected transaction
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Process transactions to get top 10 by volume
  const topTransactions = useMemo(() => {
    // Extract transactions with valid values
    const txWithValues = transactions.filter((tx) => {
      const value = Number(tx.value || tx.amount || "0");
      return !isNaN(value) && value > 0;
    });

    // Sort by value (descending)
    const sorted = [...txWithValues].sort((a, b) => {
      const valueA = Number(a.value || a.amount || "0");
      const valueB = Number(b.value || b.amount || "0");
      return valueB - valueA;
    });

    // Take top 10 and format for chart
    return sorted.slice(0, 10).map((tx, index) => {
      // Get value in appropriate unit
      const rawValue = Number(tx.value || tx.amount || "0");
      // For ETH transactions, convert from wei to ether
      const value = tx.value ? rawValue / 1e18 : rawValue;

      // Get abbreviated hash
      const hash = tx.hash
        ? `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`
        : "Unknown";

      return {
        hash,
        fullHash: tx.hash || "",
        value,
        // Store the original transaction object for later use
        originalTx: tx,
        // Create a gradient from blue to light blue based on position
        fill: `hsl(215, 80%, ${50 - index * 2}%)`,
      };
    });
  }, [transactions]);

  // Calculate average transaction value
  const averageValue = useMemo(() => {
    if (topTransactions.length === 0) return 0;
    const sum = topTransactions.reduce((acc, tx) => acc + tx.value, 0);
    return sum / topTransactions.length;
  }, [topTransactions]);

  // Is the average trending up compared to overall?
  const isTrendingUp =
    topTransactions.length > 0 && topTransactions[0].value > averageValue * 1.5;

  // Format numbers for display
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(4);
  };

  // Handle bar click to show transaction details
  const handleBarClick = (data: any) => {
    // Find the original transaction using the hash
    if (data && data.originalTx) {
      setSelectedTransaction(data.originalTx);
    }
  };

  // Close transaction detail modal
  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };

  if (topTransactions.length === 0) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg bg-[hsl(215,25%,15%)] p-4 shadow">
        <p className="mb-2 text-center text-gray-300">
          No transactions with value data available
        </p>
      </div>
    );
  }

  // Generate a custom cursor style that highlights the entire bar
  const CustomCursor = (props: any) => {
    const { x, y, width, height } = props;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(255, 255, 255, 0.1)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={1}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  return (
    <div className="w-full rounded-lg bg-[hsl(215,25%,15%)] p-4 shadow">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">
          Top 10 Transactions by Volume
        </h3>
        <p className="text-sm text-gray-400">
          Based on {transactions.length} transactions
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topTransactions}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={(data) =>
              data && handleBarClick(data.activePayload?.[0]?.payload)
            }
          >
            <XAxis
              type="number"
              tickFormatter={formatValue}
              tick={{ fill: "hsl(215, 0%, 100%)" }}
            />
            <YAxis
              dataKey="hash"
              type="category"
              width={100}
              tick={{ fill: "hsl(215, 0%, 100%)", fontSize: "12px" }}
              tickFormatter={(value) => value}
              interval={0} // Force display of all ticks
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(215, 25%, 20%)",
                border: "1px solid hsl(215, 25%, 30%)",
                borderRadius: "4px",
                color: "white",
              }}
              formatter={(value: any) => [`${formatValue(value)}`, "Value"]}
              labelFormatter={(label) => `Transaction: ${label}`}
              cursor={<CustomCursor />}
            />
            <Bar
              dataKey="value"
              fill="hsl(215, 80%, 60%)"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-white">
          <span>Average value: {formatValue(averageValue)}</span>
          {isTrendingUp ? (
            <TrendingUp className="h-4 w-4 text-green-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-yellow-400" />
          )}
        </div>
        <div className="text-gray-400">
          Click on a bar to view transaction details
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={handleCloseDetail}
          blockchainType={selectedTransaction.value ? "ETH" : "SWC"}
        />
      )}
    </div>
  );
};

export default TopTransactionsChart;
