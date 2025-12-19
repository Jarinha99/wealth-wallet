import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileContent from './profile-content';
import type { Profile, SupabaseError } from '@/types/database';

export const metadata = {
  title: 'Profile - WealthWallet',
  description: 'Manage your profile settings',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || authError) {
    redirect('/auth/login');
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    .returns<Profile>();

  // If profile doesn't exist, create one
  if (!profile && !profileError) {
    const { data: newProfile } = await supabase
      .from('profiles')
      // @ts-ignore - Supabase type inference issue with profiles table
      .insert({
        user_id: user.id,
        username: null,
        full_name: null,
      })
      .select()
      .single()
      .returns<Profile>();

    return (
      <ProfileContent
        user={user}
        profile={newProfile || null}
        error={profileError ? (profileError as SupabaseError).message : undefined}
      />
    );
  }

  return (
    <ProfileContent
      user={user}
      profile={profile || null}
      error={profileError ? (profileError as SupabaseError).message : undefined}
    />
  );
}

