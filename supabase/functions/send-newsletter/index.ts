import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Newsletter email templates
const emailTemplates = {
  'newsletter': (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .dish-card { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .dish-image { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
    .button { display: inline-block; padding: 15px 40px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .footer { background: #2D3748; color: white; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Pause Dej' Newsletter</h1>
      <p style="margin-top: 10px; opacity: 0.9;">${data.subtitle || 'Vos plats favoris cette semaine'}</p>
    </div>
    <div class="content">
      ${data.content}
    </div>
    <div class="footer">
      <p><strong>Pause Dej'</strong><br>Votre pause déjeuner réinventée</p>
      <p style="margin-top: 20px; font-size: 12px; color: #A0AEC0;">
        Vous recevez cet email car vous êtes inscrit à notre newsletter.<br>
        <a href="${data.unsubscribeUrl}" style="color: #A0AEC0;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
  `,

  'promo': (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 50px 30px; text-align: center; }
    .promo-badge { background: #FEF3C7; color: #92400E; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 20px 0; }
    .content { padding: 40px 30px; }
    .promo-code { background: #4F46E5; color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 30px 0; }
    .button { display: inline-block; padding: 18px 50px; background: #EF4444; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 18px; }
    .footer { background: #2D3748; color: white; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
      <h1 style="font-size: 32px; margin: 0;">${data.title || 'Offre Spéciale !'}</h1>
      <div class="promo-badge">${data.discount || '-20%'}</div>
    </div>
    <div class="content">
      <h2 style="color: #4F46E5;">${data.heading}</h2>
      <p style="font-size: 18px; color: #4B5563;">${data.description}</p>

      ${data.promoCode ? `
        <div>
          <p style="font-weight: 600; margin-bottom: 10px;">Votre code promo :</p>
          <div class="promo-code">${data.promoCode}</div>
          <p style="font-size: 14px; color: #6B7280; text-align: center;">
            Valable jusqu'au ${data.expiryDate}
          </p>
        </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="${data.ctaUrl || 'https://pause-dej.fr/catalogue'}" class="button">
          ${data.ctaText || 'Profiter de l\'offre'}
        </a>
      </div>

      ${data.additionalContent || ''}
    </div>
    <div class="footer">
      <p><strong>Pause Dej'</strong></p>
      <p style="margin-top: 20px; font-size: 12px; color: #A0AEC0;">
        <a href="${data.unsubscribeUrl}" style="color: #A0AEC0;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
  `,

  'reactivation': (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 50px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .highlight { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .dishes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 30px 0; }
    .dish-item { background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; }
    .button { display: inline-block; padding: 18px 50px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 18px; }
    .footer { background: #2D3748; color: white; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 60px; margin-bottom: 20px;">😊</div>
      <h1 style="font-size: 32px; margin: 0;">Ça faisait longtemps !</h1>
      <p style="margin-top: 15px; opacity: 0.9; font-size: 18px;">
        On a de nouvelles choses à vous montrer
      </p>
    </div>
    <div class="content">
      <p style="font-size: 18px;">Bonjour ${data.customerName || 'cher client'},</p>

      <p style="font-size: 16px; color: #4B5563;">
        Cela fait ${data.daysSinceOrder || '30'} jours que nous ne vous avons pas vu !
        Pendant votre absence, nous avons ajouté de nouveaux plats délicieux et amélioré notre service.
      </p>

      <div class="highlight">
        <p style="margin: 0; font-weight: 600; color: #92400E;">
          🎁 Cadeau de bienvenue : ${data.welcomeBackOffer || '-15% sur votre prochaine commande'}
        </p>
      </div>

      <h3 style="color: #10B981; margin-top: 40px;">Découvrez nos nouveautés :</h3>

      ${data.newDishes ? `
        <div class="dishes-grid">
          ${data.newDishes.map((dish: any) => `
            <div class="dish-item">
              ${dish.image ? `<img src="${dish.image}" alt="${dish.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">` : ''}
              <div style="font-weight: 600; font-size: 14px;">${dish.name}</div>
              <div style="color: #4F46E5; font-weight: bold; margin-top: 5px;">${dish.price}€</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div style="text-align: center; margin-top: 40px;">
        <a href="${data.ctaUrl || 'https://pause-dej.fr/catalogue'}" class="button">
          Redécouvrir le catalogue
        </a>
      </div>

      <p style="font-size: 14px; color: #6B7280; margin-top: 30px; text-align: center;">
        Votre dernier plat préféré : <strong>${data.lastFavoriteDish || 'à redécouvrir'}</strong>
      </p>
    </div>
    <div class="footer">
      <p><strong>Pause Dej'</strong><br>On vous a manqué ? 😄</p>
      <p style="margin-top: 20px; font-size: 12px; color: #A0AEC0;">
        <a href="${data.unsubscribeUrl}" style="color: #A0AEC0;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
  `,

  'announcement': (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #4F46E5; color: white; padding: 50px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 18px 50px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 18px; }
    .footer { background: #2D3748; color: white; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="font-size: 32px; margin: 0;">${data.title || 'Annonce Importante'}</h1>
    </div>
    <div class="content">
      ${data.content}

      ${data.ctaText && data.ctaUrl ? `
        <div style="text-align: center; margin-top: 40px;">
          <a href="${data.ctaUrl}" class="button">
            ${data.ctaText}
          </a>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p><strong>Pause Dej'</strong></p>
      <p style="margin-top: 20px; font-size: 12px; color: #A0AEC0;">
        <a href="${data.unsubscribeUrl}" style="color: #A0AEC0;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

async function sendEmailViaBrevo(to: string, subject: string, htmlContent: string) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY!,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: 'Pause Dej\'',
        email: 'newsletter@pause-dej.fr'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Brevo email error: ${error}`)
  }

  return await response.json()
}

async function sendSMSViaBrevo(to: string, content: string) {
  const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY!,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      type: 'transactional',
      sender: 'PauseDej',
      recipient: to,
      content: content
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
    const { campaignId } = await req.json()

    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not configured')
    }

    if (!campaignId) {
      throw new Error('campaignId is required')
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campaign not found')
    }

    // Get subscribers based on campaign type and channel
    let subscribersQuery = supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('is_subscribed', true)

    // Filter by channel
    if (campaign.channel === 'sms') {
      subscribersQuery = subscribersQuery.not('phone', 'is', null)
      subscribersQuery = subscribersQuery.eq('preferences->>sms_notifications', 'true')
    } else {
      subscribersQuery = subscribersQuery.not('email', 'is', null)
    }

    // Filter by preferences for email campaigns
    if (campaign.channel === 'email') {
      if (campaign.campaign_type === 'newsletter') {
        subscribersQuery = subscribersQuery.eq('preferences->>weekly_newsletter', 'true')
      } else if (campaign.campaign_type === 'promo') {
        subscribersQuery = subscribersQuery.eq('preferences->>promotions', 'true')
      }
    }

    const { data: subscribers, error: subscribersError } = await subscribersQuery

    if (subscribersError) {
      throw new Error('Failed to fetch subscribers')
    }

    if (!subscribers || subscribers.length === 0) {
      throw new Error('No subscribers found for this campaign type')
    }

    // Update campaign status to sending
    await supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sending',
        total_recipients: subscribers.length
      })
      .eq('id', campaignId)

    // Send campaigns
    let sentCount = 0
    let errorCount = 0

    for (const subscriber of subscribers) {
      try {
        if (campaign.channel === 'sms') {
          // Send SMS
          await sendSMSViaBrevo(subscriber.phone, campaign.content)
        } else {
          // Send Email
          // Parse content as JSON or use as-is
          let emailData
          try {
            emailData = JSON.parse(campaign.content)
          } catch {
            emailData = { content: campaign.content }
          }

          // Add unsubscribe URL
          emailData.unsubscribeUrl = `${Deno.env.get('SITE_URL') || 'https://pause-dej.fr'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`

          // Get template function
          const templateFn = emailTemplates[campaign.template_id as keyof typeof emailTemplates] || emailTemplates.newsletter
          const htmlContent = templateFn(emailData)

          await sendEmailViaBrevo(subscriber.email, campaign.subject, htmlContent)
        }

        // Record successful send
        await supabase
          .from('campaign_recipients')
          .insert({
            campaign_id: campaignId,
            subscriber_id: subscriber.id,
            sent_at: new Date().toISOString()
          })

        sentCount++
      } catch (err) {
        console.error('Error sending to subscriber:', err)

        // Record error
        await supabase
          .from('campaign_recipients')
          .insert({
            campaign_id: campaignId,
            subscriber_id: subscriber.id,
            bounced: true,
            error_message: err.message || 'Failed to send'
          })

        errorCount++
      }
    }

    // Update campaign with final stats
    await supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_sent: sentCount
      })
      .eq('id', campaignId)

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        errorCount,
        totalRecipients: subscribers.length,
        channel: campaign.channel
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Newsletter sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send newsletter' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
