/**
 * Delivery Zones Configuration
 *
 * Manages delivery zones for Pause Dej'
 * Initially limited to Annecy, Annecy-le-Vieux, and Argonay
 * Designed to be easily extensible for future zones
 */

/**
 * Delivery zones configuration
 * Each zone has:
 * - id: unique identifier
 * - name: display name
 * - cities: array of city names (case-insensitive)
 * - postalCodes: array of postal codes
 * - deliveryFee: delivery fee in euros
 * - active: whether the zone is currently accepting deliveries
 */
export const DELIVERY_ZONES = [
  {
    id: 'annecy',
    name: 'Annecy',
    cities: ['annecy'],
    postalCodes: ['74000'],
    deliveryFee: 3.5,
    active: true
  },
  {
    id: 'annecy-le-vieux',
    name: 'Annecy-le-Vieux',
    cities: ['annecy-le-vieux', 'annecy le vieux'],
    postalCodes: ['74940'],
    deliveryFee: 3.5,
    active: true
  },
  {
    id: 'argonay',
    name: 'Argonay',
    cities: ['argonay'],
    postalCodes: ['74370'],
    deliveryFee: 4.0,
    active: true
  }
]

/**
 * Get all active delivery zones
 * @returns {Array} - Array of active zones
 */
export function getActiveDeliveryZones() {
  return DELIVERY_ZONES.filter(zone => zone.active)
}

/**
 * Check if a city is in a delivery zone
 * @param {string} city - City name
 * @returns {Object|null} - Delivery zone object or null if not found
 */
export function findDeliveryZoneByCity(city) {
  if (!city) return null

  const normalizedCity = city.toLowerCase().trim()

  return DELIVERY_ZONES.find(zone =>
    zone.active && zone.cities.some(zoneCity =>
      zoneCity.toLowerCase() === normalizedCity
    )
  )
}

/**
 * Check if a postal code is in a delivery zone
 * @param {string} postalCode - Postal code
 * @returns {Object|null} - Delivery zone object or null if not found
 */
export function findDeliveryZoneByPostalCode(postalCode) {
  if (!postalCode) return null

  const normalizedPostalCode = postalCode.trim()

  return DELIVERY_ZONES.find(zone =>
    zone.active && zone.postalCodes.includes(normalizedPostalCode)
  )
}

/**
 * Validate if an address is in a delivery zone
 * @param {Object} address - Address object with city and/or postalCode
 * @returns {Object} - { isValid: boolean, zone: Object|null, message: string }
 */
export function validateDeliveryAddress(address) {
  if (!address) {
    return {
      isValid: false,
      zone: null,
      message: 'Adresse manquante'
    }
  }

  // Try to find zone by postal code first (more reliable)
  let zone = null
  if (address.postalCode) {
    zone = findDeliveryZoneByPostalCode(address.postalCode)
  }

  // Fallback to city if postal code not found
  if (!zone && address.city) {
    zone = findDeliveryZoneByCity(address.city)
  }

  if (zone) {
    return {
      isValid: true,
      zone: zone,
      message: `Livraison disponible à ${zone.name} (${zone.deliveryFee}€)`
    }
  }

  return {
    isValid: false,
    zone: null,
    message: 'Désolé, nous ne livrons pas encore dans cette zone. Actuellement, nous livrons uniquement à Annecy, Annecy-le-Vieux et Argonay.'
  }
}

/**
 * Get delivery fee for an address
 * @param {Object} address - Address object
 * @returns {number} - Delivery fee in euros (0 if zone not found)
 */
export function getDeliveryFee(address) {
  const validation = validateDeliveryAddress(address)
  return validation.isValid ? validation.zone.deliveryFee : 0
}

/**
 * Get list of all deliverable cities (for display in forms)
 * @returns {Array} - Array of city names
 */
export function getDeliverableCities() {
  return getActiveDeliveryZones().map(zone => zone.name)
}

/**
 * Get list of all deliverable postal codes (for display in forms)
 * @returns {Array} - Array of postal codes
 */
export function getDeliverablePostalCodes() {
  return getActiveDeliveryZones().flatMap(zone => zone.postalCodes)
}

/**
 * Format delivery zones for display
 * @returns {string} - Formatted string like "Annecy, Annecy-le-Vieux et Argonay"
 */
export function formatDeliveryZones() {
  const cities = getDeliverableCities()

  if (cities.length === 0) return 'Aucune zone de livraison'
  if (cities.length === 1) return cities[0]
  if (cities.length === 2) return `${cities[0]} et ${cities[1]}`

  const lastCity = cities[cities.length - 1]
  const otherCities = cities.slice(0, -1).join(', ')
  return `${otherCities} et ${lastCity}`
}
