import React, { useState } from 'react'
import { useEffect } from 'react'
import { Plus, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { PromoCodeService } from '../services/promoCodeService'

// Database values (lowercase)
const DB_TYPES = ['starter', 'standard'] as const
const DB_REGIONS = ['americas', 'asia-pacific', 'emea'] as const

// Display values (proper case)
const DISPLAY_TYPES = { starter: 'Starter', standard: 'Standard' }
const DISPLAY_REGIONS = {
  americas: 'Americas',
  'asia-pacific': 'Asia Pacific',
  emea: 'EMEA'
}

export function PromoCodeForm() {
  const [codes, setCodes] = useState('')
  const [type, setType] = useState<'starter' | 'standard'>('starter')
  const [region, setRegion] = useState<'americas' | 'asia-pacific' | 'emea'>('americas')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: any[], errors: string[] } | null>(null)

  // Clear previous results when component mounts (route change)
  useEffect(() => {
    setResult(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    // Ensure values are lowercase for database storage
    const lowercaseType = type.toLowerCase() as 'starter' | 'standard'
    const lowercaseRegion = region.toLowerCase() as 'americas' | 'asia-pacific' | 'emea'

    console.log('Storing in database:', {
      type: lowercaseType,
      region: lowercaseRegion
    })

    const codeList = codes
      .split('\n')
      .map(code => code.trim())
      .filter(code => code.length > 0)

    if (codeList.length === 0) {
      setResult({ success: [], errors: ['Please enter at least one promo code'] })
      setIsLoading(false)
      return
    }

    try {
      const result = await PromoCodeService.addPromoCodes(codeList, lowercaseType, lowercaseRegion)
      setResult(result)

      if (result.success.length > 0 && result.errors.length === 0) {
        setCodes('')
        // Force refresh of other components that might display promo codes
        window.dispatchEvent(new CustomEvent('promoCodesUpdated'))
      }
    } catch (error) {
      console.error('Form submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add promo codes. Please try again.'
      setResult({ success: [], errors: [errorMessage] })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Add Promo Codes</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'starter' | 'standard')}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {DB_TYPES.map(t => (
                <option key={t} value={t}>{DISPLAY_TYPES[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {DB_REGIONS.map(r => (
                <option key={r} value={r}>{DISPLAY_REGIONS[r]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="codes" className="block text-sm font-medium text-gray-700 mb-2">
            Promo Codes
            <span className="text-gray-500 text-xs ml-2">(one code per line)</span>
          </label>
          <textarea
            id="codes"
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
            placeholder="Enter promo codes, one per line:&#10;WORKSPACE2024&#10;GOOGLE-STARTER-123&#10;PREMIUM-OFFER-456"
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            required
          />
          {codes && (
            <p className="text-xs text-gray-500 mt-1">
              {codes.split('\n').filter(line => line.trim()).length} codes to be added
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !codes.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
              Adding Codes...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Add Promo Codes
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-3">
          {result.success.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800">Success</h3>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Successfully added {result.success.length} promo code(s)
              </p>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-800">Errors</h3>
              </div>
              <ul className="text-red-700 text-sm mt-2 space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
