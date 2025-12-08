# 🔌 Guide d'Intégration Supabase - Données Réelles

> **Objectif** : Remplacer les données mockées par les vraies données Supabase

**Prérequis** :
- ✅ Supabase configuré ([SUPABASE_GUIDE_DEBUTANT.md](../SUPABASE_GUIDE_DEBUTANT.md))
- ✅ Plats importés ([supabase/MIGRATION_GUIDE.md](../supabase/MIGRATION_GUIDE.md))
- ✅ Fichier `.env` configuré

---

## 🎯 Vue d'Ensemble

Actuellement, l'application utilise des **données mockées** stockées dans `frontend/src/data/mockData.js`.

Ce guide vous montre comment **utiliser les vraies données Supabase** à la place.

---

## 🪝 Hooks Disponibles

J'ai créé **4 hooks personnalisés** dans `frontend/src/hooks/useDishes.js` :

### 1. `useDishes()` - Tous les plats

```javascript
import { useDishes } from '../hooks/useDishes'

function CataloguePage() {
  const { dishes, loading, error } = useDishes()

  if (loading) return <LoadingSpinner />
  if (error) return <Text>Erreur : {error}</Text>

  return (
    <div>
      {dishes.map(dish => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </div>
  )
}
```

**Options** :
- `enabled` : Activer/désactiver le fetch (default: `true`)
- `category` : Filtrer par catégorie (ex: `'plats'`)
- `availableOnly` : Seulement les plats disponibles (default: `true`)

**Exemples** :
```javascript
// Tous les plats
const { dishes } = useDishes()

// Plats d'une catégorie
const { dishes } = useDishes({ category: 'plats' })

// Tous les plats (même indisponibles)
const { dishes } = useDishes({ availableOnly: false })
```

---

### 2. `useDish(id)` - Un seul plat

```javascript
import { useDish } from '../hooks/useDishes'

function DishDetailModal({ dishId }) {
  const { dish, loading, error } = useDish(dishId)

  if (loading) return <Spinner />
  if (error) return <Text>Erreur</Text>

  return (
    <Box>
      <Heading>{dish.name}</Heading>
      <Text>{dish.longDescription}</Text>
      <Text>{dish.price}€</Text>
    </Box>
  )
}
```

---

### 3. `usePopularDishes(limit)` - Plats populaires

```javascript
import { usePopularDishes } from '../hooks/useDishes'

function PopularDishes() {
  const { dishes, loading, error } = usePopularDishes(6)

  if (loading) return <LoadingSpinner />

  return (
    <SimpleGrid columns={3}>
      {dishes.map(dish => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </SimpleGrid>
  )
}
```

---

### 4. `useCategories()` - Catégories

```javascript
import { useCategories } from '../hooks/useDishes'

function CategoryFilter() {
  const { categories, loading } = useCategories()

  if (loading) return <Spinner />

  return (
    <HStack>
      {categories.map(cat => (
        <Button key={cat.id}>{cat.icon} {cat.name}</Button>
      ))}
    </HStack>
  )
}
```

---

## 📝 Format des Données

Les hooks transforment automatiquement les données Supabase pour correspondre au format des données mockées.

**Format retourné** :
```javascript
{
  id: 1,
  name: "Poke Bowl Saumon",
  description: "Riz sushi, saumon frais, avocat...",
  longDescription: "Un poke bowl généreux...",
  price: 12.90,
  image: "https://images.unsplash.com/...",
  category: "plats",
  categoryLabel: "Plats principaux",
  stock: 15,
  isPopular: true,
  allergens: ["Poisson", "Soja", "Sésame"],
  nutritionInfo: {
    calories: 520,
    protein: 28,
    carbs: 54,
    fat: 18
  },
  vegetarian: false,
  vegan: false
}
```

**Avantage** : Aucun changement dans vos composants ! Le format est identique aux données mockées.

---

## 🔄 Migration Étape par Étape

### Étape 1 : HomePage - Plats Populaires

**Fichier** : `frontend/src/components/home/PopularDishes.jsx`

**Avant** (avec données mockées) :
```javascript
import { popularDishes } from '../../data/mockData'

export default function PopularDishes() {
  return (
    <SimpleGrid columns={3}>
      {popularDishes.map(dish => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </SimpleGrid>
  )
}
```

**Après** (avec Supabase) :
```javascript
import { usePopularDishes } from '../../hooks/useDishes'
import LoadingSpinner from '../common/LoadingSpinner'

export default function PopularDishes() {
  const { dishes, loading, error } = usePopularDishes(6)

  if (loading) return <LoadingSpinner />
  if (error) return <Text color="red.500">Erreur de chargement</Text>

  return (
    <SimpleGrid columns={3}>
      {dishes.map(dish => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </SimpleGrid>
  )
}
```

**Changements** :
1. ✅ Remplacer l'import de `mockData` par `useDishes`
2. ✅ Utiliser le hook `usePopularDishes(6)`
3. ✅ Ajouter la gestion du loading
4. ✅ Ajouter la gestion des erreurs
5. ✅ Remplacer `popularDishes` par `dishes` dans le map

---

### Étape 2 : CataloguePage - Tous les Plats

