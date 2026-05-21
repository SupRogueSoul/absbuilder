import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client that won't crash when Supabase isn't configured yet.
  // All calls will return safe empty/error responses.
  console.warn(
    '⚠️ Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );

  const mockResponse = { data: null, error: { message: 'Supabase not configured' } };
  const mockQuery = () => ({
    select: () => mockQuery(),
    insert: () => mockQuery(),
    update: () => mockQuery(),
    delete: () => mockQuery(),
    eq: () => mockQuery(),
    order: () => mockQuery(),
    single: () => Promise.resolve(mockResponse),
    then: (resolve) => resolve(mockResponse),
  });

  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (_cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Add your credentials to .env.local' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Add your credentials to .env.local' } }),
      signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase not configured. Add your credentials to .env.local' } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => mockQuery(),
  };
}

export { supabase };
