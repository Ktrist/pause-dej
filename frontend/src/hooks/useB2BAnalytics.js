import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook pour les analytics B2B - B2B.9
 */
export function useB2BAnalytics(accountId, period = 30) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (accountId) {
      fetchAnalytics()
    } else {
      setLoading(false)
    }
  }, [accountId, period])

  const fetchAnalytics = async () => {
    if (!accountId) return

    try {
      setLoading(true)
      setError(null)

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - period)

      // Fetch all data for the account
      const [
        ordersResult,
        teamMembersResult,
        invoicesResult
      ] = await Promise.all([
        // Orders data
        supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .eq('user_id', accountId)
          .gte('created_at', startDate.toISOString()),

        // Team members
        supabase
          .from('b2b_team_members')
          .select('*')
          .eq('b2b_account_id', accountId),

        // Invoices
        supabase
          .from('b2b_invoices')
          .select('*')
          .eq('b2b_account_id', accountId)
          .gte('created_at', startDate.toISOString())
      ])

      if (ordersResult.error) throw ordersResult.error
      if (teamMembersResult.error) throw teamMembersResult.error
      if (invoicesResult.error) throw invoicesResult.error

      const orders = ordersResult.data || []
      const teamMembers = teamMembersResult.data || []
      const invoices = invoicesResult.data || []

      // Calculate analytics
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Orders by status
      const ordersByStatus = {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      }

      // Team member usage
      const activeMembers = teamMembers.filter(m => m.is_active).length
      const totalBudget = teamMembers.reduce((sum, m) => sum + parseFloat(m.monthly_budget || 0), 0)

      // Popular items
      const itemCounts = {}
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (!itemCounts[item.dish_name]) {
            itemCounts[item.dish_name] = {
              name: item.dish_name,
              count: 0,
              revenue: 0
            }
          }
          itemCounts[item.dish_name].count += item.quantity
          itemCounts[item.dish_name].revenue += parseFloat(item.subtotal || 0)
        })
      })

      const popularItems = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Orders timeline (by day)
      const ordersByDay = {}
      orders.forEach(order => {
        const day = new Date(order.created_at).toISOString().split('T')[0]
        if (!ordersByDay[day]) {
          ordersByDay[day] = { count: 0, revenue: 0 }
        }
        ordersByDay[day].count++
        ordersByDay[day].revenue += parseFloat(order.total || 0)
      })

      const timeline = Object.entries(ordersByDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      // Invoice stats
      const invoiceStats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'sent').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalAmount: invoices.reduce((sum, i) => sum + parseFloat(i.total || 0), 0),
        paidAmount: invoices
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)
      }

      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        ordersByStatus,
        activeMembers,
        totalMembers: teamMembers.length,
        totalBudget,
        popularItems,
        timeline,
        invoiceStats,
        period
      })
    } catch (err) {
      console.error('Error fetching B2B analytics:', err)
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

/**
 * Hook pour les analytics B2B admin (tous les comptes) - B2B.9
 */
export function useAdminB2BAnalytics(period = 30) {
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

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - period)

      // Fetch all B2B data
      const [
        accountsResult,
        invoicesResult,
        packagesResult,
        quotesResult
      ] = await Promise.all([
        // B2B Accounts
        supabase
          .from('b2b_accounts')
          .select(`
            *,
            team_members:b2b_team_members(count)
          `),

        // Invoices
        supabase
          .from('b2b_invoices')
          .select('*')
          .gte('created_at', startDate.toISOString()),

        // Packages
        supabase
          .from('b2b_packages')
          .select('*'),

        // Quotes
        supabase
          .from('b2b_quote_requests')
          .select('*')
          .gte('created_at', startDate.toISOString())
      ])

      if (accountsResult.error) throw accountsResult.error
      if (invoicesResult.error) throw invoicesResult.error
      if (packagesResult.error) throw packagesResult.error
      if (quotesResult.error) throw quotesResult.error

      const accounts = accountsResult.data || []
      const invoices = invoicesResult.data || []
      const packages = packagesResult.data || []
      const quotes = quotesResult.data || []

      // Account stats
      const totalAccounts = accounts.length
      const activeAccounts = accounts.filter(a => a.status === 'active').length
      const totalTeamMembers = accounts.reduce((sum, a) => sum + (a.team_members?.[0]?.count || 0), 0)

      // Revenue stats
      const totalRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)

      const pendingRevenue = invoices
        .filter(i => i.status === 'sent')
        .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)

      const overdueRevenue = invoices
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)

      // Revenue by account (top 10)
      const revenueByAccount = {}
      invoices.forEach(invoice => {
        const accountId = invoice.b2b_account_id
        if (!revenueByAccount[accountId]) {
          const account = accounts.find(a => a.id === accountId)
          revenueByAccount[accountId] = {
            accountId,
            companyName: account?.company_name || 'Unknown',
            revenue: 0,
            invoiceCount: 0
          }
        }
        revenueByAccount[accountId].revenue += parseFloat(invoice.total || 0)
        revenueByAccount[accountId].invoiceCount++
      })

      const topAccounts = Object.values(revenueByAccount)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Quote conversion
      const quoteStats = {
        total: quotes.length,
        pending: quotes.filter(q => q.status === 'pending').length,
        accepted: quotes.filter(q => q.status === 'accepted').length,
        rejected: quotes.filter(q => q.status === 'rejected').length,
        conversionRate:
          quotes.length > 0
            ? (quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100
            : 0
      }

      // Invoice timeline
      const invoicesByMonth = {}
      invoices.forEach(invoice => {
        const month = new Date(invoice.created_at).toISOString().substring(0, 7)
        if (!invoicesByMonth[month]) {
          invoicesByMonth[month] = { count: 0, revenue: 0 }
        }
        invoicesByMonth[month].count++
        invoicesByMonth[month].revenue += parseFloat(invoice.total || 0)
      })

      const timeline = Object.entries(invoicesByMonth)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))

      // Package popularity
      const packageStats = packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        pricePerPerson: pkg.price_per_person,
        isActive: pkg.is_active
      }))

      setAnalytics({
        totalAccounts,
        activeAccounts,
        totalTeamMembers,
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
        topAccounts,
        quoteStats,
        timeline,
        packageStats,
        invoiceCount: invoices.length,
        period
      })
    } catch (err) {
      console.error('Error fetching admin B2B analytics:', err)
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
