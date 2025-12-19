'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileFormProps {
  user: User;
  profile: Profile | null;
  onUpdate: (profile: Profile) => void;
}

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    )
    .optional()
    .or(z.literal('')),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm({ user, profile, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare update data (convert empty strings to null)
      const updateData: {
        username?: string | null;
        full_name?: string | null;
      } = {};

      if (data.username !== undefined) {
        updateData.username = data.username.trim() || null;
      }
      if (data.full_name !== undefined) {
        updateData.full_name = data.full_name.trim() || null;
      }

      // If profile doesn't exist, create it
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...updateData,
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
          setIsLoading(false);
          return;
        }

        if (newProfile) {
          onUpdate(newProfile);
          setSuccess(true);
          setIsLoading(false);
          setTimeout(() => setSuccess(false), 3000);
        }
        return;
      }

      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      if (updatedProfile) {
        onUpdate(updatedProfile);
        setSuccess(true);
        setIsLoading(false);
        reset({
          username: updatedProfile.username || '',
          full_name: updatedProfile.full_name || '',
        });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Personal Information
        </h2>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            Profile updated successfully!
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          {...register('full_name')}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          placeholder="John Doe"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.full_name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          {...register('username')}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          placeholder="johndoe"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.username.message}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Username can contain letters, numbers, underscores, and hyphens (3-30 characters)
        </p>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            reset({
              username: profile?.username || '',
              full_name: profile?.full_name || '',
            });
            setError(null);
            setSuccess(false);
          }}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

