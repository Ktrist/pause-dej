import { useState } from 'react'
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
  FormLabel
} from '@chakra-ui/react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
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
        {/* Card Input */}
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="600">
            Informations de carte bancaire
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
