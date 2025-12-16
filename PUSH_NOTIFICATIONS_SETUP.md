# Configuration des Notifications Push - Pause Dej'

## ✅ Système de Notifications Push Implémenté

L'application Pause Dej' dispose maintenant d'un système complet de notifications push Web !

## 🎯 Fonctionnalités

### 1. **Gestion des permissions**
- Demande de permission native du navigateur
- Gestion des états : default, granted, denied
- Interface utilisateur intuitive avec switch on/off

### 2. **Abonnement aux notifications**
- Inscription automatique au service de push
- Support VAPID (Voluntary Application Server Identification)
- Stockage sécurisé dans Supabase

### 3. **Types de notifications**
- ✅ Confirmation de commande
- ✅ Préparation en cours
- ✅ Livraison en route
- ✅ Livraison effectuée
- ✅ Promotions et offres

### 4. **Notification de test**
- Bouton de test intégré
- Vérification instantanée du bon fonctionnement

## 📱 Fichiers créés/modifiés

### 1. `/src/hooks/useNotifications.js`
Hook React pour gérer les notifications :
- `requestPermission()` - Demande la permission
- `subscribe()` - S'abonne aux push notifications
- `unsubscribe()` - Se désabonne
- `sendTestNotification()` - Envoie une notification de test
- Stockage dans `push_subscriptions` table

### 2. `/src/components/notifications/NotificationSettings.jsx`
Composant UI complet avec :
- Status de l'abonnement (activé/désactivé)
- Switch pour activer/désactiver
- Liste des types de notifications
- Bouton de test

### 3. `/src/pages/account/AccountPage.jsx` (modifié)
Ajout d'un onglet "Notifications" dans la page compte utilisateur

### 4. `/supabase/migrations/20240115_push_subscriptions.sql`
Migration SQL pour créer la table :
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### 5. `/public/sw.js` (déjà créé avec PWA)
Service Worker qui gère :
- Événement `push` pour recevoir les notifications
- Événement `notificationclick` pour gérer les clics
- Actions personnalisées dans les notifications

## 🔧 Configuration requise

### 1. Générer les clés VAPID

Les clés VAPID sont nécessaires pour envoyer des notifications push. Générez-les avec :

```bash
npx web-push generate-vapid-keys
```

Vous obtiendrez :
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr7qBkXFqL3-OONSmJrVmRo

Private Key:
UUxI4O8-FbRouAevSmBQ6o8sPQhmb7pz7IfwLbpvCvM
=======================================
```

### 2. Configurer les variables d'environnement

**Frontend** - `.env` :
```bash
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

**Backend (Supabase Edge Function)** - Secrets :
```bash
supabase secrets set VAPID_PUBLIC_KEY=your_public_key_here
supabase secrets set VAPID_PRIVATE_KEY=your_private_key_here
supabase secrets set VAPID_SUBJECT=mailto:contact@pause-dej.fr
```

### 3. Appliquer la migration SQL

Connecte-toi à Supabase et exécute le fichier SQL :
```bash
# Option 1: Via Supabase CLI
supabase db push

# Option 2: Copier/coller dans Supabase Dashboard > SQL Editor
```

## 🚀 Utilisation

### Pour l'utilisateur

1. Aller dans **Mon Compte** > **Notifications**
2. Activer le switch "Notifications activées"
3. Accepter la permission du navigateur
4. Tester avec le bouton "Envoyer une notification de test"

### Pour le développeur

#### Envoyer une notification depuis le backend

```javascript
import { supabase } from './supabase'
import webPush from 'web-push'

// Configuration VAPID
webPush.setVapidDetails(
  'mailto:contact@pause-dej.fr',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// Fonction pour envoyer une notification
async function sendPushNotification(userId, notification) {
  // 1. Récupérer la subscription de l'utilisateur
  const { data: subscriptionData } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)
    .single()

  if (!subscriptionData) {
    console.log('User not subscribed to push notifications')
    return
  }

  const subscription = JSON.parse(subscriptionData.subscription)

  // 2. Préparer le payload
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    url: notification.url || '/',
    tag: notification.tag || 'default'
  })

  // 3. Envoyer la notification
  try {
    await webPush.sendNotification(subscription, payload)
    console.log('Push notification sent successfully')
  } catch (error) {
    console.error('Error sending push notification:', error)

    // Si l'abonnement n'est plus valide, le supprimer
    if (error.statusCode === 410) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
    }
  }
}

// Exemples d'utilisation

// Notification de confirmation de commande
await sendPushNotification(userId, {
  title: 'Commande confirmée ! 🎉',
  body: 'Votre commande #12345 a bien été reçue',
  url: '/compte?tab=orders',
  tag: 'order-confirmed'
})

// Notification de livraison
await sendPushNotification(userId, {
  title: 'Livraison en route ! 🚚',
  body: 'Votre commande arrive dans 10 minutes',
  url: '/track/12345',
  tag: 'delivery-in-progress'
})

// Notification de promotion
await sendPushNotification(userId, {
  title: '🔥 Nouvelle offre !',
  body: '-20% sur tous les plats végétariens',
  url: '/catalogue?filter=vegetarian',
  tag: 'promotion'
})
```

