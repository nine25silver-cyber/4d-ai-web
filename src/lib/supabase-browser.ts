'use client';

import {createClient, type SupabaseClient} from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export type SupabaseConfigStatus = {
  hasUrl: boolean;
  hasAnonKey: boolean;
  configured: boolean;
};

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return {
    hasUrl,
    hasAnonKey,
    configured: hasUrl && hasAnonKey
  };
}

export function hasSupabaseConfig() {
  return getSupabaseConfigStatus().configured;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) return null;
  if (client) return client;
  client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return client;
}
