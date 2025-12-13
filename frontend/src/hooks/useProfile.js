import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to manage user profile including dietary preferences - M9.2
 */
export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setLoading(false)
      setProfile(null)
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { data: null, error: 'Not authenticated' }

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      console.error('Error updating profile:', err)
      return { data: null, error: err.message }
    }
  }

  const updateDietaryPreferences = async (preferences) => {
    return await updateProfile({ dietary_preferences: preferences })
  }

  const addDietaryPreference = async (preference) => {
    if (!profile) return { data: null, error: 'Profile not loaded' }

    const currentPreferences = profile.dietary_preferences || []
    if (currentPreferences.includes(preference)) {
      return { data: profile, error: null } // Already exists
    }

    const newPreferences = [...currentPreferences, preference]
    return await updateDietaryPreferences(newPreferences)
  }

  const removeDietaryPreference = async (preference) => {
    if (!profile) return { data: null, error: 'Profile not loaded' }

    const currentPreferences = profile.dietary_preferences || []
    const newPreferences = currentPreferences.filter(p => p !== preference)
    return await updateDietaryPreferences(newPreferences)
  }

  const toggleDietaryPreference = async (preference) => {
    if (!profile) return { data: null, error: 'Profile not loaded' }

    const currentPreferences = profile.dietary_preferences || []
    if (currentPreferences.includes(preference)) {
      return await removeDietaryPreference(preference)
    } else {
      return await addDietaryPreference(preference)
    }
  }

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    updateDietaryPreferences,
    addDietaryPreference,
    removeDietaryPreference,
    toggleDietaryPreference,
    dietaryPreferences: profile?.dietary_preferences || []
  }
}

/**
 * Available dietary preferences
 */
export const DIETARY_PREFERENCES = [
  { value: 'vegetarian', label: 'Végétarien', icon: '🥗', description: 'Sans viande ni poisson' },
  { value: 'vegan', label: 'Vegan', icon: '🌱', description: 'Sans produits animaux' },
  { value: 'gluten-free', label: 'Sans gluten', icon: '🌾', description: 'Sans blé, orge, seigle' },
  { value: 'dairy-free', label: 'Sans lactose', icon: '🥛', description: 'Sans produits laitiers' },
  { value: 'nut-free', label: 'Sans fruits à coque', icon: '🥜', description: 'Sans noix, noisettes, amandes' },
  { value: 'halal', label: 'Halal', icon: '☪️', description: 'Conforme aux règles islamiques' },
  { value: 'kosher', label: 'Casher', icon: '✡️', description: 'Conforme aux règles juives' },
  { value: 'pescatarian', label: 'Pescétarien', icon: '🐟', description: 'Poisson mais pas de viande' }
]

/**
 * Get preference label by value
 */
export function getPreferenceLabel(value) {
  const pref = DIETARY_PREFERENCES.find(p => p.value === value)
  return pref ? pref.label : value
}

/**
 * Get preference icon by value
 */
export function getPreferenceIcon(value) {
  const pref = DIETARY_PREFERENCES.find(p => p.value === value)
  return pref ? pref.icon : '🍽️'
}
