# 📧 Email Notifications Setup - Pause Dej'

This guide explains how to set up transactional email notifications using Resend.

## Overview

The application sends automatic emails at key moments of the order lifecycle:

- **Order Confirmation** (N1.2): After successful payment
- **Order Preparing** (N1.3): When kitchen starts preparing
- **Order In Transit** (N1.4): When delivery starts
- **Order Delivered** (N1.5): When order is delivered
- **Order Cancelled**: When admin cancels order

## Prerequisites

1. **Resend Account**: Sign up at [resend.com](https://resend.com)
2. **Verified Domain**: Add and verify your sending domain
3. **API Key**: Generate API key from Resend dashboard

## Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add and Verify Domain

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `pause-dej.fr`)
4. Add the DNS records provided by Resend to your domain's DNS settings:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
5. Wait for verification (usually 5-15 minutes)

> **Note**: While domain is pending verification, you can use Resend's test domain for development.

## Step 3: Generate API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it (e.g., "Pause Dej Production")
4. Select **Full Access** or **Sending Access**
5. Copy the API key (starts with `re_...`)

## Step 4: Configure Supabase

### Set Environment Variable

Set the `RESEND_API_KEY` secret in Supabase:

```bash
npx supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Deploy Email Function

The email function is located at `supabase/functions/send-email/index.ts`.

Deploy it:

```bash
npx supabase functions deploy send-email
```

### Test the Function

Test that emails are working:

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "template": "order-confirmation",
    "to": "test@example.com",
    "data": {
      "orderNumber": "PDJ-20231210-001",
      "customerName": "Test User",
      "items": [
        {"name": "Burger", "quantity": 2, "price": 12.90}
      ],
      "total": 25.80,
      "deliveryDate": "2023-12-10",
      "deliveryTime": "12:30",
      "deliveryAddress": "123 Test St, Paris",
      "trackingUrl": "https://pause-dej.fr/track/PDJ-20231210-001"
    }
  }'
```

## Email Templates

The following templates are available:

### 1. Order Confirmation (`order-confirmation`)

Sent after successful payment.

**Required data**:
- `orderNumber`: Order reference
- `customerName`: Customer's name
- `items`: Array of `{name, quantity, price}`
- `total`: Total amount
- `deliveryDate`: Delivery date
- `deliveryTime`: Delivery time
- `deliveryAddress`: Full address
- `trackingUrl`: Order tracking URL

### 2. Order Preparing (`order-preparing`)

Sent when kitchen starts preparing.

**Required data**:
- `orderNumber`: Order reference
- `customerName`: Customer's name
- `deliveryTime`: Expected delivery time

### 3. Order In Transit (`order-in-transit`)

Sent when delivery starts.

**Required data**:
- `orderNumber`: Order reference
- `customerName`: Customer's name
- `deliveryAddress`: Full address
- `eta`: Estimated arrival time in minutes

### 4. Order Delivered (`order-delivered`)

Sent when order is delivered.

**Required data**:
- `orderNumber`: Order reference
- `customerName`: Customer's name
- `reviewUrl`: URL to leave a review

### 5. Order Cancelled (`order-cancelled`)

Sent when order is cancelled.

**Required data**:
- `orderNumber`: Order reference
- `customerName`: Customer's name
- `reason`: Cancellation reason (optional)

## Email Triggers

Emails are automatically triggered in the following scenarios:

### Frontend (CheckoutPage)

```javascript
// After successful order creation
await sendOrderConfirmation(order, user.email)
```

### Admin Dashboard (AdminOrders)

```javascript
// When status changes
if (newStatus === 'preparing') {
  await sendOrderPreparing(order, order.users.email)
} else if (newStatus === 'in_transit') {
  await sendOrderInTransit(order, order.users.email)
} else if (newStatus === 'delivered') {
  await sendOrderDelivered(order, order.users.email)
}

// When order is cancelled
await sendOrderCancelled(order, order.users.email, reason)
```

## Customizing Email Templates

Email templates are defined in `supabase/functions/send-email/index.ts`.

To customize:

1. Edit the template HTML in the `templates` object
2. Redeploy the function:
   ```bash
   npx supabase functions deploy send-email
   ```

## Production Checklist

Before going to production:

- [ ] Domain verified in Resend
- [ ] DKIM/SPF records configured
- [ ] API key set in Supabase secrets
- [ ] Email function deployed
- [ ] Test emails sent successfully
- [ ] From address uses verified domain
- [ ] Email templates reviewed and approved
- [ ] Unsubscribe link added (if required by law)

## Monitoring

### View Email Logs

1. Go to Resend dashboard
2. Navigate to **Logs**
3. Filter by date, status, recipient

### Common Issues

**Emails not sending**:
- Check API key is correctly set: `npx supabase secrets list`
- Verify domain is verified in Resend
- Check function logs: `npx supabase functions logs send-email`

**Emails going to spam**:
- Ensure SPF, DKIM, DMARC records are configured
- Use verified domain in "From" address
- Avoid spam trigger words
- Keep good email sending reputation

**Rate limits**:
- Free plan: 100 emails/day
- Paid plans: Higher limits (check Resend pricing)

## Cost Estimation

**Resend Pricing** (as of 2024):
- Free: 100 emails/day, 3,000 emails/month
- Pro: $20/month for 50,000 emails/month
- Additional: $1 per 1,000 emails

**Estimated costs for Pause Dej'**:
- Assuming 100 orders/day
- ~4 emails per order (confirmation + 3 status updates)
- = 400 emails/day = 12,000 emails/month
- **Cost**: Free tier sufficient for initial launch

## Alternative Email Services

If Resend doesn't meet your needs, alternatives include:

1. **SendGrid**: Robust, good deliverability
2. **Mailgun**: Developer-friendly, good for transactional emails
3. **AWS SES**: Cost-effective for high volume
4. **Postmark**: Excellent deliverability, focused on transactional emails

To switch providers, update the API calls in `supabase/functions/send-email/index.ts`.

## Support

For issues:
- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- Supabase Functions: https://supabase.com/docs/guides/functions

---

**Last Updated**: 2025-12-10
