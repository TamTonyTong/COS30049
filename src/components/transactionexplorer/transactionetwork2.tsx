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
  receiver?: string;
  sender?: string;
  direction: "incoming" | "outgoing";
}

interface NetworkNode {
  id: string;
  address: string;
  main: boolean;
  isTransactionNode: boolean;
  transaction?: Transaction;
  x?: number;
  y?: number;
}

interface TransactionNetworkProps {
  transactions: Transaction[];
  address: string;
  onAddressChange: (newAddress: string) => void;
}

const TransactionNetwork: React.FC<TransactionNetworkProps> = ({
  transactions,
  address,
  onAddressChange,
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

    // Create nodes data - one center node and one node per transaction
    const nodes: NetworkNode[] = [
      {
        id: centerNode,
        address: centerNode,
        main: true,
        isTransactionNode: false,
      },
      ...transactions.map((tx) => ({
        id: tx.hash, // Use transaction hash as node ID
        address: tx.direction === "outgoing" ? tx.receiver! : tx.sender!, // Use the counterparty address based on direction
        main: false,
        isTransactionNode: true,
        transaction: tx,
      })),
    ];

    // Position nodes in an even circle around the center
    const width = svgRef.current.clientWidth || 600;
    const height = 500;
    const baseRadius = Math.min(width, height) / 3;

    // Calculate positions for all transaction nodes evenly around the circle
    const transactionNodes = nodes.filter((node) => !node.main);
    const angleStep = (2 * Math.PI) / transactionNodes.length;

    transactionNodes.forEach((node, index) => {
      const angle = index * angleStep;
      node.x = baseRadius * Math.cos(angle);
      node.y = baseRadius * Math.sin(angle);
    });

    // Set position for center node
    const centerNodeObj = nodes.find((n) => n.main);
    if (centerNodeObj) {
      centerNodeObj.x = 0;
      centerNodeObj.y = 0;
    }

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create gradients for incoming and outgoing transactions
    const defs = svg.append("defs");

    // Outgoing gradient (blue to gray)
    const outgoingGradient = defs
      .append("linearGradient")
      .attr("id", "outgoing-gradient")
      .attr("gradientUnits", "userSpaceOnUse");

    outgoingGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ff001e");
    outgoingGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#9ca3af");

    // Incoming gradient (green to gray)
    const incomingGradient = defs
      .append("linearGradient")
      .attr("id", "incoming-gradient")
      .attr("gradientUnits", "userSpaceOnUse");

    incomingGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981");
    incomingGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#9ca3af");

    // Draw links - one per transaction
    const links = svg
      .selectAll(".link")
      .data(nodes.filter((n) => !n.main))
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("data-hash", (d) => d.transaction?.hash)
      .attr("x1", centerNodeObj?.x || 0)
      .attr("y1", centerNodeObj?.y || 0)
      .attr("x2", (d) => d.x || 0)
      .attr("y2", (d) => d.y || 0)
      .style("stroke", (d) => {
        // Use different gradient based on transaction direction
        return d.transaction?.direction === "outgoing"
          ? "url(#outgoing-gradient)"
          : "url(#incoming-gradient)";
      })
      // .style("stroke-width", (d) => {
      //   const tx = d.transaction;
      //   return tx ? Math.max(1, Math.min(5, (tx.value / 1e18) * 0.5)) : 2;
      //   // return tx ? Math.max(tx.value) : 2;
      // })
      .style("stroke-width", "5")
      .style("opacity", 0)
      .style("cursor", "pointer")
      .transition()
      .duration(500)
      .style("opacity", 0.7);

    // Create groups for transaction nodes
    const transactionNodeGroups = svg
      .selectAll(".transaction-node")
      .data(nodes.filter((n) => !n.main))
      .enter()
      .append("g")
      .attr("class", "transaction-node")
      .style("opacity", 0)
      .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Create group for center node
    const centerNodeGroup = svg
      .selectAll(".center-node")
      .data([centerNodeObj].filter(Boolean))
      .enter()
      .append("g")
      .attr("class", "center-node")
      .style("opacity", 0)
      .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Draw center node
    svg
      .selectAll(".center-node")
      .append("circle")
      .attr("r", 30)
      .style("fill", "#3b82f6")
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease");

    // Add label for center node
    svg
      .selectAll(".center-node")
      .append("text")
      .text("Your Address")
      .attr("dy", 45)
      .style("text-anchor", "middle")
      .style("fill", "#FFFFFF")
      .style("font-size", "10px")
      .style("pointer-events", "none");

    // Draw transaction nodes with different colors based on direction
    svg
      .selectAll(".transaction-node")
      .append("circle")
      .attr("r", (d) => {
        const tx = d.transaction;
        // Base size between 40 and 70 based on transaction value
        return tx ? Math.max(10, Math.min(20, (tx.value / 1e18) * 10)) : 20;
      })
      .style("fill", (d) => {
        // Color by direction first, then by address for visual grouping
        const direction = d.transaction?.direction;
        if (direction === "outgoing") {
          return "#ff001e"; // Red for outgoing
        } else if (direction === "incoming") {
          return "#10b981"; // Green for incoming
        } else {
          // If direction is undefined, use address-based coloring as fallback
          const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
          return colorScale(d.address);
        }
      })
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease");

    // Add transaction node labels in a dark background box
    const labelGroups = svg
      .selectAll(".transaction-node")
      .append("g")
      .attr("class", "label-group")
      .attr("transform", "translate(0, -35)"); // Position above the node

    // Add dark background rectangle for labels
    labelGroups
      .append("rect")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("x", -60)
      .attr("y", -25)
      .attr("width", 120)
      .attr("height", 40)
      .style("fill", "#0d1829")
      .style("opacity", 0.9);

    // Add address label inside the box with direction indicator
    labelGroups
      .append("text")
      .attr("class", "address-label")
      .text((d) => {
        const direction = d.transaction?.direction;
        const dirIndicator = direction === "outgoing" ? "→ " : "← ";
        return (
          dirIndicator +
          d.address.substring(0, 6) +
          "..." +
          d.address.substring(d.address.length - 4)
        );
      })
      .attr("y", -10)
      .style("text-anchor", "middle")
      .style("fill", "#FFFFFF")
      .style("font-size", "10px")
      .style("pointer-events", "none");

    // Add SCM amount label inside the box
    labelGroups
      .append("text")
      .attr("class", "amount-label")
      .text((d) => `${(d.transaction?.value! / 1e12).toFixed(2)} SCM`)
      .attr("y", 5)
      .style("text-anchor", "middle")
      .style("fill", "#FFFFFF")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("pointer-events", "none");

    // Add "Explore Address" badge
    const exploreGroups = svg
      .selectAll(".transaction-node")
      .append("g")
      .attr("class", "explore-group")
      .attr("transform", "translate(0, 25)"); // Position below the node

    // Add background for explore badge
    exploreGroups
      .append("rect")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("x", -40)
      .attr("y", 0)
      .attr("width", 80)
      .attr("height", 20)
      .style("fill", "#2563eb")
      .style("opacity", 0.8)
      .style("cursor", "pointer");

    // Add explore text
    exploreGroups
      .append("text")
      .text("Explore")
      .attr("y", 14)
      .style("text-anchor", "middle")
      .style("fill", "#FFFFFF")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("cursor", "pointer")
      .style("pointer-events", "none");

    // Add event handlers after transitions complete
    setTimeout(() => {
      // Add event handlers to links
      svg
        .selectAll(".link")
        .on("mousedown", function (event, d) {
          if (d.transaction) {
            setSelectedTransaction(d.transaction);
          }
        })
        .on("mouseover", function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke-width", (d) => {
              const tx = d.transaction;
              return tx ? Math.max(2, Math.min(7, (tx.value / 1e18) * 0.5)) : 3;
            });
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 0.7)
            .style("stroke-width", (d) => {
              const tx = d.transaction;
              return tx ? Math.max(1, Math.min(5, (tx.value / 1e18) * 0.5)) : 2;
            });
        });

      // Add event handlers to transaction nodes
      svg
        .selectAll(".transaction-node")
        .on("mousedown", function (event, d) {
          if (d.transaction) {
            setSelectedTransaction(d.transaction);
          }
        })
        .on("mouseover", function (event, d) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(200)
            // .attr("r", 20)
            .style("opacity", 0.9);
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(200)
            // .attr("r", 15)
            .style("opacity", 1);
        });

      // Add event handlers to center node
      svg
        .selectAll(".center-node")
        .on("mouseover", function () {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(200)
            .attr("r", 35)
            .style("opacity", 0.9);
        })
        .on("mouseout", function () {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(200)
            .attr("r", 30)
            .style("opacity", 1);
        });

      // Add event handlers to explore badges
      svg.selectAll(".explore-group").on("click", function (event, d) {
        event.stopPropagation(); // Prevent triggering the node click
        const newCenterAddress = d.address;
        onAddressChange(newCenterAddress);
      });
    }, 500);

    // Add legend for transaction directions
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${-width / 2 + 20}, ${-height / 2 + 20})`);

    // Add legend title
    legend
      .append("text")
      .text("Transaction Types")
      .attr("x", 0)
      .attr("y", 0)
      .style("fill", "#ffffff")
      .style("font-size", "20px")
      .style("font-weight", "bold");

    // Outgoing indicator
    legend
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 18)
      .attr("r", 6)
      .style("fill", "#ff0000");

    legend
      .append("text")
      .text("Selling")
      .attr("x", 25)
      .attr("y", 24)
      .style("fill", "#ffffff")
      .style("font-size", "15px");

    // Incoming indicator
    legend
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 39)
      .attr("r", 6)
      .style("fill", "#10b981");

    legend
      .append("text")
      .text("Buying")
      .attr("x", 25)
      .attr("y", 44)
      .style("fill", "#ffffff")
      .style("font-size", "15px");

    // // Add info about clicking nodes
    // legend
    //   .append("text")
    //   .text("Click 'Explore' to view transactions for that address")
    //   .attr("x", 0)
    //   .attr("y", 70)
    //   .style("font-size", "10px")
    //   .style("font-style", "italic");
  }, [transactions, centerNode, address, onAddressChange]);

  return (
    <>
      <div className="w-full min-w-64 rounded-lg border border-r bg-white p-4 dark:bg-gray-800">
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
                <div className="grid grid-cols-1 gap-2 break-words text-sm">
                  <div>
                    <span className="font-medium">Hash:</span>{" "}
                    {selectedTransaction.hash}
                  </div>
                  <div>
                    <span className="font-medium">Value:</span>{" "}
                    {selectedTransaction.value}
                  </div>
                  <div>
                    <span className="font-medium">Input:</span>{" "}
                    {selectedTransaction.input}
                  </div>
                  <div>
                    <span className="font-medium">Gas:</span>{" "}
                    {selectedTransaction.gas}
                  </div>
                  <div>
                    <span className="font-medium">Gas Used:</span>{" "}
                    {selectedTransaction.gas_used}
                  </div>
                  <div>
                    <span className="font-medium">Gas Price:</span>{" "}
                    {selectedTransaction.gas_price}
                  </div>
                  <div>
                    <span className="font-medium">Transaction Fee:</span>{" "}
                    {selectedTransaction.transaction_fee}
                  </div>
                  <div>
                    <span className="font-medium">Block Number:</span>{" "}
                    {selectedTransaction.block_number}
                  </div>
                  <div>
                    <span className="font-medium">Transaction Index:</span>{" "}
                    {selectedTransaction.transaction_index}
                  </div>
                  <div>
                    <span className="font-medium">Block Hash:</span>{" "}
                    {selectedTransaction.block_hash}
                  </div>
                  <div>
                    <span className="font-medium">Action:</span>{" "}
                    {selectedTransaction.direction === "outgoing"
                      ? "Selling"
                      : "Buying"}
                  </div>
                  <div>
                    <span className="font-medium">
                      {selectedTransaction.direction === "outgoing"
                        ? "Receiver:"
                        : "Sender:"}
                    </span>{" "}
                    {selectedTransaction.direction === "outgoing"
                      ? selectedTransaction.receiver
                      : selectedTransaction.sender}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>{" "}
                    {new Date(
                      selectedTransaction.block_timestamp * 1000,
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 flex justify-between">
                  <button
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => setSelectedTransaction(null)}
                  >
                    Close
                  </button>

                  {/* Add explore button to view this address's transactions */}
                  <button
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    onClick={() => {
                      const addressToExplore =
                        selectedTransaction.direction === "outgoing"
                          ? selectedTransaction.receiver
                          : selectedTransaction.sender;
                      if (addressToExplore) {
                        onAddressChange(addressToExplore);
                      }
                    }}
                  >
                    Explore{" "}
                    {selectedTransaction.direction === "outgoing"
                      ? "Receiver"
                      : "Sender"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TransactionNetwork;
