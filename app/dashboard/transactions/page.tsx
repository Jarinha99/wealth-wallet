import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TransactionsContent from './transactions-content';
import type { Transaction, Profile, SupabaseError } from '@/types/database';

export const metadata = {
  title: 'Transactions - WealthWallet',
  description: 'View and filter all your transactions',
};

interface TransactionsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    month?: string;
    year?: string;
    currency?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || authError) {
    redirect('/auth/login');
  }

  // Get filter params from URL
  const params = await searchParams;
  const searchQuery = params.search || '';
  const categoryFilter = params.category || '';
  const selectedMonth = params.month ? parseInt(params.month, 10) : null;
  const selectedYear = params.year ? parseInt(params.year, 10) : null;
  const currencyParam = params.currency || 'USD';

  // Validate month and year if provided
  const validMonth = selectedMonth !== null && selectedMonth >= 0 && selectedMonth <= 11 
    ? selectedMonth 
    : null;
  const validYear = selectedYear !== null && selectedYear >= 2000 && selectedYear <= 2100 
    ? selectedYear 
    : null;

  // Fetch all transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<Transaction[]>();

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    .returns<Profile>();

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set((transactions || []).map((t) => t.category))
  ).sort();

  return (
    <TransactionsContent
      user={user}
      profile={profile}
      transactions={transactions || []}
      categories={categories}
      filters={{
        search: searchQuery,
        category: categoryFilter,
        month: validMonth,
        year: validYear,
        currency: currencyParam,
      }}
      errors={{
        transactions: transactionsError ? (transactionsError as SupabaseError).message : undefined,
      }}
    />
  );
}
