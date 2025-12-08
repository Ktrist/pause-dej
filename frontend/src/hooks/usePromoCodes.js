import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook to fetch all active promo codes
 * @returns {Object} { promoCodes, loading, error, refetch }
 */
export function usePromoCodes() {
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
        .eq('is_active', true)
        .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
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

  return {
    promoCodes,
    loading,
    error,
    refetch: fetchPromoCodes
  }
}

/**
 * Hook to validate and fetch a promo code by code string
 * @param {string} code - Promo code string
 * @returns {Object} { promoCode, loading, error, validate }
 */
export function usePromoCode(code) {
  const [promoCode, setPromoCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validate = async (codeToValidate = code) => {
    try {
      setLoading(true)
      setError(null)
      setPromoCode(null)

      if (!codeToValidate) {
        throw new Error('Code promo requis')
      }

      const { data, error: fetchError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', codeToValidate.toUpperCase())
        .eq('is_active', true)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Code promo invalide')
        }
        throw fetchError
      }

      // Check if code has expired
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        throw new Error('Ce code promo a expiré')
      }

      // Check if code has reached usage limit
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        throw new Error('Ce code promo a atteint sa limite d\'utilisation')
      }

      setPromoCode(data)
      return { data, error: null }
    } catch (err) {
      console.error('Error validating promo code:', err)
      const errorMessage = err.message || 'Code promo invalide'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (code) {
      validate(code)
    }
  }, [code])

  return {
    promoCode,
    loading,
    error,
    validate
  }
}

/**
 * Calculate discount amount based on promo code and order total
 * @param {Object} promoCode - Promo code object
 * @param {number} orderTotal - Order subtotal
 * @returns {number} Discount amount
 */
export function calculateDiscount(promoCode, orderTotal) {
  if (!promoCode) return 0

  // Check minimum order amount
  if (promoCode.min_order_amount && orderTotal < promoCode.min_order_amount) {
    return 0
  }

  let discount = 0

  if (promoCode.discount_type === 'percentage') {
    discount = (orderTotal * promoCode.discount_value) / 100
  } else if (promoCode.discount_type === 'fixed') {
    discount = promoCode.discount_value
  }

  // Apply max discount if set
  if (promoCode.max_discount && discount > promoCode.max_discount) {
    discount = promoCode.max_discount
  }

  // Don't allow discount to exceed order total
  if (discount > orderTotal) {
    discount = orderTotal
  }

  return Number(discount.toFixed(2))
}

/**
 * Hook to increment promo code usage count
 * @returns {Object} { incrementUsage, loading, error }
 */
export function useIncrementPromoCodeUsage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const incrementUsage = async (promoCodeId) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .rpc('increment_promo_code_usage', { promo_code_id: promoCodeId })

      if (updateError) throw updateError

      return { data, error: null }
    } catch (err) {
      console.error('Error incrementing promo code usage:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { incrementUsage, loading, error }
}

/**
 * Hook to create a new promo code (admin only)
 * @returns {Object} { createPromoCode, loading, error }
 */
export function useCreatePromoCode() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createPromoCode = async (promoCodeData) => {
    try {
      setLoading(true)
      setError(null)

      // Ensure code is uppercase
      const dataToInsert = {
        ...promoCodeData,
        code: promoCodeData.code.toUpperCase()
      }

      const { data, error: insertError } = await supabase
        .from('promo_codes')
        .insert([dataToInsert])
        .select()
        .single()

      if (insertError) throw insertError

      return { data, error: null }
    } catch (err) {
      console.error('Error creating promo code:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { createPromoCode, loading, error }
}

/**
 * Hook to deactivate a promo code (admin only)
 * @returns {Object} { deactivatePromoCode, loading, error }
 */
export function useDeactivatePromoCode() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deactivatePromoCode = async (promoCodeId) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('promo_codes')
        .update({ is_active: false })
        .eq('id', promoCodeId)
        .select()
        .single()

      if (updateError) throw updateError

      return { data, error: null }
    } catch (err) {
      console.error('Error deactivating promo code:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { deactivatePromoCode, loading, error }
}
