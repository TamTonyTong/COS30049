import { Suspense } from 'react';
import SecureTradingClient from './BuyTradingClient';

export default function SecureTradingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50"><p className="text-white">Loading...</p></div>}>
      <SecureTradingClient />
    </Suspense>
  );
}