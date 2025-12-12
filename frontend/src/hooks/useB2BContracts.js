import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook pour gérer les contrats B2B (client) - B2B.8
 */
export function useB2BContracts(accountId) {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (accountId) {
      fetchContracts()

      // Subscribe to contract changes
      const subscription = supabase
        .channel('b2b_contract_documents_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'b2b_contract_documents',
            filter: `b2b_account_id=eq.${accountId}`
          },
          () => {
            fetchContracts()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } else {
      setLoading(false)
    }
  }, [accountId])

  const fetchContracts = async () => {
    if (!accountId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('b2b_contract_documents')
        .select('*')
        .eq('b2b_account_id', accountId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setContracts(data || [])
    } catch (err) {
      console.error('Error fetching contracts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Get contract statistics
  const getContractStats = () => {
    const active = contracts.filter(c => c.is_active).length
    const expiring = contracts.filter(c => {
      if (!c.expiry_date || !c.is_active) return false
      const daysUntilExpiry = Math.ceil((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30
    }).length
    const expired = contracts.filter(c => {
      if (!c.expiry_date) return false
      return new Date(c.expiry_date) < new Date()
    }).length

    return { total: contracts.length, active, expiring, expired }
  }

  return {
    contracts,
    loading,
    error,
    refetch: fetchContracts,
    stats: getContractStats()
  }
}

/**
 * Hook pour gérer les contrats B2B (admin) - B2B.8
 */
export function useAdminB2BContracts(accountId = null) {
  const { user } = useAuth()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchContracts()

    // Subscribe to all contract changes
    const subscription = supabase
      .channel('admin_b2b_contract_documents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'b2b_contract_documents'
        },
        () => {
          fetchContracts()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [accountId])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('b2b_contract_documents')
        .select(`
          *,
          account:b2b_account_id (
            company_name,
            user:user_id (
              full_name,
              email
            )
          ),
          uploader:uploaded_by (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      // Filter by account if specified
      if (accountId) {
        query = query.eq('b2b_account_id', accountId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setContracts(data || [])
    } catch (err) {
      console.error('Error fetching admin contracts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createContract = async (contractData) => {
    try {
      const { data, error: createError } = await supabase
        .from('b2b_contract_documents')
        .insert([{
          ...contractData,
          uploaded_by: user?.id
        }])
        .select()
        .single()

      if (createError) throw createError

      await fetchContracts()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating contract:', err)
      return { data: null, error: err.message }
    }
  }

  const updateContract = async (contractId, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('b2b_contract_documents')
        .update(updates)
        .eq('id', contractId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchContracts()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating contract:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteContract = async (contractId) => {
    try {
      const { error: deleteError } = await supabase
        .from('b2b_contract_documents')
        .delete()
        .eq('id', contractId)

      if (deleteError) throw deleteError

      await fetchContracts()
      return { error: null }
    } catch (err) {
      console.error('Error deleting contract:', err)
      return { error: err.message }
    }
  }

  const toggleContractActive = async (contractId, isActive) => {
    return await updateContract(contractId, { is_active: !isActive })
  }

  // Upload contract document to Supabase Storage
  const uploadContractFile = async (file, accountId) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${accountId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `contracts/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('b2b-documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('b2b-documents')
        .getPublicUrl(filePath)

      return {
        url: urlData.publicUrl,
        path: filePath,
        error: null
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      return {
        url: null,
        path: null,
        error: err.message
      }
    }
  }

  // Get contract statistics
  const getContractStats = () => {
    const total = contracts.length
    const active = contracts.filter(c => c.is_active).length
    const expiringSoon = contracts.filter(c => {
      if (!c.expiry_date || !c.is_active) return false
      const daysUntilExpiry = Math.ceil((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30
    }).length
    const expired = contracts.filter(c => {
      if (!c.expiry_date) return false
      return new Date(c.expiry_date) < new Date()
    }).length

    const byType = {
      contract: contracts.filter(c => c.document_type === 'contract').length,
      amendment: contracts.filter(c => c.document_type === 'amendment').length,
      terms: contracts.filter(c => c.document_type === 'terms').length,
      nda: contracts.filter(c => c.document_type === 'nda').length,
      other: contracts.filter(c => c.document_type === 'other').length
    }

    return { total, active, expiringSoon, expired, byType }
  }

  return {
    contracts,
    loading,
    error,
    refetch: fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    toggleContractActive,
    uploadContractFile,
    stats: getContractStats()
  }
}
