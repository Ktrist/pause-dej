import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { APP_NAME, APP_TAGLINE } from '../../config'

export default function HomePage() {
  return (
    <Box>
      <Box bgGradient="linear(to-r, brand.500, primary.500)" color="white" py={20} textAlign="center">
        <Container maxW="container.xl">
          <VStack spacing={6}>
            <Heading as="h1" size="3xl" fontWeight="800">
              {APP_NAME}
            </Heading>
            <Text fontSize="2xl">{APP_TAGLINE}</Text>
            <Text fontSize="lg">
              Des plats frais et savoureux, livrés en 30 minutes
            </Text>
            <Button size="lg" bg="white" color="brand.600" _hover={{ transform: 'scale(1.05)' }}>
              Commander maintenant
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}
