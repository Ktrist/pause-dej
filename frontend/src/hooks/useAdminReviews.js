import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useAdminReviews() {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all reviews with dish info
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          dish:dish_id(
            id,
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setReviews(data || [])

      // Calculate stats
      const total = data?.length || 0
      const approved = data?.filter(r => r.is_approved).length || 0
      const pending = total - approved
      const avgRating = total > 0
        ? data.reduce((sum, r) => sum + r.rating, 0) / total
        : 0

      setStats({
        total,
        pending,
        approved,
        averageRating: avgRating
      })
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()

    // Subscribe to changes
    const subscription = supabase
      .channel('admin-reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          fetchReviews()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const updateReviewStatus = async (reviewId, isApproved) => {
    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId)

      if (updateError) throw updateError

      return { data: true, error: null }
    } catch (err) {
      console.error('Error updating review status:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (deleteError) throw deleteError

      return { data: true, error: null }
    } catch (err) {
      console.error('Error deleting review:', err)
      return { data: null, error: err.message }
    }
  }

  const bulkApprove = async (reviewIds) => {
    try {
      const { error: bulkError } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .in('id', reviewIds)

      if (bulkError) throw bulkError

      return { data: true, error: null }
    } catch (err) {
      console.error('Error bulk approving reviews:', err)
      return { data: null, error: err.message }
    }
  }

  const bulkDelete = async (reviewIds) => {
    try {
      const { error: bulkError } = await supabase
        .from('reviews')
        .delete()
        .in('id', reviewIds)

      if (bulkError) throw bulkError

      return { data: true, error: null }
    } catch (err) {
      console.error('Error bulk deleting reviews:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    reviews,
    stats,
    loading,
    error,
    refresh: fetchReviews,
    updateReviewStatus,
    deleteReview,
    bulkApprove,
    bulkDelete
  }
}
