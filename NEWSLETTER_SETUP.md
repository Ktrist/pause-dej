# Newsletter System Setup Guide

This guide explains how to set up and use the Newsletter & Marketing Email system for Pause Dej'.

## 🗄️ Database Setup

You need to run **4 SQL migrations** in Supabase (in this order):

### 1. Add Admin Role to Profiles

**File**: `supabase/migrations/add_admin_role_to_profiles.sql`

This adds the `role` column to the profiles table.

```sql
-- Run this in Supabase SQL Editor
-- Copy content from: supabase/migrations/add_admin_role_to_profiles.sql
```

**After running, set yourself as admin:**

```sql
-- Replace with your email
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

### 2. Add Newsletter Tables

**File**: `supabase/migrations/add_newsletter_system.sql`

This creates the newsletter tables and policies.

```sql
-- Run this in Supabase SQL Editor
-- Copy content from: supabase/migrations/add_newsletter_system.sql
```

### 3. Add Brevo Support (Email & SMS)

**File**: `supabase/migrations/add_brevo_support_to_campaigns.sql`

This adds channel support and SMS capabilities.

```sql
-- Run this in Supabase SQL Editor
-- Copy content from: supabase/migrations/add_brevo_support_to_campaigns.sql
```

### 4. Verify Installation

In Supabase Table Editor, you should see:
- ✅ `profiles` table has `role` column
- ✅ `newsletter_subscribers` table with `phone` column
- ✅ `newsletter_campaigns` table with `channel` and `template_id` columns
- ✅ `campaign_recipients` table

## 📧 Brevo API Setup

The newsletter system uses Brevo (formerly Sendinblue) to send emails and SMS.

1. **Get Brevo API Key**
   - Go to https://brevo.com
   - Create account and get API key
   - Enable both Email and SMS services

2. **Add to Supabase Secrets**
   - Go to Project Settings → Edge Functions
   - Add secret: `BREVO_API_KEY` = `your_brevo_api_key`

3. **Deploy Edge Function**
   ```bash
   cd supabase/functions
   supabase functions deploy send-newsletter
   ```

## 🎯 Features Overview

### For Users

**1. Newsletter Opt-in During Signup**
- Checkbox on signup page (checked by default)
- GDPR compliant opt-in

**2. Newsletter Tab in Account**
- Subscribe/unsubscribe
- Manage preferences:
  - Weekly newsletter
  - Promotional offers
  - Product updates
- Real-time preference updates

**3. Homepage Subscription**
- Inline form on homepage
- Visible to all visitors
- Tracks source as 'homepage'

### For Admins

**1. Newsletter Dashboard** (`/admin/newsletter`)
- View subscriber statistics
- Manage campaigns
- Send newsletters

**2. Campaign Types**
- **Newsletter**: Weekly digest with featured dishes
- **Promo**: Promotional offers with codes
- **Reactivation**: Win-back inactive customers
- **Announcement**: Important updates

**3. Multi-Channel Support**
- **Email Campaigns**: Professional HTML templates with responsive design
- **SMS Campaigns**: Short text messages (max 160 characters)
- Automatic unsubscribe links for emails
- Template preview and selection in campaign creation

## 📝 How to Use (Admin)

### Create a Newsletter Campaign

1. Go to `/admin/newsletter`
2. Click "Nouvelle campagne"
3. Fill in:
   - **Name**: Internal name (e.g., "Newsletter Janvier 2024")
   - **Type**: Choose campaign type (newsletter, promo, reactivation, announcement)
   - **Channel**: Select Email or SMS
   - **Template**: Choose from available templates based on campaign type
   - **Subject**: Email subject line (email only)
   - **Preview Text**: Email preview (email only, optional)
   - **Content**:
     - For Email: JSON data for template
     - For SMS: Plain text message (max 160 characters)

4. Click "Créer"

### Campaign Content Format

**For Email Campaigns:**
The content field accepts JSON with template variables:

**Newsletter Example:**
```json
{
  "subtitle": "Vos plats favoris cette semaine",
  "content": "<h2>Nouveaux plats de la semaine</h2><p>Découvrez nos créations...</p>"
}
```

**Promo Example:**
```json
{
  "title": "Offre Spéciale -20%",
  "discount": "-20%",
  "heading": "20% de réduction sur tout le site !",
  "description": "Profitez de notre offre exceptionnelle",
  "promoCode": "PAUSE20",
  "expiryDate": "31 janvier 2024",
  "ctaText": "J'en profite !",
  "ctaUrl": "https://pause-dej.fr/catalogue"
}
```

**Reactivation Example:**
```json
{
  "customerName": "Jean",
  "daysSinceOrder": "30",
  "welcomeBackOffer": "-15% sur votre prochaine commande",
  "newDishes": [
    {
      "name": "Poulet Tikka Masala",
      "image": "https://...",
      "price": "12.50"
    }
  ],
  "lastFavoriteDish": "Lasagnes"
}
```

**For SMS Campaigns:**
Plain text message (max 160 characters):

**SMS Promo Example:**
```
🎉 PAUSE DEJ: -20% avec le code PAUSE20 valable jusqu'au 31/01. Commander: pause-dej.fr
```

**SMS Reactivation Example:**
```
Ça faisait longtemps! 😊 -15% sur votre retour avec RETOUR15. On vous a manqué? pause-dej.fr
```

### Send a Campaign

1. Campaign must be in "draft" status
2. Click the send icon (✉️)
3. Confirm sending
4. Campaign status changes to "sending" → "sent"
5. Track opens/clicks in campaign stats

## 🔍 Subscriber Segmentation

Campaigns are automatically sent to the right subscribers based on channel and preferences:

**Email Campaigns:**
- **newsletter** type → Only sends to users with `weekly_newsletter: true`
- **promo** type → Only sends to users with `promotions: true`
- **announcement** type → Sends to all active email subscribers

**SMS Campaigns:**
- Only sends to subscribers with a phone number
- Requires `sms_notifications: true` in preferences
- Additional filtering by campaign type (if applicable)

## 📊 Analytics

Track campaign performance:
- **Total sent**: Number of emails sent
- **Open rate**: % of emails opened (ready for future implementation)
- **Click rate**: % of emails clicked (ready for future implementation)

## 🛡️ Security & Privacy

**RLS Policies:**
- Users can only view/update their own subscription
- Campaign management is admin-only
- Subscribers table allows public inserts (for signup forms)

**GDPR Compliance:**
- Opt-in required for subscription
- Unsubscribe link in every email
- Preference management in account
- Clear privacy information

## 🔧 Troubleshooting

### "profiles.role does not exist"
Run the `add_admin_role_to_profiles.sql` migration first.

### "Permission denied for newsletter_campaigns"
Make sure you set your user as admin:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Emails/SMS not sending
1. Check Brevo API key is set in Supabase secrets
2. Check Edge Function is deployed
3. Check campaign has subscribers matching the type and channel
4. For SMS: Ensure subscribers have phone numbers and SMS preferences enabled
5. Check Brevo dashboard for errors and delivery status

### No subscribers found
Users must opt-in via:
- Signup checkbox
- Account page Newsletter tab
- Homepage subscription form

## 📚 File Structure

```
supabase/
├── migrations/
│   ├── add_admin_role_to_profiles.sql
│   └── add_newsletter_system.sql
└── functions/
    └── send-newsletter/
        └── index.ts

frontend/src/
├── hooks/
│   └── useNewsletter.js (4 hooks)
├── components/
│   └── newsletter/
│       └── NewsletterSubscribe.jsx (3 variants)
└── pages/
    ├── admin/
    │   └── AdminNewsletter.jsx
    ├── auth/
    │   └── SignupPage.jsx (with opt-in)
    ├── account/
    │   └── AccountPage.jsx (Newsletter tab)
    └── home/
        └── HomePage.jsx (with subscription)
```

## 🚀 Next Steps

1. Run all SQL migrations
2. Set yourself as admin
3. Deploy send-newsletter Edge Function
4. Create your first campaign
5. Test sending to yourself
6. Launch to users!

---

**Questions?** Check the main README or create an issue.
