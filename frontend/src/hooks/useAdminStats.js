import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook to fetch admin dashboard statistics
 * Returns today's revenue, order counts, and alerts
 */
export function useAdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Fetch today's orders
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (ordersError) throw ordersError

      // Calculate stats
      const totalRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
      const totalOrders = todayOrders.length
      const pendingOrders = todayOrders.filter(o => o.status === 'pending').length
      const preparingOrders = todayOrders.filter(o => o.status === 'preparing').length
      const inTransitOrders = todayOrders.filter(o => o.status === 'in_transit').length
      const deliveredOrders = todayOrders.filter(o => o.status === 'delivered').length

      // Check for low stock dishes
      const { data: dishes, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .lte('stock', 5)
        .eq('is_available', true)

      if (dishesError) throw dishesError

      setStats({
        totalRevenue,
        totalOrders,
        pendingOrders,
        preparingOrders,
        inTransitOrders,
        deliveredOrders,
        lowStockAlerts: dishes.length,
        lowStockDishes: dishes
      })
    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  return { stats, loading, error, refresh: fetchStats }
}

/**
 * Hook to fetch live orders with real-time updates
 */
export function useLiveOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: ordersError } = await supabase
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
        .limit(50)

      if (ordersError) throw ordersError

      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching live orders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('orders_changes')
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

  return { orders, loading, error, refresh: fetchOrders }
}
