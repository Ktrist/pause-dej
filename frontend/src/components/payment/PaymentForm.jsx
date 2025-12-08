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

      // TODO: This is a placeholder implementation
      // In production, you need to:
      // 1. Create a payment intent on your backend (Supabase Edge Function)
      // 2. Get the client_secret from the response
      // 3. Use stripe.confirmCardPayment() with the client_secret
      //
      // For now, we'll simulate a successful payment after a delay

      // Validate the card
      const { error: validateError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      })

      if (validateError) {
        throw new Error(validateError.message)
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock success for development
      console.log('Payment processed successfully (mock)')
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
        {/* Development Warning */}
        <Alert status="warning" rounded="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Mode développement</AlertTitle>
            <AlertDescription fontSize="xs">
              Le paiement Stripe nécessite une configuration backend. Consultez STRIPE_SETUP.md pour les instructions.
            </AlertDescription>
          </Box>
        </Alert>

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
