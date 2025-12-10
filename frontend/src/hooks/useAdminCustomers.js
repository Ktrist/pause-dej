import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook pour récupérer la liste des clients avec leurs statistiques
 * Pour l'admin dashboard - A5.1
 */
export function useAdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all users with their profile data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, created_at')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // For each user, fetch their order statistics
      const customersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          // Get order count and total spent
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, total, created_at, status')
            .eq('user_id', profile.id)

          if (ordersError) {
            console.error('Error fetching orders for user:', profile.id, ordersError)
            return {
              ...profile,
              order_count: 0,
              total_spent: 0,
              last_order_date: null,
              average_order: 0
            }
          }

          const orderCount = orders?.length || 0
          const totalSpent = orders?.reduce((sum, order) => sum + order.total, 0) || 0
          const lastOrderDate = orders?.[0]?.created_at || null
          const averageOrder = orderCount > 0 ? totalSpent / orderCount : 0

          return {
            ...profile,
            order_count: orderCount,
            total_spent: totalSpent,
            last_order_date: lastOrderDate,
            average_order: averageOrder,
            orders: orders || []
          }
        })
      )

      setCustomers(customersWithStats)
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers
  }
}

/**
 * Hook pour récupérer les détails complets d'un client
 * Pour l'admin dashboard - A5.2
 */
export function useCustomerDetails(customerId) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!customerId) {
      setLoading(false)
      return
    }

    const fetchCustomerDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch customer profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .single()

        if (profileError) throw profileError

        // Fetch customer orders with items
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              subtotal,
              dish_id,
              dish_name
            )
          `)
          .eq('user_id', customerId)
          .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        // Fetch customer addresses
        const { data: addresses, error: addressesError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', customerId)
          .order('created_at', { ascending: false })

        if (addressesError) throw addressesError

        // Calculate statistics
        const orderCount = orders?.length || 0
        const totalSpent = orders?.reduce((sum, order) => sum + order.total, 0) || 0
        const averageOrder = orderCount > 0 ? totalSpent / orderCount : 0
        const lastOrderDate = orders?.[0]?.created_at || null

        // Count orders by status
        const ordersByStatus = orders?.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, {}) || {}

        setCustomer({
          ...profile,
          orders: orders || [],
          addresses: addresses || [],
          stats: {
            order_count: orderCount,
            total_spent: totalSpent,
            average_order: averageOrder,
            last_order_date: lastOrderDate,
            orders_by_status: ordersByStatus
          }
        })
      } catch (err) {
        console.error('Error fetching customer details:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerDetails()
  }, [customerId])

  return {
    customer,
    loading,
    error
  }
}
