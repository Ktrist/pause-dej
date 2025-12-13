import { Box, Image, VStack, HStack, Text, Button, Badge, Icon, IconButton, useToast, Wrap, WrapItem } from '@chakra-ui/react'
import { FiShoppingCart, FiEye, FiHeart, FiStar } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../context/AuthContext'
import { getPreferenceIcon, getPreferenceLabel } from '../../hooks/useProfile'

export default function DishCard({ dish, onViewDetails }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
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

  const handleToggleFavorite = async (e) => {
    e.stopPropagation()

    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Connectez-vous pour ajouter des favoris',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      return
    }

    const { error } = await toggleFavorite(dish.id)

    if (error && !error.includes('Already in favorites')) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } else if (!error) {
      toast({
        title: isFavorite(dish.id) ? 'Retiré des favoris' : 'Ajouté aux favoris',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      })
    }
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

        {/* Dietary Tags Badges - M9.2 */}
        {dish.dietaryTags && dish.dietaryTags.length > 0 && (
          <Wrap position="absolute" top={3} left={3} spacing={1} maxW="70%">
            {dish.dietaryTags.slice(0, 3).map((tag) => (
              <WrapItem key={tag}>
                <Badge
                  colorScheme="green"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  bg="white"
                  color="green.600"
                  fontWeight="600"
                  boxShadow="sm"
                >
                  {getPreferenceIcon(tag)}
                </Badge>
              </WrapItem>
            ))}
            {dish.dietaryTags.length > 3 && (
              <WrapItem>
                <Badge
                  colorScheme="green"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  bg="white"
                  color="green.600"
                  fontWeight="600"
                  boxShadow="sm"
                >
                  +{dish.dietaryTags.length - 3}
                </Badge>
              </WrapItem>
            )}
          </Wrap>
        )}

        {/* Favorite Button */}
        <IconButton
          icon={<Icon as={FiHeart} />}
          position="absolute"
          top={3}
          right={3}
          size="sm"
          colorScheme={isFavorite(dish.id) ? 'red' : 'gray'}
          variant={isFavorite(dish.id) ? 'solid' : 'ghost'}
          bg={isFavorite(dish.id) ? 'red.500' : 'white'}
          color={isFavorite(dish.id) ? 'white' : 'gray.600'}
          _hover={{
            bg: isFavorite(dish.id) ? 'red.600' : 'gray.100',
            transform: 'scale(1.1)'
          }}
          onClick={handleToggleFavorite}
          aria-label={isFavorite(dish.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          transition="all 0.2s"
        />

        {dish.stock < 10 && dish.stock > 0 && (
          <Badge
            position="absolute"
            bottom={3}
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
          <HStack spacing={2}>
            <Badge colorScheme="gray" fontSize="xs">
              {dish.categoryLabel}
            </Badge>
            {/* Rating Display - Reviews System */}
            {dish.reviewCount > 0 && (
              <HStack spacing={1}>
                <Icon as={FiStar} color="yellow.500" boxSize={3} fill="yellow.500" />
                <Text fontSize="xs" fontWeight="600" color="gray.700">
                  {dish.averageRating.toFixed(1)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  ({dish.reviewCount})
                </Text>
              </HStack>
            )}
          </HStack>
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
