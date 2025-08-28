import { useState, useEffect } from 'react'
import { AuthState, GoogleUser } from '../types/auth'
import { AuthService } from '../services/authService'

export function useAuth(): AuthState & {
  signIn: () => void
  signOut: () => void
} {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  })

  const authService = AuthService.getInstance()

  useEffect(() => {
    const initializeAuth = async () => {
      await authService.initialize()
      const isAuth = authService.isAuthenticated()
      const currentUser = authService.getCurrentUser()
      
      setState({
        isAuthenticated: isAuth,
        user: currentUser,
        loading: false,
      })
      
      // Dispatch event when auth is ready
      if (isAuth) {
        window.dispatchEvent(new CustomEvent('authReady'))
      }
    }

    initializeAuth()

    const unsubscribe = authService.subscribe((user: GoogleUser | null) => {
      setState({
        isAuthenticated: !!user,
        user,
        loading: false,
      })
      
      // Dispatch event when auth state changes
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: !!user, user } 
      }))
    })

    return unsubscribe
  }, [authService])

  const signIn = async () => {
    return await authService.signIn()
  }

  const signOut = async () => {
    try {
      await authService.signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return {
    ...state,
    signIn,
    signOut,
  }
}
