import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook to fetch all addresses for the current user
 * @returns {Object} { addresses, loading, error, refetch }
 */
export function useAddresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { data, error: fetchError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setAddresses(data || [])
    } catch (err) {
      console.error('Error fetching addresses:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  return {
    addresses,
    loading,
    error,
    refetch: fetchAddresses
  }
}

/**
 * Hook to fetch a single address by ID
 * @param {string} addressId - Address ID
 * @returns {Object} { address, loading, error }
 */
export function useAddress(addressId) {
  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!addressId) {
      setLoading(false)
      return
    }

    const fetchAddress = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', addressId)
          .single()

        if (fetchError) throw fetchError

        setAddress(data)
      } catch (err) {
        console.error('Error fetching address:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAddress()
  }, [addressId])

  return { address, loading, error }
}

/**
 * Hook to get the default address for the current user
 * @returns {Object} { address, loading, error }
 */
export function useDefaultAddress() {
  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Utilisateur non connecté')
        }

        const { data, error: fetchError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is okay
          throw fetchError
        }

        setAddress(data || null)
      } catch (err) {
        console.error('Error fetching default address:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDefaultAddress()
  }, [])

  return { address, loading, error }
}

/**
 * Hook to create a new address
 * @returns {Object} { createAddress, loading, error }
 */
export function useCreateAddress() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createAddress = async (addressData) => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // If this is set as default, unset other defaults first
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      const { data, error: insertError } = await supabase
        .from('addresses')
        .insert([
          {
            ...addressData,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      return { data, error: null }
    } catch (err) {
      console.error('Error creating address:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { createAddress, loading, error }
}

/**
 * Hook to update an existing address
 * @returns {Object} { updateAddress, loading, error }
 */
export function useUpdateAddress() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateAddress = async (addressId, updates) => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // If this is set as default, unset other defaults first
      if (updates.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      const { data, error: updateError } = await supabase
        .from('addresses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      return { data, error: null }
    } catch (err) {
      console.error('Error updating address:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { updateAddress, loading, error }
}

/**
 * Hook to delete an address
 * @returns {Object} { deleteAddress, loading, error }
 */
export function useDeleteAddress() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteAddress = async (addressId) => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      return { error: null }
    } catch (err) {
      console.error('Error deleting address:', err)
      setError(err.message)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { deleteAddress, loading, error }
}
