import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'

interface AuthState {
  readonly userId: string | null
  readonly isLoading: boolean
}

const AuthContext = createContext<AuthState>({
  userId: null,
  isLoading: true,
})

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    userId: null,
    isLoading: true,
  })

  useEffect(() => {
    const signIn = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setState({ userId: session.user.id, isLoading: false })
        return
      }

      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) {
        console.error('Anonymous sign-in failed:', error.message)
        setState({ userId: null, isLoading: false })
        return
      }
      setState({ userId: data.user?.id ?? null, isLoading: false })
    }

    signIn()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        userId: session?.user?.id ?? null,
        isLoading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext value={state}>{children}</AuthContext>
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
