import { Box, Container, Heading, Text, Button, VStack, HStack, Badge } from '@chakra-ui/react'
import { APP_NAME, APP_TAGLINE } from '../../config'
import { FiClock, FiCheck } from 'react-icons/fi'

export default function HeroSection() {
  return (
    <Box
      bgGradient="linear(to-br, brand.500, primary.500)"
      color="white"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        width="400px"
        height="400px"
        borderRadius="full"
        bg="whiteAlpha.100"
        filter="blur(80px)"
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={8} textAlign="center">
          {/* Badge */}
          <Badge
            colorScheme="whiteAlpha"
            bg="whiteAlpha.300"
            color="white"
            px={4}
            py={2}
            borderRadius="full"
            fontSize="sm"
            fontWeight="600"
          >
            <HStack spacing={2}>
              <FiClock />
              <Text>Livraison en 30 minutes chrono</Text>
            </HStack>
          </Badge>

          {/* Main Heading */}
          <VStack spacing={4}>
            <Heading
              as="h1"
              size={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="800"
              lineHeight="1.2"
            >
              {APP_NAME}
            </Heading>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="600" color="whiteAlpha.900">
              {APP_TAGLINE}
            </Text>
          </VStack>

          {/* Description */}
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            maxW="2xl"
            color="whiteAlpha.900"
          >
            Des plats frais et savoureux préparés par nos chefs,
            livrés directement à votre bureau ou chez vous.
          </Text>

          {/* USPs */}
          <HStack
            spacing={{ base: 4, md: 8 }}
            flexWrap="wrap"
            justify="center"
            pt={2}
          >
            {[
              'Produits frais',
              'Cuisine maison',
              'Livraison rapide',
              'Prix juste'
            ].map((item) => (
              <HStack key={item} spacing={2} color="whiteAlpha.900">
                <FiCheck />
                <Text fontSize="sm" fontWeight="500">{item}</Text>
              </HStack>
            ))}
          </HStack>

          {/* CTA Buttons */}
          <HStack spacing={4} pt={4}>
            <Button
              size="lg"
              bg="white"
              color="brand.600"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'xl'
              }}
              transition="all 0.2s"
              px={8}
              fontWeight="700"
            >
              Commander maintenant
            </Button>
            <Button
              size="lg"
              variant="outline"
              borderColor="white"
              color="white"
              _hover={{
                bg: 'whiteAlpha.200'
              }}
              px={8}
            >
              Voir le menu
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}
