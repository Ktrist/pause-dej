import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

/**
 * Calculate similarity score between two dishes based on categories and tags
 */
function calculateSimilarity(dish1: any, dish2: any): number {
  let score = 0

  // Category match
  if (dish1.category_id === dish2.category_id) {
    score += 0.5
  }

  // Tags match (if available)
  const tags1 = dish1.tags || []
  const tags2 = dish2.tags || []
  const commonTags = tags1.filter((tag: string) => tags2.includes(tag))
  score += (commonTags.length / Math.max(tags1.length, tags2.length, 1)) * 0.3

  // Price similarity
  const priceDiff = Math.abs(dish1.price - dish2.price)
  if (priceDiff < 2) score += 0.2
  else if (priceDiff < 5) score += 0.1

  return score
}

/**
 * Get recommendation reason for display
 */
function getRecommendationReason(
  dish: any,
  orderCount: number,
  isFavorite: boolean,
  dietaryPreferences: string[]
): string {
  if (isFavorite) {
    return 'Parmi vos favoris'
  }

  if (orderCount > 5) {
    return 'Un de vos classiques'
  }

  if (orderCount > 0) {
    return 'Vous avez déjà adoré ce plat'
  }

  const dishTags = dish.tags || []
  const matchingPrefs = dietaryPreferences.filter((pref: string) =>
    dishTags.includes(pref)
  )

  if (matchingPrefs.length > 0) {
    return `Compatible avec vos préférences`
  }

  return 'Découvrez ce plat'
}

/**
 * Generate personalized recommendations for a user
 */
async function generateRecommendations(userId: string) {
  // 1. Get user's profile and dietary preferences
  const { data: profileData } = await supabase
    .from('profiles')
    .select('dietary_preferences')
    .eq('user_id', userId)
    .single()

  const dietaryPreferences = profileData?.dietary_preferences || []

  // 2. Get user's order history
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_items(dish_id, quantity)')
    .eq('user_id', userId)
    .eq('status', 'delivered')

  const dishCounts: Record<string, number> = {}
  orders?.forEach(order => {
    order.order_items?.forEach((item: any) => {
      dishCounts[item.dish_id] = (dishCounts[item.dish_id] || 0) + item.quantity
    })
  })

  const orderHistory = Object.entries(dishCounts).map(([dishId, count]) => ({
    dish_id: dishId,
    count: count as number
  }))

  // 3. Get user's favorites
  const { data: favorites } = await supabase
    .from('favorites')
    .select('dish_id')
    .eq('user_id', userId)

  const favoriteDishIds = favorites?.map(f => f.dish_id) || []

  // 4. Get all dishes
  const { data: allDishes } = await supabase
    .from('dishes')
    .select('id, name, category_id, price, is_available, tags')
    .eq('is_available', true)

  if (!allDishes) return []

  // 5. Score each dish
  const scoredDishes = allDishes.map(dish => {
    let score = 0

    // Base score for popular dishes
    score += 1

    // Boost if user has ordered this dish before
    const orderCount = dishCounts[dish.id] || 0
    score += orderCount * 5

    // Boost if dish is in favorites
    if (favoriteDishIds.includes(dish.id)) {
      score += 10
    }

    // Dietary preferences match
    if (dietaryPreferences.length > 0) {
      const dishTags = dish.tags || []
      const matchingPrefs = dietaryPreferences.filter((pref: string) =>
        dishTags.includes(pref)
      )
      score += matchingPrefs.length * 3
    }

    // Similarity to previously ordered dishes
    orderHistory.forEach(({ dish_id, count }) => {
      const previousDish = allDishes.find(d => d.id === dish_id)
      if (previousDish) {
        const similarity = calculateSimilarity(dish, previousDish)
        score += similarity * count
      }
    })

    // Reduce score for dishes already ordered many times (promote discovery)
    if (orderCount > 3) {
      score *= 0.7
    }

    return {
      ...dish,
      recommendation_score: score,
      reason: getRecommendationReason(
        dish,
        orderCount,
        favoriteDishIds.includes(dish.id),
        dietaryPreferences
      )
    }
  })

  // 6. Sort by score and return top recommendations
  scoredDishes.sort((a, b) => b.recommendation_score - a.recommendation_score)

  return scoredDishes.slice(0, 12)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type'
      }
    })
  }

  try {
    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    console.log('Generating recommendations for user:', user_id)

    const recommendations = await generateRecommendations(user_id)

    console.log(`Generated ${recommendations.length} recommendations`)

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        generated_at: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error: any) {
    console.error('Error generating recommendations:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
