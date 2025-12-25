# 🚀 Plan de Mise en Production - Pause Dej'

## 📋 Table des Matières
1. [Infrastructure & Hébergement](#infrastructure--hébergement)
2. [Optimisation SEO](#optimisation-seo)
3. [Checklist Production](#checklist-production)
4. [Configuration & Déploiement](#configuration--déploiement)
5. [Monitoring & Performance](#monitoring--performance)
6. [Budget Estimatif](#budget-estimatif)

---

## 🏗️ Infrastructure & Hébergement

### Stack Recommandé (Optimisé Coût/Performance)

#### 1. **Frontend : Vercel** ⭐ RECOMMANDÉ
**Pourquoi ?**
- ✅ **Gratuit** pour projets personnels/startup
- ✅ **CDN global automatique** (Edge Network)
- ✅ **Build & Deploy automatique** depuis GitHub
- ✅ **HTTPS automatique** avec certificat SSL
- ✅ **Preview deployments** pour chaque PR
- ✅ **Optimisé pour React/Vite**
- ✅ **Excellent pour SEO** (SSR/SSG si besoin)

**Plan Gratuit inclut** :
- 100 GB bandwidth/mois
- Déploiements illimités
- Domaine personnalisé
- Analytics de base

**Alternative** : Netlify (similaire, légèrement moins performant)

**Coût** : **0€ → 20€/mois** (si croissance)

---

#### 2. **Backend : Supabase** ✅ DÉJÀ EN PLACE
**Pourquoi ?**
- ✅ **Gratuit jusqu'à 500 MB** de base de données
- ✅ **Auth, Storage, Edge Functions inclus**
- ✅ **Backups automatiques** sur plan payant
- ✅ **Real-time subscriptions**
- ✅ **PostgREST API** performante

**Plan Gratuit inclut** :
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth

**Passage Pro recommandé à 100+ commandes/jour** :
- Database illimitée
- Backups quotidiens
- Logs 7 jours
- Support prioritaire

**Coût** : **0€ → 25$/mois** (Pro)

---

#### 3. **Paiements : Stripe** ✅ DÉJÀ EN PLACE
**Pourquoi ?**
- ✅ **Pas de frais fixes**, seulement transaction
- ✅ **2.9% + 0.25€ par transaction** (Europe)
- ✅ **Gestion 3D Secure automatique**
- ✅ **Dashboard analytics complet**

**Coût** : **Variable selon CA** (~3% du CA)

---

#### 4. **Emails : Resend** ✅ DÉJÀ EN PLACE
**Pourquoi ?**
- ✅ **Gratuit jusqu'à 100 emails/jour** (3000/mois)
- ✅ **Excellent deliverability**
- ✅ **API simple**
- ✅ **Templates HTML**

**Coût** : **0€ → 20$/mois** (10,000 emails/mois)

---

#### 5. **CDN Images : Cloudinary** ⭐ RECOMMANDÉ
**Pourquoi ?**
- ✅ **Gratuit jusqu'à 25 GB storage**
- ✅ **Optimisation automatique** (WebP, responsive)
- ✅ **Transformation à la volée** (resize, crop, compress)
- ✅ **CDN global intégré**
- ✅ **Lazy loading automatique**

**Plan Gratuit inclut** :
- 25 GB storage
- 25 GB bandwidth/mois
- Transformations illimitées

**Alternative** : Uploadcare, ImageKit

**Coût** : **0€ → 89$/mois** (si forte croissance)

---

#### 6. **Domaine : OVH / Cloudflare** ⭐ RECOMMANDÉ
**Pause-dej.fr** ou **pause-dej.com**

**OVH** :
- .fr : ~10€/an
- .com : ~12€/an
- Email pro inclus (option)

**Cloudflare** (DNS + CDN) :
- Gratuit (plan Free excellent)
- CDN global
- SSL/TLS flexible
- DDoS protection
- Cache automatique

**Coût** : **10-15€/an** (domaine) + **0€** (Cloudflare)

---

### Architecture Production

```
┌─────────────────────────────────────────────────┐
│              UTILISATEURS                       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│          CLOUDFLARE (CDN + SSL)                 │
│  - Cache statique                               │
│  - DDoS protection                              │
│  - DNS management                               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│          VERCEL (Frontend)                      │
│  - React/Vite app                               │
│  - CDN Edge Network                             │
│  - HTTPS automatique                            │
│  - Build/Deploy automatique                     │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
┌───────────────┐    ┌──────────────────┐
│   SUPABASE    │    │   STRIPE API     │
│  (Backend)    │    │   (Paiements)    │
│               │    │                  │
│ - PostgreSQL  │    │ - Payment        │
│ - Auth        │    │   Intents        │
│ - Storage     │    │ - Webhooks       │
│ - Edge Fns    │    │                  │
└───────────────┘    └──────────────────┘
        │
        ▼
┌───────────────────────────┐
│      CLOUDINARY           │
│   (Images CDN)            │
│                           │
│ - Image optimization      │
│ - WebP conversion         │
│ - Responsive images       │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│       RESEND              │
│   (Email Service)         │
│                           │
│ - Transactional emails    │
│ - Marketing emails        │
│ - Templates               │
└───────────────────────────┘
```

---

## 🔍 Optimisation SEO

### 1. **Meta Tags & Open Graph**

#### Créer composant SEO réutilisable

```jsx
// src/components/common/SEO.jsx
import { Helmet } from 'react-helmet-async'

export default function SEO({
  title = 'Pause Dej\' - Livraison de repas frais à Annecy',
  description = 'Commandez des plats frais et savoureux livrés le matin à Annecy. Cuisine locale, produits de qualité, livraison rapide entre 7h et 9h.',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
  noindex = false
}) {
  const siteUrl = 'https://pause-dej.fr'
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="Pause Dej'" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional SEO */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  )
}
```

#### Utilisation dans les pages

```jsx
// src/pages/home/HomePage.jsx
import SEO from '../../components/common/SEO'

export default function HomePage() {
  return (
    <>
      <SEO
        title="Pause Dej' - Livraison de repas frais à Annecy"
        description="Commandez avant minuit, recevez vos plats frais le lendemain matin entre 7h et 9h. Cuisine locale et produits de qualité."
        image="/images/og-home.jpg"
        url="/"
      />
      <Box>
        {/* ... content */}
      </Box>
    </>
  )
}

// src/pages/catalogue/CataloguePage.jsx
export default function CataloguePage() {
  return (
    <>
      <SEO
        title="Notre Carte - Plats frais du jour | Pause Dej'"
        description="Découvrez notre sélection quotidienne de plats frais : entrées, plats principaux, desserts. Cuisine locale avec produits de saison."
        image="/images/og-catalogue.jpg"
        url="/a-la-carte"
      />
      {/* ... */}
    </>
  )
}
```

---

### 2. **Structured Data (JSON-LD)**

#### Schema.org pour le référencement

```jsx
// src/components/common/StructuredData.jsx
import { Helmet } from 'react-helmet-async'

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Pause Dej'",
    "image": "https://pause-dej.fr/logo.jpg",
    "url": "https://pause-dej.fr",
    "telephone": "+33650772334",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Annecy",
      "addressLocality": "Annecy",
      "postalCode": "74000",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "45.8992",
      "longitude": "6.1294"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "07:00",
        "closes": "09:00"
      }
    ],
    "servesCuisine": "French",
    "priceRange": "€€",
    "acceptsReservations": "True",
    "menu": "https://pause-dej.fr/a-la-carte"
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

export function ProductSchema({ dish }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": dish.name,
    "image": dish.image,
    "description": dish.description,
    "offers": {
      "@type": "Offer",
      "url": `https://pause-dej.fr/a-la-carte?dish=${dish.id}`,
      "priceCurrency": "EUR",
      "price": dish.price,
      "availability": dish.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": dish.rating_avg && {
      "@type": "AggregateRating",
      "ratingValue": dish.rating_avg,
      "reviewCount": dish.rating_count
    }
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}
```

---

### 3. **Images Optimisées**

#### Component Image optimisé

```jsx
// src/components/common/OptimizedImage.jsx
import { useState } from 'react'
import { Box, Skeleton } from '@chakra-ui/react'

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  objectFit = 'cover',
  borderRadius,
  lazy = true,
  ...props
}) {
  const [loaded, setLoaded] = useState(false)

  // Cloudinary transformation pour optimisation
  const getOptimizedUrl = (url) => {
    if (!url) return ''
    // Si déjà une URL Cloudinary, ajouter transformations
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto,w_auto/')
    }
    return url
  }

  return (
    <Box position="relative" width={width} height={height} {...props}>
      {!loaded && (
        <Skeleton
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          borderRadius={borderRadius}
        />
      )}
      <Box
        as="img"
        src={getOptimizedUrl(src)}
        alt={alt}
        width="100%"
        height="100%"
        objectFit={objectFit}
        borderRadius={borderRadius}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => setLoaded(true)}
        opacity={loaded ? 1 : 0}
        transition="opacity 0.3s"
      />
    </Box>
  )
}
```

#### Utilisation

```jsx
// Avant
<Image src={dish.image} alt={dish.name} />

