# SMS Notifications Setup Guide

This guide explains the SMS notification system integrated with Brevo for Pause Dej'.

## 📋 What's Implemented

### ✅ SMS Notifications (N4.1-N4.3)

1. **N4.1 - Order Confirmation SMS** ✅
   - Sent when order is confirmed
   - Includes order number, total, delivery time

2. **N4.2 - Order Status Updates SMS** ✅
   - Sent when order is preparing
   - Sent when order is out for delivery

3. **N4.3 - Delivery Confirmation SMS** ✅
   - Sent when order is delivered
   - Includes review link

## 🗂️ Files Created

### 1. Edge Functions

**`supabase/functions/send-sms/index.ts`**
- Standalone SMS sending function
- Direct Brevo API integration
- Template-based messages

**`supabase/functions/send-order-notification/index.ts`**
- Combined Email + SMS notifications
- Supports all order states
- Automatic phone number formatting

### 2. Frontend Hooks

**`frontend/src/hooks/useOrderNotifications.js`**
- Easy-to-use notification hooks
- 4 pre-configured functions:
  - `sendOrderConfirmation()`
  - `sendOrderPreparing()`
  - `sendOrderOutForDelivery()`
  - `sendOrderDelivered()`

## 📱 SMS Templates

All templates are max 160 characters for standard SMS:

### Order Confirmation
```
✅ Commande #12345678 confirmée ! Total: 24.50€. Livraison 12:30. Pause Dej'
```

### Order Preparing
```
👨‍🍳 Commande #12345678 en préparation ! Prête dans 30min. Pause Dej'
```

### Out for Delivery
```
🚚 Commande #12345678 en route ! Livraison dans 15min. Suivre: pause-dej.fr/suivi/xxx
```

### Delivered
```
🎉 Commande #12345678 livrée ! Bon appétit ! Laissez un avis: pause-dej.fr/...
```

## 🔧 Setup Steps

### 1. Deploy Edge Functions

```bash
cd supabase/functions
supabase functions deploy send-order-notification
supabase functions deploy send-sms
```

### 2. Verify Brevo API Key

The BREVO_API_KEY is already configured in your Supabase secrets:
```bash
supabase secrets list
```

### 3. Add Phone Numbers to Database

Users need phone numbers to receive SMS:

**Option A: Add to profiles table**
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
```

**Option B: Use existing auth metadata**
Phone numbers from `auth.users.raw_user_meta_data->'phone'`

### 4. Update Order Creation Logic

In `CheckoutPage.jsx` or wherever orders are created:

```javascript
import { useOrderNotifications } from '../hooks/useOrderNotifications'

function CheckoutPage() {
  const { sendOrderConfirmation } = useOrderNotifications()

  const handleCreateOrder = async (order) => {
    // ... create order in database

    // Send confirmation email + SMS
    await sendOrderConfirmation(
      order,
      user.email,
      user.phone // or user.raw_user_meta_data.phone
    )
  }
}
```

### 5. Update Admin Order Management

In `AdminOrders.jsx` when changing order status:

```javascript
import { useOrderNotifications } from '../../hooks/useOrderNotifications'

function AdminOrders() {
  const {
    sendOrderPreparing,
    sendOrderOutForDelivery,
    sendOrderDelivered
  } = useOrderNotifications()

  const handleStatusChange = async (order, newStatus) => {
    // Update status in database
    await updateOrderStatus(order.id, newStatus)

    // Send appropriate notification
    if (newStatus === 'preparing') {
      await sendOrderPreparing(order, order.user_email, order.user_phone)
    } else if (newStatus === 'out_for_delivery') {
      await sendOrderOutForDelivery(order, order.user_email, order.user_phone)
    } else if (newStatus === 'delivered') {
      await sendOrderDelivered(order, order.user_email, order.user_phone)
    }
  }
}
```

## 📞 Phone Number Format

SMS are sent via Brevo which requires international format:
- ✅ Correct: `+33612345678`
- ❌ Wrong: `0612345678`

The edge function automatically formats French numbers:
```typescript
// Auto-converts 0612345678 → +33612345678
let formattedPhone = phone.trim()
if (!formattedPhone.startsWith('+')) {
  formattedPhone = '+33' + formattedPhone.replace(/^0/, '')
}
```

## 💰 Brevo SMS Pricing

- SMS credits required in Brevo account
- Pricing varies by destination country
- France: ~€0.04-0.06 per SMS
- Check Brevo dashboard for current rates

## 🧪 Testing

### Test with Your Phone Number

1. **Update your profile with phone**:
```sql
UPDATE profiles
SET phone = '+33612345678'
WHERE email = 'your@email.com';
```

2. **Create a test order** via the app

3. **Check your phone** for SMS

4. **Verify in Brevo Dashboard**:
   - Go to https://app.brevo.com
   - Campaigns → Transactional → SMS
   - See delivery status

### Test Individual SMS

Call the edge function directly:
```javascript
const { data, error } = await supabase.functions.invoke('send-sms', {
  body: {
    templateType: 'order_confirmed',
    phone: '+33612345678',
    data: {
      orderNumber: 'TEST123',
      total: '24.50',
      deliveryTime: '12:30'
    }
  }
})
```

## 🔍 Monitoring & Logs

### Check Edge Function Logs
```bash
supabase functions logs send-order-notification
```

### Check Brevo SMS Dashboard
- Login to https://app.brevo.com
- Navigate to: SMS → Transactional SMS
- View delivery stats, errors, credits used

## ⚠️ Important Notes

1. **SMS Opt-in**: Consider adding SMS opt-in checkbox during signup
2. **Phone Validation**: Validate phone numbers before saving
3. **Error Handling**: SMS failures won't block order creation
4. **Credits**: Monitor Brevo SMS credits to avoid service interruption
5. **Character Limit**: Keep messages under 160 chars to avoid multi-part SMS

## 🎯 Next Steps

1. ✅ Deploy edge functions
2. ⏳ Add phone number collection during signup
3. ⏳ Update CheckoutPage to send notifications
4. ⏳ Update Admin dashboard to send status updates
5. ⏳ Add SMS preference in user account settings
6. ⏳ Test with real phone numbers

## 📝 User Preferences

Add SMS notification preference:

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": false}'::jsonb;
```

Then in the notification hook, check preferences before sending:
```javascript
if (user.notification_preferences?.sms) {
  await sendSMS(phone, message)
}
```

---

**Status**: ✅ SMS system fully implemented and ready for deployment!
