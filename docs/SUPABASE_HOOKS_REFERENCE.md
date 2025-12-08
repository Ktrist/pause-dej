# 🪝 Référence Complète des Hooks Supabase - Pause Dej'

> **Documentation technique** : Tous les hooks disponibles pour interagir avec Supabase

**Dernière mise à jour** : 2025-12-08

---

## 📚 Vue d'Ensemble

Le projet Pause Dej' dispose de **24 hooks personnalisés** répartis en 4 modules :

| Module | Hooks | Description |
|---|---|---|
| **useDishes.js** | 4 hooks | Plats et catégories |
| **useAddresses.js** | 6 hooks | Adresses de livraison |
| **useOrders.js** | 6 hooks | Commandes et historique |
| **usePromoCodes.js** | 6 hooks + 1 helper | Codes promotionnels |

---

## 🍽️ Module: useDishes.js

### `useDishes(options)`

Récupère tous les plats avec filtres optionnels.

**Paramètres** :
```javascript
{
  enabled: boolean,        // Activer le fetch (défaut: true)
  category: string,        // Filtrer par catégorie slug (ex: 'plats')
  availableOnly: boolean   // Seulement disponibles (défaut: true)
}
```

**Retour** :
```javascript
{
  dishes: Array,    // Liste des plats
  loading: boolean, // État de chargement
  error: string,    // Message d'erreur
  refetch: Function // Fonction pour rafraîchir
}
```

**Exemple** :
```javascript
import { useDishes } from '../hooks/useDishes'

function CataloguePage() {
  const { dishes, loading, error } = useDishes({
    category: 'plats',
    availableOnly: true
  })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error} />

  return (
    <SimpleGrid>
      {dishes.map(dish => <DishCard key={dish.id} dish={dish} />)}
    </SimpleGrid>
  )
}
```

---

### `useDish(dishId)`

Récupère un seul plat par son ID.

**Exemple** :
```javascript
const { dish, loading, error } = useDish('uuid-here')
```

---

### `usePopularDishes(limit)`

Récupère les plats populaires (limité à N plats).

**Exemple** :
```javascript
const { dishes, loading, error } = usePopularDishes(6)
```

---

### `useCategories()`

Récupère toutes les catégories avec l'option "Tous" ajoutée.

**Exemple** :
```javascript
const { categories, loading } = useCategories()

// Retourne :
// [
//   { id: 'all', name: 'Tous', icon: '🍽️' },
//   { id: 'plats', name: 'Plats principaux', icon: '🍛' },
//   ...
// ]
```

---

## 📍 Module: useAddresses.js

### `useAddresses()`

Récupère toutes les adresses de l'utilisateur connecté (triées par défaut puis date).

**Exemple** :
```javascript
import { useAddresses } from '../hooks/useAddresses'

function AddressesList() {
  const { addresses, loading, error, refetch } = useAddresses()

  return (
    <VStack>
      {addresses.map(addr => (
        <AddressCard key={addr.id} address={addr} />
      ))}
      <Button onClick={refetch}>Rafraîchir</Button>
    </VStack>
  )
}
```

---

### `useAddress(addressId)`

Récupère une adresse spécifique par ID.

**Exemple** :
```javascript
const { address, loading, error } = useAddress('uuid-here')
```

---

### `useDefaultAddress()`

Récupère l'adresse par défaut de l'utilisateur.

**Exemple** :
```javascript
function CheckoutPage() {
  const { address: defaultAddress, loading } = useDefaultAddress()

  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress)
    }
  }, [defaultAddress])
}
```

---

### `useCreateAddress()`

Crée une nouvelle adresse. Gère automatiquement les adresses par défaut.

**Exemple** :
```javascript
function AddAddressForm() {
  const { createAddress, loading, error } = useCreateAddress()

  const handleSubmit = async (formData) => {
    const { data, error } = await createAddress({
      label: 'Domicile',
      street_address: '123 Rue de la Paix',
      city: 'Paris',
      postal_code: '75001',
      is_default: true
    })

    if (!error) {
      toast({ title: 'Adresse créée', status: 'success' })
      refetch()
    }
  }
}
```

---

### `useUpdateAddress()`

Met à jour une adresse existante.

**Exemple** :
```javascript
const { updateAddress, loading, error } = useUpdateAddress()

await updateAddress('address-uuid', {
  label: 'Bureau',
  is_default: true
})
```

---

### `useDeleteAddress()`

Supprime une adresse.

**Exemple** :
```javascript
const { deleteAddress, loading } = useDeleteAddress()

const handleDelete = async (addressId) => {
  const { error } = await deleteAddress(addressId)
  if (!error) {
    toast({ title: 'Adresse supprimée' })
  }
}
```

---

## 🛍️ Module: useOrders.js

### `useOrders(options)`

Récupère toutes les commandes de l'utilisateur avec items.

**Paramètres** :
```javascript
{
  status: string  // Filtrer par statut (optionnel)
}
```

