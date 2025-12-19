import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Nav from '@/app/components/nav';
import BudgetForm from './budget-form';
import type { Profile } from '@/types/database';

export const metadata = {
  title: 'Add Budget - WealthWallet',
  description: 'Create a new budget for a category',
};

export default async function AddBudgetPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || authError) {
    redirect('/auth/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    .returns<Profile>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Nav user={user} profile={profile} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Create Budget
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Set a spending limit for a category
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <BudgetForm userId={user.id} />
        </div>
      </main>
    </div>
  );
}

