/**
 * Greeting Utilities
 *
 * Provides time-based greeting messages in French
 */

/**
 * Get appropriate greeting based on current time
 * @returns {string} - "Bonjour", "Bon après-midi", or "Bonsoir"
 */
export function getTimeBasedGreeting() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'Bonjour'
  } else if (hour >= 12 && hour < 18) {
    return 'Bon après-midi'
  } else {
    return 'Bonsoir'
  }
}

/**
 * Get full greeting with user's first name
 * @param {Object} user - User object with full_name or raw_user_meta_data
 * @returns {string} - Full greeting like "Bonjour Tristan"
 */
export function getPersonalizedGreeting(user) {
  const greeting = getTimeBasedGreeting()

  if (!user) {
    return greeting
  }

  // Try to get first name from various possible locations
  let firstName = null

  // From metadata (OAuth users)
  if (user.user_metadata?.full_name) {
    firstName = user.user_metadata.full_name.split(' ')[0]
  }
  // From raw metadata
  else if (user.raw_user_meta_data?.full_name) {
    firstName = user.raw_user_meta_data.full_name.split(' ')[0]
  }
  // From email (fallback)
  else if (user.email) {
    firstName = user.email.split('@')[0]
    // Capitalize first letter
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  }

  return firstName ? `${greeting} ${firstName}` : greeting
}

/**
 * Get greeting emoji based on time
 * @returns {string} - Time-appropriate emoji
 */
export function getGreetingEmoji() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return '☀️' // Morning sun
  } else if (hour >= 12 && hour < 18) {
    return '🌤️' // Afternoon sun with clouds
  } else {
    return '🌙' // Evening moon
  }
}
