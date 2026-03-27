// Supabase client for frontend auth
// Install: npm install @supabase/supabase-js

// import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pzjvdrggynyqoodhkmjv.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Placeholder until @supabase/supabase-js is installed
export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};
