import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  SimpleGrid,
  Box,
  useToast
} from '@chakra-ui/react'
import { FiShoppingCart } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'

export default function DishDetailModal({ dish, isOpen, onClose }) {
  const { addToCart } = useCart()
  const toast = useToast()

  if (!dish) return null

  const handleAddToCart = () => {
    addToCart(dish)
    toast({
      title: 'Ajouté au panier',
      description: `${dish.name} a été ajouté à votre panier`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right'
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalCloseButton zIndex={1} />
        <ModalHeader p={0}>
          <Image
            src={dish.image}
            alt={dish.name}
            w="full"
            h="300px"
            objectFit="cover"
            borderTopRadius="md"
          />
        </ModalHeader>

        <ModalBody p={6}>
          <VStack align="stretch" spacing={5}>
            {/* Header */}
            <VStack align="start" spacing={2}>
              <HStack spacing={2} flexWrap="wrap">
                <Badge colorScheme="gray">{dish.categoryLabel}</Badge>
                {dish.vegetarian && <Badge colorScheme="green">🌱 Végétarien</Badge>}
                {dish.vegan && <Badge colorScheme="green">🌿 Vegan</Badge>}
                {dish.stock < 10 && (
                  <Badge colorScheme="red">Plus que {dish.stock} disponibles</Badge>
                )}
              </HStack>

              <Text fontSize="2xl" fontWeight="700" color="gray.800">
                {dish.name}
              </Text>

              <Text fontSize="3xl" fontWeight="800" color="brand.600">
                {dish.price.toFixed(2)}€
              </Text>
            </VStack>

            <Divider />

            {/* Description */}
            <VStack align="start" spacing={2}>
              <Text fontWeight="600" color="gray.700">
                Description
              </Text>
              <Text color="gray.600" lineHeight="tall">
                {dish.longDescription}
              </Text>
            </VStack>

            <Divider />

            {/* Nutrition Info */}
            <VStack align="start" spacing={3}>
              <Text fontWeight="600" color="gray.700">
                Informations nutritionnelles
              </Text>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Calories
                  </Text>
                  <Text fontSize="lg" fontWeight="600">
                    {dish.nutritionInfo.calories} kcal
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Protéines
                  </Text>
                  <Text fontSize="lg" fontWeight="600">
                    {dish.nutritionInfo.protein}g
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Glucides
                  </Text>
                  <Text fontSize="lg" fontWeight="600">
                    {dish.nutritionInfo.carbs}g
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Lipides
                  </Text>
                  <Text fontSize="lg" fontWeight="600">
                    {dish.nutritionInfo.fat}g
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>

            <Divider />

            {/* Allergens */}
            <VStack align="start" spacing={2}>
              <Text fontWeight="600" color="gray.700">
                Allergènes
              </Text>
              {dish.allergens.length > 0 ? (
                <HStack spacing={2} flexWrap="wrap">
                  {dish.allergens.map((allergen) => (
                    <Badge key={allergen} colorScheme="orange" variant="outline">
                      {allergen}
                    </Badge>
                  ))}
                </HStack>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  Aucun allergène connu
                </Text>
              )}
            </VStack>

            {/* Add to Cart Button */}
            <Button
              leftIcon={<FiShoppingCart />}
              colorScheme="brand"
              size="lg"
              w="full"
              onClick={handleAddToCart}
              isDisabled={dish.stock === 0}
            >
              {dish.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
