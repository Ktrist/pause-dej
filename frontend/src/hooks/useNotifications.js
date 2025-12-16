import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const { user } = useAuth()
  const [permission, setPermission] = useState('default')
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Load existing subscription
    if (user) {
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (err) {
      console.error('Error loading subscription:', err)
    }
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setError('Les notifications ne sont pas supportées par ce navigateur')
      return false
    }

    try {
      setLoading(true)
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        await subscribe()
        return true
      }

      return false
    } catch (err) {
      console.error('Error requesting notification permission:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready

      // Check if already subscribed
      let sub = await registration.pushManager.getSubscription()

      if (!sub) {
        // Create new subscription
        // Note: You'll need to generate VAPID keys for production
        // Use: npx web-push generate-vapid-keys
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_VAPID_KEY'

        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })
      }

      setSubscription(sub)

      // Save subscription to database
      if (user) {
        await saveSubscription(sub)
      }

      return sub
    } catch (err) {
      console.error('Error subscribing to push:', err)
      setError(err.message)
      return null
    }
  }

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        setSubscription(null)

        // Remove from database
        if (user) {
          await removeSubscription()
        }

        return true
      }
      return false
    } catch (err) {
      console.error('Error unsubscribing:', err)
      setError(err.message)
      return false
    }
  }

  const saveSubscription = async (sub) => {
    try {
      const subData = JSON.stringify(sub)

      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: subData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (dbError) throw dbError
    } catch (err) {
      console.error('Error saving subscription:', err)
    }
  }

  const removeSubscription = async () => {
    try {
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)

      if (dbError) throw dbError
    } catch (err) {
      console.error('Error removing subscription:', err)
    }
  }

  // Send a test notification
  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test - Pause Dej\'', {
        body: 'Les notifications fonctionnent correctement ! 🎉',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'test',
        requireInteraction: false
      })
    }
  }

  return {
    permission,
    subscription,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    isSupported: 'Notification' in window,
    isSubscribed: !!subscription
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
