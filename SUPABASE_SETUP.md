# 🚀 Guide de Configuration Supabase - Pause Dej'

Ce guide vous accompagne étape par étape pour configurer votre backend Supabase.

---

## 📋 Prérequis

- Compte Supabase (gratuit) : https://supabase.com
- Node.js installé
- Code du projet cloné localement

---

## 🎯 Étape 1 : Créer un Projet Supabase

1. Allez sur **https://supabase.com** et connectez-vous
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : `pause-dej` (ou votre nom)
   - **Database Password** : Générez un mot de passe fort (GARDEZ-LE !)
   - **Region** : Choisissez la plus proche (ex: `West EU (Ireland)`)
   - **Pricing Plan** : Free (suffisant pour commencer)
4. Cliquez sur **"Create new project"**
5. ⏳ Attendez 2-3 minutes que le projet soit initialisé

---

## 🗄️ Étape 2 : Créer la Base de Données

### 2.1 Accéder à l'éditeur SQL

1. Dans votre projet Supabase, allez dans **"SQL Editor"** (menu gauche)
2. Cliquez sur **"New query"**

### 2.2 Exécuter le schéma

1. **Ouvrez le fichier** `supabase/schema.sql` de votre projet
2. **Copiez tout le contenu** (Cmd/Ctrl + A, puis Cmd/Ctrl + C)
3. **Collez dans l'éditeur SQL** de Supabase
4. Cliquez sur **"Run"** (en bas à droite)
5. ✅ Vous devriez voir : `Success. No rows returned`

### 2.3 Vérifier la création

1. Allez dans **"Table Editor"** (menu gauche)
2. Vous devriez voir toutes les tables :
   - ✅ profiles
   - ✅ addresses
   - ✅ categories
   - ✅ dishes
   - ✅ promo_codes
   - ✅ time_slots
   - ✅ orders
   - ✅ order_items
   - ✅ payment_methods

---

## 🔐 Étape 3 : Configurer l'Authentification

### 3.1 Activer l'authentification Email

1. Allez dans **"Authentication"** > **"Providers"**
2. **Email** devrait déjà être activé ✅
3. Configurez les paramètres :
   - **Enable email confirmations** : ❌ Désactivé (pour dev)
   - **Secure email change** : ✅ Activé
   - **Secure password change** : ✅ Activé

### 3.2 Configurer Google OAuth (Optionnel)

1. Dans **"Authentication"** > **"Providers"**
2. Activez **"Google"**
3. Suivez les instructions pour obtenir :
   - Client ID
   - Client Secret
4. Ajoutez les URLs de redirection :
   - Development : `http://localhost:5173`
   - Production : Votre domaine

---

## 🔑 Étape 4 : Récupérer les Clés API

1. Allez dans **"Settings"** > **"API"**
2. Copiez ces informations :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (très longue)

---

## ⚙️ Étape 5 : Configurer l'Application Frontend

### 5.1 Créer le fichier .env

Dans le dossier `frontend/`, créez un fichier `.env` :

```bash
cd frontend
touch .env
```

### 5.2 Ajouter les variables d'environnement

Ouvrez `frontend/.env` et ajoutez :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
VITE_APP_NAME=Pause Dej'
VITE_DELIVERY_FEE=3.90
VITE_FREE_DELIVERY_THRESHOLD=30
```

**⚠️ IMPORTANT** :
- Remplacez `xxxxxxxxxxxxx` par votre Project URL
- Remplacez la clé `VITE_SUPABASE_ANON_KEY` par votre clé

### 5.3 Vérifier que .env est ignoré par Git

Vérifiez que `.env` est dans le `.gitignore` :

```bash
cat frontend/.gitignore | grep .env
```

Si ce n'est pas le cas, ajoutez-le :

```bash
echo ".env" >> frontend/.gitignore
```

---

## 📦 Étape 6 : Ajouter des Données de Test

### 6.1 Insérer des plats de test

Le schéma SQL a déjà inséré :
- ✅ 7 catégories
- ✅ 4 codes promo
- ✅ Créneaux horaires pour 7 jours

Pour ajouter des plats :

1. Allez dans **"Table Editor"** > **"dishes"**
2. Cliquez sur **"Insert row"** > **"Insert row"**
3. Remplissez les champs :
   - **name** : Burger Classique
   - **slug** : burger-classique
   - **description** : Pain brioché, steak, cheddar...
   - **price** : 11.90
   - **image_url** : https://images.unsplash.com/photo-1568901346375-23c9450c58cd
   - **category_id** : Sélectionnez "Plats"
   - **stock** : 20
   - **is_available** : ✅
   - **is_popular** : ✅
4. Cliquez sur **"Save"**

**OU** utilisez le SQL suivant pour importer plusieurs plats rapidement :

```sql
-- Récupérer l'ID de la catégorie "Plats"
DO $$
DECLARE
  plats_id UUID;
  entrees_id UUID;
  desserts_id UUID;
