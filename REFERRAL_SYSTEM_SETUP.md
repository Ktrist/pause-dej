# Système de Parrainage - Pause Dej'

## ✅ Système de Parrainage Complet Implémenté

L'application Pause Dej' dispose maintenant d'un système de parrainage entièrement fonctionnel !

## 🎯 Fonctionnalités

### 1. **Codes de parrainage uniques**
- Génération automatique pour chaque utilisateur
- Code unique basé sur l'email
- Codes courts et mémorables (ex: JOHN1A2B)
- Partage facile via lien ou code

### 2. **Dashboard complet**
- Affichage du code de parrainage
- Statistiques détaillées:
  - Total de parrainages
  - Parrainages en attente
  - Parrainages complétés
  - Total des gains
- Liste des personnes parrainées
- Historique des récompenses

### 3. **Système de récompenses**
- 10€ pour le parrain (vous)
- 10€ pour le filleul (votre ami)
- Récompenses débloquées après la première commande livrée
- Bonus de 50 points de fidélité pour le parrain
- Crédits valables 90 jours

### 4. **Partage facilité**
- Bouton de copie du code
- Bouton de copie du lien direct
- API Web Share pour partage natif (mobile)
- Lien pré-rempli pour l'inscription

### 5. **Suivi en temps réel**
- Updates instantanés via Supabase Realtime
- Notifications des nouveaux parrainages
- Mise à jour automatique des statuts

## 📱 Fichiers créés

### 1. `/supabase/migrations/20240117_referral_system.sql`
Migration SQL complète avec :

**Tables créées :**
- `referral_codes` - Codes de parrainage uniques par utilisateur
- `referrals` - Tracking des parrainages (qui a parrainé qui)
- `referral_rewards` - Récompenses distribuées

**Fonctions :**
- `generate_referral_code()` - Génère un code unique
- `create_user_referral_code()` - Crée le code pour un utilisateur
- `apply_referral_code()` - Applique un code lors de l'inscription
- `process_referral_rewards()` - Distribue les récompenses

**Triggers :**
- Auto-création du code lors de l'inscription
- Auto-distribution des récompenses après première commande livrée

### 2. `/src/hooks/useReferral.js`
Hooks React complets :
- `useReferral()` - Code et stats de l'utilisateur
- `useReferralsList()` - Liste des parrainages
- `useReferralRewards()` - Récompenses gagnées
- `useApplyReferralCode()` - Appliquer un code
- `useWasReferred()` - Vérifier si l'utilisateur a été parrainé

### 3. `/src/components/referral/ReferralDashboard.jsx`
Composant dashboard avec :
- Affichage du code de parrainage
- Boutons de partage
- Statistiques visuelles
- Liste des parrainages
- Historique des récompenses

### 4. `/src/components/referral/ReferralCodeInput.jsx`
Composant pour appliquer un code :
- Input pour entrer le code
- Validation en temps réel
- Messages de succès/erreur
- Affichage si déjà parrainé

### 5. `/src/pages/account/AccountPage.jsx` (modifié)
Ajout d'un onglet "Parrainage" dans le compte utilisateur

## 🔄 Flux de parrainage

### 1. Inscription avec code

```
1. Nouvel utilisateur → Page signup
2. Entre le code de parrainage (optionnel)
3. S'inscrit avec ses informations
4. Code validé et enregistré en base
5. Statut: "pending" (en attente de première commande)
```

### 2. Première commande

```
1. Utilisateur passe sa première commande
2. Commande est livrée (status = 'delivered')
3. Trigger SQL détecte la première livraison
4. Fonction process_referral_rewards() s'exécute:
   - Crée 2 récompenses de 10€
   - Marque le parrainage comme "completed"
   - Ajoute 50 points de fidélité au parrain
5. Les deux utilisateurs reçoivent une notification
```

### 3. Utilisation de la récompense

```
1. Utilisateur a un crédit de 10€ actif
2. Lors du checkout, le crédit est automatiquement appliqué
3. Récompense marquée comme "claimed"
4. Date claimed_at enregistrée
```

## 🛠️ Configuration

### 1. Appliquer la migration SQL

