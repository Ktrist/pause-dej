import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to fetch reviews for a specific dish
 */
export function useDishReviews(dishId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })

  const fetchReviews = async () => {
    if (!dishId) {
      setReviews([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch reviews
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('dish_id', dishId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setReviews(data || [])

      // Calculate stats
      if (data && data.length > 0) {
        const total = data.length
        const sum = data.reduce((acc, review) => acc + review.rating, 0)
        const avg = sum / total

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        data.forEach(review => {
          distribution[review.rating]++
        })

        setStats({
          averageRating: avg,
          totalReviews: total,
          ratingDistribution: distribution
        })
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [dishId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!dishId) return

    const channel = supabase
      .channel(`reviews_${dishId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `dish_id=eq.${dishId}`
        },
        () => {
          fetchReviews()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dishId])

  return { reviews, loading, error, stats, refresh: fetchReviews }
}

/**
 * Hook to fetch user's own reviews
 */
export function useUserReviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReviews = async () => {
    if (!user) {
      setReviews([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          dish:dish_id (
            id,
            name,
            image_url,
            price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setReviews(data || [])
    } catch (err) {
      console.error('Error fetching user reviews:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [user])

  return { reviews, loading, error, refresh: fetchReviews }
}

/**
 * Hook to create a new review
 */
export function useCreateReview() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const createReview = async (reviewData) => {
    if (!user) {
      throw new Error('User must be logged in to create a review')
    }

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          user_name: user.user_metadata?.full_name || 'Utilisateur',
          user_email: user.email,
          dish_id: reviewData.dishId,
          order_id: reviewData.orderId || null,
          rating: reviewData.rating,
          title: reviewData.title || null,
          comment: reviewData.comment || null,
          photos: reviewData.photos || []
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error creating review:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading }
}

/**
 * Hook to update a review
 */
export function useUpdateReview() {
  const [loading, setLoading] = useState(false)

  const updateReview = async (reviewId, updates) => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: updates.rating,
          title: updates.title || null,
          comment: updates.comment || null,
          photos: updates.photos || []
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error updating review:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { updateReview, loading }
}

/**
 * Hook to delete a review
 */
export function useDeleteReview() {
  const [loading, setLoading] = useState(false)

  const deleteReview = async (reviewId) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      return { error: null }
    } catch (err) {
      console.error('Error deleting review:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { deleteReview, loading }
}

/**
 * Hook to vote on a review (helpful/not helpful)
 */
export function useReviewVote() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const voteOnReview = async (reviewId, voteType) => {
    if (!user) {
      throw new Error('User must be logged in to vote')
    }

    try {
      setLoading(true)

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single()

      if (existingVote) {
        // Update existing vote
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same button
          const { error } = await supabase
            .from('review_votes')
            .delete()
            .eq('id', existingVote.id)

          if (error) throw error
        } else {
          // Update to new vote type
          const { error } = await supabase
            .from('review_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)

          if (error) throw error
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            vote_type: voteType
          })

        if (error) throw error
      }

      return { error: null }
    } catch (err) {
      console.error('Error voting on review:', err)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getUserVote = async (reviewId) => {
    if (!user) return null

    try {
      const { data } = await supabase
        .from('review_votes')
        .select('vote_type')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single()

      return data?.vote_type || null
    } catch (err) {
      return null
    }
  }

  return { voteOnReview, getUserVote, loading }
}

/**
 * Hook to check if user can review a dish
 */
export function useCanReview(dishId) {
  const { user } = useAuth()
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCanReview = async () => {
      if (!user || !dishId) {
        setCanReview(false)
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Check if user already reviewed
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('dish_id', dishId)
          .single()

        if (existingReview) {
          setHasReviewed(true)
          setCanReview(false)
          setLoading(false)
          return
        }

        // Check if user has received this dish
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            id,
            order_items!inner(dish_id)
          `)
          .eq('user_id', user.id)
          .eq('status', 'delivered')
          .eq('order_items.dish_id', dishId)

        setCanReview(orders && orders.length > 0)
        setHasReviewed(false)
      } catch (err) {
        console.error('Error checking review eligibility:', err)
        setCanReview(false)
      } finally {
        setLoading(false)
      }
    }

    checkCanReview()
  }, [user, dishId])

  return { canReview, hasReviewed, loading }
}
