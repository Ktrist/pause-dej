# 💳 Configuration Stripe - Guide Complet

Ce guide explique comment configurer les paiements Stripe pour l'application Pause Dej'.

## 📋 Prérequis

- Compte Stripe créé (https://dashboard.stripe.com/register)
- Projet Supabase configuré
- Frontend React déployé ou en développement local

---

## 🚀 Étape 1 : Configuration Stripe

### 1.1 Créer un compte Stripe

1. Allez sur https://dashboard.stripe.com/register
2. Créez votre compte (utilisez d'abord le mode Test)
3. Activez votre compte en fournissant les informations requises

### 1.2 Récupérer les clés API

1. Connectez-vous au Dashboard Stripe
2. Allez dans **Developers > API keys**
3. Notez vos clés :
   - **Publishable key** (commence par `pk_test_...` en mode test)
   - **Secret key** (commence par `sk_test_...` en mode test)

⚠️ **IMPORTANT** : Ne JAMAIS commit la clé secrète dans le code source !

---

## 🔧 Étape 2 : Configuration Frontend

### 2.1 Ajouter les clés au fichier .env

Créez un fichier `.env` à la racine du projet `frontend/` :

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici

# Supabase Configuration (déjà configuré)
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 2.2 Vérifier que Stripe fonctionne

1. Redémarrez votre serveur de développement :
   ```bash
   cd frontend
   npm run dev
   ```

2. Allez sur la page de checkout
3. Vous devriez voir le formulaire de paiement Stripe

### 2.3 Tester avec des cartes de test

Stripe fournit des numéros de cartes de test :

| Carte | Numéro | CVC | Date | Résultat |
|---|---|---|---|---|
| Visa (succès) | `4242 4242 4242 4242` | N'importe quel 3 chiffres | Date future | Paiement réussi |
| Visa (échec) | `4000 0000 0000 0002` | N'importe quel 3 chiffres | Date future | Paiement décliné |
| Mastercard | `5555 5555 5555 4444` | N'importe quel 3 chiffres | Date future | Paiement réussi |

Plus de cartes de test : https://stripe.com/docs/testing

---

## 🔐 Étape 3 : Configuration Backend (Supabase Edge Function)

**🚨 IMPORTANT : Cette étape est NÉCESSAIRE pour que les paiements fonctionnent réellement.**

Le frontend est prêt, mais il faut maintenant créer une Supabase Edge Function pour :
1. Créer un Payment Intent côté serveur
2. Confirmer le paiement de manière sécurisée
3. Mettre à jour le statut de la commande

### 3.1 Créer la Edge Function

Créez un nouveau dossier dans votre projet Supabase :

```bash
mkdir -p supabase/functions/create-payment-intent
```

### 3.2 Créer le fichier de la fonction

`supabase/functions/create-payment-intent/index.ts` :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.24.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'eur', metadata = {} } = await req.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 3.3 Déployer la fonction

```bash
# Installer Supabase CLI si pas déjà fait
npm install supabase --save-dev

# Se connecter
npx supabase login

# Déployer la fonction
npx supabase functions deploy create-payment-intent

# Ajouter la clé secrète Stripe
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
```

### 3.4 Mettre à jour le frontend pour appeler la fonction

Dans `frontend/src/components/payment/PaymentForm.jsx`, remplacez le code TODO par :

```javascript
// Create payment intent from backend
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/create-payment-intent`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      amount: amount,
      metadata: {
        order_id: 'order_id_here', // Pass from parent
      },
    }),
  }
)

const { clientSecret, error: intentError } = await response.json()

if (intentError) {
  throw new Error(intentError)
}

// Confirm payment
const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
  },
})

if (confirmError) {
  throw new Error(confirmError.message)
}
```

---

## 🔔 Étape 4 : Configuration des Webhooks (Optionnel mais recommandé)

Les webhooks permettent de recevoir des notifications de Stripe quand le statut d'un paiement change.

### 4.1 Créer un endpoint webhook

1. Dans Stripe Dashboard, allez dans **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`
4. Sélectionnez les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 4.2 Créer la fonction webhook

`supabase/functions/stripe-webhook/index.ts` :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.24.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  try {
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.order_id

        // Update order status
        await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.order_id

        // Update order status
        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            payment_status: 'failed',
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
```

### 4.3 Déployer le webhook

```bash
npx supabase functions deploy stripe-webhook
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
```

---

## ✅ Étape 5 : Tester le flow complet

1. Allez sur la page checkout
2. Remplissez les informations de livraison
3. Utilisez une carte de test : `4242 4242 4242 4242`
4. Vérifiez que :
   - Le paiement est confirmé
   - La commande est créée dans Supabase
   - Vous êtes redirigé vers la page de confirmation

---

## 🔒 Sécurité & Production

### Avant de passer en production :

1. **Activer le mode Live sur Stripe**
   - Complétez la vérification de votre compte
   - Récupérez vos clés Live (`pk_live_...` et `sk_live_...`)

2. **Mettre à jour les variables d'environnement**
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```

3. **Configurer HTTPS**
   - Stripe nécessite HTTPS en production
   - Vérifiez que votre domaine a un certificat SSL

4. **Mettre en place des logs**
   - Surveillez les erreurs de paiement
   - Configurez des alertes pour les échecs

5. **Tester avec de vrais paiements**
   - Faites des transactions de test avec de vraies cartes
   - Vérifiez que les remboursements fonctionnent

---

## 🐛 Dépannage

### Erreur : "Stripe publishable key is missing"

**Solution** : Vérifiez que `VITE_STRIPE_PUBLISHABLE_KEY` est bien défini dans votre fichier `.env`

### Erreur : "Payment Intent creation failed"

**Solution** :
- Vérifiez que la Edge Function est déployée
- Vérifiez que `STRIPE_SECRET_KEY` est configuré dans Supabase
- Consultez les logs : `npx supabase functions logs create-payment-intent`

### Le paiement réussit mais la commande n'est pas créée

**Solution** : Vérifiez que le webhook est correctement configuré et que les événements sont reçus

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Cartes de test Stripe](https://stripe.com/docs/testing)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)

---

## 📝 Statut Actuel

✅ **Frontend** : Intégration complète avec Stripe Elements
❌ **Backend** : Supabase Edge Function à créer (étape 3)
❌ **Webhooks** : À configurer (étape 4 - optionnel)

**Prochaine étape** : Suivre l'étape 3 pour créer la Edge Function et activer les paiements réels.