## 🔔 Intégration avec les commandes

### Database Trigger (automatique)

Créer un trigger PostgreSQL pour envoyer automatiquement des notifications :

```sql
-- Fonction pour envoyer une notification quand le statut change
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler l'Edge Function pour envoyer la notification
  PERFORM
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/send-order-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'order_number', NEW.order_number,
        'status', NEW.status,
        'old_status', OLD.status
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur la table orders
CREATE TRIGGER order_status_notification
AFTER UPDATE OF status ON orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION notify_order_status_change();
```

### Supabase Edge Function

Créer `/supabase/functions/send-order-notification/index.ts` :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webPush from 'https://esm.sh/web-push@3.6.3'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Configuration VAPID
webPush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? '',
  Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
)

// Messages selon le statut
const STATUS_MESSAGES = {
  confirmed: {
    title: 'Commande confirmée ! 🎉',
    body: 'Votre commande a bien été reçue'
  },
  preparing: {
    title: 'Préparation en cours 👨‍🍳',
    body: 'Nos chefs préparent votre commande'
  },
  ready: {
    title: 'Commande prête ! ✅',
    body: 'Votre commande est prête à être livrée'
  },
  in_delivery: {
    title: 'En route ! 🚚',
    body: 'Votre commande est en cours de livraison'
  },
  delivered: {
    title: 'Livré ! 🎊',
    body: 'Votre commande a été livrée. Bon appétit !'
  }
}

serve(async (req) => {
  try {
    const { user_id, order_number, status } = await req.json()

    // Récupérer la subscription
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user_id)
      .single()

    if (!subData) {
      return new Response(JSON.stringify({ error: 'User not subscribed' }), {
        status: 404
      })
    }

    const subscription = JSON.parse(subData.subscription)
    const message = STATUS_MESSAGES[status]

    if (!message) {
      return new Response(JSON.stringify({ error: 'Unknown status' }), {
        status: 400
      })
    }

    // Préparer le payload
    const payload = JSON.stringify({
      title: message.title,
      body: `${message.body} (Commande #${order_number})`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/track/${order_number}`,
      tag: `order-${order_number}`
    })

    // Envoyer la notification
    await webPush.sendNotification(subscription, payload)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

Déployer la fonction :
```bash
supabase functions deploy send-order-notification
```

## 📊 Compatibilité navigateurs

| Navigateur | Support | Notes |
|------------|---------|-------|
| Chrome | ✅ | Complet |
| Firefox | ✅ | Complet |
| Safari | ⚠️ | Depuis iOS 16.4+ |
| Edge | ✅ | Complet |
| Opera | ✅ | Complet |

## 🆘 Troubleshooting

### Les notifications ne s'affichent pas

1. **Vérifier la permission** :
```javascript
console.log('Notification permission:', Notification.permission)
```

2. **Vérifier le Service Worker** :
```javascript
navigator.serviceWorker.ready.then(reg => {
  console.log('Service Worker registered:', reg)
})
```

3. **Vérifier la subscription** :
```javascript
navigator.serviceWorker.ready.then(async reg => {
  const sub = await reg.pushManager.getSubscription()
  console.log('Push subscription:', sub)
})
```

### Erreur "Failed to subscribe"

- Vérifiez que VAPID_PUBLIC_KEY est correctement configuré
- Vérifiez que vous êtes en HTTPS (ou localhost)
- Vérifiez que le Service Worker est bien enregistré

### Notifications reçues mais pas affichées

- Vérifiez que le Service Worker a bien l'event listener `push`
- Vérifiez les paramètres de notification du système d'exploitation
- Testez avec une notification de test locale d'abord

## 🎯 Prochaines étapes

1. ✅ **Interface utilisateur** - FAIT
2. ✅ **Stockage des subscriptions** - FAIT
3. ⏳ **Edge Function pour envoi** - À créer
4. ⏳ **Trigger automatique sur orders** - À créer
5. ⏳ **Analytics des notifications** - À implémenter
6. ⏳ **A/B testing des messages** - À implémenter

## 📈 Métriques à suivre

Une fois en production :
- Taux d'opt-in (acceptation des notifications)
- Taux de clic sur les notifications
- Désabonnements
- Notifications par statut de commande
- Impact sur l'engagement utilisateur

## 🔐 Sécurité

- Les clés VAPID privées ne doivent JAMAIS être exposées côté client
- Utilisez les RLS policies de Supabase pour protéger les données
- Validez toujours les données avant d'envoyer des notifications
- Respectez le RGPD : les utilisateurs peuvent se désabonner à tout moment

## 📚 Ressources

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [VAPID Keys](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)
- [web-push library](https://github.com/web-push-libs/web-push)

---

**Status** : ✅ Infrastructure en place
**Prochaine étape** : Créer l'Edge Function et le trigger automatique
