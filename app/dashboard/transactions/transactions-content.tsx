'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/components/nav';
import type { User } from '@supabase/supabase-js';
import type { Transaction, Profile } from '@/types/database';

type Currency = 'USD' | 'BRL' | 'EUR';

interface TransactionsContentProps {
  user: User;
  profile: Profile | null;
  transactions: Transaction[];
  categories: string[];
  filters: {
    search: string;
    category: string;
    month: number | null;
    year: number | null;
    currency: string;
  };
  errors: {
    transactions?: string;
  };
}

const currencyConfig: Record<Currency, { locale: string; symbol: string; name: string }> = {
  USD: { locale: 'en-US', symbol: '$', name: 'Dollar' },
  BRL: { locale: 'pt-BR', symbol: 'R$', name: 'Real' },
  EUR: { locale: 'de-DE', symbol: '€', name: 'Euro' },
};

export default function TransactionsContent({
  user,
  profile,
  transactions,
  categories,
  filters: initialFilters,
  errors,
}: TransactionsContentProps) {
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

  const [searchQuery, setSearchQuery] = useState(initialFilters.search);
  const [categoryFilter, setCategoryFilter] = useState(initialFilters.category);
  const [monthFilter, setMonthFilter] = useState<number | null>(initialFilters.month);
  const [yearFilter, setYearFilter] = useState<number | null>(initialFilters.year);

  // Sync local state with URL params
  useEffect(() => {
    setSearchQuery(initialFilters.search);
    setCategoryFilter(initialFilters.category);
    setMonthFilter(initialFilters.month);
    setYearFilter(initialFilters.year);
  }, [initialFilters]);

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (categoryFilter) {
      params.set('category', categoryFilter);
    }
    if (monthFilter !== null) {
      params.set('month', monthFilter.toString());
    }
    if (yearFilter !== null) {
      params.set('year', yearFilter.toString());
    }
    if (selectedCurrency !== 'USD') {
      params.set('currency', selectedCurrency);
    }

    router.push(`/dashboard/transactions?${params.toString()}`);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    const params = new URLSearchParams(searchParams.toString());
    params.set('currency', currency);
    router.push(`/dashboard/transactions?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setMonthFilter(null);
    setYearFilter(null);
    router.push('/dashboard/transactions');
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Text search filter (description/notes)
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const matchesNotes = transaction.notes?.toLowerCase().includes(searchLower);
        const matchesCategory = transaction.category.toLowerCase().includes(searchLower);
        if (!matchesNotes && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter && transaction.category !== categoryFilter) {
        return false;
      }

      // Month/Year filter
      if (monthFilter !== null && yearFilter !== null) {
        const transactionDate = new Date(transaction.date);
        if (
          transactionDate.getMonth() !== monthFilter ||
          transactionDate.getFullYear() !== yearFilter
        ) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, categoryFilter, monthFilter, yearFilter]);

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

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;

  // Generate month/year options
  const currentDate = new Date();
  const monthOptions: { month: number; year: number; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    monthOptions.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      label: formatMonthYear(date.getMonth(), date.getFullYear()),
    });
  }

  const hasActiveFilters =
    searchQuery.trim() || categoryFilter || monthFilter !== null || yearFilter !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Nav user={user} profile={profile} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                Transactions
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                View and filter all your transactions
              </p>
            </div>
            <div className="flex items-center gap-3">
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
              <Link
                href="/dashboard/transactions/add"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
              >
                Add Transaction
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Text Search */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFilterChange();
                    }
                  }}
                  placeholder="Search by description or category..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div>
                <label
                  htmlFor="month"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Month
                </label>
                <select
                  id="month"
                  value={monthFilter !== null ? `${monthFilter}-${yearFilter}` : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [month, year] = e.target.value.split('-').map(Number);
                      setMonthFilter(month);
                      setYearFilter(year);
                    } else {
                      setMonthFilter(null);
                      setYearFilter(null);
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                >
                  <option value="">All Months</option>
                  {monthOptions.map((option) => (
                    <option key={`${option.month}-${option.year}`} value={`${option.month}-${option.year}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleFilterChange}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                >
                  Apply Filters
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-slate-700 dark:text-slate-300 font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {filteredTransactions.filter((t) => t.type === 'income').length} transactions
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
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {filteredTransactions.filter((t) => t.type === 'expense').length} transactions
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Net Amount
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
                  netAmount >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(netAmount)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {filteredTransactions.length} total transactions
              </p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          {errors.transactions && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {errors.transactions}
              </p>
            </div>
          )}

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {hasActiveFilters
                  ? 'No transactions match your filters'
                  : 'No transactions yet'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/dashboard/transactions/add"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Add Your First Transaction
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-50">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            transaction.type === 'income'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-50">
                        {transaction.category}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {transaction.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            transaction.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(Number(transaction.amount))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
