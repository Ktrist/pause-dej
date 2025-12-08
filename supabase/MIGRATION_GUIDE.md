# 📦 Guide de Migration des Données - Pause Dej'

> **Objectif** : Importer les 15 plats mockés dans votre base de données Supabase

**Durée** : 5 minutes
**Prérequis** : Supabase configuré (voir `SUPABASE_GUIDE_DEBUTANT.md`)

---

## 🎯 Qu'est-ce que ce guide fait ?

Ce guide vous permet de **transférer les 15 plats** qui sont actuellement dans le code JavaScript (`mockData.js`) vers votre **base de données Supabase réelle**.

**Avant** : Les plats sont stockés dans `frontend/src/data/mockData.js`
**Après** : Les plats seront dans Supabase et accessibles depuis n'importe où

---

## 📋 Étape 1 : Vérifier que Supabase est Configuré

Avant de commencer, assurez-vous que :

✅ Vous avez suivi le guide `SUPABASE_GUIDE_DEBUTANT.md`
✅ Vous avez exécuté le schéma SQL principal (`supabase/schema.sql`)
✅ Vous voyez bien les 9 tables dans Supabase Table Editor

---

## 📋 Étape 2 : Ouvrir l'Éditeur SQL

1. Allez sur **https://supabase.com**
2. Ouvrez votre projet **pause-dej**
3. Dans le menu de **gauche**, cliquez sur **"SQL Editor"** (`</>`)
4. Vous voyez l'éditeur de code SQL

---

## 📋 Étape 3 : Copier le Script de Migration

### Option A - Depuis VS Code (Recommandé)

1. **Ouvrez VS Code**
2. Naviguez vers le fichier : `supabase/seed_dishes.sql`
3. **Sélectionnez tout** (Cmd+A sur Mac, Ctrl+A sur Windows)
4. **Copiez** (Cmd+C ou Ctrl+C)

### Option B - Depuis GitHub

1. Allez sur GitHub : `https://github.com/Ktrist/pause-dej`
2. Naviguez vers `supabase/seed_dishes.sql`
3. Cliquez sur **"Raw"**
4. **Sélectionnez tout** et **copiez**

---

## 📋 Étape 4 : Exécuter le Script

1. Retournez dans **Supabase SQL Editor**
2. **Cliquez dans la zone de texte** (zone blanche au centre)
3. **Collez** le code SQL (Cmd+V ou Ctrl+V)
   - Vous devez voir ~300 lignes de code
4. En bas à **droite**, cliquez sur **"Run"** (bouton vert)
5. ⏳ **Attendez 5-10 secondes**

---

## 📋 Étape 5 : Vérifier le Résultat

### 5.1 Message de Succès

Vous devriez voir un message comme :

```
✅ 15 plats importés avec succès !
📊 Répartition:
   - 2 Entrées
   - 5 Plats principaux
   - 2 Salades
   - 3 Burgers
   - 2 Desserts
   - 2 Boissons
🌟 8 plats populaires marqués
```

Si vous voyez ce message → **Parfait ! ✅**

### 5.2 Vérifier dans Table Editor

1. Dans le menu de **gauche**, cliquez sur **"Table Editor"**
2. Cliquez sur la table **"dishes"**
3. Vous devez voir **15 lignes** (les 15 plats)

**Quelques exemples que vous devriez voir** :
- Poke Bowl Saumon (12.90€)
- Buddha Bowl (11.50€)
- Classic Cheeseburger (11.90€)
- Tiramisu Maison (5.50€)
- Smoothie Fruits Rouges (5.20€)

---

## 📋 Étape 6 : Tester dans l'Application (Optionnel)

### 6.1 Modifier le Code pour Utiliser Supabase

**Note** : Pour l'instant, l'app utilise encore les données mockées. Pour utiliser les données Supabase, vous devrez modifier le code (à faire plus tard).

Pour tester que les données sont bien là :

1. Dans Supabase, allez dans **SQL Editor**
2. Exécutez cette requête simple :

```sql
SELECT name, price, is_popular
FROM dishes
WHERE is_popular = true
ORDER BY price DESC;
```

3. Vous devriez voir **8 plats populaires** triés par prix

---

## 🔄 Réexécuter le Script (Si Besoin)

### Cas 1 : Vous voulez ajouter les plats (sans supprimer les anciens)

Exécutez le script normalement. **Attention** : Cela créera des doublons si vous l'exécutez 2 fois.

### Cas 2 : Vous voulez repartir de zéro

Avant d'exécuter le script, ajoutez cette ligne au début du script :

