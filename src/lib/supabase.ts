import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gswgmupixxavhfmciacr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd2dtdXBpeHhhdmhmbWNpYWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzY2NDMsImV4cCI6MjA3MTg1MjY0M30.Suz0z6dTJ5c6MwK4NeSAONlgGM4gLZKDC8xKmVomyf0'

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
