import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCreateOrder } from '../hooks/useOrders'
import { calculateDiscount } from '../hooks/usePromoCodes'
import AddressSelector from '../components/checkout/AddressSelector'
import TimeSlotSelector from '../components/checkout/TimeSlotSelector'
import OrderSummary from '../components/checkout/OrderSummary'
import LoadingSpinner from '../components/common/LoadingSpinner'

const steps = [
  { title: 'Livraison', description: 'Adresse' },
  { title: 'Créneau', description: 'Heure' },
  { title: 'Paiement', description: 'Finaliser' }
]

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { createOrder, loading: creatingOrder } = useCreateOrder()

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length
  })

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [appliedPromo, setAppliedPromo] = useState(location.state?.appliedPromo || null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour passer commande',
        status: 'warning',
        duration: 3000
      })
      navigate('/login')
    }
  }, [user, authLoading, navigate, toast])

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast({
        title: 'Panier vide',
        description: 'Ajoutez des plats avant de commander',
        status: 'info',
        duration: 3000
      })
      navigate('/catalogue')
    }
  }, [cart, navigate, toast])

  const handleNext = () => {
    if (activeStep === 0 && !selectedAddress) {
      toast({
        title: 'Adresse requise',
        description: 'Veuillez sélectionner une adresse de livraison',
        status: 'warning',
        duration: 3000
      })
      return
    }

    if (activeStep === 1 && !selectedTimeSlot) {
      toast({
        title: 'Créneau requis',
        description: 'Veuillez sélectionner un créneau de livraison',
        status: 'warning',
        duration: 3000
      })
      return
    }

    setActiveStep(activeStep + 1)
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const handlePlaceOrder = async () => {
    try {
      // Calculate totals
      const subtotal = getCartTotal()
      const deliveryFee = subtotal >= 30 ? 0 : 3.90
      const discount = appliedPromo ? calculateDiscount(appliedPromo, subtotal) : 0
      const total = subtotal + deliveryFee - discount

      // Prepare order data
      const orderData = {
        delivery_street: selectedAddress.street_address,
        delivery_city: selectedAddress.city,
        delivery_postal_code: selectedAddress.postal_code,
        delivery_additional_info: selectedAddress.additional_info || null,
        delivery_address_id: selectedAddress.id,
        delivery_date: selectedTimeSlot.date,
        delivery_time: selectedTimeSlot.time,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        discount: discount,
        promo_code_id: appliedPromo?.id || null,
        total: total,
        payment_method: 'card', // TODO: Add payment method selection
        status: 'pending'
      }

      // Prepare order items
      const orderItems = cart.map(item => ({
        dish_id: item.id,
        dish_name: item.name,
        dish_price: item.price,
        dish_image_url: item.image,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }))

      // Create order in Supabase
      const { data: order, error } = await createOrder(orderData, orderItems)

      if (error) {
        throw new Error(error)
      }

      // Clear cart
      clearCart()

      // Show success
      toast({
        title: 'Commande validée !',
        description: `Votre commande #${order.order_number} a été créée avec succès`,
        status: 'success',
        duration: 5000,
        isClosable: true
      })

      // Redirect to confirmation page
      navigate(`/confirmation/${order.order_number}`)
    } catch (error) {
      console.error('Order error:', error)
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la commande',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  if (authLoading) {
    return <LoadingSpinner message="Chargement..." />
  }

  if (!user || cart.length === 0) {
    return null
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2}>Finaliser ma commande</Heading>
            <Text color="gray.600">
              Quelques étapes et c'est prêt !
            </Text>
          </Box>

          {/* Stepper */}
          <Box bg="white" p={6} rounded="lg" shadow="sm">
            <Stepper index={activeStep} colorScheme="brand">
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>

                  <Box flexShrink="0">
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>

                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Step Content */}
          <Box>
            {activeStep === 0 && (
              <AddressSelector
                selectedAddress={selectedAddress}
                onSelectAddress={setSelectedAddress}
              />
            )}

            {activeStep === 1 && (
              <TimeSlotSelector
                selectedTimeSlot={selectedTimeSlot}
                onSelectTimeSlot={setSelectedTimeSlot}
              />
            )}

            {activeStep === 2 && (
              <VStack spacing={6} align="stretch">
                <Alert status="info" variant="left-accent">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Presque terminé !</AlertTitle>
                    <AlertDescription>
                      Vérifiez votre commande avant de finaliser le paiement.
                    </AlertDescription>
                  </Box>
                </Alert>

                <OrderSummary
                  address={selectedAddress}
                  timeSlot={selectedTimeSlot}
                  cart={cart}
                  total={getCartTotal()}
                />
              </VStack>
            )}
          </Box>

          {/* Navigation Buttons */}
          <HStack justify="space-between" bg="white" p={6} rounded="lg" shadow="sm">
            <Button
              onClick={handleBack}
              isDisabled={activeStep === 0}
              variant="ghost"
              size="lg"
            >
              Retour
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                colorScheme="brand"
                size="lg"
                px={8}
              >
                Continuer
              </Button>
            ) : (
              <Button
                onClick={handlePlaceOrder}
                colorScheme="brand"
                size="lg"
                px={8}
                isLoading={creatingOrder}
                loadingText="Commande en cours..."
              >
                Payer {getCartTotal().toFixed(2)}€
              </Button>
            )}
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}
