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
  Alert,
  AlertIcon,
  Spinner,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps
} from '@chakra-ui/react'
import { FiPackage, FiHome, FiClock, FiMapPin, FiCheckCircle, FiTruck } from 'react-icons/fi'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrderByNumber } from '../hooks/useOrders'

const getOrderStatusSteps = (status) => {
  const allSteps = [
    { title: 'Commande reçue', icon: FiCheckCircle, status: 'pending' },
    { title: 'En préparation', icon: FiClock, status: 'preparing' },
    { title: 'En livraison', icon: FiTruck, status: 'delivering' },
    { title: 'Livrée', icon: FiPackage, status: 'delivered' }
  ]

  const statusIndex = allSteps.findIndex(step => step.status === status)
  return { steps: allSteps, activeStep: statusIndex >= 0 ? statusIndex : 0 }
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    preparing: 'blue',
    delivering: 'purple',
    delivered: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Commande reçue',
    preparing: 'En préparation',
    delivering: 'En livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return labels[status] || status
}

export default function OrderTrackingPage() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Load order from Supabase
  const { order, loading, error } = useOrderByNumber(orderNumber)
  const { steps, activeStep } = order ? getOrderStatusSteps(order.status) : { steps: [], activeStep: 0 }

  // Auto-refresh every 30 seconds to check for status updates
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') {
      return
    }

    const interval = setInterval(() => {
      // Force refresh by reloading the hook
      window.location.reload()
    }, 30000)

    return () => clearInterval(interval)
  }, [order])

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
                {error || 'Nous n\'avons pas trouvé cette commande.'}
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

  const isDelivered = order.status === 'delivered'
  const isCancelled = order.status === 'cancelled'

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box bg="white" p={8} rounded="2xl" shadow="lg">
            <VStack spacing={4} align="center">
              <Icon
                as={isDelivered ? FiCheckCircle : isCancelled ? FiPackage : FiTruck}
                boxSize={16}
                color={`${getStatusColor(order.status)}.500`}
              />
              <VStack spacing={2} align="center">
                <Badge
                  fontSize="lg"
                  px={4}
                  py={2}
                  colorScheme={getStatusColor(order.status)}
                  rounded="full"
                >
                  {getStatusLabel(order.status)}
                </Badge>
                <Text fontSize="sm" color="gray.600">
                  Commande N° {order.order_number}
                </Text>
              </VStack>

              {!isCancelled && (
                <Text fontSize="md" color="gray.700" textAlign="center">
                  {isDelivered
                    ? '🎉 Votre commande a été livrée avec succès !'
                    : order.status === 'delivering'
                    ? '🚴 Votre commande est en route !'
                    : order.status === 'preparing'
                    ? '👨‍🍳 Nos chefs préparent votre commande'
                    : '✅ Votre commande a été reçue'}
                </Text>
              )}

              {isCancelled && (
                <Alert status="error" variant="left-accent" mt={4}>
                  <AlertIcon />
                  Cette commande a été annulée.
                </Alert>
              )}
            </VStack>
          </Box>

          {/* Order Progress Timeline */}
          {!isCancelled && (
            <Box bg="white" p={8} rounded="xl" shadow="md">
              <Heading size="md" mb={6}>
                Suivi de votre commande
              </Heading>
              <Stepper index={activeStep} colorScheme={getStatusColor(order.status)} size="lg">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<Icon as={step.icon} />}
                        incomplete={<StepNumber />}
                        active={<Icon as={step.icon} />}
                      />
                    </StepIndicator>

                    <Box flexShrink="0">
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>
                        {index <= activeStep ? '✓ Complété' : 'En attente'}
                      </StepDescription>
                    </Box>

                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {/* Delivery Information */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Delivery Address */}
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

            {/* Delivery Time */}
            <Box bg="white" p={6} rounded="lg" shadow="sm">
              <HStack spacing={3} mb={4}>
                <Icon as={FiClock} boxSize={6} color="blue.500" />
                <Text fontWeight="bold" fontSize="lg">Livraison prévue</Text>
              </HStack>
              <VStack align="start" spacing={1} pl={9}>
                <HStack>
                  <Text fontWeight="bold" fontSize="xl" color="brand.600">
                    {order.delivery_time}
                  </Text>
                </HStack>
                <Text color="gray.700">{formattedDate}</Text>
                {!isDelivered && !isCancelled && (
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    📦 Livraison entre 7h et 9h le matin
                  </Text>
                )}
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Order Items */}
          <Box bg="white" p={6} rounded="lg" shadow="sm">
            <HStack spacing={3} mb={4}>
              <Icon as={FiPackage} boxSize={6} color="orange.500" />
              <Text fontWeight="bold" fontSize="lg">Articles commandés</Text>
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
              leftIcon={<FiPackage />}
              colorScheme="brand"
            >
              Toutes mes commandes
            </Button>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