// Après
<OptimizedImage
  src={dish.image}
  alt={`${dish.name} - Plat frais du jour chez Pause Dej'`}
  width="100%"
  height="200px"
  borderRadius="md"
/>
```

---

### 4. **Sitemap.xml & robots.txt**

#### Générer sitemap dynamiquement

```js
// scripts/generate-sitemap.js
import { supabase } from '../src/lib/supabase'
import fs from 'fs'

async function generateSitemap() {
  const baseUrl = 'https://pause-dej.fr'

  // Pages statiques
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/a-la-carte', priority: 0.9, changefreq: 'daily' },
    { url: '/comment-ca-marche', priority: 0.8, changefreq: 'monthly' },
    { url: '/pause-dej-at-work', priority: 0.7, changefreq: 'weekly' },
    { url: '/contact', priority: 0.6, changefreq: 'monthly' },
    { url: '/legal/mentions-legales', priority: 0.3, changefreq: 'yearly' },
    { url: '/legal/cgv', priority: 0.3, changefreq: 'yearly' },
    { url: '/legal/confidentialite', priority: 0.3, changefreq: 'yearly' }
  ]

  // Pages dynamiques (plats)
  const { data: dishes } = await supabase
    .from('dishes')
    .select('id, updated_at')
    .eq('is_available', true)

  const dishPages = dishes?.map(dish => ({
    url: `/a-la-carte?dish=${dish.id}`,
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: dish.updated_at
  })) || []

  const allPages = [...staticPages, ...dishPages]

  // Générer XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  fs.writeFileSync('public/sitemap.xml', xml)
  console.log('✅ Sitemap généré!')
}

