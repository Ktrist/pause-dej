import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to manage newsletter subscription (N2.1, N2.2, N2.3)
 */
export function useNewsletterSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user's subscription status
  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
        throw fetchError
      }

      setSubscription(data)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to newsletter
  const subscribe = async (email, source = 'account', preferences = null) => {
    try {
      setLoading(true)
      setError(null)

      const subscribeData = {
        email: email || user?.email,
        user_id: user?.id || null,
        is_subscribed: true,
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
        source,
        preferences: preferences || {
          weekly_newsletter: true,
          promotions: true,
          product_updates: true
        }
      }

      // Try to check if subscription exists first
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', subscribeData.email)
        .maybeSingle()

      let data, error

      if (existing) {
        // Update existing subscription
        const { data: updateData, error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            is_subscribed: true,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
            preferences: subscribeData.preferences,
            user_id: subscribeData.user_id
          })
          .eq('email', subscribeData.email)
          .select()
          .single()

        data = updateData
        error = updateError
      } else {
        // Insert new subscription
        const { data: insertData, error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert(subscribeData)
          .select()
          .single()

        data = insertData
        error = insertError
      }

      if (error) throw error

      setSubscription(data)
      return { data, error: null }
    } catch (err) {
      console.error('Error subscribing:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Unsubscribe from newsletter
  const unsubscribe = async () => {
    if (!user && !subscription) {
      return { data: null, error: 'No subscription found' }
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_subscribed: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setSubscription(data)
      return { data, error: null }
    } catch (err) {
      console.error('Error unsubscribing:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Update subscription preferences
  const updatePreferences = async (newPreferences) => {
    if (!user) {
      return { data: null, error: 'User not logged in' }
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ preferences: newPreferences })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setSubscription(data)
      return { data, error: null }
    } catch (err) {
      console.error('Error updating preferences:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [user?.id])

  return {
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
    updatePreferences,
    refresh: fetchSubscription,
    isSubscribed: subscription?.is_subscribed || false
  }
}

/**
 * Hook for admin newsletter campaign management
 */
export function useNewsletterCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setCampaigns(data || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create new campaign
  const createCampaign = async (campaignData) => {
    try {
      setLoading(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      const { data, error: insertError } = await supabase
        .from('newsletter_campaigns')
        .insert({
          ...campaignData,
          created_by: userId,
          status: 'draft'
        })
        .select()
        .single()

      if (insertError) throw insertError

      await fetchCampaigns()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Update campaign
  const updateCampaign = async (campaignId, updates) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('newsletter_campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchCampaigns()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating campaign:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Delete campaign
  const deleteCampaign = async (campaignId) => {
    try {
      setLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', campaignId)

      if (deleteError) throw deleteError

      await fetchCampaigns()
      return { error: null }
    } catch (err) {
      console.error('Error deleting campaign:', err)
      setError(err.message)
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Send campaign (calls edge function)
  const sendCampaign = async (campaignId) => {
    try {
      setLoading(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/send-newsletter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ campaignId })
        }
      )

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to send campaign')
      }

      await fetchCampaigns()
      return { data: result, error: null }
    } catch (err) {
      console.error('Error sending campaign:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    refresh: fetchCampaigns
  }
}

/**
 * Hook to get campaign statistics
 */
export function useCampaignStats(campaignId) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!campaignId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('newsletter_campaigns')
          .select('*')
          .eq('id', campaignId)
          .single()

        if (fetchError) throw fetchError

        // Calculate stats
        const openRate = data.total_sent > 0
          ? ((data.total_opened / data.total_sent) * 100).toFixed(1)
          : 0

        const clickRate = data.total_sent > 0
          ? ((data.total_clicked / data.total_sent) * 100).toFixed(1)
          : 0

        setStats({
          ...data,
          openRate,
          clickRate
        })
      } catch (err) {
        console.error('Error fetching campaign stats:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [campaignId])

  return { stats, loading, error }
}

/**
 * Hook to get subscriber statistics
 */
export function useSubscriberStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    weekly_newsletter: 0,
    promotions: 0,
    product_updates: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all subscribers
        const { data: allData, error: allError } = await supabase
          .from('newsletter_subscribers')
          .select('*')

        if (allError) throw allError

        // Calculate stats
        const total = allData.length
        const active = allData.filter(s => s.is_subscribed).length
        const weekly_newsletter = allData.filter(
          s => s.is_subscribed && s.preferences?.weekly_newsletter
        ).length
        const promotions = allData.filter(
          s => s.is_subscribed && s.preferences?.promotions
        ).length
        const product_updates = allData.filter(
          s => s.is_subscribed && s.preferences?.product_updates
        ).length

        setStats({
          total,
          active,
          weekly_newsletter,
          promotions,
          product_updates
        })
      } catch (err) {
        console.error('Error fetching subscriber stats:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
