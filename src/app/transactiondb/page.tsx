"use client"
import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network/standalone";

export default function CryptoGraph() {
  const networkRef = useRef(null);
  const [network, setNetwork] = useState(null);
  const [currentNode, setCurrentNode] = useState(1);

  useEffect(() => {
    const container = networkRef.current;
    const addresses = [
      { id: 1, label: "Alice", title: "Address: 0xA1" },
      { id: 2, label: "Bob", title: "Address: 0xB2" },
      { id: 3, label: "Charlie", title: "Address: 0xC3" },
      { id: 4, label: "David", title: "Address: 0xD4" },
      { id: 5, label: "Eve", title: "Address: 0xE5" },
      { id: 6, label: "Frank", title: "Address: 0xF6" },
      { id: 7, label: "Grace", title: "Address: 0xG7" },
      { id: 8, label: "Hank", title: "Address: 0xH8" },
    ];

    const generateEdges = (centerId) => {
      return addresses
        .filter((node) => node.id !== centerId)
        .map((node, index) => ({
          from: centerId,
          to: node.id,
          label: `${(index + 1) * 0.5} ETH`,
        }));
    };

    const getNodePositions = (centerId) => {
      const radius = 200;
      return addresses.map((node, index) => {
        if (node.id === centerId) return { ...node, x: 0, y: 0 };
        const angle = (index / (addresses.length - 1)) * 2 * Math.PI;
        return { ...node, x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
      });
    };

    const updateGraph = (centerId) => {
      setCurrentNode(centerId);
      const nodes = getNodePositions(centerId);
      const edges = generateEdges(centerId);
      network.setData({ nodes, edges });
    };

    const initialNodes = getNodePositions(currentNode);
    const initialEdges = generateEdges(currentNode);

    const options = {
      nodes: { shape: "dot", size: 16 },
      edges: { arrows: "to" },
      layout: { improvedLayout: false },
      physics: false,
    };

    const net = new Network(container, { nodes: initialNodes, edges: initialEdges }, options);
    setNetwork(net);

    net.on("click", function (params) {
      if (params.nodes.length > 0) {
        updateGraph(params.nodes[0]);
      }
    });
  }, [currentNode]);

  return (
    <div>
      <h2>Crypto Transactions Graph</h2>
      <div ref={networkRef} style={{ height: "500px", border: "1px solid black" }} />
    </div>
  );
}