// Modify your TransactionNetwork component to use the direction information

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Transaction } from "@/src/components/transactionexplorer/type";
interface TransactionNetworkProps {
  transactions: Transaction[];
  address: string;
  onAddressChange: (address: string) => void;
}

const TransactionNetwork2: React.FC<TransactionNetworkProps> = ({
  transactions,
  address,
  onAddressChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!transactions.length || !svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Create nodes for unique addresses
    const addressSet = new Set<string>([address]);
    transactions.forEach((t) => {
      if (t.sender) addressSet.add(t.sender);
      if (t.receiver) addressSet.add(t.receiver);
    });

    const nodes = Array.from(addressSet).map((addr) => ({
      id: addr,
      isCentral: addr === address,
    }));

    // Create links between addresses based on transactions
    const links = transactions.map((t) => ({
      source: t.sender,
      target: t.receiver,
      value: parseFloat(t.value.toString()) / 1e18, // Convert to ETH
      incoming: t.incoming,
      outgoing: t.outgoing,
      isTokenTransfer: t.token_transfer || false,
    }));

    // Set up the SVG canvas
    const width = 600;
    const height = 400;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create a force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw the links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) =>
        Math.max(1, Math.min(5, Math.log10(d.value + 1) * 2)),
      )
      .attr("stroke", (d) => {
        // Color based on transaction direction
        if (d.isTokenTransfer) return "purple"; // Token transfers
        if (d.incoming) return "green"; // Incoming (buying)
        if (d.outgoing) return "red"; // Outgoing (selling)
        return "#999"; // Default
      });

    // Draw the nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => (d.isCentral ? 10 : 5))
      .attr("fill", (d) => (d.isCentral ? "#fd7e14" : "#69b3a2"))
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded) as any,
      );

    // Add address labels
    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text((d) => d.id.substring(0, 6) + "...")
      .attr("font-size", "10px")
      .attr("fill", "white");

    // Add interaction for address exploration
    node.on("click", function (event, d) {
      if (!d.isCentral) {
        onAddressChange(d.id);
      }
    });

    // Add tooltip
    node.append("title").text((d) => d.id);

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y - 12);
    });

    // Drag functions
    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Add legend
    const legend = svg.append("g").attr("transform", "translate(20, 20)");

    const legendItems = [
      { color: "#fd7e14", text: "Current Address" },
      { color: "#69b3a2", text: "Other Address" },
      { color: "green", text: "Incoming (Buy)" },
      { color: "red", text: "Outgoing (Sell)" },
      { color: "purple", text: "Token Transfer" },
    ];

    legendItems.forEach((item, i) => {
      legend
        .append("circle")
        .attr("cx", 10)
        .attr("cy", i * 20)
        .attr("r", 5)
        .attr("fill", item.color);

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 5)
        .text(item.text)
        .attr("font-size", "12px")
        .attr("fill", "white");
    });
  }, [transactions, address, onAddressChange]);

  return (
    <div className="w-1/2 overflow-hidden bg-black p-4">
      <svg ref={svgRef} />
    </div>
  );
};

export default TransactionNetwork2;
