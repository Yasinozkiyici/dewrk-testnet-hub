/**
 * Client-side Supabase client
 * Browser'da kullanılacak Supabase client
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

