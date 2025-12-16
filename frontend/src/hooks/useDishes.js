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
        .select('*')

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

      // Fetch all categories to map category_id to category info
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug')

      if (categoriesError) throw categoriesError

      // Create a map of category_id to category info
      const categoryMap = {}
      categories?.forEach(cat => {
        categoryMap[cat.id] = { name: cat.name, slug: cat.slug }
      })

      // Transform data to match mockData format
      const transformedDishes = data.map(dish => {
        const categoryInfo = dish.category_id ? categoryMap[dish.category_id] : null
        return {
          id: dish.id,
          name: dish.name,
          description: dish.description,
          longDescription: dish.long_description,
          price: parseFloat(dish.price),
          image: dish.image_url,
          category: categoryInfo?.slug || '',
          categoryLabel: categoryInfo?.name || '',
          stock: dish.stock,
          isPopular: dish.is_popular,
          allergens: dish.allergens || [],
          dietaryTags: dish.dietary_tags || [], // M9.2 - Dietary preferences
          averageRating: dish.average_rating || 0, // Reviews system
          reviewCount: dish.review_count || 0, // Reviews system
          nutritionInfo: {
            calories: dish.calories,
            protein: dish.protein,
            carbs: dish.carbs,
            fat: dish.fat
          },
          vegetarian: dish.is_vegetarian,
          vegan: dish.is_vegan
        }
      })

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
          .select('*')
          .eq('id', dishId)
          .single()

        if (fetchError) throw fetchError

        // Fetch category info if category_id exists
        let categoryInfo = null
        if (data.category_id) {
          const { data: category } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('id', data.category_id)
            .single()
          categoryInfo = category
        }

        // Transform data
        const transformedDish = {
          id: data.id,
          name: data.name,
          description: data.description,
          longDescription: data.long_description,
          price: parseFloat(data.price),
          image: data.image_url,
          category: categoryInfo?.slug || '',
          categoryLabel: categoryInfo?.name || '',
          stock: data.stock,
          isPopular: data.is_popular,
          allergens: data.allergens || [],
          dietaryTags: data.dietary_tags || [], // M9.2 - Dietary preferences
          averageRating: data.average_rating || 0, // Reviews system
          reviewCount: data.review_count || 0, // Reviews system
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
          .select('*')
          .eq('is_available', true)
          .eq('is_popular', true)
          .limit(limit)

        if (fetchError) throw fetchError

        // Fetch all categories to map category_id to category info
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug')

        if (categoriesError) throw categoriesError

        // Create a map of category_id to category info
        const categoryMap = {}
        categories?.forEach(cat => {
          categoryMap[cat.id] = { name: cat.name, slug: cat.slug }
        })

        // Transform data
        const transformedDishes = data.map(dish => {
          const categoryInfo = dish.category_id ? categoryMap[dish.category_id] : null
          return {
            id: dish.id,
            name: dish.name,
            description: dish.description,
            longDescription: dish.long_description,
            price: parseFloat(dish.price),
            image: dish.image_url,
            category: categoryInfo?.slug || '',
            categoryLabel: categoryInfo?.name || '',
            stock: dish.stock,
            isPopular: dish.is_popular,
            allergens: dish.allergens || [],
            dietaryTags: dish.dietary_tags || [], // M9.2 - Dietary preferences
            averageRating: dish.average_rating || 0, // Reviews system
            reviewCount: dish.review_count || 0, // Reviews system
            nutritionInfo: {
              calories: dish.calories,
              protein: dish.protein,
              carbs: dish.carbs,
              fat: dish.fat
            },
            vegetarian: dish.is_vegetarian,
            vegan: dish.is_vegan
          }
        })

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
