# Configuration des Tickets Restaurant via Stripe

## Vue d'ensemble

Pause Dej' accepte maintenant les **tickets restaurant** (Swile, Edenred, Up Déjeuner, etc.) comme moyen de paiement via Stripe.

## Comment ça marche

Les cartes ticket restaurant fonctionnent comme des cartes de paiement normales via Stripe. Stripe gère automatiquement :
- Swile
- Edenred
- Up Déjeuner
- Apetiz
- Bimpli
- Tous les autres tickets restaurant émis en France

## Configuration Stripe (Dashboard)

### 1. Activer les méthodes de paiement

1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Settings** → **Payment methods**
3. Assurez-vous que **Cards** est activé
4. Les cartes ticket restaurant sont traitées comme des cartes bancaires standards

### 2. Configurer les métadonnées

Les paiements par ticket restaurant sont identifiés dans les métadonnées :
- `paymentMethod: 'meal_voucher'` pour les tickets restaurant
- `paymentMethod: 'card'` pour les cartes bancaires classiques

### 3. Limites et restrictions

**Important** : Les tickets restaurant ont des restrictions légales :
- ✅ Utilisables uniquement pour l'achat de repas
- ✅ Maximum de 25€ par jour (limite Swile/Edenred)
- ❌ Ne peuvent pas être utilisés le week-end (dépend de l'émetteur)
- ❌ Ne fonctionnent pas pour tous les types de produits

## Implémentation Frontend

### Interface utilisateur

L'utilisateur peut choisir entre :
1. **Carte bancaire** - CB, Visa, Mastercard
2. **Ticket Restaurant** - Swile, Edenred, etc.

```jsx
// Le composant PaymentForm affiche les deux options
<SimpleGrid columns={2} spacing={3}>
  <Box onClick={() => setPaymentMethod('card')}>
    Carte bancaire
  </Box>
  <Box onClick={() => setPaymentMethod('meal_voucher')}>
    Ticket Restaurant
  </Box>
</SimpleGrid>
```

### Traitement du paiement

Le paiement est traité de la même manière pour les deux types :

```javascript
// Création du Payment Intent avec métadonnées
const response = await fetch('/functions/v1/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({
    amount: amount,
    metadata: {
      source: 'pause-dej-checkout',
      paymentMethod: paymentMethod === 'meal_voucher' ? 'meal_voucher' : 'card',
    },
  }),
})

// Confirmation du paiement
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
    },
  }
)
```

## Backend (Supabase Edge Function)

Le backend doit gérer les deux types de paiement :

```typescript
// supabase/functions/create-payment-intent/index.ts
const { amount, metadata } = await req.json()

const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Convert to cents
  currency: 'eur',
  metadata: {
    ...metadata,
    // Ces métadonnées sont visibles dans Stripe Dashboard
    paymentType: metadata.paymentMethod === 'meal_voucher'
      ? 'Ticket Restaurant'
      : 'Carte bancaire'
  },
  automatic_payment_methods: {
    enabled: true,
  },
})
```

## Gestion des erreurs

### Erreurs courantes

1. **Carte refusée** (même message pour ticket restaurant et CB)
```
"Votre carte a été refusée"
```

2. **Solde insuffisant** (spécifique ticket restaurant)
```
"Solde insuffisant sur votre carte ticket restaurant"
```

3. **Hors période d'utilisation** (week-end/jours fériés)
```
"Les tickets restaurant ne sont pas acceptés le week-end"
```

### Gestion dans le code

```javascript
try {
  const { error, paymentIntent } = await stripe.confirmCardPayment(...)

  if (error) {
    // Afficher un message d'erreur adapté
    if (paymentMethod === 'meal_voucher') {
      setError('Erreur avec votre ticket restaurant : ' + error.message)
    } else {
      setError('Erreur de paiement : ' + error.message)
    }
  }
} catch (err) {
  console.error('Payment error:', err)
}
```

## Tests

### Mode Test Stripe

Utilisez ces numéros de carte test :

**Carte bancaire standard (succès)**
```
4242 4242 4242 4242
Expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres
```

**Ticket Restaurant (simulation)**
```
5555 5555 5555 4444
Expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres
```

**Carte refusée**
```
4000 0000 0000 0002
```

### Tests en Production

1. Faites un test avec une vraie carte Swile de test
2. Vérifiez que les métadonnées sont correctement enregistrées
3. Contrôlez dans Stripe Dashboard que le paiement est bien catégorisé

## Suivi et Analytics

### Dans Stripe Dashboard

1. Allez dans **Payments** pour voir tous les paiements
2. Filtrez par métadonnée `paymentMethod = meal_voucher`
3. Exportez les données pour analyse

### Dans votre application

Vous pouvez suivre les paiements par type :

```sql
-- Dans Supabase SQL Editor
SELECT
  payment_method,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM orders
WHERE payment_method IN ('card', 'meal_voucher')
GROUP BY payment_method
```

## Avantages Business

✅ **Nouveaux clients** : Attire les salariés qui utilisent leurs tickets restaurant
✅ **Taux de conversion** : Facilite le paiement pour les déjeuners
✅ **Volume** : Augmente le panier moyen (limite de 25€/jour)
✅ **Fidélisation** : Les utilisateurs reviennent régulièrement

## Support

Si vous rencontrez des problèmes :

1. **Stripe** : [Support Stripe](https://support.stripe.com)
2. **Documentation** : [Stripe Payment Methods](https://stripe.com/docs/payments/payment-methods)
3. **Test Cards** : [Stripe Test Cards](https://stripe.com/docs/testing)

## Checklist de déploiement

- [x] Interface de sélection du moyen de paiement
- [x] Traitement Stripe avec métadonnées
- [x] Messages d'information pour l'utilisateur
- [x] Gestion des erreurs spécifiques
- [ ] Tests en mode test Stripe
- [ ] Activation en production
- [ ] Communication aux utilisateurs
- [ ] Formation équipe support

## Notes importantes

⚠️ **Les tickets restaurant ne sont PAS des cartes bancaires différentes** - Stripe les traite comme des cartes normales. La différence est uniquement dans les métadonnées et l'UX.

⚠️ **Limites légales** - Respecter les limites d'utilisation (25€/jour, jours ouvrés uniquement)

⚠️ **Communication claire** - Indiquer clairement à l'utilisateur qu'il utilise un ticket restaurant
