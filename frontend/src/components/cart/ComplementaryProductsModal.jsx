import { useEffect, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  SimpleGrid,
  Box,
  useToast,
  Heading
} from '@chakra-ui/react'
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useDishes } from '../../hooks/useDishes'

export default function ComplementaryProductsModal({ isOpen, onClose, onProceedToCheckout }) {
  const { cart, addToCart } = useCart()
  const { dishes: allDishes } = useDishes()
  const [suggestions, setSuggestions] = useState([])
  const [addedProducts, setAddedProducts] = useState(new Set())
  const toast = useToast()

  // Analyze cart and get complementary products
  useEffect(() => {
    if (isOpen && allDishes.length > 0) {
      console.log('🍰 Analyzing cart for dessert suggestions...')
      console.log('Cart items:', cart)
      console.log('All dishes:', allDishes.length)

      // Get dessert IDs already in cart to avoid suggesting them
      const cartDessertIds = cart
        .filter(item => {
          const category = (item.category || item.categoryLabel || '').toLowerCase()
          return category.includes('dessert')
        })
        .map(item => item.id)

      console.log('Desserts already in cart:', cartDessertIds)

      // Always suggest desserts (even if they already have some)
      const desserts = allDishes
        .filter(dish => {
          const category = (dish.category || dish.categoryLabel || '').toLowerCase()
          const isDessert = category.includes('dessert')
          // Don't suggest desserts that are already in the cart
          const notInCart = !cartDessertIds.includes(dish.id)
          return isDessert && notInCart
        })
        .slice(0, 4) // Max 4 dessert suggestions

      console.log('Found desserts to suggest:', desserts.length)
      setSuggestions(desserts)
    }
  }, [isOpen, cart, allDishes])

  const handleAddProduct = (product) => {
    addToCart(product)
    setAddedProducts(prev => new Set([...prev, product.id]))
    toast({
      title: 'Ajouté au panier',
      description: `${product.name} a été ajouté`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top'
    })
  }

  const handleProceed = () => {
    onClose()
    onProceedToCheckout()
  }

  const handleSkip = () => {
    onClose()
    onProceedToCheckout()
  }

  // Don't render if no suggestions (instead of auto-closing)
  if (suggestions.length === 0) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent mx={4}>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Heading size="md" color="gray.800">
              Et pourquoi pas un dessert ? 🍰
            </Heading>
            <Text fontSize="sm" fontWeight="normal" color="gray.600">
              Terminez votre repas en beauté
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {suggestions.map((product) => {
              const isAdded = addedProducts.has(product.id)

              return (
                <Box
                  key={product.id}
                  bg="white"
                  borderWidth="1px"
                  borderColor={isAdded ? 'green.300' : 'gray.200'}
                  borderRadius="lg"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ shadow: 'md', borderColor: 'brand.300' }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    h="120px"
                    w="full"
                    objectFit="cover"
                    fallbackSrc="https://via.placeholder.com/300x120"
                  />
                  <Box p={3}>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="600" fontSize="sm" noOfLines={1}>
                          {product.name}
                        </Text>
                        <Badge colorScheme="green" fontSize="xs">
                          {product.categoryLabel}
                        </Badge>
                      </HStack>

                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {product.description}
                      </Text>

                      <HStack justify="space-between" pt={1}>
                        <Text fontWeight="bold" fontSize="lg" color="brand.500">
                          {product.price.toFixed(2)}€
                        </Text>
                        <Button
                          size="sm"
                          colorScheme={isAdded ? 'green' : 'brand'}
                          onClick={() => handleAddProduct(product)}
                          isDisabled={isAdded}
                          leftIcon={isAdded ? null : <FiShoppingCart />}
                        >
                          {isAdded ? '✓ Ajouté' : 'Ajouter'}
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              )
            })}
          </SimpleGrid>

          {addedProducts.size > 0 && (
            <Box mt={4} p={3} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
              <HStack>
                <Text fontSize="sm" color="green.700" fontWeight="600">
                  ✓ {addedProducts.size} produit{addedProducts.size > 1 ? 's' : ''} ajouté{addedProducts.size > 1 ? 's' : ''} à votre panier
                </Text>
              </HStack>
            </Box>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="gray.100">
          <HStack spacing={3} w="full">
            <Button
              variant="ghost"
              onClick={handleSkip}
              flex={1}
            >
              Non merci
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleProceed}
              rightIcon={<FiArrowRight />}
              flex={1}
            >
              Valider ma commande
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
