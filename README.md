# 🍽️ Pause Dej' - Livraison Express en 30 Minutes

> **Plateforme de livraison de repas ultra-rapide** - B2C & B2B

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-2-teal.svg)](https://chakra-ui.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green.svg)](https://supabase.com/)

---

## 📊 État du Projet

**Version** : MVP v1.0
**Progression** : **30/144 User Stories (20.8%)**
**Dernière mise à jour** : 2025-12-08

### ✅ Fonctionnalités Opérationnelles

| Fonctionnalité | Statut | Détails |
|---|---|---|
| 🏠 **Homepage** | ✅ 100% | Hero, Comment ça marche, Plats populaires, Témoignages |
| 🍽️ **Catalogue** | ✅ 100% | 15 plats, filtres, recherche, modal détails |
| 🛒 **Panier** | ✅ 100% | CRUD items, codes promo, persistence localStorage |
| 🔐 **Authentification** | ✅ 100% | Signup, Login, Password reset, Session persistante |
| 👤 **Compte Utilisateur** | ✅ 100% | Profil, Adresses, Historique, Déconnexion |
| 💳 **Checkout** | ✅ 100% | 3 étapes (Adresse, Créneau, Paiement), Confirmation |
| 🗄️ **Backend Supabase** | ✅ 100% | 9 tables, RLS, Auth, Seed data |

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (gratuit)
- Git

### Installation (5 minutes)

```bash
# 1. Cloner le projet
git clone https://github.com/Ktrist/pause-dej.git
cd pause-dej

# 2. Installer les dépendances
cd frontend
npm install

# 3. Configurer Supabase
# Créer frontend/.env avec vos clés Supabase
# Voir section "Configuration Supabase" ci-dessous

# 4. Lancer le serveur de dev
npm run dev
```

**🌐 Ouvrir** : http://localhost:5173

---

## 🔧 Configuration Supabase

### Pour les Débutants

📖 **Suivez le guide pas à pas** : [`SUPABASE_GUIDE_DEBUTANT.md`](./SUPABASE_GUIDE_DEBUTANT.md)

**Durée** : 30 minutes
**Niveau** : Débutant (aucune connaissance requise)

### Pour les Développeurs Expérimentés

📖 **Guide technique** : [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

**Résumé rapide** :

```bash
# 1. Créer un projet Supabase sur https://supabase.com
# 2. Exécuter le schéma SQL : supabase/schema.sql

# 3. Créer frontend/.env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 🏗️ Architecture Technique

### Stack Technologique

**Frontend**
- ⚛️ React 18 (Hooks, Context API)
- ⚡ Vite 5 (Build tool ultra-rapide)
- 🎨 Chakra UI v2 (Design system)
- 🛣️ React Router v7 (Navigation)

**Backend**
- 🗄️ Supabase (PostgreSQL + Auth + Storage)
- 🔐 Row Level Security (RLS)
- 🔄 Real-time subscriptions ready

**Paiement** (Préparé)
- 💳 Stripe (Elements + Payment Intents)
- 🍎 Apple Pay / Google Pay ready

### Structure du Projet

```
pause-dej/
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages de l'app
│   │   ├── context/         # State management
│   │   ├── data/            # Mock data
│   │   └── supabaseClient.js
│   └── public/              # Assets statiques
├── supabase/
│   └── schema.sql           # Schéma complet de la DB
└── docs/                    # Documentation
```

### Schéma de Base de Données

**9 Tables PostgreSQL** :

- `profiles` → Profils utilisateurs
- `addresses` → Adresses de livraison
- `categories` → Catégories de plats
- `dishes` → Plats (nutrition, allergènes)
- `promo_codes` → Codes de réduction
- `time_slots` → Créneaux de livraison
- `orders` → Commandes
- `order_items` → Lignes de commande
- `payment_methods` → Méthodes de paiement

**Schéma complet** : [`supabase/schema.sql`](./supabase/schema.sql)

---

## 📱 Fonctionnalités Détaillées

### 🏠 Homepage

- Hero Section avec CTA et USPs
- Comment ça marche (3 étapes visuelles)
- Plats populaires en carousel
- Témoignages clients avec avatars
- Footer complet

### 🍽️ Catalogue

- 15 plats avec photos haute qualité
- Filtres par 7 catégories
- Recherche temps réel avec autocomplete
- Tri par popularité, prix, nom
- Modal détails (nutrition + allergènes)
- Badges : Stock, Végétarien, Vegan, Populaire

### 🛒 Panier

- Liste des items avec images
- Steppers quantité (min 1, max 10)
- **4 codes promo fonctionnels** :
  - `BIENVENUE10` : 10% de réduction (max 15€)
  - `PAUSEDEJ20` : 20% si commande > 30€
  - `LIVRAISON` : Livraison gratuite (3.90€)
  - `PROMO5` : 5€ de réduction si > 25€
- Calcul auto : Sous-total, Livraison, Réduction, Total
- Livraison gratuite > 30€
- Persistence dans localStorage

### 🔐 Authentification

- Inscription : Email/Password avec validation
- Connexion : Email/Password + Google OAuth (préparé)
- Session persistante Supabase
- Password reset complet
- Protection des routes

### 👤 Compte Utilisateur

- Profil : Nom, Email, Téléphone (éditable)
- Adresses : CRUD complet
- Historique commandes (UI prête)
- Moyens de paiement (UI prête, Stripe à intégrer)
- Déconnexion sécurisée

### 💳 Checkout (3 Étapes)

**Étape 1** - Adresse de livraison
**Étape 2** - Créneau horaire (déjeuner/dîner)
**Étape 3** - Paiement (Stripe ready)

### ✅ Confirmation de Commande

- Numéro de commande (`PDJ-YYYYMMDD-XXX`)
- Détails complets
- Informations de suivi
- CTAs : Retour accueil, Voir commandes

---

## 🎨 Design System

### Couleurs

```css
--brand-500: #FFA500  /* Orange principal */
--brand-600: #FF8C00  /* Orange foncé */
--accent: #00A991     /* Vert d'accent */
```

### Composants

- Responsive par défaut (mobile-first)
- Dark mode ready
- Accessibilité (ARIA labels)
- Animations fluides

---

## 🧪 Tests & Build

### Lancer en Dev

```bash
cd frontend
npm run dev
```

### Builder pour Production

```bash
cd frontend
npm run build
```

**Bundle size** : ~930 KB (282 KB gzipped)

---

## 📊 Progression du Projet

📈 **Tracker détaillé** : [`USER_STORIES_PROGRESS.md`](./USER_STORIES_PROGRESS.md)

### User Stories Complétées (30/144)

| Epic | US | Total | % |
|---|---|---|---|
| Catalogue (Web) | 4 | 4 | 100% ✅ |
| Panier | 6 | 6 | 100% ✅ |
| Compte Utilisateur | 5 | 5 | 100% ✅ |
| Checkout | 5 | 5 | 100% ✅ |
| Homepage | 4 | 5 | 80% |
| **TOTAL** | **30** | **144** | **20.8%** |

---

## 🗺️ Roadmap

### 🔥 Phase 1 - MVP Core (Terminé ✅)

- [x] Homepage complète
- [x] Catalogue avec filtres
- [x] Panier avec codes promo
- [x] Authentification
- [x] Compte utilisateur
- [x] Checkout 3 étapes
- [x] Backend Supabase

### 🚀 Phase 2 - Paiements & Production (À venir)

- [ ] Intégration Stripe
- [ ] Apple Pay / Google Pay
- [ ] Emails transactionnels
- [ ] Migration données mockées
- [ ] Tests end-to-end
- [ ] Déploiement production

### 📊 Phase 3 - Admin & Operations

- [ ] Dashboard admin
- [ ] Gestion des produits (CRUD)
- [ ] Vue cuisine
- [ ] Gestion du stock
- [ ] Analytics et rapports

---

## 📚 Documentation

| Document | Description |
|---|---|
| [README.md](./README.md) | Vue d'ensemble (ce fichier) |
| [USER_STORIES_PROGRESS.md](./USER_STORIES_PROGRESS.md) | Suivi des 30 US |
| [SUPABASE_GUIDE_DEBUTANT.md](./SUPABASE_GUIDE_DEBUTANT.md) | Guide Supabase débutants (30 min) |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Guide technique Supabase |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Résumé complet |
| [PULL_REQUEST_GUIDE.md](./PULL_REQUEST_GUIDE.md) | Comment créer une PR |

---

## 🐛 Troubleshooting

### L'app ne démarre pas

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Erreur Supabase "Invalid API key"

1. Vérifiez `frontend/.env`
2. Pas d'espaces avant/après les clés
3. Redémarrez le serveur

### Les données ne s'affichent pas

1. Ouvrez Supabase Dashboard
2. Vérifiez Table Editor > dishes
3. Ajoutez des plats (Étape 8 du guide)

---

## 📧 Support

- 🐛 **Bug** : Issue GitHub
- 💬 **Question** : Discussions GitHub
- 📖 **Documentation** : Voir `/docs`

---

## 📄 Licence

Projet privé. Tous droits réservés.

---

## 🎉 Remerciements

Développé avec ❤️ par **Claude Code** & **Tristan Kaffel**

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-08
