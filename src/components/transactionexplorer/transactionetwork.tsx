"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import TransactionDetail from "./transactiondetail";
import { syncInfuraData } from "@/src/pages/api/infura-sync";

interface Transaction {
  hash: string;
  value: string;
  input: string;
  gas: string;
  gas_used: string;
  gas_price: string;
  transaction_fee: string;
  block_number: number;
  transaction_index: string;
  block_hash: string;
  block_timestamp: number;
  receiver: string;
  sender: string;
  direction: "incoming" | "outgoing";
  contract_address?: string;
  function_name?: string;
  is_error?: string;
  nonce?: string;
}

interface NetworkNode {
  id: string;
  address: string;
  main: boolean;
  isTransactionNode: boolean;
  transaction?: Transaction;
  x?: number;
  y?: number;
  parentNode?: string;
  isExpanded?: boolean;
  isExpandable?: boolean;
  sourceNode?: string; // Added for proper arrow direction
  targetNode?: string; // Added for proper arrow direction
}

interface TransactionNetworkProps {
  transactions: Transaction[];
  address: string;
  onAddressChange: (newAddress: string) => void;
  blockchainType: "ETH" | "SWC";
}

const TransactionNetwork: React.FC<TransactionNetworkProps> = ({
  transactions,
  address,
  onAddressChange,
  blockchainType,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerNode, setCenterNode] = useState<string>(address);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<{
    [address: string]: Transaction[];
  }>({});
  const [isExpanding, setIsExpanding] = useState<boolean>(false);

  useEffect(() => {
    // Update center node when address changes
    setCenterNode(address);
  }, [address]);

  useEffect(() => {
    if (!svgRef.current || !transactions || transactions.length === 0) return;

    console.log(
      "Rendering visualization with",
      transactions.length,
      "transactions",
    );
    console.log("Expanded nodes:", Object.keys(expandedNodes).length);

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Combine main transactions with expanded node transactions
    const allTransactions = [
      ...transactions,
      ...Object.entries(expandedNodes).flatMap(([address, txs]) => txs),
    ];

    // Create a unique set of nodes
    const uniqueNodes = new Map<string, NetworkNode>();

    // Add center node
    uniqueNodes.set(centerNode, {
      id: centerNode,
      address: centerNode,
      main: true,
      isTransactionNode: false,
      isExpanded: false,
    });

    // First add all address nodes (both from main transactions and expanded ones)
    // This ensures we have all potential connection points before adding transactions

    // Add addresses from main transactions
    transactions.forEach((tx) => {
      const counterpartyAddress =
        tx.direction === "outgoing" ? tx.receiver! : tx.sender!;

      if (!uniqueNodes.has(counterpartyAddress)) {
        uniqueNodes.set(counterpartyAddress, {
          id: counterpartyAddress,
          address: counterpartyAddress,
          main: false,
          isTransactionNode: false,
          isExpandable: true,
          parentNode: centerNode,
          isExpanded: expandedNodes[counterpartyAddress] !== undefined,
        });
      }
    });

    // Add addresses from expanded transactions
    Object.entries(expandedNodes).forEach(([expandedAddress, expandedTxs]) => {
      expandedTxs.forEach((tx) => {
        const counterpartyAddress =
          tx.direction === "outgoing" ? tx.receiver! : tx.sender!;

        // Only add new nodes, but don't skip if they are connected to main node
        // as we need them for expanded transactions too
        if (!uniqueNodes.has(counterpartyAddress)) {
          uniqueNodes.set(counterpartyAddress, {
            id: counterpartyAddress,
            address: counterpartyAddress,
            main: false,
            isTransactionNode: false,
            isExpandable: true,
            parentNode: expandedAddress, // Connect to the node that was expanded
            isExpanded: expandedNodes[counterpartyAddress] !== undefined,
          });
        }
      });
    });

    // Now add all transaction nodes (with correct connections)
    transactions.forEach((tx) => {
      const nodeId = tx.hash;
      const counterpartyAddress =
        tx.direction === "outgoing" ? tx.receiver! : tx.sender!;

      uniqueNodes.set(nodeId, {
        id: nodeId,
        address: counterpartyAddress,
        main: false,
        isTransactionNode: true,
        transaction: tx,
        // Set source and target nodes for proper arrow drawing
        sourceNode:
          tx.direction === "outgoing" ? centerNode : counterpartyAddress,
        targetNode:
          tx.direction === "outgoing" ? counterpartyAddress : centerNode,
        parentNode: centerNode,
      });
    });

    // Add transactions for expanded nodes
    Object.entries(expandedNodes).forEach(([expandedAddress, expandedTxs]) => {
      expandedTxs.forEach((tx) => {
        const nodeId = tx.hash;
        const counterpartyAddress =
          tx.direction === "outgoing" ? tx.receiver! : tx.sender!;

        uniqueNodes.set(nodeId, {
          id: nodeId,
          address: counterpartyAddress,
          main: false,
          isTransactionNode: true,
          transaction: tx,
          // Set source and target nodes for proper arrow drawing
          sourceNode:
            tx.direction === "outgoing" ? expandedAddress : counterpartyAddress,
          targetNode:
            tx.direction === "outgoing" ? counterpartyAddress : expandedAddress,
          parentNode: expandedAddress,
        });
      });
    });

    // Convert Map to array
    const nodes = Array.from(uniqueNodes.values());
    console.log("Total nodes to render:", nodes.length);

    // Position nodes algorithmically
    const width = svgRef.current.clientWidth || 600;
    const height = 500;

    // Position center node in the middle
    const centerNodeObj = nodes.find((n) => n.main);
    if (centerNodeObj) {
      centerNodeObj.x = 0;
      centerNodeObj.y = 0;
    }

    // Group address nodes by their parent for better positioning
    const addressNodesByParent: { [parentAddress: string]: NetworkNode[] } = {};

    nodes.forEach((node) => {
      if (!node.main && !node.isTransactionNode) {
        const parent = node.parentNode || centerNode;
        if (!addressNodesByParent[parent]) {
          addressNodesByParent[parent] = [];
        }
        addressNodesByParent[parent].push(node);
      }
    });

    // Position address nodes in circles around their parent nodes
    const baseRadius = Math.min(width, height) / 4;

    Object.entries(addressNodesByParent).forEach(
      ([parentAddress, childNodes]) => {
        // Get the parent node coordinates
        const parentNode = uniqueNodes.get(parentAddress);
        const parentX = parentNode?.x || 0;
        const parentY = parentNode?.y || 0;

        // If parent is center, use larger radius
        const radius =
          parentAddress === centerNode ? baseRadius : baseRadius / 2;

        // Position child nodes in a circle around parent
        const angleStep = (2 * Math.PI) / childNodes.length;
        childNodes.forEach((node, index) => {
          const angle = index * angleStep;
          node.x = parentX + radius * Math.cos(angle);
          node.y = parentY + radius * Math.sin(angle);
        });
      },
    );

    // Now position transaction nodes along the lines between source and target
    nodes.forEach((node) => {
      if (node.isTransactionNode) {
        // Find the source and target address nodes
        const sourceNode = uniqueNodes.get(
          node.sourceNode || node.parentNode || "",
        );
        const targetNode = uniqueNodes.get(node.targetNode || "");

        if (
          sourceNode &&
          sourceNode.x !== undefined &&
          sourceNode.y !== undefined &&
          targetNode &&
          targetNode.x !== undefined &&
          targetNode.y !== undefined
        ) {
          // Position transaction node along the line between source and target
          // at a point 1/3 of the way from source to target
          const ratio = 0.35;
          node.x = sourceNode.x + (targetNode.x - sourceNode.x) * ratio;
          node.y = sourceNode.y + (targetNode.y - sourceNode.y) * ratio;
        } else if (
          sourceNode &&
          sourceNode.x !== undefined &&
          sourceNode.y !== undefined
        ) {
          // Fallback: position near source node
          const angle = Math.random() * 2 * Math.PI;
          node.x = sourceNode.x + 40 * Math.cos(angle);
          node.y = sourceNode.y + 40 * Math.sin(angle);
        }
      }
    });

    // Create SVG and append necessary elements
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create a container group for all elements that will be dragged/zoomed
    const container = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    // Apply zoom behavior to svg
    svg.call(zoom as any);

    // Double click to reset zoom
    svg.on("dblclick.zoom", () => {
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform as any,
          d3.zoomIdentity.translate(width / 2, height / 2).scale(1),
        );
    });

    // Add defs for markers (arrows)
    const defs = container.append("defs");

    // Add arrow marker definition
    defs
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20) // Position away from end of line
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#a3a3a3");

    // Draw connections between addresses (direct connections without transaction nodes)
    const addressConnections = container
      .selectAll(".address-connection")
      .data(nodes.filter((n) => n.isTransactionNode))
      .enter()
      .append("line")
      .attr("class", "address-connection")
      .attr("x1", (d) => {
        const sourceNode = uniqueNodes.get(d.sourceNode || "");
        return sourceNode?.x || 0;
      })
      .attr("y1", (d) => {
        const sourceNode = uniqueNodes.get(d.sourceNode || "");
        return sourceNode?.y || 0;
      })
      .attr("x2", (d) => {
        const targetNode = uniqueNodes.get(d.targetNode || "");
        return targetNode?.x || 0;
      })
      .attr("y2", (d) => {
        const targetNode = uniqueNodes.get(d.targetNode || "");
        return targetNode?.y || 0;
      })
      .style("stroke", "#a3a3a3") // Neutral color
      .style("stroke-width", 1.5)
      .style("stroke-dasharray", "3,3") // Dashed line
      .style("opacity", 0.5);

    // Draw transaction links with arrows
    const links = container
      .selectAll(".link")
      .data(nodes.filter((n) => n.isTransactionNode))
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("data-hash", (d) => d.transaction?.hash)
      .attr("x1", (d) => {
        const sourceNode = uniqueNodes.get(d.sourceNode || "");
        return sourceNode?.x || 0;
      })
      .attr("y1", (d) => {
        const sourceNode = uniqueNodes.get(d.sourceNode || "");
        return sourceNode?.y || 0;
      })
      .attr("x2", (d) => d.x || 0)
      .attr("y2", (d) => d.y || 0)
      .style("stroke", "#64748b") // Neutral slate color
      .style("stroke-width", 2)
      .style("opacity", 0)
      .attr("marker-end", "url(#arrow)") // Add arrow marker
      .transition()
      .duration(500)
      .style("opacity", 0.7);

    // Value labels on transaction nodes instead of links
    container
      .selectAll(".value-label")
      .data(nodes.filter((n) => n.isTransactionNode))
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => d.x || 0)
      .attr("y", (d) => (d.y || 0) - 15)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("font-size", "10px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text((d) => {
        const val = Number(d.transaction?.value) / 1e18;
        return val.toFixed(4) + " " + blockchainType;
      })
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);

    // Draw center node
    const centerNodeCircle = container
      .append("circle")
      .attr("r", 25)
      .attr("fill", "#4F46E5")
      .attr("stroke", "#312E81")
      .attr("stroke-width", 2);

    // Center node address label
    container
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -35)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Your Address");

    // Center node address with ellipsis
    container
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 45)
      .style("font-size", "12px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text(() => {
        return `${centerNode.substring(0, 6)}...${centerNode.substring(centerNode.length - 4)}`;
      });

    // Draw transaction nodes
    const transactionNodes = container
      .selectAll(".transaction-node")
      .data(nodes.filter((n) => n.isTransactionNode))
      .enter()
      .append("g")
      .attr("class", "transaction-node")
      .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
      .style("cursor", "pointer");

    // // Transaction node circles
    // transactionNodes
    //   .append("circle")
    //   .attr("r", 12)
    //   .attr("fill", "#475569") // Neutral slate color for all transactions
    //   .attr("stroke", "#334155")
    //   .attr("stroke-width", 1.5);

    // // Add small direction indicator inside transaction nodes
    // transactionNodes
    //   .append("text")
    //   .attr("text-anchor", "middle")
    //   .attr("dy", 4) // Center vertically
    //   .style("font-size", "14px")
    //   .style("fill", "white")
    //   .text((d) => (d.transaction?.direction === "outgoing" ? "→" : "←"));

    // Transaction node hash label (shortened)
    transactionNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 25)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text((d) => {
        const hash = d.transaction?.hash;
        return hash
          ? `${hash.substring(0, 4)}...${hash.substring(hash.length - 4)}`
          : "";
      });

    // Draw address nodes
    const addressNodes = container
      .selectAll(".address-node")
      .data(nodes.filter((n) => !n.main && !n.isTransactionNode))
      .enter()
      .append("g")
      .attr("class", "address-node")
      .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
      .style("cursor", "pointer");

    // Address node circles
    addressNodes
      .append("circle")
      .attr("r", 20)
      .attr("fill", "#6366F1") // Indigo color for address nodes
      .attr("stroke", "#4338CA")
      .attr("stroke-width", 1.5);

    // Address text (shortened)
    addressNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 5) // Center text vertically
      .style("font-size", "10px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text((d) => {
        return `${d.address.substring(0, 4)}...${d.address.substring(d.address.length - 4)}`;
      });

    // Add "Expand" button for nodes that can be expanded but haven't been yet
    const expandableNodes = nodes.filter(
      (n) => !n.main && !n.isTransactionNode && !expandedNodes[n.address],
    );

    if (expandableNodes.length > 0) {
      const expandGroups = container
        .selectAll(".expandable-node")
        .data(expandableNodes)
        .enter()
        .append("g")
        .attr("class", "expandable-node")
        .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
        .style("cursor", "pointer");

      // Add circle for expandable nodes
      expandGroups
        .append("circle")
        .attr("r", 10)
        .attr("cy", -15)
        .style("fill", "#4B5563")
        .style("cursor", "pointer");

      // Add "+" symbol
      expandGroups
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", -11) // Adjusted position for better centering
        .style("fill", "white") // Changed to white
        .style("font-size", "16px")
        .style("cursor", "pointer")
        .text("+");

      // Add click handler for expansion
      expandGroups.on("click", function (event, d) {
        event.stopPropagation();
        handleNodeExpansion(d.address);
      });
    }

    // Add click handlers
    addressNodes.on("click", function (event, d) {
      if (!d.isExpanded) {
        handleNodeExpansion(d.address);
      }
    });

    transactionNodes.on("click", function (event, d) {
      if (d.transaction) {
        setSelectedTransaction(d.transaction);
      }
    });

    // Click on center node to view details
    centerNodeCircle.on("click", function (event) {
      event.stopPropagation();
      // Handle center node click if needed
    });

    // Add instructions for zoom/pan
    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .style("font-size", "12px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Scroll to zoom, drag to pan");

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 140}, 30)`);

    // Legend title
    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "12px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Legend");

    // Transaction node legend
    legend
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 20)
      .attr("r", 6)
      .style("fill", "#475569");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 24)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Transaction");

    // Address node legend
    legend
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 40)
      .attr("r", 6)
      .style("fill", "#6366F1");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 44)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Address");

    // Arrow direction legend
    legend
      .append("line")
      .attr("x1", 0)
      .attr("y1", 60)
      .attr("x2", 20)
      .attr("y2", 60)
      .style("stroke", "#a3a3a3")
      .attr("marker-end", "url(#arrow)");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 64)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Flow Direction");
  }, [
    transactions,
    centerNode,
    address,
    onAddressChange,
    expandedNodes,
    blockchainType,
  ]);

  const handleNodeExpansion = async (nodeAddress: string) => {
    // Skip if this node is already expanded or it's the center node
    if (expandedNodes[nodeAddress] || nodeAddress === centerNode) return;

    console.log(`Expanding node: ${nodeAddress}`);
    setIsExpanding(true);

    try {
      const nodeTransactions = await fetchTransactionsForAddress(nodeAddress);
      console.log(
        `Fetched ${nodeTransactions.length} transactions for node ${nodeAddress}`,
      );

      setExpandedNodes((prev) => ({
        ...prev,
        [nodeAddress]: nodeTransactions,
      }));
    } catch (error) {
      console.error("Error expanding node:", error);
    } finally {
      setIsExpanding(false);
    }
  };

  const fetchTransactionsForAddress = async (
    address: string,
  ): Promise<Transaction[]> => {
    try {
      const transactions = await syncInfuraData(address);
      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  return (
    <>
      <div className="relative w-full rounded-lg border border-r bg-gray-900 p-4">
        {transactions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-400">No transaction data to visualize</p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex justify-end">
              {Object.keys(expandedNodes).length > 0 && (
                <button
                  onClick={() => setExpandedNodes({})}
                  className="rounded-md bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600"
                >
                  Reset View
                </button>
              )}
            </div>
            <svg
              ref={svgRef}
              className="w-full"
              style={{
                height: "500px",
                background: "linear-gradient(to bottom, #1F2937, #111827)",
              }}
            ></svg>

            {selectedTransaction && (
              <TransactionDetail
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                blockchainType={blockchainType}
              />
            )}
          </>
        )}
        {isExpanding && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
            <div className="rounded-md bg-gray-800 p-4 text-white shadow-lg">
              <svg
                className="mr-2 inline h-6 w-6 animate-spin text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Expanding node...</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TransactionNetwork;
