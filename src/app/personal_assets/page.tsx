'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import Layout from "../../components/layout"
import { fakeSmartContract } from '@/src/components/trading/transactions/smart-contract-real';
import TradeHistory from '@/src/components/trading/transactions/trading-history';

interface Trade {
  txHash: string;
  buyer: string;
  seller: string;
  asset: string;
  amount: number;
  price: number;
  sellerDeposit: number;
  status: string;
  timestamp: string;
  userABalanceAtTrade: string;
}
export default function HomePage() {
  const [address, setAddress] = useState<string>('0x1234567890abcdef');
  const [balances, setBalances] = useState({ USD: 0, BTC: 0 });
  const [depositAmount, setDepositAmount] = useState("");
  const [refresh, setRefresh] = useState(false);

  const updateBalance = () => {
    setBalances(fakeSmartContract.getBalance("UserA"));
  };

  const handleDepositUSD = () => {
    fakeSmartContract.depositUSD("UserA", Number(depositAmount));
    setDepositAmount("");
    setTimeout(() => {
      updateBalance();
    }, 100);
  };

  const handleResetUSD = () => {
    fakeSmartContract.resetUSDBalance("UserA");
    setTimeout(() => {
      updateBalance();
      setRefresh((prev) => !prev); // Force a component re-render
    }, 100);
  };

  useEffect(() => {
    updateBalance();
  }, []);

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto">
        <Card className="bg-[#1a2b4b] border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Personal Asset</CardTitle>
          </CardHeader>
          <CardContent>

            {/* User Address */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="left-3 text-xl text-white">Address: {address}</h2>
              </div>
            </div>

            {/* User Balance */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="left-3 text-xl font-medium text-white">Personal Balance</h2>
              </div>
              <table className="min-w-full bg-[#1a2b4b] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829]">
                    <th className="py-2 px-4 border-b text-white">USD</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">
                  <tr className="hover:bg-[#0d1829]">
                    <td className="py-2 px-4 border-b text-white">${balances.USD}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr className="bg-[#0d1829]">
                    <th className="py-2 px-4 border-b text-white">BTC</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">
                  <tr className="hover:bg-[#0d1829]">
                    <td className="py-2 px-4 border-b text-white">{balances.BTC}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* User Balance */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="left-3 text-xl font-medium text-white">Deposit USD</h2>
              </div>
              <div>
                <input
                  className="bg-transparent"
                  placeholder="Deposit Amount"
                  type="text"
                  inputMode="numeric"
                  value={depositAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setDepositAmount(value);
                    }
                  }}
                />
                <button onClick={handleDepositUSD}>Deposit</button>
              </div>
            </div>

            {/* User Assets */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-white">Assets</h2>
              </div>
              <table className="min-w-full bg-[#0d1829] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829] text-white">
                    <th className="py-2 px-4 border-b">Cryptocurrency</th>
                    <th className="py-2 px-4 border-b">Amount</th>
                    <th className="py-2 px-4 border-b">Price (USD)</th>
                    <th className="py-2 px-4 border-b">Total</th>
                    <th className="py-2 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">

                  {/* <tr key={index} className="hover:bg-[#0d1829] text-white"> */}
                  <tr className="hover:bg-[#0d1829] text-white">
                    <td className="py-2 px-4 border-b">BTC</td>
                    <td className="py-2 px-4 border-b">{balances.BTC}</td>
                    <td className="py-2 px-4 border-b">100$</td>
                    <td className="py-2 px-4 border-b">{balances.BTC * 100}$</td>
                    <td className="py-2 px-4 border-b">
                      <a href={`/trade`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Trade</a>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Transactions History
            <div className="mb-6">
              <h2 className="text-xl font-medium text-white mb-3">Transaction History</h2>
              <table className="min-w-full bg-[#1a2b4b] border border-gray-700 text-center">
                <thead>
                  <tr className="bg-[#0d1829] text-white">
                    <th className="py-2 px-4 border-b">Timestamp</th>
                    <th className="py-2 px-4 border-b">Action</th>
                    <th className="py-2 px-4 border-b">Tx</th>
                    <th className="py-2 px-4 border-b">Asset</th>
                    <th className="py-2 px-4 border-b">Amount</th>
                    <th className="py-2 px-4 border-b">Price</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-[#06203E]">

                  <tr key={tx.id} className="hover:bg-[#0d1829] text-white">
                      <td className="py-2 px-4 border-b">{tx.id}</td>
                      <td className="py-2 px-4 border-b">{tx.timestamp}</td>
                      <td className="py-2 px-4 border-b">{tx.type}</td>
                      <td className="py-2 px-4 border-b">{tx.amount}</td>
                      <td className="py-2 px-4 border-b">{tx.status}</td>
                    </tr>

                  

                </tbody>
              </table>
            </div> */}
            <TradeHistory/>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}