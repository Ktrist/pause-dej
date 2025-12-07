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
  useToast
} from '@chakra-ui/react'
import { FiTag, FiCheck, FiX } from 'react-icons/fi'
import { validatePromoCode } from '../../data/promoCodes'

const DELIVERY_FEE = 3.90
const FREE_DELIVERY_THRESHOLD = 30

export default function CartSummary({ subtotal, onCheckout }) {
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const toast = useToast()

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const discount = appliedPromo?.discount || 0
  const total = subtotal + deliveryFee - discount

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo')
      return
    }

    const result = validatePromoCode(promoCode, subtotal)

    if (result.valid) {
      setAppliedPromo(result)
      setPromoError('')
      toast({
        title: 'Code promo appliqué !',
        description: result.code.description,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      })
    } else {
      setPromoError(result.error)
      setAppliedPromo(null)
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
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    colorScheme="brand"
                    onClick={handleApplyPromo}
                    leftIcon={<FiTag />}
                  >
                    OK
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
                    {appliedPromo.code.code}
                  </Text>
                  <Text fontSize="xs" color="green.600">
                    {appliedPromo.code.description}
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
          Livraison en 30 minutes chrono ⚡
        </Text>
      </VStack>
    </Box>
  )
}