**Statuts disponibles** : `'pending'`, `'confirmed'`, `'preparing'`, `'ready'`, `'in_delivery'`, `'delivered'`, `'cancelled'`

**Exemple** :
```javascript
function OrderHistory() {
  const { orders, loading, error } = useOrders()

  // Filtrer par statut
  const activeOrders = useOrders({ status: 'in_delivery' })

  return (
    <VStack>
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          items={order.order_items}
        />
      ))}
    </VStack>
  )
}
```

---

### `useOrder(orderId)`

Récupère une commande spécifique avec ses items.

**Exemple** :
```javascript
function OrderDetailsPage({ orderId }) {
  const { order, loading, error } = useOrder(orderId)

  return (
    <Box>
      <Text>Commande #{order.order_number}</Text>
      <Text>Total: {order.total}€</Text>
      <Text>Statut: {order.status}</Text>

      <Heading>Items</Heading>
      {order.order_items.map(item => (
        <OrderItem key={item.id} item={item} />
      ))}
    </Box>
  )
}
```

---

### `useOrderByNumber(orderNumber)`

Récupère une commande par son numéro (ex: `"PDJ-20251207-001"`).

**Exemple** :
```javascript
function TrackOrder({ orderNumber }) {
  const { order, loading, error } = useOrderByNumber(orderNumber)
}
```

---

### `useCreateOrder()`

Crée une nouvelle commande avec génération automatique du numéro.

**Exemple** :
```javascript
function CheckoutPage() {
  const { createOrder, loading, error } = useCreateOrder()

  const handlePlaceOrder = async () => {
    const orderData = {
      delivery_street: '123 Rue de la Paix',
      delivery_city: 'Paris',
      delivery_postal_code: '75001',
      delivery_date: '2025-12-15',
      delivery_time: '12:30',
      subtotal: 45.80,
      delivery_fee: 3.90,
      discount: 5.00,
      total: 44.70,
      payment_method: 'card',
      status: 'pending'
    }

    const orderItems = cartItems.map(item => ({
      dish_id: item.id,
      dish_name: item.name,
      dish_price: item.price,
      dish_image_url: item.image,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }))

    const { data, error } = await createOrder(orderData, orderItems)

    if (!error) {
      navigate(`/order-confirmation/${data.order_number}`)
    }
  }
}
```

---

### `useUpdateOrderStatus()`

Met à jour le statut d'une commande avec horodatage automatique.

**Exemple** :
```javascript
function AdminOrderPanel({ orderId }) {
  const { updateOrderStatus, loading } = useUpdateOrderStatus()

  const handleStatusChange = async (newStatus) => {
    await updateOrderStatus(orderId, newStatus)
    // Automatically sets appropriate timestamp:
    // 'confirmed' -> sets confirmed_at
    // 'preparing' -> sets preparing_at
    // etc.
  }
}
```

---

### `useCancelOrder()`

