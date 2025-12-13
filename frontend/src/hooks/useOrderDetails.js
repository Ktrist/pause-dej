import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook pour récupérer les détails complets d'une commande - A3.4
 */
export function useOrderDetails(orderId) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch complete order with all relations
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            users:profiles!orders_user_id_fkey (
              id,
              full_name,
              email,
              phone
            ),
            order_items (
              id,
              quantity,
              price,
              subtotal,
              dish_id,
              dish_name,
              dishes (
                id,
                name,
                description,
                image_url,
                dietary_tags
              )
            ),
            promo_codes (
              id,
              code,
              discount_type,
              discount_value
            )
          `)
          .eq('id', orderId)
          .single()

        if (fetchError) throw fetchError

        setOrder(data)
      } catch (err) {
        console.error('Error fetching order details:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()

    // Subscribe to order changes
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order updated:', payload)
          fetchOrderDetails()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId])

  return {
    order,
    loading,
    error
  }
}
