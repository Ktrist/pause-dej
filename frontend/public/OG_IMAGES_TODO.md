# 🎨 Images Open Graph à Créer

Les images Open Graph (OG) sont essentielles pour le partage sur les réseaux sociaux (Facebook, LinkedIn, Twitter, etc.).

## 📐 Spécifications Techniques

- **Dimensions** : 1200 x 630 pixels (ratio 1.91:1)
- **Format** : JPG ou PNG
- **Poids max** : < 1 MB (idéalement < 300 KB)
- **Texte** : Lisible même en petit (prévisualisation mobile)

---

## 🎯 Images à Créer

### 1. **og-image.jpg** (Image par défaut)
**Chemin** : `/public/og-image.jpg`

**Contenu** :
- Logo Pause Dej' centré
- Baseline : "Livraison de repas frais à Annecy"
- Background : Photo appétissante de plats
- Couleurs : Brand colors (voir theme.js)

**Utilisation** : Page d'accueil + fallback pour toutes les pages

---

### 2. **og-catalogue.jpg**
**Chemin** : `/public/images/og-catalogue.jpg`

**Contenu** :
- Grille de 4-6 plats variés
- Texte : "Notre Carte - Plats frais du jour"
- Sous-texte : "Commandez avant minuit"

**Utilisation** : Page /a-la-carte

---

### 3. **og-how-it-works.jpg**
**Chemin** : `/public/images/og-how-it-works.jpg`

**Contenu** :
- Illustration des 3 étapes :
  1. Commandez (icône panier)
  2. On cuisine (icône chef)
  3. Livraison 7h-9h (icône livreur)
- Texte : "Comment ça marche ?"

**Utilisation** : Page /comment-ca-marche

---

### 4. **og-b2b.jpg**
**Chemin** : `/public/images/og-b2b.jpg`

**Contenu** :
- Photo d'équipe déjeunant ensemble
- Texte : "Pause Dej' At Work"
- Sous-texte : "Solution restauration pour votre entreprise"

**Utilisation** : Page /pause-dej-at-work

---

### 5. **og-contact.jpg**
**Chemin** : `/public/images/og-contact.jpg`

**Contenu** :
- Illustration contact/support
- Texte : "Contactez-nous"
- Icônes : Email, Téléphone

**Utilisation** : Page /contact

---

## 🛠️ Outils Recommandés

### Design
- **Canva** (gratuit, templates OG intégrés)
- **Figma** (design professionnel)
- **Adobe Photoshop** (si disponible)

### Vérification
- **Facebook Debugger** : https://developers.facebook.com/tools/debug/
- **Twitter Card Validator** : https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector** : https://www.linkedin.com/post-inspector/

---

## ✅ Checklist de Création

Pour chaque image :

- [ ] Respecter les dimensions 1200 x 630 px
- [ ] Poids < 300 KB
- [ ] Texte lisible en petit format
- [ ] Logo Pause Dej' visible
- [ ] Couleurs cohérentes avec la brand
- [ ] Optimiser avec TinyPNG ou ImageOptim
- [ ] Tester sur Facebook Debugger
- [ ] Tester sur Twitter Card Validator

---

## 📝 Template Texte Recommandé

### Structure Type
```
┌────────────────────────────────────┐
│  [Logo]                            │
│                                    │
│  TITRE PRINCIPAL                   │
│  Sous-titre descriptif             │
│                                    │
│  [Image/Illustration de fond]      │
└────────────────────────────────────┘
```

### Typographie
- **Titre** : Bold, 60-80px
- **Sous-titre** : Regular, 40-50px
- **Police** : Sans-serif (lisibilité optimale)

---

## 🎨 Palette de Couleurs

Utiliser les couleurs du thème (`frontend/src/theme.js`) :

- **Primary** : Orange (#E85D04 ou similaire)
- **Secondary** : Couleurs complémentaires du thème
- **Background** : Blanc ou photos de plats en overlay

---

## 🚀 Déploiement

Une fois les images créées :

1. Placer dans `/frontend/public/` ou `/frontend/public/images/`
2. Référencer dans les composants SEO de chaque page
3. Vérifier avec `npm run build`
4. Tester les URLs avec Facebook Debugger

---

## 💡 Astuce

Pour générer rapidement des OG images :
- Utiliser Canva avec template "Facebook Post" (1200x630)
- Dupliquer le template pour chaque page
- Exporter en JPG (qualité 80%)
- Optimiser avec https://tinypng.com/
