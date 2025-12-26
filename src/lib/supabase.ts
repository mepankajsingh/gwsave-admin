import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type PromoCode = {
  id: string
  code: string
  type: 'starter' | 'standard'
  region: 'americas' | 'asia-pacific' | 'emea'
  is_used: boolean
  created_at: string
}

export type PromoCodeRequest = {
  id: string
  user_identifier: string
  promo_code_id: string
  business_email: string
  type: 'starter' | 'standard'
  region: 'americas' | 'asia-pacific' | 'emea'
  created_at: string
}

export type Admin = {
  id: string
  email: string
  is_admin: boolean
  created_at: string
  updated_at: string
}
