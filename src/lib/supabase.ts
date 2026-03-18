import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string).trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string).trim()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env.local and fill in values.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
