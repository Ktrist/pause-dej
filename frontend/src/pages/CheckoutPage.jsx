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
  AlertDescription,
  useDisclosure
} from '@chakra-ui/react'
import { Elements } from '@stripe/react-stripe-js'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCreateOrder } from '../hooks/useOrders'
import { calculateDiscount } from '../hooks/usePromoCodes'
import { useEmail } from '../hooks/useEmail'
import { useB2BEmployee } from '../hooks/useB2BEmployee'
import { validateDeliveryAddress, getDeliveryFee, formatDeliveryZones } from '../utils/deliveryZones'
import AddressSelector from '../components/checkout/AddressSelector'
import TimeSlotSelector from '../components/checkout/TimeSlotSelector'
import OrderSummary from '../components/checkout/OrderSummary'
import PaymentForm from '../components/payment/PaymentForm'
import B2BPaymentSelector from '../components/checkout/B2BPaymentSelector'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ComplementaryProductsModal from '../components/cart/ComplementaryProductsModal'
import ReferralCodeInput from '../components/referral/ReferralCodeInput'
import getStripe from '../stripeClient'

const steps = [
  { title: 'Livraison', description: 'Adresse' },
  { title: 'Créneau', description: 'Heure' },
  { title: 'Paiement', description: 'Finaliser' }
]

// Stripe promise
const stripePromise = getStripe()

