import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook to manage dishes (admin)
 */
export function useAdminDishes() {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDishes = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('dishes')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setDishes(data || [])
    } catch (err) {
      console.error('Error fetching dishes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDishes()
  }, [])

  const createDish = async (dishData) => {
    try {
      const { data, error: createError } = await supabase
        .from('dishes')
        .insert([dishData])
        .select()
        .single()

      if (createError) throw createError

      setDishes(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating dish:', err)
      return { data: null, error: err.message }
    }
  }

  const updateDish = async (id, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('dishes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setDishes(prev => prev.map(dish => dish.id === id ? data : dish))
      return { data, error: null }
    } catch (err) {
      console.error('Error updating dish:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteDish = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('dishes')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setDishes(prev => prev.filter(dish => dish.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting dish:', err)
      return { error: err.message }
    }
  }

  const toggleAvailability = async (id, isAvailable) => {
    return updateDish(id, { is_available: isAvailable })
  }

  const updateStock = async (id, quantity) => {
    return updateDish(id, { stock: quantity })
  }

  const toggleFeatured = async (id, isFeatured) => {
    return updateDish(id, { is_featured: isFeatured })
  }

  return {
    dishes,
    loading,
    error,
    refresh: fetchDishes,
    createDish,
    updateDish,
    deleteDish,
    toggleAvailability,
    updateStock,
    toggleFeatured
  }
}
