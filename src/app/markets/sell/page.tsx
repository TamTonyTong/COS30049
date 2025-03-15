import { Suspense } from 'react';
import SellConfirmClient from './SellConfirmClient';

export default function SellConfirmPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50"><p className="text-white">Loading...</p></div>}>
      <SellConfirmClient />
    </Suspense>
  );
}