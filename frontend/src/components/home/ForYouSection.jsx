import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Button,
  Icon
} from '@chakra-ui/react'
import { FiStar, FiArrowRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { usePersonalizedSuggestions } from '../../hooks/usePersonalizedSuggestions'
import { useAuth } from '../../context/AuthContext'
import DishCard from '../catalogue/DishCard'
import LoadingSpinner from '../common/LoadingSpinner'

/**
 * For You Section - M9.3
 * Displays personalized dish recommendations based on user preferences
 */
export default function ForYouSection() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { suggestions, loading, hasPersonalizedSuggestions } = usePersonalizedSuggestions(8)

  // Don't show section if no user or no suggestions
  if (!user || (!loading && suggestions.length === 0)) {
    return null
  }

  const handleViewDetails = (dish) => {
    navigate(`/a-la-carte?dish=${dish.id}`)
  }

  return (
    <Box bg="gradient.brand" py={20}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="start">
            <HStack spacing={3}>
              <Icon as={FiStar} boxSize={8} color="brand.500" />
              <Heading as="h2" size="xl" color="gray.800">
                {hasPersonalizedSuggestions ? 'Pour Vous' : 'Suggestions'}
              </Heading>
            </HStack>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              {hasPersonalizedSuggestions
                ? 'Sélection personnalisée basée sur vos préférences et vos favoris'
                : 'Découvrez nos plats les plus populaires'}
            </Text>
            {hasPersonalizedSuggestions && (
              <HStack spacing={2} flexWrap="wrap">
                <Text fontSize="sm" color="gray.500">
                  Recommandations basées sur:
                </Text>
                {suggestions[0]?.recommendationReasons?.slice(0, 3).map((reason, idx) => (
                  <Badge key={idx} colorScheme="brand" fontSize="xs">
                    {reason}
                  </Badge>
                ))}
              </HStack>
            )}
          </VStack>

          {/* Dishes Grid */}
          {loading ? (
            <LoadingSpinner message="Chargement de vos suggestions..." />
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                {suggestions.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onViewDetails={() => handleViewDetails(dish)}
                  />
                ))}
              </SimpleGrid>

              {/* View All Button */}
              <HStack justify="center" pt={8}>
                <Button
                  as="a"
                  href="/a-la-carte"
                  size="lg"
                  colorScheme="brand"
                  rightIcon={<FiArrowRight />}
                  boxShadow="lg"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl'
                  }}
                  transition="all 0.2s"
                >
                  Voir toute la carte
                </Button>
              </HStack>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
