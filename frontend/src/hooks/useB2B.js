import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook for managing business accounts (admin)
 */
export const useBusinessAccounts = () => {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_accounts')
        .select('*, manager:manager_user_id(email)')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setBusinesses(data || [])
    } catch (err) {
      console.error('Error fetching businesses:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const createBusiness = async (businessData) => {
    try {
      const { data, error } = await supabase
        .from('business_accounts')
        .insert([businessData])
        .select()
        .single()

      if (error) throw error

      setBusinesses(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateBusiness = async (id, businessData) => {
    try {
      const { data, error } = await supabase
        .from('business_accounts')
        .update(businessData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setBusinesses(prev =>
        prev.map(business => (business.id === id ? data : business))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const approveBusiness = async (id, approvedBy) => {
    try {
      const { data, error } = await supabase
        .from('business_accounts')
        .update({
          status: 'active',
          approval_date: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setBusinesses(prev =>
        prev.map(business => (business.id === id ? data : business))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return {
    businesses,
    loading,
    error,
    refresh: fetchBusinesses,
    createBusiness,
    updateBusiness,
    approveBusiness
  }
}

/**
 * Hook for managing business employees
 */
export const useBusinessEmployees = (businessId) => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmployees = async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_employees')
        .select('*, user:user_id(email)')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setEmployees(data || [])
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [businessId])

  const addEmployee = async (employeeData) => {
    try {
      const { data, error } = await supabase
        .from('business_employees')
        .insert([{ ...employeeData, business_id: businessId }])
        .select()
        .single()

      if (error) throw error

      setEmployees(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateEmployee = async (id, employeeData) => {
    try {
      const { data, error } = await supabase
        .from('business_employees')
        .update(employeeData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setEmployees(prev =>
        prev.map(employee => (employee.id === id ? data : employee))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const removeEmployee = async (id) => {
    try {
      const { error } = await supabase
        .from('business_employees')
        .update({ status: 'removed' })
        .eq('id', id)

      if (error) throw error

      setEmployees(prev =>
        prev.map(employee =>
          employee.id === id ? { ...employee, status: 'removed' } : employee
        )
      )
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const importEmployeesCSV = async (csvData) => {
    try {
      const employeesToAdd = csvData.map(row => ({
        business_id: businessId,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        department: row.department,
        job_title: row.job_title,
        individual_budget_monthly: parseFloat(row.budget || 0),
        status: 'invited'
      }))

      const { data, error } = await supabase
        .from('business_employees')
        .insert(employeesToAdd)
        .select()

      if (error) throw error

      setEmployees(prev => [...data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return {
    employees,
    loading,
    error,
    refresh: fetchEmployees,
    addEmployee,
    updateEmployee,
    removeEmployee,
    importEmployeesCSV
  }
}

/**
 * Hook for managing business budgets
 */
export const useBusinessBudgets = (businessId) => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBudgets = async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_budgets')
        .select('*')
        .eq('business_id', businessId)
        .order('period_start', { ascending: false })

      if (fetchError) throw fetchError

      setBudgets(data || [])
    } catch (err) {
      console.error('Error fetching budgets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [businessId])

  const createBudget = async (budgetData) => {
    try {
      const { data, error } = await supabase
        .from('business_budgets')
        .insert([{ ...budgetData, business_id: businessId }])
        .select()
        .single()

      if (error) throw error

      setBudgets(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateBudget = async (id, budgetData) => {
    try {
      const { data, error } = await supabase
        .from('business_budgets')
        .update(budgetData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setBudgets(prev =>
        prev.map(budget => (budget.id === id ? data : budget))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return {
    budgets,
    loading,
    error,
    refresh: fetchBudgets,
    createBudget,
    updateBudget
  }
}

/**
 * Hook for quote requests (admin)
 */
export const useQuoteRequests = () => {
  const [quoteRequests, setQuoteRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQuoteRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_quote_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setQuoteRequests(data || [])
    } catch (err) {
      console.error('Error fetching quote requests:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuoteRequests()
  }, [])

  const updateQuoteRequest = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('business_quote_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setQuoteRequests(prev =>
        prev.map(quote => (quote.id === id ? data : quote))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return {
    quoteRequests,
    loading,
    error,
    refresh: fetchQuoteRequests,
    updateQuoteRequest
  }
}

/**
 * Hook for business invoices
 */
export const useBusinessInvoices = (businessId) => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInvoices = async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_invoices')
        .select('*')
        .eq('business_id', businessId)
        .order('period_start', { ascending: false })

      if (fetchError) throw fetchError

      setInvoices(data || [])
    } catch (err) {
      console.error('Error fetching invoices:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [businessId])

  const generateMonthlyInvoice = async (year, month) => {
    try {
      // Calculate period
      const periodStart = new Date(year, month - 1, 1)
      const periodEnd = new Date(year, month, 0)

      // Get all B2B orders for this business in this period
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_b2b_order', true)
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', periodEnd.toISOString())

      if (ordersError) throw ordersError

      // Calculate totals
      const subtotal = orders.reduce((sum, order) => sum + parseFloat(order.subtotal || 0), 0)
      const taxAmount = orders.reduce((sum, order) => sum + parseFloat(order.tax_amount || 0), 0)
      const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)

      // Create invoice
      const { data, error } = await supabase
        .from('business_invoices')
        .insert([{
          business_id: businessId,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          order_count: orders.length,
          status: 'draft',
          due_date: new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }])
        .select()
        .single()

      if (error) throw error

      setInvoices(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
    generateMonthlyInvoice
  }
}

/**
 * Hook for B2B analytics
 */
export const useB2BAnalytics = (businessId) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch spending summary
      const { data: spendingData, error: spendingError } = await supabase
        .from('business_spending_summary')
        .select('*')
        .eq('business_id', businessId)
        .single()

      if (spendingError && spendingError.code !== 'PGRST116') throw spendingError

      // Fetch employee spending
      const { data: employeeData, error: employeeError } = await supabase
        .from('employee_spending_summary')
        .select('*')
        .eq('business_id', businessId)

      if (employeeError) throw employeeError

      setAnalytics({
        summary: spendingData || {},
        employeeSpending: employeeData || []
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [businessId])

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics
  }
}
