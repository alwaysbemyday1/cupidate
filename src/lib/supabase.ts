import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabasePublishableKey as string)
  : null;

export function getSupabaseClientOrThrow() {
  if (!supabase) {
    throw new Error(
      "Supabase client is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return supabase;
}
