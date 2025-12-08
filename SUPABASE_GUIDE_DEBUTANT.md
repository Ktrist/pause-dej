# 🚀 Guide Supabase pour Débutants - Pause Dej'

> **Objectif** : Configurer votre backend Supabase en 30 minutes, même si vous n'avez jamais utilisé Supabase.

**Prérequis** :
- ✅ Un navigateur web
- ✅ Une adresse email
- ✅ Votre projet Pause Dej' ouvert dans VS Code

**Durée estimée** : 30 minutes

---

## 🎯 Qu'est-ce qu'on va faire ?

Supabase va nous fournir :
- 🗄️ Une **base de données** PostgreSQL pour stocker les plats, commandes, utilisateurs
- 🔐 Un système d'**authentification** pour les utilisateurs
- 📁 Du **stockage** pour les images de plats (futur)
- ⚡ Des **APIs automatiques** pour accéder aux données

C'est comme avoir un serveur complet, mais **gratuit et déjà configuré** !

---

## 📋 ÉTAPE 1 : Créer un Compte Supabase (5 min)

### 1.1 Aller sur Supabase

1. Ouvrez votre navigateur
2. Allez sur : **https://supabase.com**
3. Cliquez sur le bouton **"Start your project"** (en haut à droite)

### 1.2 S'inscrire

Vous avez **3 options** :

**Option A - GitHub (Recommandé)** :
1. Cliquez sur **"Continue with GitHub"**
2. Autorisez Supabase à accéder à votre compte GitHub
3. ✅ Vous êtes connecté !

**Option B - Google** :
1. Cliquez sur **"Continue with Google"**
2. Choisissez votre compte Google
3. ✅ Vous êtes connecté !

**Option C - Email** :
1. Entrez votre email
2. Créez un mot de passe
3. Confirmez votre email (vérifiez vos spams)
4. ✅ Vous êtes connecté !

---

## 📋 ÉTAPE 2 : Créer votre Premier Projet (5 min)

### 2.1 Dashboard Supabase

Après connexion, vous voyez le **Dashboard**. C'est votre tableau de bord.

1. Cliquez sur **"New project"** (gros bouton vert)

### 2.2 Remplir les Informations

Vous allez voir un formulaire. Remplissez :

#### **Organization** (si première fois)
- Cliquez sur **"New organization"**
- **Name** : `Mon Entreprise` (ou ce que vous voulez)
- Cliquez sur **"Create organization"**

#### **Project Settings**
1. **Name** : `pause-dej`
   - C'est le nom de votre projet, visible uniquement par vous

2. **Database Password** :
   - ⚠️ **TRÈS IMPORTANT** : Cliquez sur **"Generate a password"**
   - Un mot de passe complexe apparaît (genre : `Kx9#mP2qR...`)
   - Cliquez sur l'icône **copier** (📋) à côté du mot de passe
   - **COLLEZ-LE QUELQUE PART** (Notes, fichier texte, etc.)
   - ⛔ **NE PERDEZ PAS CE MOT DE PASSE** ! Vous ne pourrez pas le récupérer

3. **Region** :
   - Choisissez **"West EU (Ireland)"** si vous êtes en Europe
   - Ou **"East US (North Virginia)"** si vous êtes aux USA
   - Ou la région la plus proche de vous

4. **Pricing Plan** :
   - Laissez **"Free"** sélectionné
   - C'est gratuit, parfait pour commencer !

### 2.3 Créer le Projet

1. Cliquez sur **"Create new project"** (en bas)
2. ⏳ **Attendez 2-3 minutes** - Supabase crée votre serveur
3. Vous voyez un écran de chargement avec "Setting up project..."
4. ✅ Quand c'est terminé, vous êtes redirigé vers le dashboard de votre projet

**🎉 Bravo ! Votre projet Supabase est créé !**

---

## 📋 ÉTAPE 3 : Créer la Base de Données (10 min)

Maintenant, on va créer toutes les tables (plats, commandes, utilisateurs, etc.)

### 3.1 Ouvrir l'Éditeur SQL

1. Dans le menu de **gauche**, cliquez sur **"SQL Editor"**
   - C'est l'icône qui ressemble à `</>`
