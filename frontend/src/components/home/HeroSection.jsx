import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Image,
  useBreakpointValue
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiClock, FiMapPin, FiAward } from 'react-icons/fi'
import heroImage from '../../assets/hero.png'

export default function HeroSection() {
  const isMobile = useBreakpointValue({ base: true, lg: false })

  return (
    <Box
      bg="background.main"
      minH={{ base: '600px', lg: '700px' }}
      position="relative"
      overflow="hidden"
    >
      <Container maxW="container.xl" h="full">
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={0}
          alignItems="center"
          minH={{ base: '600px', lg: '700px' }}
        >
          {/* Left Side - Text Content */}
          <VStack
            align={{ base: 'center', lg: 'start' }}
            spacing={6}
            py={{ base: 12, lg: 0 }}
            pr={{ base: 0, lg: 12 }}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            {/* Badge */}
            <HStack
              bg="primary.50"
              color="primary.600"
              px={4}
              py={2}
              borderRadius="full"
              spacing={2}
            >
              <FiClock />
              <Text fontSize="sm" fontWeight="semibold">
                Livraison 7h-9h • Commandez avant minuit
              </Text>
            </HStack>

            {/* Main Headline */}
            <Heading
              as="h1"
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="extrabold"
              color="primary.500"
              lineHeight="1.1"
              letterSpacing="-0.02em"
            >
              LE MEILLEUR D'ANNECY,{' '}
              <Box as="span" color="brand.500">
                LIVRÉ CHAUD
              </Box>{' '}
              AU BUREAU.
            </Heading>

            {/* Subtitle */}
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="text.secondary"
              fontWeight="medium"
              maxW="500px"
            >
              Cuisiné maison ce matin avec des produits locaux.{' '}
              <Box as="span" fontWeight="bold" color="primary.600">
                Zéro industriel.
              </Box>
            </Text>

            {/* USPs */}
            <VStack align={{ base: 'center', lg: 'start' }} spacing={3} pt={2}>
              <HStack spacing={3} color="text.primary">
                <Box
                  bg="brand.100"
                  p={2}
                  borderRadius="lg"
                  color="brand.600"
                >
                  <FiMapPin size={18} />
                </Box>
                <Text fontSize="sm" fontWeight="medium">
                  Produits 100% locaux & savoyards
                </Text>
              </HStack>
              <HStack spacing={3} color="text.primary">
                <Box
                  bg="brand.100"
                  p={2}
                  borderRadius="lg"
                  color="brand.600"
                >
                  <FiAward size={18} />
                </Box>
                <Text fontSize="sm" fontWeight="medium">
                  Cuisinés le matin même par nos chefs
                </Text>
              </HStack>
            </VStack>

            {/* CTA Button */}
            <HStack spacing={4} pt={4} flexWrap="wrap" justify={{ base: 'center', lg: 'start' }}>
              <Button
                as={RouterLink}
                to="/catalogue"
                size="lg"
                bg="brand.500"
                color="white"
                _hover={{
                  bg: 'brand.600',
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl'
                }}
                transition="all 0.2s"
                px={8}
                py={7}
                fontSize="md"
                fontWeight="bold"
                borderRadius="12px"
              >
                VOIR LE MENU DU JOUR
              </Button>
              <Button
                as={RouterLink}
                to="/how-it-works"
                size="lg"
                variant="outline"
                borderColor="primary.500"
                color="primary.500"
                _hover={{
                  bg: 'primary.50'
                }}
                px={8}
                py={7}
                fontSize="md"
                fontWeight="semibold"
                borderRadius="12px"
              >
                Comment ça marche ?
              </Button>
            </HStack>
          </VStack>

          {/* Right Side - Hero Image */}
          <Box
            position="relative"
            h={{ base: '400px', lg: '100%' }}
            minH={{ base: '400px', lg: '700px' }}
            display={{ base: 'none', lg: 'block' }}
          >
            <Box
              position="absolute"
              top="50%"
              right="-10%"
              transform="translateY(-50%)"
              width="120%"
              height="85%"
              borderRadius="32px"
              overflow="hidden"
              boxShadow="2xl"
            >
              <Image
                src={heroImage}
                alt="Pause Dej' - Repas frais livrés à Annecy"
                w="full"
                h="full"
                objectFit="cover"
                objectPosition="center"
              />
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  )
}
