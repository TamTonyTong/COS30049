"use client";

import { useState } from "react";
import Layout from "@/src/components/layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid"; // For generating UUIDs

export default function CreateCurrencyPage() {
  const [formData, setFormData] = useState({ symbol: "", name: "", price: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.symbol) newErrors.symbol = "Symbol is required";
    if (formData.symbol.length !== 3 || formData.symbol !== formData.symbol.toUpperCase()) {
      newErrors.symbol = "Symbol must be 3 characters and uppercase";
    }
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (isNaN(Number(formData.price))) newErrors.price = "Price must be a number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const assetId = uuidv4(); // Generate a unique ID for the asset
        const priceHistoryId = uuidv4(); // Generate a unique ID for the price history

        // Insert into Asset table
        const assetResponse = await fetch("/api/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: "Asset",
            data: {
              assetid: assetId,
              symbol: formData.symbol,
              name: formData.name,
              assettype: "cryptocurrency",
              volume: 0,
              createdat: new Date().toISOString(),
              isactive: true,
            },
          }),
        });

        if (!assetResponse.ok) {
          throw new Error("Failed to insert into Asset table");
        }

        // Insert into PriceHistory table
        const priceHistoryResponse = await fetch("/api/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: "PriceHistory",
            data: {
              pricehistoryid: priceHistoryId,
              assetid: assetId,
              price: Number(formData.price), // Price in ETH
              currencypair: `${formData.symbol}/ETH`, // Auto-generated currency pair
              timestamp: new Date().toISOString(),
              source: "User",
            },
          }),
        });

        if (!priceHistoryResponse.ok) {
          throw new Error("Failed to insert into PriceHistory table");
        }

        // Redirect to the personal-assets page
        router.push("/personal-assets");
      } catch (error) {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 rounded-lg border border-blue-500/30 bg-[#1a2b4b] p-6">
          <h1 className="mb-6 text-3xl font-bold text-white">Create New Currency</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="symbol" className="text-white">
                Symbol (3 characters, uppercase)
              </Label>
              <Input
                type="text"
                id="symbol"
                name="symbol"
                placeholder="Enter symbol (e.g., BTC)"
                className="mt-1"
                value={formData.symbol}
                onChange={handleChange}
                maxLength={3}
              />
              {errors.symbol && (
                <p className="mt-1 text-sm text-red-500">{errors.symbol}</p>
              )}
            </div>
            <div>
              <Label htmlFor="name" className="text-white">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Enter name (e.g., Bitcoin)"
                className="mt-1"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="price" className="text-white">
                Price (ETH)
              </Label>
              <Input
                type="text"
                id="price"
                name="price"
                placeholder="Enter price in ETH (e.g., 0.05)"
                className="mt-1"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>
            {errors.general && (
              <p className="mt-2 text-center text-red-500">{errors.general}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Create Currency
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}