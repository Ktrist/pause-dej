import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook pour récupérer les analytics admin - A6.x
 */
export function useAdminAnalytics(period = '30days') {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate date range based on period
      const now = new Date()
      let startDate = new Date()

      switch (period) {
        case '7days':
          startDate.setDate(now.getDate() - 7)
          break
        case '30days':
          startDate.setDate(now.getDate() - 30)
          break
        case '90days':
          startDate.setDate(now.getDate() - 90)
          break
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setDate(now.getDate() - 30)
      }

      // Fetch orders with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            dishes (
              name,
              category
            )
          ),
          users:user_id (
            full_name,
            email
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (ordersError) throw ordersError

      // Calculate revenue analytics
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const deliveredRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0)

      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Orders by status
      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {})

      // Revenue over time (by day)
      const revenueByDay = orders.reduce((acc, order) => {
        const day = new Date(order.created_at).toISOString().split('T')[0]
        if (!acc[day]) {
          acc[day] = { date: day, revenue: 0, orders: 0 }
        }
        acc[day].revenue += order.total
        acc[day].orders += 1
        return acc
      }, {})

      const revenueTimeSeries = Object.values(revenueByDay).sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      )

      // Top selling dishes
      const dishSales = {}
      orders.forEach(order => {
        order.order_items?.forEach(item => {
          const dishName = item.dishes?.name || item.dish_name
          if (!dishSales[dishName]) {
            dishSales[dishName] = {
              name: dishName,
              quantity: 0,
              revenue: 0,
              category: item.dishes?.category || 'unknown'
            }
          }
          dishSales[dishName].quantity += item.quantity
          dishSales[dishName].revenue += item.subtotal
        })
      })

      const topDishes = Object.values(dishSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Revenue by category
      const revenueByCategory = {}
      orders.forEach(order => {
        order.order_items?.forEach(item => {
          const category = item.dishes?.category || 'Autre'
          if (!revenueByCategory[category]) {
            revenueByCategory[category] = 0
          }
          revenueByCategory[category] += item.subtotal
        })
      })

      // Customer analytics
      const uniqueCustomers = new Set(orders.map(o => o.user_id).filter(Boolean))
      const totalCustomers = uniqueCustomers.size

      // Repeat customers (customers with more than one order)
      const customerOrderCounts = orders.reduce((acc, order) => {
        if (order.user_id) {
          acc[order.user_id] = (acc[order.user_id] || 0) + 1
        }
        return acc
      }, {})

      const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length
      const repeatCustomerRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0

      // Delivery zone analytics
      const deliveryZones = orders.reduce((acc, order) => {
        const postalCode = order.delivery_postal_code
        if (postalCode) {
          if (!acc[postalCode]) {
            acc[postalCode] = { postalCode, orders: 0, revenue: 0 }
          }
          acc[postalCode].orders += 1
          acc[postalCode].revenue += order.total
        }
        return acc
      }, {})

      const topZones = Object.values(deliveryZones)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Peak hours analysis
      const ordersByHour = orders.reduce((acc, order) => {
        const hour = new Date(order.created_at).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {})

      // Peak days analysis
      const ordersByDay = orders.reduce((acc, order) => {
        const day = new Date(order.created_at).getDay()
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const dayName = dayNames[day]
        acc[dayName] = (acc[dayName] || 0) + 1
        return acc
      }, {})

      // Calculate growth rate (compare to previous period)
      const periodDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
      const previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - periodDays)

      const { data: previousOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())

      const previousRevenue = previousOrders?.reduce((sum, o) => sum + o.total, 0) || 0
      const revenueGrowth = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0

      const previousOrderCount = previousOrders?.length || 0
      const ordersGrowth = previousOrderCount > 0
        ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
        : 0

      setAnalytics({
        summary: {
          totalRevenue,
          deliveredRevenue,
          totalOrders,
          averageOrderValue,
          totalCustomers,
          repeatCustomerRate,
          revenueGrowth,
          ordersGrowth
        },
        ordersByStatus,
        revenueTimeSeries,
        topDishes,
        revenueByCategory,
        topZones,
        ordersByHour,
        ordersByDay,
        period
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  }
}
