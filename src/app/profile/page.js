"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api, { endpoints } from "@/lib/axios";

export default function Profile() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    // If user already has a complete profile, redirect to dashboard
    if (user && user.name && user.phone) {
      router.push("/dashboard");
      return;
    }

    // Pre-fill name if available from social sign-in
    if (user?.name) {
      setName(user.name);
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(endpoints.profileUpdate, {
        name: name.trim(),
        phone: phone.trim() || undefined,
      });

      if (response.data) {
        setSuccess("Profile updated successfully!");
        
        // Update local user data
        const updatedUser = { ...user, name: name.trim(), phone: phone.trim() };
        updateUser(updatedUser);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fromSignup = searchParams.get("from") === "signup";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            {fromSignup ? "Complete Your Profile" : "Update Profile"}
          </h2>
          <p className="text-xl text-gray-600">
            {fromSignup 
              ? "Please provide some additional information to complete your account setup"
              : "Update your profile information"
            }
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full bg-purple-50 border-white"
              required
            />

            <Input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              className="w-full bg-purple-50 border-white"
            />

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center">{success}</div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="small" /> : "Save Profile"}
            </Button>

            {!fromSignup && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Skip for Now
              </Button>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
