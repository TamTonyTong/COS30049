"use client";

import React from 'react';

const transactions = [
    {
        id: '1234567890abcdef',
        timestamp: '2025-01-30 12:34:56',
        type: 'Buy',
        amount: '0.5 BTC',
        status: 'Completed'
    },
    {
        id: 'abcdef1234567890',
        timestamp: '2025-01-29 09:22:33',
        type: 'Sell',
        amount: '1.2 ETH',
        status: 'Pending'
    },
    {
        id: 'fghij67890klmnop',
        timestamp: '2025-01-28 15:45:12',
        type: 'Transfer',
        amount: '0.8 LTC',
        status: 'Completed'
    },
    {
        id: 'mnopqr123456stuv',
        timestamp: '2025-01-27 18:25:00',
        type: 'Sell',
        amount: '2.3 BTC',
        status: 'Cancelled'
    },
    {
        id: 'qrstuv456789wxyz',
        timestamp: '2025-01-26 10:00:45',
        type: 'Buy',
        amount: '0.3 ETH',
        status: 'Completed'
    },
    {
        id: 'wxyz0123456789ab',
        timestamp: '2025-01-25 13:50:20',
        type: 'Transfer',
        amount: '1.0 BTC',
        status: 'Completed'
    },
    {
        id: 'abcdef0123456789',
        timestamp: '2025-01-24 08:40:55',
        type: 'Buy',
        amount: '0.4 LTC',
        status: 'Pending'
    },
];

const TransactionHistory = () => {
    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 p-5 text-black">
            <div className="container mx-auto bg-white shadow-md rounded-md p-5 mb-5">
                <h1 className="text-center text-3xl font-bold mb-5">User Public Information</h1>
                <p className="text-lg mb-4"><strong>Public Address:</strong> 0xABCDEF1234567890</p>
            </div>
            <div className="container mx-auto bg-white shadow-md rounded-md p-5">
                <h3 className="text-xl font-semibold mb-3">Transaction History</h3>
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b">Transaction ID</th>
                            <th className="py-2 px-4 border-b">Timestamp</th>
                            <th className="py-2 px-4 border-b">Type</th>
                            <th className="py-2 px-4 border-b">Amount</th>
                            <th className="py-2 px-4 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border-b">{tx.id}</td>
                                <td className="py-2 px-4 border-b">{tx.timestamp}</td>
                                <td className="py-2 px-4 border-b">{tx.type}</td>
                                <td className="py-2 px-4 border-b">{tx.amount}</td>
                                <td className="py-2 px-4 border-b">{tx.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;