BEGIN
  SELECT id INTO plats_id FROM categories WHERE slug = 'plats';
  SELECT id INTO entrees_id FROM categories WHERE slug = 'entrees';
  SELECT id INTO desserts_id FROM categories WHERE slug = 'desserts';

  INSERT INTO dishes (name, slug, description, long_description, price, image_url, category_id, stock, is_popular, allergens, calories, protein, carbs, fat, is_vegetarian, is_vegan) VALUES
    ('Burger Classique', 'burger-classique', 'Pain brioché, steak haché, cheddar, sauce maison', 'Un burger généreux avec un steak de bœuf français, cheddar fondant, laitue croquante et notre sauce secrète.', 11.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', plats_id, 20, true, ARRAY['Gluten', 'Lait', 'Œuf'], 620, 32, 48, 28, false, false),
    ('Poke Bowl Saumon', 'poke-bowl-saumon', 'Riz sushi, saumon frais, avocat, edamame', 'Un poke bowl généreux avec du saumon frais mariné, avocat crémeux, edamame et sauce soja sucrée.', 12.90, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', plats_id, 15, true, ARRAY['Poisson', 'Soja', 'Sésame'], 520, 28, 54, 18, false, false),
    ('Salade César', 'salade-cesar', 'Poulet grillé, parmesan, croûtons, sauce césar', 'La salade César classique avec du poulet grillé tendre, copeaux de parmesan et croûtons croustillants.', 9.90, 'https://images.unsplash.com/photo-1546793665-c74683f339c1', entrees_id, 25, false, ARRAY['Gluten', 'Lait', 'Œuf', 'Poisson'], 380, 24, 18, 22, false, false);
END $$;
```

Exécutez ce code dans **SQL Editor** > **New query** > **Run**.

---

## ✅ Étape 7 : Tester l'Application

### 7.1 Redémarrer le serveur de dev

```bash
cd frontend
npm run dev
```

### 7.2 Tester l'inscription

1. Ouvrez http://localhost:5173
2. Cliquez sur **"Mon compte"** ou **"Connexion"**
3. Allez sur **"Créer un compte"**
4. Remplissez le formulaire :
   - Nom complet
   - Email
   - Téléphone
   - Mot de passe
5. Cliquez sur **"Créer mon compte"**
6. ✅ Vous devriez être connecté automatiquement

### 7.3 Vérifier dans Supabase

1. Allez dans **"Authentication"** > **"Users"**
2. Vous devriez voir votre utilisateur ✅
3. Allez dans **"Table Editor"** > **"profiles"**
4. Vous devriez voir votre profil ✅

---

## 🎨 Étape 8 : Personnalisation (Optionnel)

### Changer les emails de confirmation

1. Allez dans **"Authentication"** > **"Email Templates"**
2. Personnalisez les templates :
   - **Confirm signup** : Email de confirmation d'inscription
   - **Reset password** : Email de réinitialisation
   - **Magic link** : Email de connexion magique

### Ajouter un logo dans les emails

1. Uploadez votre logo dans **"Storage"**
2. Récupérez l'URL publique
3. Ajoutez `<img src="URL" />` dans les templates

---

## 🔒 Étape 9 : Sécurité (Production)

### 9.1 Activer RLS (Row Level Security)

✅ **Déjà fait !** Le schéma SQL a activé RLS sur toutes les tables.

### 9.2 Configurer les URL autorisées

1. Allez dans **"Authentication"** > **"URL Configuration"**
2. **Site URL** : `https://votre-domaine.com`
3. **Redirect URLs** : Ajoutez toutes vos URLs autorisées

### 9.3 Activer l'email de confirmation (Production)

1. Allez dans **"Authentication"** > **"Providers"** > **"Email"**
2. **Enable email confirmations** : ✅ Activé
3. Configurez votre provider SMTP (SendGrid, Resend, etc.)

---

## 🎯 Prochaines Étapes

Maintenant que Supabase est configuré, vous pouvez :

1. ✅ **Tester l'authentification** complète (signup, login, logout)
2. ✅ **Migrer des données mockées** vers Supabase
3. ✅ **Implémenter le Checkout** avec vraies commandes
4. ✅ **Configurer Stripe** pour les paiements
5. ✅ **Créer l'admin dashboard** pour gérer les produits

---

## 🆘 Troubleshooting

### Erreur : "Invalid API key"

- ✅ Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont correctes
- ✅ Redémarrez le serveur dev (`npm run dev`)
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après les clés

### Erreur : "relation profiles does not exist"

- ✅ Vous n'avez pas exécuté le schéma SQL
- ✅ Retournez à l'**Étape 2** et exécutez `schema.sql`

### L'inscription ne fonctionne pas

- ✅ Vérifiez dans **Authentication** > **Providers** que Email est activé
- ✅ Vérifiez les logs dans **Logs** > **Auth logs**
- ✅ Vérifiez la console du navigateur (F12)

### Les données ne s'affichent pas

- ✅ Vérifiez que RLS est bien configuré
- ✅ Vérifiez que vous avez des données dans les tables
- ✅ Utilisez l'onglet **Network** du navigateur pour voir les requêtes

---

## 📚 Ressources

- 📖 [Documentation Supabase](https://supabase.com/docs)
- 🎥 [Tutoriels vidéo](https://www.youtube.com/@Supabase)
- 💬 [Discord Supabase](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Félicitations ! Votre backend Supabase est prêt ! 🎉**

Vous pouvez maintenant continuer le développement avec un backend réel et scalable.
