import { useEffect, useRef } from 'react';
import { DataSet, Network } from 'vis-network';
import { Data } from 'vis-network/declarations/network/Network';

interface GraphProps {
    nodes: { id: string; label: string }[];
    edges: { from: string; to: string; label?: string }[];
}

const Graph: React.FC<GraphProps> = ({ nodes, edges }) => {
    const graphRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (graphRef.current) {
            const container = graphRef.current;

            const graphData: Data = {
                nodes: new DataSet(nodes),
                edges: new DataSet(edges),
            };

            const options = {
                edges: {
                    arrows: {
                        to: { enabled: true, scaleFactor: 0.5 }, // Show directed edges
                    },
                },
                nodes: {
                    shape: 'circle',
                    font: {
                        size: 12,
                        color: '#000000',
                    },
                },
            };

            new Network(container, graphData, options);
        }
    }, [nodes, edges]);

    return <div ref={graphRef} style={{ width: '100%', height: '800px', border: '1px solid #ccc' }} />;
};

export default Graph;