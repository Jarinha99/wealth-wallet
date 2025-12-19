'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    message: 'Please select a transaction type',
  }),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(999999999.99, 'Amount is too large'),
  category: z.string().min(1, 'Category is required').max(100, 'Category is too long'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().or(z.literal('')),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  userId: string;
}

// Common categories for quick selection
const commonCategories = {
  income: [
    'Salary',
    'Freelance',
    'Investment',
    'Bonus',
    'Gift',
    'Other Income',
  ],
  expense: [
    'Food',
    'Rent',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Bills',
    'Subscription',
    'Other Expense',
  ],
};

export default function TransactionForm({ userId }: TransactionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0], // Today's date
      notes: '',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('transactions')
        // @ts-ignore - Supabase type inference issue with transactions table
        .insert({
          user_id: userId,
          type: data.type,
          amount: data.amount,
          category: data.category.trim(),
          date: data.date,
          notes: data.notes?.trim() || null,
        });

      if (insertError) {
        setError(insertError.message);
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20">
            <input
              type="radio"
              value="income"
              {...register('type')}
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    Income
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Money received
                  </div>
                </div>
              </div>
              <div className="ml-4 text-2xl">💰</div>
            </div>
          </label>

          <label className="relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none has-[:checked]:border-red-500 has-[:checked]:bg-red-50 dark:has-[:checked]:bg-red-900/20">
            <input
              type="radio"
              value="expense"
              {...register('type')}
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    Expense
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Money spent
                  </div>
                </div>
              </div>
              <div className="ml-4 text-2xl">💸</div>
            </div>
          </label>
        </div>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.type.message}
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
            $
          </span>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            {...register('amount', { valueAsNumber: true })}
            className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="0.00"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Category
        </label>
        <input
          id="category"
          type="text"
          list={`${selectedType}-categories`}
          {...register('category')}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          placeholder={
            selectedType === 'income'
              ? 'e.g., Salary, Freelance, Investment...'
              : 'e.g., Food, Rent, Utilities...'
          }
        />
        <datalist id={`${selectedType}-categories`}>
          {(selectedType === 'income'
            ? commonCategories.income
            : commonCategories.expense
          ).map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.category.message}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Type to see suggestions or enter a custom category
        </p>
      </div>

      {/* Date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Date
        </label>
        <input
          id="date"
          type="date"
          {...register('date')}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.date.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
          placeholder="Add any additional notes about this transaction..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.notes.message}
          </p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {isLoading ? 'Adding...' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}

