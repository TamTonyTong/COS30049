interface TransactionTableProps {
    transactions: {
      hash: string;
      from: string;
      to: string;
      value: string;
      blockNumber: string;
      timestamp: string;
      status: string;
    }[];
  }
  
  const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
        <table className="min-w-full bg-[#1a2b4b]/80 border border-blue-500/30 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-500/20">
              <th className="px-4 py-2 text-left">Transaction Hash</th>
              <th className="px-4 py-2 text-left">From</th>
              <th className="px-4 py-2 text-left">To</th>
              <th className="px-4 py-2 text-left">Value (ETH)</th>
              <th className="px-4 py-2 text-left">Block Number</th>
              <th className="px-4 py-2 text-left">Timestamp</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index} className="border-b border-blue-500/30">
                <td className="px-4 py-2">{tx.hash}</td>
                <td className="px-4 py-2">{tx.from}</td>
                <td className="px-4 py-2">{tx.to}</td>
                <td className="px-4 py-2">{tx.value}</td>
                <td className="px-4 py-2">{tx.blockNumber}</td>
                <td className="px-4 py-2">{tx.timestamp}</td>
                <td className="px-4 py-2">{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default TransactionTable;