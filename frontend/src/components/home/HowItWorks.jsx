import { Box, Container, Heading, Text, VStack, SimpleGrid, Flex, Badge, HStack, Icon } from '@chakra-ui/react'
import { FiShoppingCart, FiPackage, FiTruck } from 'react-icons/fi'
import { howItWorksSteps } from '../../data/mockData'

// Map icon names to icon components
const iconMap = {
  FiShoppingCart,
  FiPackage,
  FiTruck
}

export default function HowItWorks() {
  return (
    <Box py={{ base: 16, md: 20 }} bg="background.main">
      <Container maxW="container.xl">
        <VStack spacing={12}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h2"
              size={{ base: 'xl', md: '2xl' }}
              color="primary.500"
              fontWeight="extrabold"
            >
              Comment ça marche ?
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="text.secondary"
              maxW="2xl"
              fontWeight="medium"
            >
              Une expérience simple et rapide en 3 étapes
            </Text>
          </VStack>

          {/* Steps */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, md: 12 }} w="full">
            {howItWorksSteps.map((step, index) => (
              <VStack
                key={step.id}
                spacing={4}
                p={8}
                bg="background.card"
                borderRadius="12px"
                boxShadow="card"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'cardHover'
                }}
              >
                {/* Step Number */}
                <Flex
                  position="absolute"
                  top="-4"
                  left="8"
                  bg="brand.500"
                  color="white"
                  w="8"
                  h="8"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {index + 1}
                </Flex>

                {/* Icon */}
                <Box
                  p={4}
                  bg="brand.50"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={iconMap[step.icon]} boxSize={12} color="brand.600" />
                </Box>

                {/* Content */}
                <VStack spacing={2} textAlign="center">
                  <Heading as="h3" size="md" color="primary.500" fontWeight="bold">
                    {step.title}
                  </Heading>
                  <Text color="text.secondary" fontSize="sm" fontWeight="medium">
                    {step.description}
                  </Text>
                  {step.badge && (
                    <Box
                      bg="purple.50"
                      p={2}
                      rounded="lg"
                      border="1px solid"
                      borderColor="purple.200"
                      w="full"
                      mt={2}
                    >
                      <HStack spacing={1} justify="center" mb={1}>
                        <Badge colorScheme="purple" fontSize="2xs">
                          {step.badge.text}
                        </Badge>
                      </HStack>
                      <Text fontSize="2xs" color="purple.800" fontWeight="medium">
                        {step.badge.info}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
