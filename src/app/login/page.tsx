"use client";

import { useState, useEffect } from "react";
import Layout from "@/src/components/layout";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CryptoJS from "crypto-js"; // Import hashing library
import {Eye, EyeOff} from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false) // Add state for password visibility
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); //import eye icons
  const router = useRouter();

  //useEffect checking Log in state
  useEffect(() => {
    // Check authentication status when component mounts
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      setTimeout(() => router.push("/personal-assets"), 3000);
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Render Visual
  if (isCheckingAuth) {
    return (
      <Layout>
        <div className="mx-auto mt-8 max-w-md rounded-lg bg-[#1a2b4b] p-6 text-center text-white">
          Checking authentication status...
        </div>
      </Layout>
    );
  }

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Sanitize input as user types
    const sanitizedValue = sanitizeInput(value);

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    }
    
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }
    

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        // Use Supabase authentication
        const { data, error } = await supabase
          .from("User") // Table user
          .select("userid, email, passwordhash, salt, phone, metawallet")
          .eq("email", formData.email)
          .single();

        if (error || !data) {
          throw new Error("Invalid email");
        }

        const { userid, email, passwordhash, salt, phone, metawallet } = data;

        // Hash the input password using the stored salt
        const hashedInputPassword = CryptoJS.SHA256(
          formData.password + salt
        ).toString();

        // Compare with stored passwordhash
        if (hashedInputPassword !== passwordhash) {
          throw new Error(`Invalid password.`);
        }

        // Update user login time
        await supabase
          .from("User")
          .update({ lastlogin: new Date().toISOString() })
          .eq("email", formData.email);

        // Save user data to localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userid", userid);
        localStorage.setItem("email", email);
        localStorage.setItem("phone", phone);
        localStorage.setItem("metawallet", metawallet);

        // Login successful
        router.push("/personal-assets");
      } catch (error: any) {
        // Handle Supabase-specific errors
        if (error.message) {
          setErrors({ general: error.message || "An unexpected error occurred." });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Layout>
      <div className="mx-auto mt-8 max-w-md rounded-lg bg-[#1a2b4b] p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center text-white">
          Login to TradePro
        </h1>
        <p className="font-bold text-center">Example Account</p>
        <p className="text-center">Seller: user1@example.com / a1b2c3d4e5 </p>
        <p className="text-center">Buyer: user3@example.com / 12345678</p>
        <br />
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
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              className="pr-10"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-white focus:outline-none"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
              {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          {errors.general && (
            <p className="mt-2 text-center text-red-500">{errors.general}</p>
          )}
          <Button
            type="submit"
            className="w-full text-white bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center text-blue-300 hover:text-blue-200">
          Forgot password?
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