```sql
-- Supprimer tous les plats existants
DELETE FROM dishes;
```

Puis exécutez le script complet.

---

## 📊 Résumé : Qu'avez-vous Importé ?

### 15 Plats Répartis par Catégorie

| Catégorie | Nombre | Plats Populaires |
|---|---|---|
| Entrées | 2 | 0 |
| Plats principaux | 5 | 4 |
| Salades | 2 | 1 |
| Burgers | 3 | 2 |
| Desserts | 2 | 1 |
| Boissons | 2 | 0 |
| **TOTAL** | **15** | **8** |

### Informations Stockées

Pour chaque plat, vous avez :
- ✅ Nom et description (courte + longue)
- ✅ Prix en euros
- ✅ URL de l'image (Unsplash)
- ✅ Catégorie
- ✅ Stock disponible
- ✅ Disponibilité (is_available)
- ✅ Popularité (is_popular)
- ✅ Allergènes (liste)
- ✅ Informations nutritionnelles (calories, protéines, glucides, lipides)
- ✅ Badges végétarien/vegan

---

## 🚀 Prochaines Étapes

Maintenant que vos plats sont dans Supabase, vous pouvez :

### 1. Modifier des Plats

1. Allez dans **Table Editor** > **dishes**
2. Cliquez sur une ligne
3. Modifiez les valeurs (prix, stock, description, etc.)
4. Cliquez sur **"Save"**

### 2. Ajouter de Nouveaux Plats

**Option A - Via Table Editor** (Interface visuelle) :
1. **Table Editor** > **dishes**
2. Cliquez sur **"Insert"** > **"Insert row"**
3. Remplissez le formulaire
4. **"Save"**

**Option B - Via SQL** (Plus rapide) :
```sql
INSERT INTO dishes (
  name, slug, description, long_description, price, image_url,
  category_id, stock, is_available, is_popular
) VALUES (
  'Nouveau Plat',
  'nouveau-plat',
  'Description courte',
  'Description longue détaillée...',
  12.90,
  'https://images.unsplash.com/photo-xxx',
  (SELECT id FROM categories WHERE slug = 'plats'),
  20,
  true,
  false
);
```

### 3. Migrer le Code pour Utiliser Supabase

Plus tard, vous devrez modifier `frontend/src/data/mockData.js` pour fetcher les données depuis Supabase au lieu d'utiliser le tableau JavaScript.

**Exemple de code à implémenter** :
```javascript
// Au lieu de :
import { allDishes } from './data/mockData'

// Utiliser :
const { data: allDishes } = await supabase
  .from('dishes')
  .select('*')
  .eq('is_available', true)
```

---

## 🐛 Problèmes Courants

### ❌ Erreur : "relation categories does not exist"

**Cause** : Le schéma SQL principal n'a pas été exécuté

**Solution** :
1. Retournez à l'**Étape 3** du guide `SUPABASE_GUIDE_DEBUTANT.md`
2. Exécutez d'abord `supabase/schema.sql`
3. Puis réessayez ce script

### ❌ Erreur : "duplicate key value"

**Cause** : Les plats ont déjà été importés

**Solution** :
- Si vous voulez les garder : **C'est bon, ignorez l'erreur**
- Si vous voulez recommencer :
  ```sql
  DELETE FROM dishes;
  ```
  Puis réexécutez le script

### ❌ Les plats apparaissent mais sans images

**Cause** : Les URLs Unsplash peuvent expirer

**Solution** :
1. Allez sur https://unsplash.com
2. Cherchez une image de plat
3. Copiez l'URL avec `?w=500&h=400&fit=crop`
4. Modifiez le plat dans Table Editor

---

## ✅ Checklist Finale

Avant de continuer, assurez-vous que :

- [ ] Le script a bien exécuté sans erreur
- [ ] Vous voyez **15 plats** dans Table Editor > dishes
- [ ] Vous voyez **6 catégories** dans Table Editor > categories
- [ ] Les prix sont corrects (ex: Poke Bowl = 12.90€)
- [ ] Les plats populaires sont marqués (`is_popular = true`)

**Si vous avez coché toutes les cases → Bravo ! 🎉**

---

## 📚 Ressources

- 📖 [Documentation Supabase SQL](https://supabase.com/docs/guides/database)
- 📖 [Guide principal Supabase](../SUPABASE_GUIDE_DEBUTANT.md)
- 📖 [Schéma complet](./schema.sql)

---

**Migration terminée avec succès ! 🎉**

Vous avez maintenant 15 plats dans votre base de données Supabase.
