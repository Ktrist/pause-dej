import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  SimpleGrid,
  useToast
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import CartItemCard from '../../components/cart/CartItemCard'
import CartSummary from '../../components/cart/CartSummary'

export default function CartPage() {
  const { cart, getCartTotal } = useCart()
  const navigate = useNavigate()
  const toast = useToast()

  const subtotal = getCartTotal()

  const handleCheckout = () => {
    // TODO: Navigate to checkout page when implemented
    toast({
      title: 'Fonctionnalité à venir',
      description: 'Le processus de paiement sera bientôt disponible !',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top'
    })
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)" py={16}>
        <Container maxW="container.md">
          <VStack spacing={8} py={12}>
            <Box fontSize="6xl">🛒</Box>
            <VStack spacing={4}>
              <Heading size="lg" color="gray.700" textAlign="center">
                Votre panier est vide
              </Heading>
              <Text color="gray.600" textAlign="center">
                Découvrez nos délicieux plats et commencez votre commande
              </Text>
            </VStack>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/catalogue"
                colorScheme="brand"
                size="lg"
                leftIcon={<FiShoppingCart />}
              >
                Voir le catalogue
              </Button>
              <Button
                as={RouterLink}
                to="/"
                variant="outline"
                colorScheme="brand"
                size="lg"
              >
                Retour à l'accueil
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading as="h1" size="xl" color="gray.800">
                Mon Panier
              </Heading>
              <Text color="gray.600">
                {cart.length} article{cart.length > 1 ? 's' : ''} dans votre panier
              </Text>
            </VStack>
            <Button
              as={RouterLink}
              to="/catalogue"
              variant="outline"
              colorScheme="brand"
              leftIcon={<FiArrowLeft />}
              display={{ base: 'none', md: 'flex' }}
            >
              Continuer mes achats
            </Button>
          </HStack>

          {/* Cart Content */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
            {/* Cart Items */}
            <Box gridColumn={{ base: '1', lg: '1 / 3' }}>
              <VStack spacing={4} align="stretch">
                {cart.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </VStack>

              {/* Continue Shopping (Mobile) */}
              <Button
                as={RouterLink}
                to="/catalogue"
                variant="outline"
                colorScheme="brand"
                size="lg"
                w="full"
                mt={4}
                leftIcon={<FiArrowLeft />}
                display={{ base: 'flex', md: 'none' }}
              >
                Continuer mes achats
              </Button>
            </Box>

            {/* Summary */}
            <Box>
              <CartSummary subtotal={subtotal} onCheckout={handleCheckout} />
            </Box>
          </SimpleGrid>

          {/* Trust Indicators */}
          <Box bg="blue.50" p={6} borderRadius="lg" mt={4}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <HStack spacing={3}>
                <Text fontSize="2xl">⚡</Text>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600" fontSize="sm">
                    Livraison rapide
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    En 30 minutes chrono
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={3}>
                <Text fontSize="2xl">🌱</Text>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600" fontSize="sm">
                    Produits frais
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    Cuisinés à la commande
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={3}>
                <Text fontSize="2xl">🔒</Text>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600" fontSize="sm">
                    Paiement sécurisé
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    Protection SSL & Stripe
                  </Text>
                </VStack>
              </HStack>
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
