import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  Collapse,
  useDisclosure
} from '@chakra-ui/react'
import { FiStar, FiEdit } from 'react-icons/fi'
import { StarRating, RatingBar } from './StarRating'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import { useDishReviews, useCanReview } from '../../hooks/useReviews'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ReviewsSection({ dishId, dishName }) {
  const { user } = useAuth()
  const { reviews, loading, stats, refresh } = useDishReviews(dishId)
  const { canReview, hasReviewed } = useCanReview(dishId)
  const { isOpen: isFormOpen, onToggle: onToggleForm } = useDisclosure()
  const [sortBy, setSortBy] = useState('recent')
  const [filterRating, setFilterRating] = useState(null)

  // Sort and filter reviews
  const sortedReviews = [...reviews]
    .filter(review => !filterRating || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'helpful':
          return b.helpful_count - a.helpful_count
        default:
          return 0
      }
    })

  if (loading) {
    return <LoadingSpinner message="Chargement des avis..." />
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Rating Summary */}
      <Box p={6} bg="gray.50" borderRadius="lg">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Overall Rating */}
          <VStack spacing={3}>
            <HStack spacing={4} align="end">
              <Text fontSize="5xl" fontWeight="bold" color="gray.800">
                {stats.averageRating.toFixed(1)}
              </Text>
              <VStack align="start" spacing={0}>
                <StarRating rating={stats.averageRating} size="lg" />
                <Text fontSize="sm" color="gray.600">
                  {stats.totalReviews} avis
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Rating Distribution */}
          <VStack spacing={2} align="stretch">
            {[5, 4, 3, 2, 1].map((rating) => (
              <RatingBar
                key={rating}
                rating={rating}
                count={stats.ratingDistribution[rating]}
                total={stats.totalReviews}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
              />
            ))}
          </VStack>
        </SimpleGrid>
      </Box>

      {/* Write Review Button */}
      {user && canReview && !hasReviewed && (
        <Button
          leftIcon={<FiEdit />}
          colorScheme="brand"
          onClick={onToggleForm}
          size="lg"
        >
          {isFormOpen ? 'Annuler' : 'Écrire un avis'}
        </Button>
      )}

      {/* Review Form */}
      <Collapse in={isFormOpen} animateOpacity>
        <ReviewForm
          dishId={dishId}
          dishName={dishName}
          onSuccess={() => {
            onToggleForm()
            refresh()
          }}
          onCancel={onToggleForm}
        />
      </Collapse>

      {/* Already Reviewed Message */}
      {user && hasReviewed && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          Vous avez déjà laissé un avis pour ce plat. Retrouvez-le dans votre compte.
        </Alert>
      )}

      {/* Must Order First Message */}
      {user && !canReview && !hasReviewed && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          Commandez et recevez ce plat pour pouvoir laisser un avis
        </Alert>
      )}

      {/* Login Required Message */}
      {!user && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          Connectez-vous pour laisser un avis
        </Alert>
      )}

      <Divider />

      {/* Reviews List */}
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="600">
            {sortedReviews.length} avis
            {filterRating && ` avec ${filterRating} étoile${filterRating > 1 ? 's' : ''}`}
          </Text>
          <HStack spacing={3}>
            {filterRating && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFilterRating(null)}
              >
                Tous les avis
              </Button>
            )}
            <Select
              size="sm"
              w="auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="highest">Note la plus haute</option>
              <option value="lowest">Note la plus basse</option>
              <option value="helpful">Les plus utiles</option>
            </Select>
          </HStack>
        </HStack>

        {sortedReviews.length === 0 ? (
          <Box py={12} textAlign="center">
            <Text fontSize="4xl" mb={3}>⭐</Text>
            <Text fontSize="lg" fontWeight="600" color="gray.600" mb={2}>
              {filterRating ? 'Aucun avis avec ce filtre' : 'Aucun avis pour le moment'}
            </Text>
            <Text color="gray.500">
              {filterRating
                ? 'Essayez un autre filtre'
                : 'Soyez le premier à donner votre avis sur ce plat'}
            </Text>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {sortedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}