2. Vous voyez une page avec un éditeur de texte

### 3.2 Copier le Schéma de Base de Données

1. **Sur votre ordinateur**, ouvrez VS Code
2. Ouvrez le fichier : `supabase/schema.sql`
   - Il se trouve dans le dossier `supabase/` de votre projet
3. **Sélectionnez TOUT le contenu** (Cmd+A sur Mac, Ctrl+A sur Windows)
4. **Copiez** (Cmd+C ou Ctrl+C)

### 3.3 Coller dans Supabase

1. Retournez dans **Supabase** (dans votre navigateur)
2. Dans l'éditeur SQL, **cliquez dans la zone de texte**
3. **Collez** tout le code (Cmd+V ou Ctrl+V)
   - Vous devez voir des centaines de lignes de code SQL

### 3.4 Exécuter le Code

1. En bas à **droite** de l'éditeur, cliquez sur **"Run"** (bouton vert)
2. ⏳ Attendez 5-10 secondes
3. ✅ Vous devez voir : **"Success. No rows returned"**

**🎉 Parfait ! Votre base de données est créée !**

### 3.5 Vérifier que ça a Fonctionné

1. Dans le menu de **gauche**, cliquez sur **"Table Editor"**
   - C'est l'icône qui ressemble à une grille
2. Vous devez voir une **liste de tables** :
   - ✅ `profiles`
   - ✅ `addresses`
   - ✅ `categories`
   - ✅ `dishes`
   - ✅ `promo_codes`
   - ✅ `time_slots`
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `payment_methods`

Si vous voyez ces tables, **c'est bon** ! ✅

---

## 📋 ÉTAPE 4 : Configurer l'Authentification (3 min)

On va activer la connexion par email pour les utilisateurs.

### 4.1 Ouvrir Authentication

1. Dans le menu de **gauche**, cliquez sur **"Authentication"**
   - C'est l'icône avec un cadenas 🔒
2. Cliquez sur **"Providers"** (dans le sous-menu)

### 4.2 Configurer Email

1. Vous voyez **"Email"** - il est déjà **activé** (toggle vert) ✅
2. Cliquez sur **"Email"** pour ouvrir les paramètres
3. **Décochez** ces options (pour faciliter le dev) :
   - ❌ **"Enable email confirmations"** - Décochez
   - ❌ **"Enable email OTP"** - Décochez
4. **Laissez coché** :
   - ✅ **"Enable signup"**
5. Cliquez sur **"Save"** (en bas)

**Pourquoi on désactive les confirmations ?**
- Pour le développement, c'est plus simple
- En production, vous les réactiverez pour la sécurité

### 4.3 Configurer Google OAuth (Optionnel)

Si vous voulez la connexion Google (comme sur le bouton "Continuer avec Google") :

1. Cliquez sur **"Google"** dans la liste des providers
2. **Activez** le toggle
3. Vous aurez besoin de créer une app Google Cloud - on le fera plus tard
4. Pour l'instant, **ignorez cette partie**

---

## 📋 ÉTAPE 5 : Récupérer vos Clés API (5 min)

C'est la partie **CRUCIALE** - vous allez copier 2 clés pour connecter votre app à Supabase.

### 5.1 Ouvrir les Settings

1. Dans le menu de **gauche**, cliquez sur **"Settings"** (tout en bas)
   - C'est l'icône avec un engrenage ⚙️
2. Dans le sous-menu, cliquez sur **"API"**

### 5.2 Copier l'URL du Projet

1. Cherchez la section **"Project URL"**
2. Vous voyez quelque chose comme : `https://abcdefghijklmnop.supabase.co`
3. Cliquez sur l'icône **copier** (📋) à côté
4. **Collez-la quelque part** (Notes ou fichier texte)

**Exemple** :
```
Project URL: https://xyzabcdefgh.supabase.co
```

### 5.3 Copier la Clé Anon

1. Cherchez la section **"Project API keys"**
2. Trouvez **"anon" "public"** key
3. C'est une **très longue clé** qui commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Cliquez sur l'icône **copier** (📋)
5. **Collez-la quelque part** (Notes ou fichier texte)

