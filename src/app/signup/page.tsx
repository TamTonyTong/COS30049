"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import Layout from "../../components/layout";
import { supabase } from "@/lib/supabaseClient";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";


export default function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    //Email checking
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    //Password checking
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    //Confirm Password checking
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("User")
        .select("email")
        .eq("email", formData.email)
        .single();

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Generate a UUID for the user
      const userId = uuidv4();

      // Generate salt and hash password
      const salt = CryptoJS.lib.WordArray.random(16).toString();
      const hashedPassword = CryptoJS.SHA256(formData.password + salt).toString();

      // Insert new user into Supabase
      const { error } = await supabase.from("User").insert([
        {
          userid: userId, // Store the generated UUID
          email: formData.email,
          phone: formData.phone,
          passwordhash: hashedPassword,
          salt: salt,
          isverified: 'FALSE',
          balance: '0'
        }
      ]);

      if (error) throw error;

      // Save email and userid to localStorage
      localStorage.setItem("email", formData.email);
      localStorage.setItem("userid", userId);

      // Redirect to personal-assets after successful signup
      router.push("/personal-assets");
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrors({
        general: error.message || "An error occurred during sign up.",
        ...(error.message?.includes("Email") && { email: error.message })
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto mt-8 max-w-md rounded-lg bg-[#1a2b4b] p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          Sign Up for TradePro
        </h1>
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
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone" className="text-white">
              Phone
            </Label>
            <Input
              type="phone"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
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
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm Password
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          {errors.general && (
            <p className="mt-2 text-center text-red-500">{errors.general}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-white">Already have an account?</p>
          <a href="/login" className="text-blue-300 hover:text-blue-200">
            Login here
          </a>
        </div>
      </div>
    </Layout>
  );
}