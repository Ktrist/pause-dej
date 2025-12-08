import { loadStripe } from '@stripe/stripe-js'
import { STRIPE_PUBLISHABLE_KEY } from './config'

/**
 * Stripe client instance
 * Loads the Stripe.js library with the publishable key
 *
 * IMPORTANT: You need to set VITE_STRIPE_PUBLISHABLE_KEY in your .env file
 * Get this key from: https://dashboard.stripe.com/apikeys
 *
 * For testing, use your test mode publishable key (starts with pk_test_)
 * For production, use your live mode publishable key (starts with pk_live_)
 */

// Initialize Stripe
let stripePromise = null

export const getStripe = () => {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.warn(
        'Stripe publishable key is missing. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file'
      )
      return null
    }

    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }

  return stripePromise
}

export default getStripe