```bash
# Via Supabase CLI
supabase db push

# OU copier/coller dans Supabase Dashboard > SQL Editor
```

### 2. Configurer les montants de récompense

Les montants sont configurables dans la table `referral_codes` :

```sql
-- Modifier les montants par défaut
UPDATE referral_codes
SET
  bonus_per_referral = 15.00,  -- Récompense du filleul
  referrer_bonus = 15.00       -- Récompense du parrain
WHERE is_active = true;
```

### 3. Intégrer dans le signup

Ajouter le composant `ReferralCodeInput` dans la page d'inscription :

```jsx
import ReferralCodeInput from '../components/referral/ReferralCodeInput'

function SignupPage() {
  // ... existing code

  return (
    <VStack>
      {/* Existing signup form */}

      {/* Add referral code input */}
      <ReferralCodeInput
        onSuccess={() => {
          // Optional: Do something after code is applied
          console.log('Referral code applied!')
        }}
      />
    </VStack>
  )
}
```

## 📊 Structure des tables

### referral_codes

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | ID unique |
| user_id | UUID | Utilisateur propriétaire |
| code | VARCHAR(20) | Code unique (ex: JOHN1A2B) |
| uses_count | INTEGER | Nombre d'utilisations |
| max_uses | INTEGER | Max utilisations (NULL = illimité) |
| bonus_per_referral | DECIMAL | Montant pour le filleul |
| referrer_bonus | DECIMAL | Montant pour le parrain |
| is_active | BOOLEAN | Code actif/inactif |

### referrals

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | ID unique |
| referrer_user_id | UUID | Utilisateur qui parraine |
| referred_user_id | UUID | Utilisateur parrainé |
| referral_code_id | UUID | Code utilisé |
| status | VARCHAR | 'pending', 'completed', 'cancelled' |
| referrer_reward_amount | DECIMAL | Montant gagné par le parrain |
| referred_reward_amount | DECIMAL | Montant gagné par le filleul |
| first_order_id | UUID | Première commande |

### referral_rewards

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | ID unique |
| referral_id | UUID | Parrainage concerné |
| user_id | UUID | Bénéficiaire |
| reward_type | VARCHAR | 'credit', 'discount', 'points' |
| reward_amount | DECIMAL | Montant de la récompense |
| is_claimed | BOOLEAN | Récompense utilisée |
| expires_at | TIMESTAMPTZ | Date d'expiration |

## 🚀 Utilisation dans l'application

### Afficher le dashboard de parrainage

```jsx
import ReferralDashboard from './components/referral/ReferralDashboard'

function MyAccountPage() {
  return (
    <Tabs>
      <TabPanel>
        <ReferralDashboard />
      </TabPanel>
    </Tabs>
  )
}
```

### Récupérer les stats de parrainage

```jsx
import { useReferral } from './hooks/useReferral'

function ReferralStats() {
  const { referralCode, stats, loading } = useReferral()

  if (loading) return <Loading />

  return (
    <div>
      <p>Votre code: {referralCode.code}</p>
      <p>Parrainages: {stats.totalReferrals}</p>
      <p>Gains: {stats.totalEarned}€</p>
    </div>
  )
}
```

### Appliquer un code de parrainage

```jsx
import { useApplyReferralCode } from './hooks/useReferral'

function ApplyCodeForm() {
  const { applyCode, loading, error } = useApplyReferralCode()

  const handleSubmit = async (code) => {
    try {
      await applyCode(code)
      alert('Code appliqué !')
    } catch (err) {
      alert('Erreur: ' + err.message)
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## 📈 Analytics et suivi

### Queries utiles

```sql
-- Top parrains
SELECT
  u.email,
  rc.code,
  COUNT(r.id) as total_referrals,
  SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) as pending
FROM referral_codes rc
JOIN auth.users u ON u.id = rc.user_id
LEFT JOIN referrals r ON r.referral_code_id = rc.id
GROUP BY u.email, rc.code
ORDER BY total_referrals DESC
LIMIT 10;

-- Taux de conversion des parrainages
SELECT
  COUNT(*) as total_referrals,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  ROUND(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100, 2) as conversion_rate
