import { Box, Container, Heading, Text, VStack, SimpleGrid, Image, HStack, Badge, Button, Icon } from '@chakra-ui/react'
import { popularDishes } from '../../data/mockData'
import { FiShoppingCart, FiTrendingUp } from 'react-icons/fi'

export default function PopularDishes() {
  return (
    <Box py={{ base: 16, md: 20 }} bg="white">
      <Container maxW="container.xl">
        <VStack spacing={12}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center">
            <HStack spacing={2} color="brand.500">
              <Icon as={FiTrendingUp} boxSize={6} />
              <Text fontWeight="600" fontSize="sm" textTransform="uppercase" letterSpacing="wide">
                Plats populaires
              </Text>
            </HStack>
            <Heading
              as="h2"
              size={{ base: 'xl', md: '2xl' }}
              color="gray.800"
            >
              Les favoris de nos clients
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.600"
              maxW="2xl"
            >
              Découvrez les plats les plus commandés cette semaine
            </Text>
          </VStack>

          {/* Dishes Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {popularDishes.map((dish) => (
              <Box
                key={dish.id}
                bg="white"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="md"
                transition="all 0.3s"
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
                  {dish.stock < 10 && (
                    <Badge
                      position="absolute"
                      top={4}
                      right={4}
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
                      <Heading as="h3" size="sm" color="gray.800">
                        {dish.name}
                      </Heading>
                      <Text fontWeight="bold" fontSize="lg" color="brand.600">
                        {dish.price.toFixed(2)}€
                      </Text>
                    </HStack>
                    <Badge colorScheme="green" fontSize="xs">
                      {dish.category}
                    </Badge>
                  </VStack>

                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {dish.description}
                  </Text>

                  <Button
                    leftIcon={<FiShoppingCart />}
                    colorScheme="brand"
                    size="md"
                    w="full"
                    _hover={{
                      transform: 'scale(1.02)'
                    }}
                  >
                    Ajouter au panier
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>

          {/* CTA */}
          <Button
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