**Fichier** : `frontend/src/pages/catalogue/CataloguePage.jsx`

**Avant** :
```javascript
import { allDishes } from '../../data/mockData'

const [filteredDishes, setFilteredDishes] = useState(allDishes)
```

**Après** :
```javascript
import { useDishes } from '../../hooks/useDishes'

const { dishes: allDishes, loading } = useDishes()
const [filteredDishes, setFilteredDishes] = useState([])

useEffect(() => {
  setFilteredDishes(allDishes)
}, [allDishes])

if (loading) return <LoadingSpinner />
```

---

### Étape 3 : Filtres par Catégorie

**Avant** :
```javascript
import { categories } from '../../data/mockData'
```

**Après** :
```javascript
import { useCategories } from '../../hooks/useDishes'

const { categories, loading } = useCategories()
```

---

## 🎨 Composant LoadingSpinner

Vous avez déjà un composant `LoadingSpinner` :

**Utilisation** :
```javascript
import LoadingSpinner from '../components/common/LoadingSpinner'

if (loading) {
  return <LoadingSpinner message="Chargement des plats..." />
}
```

---

## ⚡ Optimisations

### 1. Désactiver le Fetch Conditionnel

```javascript
const [enabled, setEnabled] = useState(false)
const { dishes, loading } = useDishes({ enabled })

// Plus tard...
<Button onClick={() => setEnabled(true)}>
  Charger les plats
</Button>
```

### 2. Refetch Manuel

```javascript
const { dishes, loading, refetch } = useDishes()

<Button onClick={refetch}>
  ⟳ Actualiser
</Button>
```

### 3. Cache avec useMemo

```javascript
import { useMemo } from 'react'

const { dishes } = useDishes()

const vegetarianDishes = useMemo(() => {
  return dishes.filter(d => d.vegetarian)
}, [dishes])
```

---

## 🐛 Gestion des Erreurs

### Affichage d'Erreur Simple

```javascript
const { dishes, loading, error } = useDishes()

if (error) {
  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>Erreur de chargement</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
```

### Fallback vers Données Mockées

```javascript
import { useDishes } from '../hooks/useDishes'
import { allDishes as mockDishes } from '../data/mockData'

const { dishes, loading, error } = useDishes()

// Si erreur, utiliser les données mockées
const displayDishes = error ? mockDishes : dishes
```

---

## 📊 Exemple Complet : CataloguePage

```javascript
import { useState, useEffect, useMemo } from 'react'
import { Box, Container, SimpleGrid, VStack } from '@chakra-ui/react'
import { useDishes, useCategories } from '../hooks/useDishes'
import DishCard from '../components/catalogue/DishCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function CataloguePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data from Supabase
  const { dishes: allDishes, loading: loadingDishes } = useDishes()
  const { categories, loading: loadingCategories } = useCategories()

  // Filter dishes
  const filteredDishes = useMemo(() => {
    let result = allDishes

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(d => d.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery) {
      result = result.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return result
  }, [allDishes, selectedCategory, searchQuery])

  if (loadingDishes || loadingCategories) {
    return <LoadingSpinner message="Chargement du catalogue..." />
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Category Filter */}
        <HStack>
          {categories.map(cat => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'solid' : 'outline'}
            >
              {cat.icon} {cat.name}
            </Button>
          ))}
        </HStack>

        {/* Search */}
        <Input
          placeholder="Rechercher un plat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Dishes Grid */}
        <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={6}>
          {filteredDishes.map(dish => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  )
}
```

---

## ✅ Checklist de Migration

Pour chaque composant :

- [ ] Importer le hook approprié (`useDishes`, `usePopularDishes`, etc.)
- [ ] Remplacer l'import de `mockData`
- [ ] Destructurer `{ dishes, loading, error }` du hook
- [ ] Ajouter la gestion du `loading` (LoadingSpinner)
- [ ] Ajouter la gestion des `error` (Alert ou fallback)
- [ ] Tester le composant
- [ ] Vérifier que les données s'affichent correctement

---

## 🚀 Migration Recommandée (Ordre)

1. ✅ **HomePage - PopularDishes** (le plus simple)
2. ✅ **CataloguePage** (plus complexe avec filtres)
3. ✅ **DishDetailModal** (utilise `useDish(id)`)
4. ✅ **Category filters** (utilise `useCategories()`)

---

## 🔮 Prochaines Étapes

Après avoir migré vers les données Supabase, vous pourrez :

1. **Supprimer** `frontend/src/data/mockData.js` (optionnel, garder comme fallback)
2. **Admin dashboard** : Gérer les plats directement depuis l'app
3. **Real-time updates** : Les plats se mettent à jour automatiquement
4. **Pagination** : Gérer de grandes quantités de plats efficacement
5. **Caching** : Utiliser React Query pour un cache avancé

---

## 📚 Ressources

- 📖 [Documentation Supabase React](https://supabase.com/docs/guides/with-react)
- 📖 [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- 💬 [Discord Supabase](https://discord.supabase.com)

---

**Vous êtes maintenant prêt à utiliser les vraies données Supabase ! 🎉**

Les hooks sont prêts à l'emploi et le format des données est identique aux mocks.
