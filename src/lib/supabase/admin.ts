import 'server-only';

import {getCloudflareContext} from '@opennextjs/cloudflare';
import {createClient, type SupabaseClient} from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function getCloudflareEnvValue(name: string): string | undefined {
  try {
    const {env} = getCloudflareContext();
    const value = (env as Record<string, unknown>)[name];
    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
}

function getRuntimeEnvValue(name: string): string | undefined {
  return process.env[name] ?? getCloudflareEnvValue(name);
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = getRuntimeEnvValue('NEXT_PUBLIC_SUPABASE_URL')?.trim();
  const serviceRoleKey = getRuntimeEnvValue('SUPABASE_SERVICE_ROLE_KEY')?.trim();
  if (!hasValue(supabaseUrl) || !hasValue(serviceRoleKey)) return null;

  adminClient ??= createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  return adminClient;
}
