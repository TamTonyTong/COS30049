"use client"

import Layout from "@/src/components/layout"
import { useState } from "react"
import type React from "react" // Added import for React
import { Button, Input, FormError } from "../../components/ui"
import { Label } from "@/src/components/ui/label"
import Link from "next/link"


export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

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
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const data: { message: string; user: { email: string } } = await response.json();
                    alert(`Login successful! Welcome ${data.user.email}`);
                } else {
                    const errorData: { message: string } = await response.json();
                    alert(errorData.message || 'Invalid email or password');
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('An error occurred. Please try again later.');
            }
        }
    };

    return (
        <div className="w-full max-w-xs mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {errors.email && <FormError message={errors.email} />}
                <Input
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {errors.password && <FormError message={errors.password} />}
                <div className="text-right mt-2">
                    <a
                        href="#"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("Forgot password clicked");
                        }}
                    >
                        Forgot Password?
                    </a>
                </div>
                <Button type="submit">Login</Button>
            </form>
        </div>
    );
}
