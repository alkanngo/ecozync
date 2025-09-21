import { Database } from '@/libs/supabase/types'
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
