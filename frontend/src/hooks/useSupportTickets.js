import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Hook pour gérer les tickets de support - M7.3
 */
export function useSupportTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTickets = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setTickets(data || [])
    } catch (err) {
      console.error('Error fetching support tickets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [user])

  const createTicket = async (ticketData) => {
    try {
      const { data, error: createError } = await supabase
        .from('support_tickets')
        .insert([
          {
            ...ticketData,
            user_id: user?.id || null,
            email: ticketData.email || user?.email
          }
        ])
        .select()
        .single()

      if (createError) throw createError

      await fetchTickets()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating ticket:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets,
    createTicket
  }
}

/**
 * Hook pour récupérer les détails d'un ticket avec ses réponses
 */
export function useTicketDetails(ticketId) {
  const [ticket, setTicket] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ticketId) {
      setLoading(false)
      return
    }

    const fetchTicketDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select(`
            *,
            orders (
              id,
              order_number,
              created_at
            )
          `)
          .eq('id', ticketId)
          .single()

        if (ticketError) throw ticketError

        // Fetch responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('support_ticket_responses')
          .select(`
            *,
            profiles:user_id (
              full_name
            )
          `)
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true })

        if (responsesError) throw responsesError

        setTicket(ticketData)
        setResponses(responsesData || [])
      } catch (err) {
        console.error('Error fetching ticket details:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTicketDetails()

    // Subscribe to ticket updates
    const ticketSubscription = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticketId}`
        },
        () => {
          fetchTicketDetails()
        }
      )
      .subscribe()

    // Subscribe to new responses
    const responsesSubscription = supabase
      .channel(`ticket-responses-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_responses',
          filter: `ticket_id=eq.${ticketId}`
        },
        () => {
          fetchTicketDetails()
        }
      )
      .subscribe()

    return () => {
      ticketSubscription.unsubscribe()
      responsesSubscription.unsubscribe()
    }
  }, [ticketId])

  const addResponse = async (message) => {
    try {
      const { data, error: createError } = await supabase
        .from('support_ticket_responses')
        .insert([
          {
            ticket_id: ticketId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            message,
            is_staff_response: false
          }
        ])
        .select()
        .single()

      if (createError) throw createError

      return { data, error: null }
    } catch (err) {
      console.error('Error adding response:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    ticket,
    responses,
    loading,
    error,
    addResponse
  }
}

// Helper pour formater les catégories
export const getCategoryLabel = (category) => {
  const labels = {
    general: 'Général',
    order: 'Commande',
    delivery: 'Livraison',
    payment: 'Paiement',
    product: 'Produit',
    account: 'Compte',
    other: 'Autre'
  }
  return labels[category] || category
}

// Helper pour formater les statuts
export const getStatusLabel = (status) => {
  const labels = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Résolu',
    closed: 'Fermé'
  }
  return labels[status] || status
}

// Helper pour les couleurs de statut
export const getStatusColor = (status) => {
  const colors = {
    open: 'yellow',
    in_progress: 'blue',
    resolved: 'green',
    closed: 'gray'
  }
  return colors[status] || 'gray'
}