**⚠️ IMPORTANT** :
- Cette clé fait environ 250 caractères
- Copiez-la EN ENTIER
- Ne modifiez rien

---

## 📋 ÉTAPE 6 : Connecter Supabase à votre App (5 min)

Maintenant, on va donner ces clés à votre application React.

### 6.1 Ouvrir votre Projet dans VS Code

1. Ouvrez **VS Code**
2. Ouvrez le dossier `pause-dej`

### 6.2 Créer le fichier .env

1. Dans VS Code, ouvrez le dossier `frontend/`
2. **Vérifiez** s'il y a déjà un fichier `.env`
   - Si **OUI** : Ouvrez-le
   - Si **NON** : Créez-le (clic droit > New File > `.env`)

### 6.3 Ajouter les Variables d'Environnement

1. Ouvrez le fichier `frontend/.env`
2. **Supprimez tout** ce qu'il y a dedans (s'il y a quelque chose)
3. **Collez** exactement ce code :

```env
# Supabase Configuration
VITE_SUPABASE_URL=VOTRE_URL_ICI
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ICI

# App Configuration
VITE_APP_NAME=Pause Dej'
VITE_DELIVERY_FEE=3.90
VITE_FREE_DELIVERY_THRESHOLD=30
```

### 6.4 Remplacer par VOS Clés

1. Remplacez `VOTRE_URL_ICI` par l'URL que vous avez copiée
2. Remplacez `VOTRE_CLE_ICI` par la clé anon que vous avez copiée

**Exemple final** :
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xyzabcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDEyMzQ1NjcsImV4cCI6MjAxNjgxMDU2N30.AbCdEfGhIjKlMnOpQrStUvWxYz0123456789

# App Configuration
VITE_APP_NAME=Pause Dej'
VITE_DELIVERY_FEE=3.90
VITE_FREE_DELIVERY_THRESHOLD=30
```

### 6.5 Sauvegarder

1. **Sauvegardez** le fichier `.env` (Cmd+S ou Ctrl+S)
2. ✅ C'est terminé !

### 6.6 Vérifier que .env est Ignoré par Git

**TRÈS IMPORTANT** pour la sécurité :

1. Ouvrez le fichier `frontend/.gitignore`
2. Vérifiez qu'il contient la ligne : `.env`
3. Si **NON**, ajoutez cette ligne :
```
.env
```
4. Sauvegardez

**Pourquoi ?** Pour ne JAMAIS envoyer vos clés secrètes sur GitHub !

---

## 📋 ÉTAPE 7 : Tester la Connexion (5 min)

On va vérifier que tout fonctionne !

### 7.1 Redémarrer le Serveur

1. Ouvrez un **Terminal** dans VS Code (Menu > Terminal > New Terminal)
2. Tapez ces commandes :

```bash
cd frontend
npm run dev
```

3. ⏳ Attendez que le serveur démarre
4. Vous devez voir : `Local: http://localhost:5173/`
5. Ouvrez votre navigateur sur `http://localhost:5173`

### 7.2 Créer un Compte Test

1. Sur le site, cliquez sur **"Mon Compte"** (en haut à droite)
2. Cliquez sur **"Créer un compte"**
3. Remplissez le formulaire :
   - **Nom complet** : Votre nom
   - **Email** : Votre email de test (ex: `test@test.com`)
   - **Téléphone** : `0612345678`
   - **Mot de passe** : `Test1234`
4. Cliquez sur **"Créer mon compte"**

### 7.3 Vérifier dans Supabase

1. Retournez sur **Supabase** (dans votre navigateur)
2. Cliquez sur **"Authentication"** (menu gauche)
3. Cliquez sur **"Users"**
4. ✅ Vous devez voir votre utilisateur dans la liste !

**🎉 SI VOUS VOYEZ VOTRE UTILISATEUR = SUCCÈS TOTAL !**

### 7.4 Vérifier les Données

1. Dans Supabase, cliquez sur **"Table Editor"**
2. Cliquez sur la table **"profiles"**
3. ✅ Vous devez voir votre profil avec votre nom, email, téléphone !

**🎉 PARFAIT ! Supabase fonctionne à 100% !**

---

## 🎯 ÉTAPE 8 : Ajouter des Données de Test (Optionnel)

