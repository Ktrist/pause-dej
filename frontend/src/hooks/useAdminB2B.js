import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook pour gérer les packages B2B (admin) - B2B.5
 */
export function useAdminB2BPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📦 Fetching packages from business_pricing_tiers...')

      const { data, error: fetchError } = await supabase
        .from('business_pricing_tiers')
        .select('*')
        .order('price_per_person', { ascending: true })

      if (fetchError) throw fetchError

      console.log('📦 Fetched packages:', data)
      setPackages(data || [])
    } catch (err) {
      console.error('Error fetching B2B packages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPackage = async (packageData) => {
    try {
      console.log('✨ Creating package:', packageData)

      const { data, error: createError } = await supabase
        .from('business_pricing_tiers')
        .insert([packageData])
        .select()
        .single()

      if (createError) throw createError

      console.log('✨ Package created:', data)
      await fetchPackages()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating package:', err)
      return { data: null, error: err.message }
    }
  }

  const updatePackage = async (packageId, updates) => {
    try {
      console.log('🔄 Updating package:', packageId, updates)

      const { data, error: updateError } = await supabase
        .from('business_pricing_tiers')
        .update(updates)
        .eq('id', packageId)
        .select()
        .single()

      if (updateError) throw updateError

      console.log('🔄 Package updated:', data)
      await fetchPackages()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating package:', err)
      return { data: null, error: err.message }
    }
  }

  const deletePackage = async (packageId) => {
    try {
      console.log('🗑️ Deleting package:', packageId)

      const { error: deleteError } = await supabase
        .from('business_pricing_tiers')
        .delete()
        .eq('id', packageId)

      if (deleteError) throw deleteError

      console.log('🗑️ Package deleted')
      await fetchPackages()
      return { error: null }
    } catch (err) {
      console.error('Error deleting package:', err)
      return { error: err.message }
    }
  }

  const togglePackageActive = async (packageId, isActive) => {
    return await updatePackage(packageId, { is_active: !isActive })
  }

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    togglePackageActive
  }
}

/**
 * Hook pour gérer les demandes de devis B2B (admin)
 */
export function useAdminB2BQuotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('b2b_quote_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setQuotes(data || [])
    } catch (err) {
      console.error('Error fetching B2B quotes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateQuoteStatus = async (quoteId, status, notes = null) => {
    try {
      const updates = { status }
      if (notes !== null) updates.notes = notes

      const { data, error: updateError } = await supabase
        .from('b2b_quote_requests')
        .update(updates)
        .eq('id', quoteId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchQuotes()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating quote status:', err)
      return { data: null, error: err.message }
    }
  }

  const assignQuote = async (quoteId, assignedTo) => {
    try {
      const { data, error: assignError } = await supabase
        .from('b2b_quote_requests')
        .update({ assigned_to: assignedTo })
        .eq('id', quoteId)
        .select()
        .single()

      if (assignError) throw assignError

      await fetchQuotes()
      return { data, error: null }
    } catch (err) {
      console.error('Error assigning quote:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,
    updateQuoteStatus,
    assignQuote
  }
}

/**
 * Hook pour gérer les comptes B2B (admin)
 */
export function useAdminB2BAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('b2b_accounts')
        .select(`
          *,
          user:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setAccounts(data || [])
    } catch (err) {
      console.error('Error fetching B2B accounts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async (accountData) => {
    try {
      const { data, error: createError } = await supabase
        .from('b2b_accounts')
        .insert([accountData])
        .select()
        .single()

      if (createError) throw createError

      await fetchAccounts()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating B2B account:', err)
      return { data: null, error: err.message }
    }
  }

  const updateAccount = async (accountId, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('b2b_accounts')
        .update(updates)
        .eq('id', accountId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchAccounts()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating B2B account:', err)
      return { data: null, error: err.message }
    }
  }

  const updateAccountStatus = async (accountId, status) => {
    return await updateAccount(accountId, { status })
  }

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    updateAccountStatus
  }
}
