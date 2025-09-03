"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function Signup() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signIn("apple", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Apple Sign-In error:", error);
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-purple-600 animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="flex justify-center items-center px-4 py-12 min-h-screen bg-white sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-semibold text-gray-900">
            Join DuoCortex
          </h2>
          <p className="text-xl text-gray-600">
            Create your account with social sign-in
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6 text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900">Quick Sign Up</h3>
            <p className="text-gray-600">
              Create your account instantly using your existing social accounts
            </p>

            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                className="flex justify-center items-center px-4 py-3 w-full text-sm font-medium text-gray-700 bg-white rounded-md border-2 border-gray-300 hover:bg-gray-50"
              >
                <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={handleAppleSignIn}
                className="flex justify-center items-center px-4 py-3 w-full text-sm font-medium text-white bg-black rounded-md border-2 border-gray-300 hover:bg-gray-800"
              >
                <svg
                  className="mr-2 w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Continue with Apple
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Already have an account?</p>
              <Button
                onClick={() => router.push("/login")}
                variant="primary"
                className="mt-2 w-full"
              >
                Login to Your Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
