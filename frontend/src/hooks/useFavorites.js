import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to manage user's favorite dishes (M9.1)
 */
export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user's favorites
  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([])
      setFavoriteIds(new Set())
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select(`
          id,
          dish_id,
          created_at,
          dishes (
            id,
            name,
            slug,
            description,
            price,
            image_url,
            is_available,
            stock
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setFavorites(data || [])
      setFavoriteIds(new Set((data || []).map(fav => fav.dish_id)))
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Check if a dish is favorited
  const isFavorite = (dishId) => {
    return favoriteIds.has(dishId)
  }

  // Add dish to favorites
  const addFavorite = async (dishId) => {
    if (!user) {
      throw new Error('You must be logged in to add favorites')
    }

    try {
      const { data, error: insertError } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, dish_id: dishId }])
        .select()
        .single()

      if (insertError) {
        // Check if it's a unique constraint violation
        if (insertError.code === '23505') {
          return { data: null, error: 'Already in favorites' }
        }
        throw insertError
      }

      // Update local state
      setFavoriteIds(prev => new Set([...prev, dishId]))
      await fetchFavorites() // Refresh to get full dish data

      return { data, error: null }
    } catch (err) {
      console.error('Error adding favorite:', err)
      return { data: null, error: err.message }
    }
  }

  // Remove dish from favorites
  const removeFavorite = async (dishId) => {
    if (!user) {
      throw new Error('You must be logged in to remove favorites')
    }

    try {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('dish_id', dishId)

      if (deleteError) throw deleteError

      // Update local state
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(dishId)
        return newSet
      })
      setFavorites(prev => prev.filter(fav => fav.dish_id !== dishId))

      return { error: null }
    } catch (err) {
      console.error('Error removing favorite:', err)
      return { error: err.message }
    }
  }

  // Toggle favorite status
  const toggleFavorite = async (dishId) => {
    if (isFavorite(dishId)) {
      return await removeFavorite(dishId)
    } else {
      return await addFavorite(dishId)
    }
  }

  // Load favorites on mount and when user changes
  useEffect(() => {
    fetchFavorites()
  }, [user?.id])

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refresh: fetchFavorites
  }
}

/**
 * Hook to get favorite count for a specific dish (optional, for displaying count)
 */
export function useDishFavoriteCount(dishId) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true)

        const { count: favoriteCount, error } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('dish_id', dishId)

        if (error) throw error

        setCount(favoriteCount || 0)
      } catch (err) {
        console.error('Error fetching favorite count:', err)
      } finally {
        setLoading(false)
      }
    }

    if (dishId) {
      fetchCount()
    }
  }, [dishId])

  return { count, loading }
}
