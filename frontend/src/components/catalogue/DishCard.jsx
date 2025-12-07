import { Box, Image, VStack, HStack, Text, Button, Badge, Icon, useToast } from '@chakra-ui/react'
import { FiShoppingCart, FiEye } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'

export default function DishCard({ dish, onViewDetails }) {
  const { addToCart } = useCart()
  const toast = useToast()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(dish)
    toast({
      title: 'Ajouté au panier',
      description: `${dish.name} a été ajouté à votre panier`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right'
    })
  }

  return (
    <Box
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="md"
      transition="all 0.3s"
      cursor="pointer"
      onClick={onViewDetails}
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl'
      }}
    >
      {/* Image */}
      <Box position="relative">
        <Image
          src={dish.image}
          alt={dish.name}
          w="full"
          h="200px"
          objectFit="cover"
        />

        {/* Badges */}
        <HStack position="absolute" top={3} left={3} spacing={2}>
          {dish.vegetarian && (
            <Badge colorScheme="green" fontSize="xs">
              🌱 Végétarien
            </Badge>
          )}
          {dish.vegan && (
            <Badge colorScheme="green" fontSize="xs">
              🌿 Vegan
            </Badge>
          )}
        </HStack>

        {dish.stock < 10 && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            colorScheme="red"
            fontSize="xs"
          >
            Plus que {dish.stock} !
          </Badge>
        )}
      </Box>

      {/* Content */}
      <VStack align="stretch" p={5} spacing={3}>
        <VStack align="start" spacing={1}>
          <HStack justify="space-between" w="full">
            <Text fontWeight="600" fontSize="lg" color="gray.800" noOfLines={1}>
              {dish.name}
            </Text>
            <Text fontWeight="700" fontSize="xl" color="brand.600">
              {dish.price.toFixed(2)}€
            </Text>
          </HStack>
          <Badge colorScheme="gray" fontSize="xs">
            {dish.categoryLabel}
          </Badge>
        </VStack>

        <Text fontSize="sm" color="gray.600" noOfLines={2} minH="40px">
          {dish.description}
        </Text>

        {/* Nutrition Info */}
        <HStack fontSize="xs" color="gray.500" spacing={3}>
          <Text>{dish.nutritionInfo.calories} kcal</Text>
          <Text>•</Text>
          <Text>{dish.nutritionInfo.protein}g protéines</Text>
        </HStack>

        {/* Actions */}
        <HStack spacing={2} pt={2}>
          <Button
            leftIcon={<FiShoppingCart />}
            colorScheme="brand"
            size="sm"
            flex={1}
            onClick={handleAddToCart}
            isDisabled={dish.stock === 0}
          >
            {dish.stock === 0 ? 'Rupture' : 'Ajouter'}
          </Button>
          <Button
            leftIcon={<FiEye />}
            variant="outline"
            colorScheme="brand"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
          >
            Détails
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
