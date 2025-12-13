import { HStack, Icon, Box } from '@chakra-ui/react'
import { FiStar } from 'react-icons/fi'

/**
 * Star Rating Display Component
 * Shows star rating (read-only or interactive)
 */
export function StarRating({ rating, maxRating = 5, size = 'md', showValue = false, color = 'yellow.500' }) {
  const sizes = {
    sm: 4,
    md: 5,
    lg: 6,
    xl: 7
  }

  const starSize = sizes[size] || sizes.md

  return (
    <HStack spacing={0.5}>
      {[...Array(maxRating)].map((_, index) => {
        const filled = index < Math.floor(rating)
        const partial = index < rating && index >= Math.floor(rating)
        const partialPercent = partial ? ((rating - Math.floor(rating)) * 100) : 0

        return (
          <Box key={index} position="relative" display="inline-block">
            {/* Empty star */}
            <Icon
              as={FiStar}
              boxSize={starSize}
              color="gray.300"
            />
            {/* Filled star (full or partial) */}
            {(filled || partial) && (
              <Box
                position="absolute"
                top={0}
                left={0}
                width={partial ? `${partialPercent}%` : '100%'}
                overflow="hidden"
              >
                <Icon
                  as={FiStar}
                  boxSize={starSize}
                  color={color}
                  fill={color}
                />
              </Box>
            )}
          </Box>
        )
      })}
      {showValue && rating > 0 && (
        <Box as="span" fontSize="sm" fontWeight="600" color="gray.700" ml={2}>
          {rating.toFixed(1)}
        </Box>
      )}
    </HStack>
  )
}

/**
 * Interactive Star Rating Component
 * Allows users to select a rating
 */
export function StarRatingInput({ rating, onRatingChange, maxRating = 5, size = 'lg', required = false }) {
  const sizes = {
    sm: 5,
    md: 6,
    lg: 8,
    xl: 10
  }

  const starSize = sizes[size] || sizes.lg

  return (
    <HStack spacing={1}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        const filled = starValue <= rating

        return (
          <Icon
            key={index}
            as={FiStar}
            boxSize={starSize}
            color={filled ? 'yellow.500' : 'gray.300'}
            fill={filled ? 'yellow.500' : 'none'}
            cursor="pointer"
            onClick={() => onRatingChange(starValue)}
            _hover={{
              transform: 'scale(1.1)',
              color: 'yellow.500',
              fill: 'yellow.500'
            }}
            transition="all 0.2s"
            aria-label={`Rate ${starValue} stars`}
          />
        )
      })}
      {required && rating === 0 && (
        <Box as="span" fontSize="xs" color="red.500" ml={2}>
          *
        </Box>
      )}
    </HStack>
  )
}

/**
 * Rating Distribution Bar
 * Shows percentage bar for rating distribution
 */
export function RatingBar({ rating, count, total, onClick }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <HStack
      spacing={3}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { bg: 'gray.50' } : {}}
      p={1}
      borderRadius="md"
      transition="background 0.2s"
    >
      <HStack spacing={1} minW="60px">
        <Icon as={FiStar} boxSize={3} color="yellow.500" fill="yellow.500" />
        <Box as="span" fontSize="sm" fontWeight="600">
          {rating}
        </Box>
      </HStack>
      <Box flex={1} position="relative" h="8px" bg="gray.200" borderRadius="full" overflow="hidden">
        <Box
          position="absolute"
          top={0}
          left={0}
          h="full"
          w={`${percentage}%`}
          bg="yellow.500"
          transition="width 0.3s"
        />
      </Box>
      <Box as="span" fontSize="sm" color="gray.600" minW="40px" textAlign="right">
        {count}
      </Box>
    </HStack>
  )
}