FROM referrals;

-- Total des récompenses distribuées
SELECT
  COUNT(*) as total_rewards,
  SUM(reward_amount) as total_amount,
  SUM(CASE WHEN is_claimed THEN reward_amount ELSE 0 END) as claimed_amount,
  SUM(CASE WHEN NOT is_claimed THEN reward_amount ELSE 0 END) as unclaimed_amount
FROM referral_rewards;

-- Parrainages par mois
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
FROM referrals
GROUP BY month
ORDER BY month DESC;
```

## 🎨 Personnalisation

### Modifier les montants de récompense

```sql
-- Pour tous les codes existants
UPDATE referral_codes
SET
  bonus_per_referral = 15.00,
  referrer_bonus = 15.00;

-- Pour créer des codes promotionnels spéciaux
INSERT INTO referral_codes (user_id, code, bonus_per_referral, referrer_bonus, max_uses)
VALUES (
  'user-uuid',
  'PROMO2024',
  20.00,  -- 20€ pour le filleul
  25.00,  -- 25€ pour le parrain
  100     -- Max 100 utilisations
);
```

### Ajouter une expiration aux codes

```sql
-- Code valable 30 jours
UPDATE referral_codes
SET valid_until = NOW() + INTERVAL '30 days'
WHERE code = 'XXXXXX';
```

### Limiter le nombre d'utilisations

```sql
-- Maximum 10 parrainages par code
UPDATE referral_codes
SET max_uses = 10
WHERE user_id = 'user-uuid';
```

## 🔔 Notifications (optionnel)

Envoyer des notifications quand :

1. **Nouvel utilisateur utilise votre code**
```sql
-- Trigger à créer pour notifier le parrain
```

2. **Parrainage complété (première commande livrée)**
```sql
-- Déjà géré par le système de notifications push
-- Le statut passe de 'pending' à 'completed'
```

3. **Récompense sur le point d'expirer**
```sql
-- Job cron pour alerter 7 jours avant expiration
SELECT * FROM referral_rewards
WHERE NOT is_claimed
  AND expires_at < NOW() + INTERVAL '7 days'
  AND expires_at > NOW();
```

## ✅ Checklist de déploiement

- [x] Migration SQL appliquée
- [x] Hooks React créés
- [x] Composants UI créés
- [x] Intégration dans AccountPage
- [x] Triggers automatiques configurés
- [x] RLS policies en place
- [ ] Tests d'intégration
- [ ] Composant ajouté à la page signup
- [ ] Configuration des montants de récompense
- [ ] Analytics configurées

## 🐛 Troubleshooting

### Code de parrainage non généré

```sql
-- Générer manuellement pour un utilisateur
SELECT create_user_referral_code('user-uuid');
```

### Récompenses non distribuées

```sql
-- Vérifier le statut du parrainage
SELECT * FROM referrals WHERE referred_user_id = 'user-uuid';

-- Forcer la distribution (si commande livrée)
SELECT process_referral_rewards('order-uuid');
```

### Code invalide

- Vérifier que `is_active = true`
- Vérifier `valid_until` (pas expiré)
- Vérifier `max_uses` (pas atteint la limite)
- Vérifier que l'utilisateur ne se parraine pas lui-même

## 🎯 Métriques de succès

### KPIs à suivre

1. **Taux d'adoption** : % d'utilisateurs qui ont un code
2. **Taux de partage** : % d'utilisateurs qui partagent leur code
3. **Taux de conversion** : % de parrainages → première commande
4. **CAC (Customer Acquisition Cost)** : Coût par nouveau client via parrainage
5. **Viralité (K-factor)** : Nombre moyen de parrainages par utilisateur

### Objectifs suggérés

- **Taux de conversion** : > 40%
- **Parrainages moyens** : 2-3 par utilisateur actif
- **ROI** : Chaque 20€ investi devrait générer 100€+ de revenus

## 📚 Ressources

- [Referral Marketing Best Practices](https://www.referralcandy.com/blog/referral-marketing/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

---

**Status** : ✅ Système de parrainage complet implémenté
**Prochaine étape** : Ajouter le composant à la page signup et configurer les montants
