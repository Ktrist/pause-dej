import { useState } from 'react'
import { supabase } from '../supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * Hook to send transactional emails via Supabase Edge Function
 */
export function useEmail() {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const sendEmail = async (template, data, to, from) => {
    try {
      setSending(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            template,
            data,
            to,
            from
          })
        }
      )

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to send email')
      }

      return { success: true, data: result }
    } catch (err) {
      console.error('Error sending email:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSending(false)
    }
  }

  /**
   * Send order confirmation email (N1.2)
   */
  const sendOrderConfirmation = async (order, userEmail) => {
    return await sendEmail(
      'order-confirmation',
      {
        orderNumber: order.order_number,
        customerName: order.user?.full_name || 'Client',
        items: order.order_items?.map(item => ({
          name: item.dish_name,
          quantity: item.quantity,
          price: item.dish_price
        })) || [],
        total: order.total,
        deliveryDate: order.delivery_date,
        deliveryTime: order.delivery_time,
        deliveryAddress: `${order.delivery_street}, ${order.delivery_city}`,
        trackingUrl: `${window.location.origin}/track/${order.order_number}`
      },
      userEmail
    )
  }

  /**
   * Send order preparing email (N1.3)
   */
  const sendOrderPreparing = async (order, userEmail) => {
    return await sendEmail(
      'order-preparing',
      {
        orderNumber: order.order_number,
        customerName: order.user?.full_name || 'Client',
        deliveryTime: order.delivery_time
      },
      userEmail
    )
  }

  /**
   * Send order in transit email (N1.4)
   */
  const sendOrderInTransit = async (order, userEmail) => {
    return await sendEmail(
      'order-in-transit',
      {
        orderNumber: order.order_number,
        customerName: order.user?.full_name || 'Client',
        deliveryAddress: `${order.delivery_street}, ${order.delivery_city}`,
        eta: '10-15'
      },
      userEmail
    )
  }

  /**
   * Send order delivered email (N1.5)
   */
  const sendOrderDelivered = async (order, userEmail) => {
    return await sendEmail(
      'order-delivered',
      {
        orderNumber: order.order_number,
        customerName: order.user?.full_name || 'Client',
        reviewUrl: `${window.location.origin}/review/${order.id}`
      },
      userEmail
    )
  }

  /**
   * Send order cancelled email
   */
  const sendOrderCancelled = async (order, userEmail, reason) => {
    return await sendEmail(
      'order-cancelled',
      {
        orderNumber: order.order_number,
        customerName: order.user?.full_name || 'Client',
        reason
      },
      userEmail
    )
  }

  return {
    sending,
    error,
    sendEmail,
    sendOrderConfirmation,
    sendOrderPreparing,
    sendOrderInTransit,
    sendOrderDelivered,
    sendOrderCancelled
  }
}
