import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook to check if user is a B2B employee and fetch their employee context
 * Used in checkout flow to enable budget payment option
 */
export function useB2BEmployee() {
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [business, setBusiness] = useState(null)
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchEmployeeContext()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchEmployeeContext = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Check if user is an employee
      const { data: employeeData, error: employeeError } = await supabase
        .from('business_employees')
        .select(`
          *,
          business:business_id (
            id,
            company_name,
            discount_rate,
            status
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (employeeError) throw employeeError

      if (!employeeData) {
        // User is not a B2B employee
        setEmployee(null)
        setBusiness(null)
        setBudget(null)
        setLoading(false)
        return
      }

      setEmployee(employeeData)
      setBusiness(employeeData.business)

      // Fetch current period budget
      const today = new Date()
      const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      const { data: budgetData, error: budgetError } = await supabase
        .from('business_budgets')
        .select('*')
        .eq('business_id', employeeData.business_id)
        .eq('is_active', true)
        .lte('period_start', periodEnd.toISOString().split('T')[0])
        .gte('period_end', periodStart.toISOString().split('T')[0])
        .maybeSingle()

      if (budgetError) throw budgetError

      // Calculate employee's remaining budget
      let employeeBudgetInfo = null
      if (budgetData && employeeData.individual_budget_monthly > 0) {
        // Fetch employee's spending this month
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('total')
          .eq('employee_id', employeeData.id)
          .eq('is_b2b_order', true)
          .eq('charged_to_budget', true)
          .gte('created_at', periodStart.toISOString())
          .lte('created_at', periodEnd.toISOString())

        if (ordersError) throw ordersError

        const spentThisMonth = ordersData?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0

        employeeBudgetInfo = {
          monthly_budget: employeeData.individual_budget_monthly,
          spent_this_month: spentThisMonth,
          remaining: employeeData.individual_budget_monthly - spentThisMonth,
          percentage_used: (spentThisMonth / employeeData.individual_budget_monthly) * 100,
          can_use_budget: (employeeData.individual_budget_monthly - spentThisMonth) > 0
        }
      }

      setBudget({
        business_budget: budgetData,
        employee_budget: employeeBudgetInfo
      })
    } catch (err) {
      console.error('Error fetching employee context:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Check if employee can place order with budget
  const canUseBudget = (orderTotal) => {
    if (!employee || !budget?.employee_budget) return false
    if (business?.status !== 'active') return false
    return budget.employee_budget.remaining >= orderTotal
  }

  // Get budget warning level
  const getBudgetWarningLevel = () => {
    if (!budget?.employee_budget) return null

    const percentageUsed = budget.employee_budget.percentage_used

    if (percentageUsed >= 90) return 'critical'
    if (percentageUsed >= 75) return 'warning'
    return 'normal'
  }

  return {
    employee,
    business,
    budget,
    loading,
    error,
    isEmployee: !!employee,
    isActiveEmployee: employee?.status === 'active',
    canUseBudget,
    getBudgetWarningLevel,
    refetch: fetchEmployeeContext
  }
}

/**
 * Hook to fetch employee by invitation token
 * Used in invitation acceptance flow
 */
export function useB2BInvitation(token) {
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      fetchInvitation()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchInvitation = async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('business_employees')
        .select(`
          *,
          business:business_id (
            id,
            company_name,
            contact_name,
            contact_email
          )
        `)
        .eq('invitation_token', token)
        .eq('status', 'invited')
        .maybeSingle()

      if (fetchError) throw fetchError

      if (!data) {
        setError('Invitation invalide ou expirée')
        setInvitation(null)
        setLoading(false)
        return
      }

      // Check if invitation is expired
      if (data.invitation_expires_at && new Date(data.invitation_expires_at) < new Date()) {
        setError('Cette invitation a expiré')
        setInvitation(null)
        setLoading(false)
        return
      }

      setInvitation(data)
    } catch (err) {
      console.error('Error fetching invitation:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (userId) => {
    if (!invitation) return { error: 'No invitation found' }

    try {
      const { data, error: updateError } = await supabase
        .from('business_employees')
        .update({
          user_id: userId,
          status: 'active',
          invitation_accepted_at: new Date().toISOString(),
          invitation_token: null,
          invitation_expires_at: null
        })
        .eq('id', invitation.id)
        .select()
        .single()

      if (updateError) throw updateError

      return { data, error: null }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    invitation,
    loading,
    error,
    isValid: !!invitation && !error,
    acceptInvitation,
    refetch: fetchInvitation
  }
}
