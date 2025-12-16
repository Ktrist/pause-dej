import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  List,
  ListItem,
  ListIcon,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Image,
  Stack,
  Flex
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import {
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiDollarSign,
  FiFileText,
  FiBarChart2,
  FiCreditCard,
  FiPhone
} from 'react-icons/fi'
import { usePricingTiers } from '../hooks/usePricingTiers'

const FeatureCard = ({ icon, title, description }) => {
  const bg = useColorModeValue('white', 'gray.800')

  return (
    <Card bg={bg} shadow="md" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s">
      <CardBody>
        <VStack align="start" spacing={4}>
          <Box p={3} bg="brand.50" rounded="lg">
            <Icon as={icon} boxSize={8} color="brand.600" />
          </Box>
          <Heading size="md">{title}</Heading>
          <Text color="gray.600">{description}</Text>
        </VStack>
      </CardBody>
    </Card>
  )
}

const PricingTierCard = ({ tier, isPopular }) => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = isPopular ? 'brand.500' : 'gray.200'
  const navigate = useNavigate()

  const features = Array.isArray(tier.features) ? tier.features :
                   tier.features ? JSON.parse(tier.features) : []

  return (
    <Card
      bg={bg}
      borderWidth={isPopular ? 3 : 1}
      borderColor={borderColor}
      shadow="lg"
      position="relative"
      _hover={{ shadow: '2xl', transform: 'scale(1.02)' }}
      transition="all 0.3s"
    >
      {isPopular && (
        <Badge
          colorScheme="brand"
          position="absolute"
          top={-3}
          left="50%"
          transform="translateX(-50%)"
          px={4}
          py={1}
          fontSize="sm"
        >
          Populaire
        </Badge>
      )}
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>{tier.tier_name}</Heading>
            <Text color="gray.600">
              {tier.min_employees} {tier.max_employees ? `- ${tier.max_employees}` : '+'} employés
            </Text>
          </Box>

          <Divider />

          <Box>
            <HStack align="baseline">
              <Heading size="2xl" color="brand.600">
                {tier.discount_percentage}%
              </Heading>
              <Text color="gray.600">de réduction</Text>
            </HStack>
            {tier.monthly_fee > 0 && (
              <Text fontSize="sm" color="gray.500" mt={1}>
                + {tier.monthly_fee}€/mois
              </Text>
            )}
            {tier.delivery_fee === 0 ? (
              <Text fontSize="sm" color="green.600" fontWeight="600" mt={1}>
                Livraison gratuite
              </Text>
            ) : (
              <Text fontSize="sm" color="gray.500" mt={1}>
                Livraison: {tier.delivery_fee}€/commande
              </Text>
            )}
          </Box>

          <Divider />

          <List spacing={3}>
            {features.map((feature, idx) => (
              <ListItem key={idx} fontSize="sm">
                <ListIcon as={FiCheckCircle} color="green.500" />
                {feature}
              </ListItem>
            ))}
          </List>

          <Button
            colorScheme="brand"
            size="lg"
            onClick={() => navigate('/b2b/quote')}
            variant={isPopular ? 'solid' : 'outline'}
          >
            Demander un devis
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

const StatCard = ({ label, value, helpText, icon }) => {
  const bg = useColorModeValue('white', 'gray.800')

  return (
    <Card bg={bg} shadow="md">
      <CardBody>
        <Stat>
          <HStack justify="space-between" mb={2}>
            <StatLabel fontSize="sm" color="gray.600">{label}</StatLabel>
            <Icon as={icon} boxSize={6} color="brand.500" />
          </HStack>
          <StatNumber fontSize="3xl" color="brand.600">{value}</StatNumber>
          <StatHelpText fontSize="sm">{helpText}</StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  )
}

export default function B2BLandingPage() {
  const navigate = useNavigate()
  const { pricingTiers, loading } = usePricingTiers()
  const bg = useColorModeValue('gray.50', 'gray.900')
  const heroGradient = useColorModeValue(
    'linear(to-r, brand.500, brand.600)',
    'linear(to-r, brand.600, brand.700)'
  )

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={bg} py={20}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">
            <VStack align="start" spacing={6}>
              <Badge colorScheme="brand" fontSize="md" px={3} py={1}>
                Solution B2B
              </Badge>
              <Heading size="2xl" lineHeight="1.2">
                Simplifiez les repas de vos équipes avec{' '}
                <Text as="span" color="brand.600">Pause Dej'</Text>
              </Heading>
              <Text fontSize="xl" color="gray.600">
                Livraison de repas frais pour entreprises. Gestion des budgets,
                facturation mensuelle, et suivi en temps réel.
              </Text>
              <HStack spacing={4}>
                <Button
                  size="lg"
                  colorScheme="brand"
                  onClick={() => navigate('/b2b/quote')}
                  leftIcon={<FiFileText />}
                >
                  Demander un devis gratuit
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  leftIcon={<FiPhone />}
                >
                  Nous contacter
                </Button>
              </HStack>
            </VStack>

            <Box>
              <SimpleGrid columns={2} spacing={4}>
                <StatCard
                  label="Temps gagné"
                  value="2h/jour"
                  helpText="Par équipe"
                  icon={FiClock}
                />
                <StatCard
                  label="Satisfaction"
                  value="98%"
                  helpText="Clients satisfaits"
                  icon={FiCheckCircle}
                />
                <StatCard
                  label="Économies"
                  value="Jusqu'à 15%"
                  helpText="Sur vos repas"
                  icon={FiDollarSign}
                />
                <StatCard
                  label="Entreprises"
                  value="100+"
                  helpText="Nous font confiance"
                  icon={FiUsers}
                />
              </SimpleGrid>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center" maxW="3xl">
            <Heading size="xl">Pourquoi choisir Pause Dej' pour votre entreprise ?</Heading>
            <Text fontSize="lg" color="gray.600">
              Une solution complète pour gérer les repas de vos équipes facilement
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            <FeatureCard
              icon={FiUsers}
              title="Gestion d'équipe simplifiée"
              description="Ajoutez vos employés, définissez des budgets individuels et suivez les dépenses en temps réel."
            />
            <FeatureCard
              icon={FiDollarSign}
              title="Contrôle budgétaire"
              description="Fixez des plafonds mensuels par employé ou par département. Alertes automatiques."
            />
            <FeatureCard
              icon={FiFileText}
              title="Facturation mensuelle"
              description="Une seule facture consolidée par mois avec le détail de toutes les commandes."
            />
            <FeatureCard
              icon={FiBarChart2}
              title="Analytics avancés"
              description="Tableaux de bord pour suivre les dépenses par département, employé ou période."
            />
            <FeatureCard
              icon={FiCreditCard}
              title="Paiement simplifié"
              description="Les employés commandent sans sortir leur carte. Tout est facturé à l'entreprise."
            />
            <FeatureCard
              icon={FiShield}
              title="Support dédié"
              description="Un account manager dédié pour vous accompagner et répondre à vos besoins."
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Pricing Section */}
      <Box bg={bg} py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Heading size="xl">Nos offres entreprise</Heading>
              <Text fontSize="lg" color="gray.600">
                Des tarifs dégressifs adaptés à la taille de votre équipe
              </Text>
            </VStack>

            {loading ? (
              <Text>Chargement des offres...</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                {pricingTiers.map((tier, idx) => (
                  <PricingTierCard
                    key={tier.id}
                    tier={tier}
                    isPopular={idx === 1} // Middle tier is popular
                  />
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </Container>
      </Box>

      {/* How it works */}
      <Container maxW="container.xl" py={20}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center" maxW="3xl">
            <Heading size="xl">Comment ça marche ?</Heading>
            <Text fontSize="lg" color="gray.600">
              Commencez en quelques étapes simples
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            {[
              {
                step: '1',
                title: 'Demande de devis',
                description: 'Remplissez notre formulaire en 2 minutes'
              },
              {
                step: '2',
                title: 'Configuration',
                description: 'Nous créons votre compte et ajoutons vos employés'
              },
              {
                step: '3',
                title: 'Commandes',
                description: 'Vos équipes commandent en toute autonomie'
              },
              {
                step: '4',
                title: 'Facturation',
                description: 'Recevez une facture mensuelle consolidée'
              }
            ].map((item) => (
              <VStack key={item.step} spacing={4} textAlign="center">
                <Flex
                  w={16}
                  h={16}
                  rounded="full"
                  bg="brand.500"
                  color="white"
                  align="center"
                  justify="center"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  {item.step}
                </Flex>
                <Heading size="md">{item.title}</Heading>
                <Text color="gray.600">{item.description}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box bgGradient={heroGradient} color="white" py={20}>
        <Container maxW="container.md">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl">
              Prêt à simplifier les repas de votre équipe ?
            </Heading>
            <Text fontSize="lg">
              Demandez un devis gratuit et sans engagement.
              Un de nos experts vous contactera sous 24h.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color="brand.600"
                _hover={{ bg: 'gray.100' }}
                onClick={() => navigate('/b2b/quote')}
                leftIcon={<FiFileText />}
              >
                Demander un devis
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/contact')}
              >
                Planifier une démo
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* FAQ or Testimonials could go here */}
    </Box>
  )
}
