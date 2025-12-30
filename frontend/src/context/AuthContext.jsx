import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user profile (including role)
  const loadUserProfile = async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }

    // Create a timeout promise (5 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    })

    try {
      // Race between the fetch and timeout
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) {
        // Set a default profile if there's an error
        setProfile({ id: userId, role: 'user' })
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Profile doesn't exist - create it automatically (handles OAuth signups)
        try {
          // Get current user to access metadata
          const { data: { user: currentUser } } = await supabase.auth.getUser()

          if (currentUser) {
            const metadata = currentUser.user_metadata || {}

            // Create profile with user metadata
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: currentUser.email,
                full_name: metadata.full_name || metadata.name || currentUser.email?.split('@')[0] || '',
                phone: metadata.phone || '',
                role: 'user'
              })
              .select()
              .single()

            if (!insertError && newProfile) {
              setProfile(newProfile)
            } else {
              // Set default profile if insert fails
              setProfile({ id: userId, role: 'user' })
            }
          } else {
            setProfile({ id: userId, role: 'user' })
          }
        } catch (createErr) {
          // Set default profile if profile creation fails
          setProfile({ id: userId, role: 'user' })
        }
      }
    } catch (err) {
      // Set a default profile on error or timeout
      setProfile({ id: userId, role: 'user' })
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadUserProfile(session.user.id)
        }

        setLoading(false)
      } catch (err) {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    return { data, error }
  }

  const signInWithApple = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    updatePassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
