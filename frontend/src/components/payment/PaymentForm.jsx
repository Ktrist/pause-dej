import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  Divider,
  HStack,
  SimpleGrid,
  Icon,
  Badge
} from '@chakra-ui/react'
import { CardElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config'

/**
 * PaymentForm Component
 *
 * Handles credit card payment using Stripe Elements
 *
 * Props:
 * - amount: Number (total amount in euros)
 * - onSuccess: Function (callback when payment succeeds)
 * - onError: Function (callback when payment fails)
 * - disabled: Boolean (disable the form)
 */
export default function PaymentForm({ amount, onSuccess, onError, disabled = false }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' or 'meal_voucher'

  // Initialize Apple Pay / Google Pay
  useEffect(() => {
    if (!stripe || !amount) {
      return
    }

    const pr = stripe.paymentRequest({
      country: 'FR',
      currency: 'eur',
      total: {
        label: 'Pause Dej\'',
        amount: Math.round(amount * 100), // Convert to cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    })

    // Check if Apple Pay / Google Pay is available
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr)
      }
    })

    // Handle payment method event
    pr.on('paymentmethod', async (e) => {
      setIsProcessing(true)
      setError(null)

      try {
        // Create payment intent
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              amount: amount,
              metadata: {
                source: 'pause-dej-checkout-wallet',
                paymentMethod: result?.applePay ? 'apple_pay' : 'google_pay',
              },
            }),
          }
        )

        const data = await response.json()

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Erreur lors de la création du paiement')
        }

        const { clientSecret } = data

        // Confirm payment
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: e.paymentMethod.id,
          },
          { handleActions: false }
        )

        if (confirmError) {
          e.complete('fail')
          throw new Error(confirmError.message)
        }

        e.complete('success')

        // Check if payment requires additional actions
        if (paymentIntent.status === 'requires_action') {
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret)
          if (actionError) {
            throw new Error(actionError.message)
          }
        }

        console.log('Payment successful:', paymentIntent.id)
        onSuccess?.()
      } catch (err) {
        console.error('Payment error:', err)
        setError(err.message || 'Une erreur est survenue lors du paiement')
        onError?.(err)
        e.complete('fail')
      } finally {
        setIsProcessing(false)
      }
    })
  }, [stripe, amount])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Get the CardElement
      const cardElement = elements.getElement(CardElement)

      // Step 1: Create payment intent on backend
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: amount,
            metadata: {
              source: 'pause-dej-checkout',
              paymentMethod: paymentMethod === 'meal_voucher' ? 'meal_voucher' : 'card',
            },
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }

      const { clientSecret } = data

      // Step 2: Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      )

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      // Step 3: Payment successful
      console.log('Payment successful:', paymentIntent.id)
      onSuccess?.()
    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'Une erreur est survenue lors du paiement')
      onError?.(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#9e2146'
      }
    },
    hidePostalCode: true
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {/* Payment Method Selection */}
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600" mb={3}>
            Choisissez votre moyen de paiement
          </FormLabel>
          <SimpleGrid columns={2} spacing={3}>
            <Box
              p={4}
              border="2px solid"
              borderColor={paymentMethod === 'card' ? 'brand.500' : 'gray.200'}
              borderRadius="lg"
              cursor="pointer"
              onClick={() => setPaymentMethod('card')}
              bg={paymentMethod === 'card' ? 'brand.50' : 'white'}
              transition="all 0.2s"
              _hover={{ borderColor: 'brand.300' }}
            >
              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="600">Carte bancaire</Text>
                <HStack spacing={2}>
                  {/* Visa */}
                  <Box
                    w="45px"
                    h="28px"
                    bg="white"
                    borderRadius="4px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <svg viewBox="0 0 48 32" width="28" height="18">
                      <rect width="48" height="32" rx="4" fill="#1434CB"/>
                      <text x="24" y="20" fontSize="10" fill="white" textAnchor="middle" fontFamily="Arial" fontWeight="bold">VISA</text>
                    </svg>
                  </Box>
                  {/* Mastercard */}
                  <Box
                    w="45px"
                    h="28px"
                    bg="white"
                    borderRadius="4px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <svg viewBox="0 0 48 32" width="28" height="18">
                      <rect width="48" height="32" rx="4" fill="white"/>
                      <circle cx="18" cy="16" r="8" fill="#EB001B"/>
                      <circle cx="30" cy="16" r="8" fill="#F79E1B" opacity="0.8"/>
                    </svg>
                  </Box>
                  {/* Amex */}
                  <Box
                    w="45px"
                    h="28px"
                    bg="white"
                    borderRadius="4px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <svg viewBox="0 0 48 32" width="28" height="18">
                      <rect width="48" height="32" rx="4" fill="#006FCF"/>
                      <text x="24" y="19" fontSize="8" fill="white" textAnchor="middle" fontFamily="Arial" fontWeight="bold">AMEX</text>
                    </svg>
                  </Box>
                </HStack>
              </VStack>
            </Box>

            <Box
              p={4}
              border="2px solid"
              borderColor={paymentMethod === 'meal_voucher' ? 'brand.500' : 'gray.200'}
              borderRadius="lg"
              cursor="pointer"
              onClick={() => setPaymentMethod('meal_voucher')}
              bg={paymentMethod === 'meal_voucher' ? 'brand.50' : 'white'}
              transition="all 0.2s"
              _hover={{ borderColor: 'brand.300' }}
              position="relative"
            >
              <Badge
                position="absolute"
                top={2}
                right={2}
                colorScheme="green"
                fontSize="xs"
              >
                Nouveau
              </Badge>
              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="600">Ticket Restaurant</Text>
                <HStack spacing={2}>
                  {/* Swile */}
                  <Box
                    w="45px"
                    h="28px"
                    bg="white"
                    borderRadius="4px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="8px" fontWeight="bold" color="#FF6B6B">
                      Swile
                    </Text>
                  </Box>
                  {/* Edenred */}
                  <Box
                    w="45px"
                    h="28px"
                    bg="white"
                    borderRadius="4px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="7px" fontWeight="bold" color="#E31E24">
                      Edenred
                    </Text>
                  </Box>
                  {/* Sodexo */}
                  <Box
                    w="45px"
                    h="28px"
                    bg="white"
                    borderRadius="4px"
                    borderWidth="1px"
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="7px" fontWeight="bold" color="#E20074">
                      Sodexo
                    </Text>
                  </Box>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </FormControl>

        {/* Apple Pay / Google Pay Button */}
        {paymentMethod === 'card' && paymentRequest && (
          <Box>
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: {
                  paymentRequestButton: {
                    type: 'default',
                    theme: 'dark',
                    height: '48px',
                  },
                },
              }}
            />
            <HStack my={4}>
              <Divider />
              <Text fontSize="sm" color="gray.500" px={2} whiteSpace="nowrap">
                ou payer par carte
              </Text>
              <Divider />
            </HStack>
          </Box>
        )}

        {/* Card Input */}
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">
            {paymentMethod === 'meal_voucher'
              ? 'Informations de votre carte ticket restaurant'
              : 'Informations de carte bancaire'}
          </FormLabel>
          <Box
            p={4}
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            bg="white"
            _hover={{ borderColor: 'gray.400' }}
            _focusWithin={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
          >
            <CardElement options={cardElementOptions} />
          </Box>
          {paymentMethod === 'meal_voucher' && (
            <Alert status="info" variant="left-accent" rounded="md" mt={2}>
              <AlertIcon />
              <Box fontSize="sm">
                <Text fontWeight="600">Tickets Restaurant acceptés</Text>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Swile, Edenred, Up Déjeuner, Apetiz, Bimpli, et tous les tickets restaurant sont acceptés via Stripe.
                </Text>
              </Box>
            </Alert>
          )}
        </FormControl>

        {/* Error Message */}
        {error && (
          <Alert status="error" rounded="md">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        {/* Payment Summary */}
        <Box bg="gray.50" p={4} rounded="md">
          <Text fontSize="sm" color="gray.600" mb={2}>
            Montant à payer
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="brand.600">
            {amount.toFixed(2)}€
          </Text>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          colorScheme="brand"
          isLoading={isProcessing}
          loadingText="Traitement..."
          isDisabled={!stripe || disabled}
          width="100%"
        >
          Payer {amount.toFixed(2)}€
        </Button>

        {/* Security Note */}
        <Text fontSize="xs" color="gray.500" textAlign="center">
          🔒 Paiement sécurisé par Stripe. Vos informations bancaires sont chiffrées.
        </Text>
      </VStack>
    </Box>
  )
}
