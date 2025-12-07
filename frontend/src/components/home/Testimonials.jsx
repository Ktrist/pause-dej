import { Box, Container, Heading, Text, VStack, SimpleGrid, Avatar, HStack, Icon } from '@chakra-ui/react'
import { testimonials } from '../../data/mockData'
import { FiStar } from 'react-icons/fi'

export default function Testimonials() {
  return (
    <Box py={{ base: 16, md: 20 }} bg="gray.50">
      <Container maxW="container.xl">
        <VStack spacing={12}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h2"
              size={{ base: 'xl', md: '2xl' }}
              color="gray.800"
            >
              Ils nous font confiance
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.600"
              maxW="2xl"
            >
              Découvrez ce que disent nos clients satisfaits
            </Text>
          </VStack>

          {/* Testimonials Grid */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            {testimonials.map((testimonial) => (
              <Box
                key={testimonial.id}
                bg="white"
                p={8}
                borderRadius="xl"
                boxShadow="md"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'xl'
                }}
              >
                <VStack spacing={4} align="start">
                  {/* Rating */}
                  <HStack spacing={1}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Icon key={i} as={FiStar} color="yellow.400" fill="yellow.400" />
                    ))}
                  </HStack>

                  {/* Comment */}
                  <Text color="gray.700" fontSize="sm" lineHeight="tall">
                    "{testimonial.comment}"
                  </Text>

                  {/* Author */}
                  <HStack spacing={3} pt={2}>
                    <Avatar
                      size="md"
                      name={testimonial.name}
                      src={testimonial.avatar}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600" fontSize="sm" color="gray.800">
                        {testimonial.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {testimonial.role} - {testimonial.company}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
