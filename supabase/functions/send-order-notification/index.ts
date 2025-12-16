import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Messages selon le statut de commande
const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed: {
    title: 'Commande confirmée ! 🎉',
    body: 'Votre commande a bien été reçue'
  },
  preparing: {
    title: 'Préparation en cours 👨‍🍳',
    body: 'Nos chefs préparent votre commande avec soin'
  },
  ready: {
    title: 'Commande prête ! ✅',
    body: 'Votre commande est prête à être livrée'
  },
  in_delivery: {
    title: 'En route ! 🚚',
    body: 'Votre livraison arrive bientôt'
  },
  delivered: {
    title: 'Livré ! 🎊',
    body: 'Votre commande a été livrée. Bon appétit !'
  }
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Send a Web Push notification using the Web Push Protocol
 */
async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  vapidDetails: {
    subject: string
    publicKey: string
    privateKey: string
  }
): Promise<void> {
  console.log('Sending push notification to:', subscription.endpoint)

  // Import web-push library for Deno
  const webpush = await import('https://esm.sh/web-push@3.6.3')

  webpush.default.setVapidDetails(
    vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey
  )

  await webpush.default.sendNotification(subscription, payload)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type'
      }
    })
  }

  try {
    const { user_id, order_number, status, old_status } = await req.json()

    console.log('Received notification request:', {
      user_id,
      order_number,
      status,
      old_status
    })

    // Vérifier que le statut est valide
    if (!STATUS_MESSAGES[status]) {
      return new Response(
        JSON.stringify({
          error: 'Invalid status',
          valid_statuses: Object.keys(STATUS_MESSAGES)
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Récupérer la subscription de l'utilisateur
    const { data: subData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user_id)
      .single()

    if (subError || !subData) {
      console.log('User not subscribed to push notifications:', user_id)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'User not subscribed to push notifications'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Parser la subscription
    const subscription = typeof subData.subscription === 'string'
      ? JSON.parse(subData.subscription)
      : subData.subscription

    // Récupérer les détails du message
    const message = STATUS_MESSAGES[status]

    // Préparer le payload de la notification
    const payload = JSON.stringify({
      title: message.title,
      body: `${message.body} (Commande #${order_number})`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/track/${order_number}`,
      tag: `order-${order_number}`,
      data: {
        order_number,
        status,
        timestamp: new Date().toISOString()
      },
      actions: [
        {
          action: 'view',
          title: 'Voir la commande'
        }
      ]
    })

    // Récupérer les clés VAPID
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contact@pause-dej.fr'
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured')
      return new Response(
        JSON.stringify({
          error: 'VAPID keys not configured'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Envoyer la notification
    try {
      await sendWebPush(
        subscription,
        payload,
        {
          subject: vapidSubject,
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey
        }
      )

      console.log('Push notification sent successfully to user:', user_id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Push notification sent successfully'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    } catch (pushError: any) {
      console.error('Error sending push notification:', pushError)

      // Si l'abonnement n'est plus valide, le supprimer
      if (pushError.statusCode === 410) {
        console.log('Subscription expired, removing from database')
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user_id)

        return new Response(
          JSON.stringify({
            success: false,
            message: 'Subscription expired and removed'
          }),
          {
            status: 410,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }

      throw pushError
    }
  } catch (error: any) {
    console.error('Error in send-order-notification function:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
