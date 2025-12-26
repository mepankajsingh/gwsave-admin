import { supabase, PromoCode } from '../lib/supabase'

export class PromoCodeService {
  private static async withRetry<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation()
    } catch (error: any) {
      console.error('Operation failed:', error)
      throw error
    }
  }

  static async addPromoCodes(
    codes: string[],
    type: 'starter' | 'standard',
    region: 'americas' | 'asia-pacific' | 'emea'
  ): Promise<{ success: PromoCode[], errors: string[] }> {

    return await this.withRetry(async () => {
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
    verified: number
    monthlyRevenue: number
    byType: Record<string, number>
    byRegion: Record<string, number>
  }> {
    return await this.withRetry(async () => {
      // 1. Get Promo Codes Stats
      const { data: codes, error: codesError } = await supabase
        .from('promo_codes')
        .select('type, region, is_used')

      if (codesError) {
        console.error('Error fetching promo codes stats:', codesError)
        throw new Error(`Failed to fetch statistics: ${codesError.message}`)
      }

      // 2. Get Verification/Revenue Stats
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: requests, error: requestsError } = await supabase
        .from('promo_code_requests')
        .select('verified, created_at')

      if (requestsError) {
        console.error('Error fetching requests stats:', requestsError)
        // Don't fail completely if requests fail? Or fail? 
        // Let's fail to show consistent error state.
        throw new Error(`Failed to fetch requests statistics: ${requestsError.message}`)
      }

      const verifiedCount = requests?.filter(r => r.verified).length || 0

      // Revenue: Verified codes created this month * 15
      const monthlyVerifiedCount = requests?.filter(r =>
        r.verified && new Date(r.created_at) >= startOfMonth
      ).length || 0

      const monthlyRevenue = monthlyVerifiedCount * 15

      // Process codes stats
      const stats = (codes || []).reduce((acc, code) => {
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
        verified: verifiedCount,
        monthlyRevenue: monthlyRevenue,
        byType: {} as Record<string, number>,
        byRegion: {} as Record<string, number>
      })

      return stats
    })
  }

  static async getRedeemedCodes(): Promise<{
    id: string
    code: string
    type: 'starter' | 'standard'
    region: 'americas' | 'asia-pacific' | 'emea'
    redeemed_at: string
    promo_code_id: string
    verified: boolean
  }[]> {
    return await this.withRetry(async () => {
      const { data, error } = await supabase
        .from('promo_code_requests')
        .select(`
          id,
          created_at,
          promo_code_id,
          type,
          region,
          verified,
          promo_codes!inner (
            code
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching redeemed codes:', error)
        throw new Error(`Failed to fetch redeemed codes: ${error.message}`)
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        code: item.promo_codes?.code || 'Unknown',
        type: item.type,
        region: item.region,
        redeemed_at: item.created_at,
        promo_code_id: item.promo_code_id,
        verified: item.verified || false
      }))
    })
  }

  static async toggleVerifiedStatus(id: string, verified: boolean): Promise<void> {
    return await this.withRetry(async () => {
      const { error } = await supabase
        .from('promo_code_requests')
        .update({ verified })
        .eq('id', id)

      if (error) {
        console.error('Error updating verified status:', error)
        throw new Error(`Failed to update verified status: ${error.message}`)
      }
    })
  }

  static async deleteRedeemedCodes(ids: string[]): Promise<void> {
    return await this.withRetry(async () => {
      console.log('Attempting to delete redeemed codes:', ids)

      // First, get the promo_code_ids from the records we're about to delete
      const { data: requestsToDelete, error: fetchError } = await supabase
        .from('promo_code_requests')
        .select('promo_code_id')
        .in('id', ids)

      if (fetchError) {
        console.error('Error fetching promo_code_ids:', fetchError)
        throw new Error(`Failed to fetch redeemed codes: ${fetchError.message}`)
      }

      const promoCodeIds = requestsToDelete?.map(r => r.promo_code_id).filter(Boolean) || []
      console.log('Promo code IDs to delete:', promoCodeIds)

      // Delete from promo_code_requests table
      const { data: deletedRequests, error: deleteRequestsError } = await supabase
        .from('promo_code_requests')
        .delete()
        .in('id', ids)
        .select()

      console.log('Delete requests result:', { deletedRequests, deleteRequestsError })

      if (deleteRequestsError) {
        console.error('Error deleting from promo_code_requests:', deleteRequestsError)
        throw new Error(`Failed to delete redeemed codes: ${deleteRequestsError.message}`)
      }

      // Also delete from promo_codes table
      if (promoCodeIds.length > 0) {
        const { data: deletedCodes, error: deleteCodesError } = await supabase
          .from('promo_codes')
          .delete()
          .in('id', promoCodeIds)
          .select()

        console.log('Delete promo_codes result:', { deletedCodes, deleteCodesError })

        if (deleteCodesError) {
          console.error('Error deleting from promo_codes:', deleteCodesError)
          // Don't throw here - the main deletion succeeded
          console.warn('Warning: Failed to delete associated promo codes')
        }
      }
    })
  }

  static async restoreRedeemedCode(id: string): Promise<void> {
    return await this.withRetry(async () => {
      console.log('Attempting to restore redeemed code:', id)

      // 1. Get the promo_code_id
      const { data: request, error: fetchError } = await supabase
        .from('promo_code_requests')
        .select('promo_code_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching redeem request:', fetchError)
        throw new Error(`Failed to restore code: ${fetchError.message}`)
      }

      const promoCodeId = request.promo_code_id

      // 2. Delete the request record
      const { error: deleteError } = await supabase
        .from('promo_code_requests')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting redeem request:', deleteError)
        throw new Error(`Failed to restore code: ${deleteError.message}`)
      }

      // 3. Mark the promo code as unused and reset created_at
      const { error: updateError } = await supabase
        .from('promo_codes')
        .update({
          is_used: false,
          created_at: new Date().toISOString()
        })
        .eq('id', promoCodeId)

      if (updateError) {
        console.error('Error updating promo code status:', updateError)
        // Note: The request is already deleted, so we are in a partial state if this fails.
        // But since promo_code_id exists, this should succeed.
        throw new Error(`Failed to update code status: ${updateError.message}`)
      }
    })
  }
}
