'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required').max(100, 'Category is too long'),
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(999999999.99, 'Amount is too large'),
  period: z.enum(['monthly', 'yearly'], {
    required_error: 'Please select a period',
  }),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  userId: string;
}

// Common expense categories for budgets
const commonCategories = [
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
  'Other',
];

export default function BudgetForm({ userId }: BudgetFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingBudgets, setExistingBudgets] = useState<string[]>([]);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly',
    },
  });

  const selectedCategory = watch('category');
  const selectedPeriod = watch('period');

  // Fetch existing budgets to check for duplicates
  useEffect(() => {
    const fetchBudgets = async () => {
      const { data } = await supabase
        .from('budgets')
        .select('category, period')
        .eq('user_id', userId);

      if (data) {
        const existing = data.map(
          (b) => `${b.category.toLowerCase()}-${b.period}`
        );
        setExistingBudgets(existing);
      }
    };

    fetchBudgets();
  }, [userId]);

  const isDuplicate =
    selectedCategory &&
    selectedPeriod &&
    existingBudgets.includes(`${selectedCategory.toLowerCase()}-${selectedPeriod}`);

  const onSubmit = async (data: BudgetFormData) => {
    setIsLoading(true);
    setError(null);

    // Check for duplicate
    const duplicateKey = `${data.category.trim().toLowerCase()}-${data.period}`;
    if (existingBudgets.includes(duplicateKey)) {
      setError(
        `A ${data.period} budget for "${data.category}" already exists. Please choose a different category or period.`
      );
      setIsLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('budgets').insert({
        user_id: userId,
        category: data.category.trim(),
        amount: data.amount,
        period: data.period,
      });

      if (insertError) {
        // Handle unique constraint violation
        if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
          setError(
            `A ${data.period} budget for "${data.category}" already exists. Please choose a different category or period.`
          );
        } else {
          setError(insertError.message);
        }
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

      {isDuplicate && (
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ A {selectedPeriod} budget for this category already exists. Creating another will replace it.
          </p>
        </div>
      )}

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
          list="budget-categories"
          {...register('category')}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          placeholder="e.g., Food, Rent, Utilities..."
        />
        <datalist id="budget-categories">
          {commonCategories.map((category) => (
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

      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Budget Amount
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
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Maximum amount you want to spend for this category per {watch('period') === 'monthly' ? 'month' : 'year'}
        </p>
      </div>

      {/* Period */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Period
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20">
            <input
              type="radio"
              value="monthly"
              {...register('period')}
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    Monthly
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Per month
                  </div>
                </div>
              </div>
              <div className="ml-4 text-2xl">📅</div>
            </div>
          </label>

          <label className="relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20">
            <input
              type="radio"
              value="yearly"
              {...register('period')}
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    Yearly
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Per year
                  </div>
                </div>
              </div>
              <div className="ml-4 text-2xl">📆</div>
            </div>
          </label>
        </div>
        {errors.period && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.period.message}
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
          {isLoading ? 'Creating...' : 'Create Budget'}
        </button>
      </div>
    </form>
  );
}

