# Apple Pay / Google Pay Setup Guide

This guide explains how to enable and test Apple Pay and Google Pay in your Pause Dej' checkout.

## ✅ What's Implemented

- **Apple Pay**: One-tap checkout on iOS devices (Safari, Chrome on iOS)
- **Google Pay**: One-tap checkout on Android and supported browsers
- **Automatic Detection**: Payment buttons only show if available
- **Fallback**: Card payment always available

## 🔧 Setup Steps

### 1. No Additional Stripe Configuration Needed

Good news! Apple Pay and Google Pay work automatically with your existing Stripe account:
- ✅ Works in **test mode** immediately
- ✅ Works in **production mode** once your domain is verified

### 2. Domain Verification (Production Only)

For production (when you have your domain):

1. **Go to Stripe Dashboard**:
   - https://dashboard.stripe.com/settings/payment_methods

2. **Add Your Domain**:
   - Click "Apple Pay" section
   - Add `pause-dej.fr` (your domain)
   - Download verification file
   - Upload to `/.well-known/apple-developer-merchantid-domain-association`

3. **Google Pay** works automatically (no verification needed)

### 3. Testing

#### On iOS (Safari or Chrome)
- Must have Apple Pay set up in Wallet app
- Must be on **HTTPS** or **localhost**
- Button will show as "Apple Pay"

#### On Android (Chrome)
- Must have Google Pay set up
- Must be on **HTTPS** or **localhost**
- Button will show as "G Pay"

#### On Desktop
- Chrome/Edge: Google Pay available if signed in
- Safari (Mac): Apple Pay available
- Other browsers: Card payment only

## 📱 How It Works

### User Experience

1. **User goes to checkout**
2. **Sees payment options**:
   - If available: Apple Pay / Google Pay button (dark button at top)
   - Divider: "ou payer par carte"
   - Always: Card payment form

3. **Clicks Apple Pay / Google Pay**:
   - Native wallet opens
   - User confirms with Face ID / Touch ID / PIN
   - Payment completes instantly

4. **Or enters card manually**:
   - Traditional card form
   - Same Stripe flow

### Technical Flow

```
User clicks Apple Pay
  ↓
Browser checks if Apple Pay available
  ↓
PaymentRequest API initialized
  ↓
User confirms in Wallet
  ↓
Payment method created
  ↓
Backend creates Payment Intent
  ↓
Stripe confirms payment
  ↓
Order created
```

## 💻 Code Changes

### Updated Files

**`frontend/src/components/payment/PaymentForm.jsx`**
- Added `PaymentRequestButtonElement` import
- Added `useEffect` to initialize Payment Request API
- Added Apple Pay / Google Pay button UI
- Added payment event handlers

## 🧪 Testing Guide

### Test in Development (localhost)

1. **Start your dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open checkout** at `http://localhost:5173/checkout`

3. **Check for payment button**:
   - **iOS Safari**: Should see Apple Pay button
   - **Android Chrome**: Should see Google Pay button
   - **Desktop Chrome** (signed into Google): Might see Google Pay
   - **Other**: Only see card form

### Test with Test Cards

**Apple Pay / Google Pay Test Cards** (Stripe test mode):
- Add test cards to Apple Wallet / Google Pay
- Use Stripe test card numbers:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

### What to Test

- ✅ Button appears (if wallet available)
- ✅ Clicking button opens wallet
- ✅ Payment completes successfully
- ✅ Order is created in database
- ✅ User redirected to confirmation
- ✅ Card payment still works as fallback

## 🔍 Troubleshooting

### Button Not Showing

**Possible Causes**:
1. **Not on HTTPS or localhost**
   - Solution: Use `https://` or `localhost`

2. **Wallet not set up**
   - Solution: Add cards to Apple Wallet / Google Pay

3. **Wrong country**
   - Solution: Check `paymentRequest` country is 'FR'

4. **Browser not supported**
   - Solution: Use Safari (iOS), Chrome (Android), or modern desktop browser

### Payment Fails

**Check**:
1. Stripe API keys are correct
2. `create-payment-intent` edge function is deployed
3. Amount is in euros (not cents)
4. Browser console for errors

### Button Style Issues

**Customize** in `PaymentForm.jsx`:
```javascript
style: {
  paymentRequestButton: {
    type: 'default', // or 'buy', 'donate'
    theme: 'dark',   // or 'light', 'light-outline'
    height: '48px',
  },
}
```

## 📊 Analytics

Track payment methods used:

```javascript
// In metadata when creating payment intent
metadata: {
  source: 'pause-dej-checkout-wallet',
  paymentMethod: result?.applePay ? 'apple_pay' : 'google_pay',
}
```

View in Stripe Dashboard:
- Payments → Filter by metadata
- See which users use Apple Pay vs Google Pay vs Card

## 💡 User Benefits

### Why Users Love It

1. **Faster Checkout**
   - No typing card number
   - 1-click with Face ID / Touch ID
   - Pre-filled shipping

2. **More Secure**
   - Tokenized payments
   - No card details shared
   - Biometric authentication

3. **Better Mobile Experience**
   - Optimized for phones
   - Native feel
   - Familiar interface

### Conversion Rate Impact

Typically see **10-30% higher conversion** with wallet payments:
- Faster = less abandonment
- Familiar = more trust
- Mobile-optimized = better UX

## 🚀 Production Checklist

Before going live:

- [ ] Domain verified in Stripe (for Apple Pay)
- [ ] SSL certificate installed (HTTPS)
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test card fallback works
- [ ] Monitor Stripe dashboard
- [ ] Track conversion rates

## 📈 Next Steps

### Enhance Further

1. **Add more payment methods**:
   - PayPal
   - Klarna (buy now, pay later)
   - Bank transfer

2. **Optimize for mobile**:
   - Saved payment methods
   - One-click reorder
   - Express checkout

3. **A/B Testing**:
   - Button placement
   - Button style
   - Default vs Buy vs Donate

---

**Status**: ✅ Apple Pay / Google Pay fully implemented!

**Ready to test**: On localhost with wallet apps installed
**Ready for production**: After domain verification
