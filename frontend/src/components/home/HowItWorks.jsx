import { Box, Container, Heading, Text, VStack, SimpleGrid, Flex } from '@chakra-ui/react'
import { howItWorksSteps } from '../../data/mockData'

export default function HowItWorks() {
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
              Comment ça marche ?
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.600"
              maxW="2xl"
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
                bg="white"
                borderRadius="xl"
                boxShadow="md"
                position="relative"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'xl'
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
                <Text fontSize="6xl" role="img" aria-label={step.title}>
                  {step.icon}
                </Text>

                {/* Content */}
                <VStack spacing={2} textAlign="center">
                  <Heading as="h3" size="md" color="gray.800">
                    {step.title}
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    {step.description}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
