import { supabase } from '../lib/supabaseClient'

export function useOrderNotifications() {
  const sendNotification = async (templateType, email, phone, data) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-order-notification', {
        body: {
          templateType,
          email,
          phone,
          data,
          sendEmail: true,
          sendSMS: !!phone // Only send SMS if phone is provided
        }
      })

      if (error) throw error

      return { data: result, error: null }
    } catch (error) {
      console.error('Error sending notification:', error)
      return { data: null, error: error.message }
    }
  }

  const sendOrderConfirmation = async (order, customerEmail, customerPhone) => {
    return sendNotification(
      'order-confirmation',
      customerEmail,
      customerPhone,
      {
        customerName: order.customer_name || 'Client',
        orderNumber: order.id.substring(0, 8),
        items: order.order_items || [],
        total: order.total_price,
        deliveryDate: new Date(order.delivery_date).toLocaleDateString('fr-FR'),
        deliveryTime: order.delivery_time,
        deliveryAddress: order.delivery_address,
        trackingUrl: `${window.location.origin}/suivi/${order.id}`
      }
    )
  }

  const sendOrderPreparing = async (order, customerEmail, customerPhone) => {
    return sendNotification(
      'order-preparing',
      customerEmail,
      customerPhone,
      {
        customerName: order.customer_name || 'Client',
        orderNumber: order.id.substring(0, 8),
        deliveryTime: order.delivery_time,
        estimatedTime: '30min'
      }
    )
  }

  const sendOrderOutForDelivery = async (order, customerEmail, customerPhone) => {
    return sendNotification(
      'order-out-for-delivery',
      customerEmail,
      customerPhone,
      {
        customerName: order.customer_name || 'Client',
        orderNumber: order.id.substring(0, 8),
        eta: '15-30min',
        trackingUrl: `${window.location.origin}/suivi/${order.id}`
      }
    )
  }

  const sendOrderDelivered = async (order, customerEmail, customerPhone) => {
    return sendNotification(
      'order-delivered',
      customerEmail,
      customerPhone,
      {
        customerName: order.customer_name || 'Client',
        orderNumber: order.id.substring(0, 8),
        reviewUrl: `${window.location.origin}/compte?tab=avis&order=${order.id}`
      }
    )
  }

  return {
    sendNotification,
    sendOrderConfirmation,
    sendOrderPreparing,
    sendOrderOutForDelivery,
    sendOrderDelivered
  }
}
