import { useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Divider,
  Badge,
  SimpleGrid,
  useToast
} from '@chakra-ui/react'
import { FiCheckCircle, FiHome, FiShoppingBag, FiClock, FiMapPin } from 'react-icons/fi'
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const order = location.state?.order

  useEffect(() => {
    // Redirect if no order data
    if (!order) {
      toast({
        title: 'Aucune commande',
        description: 'Vous n\'avez pas passé de commande',
        status: 'warning',
        duration: 3000
      })
      navigate('/')
    }
  }, [order, navigate, toast])

  if (!order) {
    return null
  }

  // Generate order number (will come from backend in production)
  const orderNumber = `PDJ-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Success Header */}
          <Box
            bg="white"
            p={8}
            rounded="2xl"
            shadow="lg"
            textAlign="center"
            border="2px solid"
            borderColor="green.200"
          >
            <Icon
              as={FiCheckCircle}
              boxSize={20}
              color="green.500"
              mb={4}
            />
            <Heading size="xl" mb={2} color="green.700">
              Commande confirmée !
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={4}>
              Merci pour votre confiance, {user?.user_metadata?.full_name || 'cher client'} 🎉
            </Text>

            <Badge
              fontSize="lg"
              px={4}
              py={2}
              colorScheme="brand"
              rounded="full"
            >
              N° {orderNumber}
            </Badge>
          </Box>

          {/* Order Details */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Delivery Info */}
            <Box bg="white" p={6} rounded="lg" shadow="sm">
              <HStack spacing={3} mb={4}>
                <Icon as={FiMapPin} boxSize={6} color="brand.500" />
                <Text fontWeight="bold" fontSize="lg">Adresse de livraison</Text>
              </HStack>
              <VStack align="start" spacing={1} pl={9}>
                <Text fontWeight="bold">{order.address.label}</Text>
                <Text color="gray.700">{order.address.street_address}</Text>
                <Text color="gray.700">
                  {order.address.postal_code} {order.address.city}
                </Text>
                {order.address.additional_info && (
                  <Text fontSize="sm" color="gray.600">
                    {order.address.additional_info}
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Time Slot */}
            <Box bg="white" p={6} rounded="lg" shadow="sm">
              <HStack spacing={3} mb={4}>
                <Icon as={FiClock} boxSize={6} color="blue.500" />
                <Text fontWeight="bold" fontSize="lg">Créneau de livraison</Text>
              </HStack>
              <VStack align="start" spacing={1} pl={9}>
                <HStack>
                  <Text fontWeight="bold" fontSize="xl" color="brand.600">
                    {order.timeSlot.time}
                  </Text>
                  <Badge colorScheme="green">Confirmé</Badge>
                </HStack>
                <Text color="gray.700">
                  {order.timeSlot.date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  ⚡ Livraison express en ~30 minutes
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Order Items */}
          <Box bg="white" p={6} rounded="lg" shadow="sm">
            <HStack spacing={3} mb={4}>
              <Icon as={FiShoppingBag} boxSize={6} color="orange.500" />
              <Text fontWeight="bold" fontSize="lg">Votre commande</Text>
              <Badge ml="auto">{order.items.length} article{order.items.length > 1 ? 's' : ''}</Badge>
            </HStack>

            <VStack align="stretch" spacing={3} divider={<Divider />}>
              {order.items.map((item) => (
                <HStack key={item.id} justify="space-between" py={2}>
                  <HStack spacing={3}>
                    <Box
                      w="50px"
                      h="50px"
                      bgImage={`url(${item.image})`}
                      bgSize="cover"
                      bgPosition="center"
                      rounded="md"
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{item.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        Quantité: {item.quantity}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontWeight="bold">
                    {(item.price * item.quantity).toFixed(2)}€
                  </Text>
                </HStack>
              ))}
            </VStack>

            <Divider my={4} borderColor="gray.300" />

            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text color="gray.600">Sous-total</Text>
                <Text fontWeight="medium">
                  {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}€
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.600">Frais de livraison</Text>
                <Text fontWeight="medium">Gratuit</Text>
              </HStack>
              <Divider />
              <HStack justify="space-between" pt={2}>
                <Text fontSize="xl" fontWeight="bold">Total</Text>
                <Text fontSize="xl" fontWeight="bold" color="brand.600">
                  {order.total.toFixed(2)}€
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Next Steps */}
          <Box bg="blue.50" p={6} rounded="lg" border="1px solid" borderColor="blue.200">
            <Text fontWeight="bold" mb={3} color="blue.900">
              📬 Et maintenant ?
            </Text>
            <VStack align="start" spacing={2} fontSize="sm" color="blue.800">
              <Text>✅ Vous allez recevoir un email de confirmation</Text>
              <Text>👨‍🍳 Nos chefs préparent votre commande avec soin</Text>
              <Text>🚴 Notre livreur partira bientôt</Text>
              <Text>🔔 Vous recevrez une notification à chaque étape</Text>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <Button
              as={RouterLink}
              to="/"
              size="lg"
              leftIcon={<FiHome />}
              variant="outline"
              colorScheme="gray"
            >
              Retour à l'accueil
            </Button>
            <Button
              as={RouterLink}
              to="/compte"
              size="lg"
              leftIcon={<FiShoppingBag />}
              colorScheme="brand"
            >
              Voir mes commandes
            </Button>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
