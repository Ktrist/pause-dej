import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook pour gérer les demandes de devis B2B - B2B.2
 */
export function useB2BQuotes() {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchQuotes()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_quote_requests')
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

  const createQuote = async (quoteData) => {
    try {
      const { data, error: createError } = await supabase
        .from('business_quote_requests')
        .insert([quoteData])
        .select()
        .single()

      if (createError) throw createError

      await fetchQuotes()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating quote:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,
    createQuote
  }
}

/**
 * Hook pour gérer les packages B2B - B2B.5
 */
export function useB2BPackages() {
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

      console.log('🔍 Fetching packages for public B2B page...')

      const { data, error: fetchError } = await supabase
        .from('business_pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_per_person', { ascending: true })

      if (fetchError) throw fetchError

      console.log('✅ Public B2B packages fetched:', data?.length, data)
      setPackages(data || [])
    } catch (err) {
      console.error('❌ Error fetching B2B packages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages
  }
}

/**
 * Hook pour gérer le compte B2B de l'utilisateur - B2B.3
 */
export function useB2BAccount() {
  const { user } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchAccount()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchAccount = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_accounts')
        .select('*')
        .eq('manager_user_id', user.id)
        .maybeSingle()

      if (fetchError) throw fetchError

      setAccount(data)
    } catch (err) {
      console.error('Error fetching B2B account:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    account,
    loading,
    error,
    refetch: fetchAccount,
    isB2BCustomer: !!account
  }
}

/**
 * Hook pour gérer les membres d'équipe B2B - B2B.4
 */
export function useB2BTeam(accountId) {
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (accountId) {
      fetchTeamMembers()
    } else {
      setLoading(false)
    }
  }, [accountId])

  const fetchTeamMembers = async () => {
    if (!accountId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_employees')
        .select(`
          *,
          user:user_id (
            full_name,
            email
          )
        `)
        .eq('business_id', accountId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setTeamMembers(data || [])
    } catch (err) {
      console.error('Error fetching team members:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addTeamMember = async (memberData) => {
    try {
      const { data, error: addError } = await supabase
        .from('business_employees')
        .insert([{ ...memberData, business_id: accountId }])
        .select()
        .single()

      if (addError) throw addError

      await fetchTeamMembers()
      return { data, error: null }
    } catch (err) {
      console.error('Error adding team member:', err)
      return { data: null, error: err.message }
    }
  }

  const updateTeamMember = async (memberId, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('business_employees')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchTeamMembers()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating team member:', err)
      return { data: null, error: err.message }
    }
  }

  const removeTeamMember = async (memberId) => {
    try {
      const { error: deleteError } = await supabase
        .from('business_employees')
        .delete()
        .eq('id', memberId)

      if (deleteError) throw deleteError

      await fetchTeamMembers()
      return { error: null }
    } catch (err) {
      console.error('Error removing team member:', err)
      return { error: err.message }
    }
  }

  return {
    teamMembers,
    loading,
    error,
    refetch: fetchTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember
  }
}
