import { supabase } from './supabase_client';
import type { UserProfile } from '../models/user';

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Upsert profile in public.profiles table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        updated_at: new Date().toISOString(),
      });
      if (profileError) {
        console.warn('Profile sync notice:', profileError.message);
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Ensure profile row exists if signed in
    if (data.user) {
      const fullName = data.user.user_metadata?.full_name || email.split('@')[0];
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          full_name: fullName,
          email: email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async updateProfile(userId: string, fullName: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Also update auth user metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    return data;
  },

  async deleteAccount(userId: string) {
    // 1. Delete all user expansions and their expenses
    const { data: userExpansions } = await supabase
      .from('expansions')
      .select('id')
      .eq('user_id', userId);

    if (userExpansions && userExpansions.length > 0) {
      const expIds = userExpansions.map((e) => e.id);
      await supabase.from('expenses').delete().in('expansion_id', expIds);
      await supabase.from('expansions').delete().eq('user_id', userId);
    }

    // 2. Delete profile
    await supabase.from('profiles').delete().eq('id', userId);

    // 3. Sign out
    await supabase.auth.signOut();
  },
};

