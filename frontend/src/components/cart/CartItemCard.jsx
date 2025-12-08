import {
  Box,
  HStack,
  VStack,
  Image,
  Text,
  IconButton,
  Button,
  Badge
} from '@chakra-ui/react'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'

export default function CartItemCard({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  // Defensive check: if item is invalid, don't render anything
  if (!item || typeof item !== 'object' || !item.id) {
    console.warn('CartItemCard received invalid item:', item)
    return null
  }

  // Ensure all properties exist (for backward compatibility with old cart data)
  const safeItem = {
    id: item.id,
    name: item.name || 'Produit',
    categoryLabel: item.categoryLabel || item.category || 'Plat',
    image: item.image || '/placeholder-dish.jpg',
    description: item.description || '',
    price: parseFloat(item.price) || 0,
    quantity: parseInt(item.quantity) || 1
  }

  const handleIncrement = () => {
    if (safeItem.quantity < 99) {
      updateQuantity(safeItem.id, safeItem.quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (safeItem.quantity > 1) {
      updateQuantity(safeItem.id, safeItem.quantity - 1)
    }
  }

  const handleRemove = () => {
    removeFromCart(safeItem.id)
  }

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <HStack spacing={4} align="start">
        {/* Image */}
        <Image
          src={safeItem.image}
          alt={safeItem.name}
          w={{ base: '80px', md: '100px' }}
          h={{ base: '80px', md: '100px' }}
          objectFit="cover"
          borderRadius="md"
          flexShrink={0}
        />

        {/* Content */}
        <VStack flex={1} align="stretch" spacing={2}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <Text fontWeight="600" fontSize={{ base: 'md', md: 'lg' }}>
                {safeItem.name}
              </Text>
              <Badge colorScheme="gray" fontSize="xs">
                {safeItem.categoryLabel}
              </Badge>
            </VStack>
            <IconButton
              icon={<FiTrash2 />}
              variant="ghost"
              colorScheme="red"
              size="sm"
              onClick={handleRemove}
              aria-label="Supprimer"
            />
          </HStack>

          <Text fontSize="sm" color="gray.600" noOfLines={2} display={{ base: 'none', md: 'block' }}>
            {safeItem.description}
          </Text>

          <HStack justify="space-between" pt={2}>
            {/* Quantity Stepper */}
            <HStack spacing={2}>
              <Button
                onClick={handleDecrement}
                size="sm"
                variant="outline"
                colorScheme="brand"
                isDisabled={safeItem.quantity <= 1}
              >
                <FiMinus />
              </Button>
              <Text
                minW="40px"
                textAlign="center"
                fontWeight="600"
                fontSize="md"
              >
                {safeItem.quantity}
              </Text>
              <Button
                onClick={handleIncrement}
                size="sm"
                variant="outline"
                colorScheme="brand"
                isDisabled={safeItem.quantity >= 99}
              >
                <FiPlus />
              </Button>
            </HStack>

            {/* Price */}
            <VStack align="end" spacing={0}>
              <Text fontWeight="700" fontSize="lg" color="brand.600">
                {(safeItem.price * safeItem.quantity).toFixed(2)}€
              </Text>
              {safeItem.quantity > 1 && (
                <Text fontSize="xs" color="gray.500">
                  {safeItem.price.toFixed(2)}€ / unité
                </Text>
              )}
            </VStack>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  )
}