function CheckoutPageContent() {
  const { cart, getCartTotal, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { createOrder, loading: creatingOrder } = useCreateOrder()
  const { sendOrderConfirmation } = useEmail()
  const { employee, business, budget, loading: employeeLoading } = useB2BEmployee()

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length
  })

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [appliedPromo, setAppliedPromo] = useState(location.state?.appliedPromo || null)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [b2bPaymentMethod, setB2bPaymentMethod] = useState(null)
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const [hasShownModal, setHasShownModal] = useState(false)

  // Show complementary products modal when reaching payment step (step 2)
  useEffect(() => {
    if (activeStep === 2 && !hasShownModal && cart.length > 0) {
      console.log('🍰 Reached payment step - showing dessert suggestions')
      onModalOpen()
      setHasShownModal(true) // Only show once per checkout session
    }
  }, [activeStep, hasShownModal, cart.length, onModalOpen])

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
  }, [user, authLoading, navigate])

  // Redirect if cart is empty (but not during order placement)
  useEffect(() => {
    if (cart.length === 0 && !isPlacingOrder) {
      toast({
        title: 'Panier vide',
        description: 'Ajoutez des plats avant de commander',
        status: 'info',
        duration: 3000
      })
      navigate('/catalogue')
    }
  }, [cart, navigate, isPlacingOrder])

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

    // Validate delivery zone for selected address
    if (activeStep === 0 && selectedAddress) {
      const validation = validateDeliveryAddress(selectedAddress)
      if (!validation.isValid) {
        toast({
          title: 'Zone de livraison non disponible',
          description: validation.message,
          status: 'error',
          duration: 5000,
          isClosable: true
        })
        return
      }
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
      // Validate B2B payment method is selected
      if (employee && !b2bPaymentMethod) {
        toast({
          title: 'Méthode de paiement requise',
          description: 'Veuillez sélectionner une méthode de paiement',
          status: 'warning',
          duration: 3000
        })
        return
      }

      // Set flag to prevent cart empty redirect
      setIsPlacingOrder(true)

      // Calculate totals
      const subtotal = getCartTotal()
      // Get dynamic delivery fee based on delivery zone
      const zoneDeliveryFee = getDeliveryFee(selectedAddress)
      const deliveryFee = subtotal >= 30 ? 0 : zoneDeliveryFee
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
        delivery_time: selectedTimeSlot.timeValue || '07:00:00', // Use timeValue for database format
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        discount: discount,
        promo_code_id: appliedPromo?.id || null,
        total: total,
        payment_method: employee ? b2bPaymentMethod : 'card',
        status: 'pending',
        // B2B specific fields
        ...(employee && {
          is_b2b_order: true,
          b2b_company_id: employee.company_id,
          b2b_employee_id: employee.id,
          charged_to_budget: b2bPaymentMethod === 'budget'
        })
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

      // Send confirmation email (N1.2)
      if (user.email) {
        try {
          await sendOrderConfirmation(order, user.email)
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
          // Don't block user flow if email fails
        }
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
      setIsPlacingOrder(false) // Reset flag on error
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la commande',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  if (authLoading || employeeLoading) {
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
              <VStack spacing={4} align="stretch">
                {/* Delivery zones info */}
                <Alert status="info" variant="left-accent" rounded="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm" mb={1}>Zones de livraison</AlertTitle>
                    <AlertDescription fontSize="sm">
                      Nous livrons actuellement à {formatDeliveryZones()}.
                    </AlertDescription>
                  </Box>
                </Alert>

                <AddressSelector
                  selectedAddress={selectedAddress}
                  onSelectAddress={setSelectedAddress}
                />
              </VStack>
            )}

            {activeStep === 1 && (
              <TimeSlotSelector
                selectedTimeSlot={selectedTimeSlot}
                onSelectTimeSlot={setSelectedTimeSlot}
              />
            )}

            {activeStep === 2 && (
              <VStack spacing={6} align="stretch">
                {/* Order Summary */}
                <OrderSummary
                  address={selectedAddress}
                  timeSlot={selectedTimeSlot}
                  cart={cart}
                  total={getCartTotal()}
                  appliedPromo={appliedPromo}
                />

                {/* Referral Code Input */}
                <ReferralCodeInput
                  onSuccess={() => {
                    toast({
                      title: 'Code de parrainage appliqué !',
                      description: 'Vous recevrez 10€ après votre première commande',
                      status: 'success',
                      duration: 4000,
                      isClosable: true
                    })
                  }}
                />

                {/* Payment Form */}
                <Box bg="white" p={6} rounded="lg" shadow="sm">
                  <Heading size="md" mb={4}>
                    Paiement
                  </Heading>

                  {employee ? (
                    // B2B Payment Selector for employees
                    <B2BPaymentSelector
                      employee={employee}
                      budget={budget}
                      business={business}
                      selectedMethod={b2bPaymentMethod}
                      onSelectMethod={setB2bPaymentMethod}
                      onPlaceOrder={handlePlaceOrder}
                      disabled={creatingOrder}
                      total={getCartTotal() + (getCartTotal() >= 30 ? 0 : getDeliveryFee(selectedAddress)) - (appliedPromo ? calculateDiscount(appliedPromo, getCartTotal()) : 0)}
                    />
                  ) : (
                    // Regular Stripe Payment Form
                    <PaymentForm
                      amount={getCartTotal() + (getCartTotal() >= 30 ? 0 : getDeliveryFee(selectedAddress)) - (appliedPromo ? calculateDiscount(appliedPromo, getCartTotal()) : 0)}
                      onSuccess={handlePlaceOrder}
                      onError={(error) => {
                        toast({
                          title: 'Erreur de paiement',
                          description: error.message || 'Le paiement a échoué',
                          status: 'error',
                          duration: 5000
                        })
                      }}
                      disabled={creatingOrder}
                    />
                  )}
                </Box>
              </VStack>
            )}
          </Box>

          {/* Navigation Buttons */}
          {activeStep < steps.length - 1 && (
            <HStack justify="space-between" bg="white" p={6} rounded="lg" shadow="sm">
              <Button
                onClick={handleBack}
                isDisabled={activeStep === 0}
                variant="ghost"
                size="lg"
              >
                Retour
              </Button>

              <Button
                onClick={handleNext}
                colorScheme="brand"
                size="lg"
                px={8}
              >
                Continuer
              </Button>
            </HStack>
          )}

          {/* Back button for payment step */}
          {activeStep === steps.length - 1 && (
            <Box bg="white" p={6} rounded="lg" shadow="sm">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="lg"
              >
                Retour
              </Button>
            </Box>
          )}
        </VStack>
      </Container>

      {/* Complementary Products Modal */}
      <ComplementaryProductsModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        onProceedToCheckout={onModalClose}
      />
    </Box>
  )
}

// Wrap with Stripe Elements provider
export default function CheckoutPage() {
  if (!stripePromise) {
    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="container.md">
          <Alert status="error" variant="left-accent" rounded="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Configuration Stripe manquante</Text>
              <Text fontSize="sm">
                La clé publique Stripe n'est pas configurée. Veuillez consulter STRIPE_SETUP.md pour les instructions.
              </Text>
            </Box>
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutPageContent />
    </Elements>
  )
}
