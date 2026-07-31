import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with SECRET key for server-side operations
// This bypasses Row Level Security (RLS) - use with caution
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    'Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SECRET_KEY'
  );
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export default supabase;
