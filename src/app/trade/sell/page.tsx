"use client";

import { Suspense } from "react";
import SellingForm from "@/src/components/trading/transactions/selling-form";
import Layout from "@/src/components/layout";
export default function SellingPage() {
  return (
    <Layout>
      <div className="mt-8 flex justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <SellingForm />
        </Suspense>
      </div>
    </Layout>
  );
}
