import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// SMS Templates
const SMS_TEMPLATES = {
  order_confirmed: (data: any) =>
    `✅ Commande #${data.orderNumber} confirmée ! Total: ${data.total}€. Livraison prévue ${data.deliveryTime}. Pause Dej'`,

  order_preparing: (data: any) =>
    `👨‍🍳 Votre commande #${data.orderNumber} est en préparation ! Elle sera prête dans ${data.estimatedTime}. Pause Dej'`,

  order_out_for_delivery: (data: any) =>
    `🚚 Commande #${data.orderNumber} en route ! Livraison dans ${data.eta}. Suivre: ${data.trackingUrl}`,

  order_delivered: (data: any) =>
    `🎉 Commande #${data.orderNumber} livrée ! Bon appétit ! Laissez un avis: ${data.reviewUrl}`,

  promo_code: (data: any) =>
    `🎁 ${data.discount} avec le code ${data.promoCode} valable jusqu'au ${data.expiryDate}. Commander: pause-dej.fr`
}

async function sendSMS(phone: string, message: string) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY not configured')
  }

  // Ensure phone number is in international format
  let formattedPhone = phone.trim()
  if (!formattedPhone.startsWith('+')) {
    // Assume French number if no country code
    formattedPhone = '+33' + formattedPhone.replace(/^0/, '')
  }

  const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      type: 'transactional',
      sender: 'PauseDej',
      recipient: formattedPhone,
      content: message
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Brevo SMS error: ${error}`)
  }

  return await response.json()
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { templateType, phone, data } = await req.json()

    if (!templateType || !phone) {
      throw new Error('templateType and phone are required')
    }

    // Get template
    const template = SMS_TEMPLATES[templateType as keyof typeof SMS_TEMPLATES]
    if (!template) {
      throw new Error(`Unknown template type: ${templateType}`)
    }

    // Generate message
    const message = template(data || {})

    // Check length (max 160 chars for standard SMS)
    if (message.length > 160) {
      console.warn(`SMS message is ${message.length} chars, will be sent as multiple parts`)
    }

    // Send SMS
    const result = await sendSMS(phone, message)

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
        recipient: phone,
        length: message.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('SMS sending error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send SMS',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
