import {
  Box,
  HStack,
  VStack,
  Image,
  Text,
  IconButton,
  Button,
  Badge,
  useNumberInput
} from '@chakra-ui/react'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'

export default function CartItemCard({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step: 1,
      defaultValue: item.quantity,
      min: 1,
      max: 99,
      value: item.quantity,
      onChange: (valueString, valueNumber) => updateQuantity(item.id, valueNumber)
    })

  const handleRemove = () => {
    removeFromCart(item.id)
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
          src={item.image}
          alt={item.name}
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
                {item.name}
              </Text>
              <Badge colorScheme="gray" fontSize="xs">
                {item.categoryLabel}
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
            {item.description}
          </Text>

          <HStack justify="space-between" pt={2}>
            {/* Quantity Stepper */}
            <HStack spacing={2}>
              <Button
                {...getDecrementButtonProps()}
                size="sm"
                variant="outline"
                colorScheme="brand"
              >
                <FiMinus />
              </Button>
              <Text
                {...getInputProps()}
                minW="40px"
                textAlign="center"
                fontWeight="600"
                fontSize="md"
              >
                {item.quantity}
              </Text>
              <Button
                {...getIncrementButtonProps()}
                size="sm"
                variant="outline"
                colorScheme="brand"
              >
                <FiPlus />
              </Button>
            </HStack>

            {/* Price */}
            <VStack align="end" spacing={0}>
              <Text fontWeight="700" fontSize="lg" color="brand.600">
                {(item.price * item.quantity).toFixed(2)}€
              </Text>
              {item.quantity > 1 && (
                <Text fontSize="xs" color="gray.500">
                  {item.price.toFixed(2)}€ / unité
                </Text>
              )}
            </VStack>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  )
}
