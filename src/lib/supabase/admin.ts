import 'server-only';

import {getCloudflareContext} from '@opennextjs/cloudflare';
import {createClient, type SupabaseClient} from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

type CloudflareEnvLookup = {
  contextAvailable: boolean;
  value: string | undefined;
};

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function getCloudflareEnvValue(name: string): CloudflareEnvLookup {
  try {
    const {env} = getCloudflareContext();
    const value = (env as Record<string, unknown>)[name];
    return {contextAvailable: true, value: typeof value === 'string' ? value : undefined};
  } catch {
    return {contextAvailable: false, value: undefined};
  }
}

function getRuntimeEnvValue(name: string): string | undefined {
  return process.env[name] ?? getCloudflareEnvValue(name).value;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = getRuntimeEnvValue('NEXT_PUBLIC_SUPABASE_URL')?.trim();
  const serviceRoleKey = getRuntimeEnvValue('SUPABASE_SERVICE_ROLE_KEY')?.trim();
  if (!hasValue(supabaseUrl) || !hasValue(serviceRoleKey)) {
    const cloudflareSupabaseUrl = getCloudflareEnvValue('NEXT_PUBLIC_SUPABASE_URL');
    const cloudflareServiceRoleKey = getCloudflareEnvValue('SUPABASE_SERVICE_ROLE_KEY');
    const cloudflareWorkerSecretPresenceTest = getCloudflareEnvValue('WORKER_SECRET_PRESENCE_TEST');
    console.error('Supabase admin env is not configured.', {
      processSupabaseUrlPresent: hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
      processServiceRoleKeyPresent: hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
      processWorkerSecretPresenceTest: hasValue(process.env.WORKER_SECRET_PRESENCE_TEST),
      cloudflareContextAvailable: cloudflareSupabaseUrl.contextAvailable || cloudflareServiceRoleKey.contextAvailable,
      cloudflareSupabaseUrlPresent: hasValue(cloudflareSupabaseUrl.value),
      cloudflareServiceRoleKeyPresent: hasValue(cloudflareServiceRoleKey.value),
      cloudflareWorkerSecretPresenceTest: hasValue(cloudflareWorkerSecretPresenceTest.value)
    });
    return null;
  }

  adminClient ??= createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  return adminClient;
}
