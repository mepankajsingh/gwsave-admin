import React, { useEffect, useRef, useState } from 'react'
import { Shield, Database, Settings, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface LoginPageProps {
  onLogin?: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn()
      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Access Required
          </h1>
          <p className="text-gray-600">
            Sign in with your authorized Google account to access the Google Workspace Promo Code Management System.
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Database className="w-4 h-4 text-blue-500" />
                <span>Manage promo codes across all regions</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Settings className="w-4 h-4 text-blue-500" />
                <span>View usage statistics and analytics</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Secure admin-only access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-xs text-yellow-800">
              <strong>Admin Only:</strong> This system requires pre-authorized access. Only users registered by the administrator can log in. Contact your system administrator if you need access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