generateSitemap()
```

#### robots.txt

```txt
# public/robots.txt
User-agent: *
Allow: /

# Bloquer pages privées
Disallow: /compte
Disallow: /checkout
Disallow: /panier
Disallow: /admin

# Sitemap
Sitemap: https://pause-dej.fr/sitemap.xml
```

---

### 5. **Performance & Core Web Vitals**

#### Lazy Loading Routes

```jsx
// src/App.jsx
import { lazy, Suspense } from 'react'
import LoadingSpinner from './components/common/LoadingSpinner'

// Lazy load pages non-critiques
const AccountPage = lazy(() => import('./pages/account/AccountPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Pages critiques chargées directement */}
          <Route path="/" element={<HomePage />} />
          <Route path="/a-la-carte" element={<CataloguePage />} />

          {/* Pages lazy loaded */}
          <Route path="/compte" element={<AccountPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
```

#### Code Splitting par route

```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'chakra': ['@chakra-ui/react'],
          'supabase': ['@supabase/supabase-js'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      }
    }
  }
}
```

---

## ✅ Checklist Production

### Phase 1 : Préparation (1-2 jours)

#### SEO Technique
- [ ] Installer `react-helmet-async`
- [ ] Créer composant `SEO.jsx` avec meta tags
- [ ] Créer composant `StructuredData.jsx` (JSON-LD)
- [ ] Ajouter SEO sur toutes les pages principales
- [ ] Générer `sitemap.xml`
- [ ] Créer `robots.txt`
- [ ] Optimiser toutes les images (alt tags, WebP)
- [ ] Créer composant `OptimizedImage.jsx`
- [ ] Remplacer `<Image />` par `<OptimizedImage />`

#### Performance
- [ ] Lazy load routes non-critiques
- [ ] Code splitting (vendor, chakra, etc.)
- [ ] Minification automatique (Vite)
- [ ] Compression Gzip/Brotli (Vercel auto)
- [ ] Cache headers (Vercel auto)

#### Images
- [ ] Créer compte Cloudinary gratuit
- [ ] Migrer images vers Cloudinary
- [ ] Configurer transformations automatiques
- [ ] Générer images OG (1200x630) pour chaque page

---

### Phase 2 : Configuration Hébergement (1 jour)

#### Domaine
- [ ] Acheter domaine `pause-dej.fr` (OVH, ~10€/an)
- [ ] Configurer DNS sur Cloudflare
- [ ] Activer Cloudflare CDN (gratuit)

#### Vercel
- [ ] Créer compte Vercel (gratuit)
- [ ] Connecter repo GitHub
- [ ] Configurer build command : `npm run build`
- [ ] Configurer output directory : `dist`
- [ ] Ajouter domaine personnalisé
- [ ] Configurer variables d'environnement :
  ```env
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_STRIPE_PUBLIC_KEY=
  ```

#### Supabase Production
- [ ] Créer projet production séparé
- [ ] Migrer toutes les migrations
- [ ] Configurer RLS policies
- [ ] Créer utilisateur admin
- [ ] Configurer Stripe webhooks production
- [ ] Tester Edge Functions en prod

---

### Phase 3 : Monitoring & Analytics (1 jour)

#### Error Tracking
- [ ] Installer Sentry
```bash
npm install @sentry/react
```
```jsx
// src/main.jsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
```

#### Analytics
- [ ] Google Analytics 4
```jsx
// src/components/common/GoogleAnalytics.jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function GoogleAnalytics() {
  const location = useLocation()

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: location.pathname + location.search
      })
    }
  }, [location])

  return null
}
```

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

### Phase 4 : Sécurité (1 jour)

#### Headers HTTP
```js
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

