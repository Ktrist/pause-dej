import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  // Migrate old cart items to new structure
  const migrateCartItem = (item) => {
    // Skip null or undefined items
    if (!item || typeof item !== 'object') {
      return null
    }

    // Ensure all required properties exist
    return {
      id: item.id,
      name: item.name || 'Produit',
      categoryLabel: item.categoryLabel || item.category || 'Plat',
      image: item.image || '/placeholder-dish.jpg',
      description: item.description || '',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1
    }
  }

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pause-dej-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Ensure parsedCart is an array
        if (!Array.isArray(parsedCart)) {
          console.warn('Invalid cart data in localStorage, clearing...')
          localStorage.removeItem('pause-dej-cart')
          return
        }
        // Migrate old cart items and filter out null/invalid items
        const migratedCart = parsedCart
          .map(migrateCartItem)
          .filter(item => item !== null && item.id)
        setCart(migratedCart)
      } catch (error) {
        console.error('Error loading cart:', error)
        // Clear corrupted cart
        localStorage.removeItem('pause-dej-cart')
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pause-dej-cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (dish, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === dish.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...prevCart, { ...dish, quantity }]
    })
  }

  const removeFromCart = (dishId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== dishId))
  }

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === dishId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  // Calculate cart count for badge (reactive)
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0)

  // DEBUG: Log cart state
  console.log('[CartContext] Cart updated:', {
    cartLength: cart.length,
    cartItemsCount,
    cart: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity }))
  })

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    cartItemsCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
