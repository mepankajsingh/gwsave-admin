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

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const isAdmin = await this.verifyUserIsAdmin(session.user.email!)
        if (isAdmin) {
          this.user = this.mapSupabaseUserToGoogleUser(session.user)
        } else {
          this.user = null
          await supabase.auth.signOut()
        }
      } else {
        this.user = null
      }
      this.notifyListeners()
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
      // Attempt to sign in with Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
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
