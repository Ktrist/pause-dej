# Brevo Integration Summary

This document summarizes the implementation of Brevo API integration for both Email and SMS campaigns.

## What Was Implemented

### 1. Template Preview Component
**File**: `frontend/src/components/newsletter/CampaignTemplatePreview.jsx`

- Visual template selection with preview cards
- Support for both Email and SMS templates
- Email templates: newsletter, promo, reactivation, announcement
- SMS templates: sms-promo, sms-order, sms-reactivation
- Shows template fields, descriptions, and examples
- Character count for SMS templates (160 max)

### 2. Updated Admin Newsletter Page
**File**: `frontend/src/pages/admin/AdminNewsletter.jsx`

Added to campaign creation modal:
- Channel selection (Email/SMS) with radio buttons
- Integrated CampaignTemplatePreview component
- Conditional rendering of subject/preview_text fields (Email only)
- Character counter for SMS content
- Dynamic labels and placeholders based on channel

### 3. Database Migration for Brevo Support
**File**: `supabase/migrations/add_brevo_support_to_campaigns.sql`

Changes:
- Added `channel` column to `newsletter_campaigns` (email/sms)
- Added `template_id` column to `newsletter_campaigns`
- Made `subject` column nullable (not required for SMS)
- Added `phone` column to `newsletter_subscribers`
- Added `sms_notifications` preference to subscriber preferences
- Added indexes for performance

### 4. Brevo Edge Function
**File**: `supabase/functions/send-newsletter/index.ts`

Replaced Resend with Brevo API:
- `sendEmailViaBrevo()`: Sends emails using Brevo SMTP API
- `sendSMSViaBrevo()`: Sends SMS using Brevo Transactional SMS API
- Support for both email and SMS campaigns in same function
- Template selection based on `template_id`
- Automatic subscriber filtering by channel and preferences
- Error tracking and campaign statistics

### 5. Updated Documentation
**File**: `NEWSLETTER_SETUP.md`

Updated sections:
- Added 4th migration step for Brevo support
- Changed from Resend to Brevo API setup
- Added multi-channel campaign creation instructions
- Added SMS content format examples
- Updated subscriber segmentation for SMS
- Updated troubleshooting for SMS campaigns

## How It Works

### Email Campaign Flow
1. Admin selects "Email" channel in campaign modal
2. Chooses email template (newsletter, promo, reactivation, announcement)
3. Enters subject, preview text, and JSON content
4. Sends campaign via Brevo SMTP API
5. Subscribers filtered by email preferences

### SMS Campaign Flow
1. Admin selects "SMS" channel in campaign modal
2. Chooses SMS template (sms-promo, sms-order, sms-reactivation)
3. Enters plain text message (max 160 characters)
4. Sends campaign via Brevo Transactional SMS API
5. Subscribers filtered by phone number and SMS preferences

## Template System

### Email Templates (4 types)
- **newsletter**: Weekly digest with gradient header
- **promo**: Promotional offers with promo codes
- **reactivation**: Win-back inactive customers
- **announcement**: Important updates

Each template accepts JSON data and renders HTML with proper styling.

### SMS Templates (3 types)
- **sms-promo**: Promotional SMS with code
- **sms-order**: Order status updates
- **sms-reactivation**: Customer reactivation

Each template has 160 character limit and example text.

## Setup Requirements

### Brevo Account Setup
1. Create account at https://brevo.com
2. Get API key from account settings
3. Enable Email and SMS services
4. Configure sender name and number for SMS

### Supabase Configuration
1. Add `BREVO_API_KEY` to Supabase Edge Function secrets
2. Run all 4 database migrations in order:
   - `add_admin_role_to_profiles.sql`
   - `add_newsletter_system.sql`
   - `add_brevo_support_to_campaigns.sql`
3. Deploy send-newsletter Edge Function
4. Set admin role in profiles table

### Frontend Configuration
No additional configuration needed - all template data is hardcoded in components.

## Testing Steps

### Test Email Campaign
1. Log in as admin
2. Go to `/admin/newsletter`
3. Create new campaign
4. Select "Email" channel
5. Choose "promo" template
6. Fill in JSON content:
```json
{
  "title": "Test Campaign",
  "discount": "-10%",
  "heading": "Test Heading",
  "description": "Test description",
  "promoCode": "TEST10",
  "expiryDate": "31/12/2025"
}
```
7. Send to test subscriber
8. Check Brevo dashboard for delivery

### Test SMS Campaign
1. Create new campaign
2. Select "SMS" channel
3. Choose "sms-promo" template
4. Enter message (max 160 chars):
```
🎉 Test SMS from Pause Dej! -10% with code TEST10. pause-dej.fr
```
5. Send to test subscriber with phone number
6. Check Brevo SMS dashboard

## Subscriber Management

### Email Subscribers
- Must have email address
- Can set preferences: weekly_newsletter, promotions, product_updates
- Managed via account page Newsletter tab

### SMS Subscribers
- Must have phone number in `newsletter_subscribers.phone`
- Must enable `sms_notifications: true` in preferences
- Can opt-in/out independently from email

## API Endpoints

### Brevo Email API
- Endpoint: `https://api.brevo.com/v3/smtp/email`
- Method: POST
- Headers: `api-key`, `content-type: application/json`
- Body: sender, to, subject, htmlContent

### Brevo SMS API
- Endpoint: `https://api.brevo.com/v3/transactionalSMS/sms`
- Method: POST
- Headers: `api-key`, `content-type: application/json`
- Body: type, sender, recipient, content

## Next Steps

1. **Run Migrations**: Execute all SQL migrations in Supabase
2. **Configure Brevo**: Set up Brevo account and get API key
3. **Deploy Function**: Deploy send-newsletter Edge Function
4. **Set Admin Role**: Update profiles table with admin role
5. **Test Campaigns**: Send test email and SMS campaigns
6. **Add Subscribers**: Ensure subscribers have phone numbers for SMS
7. **Monitor Performance**: Track open rates and delivery in Brevo dashboard

## Known Limitations

- SMS sender name "PauseDej" may require Brevo approval
- SMS pricing depends on Brevo plan and destination country
- Phone numbers must be in international format for SMS
- 160 character limit for SMS (standard limit)
- Email templates are hardcoded in Edge Function (not editable in UI)

## Files Changed

1. `frontend/src/components/newsletter/CampaignTemplatePreview.jsx` (NEW)
2. `frontend/src/pages/admin/AdminNewsletter.jsx` (MODIFIED)
3. `supabase/migrations/add_brevo_support_to_campaigns.sql` (NEW)
4. `supabase/functions/send-newsletter/index.ts` (MODIFIED - Resend → Brevo)
5. `NEWSLETTER_SETUP.md` (MODIFIED)
6. `BREVO_INTEGRATION_SUMMARY.md` (NEW - this file)
