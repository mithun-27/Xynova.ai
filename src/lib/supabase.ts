import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase build-time env variables missing, will try runtime backend fetch.")
}

// Provide a valid dummy URL so the Supabase client doesn't throw a fatal error on startup
export let supabase = createClient(
  supabaseUrl || "https://dummy-project.supabase.co", 
  supabaseAnonKey || "dummy-anon-key"
)

export const initSupabase = async () => {
  if (supabaseUrl && supabaseAnonKey) {
    return;
  }

  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
    const res = await fetch(`${API_URL}/auth/config`);
    if (!res.ok) throw new Error("Failed to fetch supabase config from backend");
    const data = await res.json();
    if (data.supabase_url && data.supabase_anon_key) {
      supabaseUrl = data.supabase_url;
      supabaseAnonKey = data.supabase_anon_key;
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log("Supabase client initialized successfully at runtime.");
    }
  } catch (err) {
    console.error("Runtime Supabase initialization failed:", err);
  }
}

