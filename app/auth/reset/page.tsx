import Link from 'next/link';
import ResetForm from './reset-form';

export const metadata = {
  title: 'Reset Password - WealthWallet',
  description: 'Reset your WealthWallet account password',
};

export default function ResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              WealthWallet
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Reset password
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <ResetForm />
        </div>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}


