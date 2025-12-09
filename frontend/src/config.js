export const APP_NAME = 'Pause Dej\''
export const APP_TAGLINE = 'Votre pause déjeuner réinventée'

// Debug: Log all environment variables
console.log('🔍 DEBUG - All Vite env vars:', import.meta.env)
console.log('🔍 DEBUG - VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
console.log('🔍 DEBUG - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

console.log('🔍 DEBUG - Loaded STRIPE_PUBLISHABLE_KEY:', STRIPE_PUBLISHABLE_KEY)

export const CONTACT_EMAIL = 'contact@pause-dej.fr'
