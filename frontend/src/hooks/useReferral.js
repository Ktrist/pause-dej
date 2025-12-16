import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Referral Hook
 * Manages user's referral code and referral statistics
 */
export function useReferral() {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState(null)
  const [stats, setStats] = useState({
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalEarned: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user's referral code
  const fetchReferralCode = async () => {
    if (!user) {
      setReferralCode(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (!data) {
        // Create referral code if it doesn't exist
        await createReferralCode()
      } else {
        setReferralCode(data)
      }
    } catch (err) {
      console.error('Error fetching referral code:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create referral code
  const createReferralCode = async () => {
    try {
      const { data, error } = await supabase
        .rpc('create_user_referral_code', {
          user_id_param: user.id
        })

      if (error) throw error

      // Fetch the newly created code
      await fetchReferralCode()
    } catch (err) {
      console.error('Error creating referral code:', err)
      setError(err.message)
    }
  }

  // Fetch referral statistics
  const fetchStats = async () => {
    if (!user) return

    try {
      // Get all referrals where user is the referrer
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('*, referral_rewards(*)')
        .eq('referrer_user_id', user.id)

      if (referralsError) throw referralsError

      const totalReferrals = referrals?.length || 0
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0

      // Calculate total earned from referral rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('referral_rewards')
        .select('reward_amount')
        .eq('user_id', user.id)

      if (rewardsError) throw rewardsError

      const totalEarned = rewards?.reduce((sum, reward) => sum + parseFloat(reward.reward_amount), 0) || 0

      setStats({
        totalReferrals,
        pendingReferrals,
        completedReferrals,
        totalEarned
      })
    } catch (err) {
      console.error('Error fetching referral stats:', err)
    }
  }

  useEffect(() => {
    fetchReferralCode()
    fetchStats()
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('referral_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_user_id=eq.${user.id}`
        },
        () => {
          fetchStats()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_codes',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchReferralCode()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    referralCode,
    stats,
    loading,
    error,
    refresh: () => {
      fetchReferralCode()
      fetchStats()
    }
  }
}

/**
 * Referrals List Hook
 * Get list of users referred by current user
 */
export function useReferralsList() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReferrals = async () => {
    if (!user) {
      setReferrals([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('referrals')
        .select(`
          *,
          referral_rewards (
            id,
            reward_amount,
            reward_type,
            is_claimed,
            claimed_at,
            expires_at
          )
        `)
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setReferrals(data || [])
    } catch (err) {
      console.error('Error fetching referrals list:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [user])

  return {
    referrals,
    loading,
    error,
    refresh: fetchReferrals
  }
}

/**
 * Referral Rewards Hook
 * Get rewards earned from referrals
 */
export function useReferralRewards() {
  const { user } = useAuth()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRewards = async () => {
    if (!user) {
      setRewards([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('referral_rewards')
        .select(`
          *,
          referral:referral_id (
            code_used,
            status,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setRewards(data || [])
    } catch (err) {
      console.error('Error fetching referral rewards:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('referral_rewards_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_rewards',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchRewards()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    rewards,
    loading,
    error,
    refresh: fetchRewards
  }
}

/**
 * Apply Referral Code Hook
 * For new users to apply a referral code
 */
export function useApplyReferralCode() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const applyCode = async (code) => {
    if (!user) {
      throw new Error('User must be logged in to apply referral code')
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: applyError } = await supabase
        .rpc('apply_referral_code', {
          referred_user_id_param: user.id,
          code_param: code.toUpperCase()
        })

      if (applyError) throw applyError

      return data
    } catch (err) {
      console.error('Error applying referral code:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    applyCode,
    loading,
    error
  }
}

/**
 * Check if user was referred
 */
export function useWasReferred() {
  const { user } = useAuth()
  const [wasReferred, setWasReferred] = useState(false)
  const [referralInfo, setReferralInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkReferral = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('referrals')
          .select(`
            *,
            referral_code:referral_code_id (code, user_id)
          `)
          .eq('referred_user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setWasReferred(true)
          setReferralInfo(data)
        }
      } catch (err) {
        console.error('Error checking referral:', err)
      } finally {
        setLoading(false)
      }
    }

    checkReferral()
  }, [user])

  return {
    wasReferred,
    referralInfo,
    loading
  }
}
