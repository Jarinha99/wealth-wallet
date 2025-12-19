'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Nav from '@/app/components/nav';
import type { User } from '@supabase/supabase-js';
import ProfileForm from './profile-form';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileContentProps {
  user: User;
  profile: Profile | null;
  error?: string;
}

export default function ProfileContent({
  user,
  profile: initialProfile,
  error: initialError,
}: ProfileContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleProfileUpdate = async (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Nav user={user} profile={initialProfile} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Profile Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account information and preferences
          </p>
        </div>

        {/* Error Display */}
        {initialError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              {initialError}
            </p>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <ProfileForm
            user={user}
            profile={profile}
            onUpdate={handleProfileUpdate}
          />
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <p className="text-sm text-slate-900 dark:text-slate-50">
                {user.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Email cannot be changed. Contact support if you need to update it.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                User ID
              </label>
              <p className="text-sm text-slate-900 dark:text-slate-50 font-mono">
                {user.id}
              </p>
            </div>

            {profile && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Account Created
                  </label>
                  <p className="text-sm text-slate-900 dark:text-slate-50">
                    {formatDate(profile.created_at)}
                  </p>
                </div>

                {profile.updated_at !== profile.created_at && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-slate-900 dark:text-slate-50">
                      {formatDate(profile.updated_at)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

