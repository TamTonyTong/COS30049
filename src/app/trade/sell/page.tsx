"use client";

import { Suspense} from "react";
import SellingForm from "@/src/components/trading/transactions/selling-form";
import Layout from "@/src/components/layout";
export default function SellingPage() {
  return (
    <Layout>
      <div className="flex justify-center mt-8">
        <Suspense fallback={<div>Loading...</div>}>
          <SellingForm />
        </Suspense>
      </div>
    </Layout>
  );
}