#### Environment Variables
- [ ] Utiliser Vercel Environment Variables (dashboard)
- [ ] Séparer dev/preview/production
- [ ] **Jamais** commit de `.env` dans git
- [ ] Documenter variables dans README

---

### Phase 5 : Tests Avant Launch (1-2 jours)

#### Tests Fonctionnels
- [ ] Parcours complet : Signup → Catalogue → Panier → Checkout → Paiement
- [ ] Test sur mobile (iOS + Android)
- [ ] Test sur desktop (Chrome, Firefox, Safari)
- [ ] Test paiement Stripe en mode test
- [ ] Test emails (confirmation, tracking, etc.)
- [ ] Test admin dashboard

#### Tests Performance
- [ ] Google PageSpeed Insights (score > 90)
- [ ] Lighthouse audit (Performance, SEO, Accessibility, Best Practices)
- [ ] WebPageTest (LCP < 2.5s, FID < 100ms, CLS < 0.1)

#### Tests SEO
- [ ] Google Search Console configuré
- [ ] Soumettre sitemap
- [ ] Vérifier indexation
- [ ] Rich Results Test (structured data)
- [ ] Mobile-Friendly Test

---

## 💰 Budget Estimatif Production

### Coûts Mensuels (Début)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| **Vercel** | Hobby (gratuit) | 0€ |
| **Supabase** | Free | 0€ |
| **Stripe** | Pay-as-you-go | ~3% CA |
| **Resend** | Free (3000 emails) | 0€ |
| **Cloudinary** | Free (25 GB) | 0€ |
| **Cloudflare** | Free | 0€ |
| **Domaine** | .fr | ~1€/mois |
| **Google Analytics** | Free | 0€ |
| **Sentry** | Free (5K errors) | 0€ |
| **TOTAL** | | **~1€/mois** |