### 8.1 Ajouter des Plats

1. Dans **Table Editor**, cliquez sur la table **"dishes"**
2. Cliquez sur **"Insert"** > **"Insert row"**
3. Remplissez le formulaire :
   - **name** : `Burger Classique`
   - **slug** : `burger-classique`
   - **description** : `Pain brioché, steak, cheddar`
   - **price** : `11.90`
   - **image_url** : `https://images.unsplash.com/photo-1568901346375-23c9450c58cd`
   - **category_id** : Cliquez sur le menu et choisissez "Plats"
   - **stock** : `20`
   - **is_available** : Cochez ✅
   - **is_popular** : Cochez ✅
4. Cliquez sur **"Save"**

**Répétez** pour ajouter 3-4 plats différents !

### 8.2 Méthode Rapide avec SQL

Vous préférez copier-coller ? Retournez dans **SQL Editor** et exécutez :

```sql
-- Récupérer l'ID de la catégorie "Plats"
DO $$
DECLARE
  plats_id UUID;
BEGIN
  SELECT id INTO plats_id FROM categories WHERE slug = 'plats';

  INSERT INTO dishes (name, slug, description, price, image_url, category_id, stock, is_popular, is_available) VALUES
    ('Burger Classique', 'burger-classique', 'Pain brioché, steak haché, cheddar, sauce maison', 11.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', plats_id, 20, true, true),
    ('Poke Bowl Saumon', 'poke-bowl-saumon', 'Riz sushi, saumon frais, avocat, edamame', 12.90, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', plats_id, 15, true, true),
    ('Salade César', 'salade-cesar', 'Poulet grillé, parmesan, croûtons', 9.90, 'https://images.unsplash.com/photo-1546793665-c74683f339c1', plats_id, 25, false, true);
END $$;
```

Cliquez sur **Run** ✅

---

## ✅ Récapitulatif - Qu'avez-vous Fait ?

🎉 **Félicitations !** Vous avez :

✅ Créé un compte Supabase
✅ Créé un projet `pause-dej`
✅ Créé une base de données avec 9 tables
✅ Configuré l'authentification
✅ Récupéré vos clés API
✅ Connecté votre app React à Supabase
✅ Testé la création de compte
✅ Vérifié que les données sont bien enregistrées

**Votre app a maintenant un backend professionnel ! 🚀**

---

## 🆘 Problèmes Courants

### ❌ "Invalid API key"

**Cause** : Mauvaise clé ou mauvaise URL

**Solution** :
1. Vérifiez `frontend/.env`
2. Assurez-vous qu'il n'y a **pas d'espaces** avant/après les clés
3. Vérifiez que vous avez copié la **clé complète**
4. Redémarrez le serveur (`npm run dev`)

### ❌ "relation profiles does not exist"

**Cause** : Le schéma SQL n'a pas été exécuté

**Solution** :
1. Retournez à l'**ÉTAPE 3**
2. Exécutez le fichier `supabase/schema.sql`
3. Vérifiez que vous voyez "Success"

### ❌ "User already registered"

**Cause** : Normal ! Vous avez déjà créé un compte avec cet email

**Solution** :
- Utilisez un autre email
- OU supprimez l'utilisateur dans Authentication > Users

### ❌ Le serveur ne démarre pas

**Solution** :
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 🎓 Prochaines Étapes

Maintenant que Supabase fonctionne, vous pouvez :

1. ✅ **Tester l'inscription/connexion** sur votre app
2. ✅ **Ajouter des plats** dans la base de données
3. ✅ **Passer une vraie commande** et la voir dans Supabase
4. 🚀 **Intégrer Stripe** pour les paiements
5. 🚀 **Créer l'admin dashboard** pour gérer les produits

---

## 📚 Ressources Utiles

- 📖 [Documentation Supabase](https://supabase.com/docs)
- 🎥 [Tutoriels vidéo](https://www.youtube.com/@Supabase)
- 💬 [Discord Supabase](https://discord.supabase.com) - Aide communauté
- 🐛 Problème ? Demandez-moi !

---

**Vous avez terminé le setup Supabase ! 🎉**

Si vous avez des questions ou des problèmes, n'hésitez pas à demander de l'aide !
