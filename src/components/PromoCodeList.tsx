import React, { useEffect, useState } from 'react'
import { Search, Filter, Eye, Calendar } from 'lucide-react'
import { PromoCodeService } from '../services/promoCodeService'
import { PromoCode } from '../lib/supabase'

export function PromoCodeList() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'starter' | 'standard'>('all')
  const [regionFilter, setRegionFilter] = useState<'all' | 'americas' | 'asia-pacific' | 'emea'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'used'>('all')

  // Display mappings for proper case
  const getDisplayType = (type: string) => {
    switch (type) {
      case 'starter': return 'Starter'
      case 'standard': return 'Standard'
      default: return type
    }
  }

  const getDisplayRegion = (region: string) => {
    switch (region) {
      case 'americas': return 'Americas'
      case 'asia-pacific': return 'Asia Pacific'
      case 'emea': return 'EMEA'
      default: return region
    }
  }

  // Load data when component mounts or filters change
  useEffect(() => {
    loadPromoCodes()
  }, [typeFilter, regionFilter, statusFilter])

  // Listen for promo code updates
  useEffect(() => {
    const handlePromoCodesUpdated = () => {
      loadPromoCodes()
    }
    
    window.addEventListener('promoCodesUpdated', handlePromoCodesUpdated)
    
    return () => {
      window.removeEventListener('promoCodesUpdated', handlePromoCodesUpdated)
    }
  }, [])

  const loadPromoCodes = async () => {
    setLoading(true)
    try {
      const data = await PromoCodeService.getPromoCodes(
        typeFilter !== 'all' ? typeFilter : undefined,
        regionFilter !== 'all' ? regionFilter : undefined,
        statusFilter === 'all' ? undefined : statusFilter === 'used'
      )
      setPromoCodes(data)
    } catch (error) {
      console.error('Error loading promo codes:', error)
      setPromoCodes([]) // Clear codes on error
    } finally {
      setLoading(false)
    }
  }

  const filteredCodes = promoCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRegionColor = (region: string) => {
    switch (region) {
      case 'americas': return 'bg-blue-100 text-blue-800'
      case 'asia-pacific': return 'bg-green-100 text-green-800'
      case 'emea': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'starter': return 'bg-orange-100 text-orange-800'
      case 'standard': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Promo Codes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search codes..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="starter">Starter</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Regions</option>
              <option value="americas">Americas</option>
              <option value="asia-pacific">Asia Pacific</option>
              <option value="emea">EMEA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="used">Used</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCodes.length > 0 ? (
          <div className="space-y-2">
            {filteredCodes.map((code) => (
              <div key={code.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {code.code}
                    </code>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(code.type)}`}>
                        {getDisplayType(code.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRegionColor(code.region)}`}>
                        {getDisplayRegion(code.region)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        code.is_used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {code.is_used ? 'Used' : 'Available'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(code.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No promo codes found matching your filters.</p>
          </div>
        )}

        {!loading && filteredCodes.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {filteredCodes.length} of {promoCodes.length} codes
          </div>
        )}
      </div>
    </div>
  )
}
