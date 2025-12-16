import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Recommendations Hook
 * Generates and manages personalized dish recommendations
 */
export function useRecommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastGenerated, setLastGenerated] = useState(null)

  // Generate recommendations by calling Edge Function
  const generateRecommendations = useCallback(async () => {
    if (!user) {
      setRecommendations([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke(
        'generate-recommendations',
        {
          body: { user_id: user.id }
        }
      )

      if (functionError) throw functionError

      if (data?.recommendations) {
        // Fetch full dish details for each recommendation
        const dishIds = data.recommendations.map((r) => r.id)

        const { data: dishes, error: dishesError } = await supabase
          .from('dishes')
          .select(`
            id,
            name,
            description,
            price,
            image_url,
            category_id,
            is_available,
            tags
          `)
          .in('id', dishIds)

        if (dishesError) throw dishesError

        // Merge recommendation data with full dish details
        const enrichedRecommendations = data.recommendations.map((rec) => {
          const dish = dishes?.find(d => d.id === rec.id)
          return {
            ...dish,
            recommendation_score: rec.recommendation_score,
            reason: rec.reason
          }
        })

        setRecommendations(enrichedRecommendations)
        setLastGenerated(new Date(data.generated_at))
      }
    } catch (err) {
      console.error('Error generating recommendations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Auto-generate on mount and when user changes
  useEffect(() => {
    if (user) {
      generateRecommendations()
    } else {
      setRecommendations([])
    }
  }, [user, generateRecommendations])

  return {
    recommendations,
    loading,
    error,
    lastGenerated,
    refresh: generateRecommendations
  }
}

/**
 * Similar Dishes Hook
 * Get dishes similar to a specific dish
 */
export function useSimilarDishes(dishId, limit = 6) {
  const [similarDishes, setSimilarDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSimilarDishes = async () => {
      if (!dishId) {
        setSimilarDishes([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get the current dish
        const { data: currentDish, error: dishError } = await supabase
          .from('dishes')
          .select('id, category_id, tags, price')
          .eq('id', dishId)
          .single()

        if (dishError) throw dishError

        // Get dishes from same category
        const { data: dishes, error: dishesError } = await supabase
          .from('dishes')
          .select(`
            id,
            name,
            description,
            price,
            image_url,
            category_id,
            is_available,
            tags
          `)
          .eq('category_id', currentDish.category_id)
          .eq('is_available', true)
          .neq('id', dishId)
          .limit(limit * 2) // Get more to filter later

        if (dishesError) throw dishesError

        // Score and sort by similarity
        const scored = dishes?.map(dish => {
          let score = 1 // Base score

          // Tags match
          const currentTags = currentDish.tags || []
          const dishTags = dish.tags || []
          const commonTags = currentTags.filter(tag => dishTags.includes(tag))
          score += (commonTags.length / Math.max(currentTags.length, dishTags.length, 1)) * 5

          // Price similarity
          const priceDiff = Math.abs(dish.price - currentDish.price)
          if (priceDiff < 2) score += 3
          else if (priceDiff < 5) score += 1

          return { ...dish, similarity_score: score }
        }) || []

        // Sort by score and take top N
        scored.sort((a, b) => b.similarity_score - a.similarity_score)
        setSimilarDishes(scored.slice(0, limit))
      } catch (err) {
        console.error('Error fetching similar dishes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarDishes()
  }, [dishId, limit])

  return {
    similarDishes,
    loading,
    error
  }
}

/**
 * Trending Dishes Hook
 * Get currently popular dishes based on recent orders
 */
export function useTrendingDishes(limit = 8) {
  const [trendingDishes, setTrendingDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrendingDishes = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get orders from last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: recentOrders, error: ordersError } = await supabase
          .from('orders')
          .select('order_items(dish_id, quantity)')
          .eq('status', 'delivered')
          .gte('created_at', sevenDaysAgo.toISOString())

        if (ordersError) throw ordersError

        // Count dish occurrences
        const dishCounts = {}
        recentOrders?.forEach(order => {
          order.order_items?.forEach(item => {
            dishCounts[item.dish_id] = (dishCounts[item.dish_id] || 0) + item.quantity
          })
        })

        // Get top dishes
        const sortedDishes = Object.entries(dishCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([dishId]) => dishId)

        if (sortedDishes.length === 0) {
          // If no recent orders, get random popular dishes
          const { data: randomDishes, error: randomError } = await supabase
            .from('dishes')
            .select(`
              id,
              name,
              description,
              price,
              image_url,
              category_id,
              is_available
            `)
            .eq('is_available', true)
            .limit(limit)

          if (randomError) throw randomError

          setTrendingDishes(randomDishes || [])
          return
        }

        // Fetch full dish details
        const { data: dishes, error: dishesError } = await supabase
          .from('dishes')
          .select(`
            id,
            name,
            description,
            price,
            image_url,
            category_id,
            is_available
          `)
          .in('id', sortedDishes)

        if (dishesError) throw dishesError

        // Sort dishes by original order
        const orderedDishes = sortedDishes
          .map(id => dishes?.find(d => d.id === id))
          .filter(Boolean)

        setTrendingDishes(orderedDishes)
      } catch (err) {
        console.error('Error fetching trending dishes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingDishes()
  }, [limit])

  return {
    trendingDishes,
    loading,
    error
  }
}

/**
 * New Dishes Hook
 * Get recently added dishes
 */
export function useNewDishes(limit = 6) {
  const [newDishes, setNewDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNewDishes = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('dishes')
          .select(`
            id,
            name,
            description,
            price,
            image_url,
            category_id,
            is_available,
            created_at
          `)
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (fetchError) throw fetchError

        setNewDishes(data || [])
      } catch (err) {
        console.error('Error fetching new dishes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNewDishes()
  }, [limit])

  return {
    newDishes,
    loading,
    error
  }
}
