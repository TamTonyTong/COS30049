"use client"

import { useState } from 'react';
import axios from 'axios';
import  Graph  from '../../components/walletscan/graph';

const ETHERSCAN_API_KEY = 'YOUR_API_KEY'; // Replace with your Etherscan API key

interface Transaction {
    from: string;
    to: string;
    value: string;
}

const Home: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [graphData, setGraphData] = useState<{
        nodes: { id: string; label: string }[];
        edges: { from: string; to: string; label?: string }[];
    }>({ nodes: [], edges: [] });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const fetchTransactions = async () => {
        setLoading(true);
        setError('');

        try {
            // Get the latest block number
            const latestBlockResponse = await axios.get(
                `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_API_KEY}`
            );
            const latestBlock = parseInt(latestBlockResponse.data.result, 16);

            // Fetch transactions for the wallet address
            const transactionsResponse = await axios.get(
                `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=${latestBlock - 10}&endblock=${latestBlock}&sort=asc&apikey=${ETHERSCAN_API_KEY}`
            );

            if (transactionsResponse.data.status === '1') {
                const transactions: Transaction[] = transactionsResponse.data.result;

                const nodes = new Set<string>();
                const edges: { from: string; to: string; label?: string }[] = [];

                transactions.forEach((tx) => {
                    const from = tx.from;
                    const to = tx.to;

                    nodes.add(from);
                    nodes.add(to);

                    edges.push({
                        from: from,
                        to: to,
                        label: `${tx.value} Wei`, // Optional: Add transaction value as label
                    });
                });

                setGraphData({
                    nodes: Array.from(nodes).map((id) => ({ id, label: id })),
                    edges: edges,
                });
            } else {
                throw new Error(transactionsResponse.data.message);
            }
        } catch (err) {
            setError('Failed to fetch transactions. Please check the wallet address and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Wallet Transaction Graph</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter wallet address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    style={{ padding: '8px', width: '400px', marginRight: '10px' }}
                />
                <button onClick={fetchTransactions} disabled={loading}>
                    {loading ? 'Loading...' : 'Search'}
                </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Graph nodes={graphData.nodes} edges={graphData.edges} onNodeClick={function (nodeId: string): void {
                throw new Error('Function not implemented.');
            } } />
        </div>
    );
};

export default Home;