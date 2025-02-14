"use client"
import Layout from "@/src/components/layout";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Network } from "vis-network/standalone";

export default function CryptoGraph() {
  const networkRef = useRef(null);
  const [network, setNetwork] = useState(null);
  const [currentNode, setCurrentNode] = useState(1);

  useEffect(() => {
    const container = networkRef.current;
    const addresses = [
      { id: 1, label: "Alice", title: "Address: 0xA1"},
      { id: 2, label: "Bob", title: "Address: 0xB2" },
      { id: 3, label: "Charlie", title: "Address: 0xC3" },
      { id: 4, label: "David", title: "Address: 0xD4" },
      { id: 5, label: "Eve", title: "Address: 0xE5" },
      { id: 6, label: "Frank", title: "Address: 0xF6" },
      { id: 7, label: "Grace", title: "Address: 0xG7" },
      { id: 8, label: "Hank", title: "Address: 0xH8" },
      { id: 9, label: "Tong", title: "Address: 0xH8" },
    ];

    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const generateEdges = (centerId: number) => {
      return shuffleArray(addresses.filter((node) => node.id !== centerId))
        .slice(0, 8)
        .map((node) => ({
          from: centerId,
          to: node.id,
          label: `${(Math.random() * 4 + 0.5).toFixed(1)} ETH`, // Random ETH value between 0.5 and 4.5
        }));
    };

    const getNodePositions = (centerId: number) => {
        const radius = 200;
        const otherNodes = addresses.filter((node) => node.id !== centerId).slice(0, 8);
        return [
          { id: centerId, label: addresses.find((node) => node.id === centerId).label, title: addresses.find((node) => node.id === centerId).title, x: 0, y: 0 },
          ...otherNodes.map((node, index) => {
            const angle = (index / 8) * 2 * Math.PI;
            return { ...node, x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
          })
        ];
      };

    const updateGraph = (centerId: SetStateAction<number>) => {
        setCurrentNode(centerId);
        if (network) {
          const nodes = getNodePositions(centerId);
          const edges = generateEdges(centerId);
          network.setData({ nodes, edges });
        }
      };

    const initialNodes = getNodePositions(currentNode);
    const initialEdges = generateEdges(currentNode);

    const options = {
      autoResize: true,
      nodes: { 
        shape: "circle", 
        font: {
            size: 20,
            color: "#147565",
          }, 
    },
      edges: { 
        arrows: "to",
        font: {
          size: 20,
        }
      },
      layout: { improvedLayout: false },
      physics: false,
      interaction: {
        dragNodes: false,
        dragView: false,
        zoomView: false,
      }
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
    <Layout>
      <h1 className=" text-center mb-6 text-5xl font-bold text-white md:text-6xl">Crypto Transactions Graph</h1>
      <div ref={networkRef} style={{ height: "800px", width:"100%", border: "9px solid black", backgroundColor: "#FFFFFF" }} />
    </Layout>
  );
}