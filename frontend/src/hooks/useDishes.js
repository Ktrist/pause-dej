import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook to fetch all dishes from Supabase
 * @param {Object} options - Fetch options
 * @param {boolean} options.enabled - Whether to fetch data (default: true)
 * @param {string} options.category - Filter by category slug (optional)
 * @param {boolean} options.availableOnly - Fetch only available dishes (default: true)
 * @returns {Object} { dishes, loading, error, refetch }
 */
export function useDishes({ enabled = true, category = null, availableOnly = true } = {}) {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDishes = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('dishes')
        .select(`
          *,
          category:categories(id, name, slug)
        `)

      // Filter by availability
      if (availableOnly) {
        query = query.eq('is_available', true)
      }

      // Filter by category if provided
      if (category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single()

        if (categoryData) {
          query = query.eq('category_id', categoryData.id)
        }
      }

      // Order by name
      query = query.order('name', { ascending: true })

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Transform data to match mockData format
      const transformedDishes = data.map(dish => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        longDescription: dish.long_description,
        price: parseFloat(dish.price),
        image: dish.image_url,
        category: dish.category?.slug || '',
        categoryLabel: dish.category?.name || '',
        stock: dish.stock,
        isPopular: dish.is_popular,
        allergens: dish.allergens || [],
        nutritionInfo: {
          calories: dish.calories,
          protein: dish.protein,
          carbs: dish.carbs,
          fat: dish.fat
        },
        vegetarian: dish.is_vegetarian,
        vegan: dish.is_vegan
      }))

      setDishes(transformedDishes)
    } catch (err) {
      console.error('Error fetching dishes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (enabled) {
      fetchDishes()
    }
  }, [enabled, category, availableOnly])

  return {
    dishes,
    loading,
    error,
    refetch: fetchDishes
  }
}

/**
 * Hook to fetch a single dish by ID
 * @param {string|number} dishId - Dish ID
 * @returns {Object} { dish, loading, error }
 */
export function useDish(dishId) {
  const [dish, setDish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!dishId) {
      setLoading(false)
      return
    }

    const fetchDish = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('dishes')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .eq('id', dishId)
          .single()

        if (fetchError) throw fetchError

        // Transform data
        const transformedDish = {
          id: data.id,
          name: data.name,
          description: data.description,
          longDescription: data.long_description,
          price: parseFloat(data.price),
          image: data.image_url,
          category: data.category?.slug || '',
          categoryLabel: data.category?.name || '',
          stock: data.stock,
          isPopular: data.is_popular,
          allergens: data.allergens || [],
          nutritionInfo: {
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat
          },
          vegetarian: data.is_vegetarian,
          vegan: data.is_vegan
        }

        setDish(transformedDish)
      } catch (err) {
        console.error('Error fetching dish:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDish()
  }, [dishId])

  return { dish, loading, error }
}

/**
 * Hook to fetch popular dishes
 * @param {number} limit - Number of dishes to fetch (default: 6)
 * @returns {Object} { dishes, loading, error }
 */
export function usePopularDishes(limit = 6) {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('dishes')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .eq('is_available', true)
          .eq('is_popular', true)
          .limit(limit)

        if (fetchError) throw fetchError

        // Transform data
        const transformedDishes = data.map(dish => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          longDescription: dish.long_description,
          price: parseFloat(dish.price),
          image: dish.image_url,
          category: dish.category?.slug || '',
          categoryLabel: dish.category?.name || '',
          stock: dish.stock,
          isPopular: dish.is_popular,
          allergens: dish.allergens || [],
          nutritionInfo: {
            calories: dish.calories,
            protein: dish.protein,
            carbs: dish.carbs,
            fat: dish.fat
          },
          vegetarian: dish.is_vegetarian,
          vegan: dish.is_vegan
        }))

        setDishes(transformedDishes)
      } catch (err) {
        console.error('Error fetching popular dishes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularDishes()
  }, [limit])

  return { dishes, loading, error }
}

/**
 * Hook to fetch categories
 * @returns {Object} { categories, loading, error }
 */
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true })

        if (fetchError) throw fetchError

        // Transform data to match mockData format
        const transformedCategories = [
          { id: 'all', name: 'Tous', icon: '🍽️' },
          ...data.map(cat => ({
            id: cat.slug,
            name: cat.name,
            icon: getCategoryIcon(cat.slug)
          }))
        ]

        setCategories(transformedCategories)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

/**
 * Helper function to get category icon
 * @param {string} slug - Category slug
 * @returns {string} Icon emoji
 */
function getCategoryIcon(slug) {
  const icons = {
    'entrees': '🥗',
    'plats': '🍛',
    'salades': '🥙',
    'burgers': '🍔',
    'bowls': '🥗',
    'desserts': '🍰',
    'boissons': '🥤',
    'snacks': '🍿'
  }
  return icons[slug] || '🍽️'
}
