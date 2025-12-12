import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook to manage orders (admin)
 */
export function useAdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            dishes(name, image_url)
          ),
          user:user_id(email, full_name, phone)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('admin_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const updateOrderStatus = async (id, status) => {
    try {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setOrders(prev => prev.map(order => order.id === id ? data : order))
      return { data, error: null }
    } catch (err) {
      console.error('Error updating order status:', err)
      return { data: null, error: err.message }
    }
  }

  const cancelOrder = async (id, reason) => {
    try {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          admin_notes: reason
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setOrders(prev => prev.map(order => order.id === id ? data : order))
      return { data, error: null }
    } catch (err) {
      console.error('Error cancelling order:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    updateOrderStatus,
    cancelOrder
  }
}

/**
 * Hook to get a single order by ID
 */
export function useAdminOrder(orderId) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(
              *,
              dishes(name, image_url)
            ),
            user:user_id(email, full_name, phone),
            delivery_addresses(
              street_address,
              city,
              postal_code,
              additional_info
            )
          `)
          .eq('id', orderId)
          .single()

        if (fetchError) throw fetchError

        setOrder(data)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  return { order, loading, error }
}
