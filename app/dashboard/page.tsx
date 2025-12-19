import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardContent from './dashboard-content';
import type { Transaction, Budget, Profile } from '@/types/database';

export const metadata = {
  title: 'Dashboard - WealthWallet',
  description: 'Your personal finance dashboard',
};

interface DashboardPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || authError) {
    redirect('/auth/login');
  }

  // Get selected month/year from search params or use current month/year
  const params = await searchParams;
  const selectedMonth = params.month ? parseInt(params.month, 10) : new Date().getMonth();
  const selectedYear = params.year ? parseInt(params.year, 10) : new Date().getFullYear();

  // Validate month and year
  const validMonth = selectedMonth >= 0 && selectedMonth <= 11 ? selectedMonth : new Date().getMonth();
  const validYear = selectedYear >= 2000 && selectedYear <= 2100 ? selectedYear : new Date().getFullYear();

  // Fetch all transactions (we'll filter by month on the client)
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<Transaction[]>();

  // Fetch budgets
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })
    .returns<Budget[]>();

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    .returns<Profile>();

  // Filter transactions for the selected month
  const monthlyTransactions = (transactions || []).filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === validMonth &&
      transactionDate.getFullYear() === validYear
    );
  });

  // Calculate summary statistics for the selected month
  const totalIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;

  return (
    <DashboardContent
      user={user}
      profile={profile}
      transactions={transactions || []}
      budgets={budgets || []}
      summary={{
        totalIncome,
        totalExpenses,
        netSavings,
      }}
      errors={{
        transactions: transactionsError?.message,
        budgets: budgetsError?.message,
      }}
      selectedMonth={validMonth}
      selectedYear={validYear}
    />
  );
}

