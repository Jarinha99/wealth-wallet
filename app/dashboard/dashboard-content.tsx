'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/components/nav';
import type { User } from '@supabase/supabase-js';
import type { Transaction, Budget, Profile } from '@/types/database';

type Currency = 'USD' | 'BRL' | 'EUR';

interface DashboardContentProps {
  user: User;
  profile: Profile | null;
  transactions: Transaction[];
  budgets: Budget[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
  };
  errors: {
    transactions?: string;
    budgets?: string;
  };
  selectedMonth: number;
  selectedYear: number;
}

const currencyConfig: Record<Currency, { locale: string; symbol: string; name: string }> = {
  USD: { locale: 'en-US', symbol: '$', name: 'Dollar' },
  BRL: { locale: 'pt-BR', symbol: 'R$', name: 'Real' },
  EUR: { locale: 'de-DE', symbol: '€', name: 'Euro' },
};

export default function DashboardContent({
  user,
  profile,
  transactions,
  budgets,
  summary,
  errors,
  selectedMonth,
  selectedYear,
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get currency from URL params or default to USD
  const currencyParam = searchParams.get('currency') as Currency | null;
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencyParam && ['USD', 'BRL', 'EUR'].includes(currencyParam) ? currencyParam : 'USD'
  );

  // Update currency when URL param changes
  useEffect(() => {
    const currencyParam = searchParams.get('currency') as Currency | null;
    if (currencyParam && ['USD', 'BRL', 'EUR'].includes(currencyParam)) {
      setSelectedCurrency(currencyParam);
    }
  }, [searchParams]);

  const handleMonthChange = (month: number, year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', month.toString());
    params.set('year', year.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    const params = new URLSearchParams(searchParams.toString());
    params.set('currency', currency);
    router.push(`/dashboard?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    const config = currencyConfig[selectedCurrency];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: selectedCurrency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatMonthYear = (month: number, year: number) => {
    return new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Filter transactions for the selected month
  const monthlyTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === selectedMonth &&
      transactionDate.getFullYear() === selectedYear
    );
  });

  // Get month navigation helpers
  const currentDate = new Date();
  const isCurrentMonth = selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    if (direction === 'prev') {
      newMonth -= 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
    }

    handleMonthChange(newMonth, newYear);
  };

  const goToCurrentMonth = () => {
    handleMonthChange(currentDate.getMonth(), currentDate.getFullYear());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Nav user={user} profile={profile} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Month Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Here's your financial overview for {formatMonthYear(selectedMonth, selectedYear)}
              </p>
            </div>
            {/* Month Selector and Currency Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Month Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Previous month"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 min-w-[180px] text-center">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {formatMonthYear(selectedMonth, selectedYear)}
                  </span>
                </div>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next month"
                  disabled={selectedYear > currentDate.getFullYear() || (selectedYear === currentDate.getFullYear() && selectedMonth >= currentDate.getMonth())}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {!isCurrentMonth && (
                  <button
                    onClick={goToCurrentMonth}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    Today
                  </button>
                )}
              </div>

              {/* Currency Selector */}
              <div className="relative">
                <select
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                  className="px-4 py-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm font-medium appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  aria-label="Select currency"
                >
                  <option value="USD">$ USD</option>
                  <option value="BRL">R$ BRL</option>
                  <option value="EUR">€ EUR</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-500 dark:text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Income
              </h3>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Expenses
              </h3>
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Net Savings
              </h3>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <p
              className={`text-2xl font-bold ${
                summary.netSavings >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(summary.netSavings)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Recent Transactions
              </h2>
              <Link
                href="/dashboard/transactions/add"
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                Add Transaction
              </Link>
            </div>

            {errors.transactions && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errors.transactions}
                </p>
              </div>
            )}

            {monthlyTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No transactions for {formatMonthYear(selectedMonth, selectedYear)}
                </p>
                <Link
                  href="/dashboard/transactions/add"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Add Transaction
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyTransactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            transaction.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {transaction.type}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {transaction.category}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {transaction.notes}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budgets */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Budgets
              </h2>
              <Link
                href="/dashboard/budgets/add"
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                Add Budget
              </Link>
            </div>

            {errors.budgets && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errors.budgets}
                </p>
              </div>
            )}

            {budgets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No budgets set yet
                </p>
                <Link
                  href="/dashboard/budgets/add"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Create Your First Budget
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  // Calculate spent amount for this budget category in the selected month
                  const categoryExpenses = monthlyTransactions
                    .filter((t) => {
                      return (
                        t.type === 'expense' &&
                        t.category === budget.category
                      );
                    })
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                  // For yearly budgets, calculate the monthly equivalent
                  let budgetAmount = Number(budget.amount);
                  if (budget.period === 'yearly') {
                    budgetAmount = budgetAmount / 12;
                  }

                  const spent = categoryExpenses;
                  const remaining = budgetAmount - spent;
                  const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                  const isOverBudget = spent > budgetAmount;

                  return (
                    <div
                      key={budget.id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {budget.category}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {budget.period}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>
                            {formatCurrency(spent)} / {formatCurrency(budgetAmount)}
                            {budget.period === 'yearly' && (
                              <span className="text-slate-500 dark:text-slate-500 ml-1">
                                (monthly)
                              </span>
                            )}
                          </span>
                          <span
                            className={
                              isOverBudget
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-slate-600 dark:text-slate-400'
                            }
                          >
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverBudget
                                ? 'bg-red-500'
                                : percentage > 80
                                  ? 'bg-yellow-500'
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          isOverBudget
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isOverBudget
                          ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
                          : `${formatCurrency(remaining)} remaining`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


