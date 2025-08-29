import { supabase, PromoCode } from '../lib/supabase'

export class PromoCodeService {
  private static async ensureAuthenticated(forceRefresh = false): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        throw new Error('Failed to verify authentication. Please refresh the page and try again.')
      }
      
      if (!session?.user) {
        throw new Error('Authentication required. Please sign in to perform this action.')
      }

      // Check if session is expired or will expire soon (within 1 minute)
      const expirationBuffer = 60 // 60 seconds buffer
      const now = Date.now() / 1000
      
      if (session.expires_at && (now > session.expires_at || (session.expires_at - now) < expirationBuffer)) {
        console.warn('Session expired, attempting to refresh...')
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          throw new Error('Session expired. Please sign in again.')
        }
      } else if (forceRefresh) {
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.warn('Forced session refresh failed:', refreshError)
        }
      }
      
      console.log('Authentication verified successfully')
    } catch (error) {
      console.error('Authentication verification failed:', error)
      throw error
    }
  }

  private static async withRetry<T>(
    operation: () => Promise<T>, 
    retries = 1
  ): Promise<T> {
    try {
      return await operation()
    } catch (error: any) {
      console.error('Operation failed, error:', error)
      
      // If it's an authentication/session error and we have retries left, try refreshing session
      if (retries > 0 && (
        error?.message?.includes('Authentication') || 
        error?.message?.includes('session') ||
        error?.code === 'PGRST301' // JWT expired
      )) {
        console.log('Retrying operation with refreshed session...')
        await this.ensureAuthenticated(true)
        return await this.withRetry(operation, retries - 1)
      }
      
      throw error
    }
  }

  static async addPromoCodes(
    codes: string[], 
    type: 'starter' | 'standard', 
    region: 'americas' | 'asia-pacific' | 'emea'
  ): Promise<{ success: PromoCode[], errors: string[] }> {

    return await this.withRetry(async () => {
      await this.ensureAuthenticated()
      
      const success: PromoCode[] = []
      const errors: string[] = []

      // Check for existing codes first
      const { data: existingCodes, error: existingError } = await supabase
        .from('promo_codes')
        .select('code')
        .in('code', codes)

      if (existingError) {
        console.error('Error checking existing codes:', existingError)
        throw new Error(`Failed to check existing codes: ${existingError.message}`)
      }

      const existingCodesSet = new Set(existingCodes?.map(c => c.code) || [])

      const newCodes = codes.filter(code => {
        const trimmedCode = code.trim()
        if (!trimmedCode) {
          errors.push('Empty code found')
          return false
        }
        if (existingCodesSet.has(trimmedCode)) {
          errors.push(`Code ${trimmedCode} already exists`)
          return false
        }
        return true
      })

      if (newCodes.length === 0) {
        return { success, errors }
      }

      // Ensure all values are lowercase for database storage
      const promoCodeData = newCodes.map(code => ({
        code: code.trim(),
        type: type.toLowerCase(),
        region: region.toLowerCase(),
        is_used: false
      }))

      console.log('Inserting promo codes with lowercase values:', {
        count: promoCodeData.length,
        sampleData: promoCodeData[0]
      })
      
      const { data, error } = await supabase
        .from('promo_codes')
        .insert(promoCodeData)
        .select()

      if (error) {
        console.error('Database insert error:', error.message)
        throw new Error(`Database error: ${error.message}`)
      } 
      
      if (data) {
        success.push(...data)
      }

      return { success, errors }
    })
  }

  static async getPromoCodes(
    type?: 'starter' | 'standard',
    region?: 'americas' | 'asia-pacific' | 'emea',
    isUsed?: boolean
  ): Promise<PromoCode[]> {
    return await this.withRetry(async () => {
      await this.ensureAuthenticated()
      
      let query = supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }
      if (region) {
        query = query.eq('region', region)
      }
      if (typeof isUsed === 'boolean') {
        query = query.eq('is_used', isUsed)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching promo codes:', error)
        throw new Error(`Failed to fetch promo codes: ${error.message}`)
      }

      return data || []
    })
  }

  static async deletePromoCodes(ids: string[]): Promise<void> {
    return await this.withRetry(async () => {
      await this.ensureAuthenticated()
      
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .in('id', ids)

      if (error) {
        console.error('Error deleting promo codes:', error)
        throw new Error(`Failed to delete promo codes: ${error.message}`)
      }
    })
  }

  static async getPromoCodeStats(): Promise<{
    total: number
    used: number
    available: number
    byType: Record<string, number>
    byRegion: Record<string, number>
  }> {
    return await this.withRetry(async () => {
      await this.ensureAuthenticated()
      
      const { data, error } = await supabase
        .from('promo_codes')
        .select('type, region, is_used')

      if (error) {
        console.error('Error fetching stats:', error)
        throw new Error(`Failed to fetch statistics: ${error.message}`)
      }
      
      if (!data) {
        return {
          total: 0,
          used: 0,
          available: 0,
          byType: {},
          byRegion: {}
        }
      }

      const stats = data.reduce((acc, code) => {
        acc.total++
        if (code.is_used) acc.used++
        else acc.available++
        
        acc.byType[code.type] = (acc.byType[code.type] || 0) + 1
        acc.byRegion[code.region] = (acc.byRegion[code.region] || 0) + 1
        
        return acc
      }, {
        total: 0,
        used: 0,
        available: 0,
        byType: {},
        byRegion: {}
      })

      return stats
    })
  }

  static async deletePromoCodes(ids: string[]): Promise<void> {
    return await this.withRetry(async () => {
      await this.ensureAuthenticated()
      
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .in('id', ids)

      if (error) {
        console.error('Error deleting promo codes:', error)
        throw new Error(`Failed to delete promo codes: ${error.message}`)
      }
    })
  }
}
