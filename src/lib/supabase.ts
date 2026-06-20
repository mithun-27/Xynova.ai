import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration in .env. Authentication will fail.")
}

// Provide a valid dummy URL so the Supabase client doesn't throw a fatal error on startup
export const supabase = createClient(
  supabaseUrl || "https://dummy-project.supabase.co", 
  supabaseAnonKey || "dummy-anon-key"
)
