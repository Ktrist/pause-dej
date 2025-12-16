import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook for managing promo codes (admin)
 */
export const useAdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPromoCodes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setPromoCodes(data || [])
    } catch (err) {
      console.error('Error fetching promo codes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const createPromoCode = async (promoData) => {
    try {
      const { data, error: createError } = await supabase
        .from('promo_codes')
        .insert([{
          ...promoData,
          times_used: 0
        }])
        .select()
        .single()

      if (createError) throw createError

      setPromoCodes(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating promo code:', err)
      return { data: null, error: err.message }
    }
  }

  const updatePromoCode = async (id, promoData) => {
    try {
      const { data, error: updateError } = await supabase
        .from('promo_codes')
        .update(promoData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setPromoCodes(prev =>
        prev.map(promo => (promo.id === id ? data : promo))
      )
      return { data, error: null }
    } catch (err) {
      console.error('Error updating promo code:', err)
      return { data: null, error: err.message }
    }
  }

  const deletePromoCode = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setPromoCodes(prev => prev.filter(promo => promo.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting promo code:', err)
      return { error: err.message }
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      const { data, error: toggleError } = await supabase
        .from('promo_codes')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (toggleError) throw toggleError

      setPromoCodes(prev =>
        prev.map(promo => (promo.id === id ? data : promo))
      )
      return { data, error: null }
    } catch (err) {
      console.error('Error toggling promo code:', err)
      return { data: null, error: err.message }
    }
  }

  const refresh = () => {
    fetchPromoCodes()
  }

  return {
    promoCodes,
    loading,
    error,
    refresh,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    toggleActive
  }
}
