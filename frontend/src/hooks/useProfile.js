import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to manage user profile including dietary preferences - M9.2
 */
export function useProfile() {
  const { user, profile: authProfile, loading: authLoading } = useAuth()

  // Just return the profile from AuthContext - no need to fetch again
  // AuthContext already loads the profile
  return {
    profile: authProfile,
    loading: authLoading,
    error: null,
    refetch: async () => {
      // Reload would happen via auth context
      console.log('Profile refetch not implemented - managed by AuthContext')
    },
    updateProfile: async (updates) => {
      if (!user) return { data: null, error: 'Not authenticated' }

      try {
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .maybeSingle()

        if (updateError) throw updateError

        return { data, error: null }
      } catch (err) {
        console.error('Error updating profile:', err)
        return { data: null, error: err.message }
      }
    },
    updateDietaryPreferences: async (preferences) => {
      if (!user) return { data: null, error: 'Not authenticated' }

      try {
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({ dietary_preferences: preferences })
          .eq('id', user.id)
          .select()
          .maybeSingle()

        if (updateError) throw updateError

        return { data, error: null }
      } catch (err) {
        console.error('Error updating dietary preferences:', err)
        return { data: null, error: err.message }
      }
    },
    addDietaryPreference: async (preference) => {
      if (!authProfile) return { data: null, error: 'Profile not loaded' }

      const currentPreferences = authProfile.dietary_preferences || []
      if (currentPreferences.includes(preference)) {
        return { data: authProfile, error: null } // Already exists
      }

      const newPreferences = [...currentPreferences, preference]

      try {
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({ dietary_preferences: newPreferences })
          .eq('id', user.id)
          .select()
          .maybeSingle()

        if (updateError) throw updateError

        return { data, error: null }
      } catch (err) {
        console.error('Error adding dietary preference:', err)
        return { data: null, error: err.message }
      }
    },
    removeDietaryPreference: async (preference) => {
      if (!authProfile) return { data: null, error: 'Profile not loaded' }

      const currentPreferences = authProfile.dietary_preferences || []
      const newPreferences = currentPreferences.filter(p => p !== preference)

      try {
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({ dietary_preferences: newPreferences })
          .eq('id', user.id)
          .select()
          .maybeSingle()

        if (updateError) throw updateError

        return { data, error: null }
      } catch (err) {
        console.error('Error removing dietary preference:', err)
        return { data: null, error: err.message }
      }
    },
    toggleDietaryPreference: async (preference) => {
      if (!authProfile) return { data: null, error: 'Profile not loaded' }

      const currentPreferences = authProfile.dietary_preferences || []
      const newPreferences = currentPreferences.includes(preference)
        ? currentPreferences.filter(p => p !== preference)
        : [...currentPreferences, preference]

      try {
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({ dietary_preferences: newPreferences })
          .eq('id', user.id)
          .select()
          .maybeSingle()

        if (updateError) throw updateError

        return { data, error: null }
      } catch (err) {
        console.error('Error toggling dietary preference:', err)
        return { data: null, error: err.message }
      }
    },
    dietaryPreferences: authProfile?.dietary_preferences || []
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
