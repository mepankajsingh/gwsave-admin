import React, { useEffect, useState } from 'react'
import { BarChart3, Users, Globe, Package, CheckCircle, DollarSign } from 'lucide-react'
import { PromoCodeService } from '../services/promoCodeService'

export function PromoCodeStats() {
  const [stats, setStats] = useState({
    total: 0,
    used: 0,
    available: 0,
    verified: 0,
    monthlyRevenue: 0,
    byType: {} as Record<string, number>,
    byRegion: {} as Record<string, number>
  })
  const [loading, setLoading] = useState(false)

  // Load stats when component mounts
  useEffect(() => {
    loadStats()
  }, [])

  // Listen for promo code updates
  useEffect(() => {
    const handlePromoCodesUpdated = () => {
      loadStats()
    }

    window.addEventListener('promoCodesUpdated', handlePromoCodesUpdated)

    return () => {
      window.removeEventListener('promoCodesUpdated', handlePromoCodesUpdated)
    }
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await PromoCodeService.getPromoCodeStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
      // Reset stats on error
      setStats({
        total: 0,
        used: 0,
        available: 0,
        verified: 0,
        monthlyRevenue: 0,
        byType: {},
        byRegion: {}
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = () => {
    setLoading(true)
    loadStats()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Statistics</h2>
        </div>
        <button
          onClick={refreshStats}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Codes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Used</p>
              <p className="text-2xl font-bold text-red-600">{stats.used}</p>
            </div>
            <Users className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usage Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total > 0 ? Math.round((stats.used / stats.total) * 100) : 0}%
              </p>
            </div>
            <Globe className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified Codes</p>
              <p className="text-2xl font-bold text-teal-600">{stats.verified}</p>
            </div>
            <div className="p-2 bg-teal-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-teal-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-amber-600">${stats.monthlyRevenue}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-full">
              <DollarSign className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">By Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 h-2">
                    <div
                      className="bg-blue-600 h-2 transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">By Region</h3>
          <div className="space-y-3">
            {Object.entries(stats.byRegion).map(([region, count]) => (
              <div key={region} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{region}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 h-2">
                    <div
                      className="bg-green-600 h-2 transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
