/**
 * Supabase Client for Edge Functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Create Supabase admin client (bypasses RLS)
 * Use only in Edge Functions for server-side operations
 */
export function createAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create Supabase client with user context
 * Pass the authorization header from the request
 */
export function createUserClient(authHeader: string | null) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader || "",
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get vendor by various identifiers
 */
export async function getVendorByTelegramBusinessConnection(
  supabase: ReturnType<typeof createAdminClient>,
  businessConnectionId: string
) {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("telegram_config->business_connection_id", businessConnectionId)
    .single();

  if (error) return null;
  return data;
}

export async function getVendorBySlug(
  supabase: ReturnType<typeof createAdminClient>,
  slug: string
) {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

export async function getVendorById(
  supabase: ReturnType<typeof createAdminClient>,
  id: string
) {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
