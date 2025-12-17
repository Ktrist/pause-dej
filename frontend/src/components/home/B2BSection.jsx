import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react'
import { FiUsers, FiTrendingDown, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const Feature = ({ icon, title, description }) => {
  const iconBg = useColorModeValue('brand.50', 'brand.900')

  return (
    <VStack spacing={4} align="start">
      <Box
        p={3}
        bg={iconBg}
        rounded="lg"
        color="brand.500"
      >
        <Icon as={icon} boxSize={6} />
      </Box>
      <VStack spacing={2} align="start">
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm" color="gray.600">
          {description}
        </Text>
      </VStack>
    </VStack>
  )
}

export default function B2BSection() {
  const navigate = useNavigate()
  const bgGradient = useColorModeValue(
    'linear(to-br, brand.50, purple.50)',
    'linear(to-br, brand.900, purple.900)'
  )
  const bgColor = useColorModeValue('white', 'gray.800')

  return (
    <Box
      bgGradient={bgGradient}
      py={20}
    >
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl">
              Une solution déjeuner pour vos équipes
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              Offrez à vos collaborateurs des déjeuners de qualité livrés au bureau.
              Simplifié, économique, et apprécié par tous.
            </Text>
          </VStack>

          {/* Features Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            <Feature
              icon={FiUsers}
              title="Gestion d'équipe"
              description="Budget par employé, commandes groupées, et suivi simplifié"
            />
            <Feature
              icon={FiTrendingDown}
              title="Tarifs dégressifs"
              description="Plus vous commandez, plus vous économisez sur vos repas"
            />
            <Feature
              icon={FiClock}
              title="Gain de temps"
              description="Fini les courses et la préparation, concentrez-vous sur l'essentiel"
            />
            <Feature
              icon={FiCheckCircle}
              title="Facturation unique"
              description="Une seule facture mensuelle pour toute l'entreprise"
            />
          </SimpleGrid>

          {/* CTA Section */}
          <Box
            bg={bgColor}
            p={10}
            rounded="xl"
            shadow="xl"
            textAlign="center"
          >
            <VStack spacing={6}>
              <VStack spacing={3}>
                <Heading size="lg">
                  Prêt à simplifier les déjeuners de votre équipe ?
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  Demandez un devis personnalisé ou contactez notre équipe commerciale
                </Text>
              </VStack>

              <HStack spacing={4} justify="center">
                <Button
                  size="lg"
                  colorScheme="brand"
                  rightIcon={<FiArrowRight />}
                  px={8}
                  borderRadius="12px"
                  onClick={() => navigate('/b2b')}
                >
                  Demander un devis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="brand"
                  px={8}
                  borderRadius="12px"
                  borderWidth="1px"
                  onClick={() => navigate('/b2b')}
                >
                  En savoir plus
                </Button>
              </HStack>

              <Text fontSize="sm" color="gray.500">
                ✓ Sans engagement  ✓ Réponse sous 24h  ✓ Offre sur mesure
              </Text>
            </VStack>
          </Box>

          {/* Social Proof */}
          <VStack spacing={4} textAlign="center">
            <Text fontSize="sm" fontWeight="medium" color="gray.500" textTransform="uppercase">
              Ils nous font déjà confiance
            </Text>
            <HStack spacing={8} justify="center" flexWrap="wrap">
              <Text fontSize="lg" fontWeight="bold" color="gray.400">Startup Lab</Text>
              <Text fontSize="lg" fontWeight="bold" color="gray.400">TechCorp</Text>
              <Text fontSize="lg" fontWeight="bold" color="gray.400">Creative Agency</Text>
              <Text fontSize="lg" fontWeight="bold" color="gray.400">Digital Solutions</Text>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
