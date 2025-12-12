import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook pour gérer les factures B2B (client) - B2B.7
 */
export function useB2BInvoices(accountId) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (accountId) {
      fetchInvoices()

      // Subscribe to invoice changes
      const subscription = supabase
        .channel('b2b_invoices_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'b2b_invoices',
            filter: `b2b_account_id=eq.${accountId}`
          },
          () => {
            fetchInvoices()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } else {
      setLoading(false)
    }
  }, [accountId])

  const fetchInvoices = async () => {
    if (!accountId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('b2b_invoices')
        .select('*')
        .eq('b2b_account_id', accountId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setInvoices(data || [])
    } catch (err) {
      console.error('Error fetching invoices:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Get invoice statistics
  const getInvoiceStats = () => {
    const total = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)
    const paid = invoices.filter(inv => inv.status === 'paid').length
    const overdue = invoices.filter(inv => inv.status === 'overdue').length
    const pending = invoices.filter(inv => inv.status === 'sent').length

    return { total, paid, overdue, pending }
  }

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    stats: getInvoiceStats()
  }
}

/**
 * Hook pour gérer les factures B2B (admin) - B2B.7
 */
export function useAdminB2BInvoices(accountId = null) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInvoices()

    // Subscribe to all invoice changes
    const subscription = supabase
      .channel('admin_b2b_invoices_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'b2b_invoices'
        },
        () => {
          fetchInvoices()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [accountId])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('b2b_invoices')
        .select(`
          *,
          account:b2b_account_id (
            company_name,
            billing_email,
            user:user_id (
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })

      // Filter by account if specified
      if (accountId) {
        query = query.eq('b2b_account_id', accountId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setInvoices(data || [])
    } catch (err) {
      console.error('Error fetching admin invoices:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async (invoiceData) => {
    try {
      // Generate invoice number
      const { data: invoiceNumber, error: rpcError } = await supabase
        .rpc('generate_b2b_invoice_number')

      if (rpcError) throw rpcError

      const { data, error: createError } = await supabase
        .from('b2b_invoices')
        .insert([{
          ...invoiceData,
          invoice_number: invoiceNumber
        }])
        .select()
        .single()

      if (createError) throw createError

      await fetchInvoices()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating invoice:', err)
      return { data: null, error: err.message }
    }
  }

  const updateInvoice = async (invoiceId, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('b2b_invoices')
        .update(updates)
        .eq('id', invoiceId)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchInvoices()
      return { data, error: null }
    } catch (err) {
      console.error('Error updating invoice:', err)
      return { data: null, error: err.message }
    }
  }

  const updateInvoiceStatus = async (invoiceId, status, paidDate = null) => {
    const updates = { status }
    if (status === 'paid' && paidDate) {
      updates.paid_date = paidDate
    }
    return await updateInvoice(invoiceId, updates)
  }

  const deleteInvoice = async (invoiceId) => {
    try {
      const { error: deleteError } = await supabase
        .from('b2b_invoices')
        .delete()
        .eq('id', invoiceId)

      if (deleteError) throw deleteError

      await fetchInvoices()
      return { error: null }
    } catch (err) {
      console.error('Error deleting invoice:', err)
      return { error: err.message }
    }
  }

  // Generate invoice from orders in a period
  const generateInvoiceFromOrders = async (accountId, periodStart, periodEnd) => {
    try {
      // Fetch orders for the period
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', accountId)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .eq('status', 'delivered')

      if (ordersError) throw ordersError

      if (!orders || orders.length === 0) {
        return { data: null, error: 'No orders found for this period' }
      }

      // Calculate totals
      const subtotal = orders.reduce((sum, order) => sum + parseFloat(order.subtotal || 0), 0)
      const discount = orders.reduce((sum, order) => sum + parseFloat(order.discount || 0), 0)

      // Get account for discount rate and tax calculation
      const { data: account, error: accountError } = await supabase
        .from('b2b_accounts')
        .select('discount_rate, payment_terms')
        .eq('id', accountId)
        .single()

      if (accountError) throw accountError

      const additionalDiscount = (subtotal - discount) * (account.discount_rate / 100)
      const totalDiscount = discount + additionalDiscount
      const taxableAmount = subtotal - totalDiscount
      const taxAmount = taxableAmount * 0.2 // 20% VAT
      const total = taxableAmount + taxAmount

      // Calculate due date based on payment terms
      let dueDays = 0
      if (account.payment_terms === 'net15') dueDays = 15
      else if (account.payment_terms === 'net30') dueDays = 30
      else if (account.payment_terms === 'net60') dueDays = 60

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + dueDays)

      // Create invoice
      return await createInvoice({
        b2b_account_id: accountId,
        period_start: periodStart,
        period_end: periodEnd,
        subtotal,
        discount_amount: totalDiscount,
        tax_amount: taxAmount,
        total,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'draft'
      })
    } catch (err) {
      console.error('Error generating invoice from orders:', err)
      return { data: null, error: err.message }
    }
  }

  // Get invoice statistics
  const getInvoiceStats = () => {
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)
    const pendingAmount = invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0)

    return {
      totalAmount,
      paidAmount,
      overdueAmount,
      pendingAmount,
      totalCount: invoices.length,
      paidCount: invoices.filter(inv => inv.status === 'paid').length,
      overdueCount: invoices.filter(inv => inv.status === 'overdue').length,
      pendingCount: invoices.filter(inv => inv.status === 'sent').length
    }
  }

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    generateInvoiceFromOrders,
    stats: getInvoiceStats()
  }
}
