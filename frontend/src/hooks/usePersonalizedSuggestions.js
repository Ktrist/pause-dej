import { useState, useEffect, useMemo } from 'react'
import { useDishes } from './useDishes'
import { useFavorites } from './useFavorites'
import { useProfile } from './useProfile'
import { useOrders } from './useOrders'
import { useAuth } from '../context/AuthContext'

/**
 * Hook for personalized dish recommendations - M9.3
 *
 * Recommendation algorithm based on:
 * 1. User's favorites (dishes they've liked)
 * 2. Order history (dishes they've ordered before)
 * 3. Dietary preferences (dishes matching their restrictions)
 * 4. Popular dishes in same categories as favorites
 * 5. Similar price range to their usual orders
 */
export function usePersonalizedSuggestions(limit = 8) {
  const { user } = useAuth()
  const { dishes: allDishes, loading: loadingDishes } = useDishes()
  const { favorites, loading: loadingFavorites } = useFavorites()
  const { dietaryPreferences, loading: loadingProfile } = useProfile()
  const { orders, loading: loadingOrders } = useOrders()

  const loading = loadingDishes || loadingFavorites || loadingProfile || loadingOrders

  // Calculate personalized suggestions
  const suggestions = useMemo(() => {
    if (!user || loading || allDishes.length === 0) {
      // For non-logged users, return popular dishes
      return allDishes
        .filter(dish => dish.isPopular && dish.stock > 0)
        .slice(0, limit)
    }

    // Get favorite dish IDs
    const favoriteDishIds = favorites.map(fav => fav.dish_id)

    // Get ordered dish IDs and calculate frequency
    const orderedDishes = {}
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        orderedDishes[item.dish_id] = (orderedDishes[item.dish_id] || 0) + item.quantity
      })
    })

    // Get categories from favorites
    const favoriteCategories = new Set(
      favorites
        .map(fav => fav.dishes?.category_id)
        .filter(Boolean)
    )

    // Calculate average price from orders
    const orderedPrices = orders.flatMap(order =>
      order.order_items?.map(item => item.dish_price) || []
    )
    const avgOrderPrice = orderedPrices.length > 0
      ? orderedPrices.reduce((sum, price) => sum + price, 0) / orderedPrices.length
      : null

    // Score each dish
    const scoredDishes = allDishes
      .filter(dish => dish.stock > 0) // Only in-stock dishes
      .map(dish => {
        let score = 0
        const reasons = []

        // Already favorited? Skip it
        if (favoriteDishIds.includes(dish.id)) {
          return { dish, score: -1, reasons }
        }

        // Already ordered frequently? Lower priority
        const orderCount = orderedDishes[dish.id] || 0
        if (orderCount > 0) {
          score -= orderCount * 2 // Lower score for frequently ordered
        }

        // Dietary preferences match (HIGH PRIORITY)
        if (dietaryPreferences.length > 0 && dish.dietaryTags?.length > 0) {
          const matchingTags = dietaryPreferences.filter(pref =>
            dish.dietaryTags.includes(pref)
          )
          if (matchingTags.length === dietaryPreferences.length) {
            // Matches ALL preferences
            score += 50
            reasons.push('Correspond à vos préférences')
          } else if (matchingTags.length > 0) {
            // Matches SOME preferences
            score += matchingTags.length * 10
          }
        }

        // Same category as favorites
        if (favoriteCategories.has(dish.category)) {
          score += 20
          reasons.push('Même catégorie que vos favoris')
        }

        // Similar price range to usual orders
        if (avgOrderPrice !== null) {
          const priceDiff = Math.abs(dish.price - avgOrderPrice)
          if (priceDiff < 2) {
            score += 15
            reasons.push('Dans votre budget habituel')
          } else if (priceDiff < 5) {
            score += 5
          }
        }

        // Popular dish bonus
        if (dish.isPopular) {
          score += 10
          reasons.push('Très populaire')
        }

        // New dish bonus (if we had a created_at field)
        // score += dish.isNew ? 5 : 0

        return { dish, score, reasons }
      })
      .filter(item => item.score > 0) // Only positive scores
      .sort((a, b) => b.score - a.score) // Highest score first
      .slice(0, limit)
      .map(item => ({
        ...item.dish,
        recommendationReasons: item.reasons,
        recommendationScore: item.score
      }))

    // If not enough personalized suggestions, fill with popular dishes
    if (scoredDishes.length < limit) {
      const usedIds = new Set([
        ...favoriteDishIds,
        ...scoredDishes.map(d => d.id)
      ])

      const popularDishes = allDishes
        .filter(dish =>
          dish.isPopular &&
          dish.stock > 0 &&
          !usedIds.has(dish.id)
        )
        .slice(0, limit - scoredDishes.length)
        .map(dish => ({
          ...dish,
          recommendationReasons: ['Très populaire'],
          recommendationScore: 10
        }))

      return [...scoredDishes, ...popularDishes]
    }

    return scoredDishes
  }, [allDishes, favorites, dietaryPreferences, orders, user, loading, limit])

  return {
    suggestions,
    loading,
    hasPersonalizedSuggestions: user && suggestions.length > 0 && suggestions.some(s => s.recommendationScore > 10)
  }
}

/**
 * Hook to get similar dishes to a specific dish
 */
export function useSimilarDishes(dishId, limit = 4) {
  const { dishes: allDishes, loading } = useDishes()

  const similarDishes = useMemo(() => {
    if (!dishId || loading || allDishes.length === 0) return []

    const targetDish = allDishes.find(d => d.id === dishId)
    if (!targetDish) return []

    return allDishes
      .filter(dish =>
        dish.id !== dishId &&
        dish.stock > 0 &&
        (
          // Same category
          dish.category === targetDish.category ||
          // Similar price range (±30%)
          Math.abs(dish.price - targetDish.price) < targetDish.price * 0.3 ||
          // Shares dietary tags
          (dish.dietaryTags?.some(tag => targetDish.dietaryTags?.includes(tag)))
        )
      )
      .slice(0, limit)
  }, [allDishes, dishId, loading, limit])

  return {
    similarDishes,
    loading
  }
}
