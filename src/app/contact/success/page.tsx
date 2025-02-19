import Layout from "@/src/components/layout";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function ContactSuccessPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl text-center text-white">
        <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-500" />
        <h1 className="mb-4 text-4xl font-bold">Message Sent Successfully!</h1>
        <p className="mb-8">
          Thank you for contacting us. We have received your message and will
          get back to you as soon as possible.
        </p>
        <Button asChild className="bg-blue-500 text-white hover:bg-blue-600">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </Layout>
  );
}
