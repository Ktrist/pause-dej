/**
 * Valide la force d'un mot de passe
 * @param {string} password - Le mot de passe à valider
 * @returns {string|null} - Message d'erreur ou null si valide
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une lettre majuscule'
  }

  if (!/[a-z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une lettre minuscule'
  }

  if (!/[0-9]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un chiffre'
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)'
  }

  return null // Mot de passe valide
}

/**
 * Retourne des critères de validation avec leur statut
 * @param {string} password - Le mot de passe à évaluer
 * @returns {Array} - Liste des critères avec leur statut
 */
export const getPasswordCriteria = (password) => {
  return [
    { text: '8 caractères minimum', valid: password && password.length >= 8 },
    { text: 'Une lettre majuscule', valid: /[A-Z]/.test(password) },
    { text: 'Une lettre minuscule', valid: /[a-z]/.test(password) },
    { text: 'Un chiffre', valid: /[0-9]/.test(password) },
    { text: 'Un caractère spécial', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ]
}
