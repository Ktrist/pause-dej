import { createContext, useContext } from 'react'
import { useDisclosure } from '@chakra-ui/react'

const CartDrawerContext = createContext()

export function useCartDrawer() {
  const context = useContext(CartDrawerContext)
  if (!context) {
    throw new Error('useCartDrawer must be used within CartDrawerProvider')
  }
  return context
}

export function CartDrawerProvider({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const value = {
    isCartDrawerOpen: isOpen,
    openCartDrawer: onOpen,
    closeCartDrawer: onClose
  }

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  )
}
