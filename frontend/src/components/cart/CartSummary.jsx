import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Divider,
  Badge,
  useToast,
  Spinner
} from '@chakra-ui/react'
import { FiTag, FiCheck, FiX } from 'react-icons/fi'
import { calculateDiscount } from '../../hooks/usePromoCodes'
import { supabase } from '../../supabaseClient'

const DELIVERY_FEE = 3.90
const FREE_DELIVERY_THRESHOLD = 30

export default function CartSummary({ subtotal, onCheckout, appliedPromo, setAppliedPromo }) {
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')
  const [validating, setValidating] = useState(false)
  const toast = useToast()

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const discount = appliedPromo ? calculateDiscount(appliedPromo, subtotal) : 0
  const total = subtotal + deliveryFee - discount

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo')
      return
    }

    setValidating(true)
    setPromoError('')

    try {
      // Fetch promo code from Supabase
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Code promo invalide')
        }
        throw error
      }

      // Check if code has expired
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        throw new Error('Ce code promo a expiré')
      }

      // Check if code has reached usage limit
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        throw new Error('Ce code promo a atteint sa limite d\'utilisation')
      }

      // Check minimum order amount
      if (data.min_order_amount && subtotal < data.min_order_amount) {
        throw new Error(`Commande minimum de ${data.min_order_amount.toFixed(2)}€ requise`)
      }

      // Apply promo code
      setAppliedPromo(data)
      setPromoError('')
      setPromoCode('')

      toast({
        title: 'Code promo appliqué !',
        description: data.description,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      })
    } catch (err) {
      console.error('Error validating promo code:', err)
      setPromoError(err.message || 'Code promo invalide')
      setAppliedPromo(null)
    } finally {
      setValidating(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoError('')
    toast({
      title: 'Code promo retiré',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top'
    })
  }

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="xl"
      boxShadow="lg"
      position="sticky"
      top="80px"
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="700" color="gray.800">
          Récapitulatif
        </Text>

        <Divider />

        {/* Promo Code Input */}
        <VStack spacing={2} align="stretch">
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            Code promo
          </Text>
          {!appliedPromo ? (
            <>
              <InputGroup size="md">
                <Input
                  placeholder="Entrez votre code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase())
                    setPromoError('')
                  }}
                  isInvalid={!!promoError}
                  textTransform="uppercase"
                  isDisabled={validating}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyPromo()
                    }
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    colorScheme="brand"
                    onClick={handleApplyPromo}
                    isLoading={validating}
                    isDisabled={!promoCode.trim()}
                  >
                    {validating ? <Spinner size="xs" /> : <FiTag />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {promoError && (
                <Text fontSize="xs" color="red.500">
                  {promoError}
                </Text>
              )}
            </>
          ) : (
            <HStack
              p={3}
              bg="green.50"
              borderRadius="md"
              justify="space-between"
            >
              <HStack spacing={2}>
                <FiCheck color="green" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="600" color="green.700">
                    {appliedPromo.code}
                  </Text>
                  <Text fontSize="xs" color="green.600">
                    {appliedPromo.description}
                  </Text>
                </VStack>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={handleRemovePromo}
              >
                <FiX />
              </Button>
            </HStack>
          )}
        </VStack>

        <Divider />

        {/* Cost Breakdown */}
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text color="gray.600">Sous-total</Text>
            <Text fontWeight="600">{subtotal.toFixed(2)}€</Text>
          </HStack>

          <HStack justify="space-between">
            <HStack spacing={2}>
              <Text color="gray.600">Livraison</Text>
              {subtotal >= FREE_DELIVERY_THRESHOLD && (
                <Badge colorScheme="green" fontSize="xs">
                  Offerte
                </Badge>
              )}
            </HStack>
            <Text fontWeight="600" color={deliveryFee === 0 ? 'green.500' : 'gray.800'}>
              {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(2)}€`}
            </Text>
          </HStack>

          {subtotal < FREE_DELIVERY_THRESHOLD && (
            <Text fontSize="xs" color="gray.500">
              Plus que {(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)}€ pour la livraison gratuite
            </Text>
          )}

          {discount > 0 && (
            <HStack justify="space-between">
              <Text color="green.600">Réduction</Text>
              <Text fontWeight="600" color="green.600">
                -{discount.toFixed(2)}€
              </Text>
            </HStack>
          )}
        </VStack>

        <Divider />

        {/* Total */}
        <HStack justify="space-between" py={2}>
          <Text fontSize="lg" fontWeight="700" color="gray.800">
            Total
          </Text>
          <Text fontSize="2xl" fontWeight="800" color="brand.600">
            {total.toFixed(2)}€
          </Text>
        </HStack>

        {/* Checkout Button */}
        <Button
          colorScheme="brand"
          size="lg"
          w="full"
          onClick={onCheckout}
          fontSize="md"
          fontWeight="700"
        >
          Commander - {total.toFixed(2)}€
        </Button>

        <Text fontSize="xs" color="gray.500" textAlign="center">
          Livraison entre 7h et 9h le matin 📦
        </Text>
      </VStack>
    </Box>
  )
}
