import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Loyalty Program Hook
 * Manages user loyalty points, tiers, rewards, and redemptions
 */
export function useLoyalty() {
  const { user } = useAuth()
  const [loyaltyData, setLoyaltyData] = useState(null)
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user's loyalty points and tier
  const fetchLoyaltyData = async () => {
    if (!user) {
      setLoyaltyData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('loyalty_points')
        .select(`
          *,
          tier:current_tier_id (
            id,
            name,
            min_points,
            benefits,
            discount_percentage,
            icon,
            color
          )
        `)
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      setLoyaltyData(data || null)
    } catch (err) {
      console.error('Error fetching loyalty data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all tiers
  const fetchTiers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('min_points', { ascending: true })

      if (fetchError) throw fetchError

      setTiers(data || [])
    } catch (err) {
      console.error('Error fetching tiers:', err)
    }
  }

  // Calculate progress to next tier
  const calculateNextTierProgress = () => {
    if (!loyaltyData || tiers.length === 0) return null

    const currentTierIndex = tiers.findIndex(t => t.id === loyaltyData.current_tier_id)
    const nextTier = tiers[currentTierIndex + 1]

    if (!nextTier) {
      // Already at max tier
      return {
        isMaxTier: true,
        currentTier: tiers[currentTierIndex],
        nextTier: null,
        pointsNeeded: 0,
        progress: 100
      }
    }

    const currentTier = tiers[currentTierIndex]
    const pointsNeeded = nextTier.min_points - loyaltyData.lifetime_points
    const pointsInCurrentTier = loyaltyData.lifetime_points - currentTier.min_points
    const pointsRequiredForNextTier = nextTier.min_points - currentTier.min_points
    const progress = (pointsInCurrentTier / pointsRequiredForNextTier) * 100

    return {
      isMaxTier: false,
      currentTier,
      nextTier,
      pointsNeeded,
      progress: Math.min(progress, 100)
    }
  }

  // Load data on mount and when user changes
  useEffect(() => {
    fetchLoyaltyData()
    fetchTiers()
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('loyalty_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_points',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchLoyaltyData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    loyaltyData,
    tiers,
    loading,
    error,
    refresh: fetchLoyaltyData,
    nextTierProgress: calculateNextTierProgress()
  }
}

/**
 * Loyalty Rewards Hook
 * Manages available rewards and redemptions
 */
export function useLoyaltyRewards() {
  const { user } = useAuth()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch available rewards
  const fetchRewards = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_cost', { ascending: true })

      if (fetchError) throw fetchError

      setRewards(data || [])
    } catch (err) {
      console.error('Error fetching rewards:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Redeem a reward
  const redeemReward = async (rewardId) => {
    if (!user) {
      throw new Error('User must be logged in to redeem rewards')
    }

    try {
      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('id', rewardId)
        .single()

      if (rewardError) throw rewardError

      // Get user's current points
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_points')
        .select('points_balance')
        .eq('user_id', user.id)
        .single()

      if (loyaltyError) throw loyaltyError

      // Check if user has enough points
      if (loyaltyData.points_balance < reward.points_cost) {
        throw new Error('Insufficient points')
      }

      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from('loyalty_redemptions')
        .insert({
          user_id: user.id,
          reward_id: rewardId,
          points_spent: reward.points_cost,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        })
        .select()
        .single()

      if (redemptionError) throw redemptionError

      // Deduct points
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          points_balance: loyaltyData.points_balance - reward.points_cost
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Record transaction
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          points: -reward.points_cost,
          transaction_type: 'redeemed',
          reason: `Échange: ${reward.name}`,
          reward_id: rewardId
        })

      if (transactionError) throw transactionError

      // Update total_redeemed counter
      await supabase
        .from('loyalty_rewards')
        .update({
          total_redeemed: (reward.total_redeemed || 0) + 1
        })
        .eq('id', rewardId)

      return redemption
    } catch (err) {
      console.error('Error redeeming reward:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  return {
    rewards,
    loading,
    error,
    redeemReward,
    refresh: fetchRewards
  }
}

/**
 * Loyalty Redemptions Hook
 * Manages user's reward redemptions
 */
export function useLoyaltyRedemptions() {
  const { user } = useAuth()
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user's redemptions
  const fetchRedemptions = async () => {
    if (!user) {
      setRedemptions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('loyalty_redemptions')
        .select(`
          *,
          reward:reward_id (
            id,
            name,
            description,
            reward_type,
            reward_value,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false })

      if (fetchError) throw fetchError

      setRedemptions(data || [])
    } catch (err) {
      console.error('Error fetching redemptions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRedemptions()
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('redemptions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_redemptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchRedemptions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    redemptions,
    loading,
    error,
    refresh: fetchRedemptions
  }
}

/**
 * Loyalty Transactions Hook
 * Manages user's points transaction history
 */
export function useLoyaltyTransactions(limit = 50) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch transaction history
  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError

      setTransactions(data || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [user, limit])

  return {
    transactions,
    loading,
    error,
    refresh: fetchTransactions
  }
}
