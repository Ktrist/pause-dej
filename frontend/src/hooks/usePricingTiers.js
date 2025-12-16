import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook to fetch B2B pricing tiers
 */
export const usePricingTiers = () => {
  const [pricingTiers, setPricingTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPricingTiers()
  }, [])

  const fetchPricingTiers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      setPricingTiers(data || [])
    } catch (err) {
      console.error('Error fetching pricing tiers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    pricingTiers,
    loading,
    error,
    refresh: fetchPricingTiers
  }
}
