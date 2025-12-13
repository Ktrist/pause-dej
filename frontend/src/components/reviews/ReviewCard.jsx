import { Box, VStack, HStack, Text, Badge, Icon, IconButton, Avatar, Image, SimpleGrid } from '@chakra-ui/react'
import { FiThumbsUp, FiThumbsDown, FiCheckCircle } from 'react-icons/fi'
import { StarRating } from './StarRating'
import { useState, useEffect } from 'react'
import { useReviewVote } from '../../hooks/useReviews'
import { useAuth } from '../../context/AuthContext'

export default function ReviewCard({ review }) {
  const { user } = useAuth()
  const { voteOnReview, getUserVote } = useReviewVote()
  const [userVote, setUserVote] = useState(null)

  useEffect(() => {
    const loadUserVote = async () => {
      if (user) {
        const vote = await getUserVote(review.id)
        setUserVote(vote)
      }
    }
    loadUserVote()
  }, [user, review.id])

  const handleVote = async (voteType) => {
    if (!user) return

    await voteOnReview(review.id, voteType)

    // Update local state
    if (userVote === voteType) {
      setUserVote(null)
    } else {
      setUserVote(voteType)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between" align="start">
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={review.user?.user_metadata?.full_name || review.user?.email}
              bg="brand.500"
            />
            <VStack align="start" spacing={0}>
              <HStack spacing={2}>
                <Text fontWeight="600" fontSize="sm">
                  {review.user?.user_metadata?.full_name || 'Utilisateur'}
                </Text>
                {review.is_verified_purchase && (
                  <HStack spacing={1}>
                    <Icon as={FiCheckCircle} color="green.500" boxSize={3} />
                    <Text fontSize="xs" color="green.600" fontWeight="500">
                      Achat vérifié
                    </Text>
                  </HStack>
                )}
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {formatDate(review.created_at)}
              </Text>
            </VStack>
          </HStack>
          <StarRating rating={review.rating} size="sm" />
        </HStack>

        {/* Title */}
        {review.title && (
          <Text fontWeight="600" fontSize="md" color="gray.800">
            {review.title}
          </Text>
        )}

        {/* Comment */}
        {review.comment && (
          <Text fontSize="sm" color="gray.700" lineHeight="tall">
            {review.comment}
          </Text>
        )}

        {/* Photos */}
        {review.photos && review.photos.length > 0 && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
            {review.photos.map((photo, index) => (
              <Image
                key={index}
                src={photo}
                alt={`Review photo ${index + 1}`}
                borderRadius="md"
                objectFit="cover"
                h="80px"
                w="full"
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
              />
            ))}
          </SimpleGrid>
        )}

        {/* Helpful Votes */}
        <HStack spacing={4} pt={2} borderTop="1px" borderColor="gray.100">
          <Text fontSize="sm" color="gray.600">
            Cette avis vous a été utile ?
          </Text>
          <HStack spacing={2}>
            <IconButton
              icon={<Icon as={FiThumbsUp} />}
              size="sm"
              variant={userVote === 'helpful' ? 'solid' : 'ghost'}
              colorScheme={userVote === 'helpful' ? 'green' : 'gray'}
              onClick={() => handleVote('helpful')}
              isDisabled={!user}
              aria-label="Utile"
            />
            <Text fontSize="sm" fontWeight="500" color="gray.700">
              {review.helpful_count}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <IconButton
              icon={<Icon as={FiThumbsDown} />}
              size="sm"
              variant={userVote === 'not_helpful' ? 'solid' : 'ghost'}
              colorScheme={userVote === 'not_helpful' ? 'red' : 'gray'}
              onClick={() => handleVote('not_helpful')}
              isDisabled={!user}
              aria-label="Pas utile"
            />
            <Text fontSize="sm" fontWeight="500" color="gray.700">
              {review.not_helpful_count}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}
