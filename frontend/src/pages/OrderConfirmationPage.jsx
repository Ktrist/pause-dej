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
  Alert,
  AlertIcon,
  Spinner
} from '@chakra-ui/react'
import { FiCheckCircle, FiHome, FiShoppingBag, FiClock, FiMapPin, FiTruck, FiAward } from 'react-icons/fi'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrderByNumber } from '../hooks/useOrders'
import { useLoyalty } from '../hooks/useLoyalty'

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Load order from Supabase
  const { order, loading, error } = useOrderByNumber(orderNumber)

  // Load loyalty data
  const { loyaltyData } = useLoyalty()

  // Calculate points to be earned
  const calculatePointsToEarn = () => {
    if (!user || !loyaltyData || !loyaltyData.tier || !order) return 0

    let multiplier = 1
    const tierName = loyaltyData.tier.name

    if (tierName === 'Platine') multiplier = 3
    else if (tierName === 'Or') multiplier = 2
    else if (tierName === 'Argent') multiplier = 1.5
    else multiplier = 1 // Bronze

    return Math.floor(order.total * multiplier)
  }

  const pointsToEarn = calculatePointsToEarn()

  // Loading state
  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color="gray.600">Chargement de votre commande...</Text>
        </VStack>
      </Box>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <Box minH="100vh" bg="gray.50" py={12}>
        <Container maxW="container.md">
          <Alert status="error" variant="left-accent" rounded="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Commande introuvable</Text>
              <Text fontSize="sm">
                {error || 'Nous n\'avons pas trouvé cette commande. Vérifiez le numéro ou consultez votre historique de commandes.'}
              </Text>
            </Box>
          </Alert>
          <HStack spacing={4} mt={6} justify="center">
            <Button as={RouterLink} to="/" variant="outline" colorScheme="gray">
              Retour à l'accueil
            </Button>
            <Button as={RouterLink} to="/compte" colorScheme="brand">
              Mes commandes
            </Button>
          </HStack>
        </Container>
      </Box>
    )
  }

  // Format delivery date
  const deliveryDate = new Date(order.delivery_date)
  const formattedDate = deliveryDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

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
              N° {order.order_number}
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
                <Text fontWeight="bold">{order.delivery_street}</Text>
                <Text color="gray.700">
                  {order.delivery_postal_code} {order.delivery_city}
                </Text>
                {order.delivery_additional_info && (
                  <Text fontSize="sm" color="gray.600">
                    {order.delivery_additional_info}
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
                    {order.delivery_time}
                  </Text>
                  <Badge colorScheme={order.status === 'delivered' ? 'green' : 'orange'}>
                    {order.status === 'pending' && 'En préparation'}
                    {order.status === 'preparing' && 'En cours'}
                    {order.status === 'delivering' && 'En livraison'}
                    {order.status === 'delivered' && 'Livré'}
                    {order.status === 'cancelled' && 'Annulé'}
                  </Badge>
                </HStack>
                <Text color="gray.700">{formattedDate}</Text>
                <VStack align="start" spacing={1} mt={2}>
                  <Text fontSize="sm" color="gray.600">
                    📦 Livraison entre 7h et 9h le matin
                  </Text>
                  <HStack spacing={1}>
                    <Badge colorScheme="purple" fontSize="2xs">Bientôt</Badge>
                    <Text fontSize="2xs" color="purple.700">
                      Créneaux de 30 min (7h-13h30)
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Order Items */}
          <Box bg="white" p={6} rounded="lg" shadow="sm">
            <HStack spacing={3} mb={4}>
              <Icon as={FiShoppingBag} boxSize={6} color="orange.500" />
              <Text fontWeight="bold" fontSize="lg">Votre commande</Text>
              <Badge ml="auto">
                {order.order_items?.length || 0} article{(order.order_items?.length || 0) > 1 ? 's' : ''}
              </Badge>
            </HStack>

            <VStack align="stretch" spacing={3} divider={<Divider />}>
              {order.order_items?.map((item) => (
                <HStack key={item.id} justify="space-between" py={2}>
                  <HStack spacing={3}>
                    <Box
                      w="50px"
                      h="50px"
                      bgImage={`url(${item.dish_image_url})`}
                      bgSize="cover"
                      bgPosition="center"
                      rounded="md"
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{item.dish_name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        Quantité: {item.quantity}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontWeight="bold">
                    {item.subtotal.toFixed(2)}€
                  </Text>
                </HStack>
              ))}
            </VStack>

            <Divider my={4} borderColor="gray.300" />

            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text color="gray.600">Sous-total</Text>
                <Text fontWeight="medium">{order.subtotal.toFixed(2)}€</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.600">Frais de livraison</Text>
                <Text fontWeight="medium">
                  {order.delivery_fee > 0 ? `${order.delivery_fee.toFixed(2)}€` : 'Gratuit'}
                </Text>
              </HStack>
              {order.discount > 0 && (
                <HStack justify="space-between">
                  <Text color="gray.600">Réduction</Text>
                  <Text fontWeight="medium" color="green.600">
                    -{order.discount.toFixed(2)}€
                  </Text>
                </HStack>
              )}
              <Divider />
              <HStack justify="space-between" pt={2}>
                <Text fontSize="xl" fontWeight="bold">Total</Text>
                <Text fontSize="xl" fontWeight="bold" color="brand.600">
                  {order.total.toFixed(2)}€
                </Text>
              </HStack>
            </VStack>

            {/* Loyalty Points Indicator - M10 */}
            {user && pointsToEarn > 0 && (
              <Box bg="brand.50" p={4} rounded="md" border="1px solid" borderColor="brand.200" mt={4}>
                <HStack spacing={3} justify="center">
                  <Icon as={FiAward} boxSize={5} color="brand.600" />
                  <VStack spacing={0} align="start">
                    <Text fontSize="md" color="brand.800" fontWeight="600">
                      {order.status === 'delivered'
                        ? `+${pointsToEarn} points gagnés !`
                        : `+${pointsToEarn} points à gagner`
                      }
                    </Text>
                    {loyaltyData?.tier && order.status !== 'delivered' && (
                      <Text fontSize="xs" color="brand.700">
                        Points crédités après la livraison (Niveau {loyaltyData.tier.name})
                      </Text>
                    )}
                    {order.status === 'delivered' && (
                      <Text fontSize="xs" color="brand.700">
                        Points ajoutés à votre compte fidélité
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            )}
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
          <VStack spacing={4}>
            <Button
              as={RouterLink}
              to={`/track/${order.order_number}`}
              size="lg"
              width="100%"
              leftIcon={<FiTruck />}
              colorScheme="brand"
            >
              Suivre ma commande
            </Button>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} width="100%">
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
                to="/compte?tab=orders"
                size="lg"
                leftIcon={<FiShoppingBag />}
                variant="outline"
                colorScheme="gray"
              >
                Voir mes commandes
              </Button>
            </SimpleGrid>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
