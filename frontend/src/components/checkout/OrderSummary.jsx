import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Divider,
  SimpleGrid,
  Badge,
  Icon
} from '@chakra-ui/react'
import { FiMapPin, FiClock, FiPackage, FiAward } from 'react-icons/fi'
import { calculateDiscount } from '../../hooks/usePromoCodes'
import { useLoyalty } from '../../hooks/useLoyalty'
import { useAuth } from '../../context/AuthContext'

const DELIVERY_FEE = 3.90
const FREE_DELIVERY_THRESHOLD = 30

export default function OrderSummary({ address, timeSlot, cart, total, appliedPromo = null }) {
  const { user } = useAuth()
  const { loyaltyData, tiers } = useLoyalty()

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const discount = appliedPromo ? calculateDiscount(appliedPromo, subtotal) : 0
  const finalTotal = subtotal + deliveryFee - discount

  // Calculate points to be earned based on tier
  const calculatePointsToEarn = () => {
    if (!user || !loyaltyData || !loyaltyData.tier) return 0

    let multiplier = 1
    const tierName = loyaltyData.tier.name

    if (tierName === 'Platine') multiplier = 3
    else if (tierName === 'Or') multiplier = 2
    else if (tierName === 'Argent') multiplier = 1.5
    else multiplier = 1 // Bronze

    return Math.floor(finalTotal * multiplier)
  }

  const pointsToEarn = calculatePointsToEarn()

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      {/* Left Column - Delivery Info */}
      <VStack align="stretch" spacing={6}>
        {/* Address Card */}
        <Box bg="white" p={6} rounded="lg" shadow="sm" border="1px solid" borderColor="gray.200">
          <HStack spacing={3} mb={4}>
            <Box
              p={2}
              bg="brand.50"
              rounded="lg"
            >
              <Icon as={FiMapPin} boxSize={5} color="brand.600" />
            </Box>
            <Text fontWeight="bold" fontSize="lg">Adresse de livraison</Text>
          </HStack>

          {address ? (
            <VStack align="start" spacing={2} pl={10}>
              <Text fontWeight="bold">{address.label}</Text>
              <Text color="gray.700">{address.street_address}</Text>
              <Text color="gray.700">{address.postal_code} {address.city}</Text>
              {address.additional_info && (
                <Text fontSize="sm" color="gray.600">{address.additional_info}</Text>
              )}
            </VStack>
          ) : (
            <Text color="gray.500" pl={10}>Aucune adresse sélectionnée</Text>
          )}
        </Box>

        {/* Time Slot Card */}
        <Box bg="white" p={6} rounded="lg" shadow="sm" border="1px solid" borderColor="gray.200">
          <HStack spacing={3} mb={4}>
            <Box
              p={2}
              bg="blue.50"
              rounded="lg"
            >
              <Icon as={FiClock} boxSize={5} color="blue.600" />
            </Box>
            <Text fontWeight="bold" fontSize="lg">Créneau de livraison</Text>
          </HStack>

          {timeSlot ? (
            <VStack align="start" spacing={2} pl={10}>
              <HStack>
                <Text fontWeight="bold" fontSize="lg">{timeSlot.time}</Text>
                <Badge colorScheme="green">Confirmé</Badge>
              </HStack>
              <Text color="gray.700">
                {timeSlot.date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">
                  Livraison entre 7h et 9h le matin
                </Text>
                <HStack spacing={1}>
                  <Badge colorScheme="purple" fontSize="2xs">Bientôt</Badge>
                  <Text fontSize="2xs" color="purple.700">
                    Créneaux de 30 min (7h-13h30)
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          ) : (
            <Text color="gray.500" pl={10}>Aucun créneau sélectionné</Text>
          )}
        </Box>
      </VStack>

      {/* Right Column - Order Items & Total */}
      <VStack align="stretch" spacing={6}>
        {/* Items Card */}
        <Box bg="white" p={6} rounded="lg" shadow="sm" border="1px solid" borderColor="gray.200">
          <HStack spacing={3} mb={4}>
            <Box
              p={2}
              bg="orange.50"
              rounded="lg"
            >
              <Icon as={FiPackage} boxSize={5} color="orange.600" />
            </Box>
            <Text fontWeight="bold" fontSize="lg">Votre commande</Text>
            <Badge colorScheme="brand" ml="auto">{cart.length} article{cart.length > 1 ? 's' : ''}</Badge>
          </HStack>

          <VStack align="stretch" spacing={3} pl={10}>
            {cart.map((item) => (
              <HStack key={item.id} spacing={3} align="start">
                <Image
                  src={item.image}
                  alt={item.name}
                  boxSize="50px"
                  objectFit="cover"
                  rounded="md"
                />
                <Box flex="1">
                  <Text fontWeight="medium" fontSize="sm">{item.name}</Text>
                  <Text fontSize="xs" color="gray.600">Quantité: {item.quantity}</Text>
                </Box>
                <Text fontWeight="bold" fontSize="sm">
                  {(item.price * item.quantity).toFixed(2)}€
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Total Card */}
        <Box bg="white" p={6} rounded="lg" shadow="sm" border="2px solid" borderColor="brand.500">
          <Text fontWeight="bold" fontSize="lg" mb={4}>Récapitulatif</Text>

          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text color="gray.700">Sous-total</Text>
              <Text fontWeight="medium">{subtotal.toFixed(2)}€</Text>
            </HStack>

            <HStack justify="space-between">
              <Text color="gray.700">Frais de livraison</Text>
              {deliveryFee === 0 ? (
                <HStack spacing={2}>
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    textDecoration="line-through"
                  >
                    {DELIVERY_FEE.toFixed(2)}€
                  </Text>
                  <Badge colorScheme="green">Gratuit</Badge>
                </HStack>
              ) : (
                <Text fontWeight="medium">{deliveryFee.toFixed(2)}€</Text>
              )}
            </HStack>

            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <Text fontSize="xs" color="orange.600" fontStyle="italic">
                Livraison gratuite dès {FREE_DELIVERY_THRESHOLD}€ d'achat
              </Text>
            )}

            {discount > 0 && (
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Text color="gray.700">Code promo</Text>
                  <Badge colorScheme="green" fontSize="xs">{appliedPromo.code}</Badge>
                </HStack>
                <Text fontWeight="medium" color="green.600">
                  -{discount.toFixed(2)}€
                </Text>
              </HStack>
            )}

            <Divider borderColor="gray.300" />

            <HStack justify="space-between">
              <Text fontSize="xl" fontWeight="bold">Total</Text>
              <Text fontSize="xl" fontWeight="bold" color="brand.600">
                {finalTotal.toFixed(2)}€
              </Text>
            </HStack>

            <Box bg="green.50" p={3} rounded="md" mt={2}>
              <Text fontSize="xs" color="green.800" textAlign="center" fontWeight="medium">
                🎉 Vous économisez {
                  deliveryFee === 0 && discount > 0
                    ? (DELIVERY_FEE + discount).toFixed(2) + '€'
                    : deliveryFee === 0
                    ? DELIVERY_FEE.toFixed(2) + '€ sur la livraison'
                    : discount > 0
                    ? discount.toFixed(2) + '€ avec le code promo'
                    : '0€'
                }
              </Text>
            </Box>

            {/* Loyalty Points Indicator - M10 */}
            {user && pointsToEarn > 0 && (
              <Box bg="brand.50" p={3} rounded="md" border="1px solid" borderColor="brand.200">
                <HStack spacing={2} justify="center">
                  <Icon as={FiAward} color="brand.600" />
                  <Text fontSize="sm" color="brand.800" fontWeight="600">
                    +{pointsToEarn} points de fidélité
                  </Text>
                </HStack>
                {loyaltyData?.tier && (
                  <Text fontSize="xs" color="brand.700" textAlign="center" mt={1}>
                    Niveau {loyaltyData.tier.name} {loyaltyData.tier.icon}
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>
    </SimpleGrid>
  )
}
