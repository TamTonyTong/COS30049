"use client";

import { useState } from "react";
import Layout from "@/src/components/layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Login successful:", data);
          // Set login state in localStorage
          localStorage.setItem("isLoggedIn", "true");
          router.push("/personal_assets"); // Redirect to the desired page
        } else {
          const errorData = await response.json();
          setErrors({ general: errorData.message });
        }
      } catch (error) {
        setErrors({ general: "An unexpected error occurred. Please try again." });
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8 p-6 bg-[#1a2b4b] rounded-lg shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center text-white">Login to TradePro</h1>
        <p className="text-center">alice@example.com</p>
        <p className="text-center">passwordAlice</p><br/>
        <p className="text-center">Example Account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="mt-1"
              value={formData.email}
              // value = "alice@example.com"
              onChange={handleChange}
            />
            {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="mt-1"
              value={formData.password}
              // value = "passwordAlice"
              onChange={handleChange}
            />
            {errors.password && <p className="mt-1 text-red-500 text-sm">{errors.password}</p>}
          </div>
          {errors.general && <p className="mt-2 text-red-500 text-center">{errors.general}</p>}
          <Button type="submit" className="w-full text-white bg-blue-500 hover:bg-blue-600">
            Log In
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm text-blue-300 hover:text-blue-200">
            Forgot password?
          </Link>
        </div>
        <div className="mt-6 text-center">
          <p className="text-white">Don't have an account?</p>
          <Link href="/signup" className="text-blue-300 hover:text-blue-200">
            Sign up here
          </Link>
        </div>
      </div>
    </Layout>
  );
}
