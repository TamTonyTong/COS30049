"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Transaction {
  hash: string;
  value: number;
  input: number;
  gas: number;
  gas_used: number;
  gas_price: number;
  transaction_fee: number;
  block_number: number;
  transaction_index: string;
  block_hash: string;
  block_timestamp: number;
  receiver: string;
}

interface NetworkNode {
  id: string;
  main: boolean;
  x?: number;
  y?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  amount: string;
  timestamp: number;
}

interface TransactionNetworkProps {
  transactions: Transaction[];
  address: string;
}

const TransactionNetwork: React.FC<TransactionNetworkProps> = ({
  transactions,
  address,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerNode, setCenterNode] = useState<string>(address);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    // Update center node when address changes
    setCenterNode(address);
  }, [address]);

  useEffect(() => {
    if (!svgRef.current || transactions.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Prepare data for visualization
    const uniqueAddresses = new Set<string>();
    uniqueAddresses.add(centerNode);

    transactions.forEach((tx) => {
      uniqueAddresses.add(tx.receiver);
    });

    // Create nodes data
    const nodes: NetworkNode[] = [
      { id: centerNode, main: true },
      ...Array.from(uniqueAddresses)
        .filter((addr) => addr !== centerNode)
        .map((addr) => ({ id: addr, main: false })),
    ];

    // Create links data
    const links: NetworkLink[] = transactions.map((tx) => ({
      source: centerNode,
      target: tx.receiver,
      amount: `${(tx.value / 1e18).toFixed(4)} ETH`,
      timestamp: tx.block_timestamp,
    }));

    // Set up dimensions
    const width = svgRef.current.clientWidth || 600;
    const height = 500;
    const radius = Math.min(width, height) / 3;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Position nodes in a circle
    const angleStep = (2 * Math.PI) / (nodes.length - 1 || 1);
    nodes.forEach((node, i) => {
      if (!node.main) {
        node.x = radius * Math.cos((i - 1) * angleStep);
        node.y = radius * Math.sin((i - 1) * angleStep);
      } else {
        node.x = 0;
        node.y = 0;
      }
    });

    // Create gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "link-gradient")
      .attr("gradientUnits", "userSpaceOnUse");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#9ca3af");

    // Draw links with transition
    const link = svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => nodes.find((n) => n.id === d.source)?.x || 0)
      .attr("y1", (d) => nodes.find((n) => n.id === d.source)?.y || 0)
      .attr("x2", (d) => nodes.find((n) => n.id === d.target)?.x || 0)
      .attr("y2", (d) => nodes.find((n) => n.id === d.target)?.y || 0)
      .style("stroke", "url(#link-gradient)")
      .style("stroke-width", (d) => {
        const tx = transactions.find((t) => t.receiver === d.target);
        return tx ? Math.max(1, Math.min(5, (tx.value / 1e18) * 0.5)) : 2;
      })
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 0.7);

    // Draw nodes with transition
    const nodeGroups = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("opacity", 0)
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Add circles for nodes
    svg
      .selectAll(".node")
      .append("circle")
      .attr("r", (d) => (d.main ? 30 : 20))
      .style("fill", (d) => (d.main ? "#3b82f6" : "#9ca3af"))
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease");

    // Add click handlers and hover effects
    svg
      .selectAll(".node")
      .on("click", function (event, d) {
        if (!d.main) {
          // Handle click on non-main node
          // For demonstration, just show transaction details
          const tx = transactions.find((t) => t.receiver === d.id);
          if (tx) {
            setSelectedTransaction(tx);
          }
        }
      })
      .on("mouseover", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", d.main ? 35 : 25)
          .style("fill", d.main ? "#2563eb" : "#4b5563");
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", d.main ? 30 : 20)
          .style("fill", d.main ? "#3b82f6" : "#9ca3af");
      });

    // Add address labels
    svg
      .selectAll(".node")
      .append("text")
      .text((d) => {
        // Truncate address for display
        return d.id.substring(0, 6) + "..." + d.id.substring(d.id.length - 4);
      })
      .attr("dy", (d) => (d.main ? 45 : 35))
      .style("text-anchor", "middle")
      .style("fill", "#1f2937")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Add transaction amounts
    svg
      .selectAll(".amount")
      .data(links)
      .enter()
      .append("text")
      .attr("class", "amount")
      .attr("x", (d) => {
        const source = nodes.find((n) => n.id === d.source);
        const target = nodes.find((n) => n.id === d.target);
        return source && target ? (source.x + target.x) / 2 : 0;
      })
      .attr("y", (d) => {
        const source = nodes.find((n) => n.id === d.source);
        const target = nodes.find((n) => n.id === d.target);
        return source && target ? (source.y + target.y) / 2 - 8 : 0;
      })
      .text((d) => d.amount)
      .style("text-anchor", "middle")
      .style("fill", "#6b7280")
      .style("font-size", "10px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Add timestamps below amounts
    svg
      .selectAll(".timestamp")
      .data(links)
      .enter()
      .append("text")
      .attr("class", "timestamp")
      .attr("x", (d) => {
        const source = nodes.find((n) => n.id === d.source);
        const target = nodes.find((n) => n.id === d.target);
        return source && target ? (source.x + target.x) / 2 : 0;
      })
      .attr("y", (d) => {
        const source = nodes.find((n) => n.id === d.source);
        const target = nodes.find((n) => n.id === d.target);
        return source && target ? (source.y + target.y) / 2 + 8 : 0;
      })
      .text((d) => {
        const date = new Date(d.timestamp * 1000);
        return date.toLocaleDateString();
      })
      .style("text-anchor", "middle")
      .style("fill", "#9ca3af")
      .style("font-size", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
  }, [transactions, centerNode, address]);

  return (
    <div className="transaction-network mt-6 w-full">
      <h3 className="mb-4 text-lg font-bold">Transaction Network</h3>

      <div className="relative rounded-lg border bg-white p-4 dark:bg-gray-800">
        {transactions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-500">No transaction data to visualize</p>
          </div>
        ) : (
          <>
            <svg
              ref={svgRef}
              className="w-full"
              style={{ height: "500px" }}
            ></svg>

            {selectedTransaction && (
              <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                <h4 className="mb-2 font-medium">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Hash:</span>{" "}
                    {selectedTransaction.hash.substring(0, 10)}...
                  </div>
                  <div>
                    <span className="font-medium">Value:</span>{" "}
                    {(selectedTransaction.value / 1e18).toFixed(4)} ETH
                  </div>
                  <div>
                    <span className="font-medium">Gas Used:</span>{" "}
                    {selectedTransaction.gas_used}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>{" "}
                    {new Date(
                      selectedTransaction.block_timestamp * 1000,
                    ).toLocaleString()}
                  </div>
                </div>
                <button
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => setSelectedTransaction(null)}
                >
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionNetwork;