### Coûts Scaling (100+ commandes/jour)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| **Vercel** | Pro | 20€ |
| **Supabase** | Pro | 25$ (~23€) |
| **Stripe** | 2.9% + 0.25€ | Variable |
| **Resend** | Growth | 20$ (~18€) |
| **Cloudinary** | Plus | 89$ (~82€) |
| **Cloudflare** | Free | 0€ |
| **Domaine** | .fr | ~1€ |
| **Sentry** | Team | 26$ (~24€) |
| **TOTAL** | | **~168€/mois** |

---

## 📦 Déploiement Étape par Étape

### 1. Préparer le Code

```bash
# 1. Installer dépendances SEO
npm install react-helmet-async

# 2. Build de test
npm run build

# 3. Test du build localement
npm run preview

# 4. Vérifier qu'il n'y a pas d'erreurs
npm run lint
```

---

### 2. Créer Projet Supabase Production

```bash
# Dans dashboard Supabase :
# 1. New Project → "pause-dej-production"
# 2. Noter l'URL et anon key
# 3. Exécuter toutes les migrations depuis /supabase/migrations
```

---

### 3. Configurer Vercel

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link projet
vercel

# 4. Ajouter variables d'environnement
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLIC_KEY

# 5. Déployer
vercel --prod
```

---

### 4. Configurer Domaine

```bash
# Dans Vercel Dashboard :
# 1. Settings → Domains
# 2. Add Domain → pause-dej.fr
# 3. Suivre instructions DNS (pointer vers Vercel)

# Dans Cloudflare :
# 1. Add site → pause-dej.fr
# 2. Configurer nameservers
# 3. Activer SSL/TLS (Full)
# 4. Activer Auto Minify (JS, CSS, HTML)
```

---

### 5. Vérifications Post-Déploiement

```bash
# 1. Tester URL production
curl -I https://pause-dej.fr

# 2. Vérifier HTTPS
# Naviguer vers https://pause-dej.fr
# Vérifier cadenas vert

# 3. Tester performance
# https://pagespeed.web.dev/
# Entrer pause-dej.fr

# 4. Vérifier SEO
# https://search.google.com/test/mobile-friendly
# Entrer pause-dej.fr
```

---

## 🎯 Timeline Recommandé

### Semaine 1 (SEO + Performance)
- **Jour 1-2** : Optimisation SEO (meta tags, structured data, images)
- **Jour 3** : Performance (lazy loading, code splitting)
- **Jour 4** : Sitemap, robots.txt, OG images
- **Jour 5** : Tests et corrections

### Semaine 2 (Infrastructure)
- **Jour 1** : Acheter domaine + Cloudflare setup
- **Jour 2** : Créer projet Supabase production
- **Jour 3** : Configurer Vercel + déploiement test
- **Jour 4** : Configurer monitoring (Sentry, GA4)
- **Jour 5** : Tests complets

### Semaine 3 (Tests & Launch)
- **Jour 1-2** : Tests fonctionnels exhaustifs
- **Jour 3** : Tests performance et SEO
- **Jour 4** : Corrections finales
- **Jour 5** : 🚀 **LAUNCH !**

---

## 📋 Next Steps

**Je recommande de commencer par :**

1. **Créer les composants SEO** (SEO.jsx, StructuredData.jsx, OptimizedImage.jsx)
2. **Optimiser les images** (Cloudinary + alt tags)
3. **Générer sitemap.xml et robots.txt**
4. **Configurer Vercel** (compte gratuit + premier déploiement test)
5. **Acheter le domaine** pause-dej.fr

**Voulez-vous que je commence par implémenter les composants SEO ?**
