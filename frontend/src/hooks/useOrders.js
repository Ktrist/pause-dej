import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook to fetch all orders for the current user
 * @param {Object} options - Fetch options
 * @param {string} options.status - Filter by status (optional)
 * @returns {Object} { orders, loading, error, refetch }
 */
export function useOrders({ status = null } = {}) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            dish_name,
            dish_price,
            dish_image_url,
            quantity,
            subtotal
          )
        `)
        .eq('user_id', user.id)

      // Filter by status if provided
      if (status) {
        query = query.eq('status', status)
      }

      // Order by creation date (most recent first)
      query = query.order('created_at', { ascending: false })

      const { data, error: fetchError } = await query

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
  }, [status])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders
  }
}

/**
 * Hook to fetch a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Object} { order, loading, error }
 */
export function useOrder(orderId) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(
              id,
              dish_name,
              dish_price,
              dish_image_url,
              quantity,
              subtotal
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

    fetchOrder()
  }, [orderId])

  return { order, loading, error }
}

/**
 * Hook to fetch order by order number
 * @param {string} orderNumber - Order number (e.g., "PDJ-20251207-001")
 * @returns {Object} { order, loading, error }
 */
export function useOrderByNumber(orderNumber) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(
              id,
              dish_name,
              dish_price,
              dish_image_url,
              quantity,
              subtotal
            )
          `)
          .eq('order_number', orderNumber)
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

    fetchOrder()
  }, [orderNumber])

  return { order, loading, error }
}

/**
 * Hook to create a new order
 * @returns {Object} { createOrder, loading, error }
 */
export function useCreateOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createOrder = async (orderData, orderItems) => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Generate order number
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

      // Get count of orders today to generate sequence number
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today.toISOString().split('T')[0]}T00:00:00Z`)

      const orderNumber = `PDJ-${dateStr}-${String(count + 1).padStart(3, '0')}`

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            ...orderData,
            order_number: orderNumber,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        dish_id: item.dish_id,
        dish_name: item.dish_name,
        dish_price: item.dish_price,
        dish_image_url: item.dish_image_url,
        quantity: item.quantity,
        subtotal: item.subtotal
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      // Increment promo code usage count if applied
      if (orderData.promo_code_id) {
        const { error: promoError } = await supabase.rpc('increment_promo_code_usage', {
          promo_id: orderData.promo_code_id
        })

        if (promoError) {
          console.warn('Failed to increment promo code usage:', promoError)
          // Don't throw error - order was created successfully
        }
      }

      return { data: order, error: null }
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { createOrder, loading, error }
}

/**
 * Hook to update order status
 * @returns {Object} { updateOrderStatus, loading, error }
 */
export function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true)
      setError(null)

      // Map status to timestamp field
      const timestampFields = {
        'confirmed': 'confirmed_at',
        'preparing': 'preparing_at',
        'ready': 'ready_at',
        'in_delivery': 'in_delivery_at',
        'delivered': 'delivered_at',
        'cancelled': 'cancelled_at'
      }

      const updates = {
        status: newStatus
      }

      // Set appropriate timestamp
      if (timestampFields[newStatus]) {
        updates[timestampFields[newStatus]] = new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single()

      if (updateError) throw updateError

      return { data, error: null }
    } catch (err) {
      console.error('Error updating order status:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { updateOrderStatus, loading, error }
}

/**
 * Hook to cancel an order
 * @returns {Object} { cancelOrder, loading, error }
 */
export function useCancelOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cancelOrder = async (orderId, reason = null) => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const updates = {
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      }

      if (reason) {
        updates.customer_notes = reason
      }

      const { data, error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      return { data, error: null }
    } catch (err) {
      console.error('Error cancelling order:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { cancelOrder, loading, error }
}
