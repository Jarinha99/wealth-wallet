// Database types for WealthWallet
// Generated from supabase-setup.sql schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'income' | 'expense';
          amount?: number;
          category?: string;
          date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          amount: number;
          period: 'monthly' | 'yearly';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          amount: number;
          period?: 'monthly' | 'yearly';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          amount?: number;
          period?: 'monthly' | 'yearly';
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience type aliases
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type Budget = Database['public']['Tables']['budgets']['Row'];
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Supabase error interface for type assertions
export interface SupabaseError {
  message?: string;
}

