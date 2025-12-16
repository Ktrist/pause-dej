import { Box, Container, Heading, Text, VStack, SimpleGrid, Image, HStack, Badge, Button, Icon, useToast, Alert, AlertIcon, AlertTitle } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { usePopularDishes } from '../../hooks/useDishes'
import { FiShoppingCart, FiTrendingUp } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import LoadingSpinner from '../common/LoadingSpinner'

export default function PopularDishes() {
  const { addToCart } = useCart()
  const toast = useToast()
  const { dishes, loading, error } = usePopularDishes(6)

  const handleAddToCart = (dish) => {
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

  // Loading state
  if (loading) {
    return (
      <Box py={{ base: 16, md: 20 }} bg="white">
        <Container maxW="container.xl">
          <LoadingSpinner message="Chargement des plats populaires..." />
        </Container>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box py={{ base: 16, md: 20 }} bg="white">
        <Container maxW="container.xl">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Erreur de chargement des plats populaires</AlertTitle>
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box py={{ base: 16, md: 20 }} bg="background.card">
      <Container maxW="container.xl">
        <VStack spacing={12}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center">
            <HStack spacing={2} color="brand.500">
              <Icon as={FiTrendingUp} boxSize={6} />
              <Text fontWeight="semibold" fontSize="sm" textTransform="uppercase" letterSpacing="wide">
                Plats populaires
              </Text>
            </HStack>
            <Heading
              as="h2"
              size={{ base: 'xl', md: '2xl' }}
              color="primary.500"
              fontWeight="extrabold"
            >
              Les favoris de nos clients
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="text.secondary"
              maxW="2xl"
              fontWeight="medium"
            >
              Découvrez les plats les plus commandés cette semaine
            </Text>
          </VStack>

          {/* Dishes Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {dishes.map((dish) => (
              <Box
                key={dish.id}
                bg="background.card"
                borderRadius="12px"
                overflow="hidden"
                boxShadow="card"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'cardHover'
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
                  {dish.stock < 10 && (
                    <Badge
                      position="absolute"
                      top={4}
                      right={4}
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

                {/* Content */}
                <VStack align="stretch" p={5} spacing={3}>
                  <VStack align="start" spacing={1}>
                    <HStack justify="space-between" w="full">
                      <Heading as="h3" size="sm" color="primary.500" fontWeight="bold">
                        {dish.name}
                      </Heading>
                      <Text fontWeight="bold" fontSize="lg" color="primary.500">
                        {dish.price.toFixed(2)}€
                      </Text>
                    </HStack>
                    <Badge colorScheme="primary" fontSize="xs" variant="subtle" px={2} py={0.5} borderRadius="md">
                      {dish.category}
                    </Badge>
                  </VStack>

                  <Text fontSize="sm" color="text.secondary" noOfLines={2} fontWeight="medium">
                    {dish.description}
                  </Text>

                  <Button
                    leftIcon={<FiShoppingCart />}
                    bg="brand.500"
                    color="white"
                    size="md"
                    w="full"
                    onClick={() => handleAddToCart(dish)}
                    _hover={{
                      bg: 'brand.600',
                      transform: 'translateY(-2px)'
                    }}
                    _active={{
                      bg: 'brand.700'
                    }}
                    borderRadius="10px"
                    fontWeight="semibold"
                  >
                    Ajouter au panier
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>

          {/* CTA */}
          <Button
            as={RouterLink}
            to="/catalogue"
            size="lg"
            variant="outline"
            colorScheme="brand"
            px={8}
          >
            Voir tout le catalogue
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}
