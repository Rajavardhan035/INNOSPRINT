import { createClient } from '@supabase/supabase-js';

// Supabase Project: hbntxrrexilmjvxncwvc
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://hbntxrrexilmjvxncwvc.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VGgqOJg5ycmcCRQNXm-29w_lXDIbYBM';

export const isSupabaseConfigured = Boolean(
  import.meta.env?.VITE_SUPABASE_URL || 
  (supabaseUrl && !supabaseUrl.includes('placeholder-project'))
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
