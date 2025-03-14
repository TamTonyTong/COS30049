"use client";

import { useState, useEffect } from "react";
import Layout from "@/src/components/layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";

export default function CreateCurrencyPage() {
  const [formData, setFormData] = useState({ symbol: "", name: "", price: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch userId from localStorage or Supabase session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userid");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        const fetchUser = async () => {
          const response = await fetch("/api/auth/session");
          const { data: { session } } = await response.json();
          if (session) {
            setUserId(session.user.id);
            localStorage.setItem("userid", session.user.id);
          }
        };
        fetchUser();
      }
    }
  }, []);

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
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    if (!selectedFile) newErrors.image = "Image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm() && userId) {
      setLoading(true);
      setErrors({});

      try {
        const assetId = uuidv4();
        const priceHistoryId = uuidv4();

        // Upload image to Supabase Storage
        const file = selectedFile!;
        const fileExt = file.name.split('.').pop();
        const fileName = `${assetId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('nft-img')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('nft-img')
          .getPublicUrl(fileName);

        // Insert into Asset table
        const assetResponse = await fetch("/api/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": userId,
          },
          body: JSON.stringify({
            table: "Asset",
            data: {
              assetid: assetId,
              symbol: formData.symbol,
              name: formData.name,
              assettype: "NFT",
              createdat: new Date().toISOString(),
              isactive: true,
              img: publicUrl,
            },
          }),
        });

        if (!assetResponse.ok) {
          const errorData = await assetResponse.json();
          throw new Error(errorData.error || "Failed to insert into Asset table");
        }

        // Insert into PriceHistory table
        const priceHistoryResponse = await fetch("/api/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": userId,
          },
          body: JSON.stringify({
            table: "PriceHistory",
            data: {
              pricehistoryid: priceHistoryId,
              assetid: assetId,
              price: Number(formData.price),
              currencypair: `${formData.symbol}/ETH`,
              timestamp: new Date().toISOString(),
              source: "User",
            },
          }),
        });

        if (!priceHistoryResponse.ok) {
          const errorData = await priceHistoryResponse.json();
          throw new Error(errorData.error || "Failed to insert into PriceHistory table");
        }

        router.push("/personal-assets");
      } catch (error) {
        setErrors({
          general: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    } else if (!userId) {
      setErrors({
        general: "Please log in to create a currency.",
      });
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>
            <div>
              <Label htmlFor="image" className="text-white">
                Image
              </Label>
              <Input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-500">{errors.image}</p>
              )}
            </div>
            {errors.general && (
              <p className="mt-2 text-center text-red-500">{errors.general}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              disabled={loading || !formData.symbol || !formData.name || !formData.price}
            >
              {loading ? "Creating..." : "Create Currency"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}