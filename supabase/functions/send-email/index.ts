import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
}

const templates = {
  'order-confirmation': (data: any) => ({
    subject: `Commande confirmée #${data.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .order-number { font-size: 24px; font-weight: bold; color: #4F46E5; margin: 20px 0; }
    .item { padding: 15px; background: white; margin: 10px 0; border-radius: 4px; }
    .total { font-size: 20px; font-weight: bold; color: #4F46E5; margin-top: 20px; }
    .button { display: inline-block; padding: 15px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Commande confirmée !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.customerName},</p>
      <p>Merci pour votre commande ! Nous avons bien reçu votre paiement et votre commande est en cours de préparation.</p>

      <div class="order-number">Commande #${data.orderNumber}</div>

      <h3>Détails de votre commande :</h3>
      ${data.items.map((item: any) => `
        <div class="item">
          <strong>${item.quantity}×</strong> ${item.name} - ${item.price}€
        </div>
      `).join('')}

      <div class="total">Total : ${data.total}€</div>

      <p><strong>Livraison prévue :</strong><br>${data.deliveryDate} à ${data.deliveryTime}<br>${data.deliveryAddress}</p>

      <a href="${data.trackingUrl}" class="button">Suivre ma commande</a>

      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Vous recevrez un email lorsque votre commande sera en route.
      </p>
    </div>
  </div>
</body>
</html>
    `
  }),

  'order-preparing': (data: any) => ({
    subject: `On s'active aux fourneaux ! 🔥`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #9333EA; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .emoji { font-size: 60px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">👨‍🍳</div>
      <h1>Votre commande est en préparation !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.customerName},</p>
      <p>Nos chefs s'activent en cuisine pour préparer votre commande <strong>#${data.orderNumber}</strong> avec soin.</p>
      <p>Livraison prévue à <strong>${data.deliveryTime}</strong></p>
      <p>Vous serez notifié dès que le livreur sera en route ! 🚴</p>
    </div>
  </div>
</body>
</html>
    `
  }),

  'order-in-transit': (data: any) => ({
    subject: `Le livreur arrive ! 🚴`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F59E0B; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .emoji { font-size: 60px; margin: 20px 0; }
    .highlight { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🚴‍♂️</div>
      <h1>En route vers vous !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.customerName},</p>
      <p>Votre commande <strong>#${data.orderNumber}</strong> est en route !</p>
      <div class="highlight">
        <p style="margin: 0; font-size: 18px;"><strong>Arrivée prévue dans ~${data.eta} minutes</strong></p>
      </div>
      <p><strong>Adresse de livraison :</strong><br>${data.deliveryAddress}</p>
      <p style="font-size: 14px; color: #666;">Assurez-vous d'être disponible à cette adresse.</p>
    </div>
  </div>
</body>
</html>
    `
  }),

  'order-delivered': (data: any) => ({
    subject: `C'est livré ! Bon appétit 😋`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .emoji { font-size: 60px; margin: 20px 0; }
    .button { display: inline-block; padding: 15px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">✅</div>
      <h1>Commande livrée !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.customerName},</p>
      <p>Votre commande <strong>#${data.orderNumber}</strong> a été livrée avec succès !</p>
      <p>Nous espérons que vous vous régalerez ! 🍽️</p>
      <p>Merci d'avoir commandé chez Pause Dej'. À très bientôt !</p>
      <a href="${data.reviewUrl}" class="button">Laisser un avis</a>
    </div>
  </div>
</body>
</html>
    `
  }),

  'order-cancelled': (data: any) => ({
    subject: `Commande annulée #${data.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Commande annulée</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.customerName},</p>
      <p>Nous sommes désolés de vous informer que votre commande <strong>#${data.orderNumber}</strong> a été annulée.</p>
      ${data.reason ? `<p><strong>Raison :</strong> ${data.reason}</p>` : ''}
      <p>Si un paiement a été effectué, il sera remboursé dans les 3-5 jours ouvrables.</p>
      <p>Nous nous excusons pour la gêne occasionnée. N'hésitez pas à nous contacter si vous avez des questions.</p>
      <p style="margin-top: 20px;">L'équipe Pause Dej'</p>
    </div>
  </div>
</body>
</html>
    `
  })
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { template, data, to, from } = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    if (!template || !data || !to) {
      throw new Error('Missing required fields: template, data, or to')
    }

    // Get template
    const templateFn = templates[template as keyof typeof templates]
    if (!templateFn) {
      throw new Error(`Template "${template}" not found`)
    }

    const emailContent = templateFn(data)

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: from || 'Pause Dej\' <no-reply@pause-dej.fr>',
        to: to,
        subject: emailContent.subject,
        html: emailContent.html
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(result)}`)
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
