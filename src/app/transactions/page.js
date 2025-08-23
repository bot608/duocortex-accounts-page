"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api, { endpoints } from "@/lib/axios";

export default function Transactions() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/");
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    if (authenticated && user) {
      fetchTransactions();
    }
  }, [authenticated, user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filter, dateRange, applyFilters]);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await api.get(endpoints.quizHistory);

      // Transform React Native quiz history data to match our transaction format
      const quizHistory = response.data.history || [];
      const transformedTransactions = quizHistory.map((quiz) => ({
        id: quiz._id || quiz.id,
        type: quiz.won ? "quiz_win" : "quiz_loss",
        amount: quiz.won ? quiz.winCoins || 0 : quiz.prize || 0,
        status: "completed",
        created_at: quiz.attemptedAt,
        metadata: {
          quiz_name: quiz.quizName,
        },
      }));

      setTransactions(transformedTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transaction history");
    } finally {
      setTransactionsLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filter !== "all") {
      filtered = filtered.filter((tx) => tx.type === filter);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      filtered = filtered.filter((tx) => new Date(tx.created_at) >= startDate);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredTransactions(filtered);
  }, [transactions, filter, dateRange]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "recharge":
        return (
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
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
        );
      case "withdrawal":
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        );
      case "quiz_win":
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3l14 9-14 9V3z"
              />
            </svg>
          </div>
        );
      case "quiz_loss":
        return (
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        );
    }
  };

  const getTransactionTitle = (transaction) => {
    switch (transaction.type) {
      case "recharge":
        return "Coin Recharge";
      case "withdrawal":
        return "Withdrawal Request";
      case "quiz_win":
        return `Quiz Win - ${transaction.metadata?.quiz_name || "Quiz"}`;
      case "quiz_loss":
        return `Quiz Loss - ${transaction.metadata?.quiz_name || "Quiz"}`;
      case "connection_fee":
        return "Connection Fee";
      default:
        return "Transaction";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
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
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className="bg-duo-bg-purple">
        <div className="text-center">
          <h2 className="text-lg font-medium text-duo-text-primary mb-2">
            Current Balance
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl">₹</span>
            <span className="text-4xl font-bold text-duo-text-primary">
              {user.coins || "0"}
            </span>
          </div>
        </div>
      </Card>

      {/* Filters and Export */}
      <Card>
        <Card.Header>
          <Card.Title>Quiz History</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-duo-text-primary mb-2">
                Filter by Result
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-duo-border rounded-lg focus:outline-none focus:ring-2 focus:ring-duo-primary/20"
              >
                <option value="all">All Quizzes</option>
                <option value="quiz_win">Wins Only</option>
                <option value="quiz_loss">Losses Only</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="medium" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-duo-bg-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-duo-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-duo-text-primary mb-2">
                No transactions found
              </h3>
              <p className="text-duo-text-secondary">
                {filter === "all"
                  ? "You haven&apos;t made any transactions yet."
                  : `No ${filter} transactions found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id || index}
                  className="flex items-center justify-between p-4 border border-duo-border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <h4 className="font-medium text-duo-text-primary">
                        {getTransactionTitle(transaction)}
                      </h4>
                      <p className="text-sm text-duo-text-secondary">
                        {new Date(transaction.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-lg font-semibold ${
                          transaction.type === "quiz_win" ||
                          transaction.type === "recharge"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "quiz_win" ||
                        transaction.type === "recharge"
                          ? "+"
                          : "-"}
                        ₹{Math.abs(transaction.amount)}
                      </span>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Transaction Summary */}
      {filteredTransactions.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Summary</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  +₹
                  {filteredTransactions
                    .filter(
                      (tx) => tx.type === "quiz_win" || tx.type === "recharge"
                    )
                    .reduce((sum, tx) => sum + tx.amount, 0)}
                </p>
                <p className="text-sm text-duo-text-secondary">Total Credits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  -₹
                  {filteredTransactions
                    .filter(
                      (tx) =>
                        tx.type === "quiz_loss" ||
                        tx.type === "withdrawal" ||
                        tx.type === "connection_fee"
                    )
                    .reduce((sum, tx) => sum + tx.amount, 0)}
                </p>
                <p className="text-sm text-duo-text-secondary">Total Debits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-duo-primary">
                  {filteredTransactions.length}
                </p>
                <p className="text-sm text-duo-text-secondary">
                  Total Transactions
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}