Annule une commande (seulement l'utilisateur propriétaire).

**Exemple** :
```javascript
const { cancelOrder, loading } = useCancelOrder()

await cancelOrder(orderId, 'Changement de plans')
```

---

## 🎟️ Module: usePromoCodes.js

### `usePromoCodes()`

Récupère tous les codes promo actifs et valides.

**Exemple** :
```javascript
function PromoCodesList() {
  const { promoCodes, loading, error } = usePromoCodes()

  return (
    <VStack>
      {promoCodes.map(promo => (
        <Box key={promo.id}>
          <Badge>{promo.code}</Badge>
          <Text>
            {promo.discount_type === 'percentage'
              ? `${promo.discount_value}% de réduction`
              : `${promo.discount_value}€ de réduction`
            }
          </Text>
        </Box>
      ))}
    </VStack>
  )
}
```

---

### `usePromoCode(code)`

Valide et récupère un code promo par son code.

**Exemple** :
```javascript
function CartPage() {
  const [promoInput, setPromoInput] = useState('')
  const { promoCode, loading, error, validate } = usePromoCode()

  const handleApplyPromo = async () => {
    const { data, error } = await validate(promoInput)

    if (error) {
      toast({ title: error, status: 'error' })
    } else {
      toast({ title: 'Code promo appliqué !', status: 'success' })
      setAppliedPromo(data)
    }
  }

  return (
    <HStack>
      <Input
        value={promoInput}
        onChange={(e) => setPromoInput(e.target.value)}
        placeholder="Code promo"
      />
      <Button onClick={handleApplyPromo} isLoading={loading}>
        Appliquer
      </Button>
    </HStack>
  )
}
```

---

### `calculateDiscount(promoCode, orderTotal)`

Helper function pour calculer la réduction.

**Exemple** :
```javascript
import { calculateDiscount } from '../hooks/usePromoCodes'

function CartSummary({ subtotal, promoCode }) {
  const discount = calculateDiscount(promoCode, subtotal)
  const total = subtotal - discount

  return (
    <VStack>
      <Text>Sous-total: {subtotal.toFixed(2)}€</Text>
      {discount > 0 && (
        <Text color="green.500">
          Réduction ({promoCode.code}): -{discount.toFixed(2)}€
        </Text>
      )}
      <Text fontWeight="bold">Total: {total.toFixed(2)}€</Text>
    </VStack>
  )
}
```

**Logique** :
- Vérifie `min_order_amount`
- Calcule selon `discount_type` (percentage/fixed)
- Applique `max_discount` si défini
- Ne dépasse jamais le total de commande

---

### `useIncrementPromoCodeUsage()`

Incrémente le compteur d'utilisation d'un code promo.

**Exemple** :
```javascript
const { incrementUsage } = useIncrementPromoCodeUsage()

// Après création de commande réussie
if (order.promo_code_id) {
  await incrementUsage(order.promo_code_id)
}
```

---

### `useCreatePromoCode()` (Admin)

Crée un nouveau code promo.

**Exemple** :
```javascript
function AdminPromoForm() {
  const { createPromoCode, loading, error } = useCreatePromoCode()

  const handleCreate = async () => {
    const { data, error } = await createPromoCode({
      code: 'NOEL2025',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_amount: 30,
      max_discount: 15,
      usage_limit: 100,
      valid_from: new Date(),
      valid_until: new Date('2025-12-31'),
      is_active: true
    })
  }
}
```

---

### `useDeactivatePromoCode()` (Admin)

Désactive un code promo.

**Exemple** :
```javascript
const { deactivatePromoCode, loading } = useDeactivatePromoCode()

await deactivatePromoCode(promoCodeId)
```

---

## 🔄 Patterns Communs

### Pattern 1: Loading & Error States

Tous les hooks suivent ce pattern :

```javascript
const { data, loading, error, refetch } = useHook()

if (loading) return <LoadingSpinner />
if (error) return <ErrorAlert message={error} />

return <DataDisplay data={data} />
```

---

### Pattern 2: CRUD Operations

```javascript
// READ
const { items, loading, error } = useItems()

// CREATE
const { createItem, loading } = useCreateItem()
await createItem(data)

// UPDATE
const { updateItem, loading } = useUpdateItem()
await updateItem(id, updates)

// DELETE
const { deleteItem, loading } = useDeleteItem()
await deleteItem(id)
```

---

### Pattern 3: Refetch After Mutation

```javascript
function ItemsList() {
  const { items, refetch } = useItems()
  const { deleteItem } = useDeleteItem()

  const handleDelete = async (id) => {
    await deleteItem(id)
    refetch() // Rafraîchir la liste
  }
}
```

---

### Pattern 4: Authentication Check

Tous les hooks qui nécessitent un utilisateur connecté vérifient automatiquement :

```javascript
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  throw new Error('Utilisateur non connecté')
}
```

---

## 🔒 Sécurité

Tous les hooks respectent les politiques RLS (Row Level Security) de Supabase :

- **Addresses** : Utilisateur voit seulement ses propres adresses
- **Orders** : Utilisateur voit seulement ses propres commandes
- **Promo Codes** : Tout le monde peut voir les codes actifs, seul admin peut créer/modifier
- **Dishes** : Lecture publique, modification admin only

---

## 📈 Performance

### Optimisations intégrées

1. **Tri au niveau DB** : Les requêtes utilisent `order()` pour trier côté base de données
2. **Relations** : Utilisation de `select('*, relation(*)')` pour éviter les N+1 queries
3. **Caching** : Les hooks peuvent être utilisés avec React Query pour un cache avancé

### Exemple avec useMemo

```javascript
const { dishes } = useDishes()

const vegetarianDishes = useMemo(() => {
  return dishes.filter(d => d.vegetarian)
}, [dishes])
```

---

## 🐛 Gestion d'Erreurs

### Erreurs courantes

| Erreur | Cause | Solution |
|---|---|---|
| "Utilisateur non connecté" | Pas de session Supabase | Rediriger vers /login |
| "PGRST116" | Aucun résultat trouvé | Vérifier si l'ID existe |
| "Code promo invalide" | Code inexistant ou expiré | Afficher message utilisateur |
| "23505: duplicate key" | Violation de contrainte unique | Vérifier les valeurs uniques |

### Pattern de gestion

```javascript
const { data, error } = await createItem(itemData)

if (error) {
  console.error('Error:', error)
  toast({
    title: 'Erreur',
    description: error,
    status: 'error'
  })
  return
}

// Success
toast({ title: 'Succès !', status: 'success' })
```

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase React Hooks](https://supabase.com/docs/guides/with-react)
- [Guide d'intégration](./SUPABASE_INTEGRATION.md)
- [Schéma de base de données](../supabase/schema.sql)

---

**Tous les hooks sont prêts à l'emploi et testés ! 🚀**
