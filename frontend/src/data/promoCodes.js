// Codes promo disponibles

export const promoCodes = {
  'BIENVENUE10': {
    code: 'BIENVENUE10',
    type: 'percentage',
    value: 10,
    description: '10% de réduction sur votre première commande',
    minOrder: 0,
    maxDiscount: 15,
    active: true
  },
  'PAUSEDEJ20': {
    code: 'PAUSEDEJ20',
    type: 'percentage',
    value: 20,
    description: '20% de réduction',
    minOrder: 30,
    maxDiscount: 20,
    active: true
  },
  'LIVRAISON': {
    code: 'LIVRAISON',
    type: 'fixed',
    value: 3.90,
    description: 'Livraison offerte',
    minOrder: 0,
    maxDiscount: 3.90,
    active: true
  },
  'PROMO5': {
    code: 'PROMO5',
    type: 'fixed',
    value: 5,
    description: '5€ de réduction',
    minOrder: 25,
    maxDiscount: 5,
    active: true
  }
}

export const validatePromoCode = (code, orderTotal) => {
  const promoCode = promoCodes[code.toUpperCase()]

  if (!promoCode) {
    return { valid: false, error: 'Code promo invalide' }
  }

  if (!promoCode.active) {
    return { valid: false, error: 'Ce code promo n\'est plus actif' }
  }

  if (orderTotal < promoCode.minOrder) {
    return {
      valid: false,
      error: `Commande minimum de ${promoCode.minOrder.toFixed(2)}€ requise`
    }
  }

  let discount = 0
  if (promoCode.type === 'percentage') {
    discount = (orderTotal * promoCode.value) / 100
    discount = Math.min(discount, promoCode.maxDiscount)
  } else {
    discount = promoCode.value
  }

  return {
    valid: true,
    code: promoCode,
    discount: parseFloat(discount.toFixed(2))
  }
}
