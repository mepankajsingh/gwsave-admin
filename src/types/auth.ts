export interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
  given_name: string
  family_name: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: GoogleUser | null
  loading: boolean
}
