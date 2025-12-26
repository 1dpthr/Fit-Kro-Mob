import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

const supabaseUrl = `https://${projectId}.supabase.co`

// Use a more robust singleton pattern with a global reference
declare global {
  var __supabase: SupabaseClient | undefined
}

// Get or create the singleton instance
export const supabase = (() => {
  if (globalThis.__supabase) {
    return globalThis.__supabase
  }
  
  const client = createSupabaseClient(supabaseUrl, publicAnonKey, {
    auth: {
      persistSession: true,
      storageKey: `sb-${projectId}-auth-token`,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  
  globalThis.__supabase = client
  return client
})()

// Keep createClient for backward compatibility, but return the singleton
export const createClient = () => supabase