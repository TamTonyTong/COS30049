import { useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import { Data } from "vis-network/declarations/network/Network";

interface GraphProps {
  nodes: { id: string; label: string }[];
  edges: { from: string; to: string; label?: string }[];
  onNodeClick: (nodeId: string) => void; // Callback for node clicks
}

const Graph: React.FC<GraphProps> = ({ nodes, edges, onNodeClick  }) => {
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (graphRef.current) {
      const container = graphRef.current;

      // Create DataSet instances for nodes and edges
      const graphData: Data = {
        nodes: new DataSet(nodes),
        edges: new DataSet(edges),
      };

      // Graph options
      const options = {
        edges: {
          arrows: {
            to: { enabled: true, scaleFactor: 0.5 }, // Show directed edges
          },
        },
        // The types with the label inside of it are: ellipse, circle, database, box, text.
        // The ones with the label outside of it are: image, circularImage, diamond, dot, star, triangle, triangleDown, hexagon, square and icon.
        nodes: {
          size: 10,
          shape: "ellipse",
          font: {
            size: 12,
            color: "#147565",
          },
        },
        physics: {
          enabled: false, // Disable physics simulation
          stabilization: {
            enabled: true, // Enable stabilization
            iterations: 100, // Number of iterations for stabilization
          },
        },
        interaction: {
          dragNodes: false, // Disable dragging of nodes
          dragView: true, // Allow dragging the view (panning)
          zoomView: true, // Allow zooming the view
        }
      };

      // Initialize the network
      const network = new Network(container, graphData, options);

      network.on("click", (event) => {
        if (event.nodes.length > 0) {
          const nodeId = event.nodes[0]; // Get the clicked node ID
          onNodeClick(nodeId); // Call the callback function
        }
      });
    
    }
  }, [nodes, edges, onNodeClick]);

  return (
    <div
      ref={graphRef}
      style={{ width: "100%", height: "800px", border: "1px solid #ccc" }}
    />
  );
};

export default Graph;