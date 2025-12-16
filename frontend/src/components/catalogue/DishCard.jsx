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
      bg="background.card"
      borderRadius="12px"
      overflow="hidden"
      boxShadow="card"
      transition="all 0.3s"
      cursor="pointer"
      onClick={onViewDetails}
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'cardHover'
      }}
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Top Half - Image */}
      <Box position="relative" h="250px" flexShrink={0}>
        <Image
          src={dish.image}
          alt={dish.name}
          w="full"
          h="full"
          objectFit="cover"
        />

        {/* Dietary Tags Badges */}
        {dish.dietaryTags && dish.dietaryTags.length > 0 && (
          <Wrap position="absolute" top={3} left={3} spacing={1} maxW="70%">
            {dish.dietaryTags.slice(0, 3).map((tag) => (
              <WrapItem key={tag}>
                <Badge
                  colorScheme="green"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                  bg="white"
                  color="green.600"
                  fontWeight="semibold"
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
                  py={1}
                  borderRadius="full"
                  bg="white"
                  color="green.600"
                  fontWeight="semibold"
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
          variant="solid"
          bg={isFavorite(dish.id) ? 'red.500' : 'white'}
          color={isFavorite(dish.id) ? 'white' : 'gray.600'}
          _hover={{
            bg: isFavorite(dish.id) ? 'red.600' : 'gray.100',
            transform: 'scale(1.1)'
          }}
          onClick={handleToggleFavorite}
          aria-label={isFavorite(dish.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          transition="all 0.2s"
          borderRadius="full"
        />

        {dish.stock < 10 && dish.stock > 0 && (
          <Badge
            position="absolute"
            bottom={3}
            right={3}
            colorScheme="red"
            fontSize="xs"
            px={3}
            py={1}
            borderRadius="full"
          >
            Plus que {dish.stock} !
          </Badge>
        )}
      </Box>

      {/* Bottom Half - Content */}
      <VStack align="stretch" p={5} spacing={3} flex={1} bg="background.card">
        {/* Title and Category */}
        <VStack align="start" spacing={2}>
          <Text
            fontWeight="bold"
            fontSize="lg"
            color="primary.500"
            noOfLines={1}
            lineHeight="1.2"
          >
            {dish.name}
          </Text>

          <HStack spacing={2}>
            <Badge
              colorScheme="primary"
              fontSize="xs"
              px={2}
              py={0.5}
              borderRadius="md"
              variant="subtle"
            >
              {dish.categoryLabel}
            </Badge>
            {/* Rating Display */}
            {dish.reviewCount > 0 && (
              <HStack spacing={1}>
                <Icon as={FiStar} color="yellow.500" boxSize={3} fill="yellow.500" />
                <Text fontSize="xs" fontWeight="semibold" color="text.primary">
                  {dish.averageRating.toFixed(1)}
                </Text>
                <Text fontSize="xs" color="text.light">
                  ({dish.reviewCount})
                </Text>
              </HStack>
            )}
          </HStack>
        </VStack>

        {/* Description */}
        <Text
          fontSize="sm"
          color="text.secondary"
          noOfLines={2}
          minH="40px"
          lineHeight="1.5"
        >
          {dish.description}
        </Text>

        {/* Nutrition Info */}
        {dish.nutritionInfo && (
          <HStack fontSize="xs" color="text.light" spacing={2}>
            <Text fontWeight="medium">{dish.nutritionInfo.calories} kcal</Text>
            <Text>•</Text>
            <Text>{dish.nutritionInfo.protein}g protéines</Text>
          </HStack>
        )}

        {/* Price and Add to Cart */}
        <HStack justify="space-between" align="center" pt={2} mt="auto">
          <Text
            fontWeight="bold"
            fontSize="2xl"
            color="primary.500"
          >
            {dish.price.toFixed(2)}€
          </Text>
          <Button
            leftIcon={<FiShoppingCart />}
            bg="brand.500"
            color="white"
            size="sm"
            onClick={handleAddToCart}
            isDisabled={dish.stock === 0}
            _hover={{
              bg: 'brand.600',
              transform: 'translateY(-2px)',
            }}
            _active={{
              bg: 'brand.700',
            }}
            borderRadius="10px"
            px={4}
            fontWeight="semibold"
          >
            {dish.stock === 0 ? 'Rupture' : 'Ajouter'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
