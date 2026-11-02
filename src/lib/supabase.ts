import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE } from "@/config";

let client: SupabaseClient | null | undefined;

/** The browser Supabase client, or null when the site was built without Supabase settings. */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (typeof window === "undefined" || !SUPABASE.url || !SUPABASE.anonKey) {
    client = null;
    return client;
  }
  client = createClient(SUPABASE.url, SUPABASE.anonKey, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

/** Same as getSupabase() but throws, for code that only runs once the admin is signed in. */
export function db(): SupabaseClient {
  const c = getSupabase();
  if (!c) throw new Error("Supabase is not configured");
  return c;
}
