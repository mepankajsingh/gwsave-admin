import { supabase } from '../lib/supabase'
import { GoogleUser } from '../types/auth'

export class AuthService {
  private static instance: AuthService
  private user: GoogleUser | null = null
  private listeners: ((user: GoogleUser | null) => void)[] = []

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async initialize(): Promise<void> {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      // Verify user is admin
      const isAdmin = await this.verifyUserIsAdmin(session.user.email!)
      if (isAdmin) {
        this.user = this.mapSupabaseUserToGoogleUser(session.user)
      } else {
        // User is not an admin, sign them out
        await supabase.auth.signOut()
      }
    }

    // Listen for auth changes but only log them for debugging
    // We don't want to auto-update state as it causes re-renders on tab switch
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event)

      // Only handle explicit sign out or sign in events if really needed
      // For now, we rely on the initial check to avoid flickering
      if (event === 'SIGNED_OUT') {
        this.user = null
        this.notifyListeners()
      } else if (event === 'SIGNED_IN' && session?.user && !this.user) {
        // Only update if we don't have a user yet
        const isAdmin = await this.verifyUserIsAdmin(session.user.email!)
        if (isAdmin) {
          this.user = this.mapSupabaseUserToGoogleUser(session.user)
          this.notifyListeners()
        }
      }
    })
  }

  private async verifyUserIsAdmin(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('is_admin')
        .eq('email', email)
        .eq('is_admin', true)
        .single()

      if (error) {
        console.error('Error checking admin status:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error verifying admin status:', error)
      return false // Fail closed for security
    }
  }

  private mapSupabaseUserToGoogleUser(supabaseUser: any): GoogleUser {
    const userMetadata = supabaseUser.user_metadata || {}
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: userMetadata.full_name || userMetadata.name || userMetadata.email?.split('@')[0] || '',
      picture: userMetadata.picture || userMetadata.avatar_url || '',
      given_name: userMetadata.given_name || '',
      family_name: userMetadata.family_name || userMetadata.surname || '',
    }
  }

  async signIn(): Promise<{ success: boolean; error?: string }> {
    try {
      // Get redirect URL from env or fallback to current origin
      const redirectUrl = import.meta.env.VITE_GOOGLE_REDIRECT_URL || window.location.origin

      // Attempt to sign in with Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        return {
          success: false,
          error: 'Failed to authenticate with Google. Please try again.'
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      }
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
    this.user = null
    this.notifyListeners()
  }

  getCurrentUser(): GoogleUser | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return this.user !== null
  }

  subscribe(listener: (user: GoogleUser | null) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.user))
  }
}
