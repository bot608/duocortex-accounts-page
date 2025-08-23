"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api, { endpoints } from "@/lib/axios";

export default function Withdraw() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: "",
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    bankName: "",
    ifscCode: "",
  });
  const [verificationData, setVerificationData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/");
    }
  }, [authenticated, loading, router]);

  const availableCoins = parseFloat(user?.availableCoins || user?.coins || 0);

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = "Amount is required";
    } else if (amount < 100) {
      newErrors.amount = "Minimum withdrawal amount is ₹100";
    } else if (amount > availableCoins) {
      newErrors.amount = "Amount exceeds available coins";
    }

    // Account holder name
    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    // Account number
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (
      formData.accountNumber.length < 9 ||
      formData.accountNumber.length > 18
    ) {
      newErrors.accountNumber = "Account number must be 9-18 digits";
    }

    // Confirm account number
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }

    // Bank name
    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    // IFSC code
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!ifscPattern.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = "Invalid IFSC code format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerification = () => {
    const newErrors = {};

    if (!verificationData.username.trim()) {
      newErrors.username = "Username/Email is required";
    }

    if (!verificationData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVerificationChange = (e) => {
    const { name, value } = e.target;
    setVerificationData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setShowVerification(true);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    if (!validateVerification()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      // Submit withdrawal request using the same endpoint as React Native
      const response = await api.post("user/request-withdrawal", {
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode.toUpperCase(),
        amount: parseFloat(formData.amount),
      });

      if (response.data.success) {
        setSuccess(
          "Withdrawal request submitted successfully! It will be processed within 24-48 hours."
        );
        setFormData({
          amount: "",
          accountHolderName: "",
          accountNumber: "",
          confirmAccountNumber: "",
          bankName: "",
          ifscCode: "",
        });
        setVerificationData({
          username: "",
          password: "",
        });
        setShowVerification(false);

        // Redirect to dashboard after success
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        throw new Error(response.data.message || "Withdrawal request failed");
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      if (err.response?.status === 401) {
        setErrors({ verification: "Invalid username or password" });
      } else {
        setErrors({
          submit:
            err.response?.data?.message ||
            err.message ||
            "Withdrawal request failed",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!authenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Available Balance */}
      <Card className="bg-duo-bg-purple">
        <div className="text-center">
          <h2 className="text-lg font-medium text-duo-text-primary mb-2">
            Available Coins For Withdrawal
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl">₹</span>
            <span className="text-4xl font-bold text-duo-text-primary">
              {availableCoins}
            </span>
          </div>
          <p className="text-sm text-duo-text-secondary mt-2">
            Minimum withdrawal: ₹100 | Processing time: 24-48 hours
          </p>
        </div>
      </Card>

      {success && (
        <Card className="border-l-4 border-l-green-500">
          <Card.Content>
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-green-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-800 font-medium">{success}</span>
            </div>
          </Card.Content>
        </Card>
      )}

      {!showVerification ? (
        /* Withdrawal Form */
        <Card>
          <Card.Header>
            <Card.Title>Withdrawal Details</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <Input
                label="Withdrawal Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount (min ₹100)"
                error={errors.amount}
                helper={`Available: ₹${availableCoins}`}
                required
              />

              {/* Bank Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-duo-text-primary border-b border-duo-border pb-2">
                  Bank Account Details
                </h4>

                <Input
                  label="Account Holder Name"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Full name as per bank account"
                  error={errors.accountHolderName}
                  required
                />

                <Input
                  label="Account Number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter bank account number"
                  error={errors.accountNumber}
                  required
                />

                <Input
                  label="Confirm Account Number"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Re-enter account number"
                  error={errors.confirmAccountNumber}
                  required
                />

                <Input
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  error={errors.bankName}
                  required
                />

                <Input
                  label="IFSC Code"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code (e.g., SBIN0001234)"
                  error={errors.ifscCode}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-full"
                disabled={availableCoins < 100}
              >
                Proceed to Verification
              </Button>
            </form>
          </Card.Content>
        </Card>
      ) : (
        /* Verification Modal */
        <Card>
          <Card.Header>
            <Card.Title>Verify Your Identity</Card.Title>
            <p className="text-sm text-duo-text-secondary">
              For security purposes, please verify your account credentials
              before proceeding with the withdrawal.
            </p>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              {/* Withdrawal Summary */}
              <div className="bg-duo-bg-gray p-4 rounded-lg">
                <h4 className="font-medium text-duo-text-primary mb-2">
                  Withdrawal Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">₹{formData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account:</span>
                    <span className="font-medium">
                      {formData.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bank:</span>
                    <span className="font-medium">{formData.bankName}</span>
                  </div>
                </div>
              </div>

              <Input
                label="Username/Email"
                name="username"
                value={verificationData.username}
                onChange={handleVerificationChange}
                placeholder="Enter your username or email"
                error={errors.username || errors.verification}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={verificationData.password}
                onChange={handleVerificationChange}
                placeholder="Enter your password"
                error={errors.password}
                required
              />

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <span className="text-red-800 text-sm">{errors.submit}</span>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowVerification(false)}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  className="flex-1"
                >
                  {submitting ? "Processing..." : "Submit Withdrawal"}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {/* Important Notes */}
      <Card className="border-l-4 border-l-yellow-500">
        <Card.Content>
          <div className="space-y-3">
            <h4 className="font-medium text-duo-text-primary flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Important Information
            </h4>
            <ul className="text-sm text-duo-text-secondary space-y-1 ml-7">
              <li>• Withdrawal requests are processed within 24-48 hours</li>
              <li>• Minimum withdrawal amount is ₹100</li>
              <li>
                • Ensure bank details are correct - incorrect details may cause
                delays
              </li>
              <li>• You will receive an email confirmation once processed</li>
              <li>
                • Contact support if you don&apos;t receive funds within 48
                hours
              </li>
            </ul>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
