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
  sourceNode?: string;
  targetNode?: string;
}

interface TransactionNetworkProps {
  transactions: Transaction[];
  address: string;
  onAddressChange: (newAddress: string) => void;
  onNodeExpanded?: (address: string, transactions: Transaction[]) => void;
  expandedNodes?: { [address: string]: Transaction[] };

  blockchainType: "ETH" | "SWC";
}

const TransactionNetwork: React.FC<TransactionNetworkProps> = ({
  transactions,
  address,
  onAddressChange,
  blockchainType,
  onNodeExpanded, // Make sure this prop is properly referenced here
  expandedNodes: externalExpandedNodes, // Rename to avoid conflict with local state
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerNode, setCenterNode] = useState<string>(address);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<{
    [address: string]: Transaction[];
  }>({});
  const [isExpanding, setIsExpanding] = useState<boolean>(false);
  const [pendingExpansions, setPendingExpansions] = useState<{
    address: string;
    transactions: Transaction[];
  } | null>(null);
  useEffect(() => {
    // Update center node when address changes
    setCenterNode(address);
  }, [address]);
  // Use effect to notify parent component after our state is updated
  useEffect(() => {
    if (pendingExpansions && onNodeExpanded) {
      onNodeExpanded(pendingExpansions.address, pendingExpansions.transactions);
      setPendingExpansions(null); // Reset after notifying
    }
  }, [pendingExpansions, onNodeExpanded]);

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
      // First ensure the expanded node address is in our collection
      if (!uniqueNodes.has(expandedAddress) && expandedAddress !== centerNode) {
        uniqueNodes.set(expandedAddress, {
          id: expandedAddress,
          address: expandedAddress,
          main: false,
          isTransactionNode: false,
          isExpandable: true,
          parentNode: centerNode, // Connected to center as a fallback
          isExpanded: true,
        });
      }

      expandedTxs.forEach((tx) => {
        const counterpartyAddress =
          tx.direction === "outgoing" ? tx.receiver! : tx.sender!;

        // Skip adding a node if it's already the center or expanded node
        if (
          counterpartyAddress === centerNode ||
          counterpartyAddress === expandedAddress
        ) {
          return;
        }

        // Only add new nodes
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
      if (!expandedTxs || expandedTxs.length === 0) return;
      expandedTxs.forEach((tx) => {
        const nodeId = tx.hash;
        const counterpartyAddress =
          tx.direction === "outgoing" ? tx.receiver! : tx.sender!;

        // Skip transactions to/from already visualized nodes to avoid clutter
        // But keep connections to center node or other expanded nodes
        // if (
        //   counterpartyAddress !== centerNode &&
        //   !expandedNodes[counterpartyAddress] &&
        //   counterpartyAddress !== expandedAddress
        // ) {
        //   uniqueNodes.set(nodeId, {
        //     id: nodeId,
        //     address: counterpartyAddress,
        //     main: false,
        //     isTransactionNode: true,
        //     transaction: tx,
        //     // Set source and target nodes for proper arrow drawing
        //     sourceNode:
        //       tx.direction === "outgoing"
        //         ? expandedAddress
        //         : counterpartyAddress,
        //     targetNode:
        //       tx.direction === "outgoing"
        //         ? counterpartyAddress
        //         : expandedAddress,
        //     parentNode: expandedAddress,
        //   });
        // }

        // Add transaction node with correct connections
        // Don't skip any - we want to show ALL transactions from expanded nodes
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

        // Make sure the counterparty address is also added if it's not yet in our nodes
        if (
          !uniqueNodes.has(counterpartyAddress) &&
          counterpartyAddress !== expandedAddress &&
          counterpartyAddress !== centerNode
        ) {
          uniqueNodes.set(counterpartyAddress, {
            id: counterpartyAddress,
            address: counterpartyAddress,
            main: false,
            isTransactionNode: false,
            isExpandable: true,
            parentNode: expandedAddress,
            isExpanded: expandedNodes[counterpartyAddress] !== undefined,
          });
        }
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
    // Increase base radius for better node spacing
    const baseRadius = Math.min(width, height) / 2.2;

    Object.entries(addressNodesByParent).forEach(
      ([parentAddress, childNodes]) => {
        // Get the parent node coordinates
        const parentNode = uniqueNodes.get(parentAddress);
        const parentX = parentNode?.x || 0;
        const parentY = parentNode?.y || 0;

        // If parent is center, use larger radius, if parent is another expanded node, use medium radius
        // This creates more hierarchical spacing
        const radius =
          parentAddress === centerNode ? baseRadius : baseRadius * 0.65;

        // Position child nodes in a circle around parent
        const angleStep = (2 * Math.PI) / Math.max(childNodes.length, 1);
        childNodes.forEach((node, index) => {
          const angle = index * angleStep;
          node.x = parentX + radius * Math.cos(angle);
          node.y = parentY + radius * Math.sin(angle);
        });
      },
    );

    // Group transactions by their source-target pair to identify duplicates
    const transactionsByPair: { [key: string]: NetworkNode[] } = {};

    nodes.forEach((node) => {
      if (node.isTransactionNode) {
        const sourceId = node.sourceNode || "";
        const targetId = node.targetNode || "";
        const pairKey = `${sourceId}-${targetId}`;

        if (!transactionsByPair[pairKey]) {
          transactionsByPair[pairKey] = [];
        }

        transactionsByPair[pairKey].push(node);
      }
    });

    // Now position transaction nodes with better offsets when multiple transactions exist between same nodes
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
          const pairKey = `${node.sourceNode}-${node.targetNode}`;
          const pairTransactions = transactionsByPair[pairKey];
          const transactionCount = pairTransactions
            ? pairTransactions.length
            : 1;

          // Get the index of the current transaction in the group
          const index = pairTransactions
            ? pairTransactions.findIndex((t) => t.id === node.id)
            : 0;

          // Calculate the distance between source and target
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Calculate the base position (not fixed ratio, but proportional to distance)
          // Place transaction nodes closer to their source for clearer visualization
          const ratio = 0.25 + (0.2 * distance) / baseRadius; // Adaptive ratio based on distance
          const baseX = sourceNode.x + (targetNode.x - sourceNode.x) * ratio;
          const baseY = sourceNode.y + (targetNode.y - sourceNode.y) * ratio;

          if (transactionCount > 3) {
            // Calculate perpendicular offset direction
            const length = Math.sqrt(dx * dx + dy * dy);

            // Normalize and create perpendicular vector
            const perpX = -dy / length;
            const perpY = dx / length;

            // Calculate offset based on index
            // Use a larger max offset for better separation
            const maxOffset = Math.min(150, distance * 2.5); // Adaptive offset
            const offset =
              (index - (transactionCount - 1) / 2) *
              (maxOffset / Math.max(1, transactionCount - 1));

            // Apply the offset perpendicular to the line
            node.x = baseX + perpX * offset;
            node.y = baseY + perpY * offset;
          } else if (transactionCount > 1) {
            // Calculate perpendicular offset direction
            const length = Math.sqrt(dx * dx + dy * dy);

            // Normalize and create perpendicular vector
            const perpX = -dy / length;
            const perpY = dx / length;

            // Calculate offset based on index
            // Use a larger max offset for better separation
            const maxOffset = Math.min(50, distance * 0.2); // Adaptive offset
            const offset =
              (index - (transactionCount - 1) / 2) *
              (maxOffset / Math.max(1, transactionCount - 1));

            // Apply the offset perpendicular to the line
            node.x = baseX + perpX * offset;
            node.y = baseY + perpY * offset;
          } else {
            // If there's only one transaction, just use the base position
            node.x = baseX;
            node.y = baseY;
          }
        } else if (
          sourceNode &&
          sourceNode.x !== undefined &&
          sourceNode.y !== undefined
        ) {
          // Fallback: position near source node
          const angle = Math.random() * 2 * Math.PI;
          node.x = sourceNode.x + 50 * Math.cos(angle);
          node.y = sourceNode.y + 50 * Math.sin(angle);
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
      .attr("refX", 35) // Better positioning at end of line
      .attr("refY", 0)
      .attr("markerWidth", 3)
      .attr("markerHeight", 3)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#FFFFFF");

    // Draw faint background connections between directly connected addresses
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
      .style("opacity", 0.25); // Very faint

    // Create link groups for better click interaction
    const linkGroups = container
      .selectAll(".link-group")
      .data(nodes.filter((n) => n.isTransactionNode))
      .enter()
      .append("g")
      .attr("class", "link-group")
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        event.stopPropagation();
        if (d.transaction) {
          setSelectedTransaction(d.transaction);
        }
      });

    // Add invisible wider line for better clicking (source to transaction)
    linkGroups
      .append("line")
      .attr("class", "click-area-source")
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
      .style("stroke", "transparent")
      .style("stroke-width", 12); // Wider invisible line for easier clicking

    // Add invisible wider line for better clicking (transaction to target)
    linkGroups
      .append("line")
      .attr("class", "click-area-target")
      .attr("x1", (d) => d.x || 0)
      .attr("y1", (d) => d.y || 0)
      .attr("x2", (d) => {
        const targetNode = uniqueNodes.get(d.targetNode || "");
        return targetNode?.x || 0;
      })
      .attr("y2", (d) => {
        const targetNode = uniqueNodes.get(d.targetNode || "");
        return targetNode?.y || 0;
      })
      .style("stroke", "transparent")
      .style("stroke-width", 12); // Wider invisible line for easier clicking

    // Draw source-to-transaction links
    linkGroups
      .append("line")
      .attr("class", "link visible-link-source")
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
      .on("mouseover", function () {
        d3.select(this.parentNode)
          .selectAll(".visible-link-source, .visible-link-target")
          .style("stroke-width", 3)
          .style("stroke", "#94a3b8");
      })
      .on("mouseout", function () {
        d3.select(this.parentNode)
          .selectAll(".visible-link-source, .visible-link-target")
          .style("stroke-width", 2)
          .style("stroke", "#64748b");
      })
      .transition()
      .duration(500)
      .style("opacity", 0.85);

    // Draw transaction-to-target links with arrows
    linkGroups
      .append("line")
      .attr("class", "link visible-link-target")
      .attr("x1", (d) => d.x || 0)
      .attr("y1", (d) => d.y || 0)
      .attr("x2", (d) => {
        const targetNode = uniqueNodes.get(d.targetNode || "");
        return targetNode?.x || 0;
      })
      .attr("y2", (d) => {
        const targetNode = uniqueNodes.get(d.targetNode || "");
        return targetNode?.y || 0;
      })
      .style("stroke", "#64748b")
      .style("stroke-width", 2)
      .style("opacity", 0)
      .attr("marker-end", "url(#arrow)")
      .on("mouseover", function () {
        d3.select(this.parentNode)
          .selectAll(".visible-link-source, .visible-link-target")
          .style("stroke-width", 3)
          .style("stroke", "#94a3b8");
      })
      .on("mouseout", function () {
        d3.select(this.parentNode)
          .selectAll(".visible-link-source, .visible-link-target")
          .style("stroke-width", 2)
          .style("stroke", "#64748b");
      })
      .transition()
      .duration(500)
      .style("opacity", 0.85);

    // Draw transaction nodes (these will be the actual transactions)
    const transactionNodes = container
      .selectAll(".transaction-node")
      .data(nodes.filter((n) => n.isTransactionNode))
      .enter()
      .append("g")
      .attr("class", "transaction-node")
      .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        event.stopPropagation();
        if (d.transaction) {
          setSelectedTransaction(d.transaction);
        }
      });

    // Transaction node circles
    transactionNodes
      .append("circle")
      .attr("r", (d) => {
        // Get transaction value in ETH (convert from Wei)
        const valueInEth = Number(d.transaction?.value) / 1e18;

        // Set min and max radius
        const minRadius = 4;
        const maxRadius = 12;

        // Scale the radius based on value (capped at 0.9 ETH)
        // For values between 0-0.1, use minRadius
        // For values between 0.1-0.9, scale linearly
        // For values > 0.9, cap at maxRadius
        if (valueInEth < 0.1) {
          return minRadius;
        } else if (valueInEth >= 0.9) {
          return maxRadius;
        } else {
          // Linear interpolation between min and max radius
          const normalizedValue = (valueInEth - 0.1) / 0.8; // Maps 0.1-0.9 to 0-1
          return minRadius + normalizedValue * (maxRadius - minRadius);
        }
      })
      .attr("fill", "#475569")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1)
      // Add tooltip on hover to show exact value
      .append("title")
      .text((d) => {
        const val = Number(d.transaction?.value) / 1e18;
        return `${val.toFixed(6)} ${blockchainType}`;
      })
      .attr("fill", "#475569")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1);

    // Value labels on transaction nodes
    container
      .selectAll(".value-label")
      .data(nodes.filter((n) => n.isTransactionNode))
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => d.x || 0)
      .attr("y", (d) => (d.y || 0) - 9) // Position slightly higher
      .attr("text-anchor", "middle")
      .style("font-size", "7px") // Smaller text
      .style("fill", "white")
      .style("text-shadow", "0px 0px 3px rgba(0,0,0,0.9)")
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
      .attr("r", 20)
      .attr("fill", "#4F46E5")
      .attr("stroke", "#312E81")
      .attr("stroke-width", 2);

    // Center node address with ellipsis
    container
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .style("font-size", "9px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text(() => {
        return `${centerNode.substring(0, 6)}...${centerNode.substring(centerNode.length - 4)}`;
      });

    // Draw address nodes
    const addressNodes = container
      .selectAll(".address-node")
      .data(nodes.filter((n) => !n.main && !n.isTransactionNode))
      .enter()
      .append("g")
      .attr("class", "address-node")
      .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        event.stopPropagation();
        if (!d.isExpanded) {
          handleNodeExpansion(d.address);
        }
      });

    // Address node circles with different colors for expanded vs non-expanded
    addressNodes
      .append("circle")
      .attr("r", 14) // Smaller for less clutter
      .attr("fill", (d) => (d.isExpanded ? "#8B5CF6" : "#6366F1")) // Different color for expanded nodes
      .attr("stroke", (d) => (d.isExpanded ? "#7C3AED" : "#4338CA"))
      .attr("stroke-width", 1.5);

    // Address text (shortened)
    addressNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 3) // Center text vertically
      .style("font-size", "7px") // Smaller text
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
        .attr("r", 7)
        .attr("cy", -16)
        .style("fill", "#4B5563")
        .style("cursor", "pointer");

      // Add "+" symbol
      expandGroups
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -13) // Better positioned
        .style("fill", "white")
        .style("font-size", "11px")
        .style("cursor", "pointer")
        .text("+");

      // Add click handler for expansion
      expandGroups.on("click", function (event, d) {
        event.stopPropagation();
        handleNodeExpansion(d.address);
      });
    }

    // Add instructions for zoom/pan
    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 30)
      .style("font-size", "20px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Scroll to zoom, drag to pan");

    // Create a more organized and visually appealing legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 150}, 30)`); // Move it more to the left and down

    // Add semi-transparent background to make the legend stand out
    legend
      .append("rect")
      .attr("x", -30)
      .attr("y", -15)
      .attr("width", 170)
      .attr("height", 160) // Make it taller to accommodate the enlarged flow direction
      .attr("rx", 8) // Rounded corners
      .attr("ry", 8)
      .style("fill", "#1e293b") // Darker background
      .style("opacity", 0.7); // Semi-transparent

    // Legend title
    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Legend");

    // Transaction node legend
    legend
      .append("circle")
      .attr("cx", -15)
      .attr("cy", 25)
      .attr("r", 10)
      .style("fill", "#475569");

    legend
      .append("text")
      .attr("x", 5)
      .attr("y", 30)
      .style("font-size", "14px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Transaction");

    // Address node legend
    legend
      .append("circle")
      .attr("cx", -15)
      .attr("cy", 55)
      .attr("r", 10)
      .style("fill", "#6366F1");

    legend
      .append("text")
      .attr("x", 5)
      .attr("y", 60)
      .style("font-size", "14px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Address");

    // Expanded node legend
    legend
      .append("circle")
      .attr("cx", -15)
      .attr("cy", 85)
      .attr("r", 10)
      .style("fill", "#8B5CF6");

    legend
      .append("text")
      .attr("x", 5)
      .attr("y", 90)
      .style("font-size", "14px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Expanded Address");

    // Improved arrow direction legend with better spacing and size
    // Add a label for the flow direction section
    legend
      .append("text")
      .attr("x", -23)
      .attr("y", 120)
      .style("font-size", "14px")
      .style("fill", "white")
      .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.7)")
      .text("Flow Direction:");

    // Create a more visible flow direction arrow
    legend
      .append("line")
      .attr("x1", -20)
      .attr("y1", 140)
      .attr("x2", 40)
      .attr("y2", 140)
      .style("stroke", "#a3a3a3")
      .style("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    // Add a sample transaction node to flow direction
    legend
      .append("circle")
      .attr("cx", 15)
      .attr("cy", 140)
      .attr("r", 5)
      .style("fill", "#475569");
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
      // Pass true as second parameter to force fresh data
      const nodeTransactions = await fetchTransactionsForAddress(
        nodeAddress,
        true,
      );
      console.log(
        `Fetched ${nodeTransactions.length} transactions for node ${nodeAddress}`,
      );

      if (nodeTransactions.length === 0) {
        console.log("No transactions found for address:", nodeAddress);
        // Show notification or feedback here if needed

        setExpandedNodes((prev) => ({
          ...prev,
          [nodeAddress]: [], // Empty array but still marked as expanded
        }));
      } else {
        // Add transactions to expanded nodes
        setExpandedNodes((prev) => {
          const newExpandedNodes = {
            ...prev,
            [nodeAddress]: nodeTransactions,
          };

          // IMPORTANT: Pass the transactions up to parent component
          setPendingExpansions({
            address: nodeAddress,
            transactions: nodeTransactions,
          });

          return newExpandedNodes;
        });
      }
    } catch (error) {
      console.error("Error expanding node:", error);
      // Still mark as expanded to prevent repeated attempts
      setExpandedNodes((prev) => ({
        ...prev,
        [nodeAddress]: [], // Empty array but still marked as expanded
      }));
    } finally {
      setIsExpanding(false);
    }
  };

  const fetchTransactionsForAddress = async (
    address: string,
    forceFresh = false,
  ): Promise<Transaction[]> => {
    try {
      console.log(
        `Fetching transactions for ${address}, forceFresh: ${forceFresh}`,
      );
      // Add proper error handling and timeout
      const fetchPromise = syncInfuraData(address, forceFresh);

      // Add a timeout to prevent hanging
      // const timeoutPromise = new Promise<Transaction[]>((_, reject) => {
      //   setTimeout(
      //     () => reject(new Error("Fetch transactions timeout")),
      //     15000,
      //   );
      // });
      // Race between fetch and timeout
      const transactions = await Promise.race([fetchPromise]);

      console.log(
        `Received ${transactions.length} transactions from API for ${address}`,
      );
      // Make sure these transactions have properly set sender/receiver/direction
      const processedTransactions = transactions.map((tx) => {
        // For 2nd hop transactions, we need to ensure the direction is correctly set
        // relative to the address being expanded
        const isOutgoing =
          tx.sender && tx.sender.toLowerCase() === address.toLowerCase();

        return {
          ...tx,
          // Ensure these fields are set correctly
          sender: tx.sender || tx.from_address || "",
          receiver: tx.receiver || tx.receiver || "",
          direction: isOutgoing ? "outgoing" : "incoming",
        };
      });
      return processedTransactions;
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
