import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Badge,
  Button,
  List,
  ListItem,
  ListIcon,
  useColorModeValue
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import {
  FiSearch,
  FiShoppingCart,
  FiClock,
  FiTruck,
  FiCheck,
  FiStar,
  FiHeart,
  FiRefreshCw
} from 'react-icons/fi'

const StepCard = ({ number, icon, title, description, details, badge }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const numberBg = useColorModeValue('brand.50', 'brand.900')

  return (
    <Card bg={bgColor} h="full" position="relative">
      <CardBody>
        <VStack align="start" spacing={4}>
          <HStack spacing={4}>
            <Box
              p={3}
              bg={numberBg}
              borderRadius="full"
              w="60px"
              h="60px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                {number}
              </Text>
            </Box>
            <Icon as={icon} boxSize={8} color="brand.600" />
          </HStack>
          <Heading size="md">{title}</Heading>
          <Text color="gray.600">{description}</Text>
          {details && (
            <List spacing={2}>
              {details.map((detail, index) => (
                <ListItem key={index} fontSize="sm" color="gray.600">
                  <ListIcon as={FiCheck} color="green.500" />
                  {detail}
                </ListItem>
              ))}
            </List>
          )}
          {badge && (
            <Box
              bg="purple.50"
              p={3}
              rounded="lg"
              border="1px solid"
              borderColor="purple.200"
              w="full"
              mt={2}
            >
              <HStack spacing={2} mb={1}>
                <Badge colorScheme="purple" fontSize="xs">
                  {badge.text}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="purple.800" fontWeight="medium">
                {badge.info}
              </Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}

const FeatureCard = ({ icon, title, description }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const iconBg = useColorModeValue('brand.50', 'brand.900')

  return (
    <Card bg={bgColor}>
      <CardBody>
        <VStack align="center" spacing={4} textAlign="center">
          <Box p={4} bg={iconBg} borderRadius="full">
            <Icon as={icon} boxSize={8} color="brand.600" />
          </Box>
          <Heading size="sm">{title}</Heading>
          <Text color="gray.600" fontSize="sm">
            {description}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default function HowItWorksPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box bg={bgColor} minH="100vh" py={16}>
      <Container maxW="container.xl">
        <VStack spacing={16} align="stretch">
          {/* Hero Section */}
          <VStack spacing={6} textAlign="center" maxW="3xl" mx="auto">
            <Badge colorScheme="brand" fontSize="md" px={3} py={1}>
              Simple et Rapide
            </Badge>
            <Heading size="2xl">
              Comment ça marche ?
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Commandez des plats frais et savoureux en 4 étapes simples. Livraison rapide
              à Annecy et ses environs. Une expérience culinaire pensée pour vous simplifier
              la vie au quotidien.
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/catalogue"
                colorScheme="brand"
                size="lg"
                borderRadius="12px"
              >
                Voir la carte
              </Button>
              <Button
                as={RouterLink}
                to="/contact"
                variant="outline"
                size="lg"
                borderColor="primary.500"
                color="primary.500"
                borderWidth="1px"
                borderRadius="12px"
                _hover={{
                  bg: 'primary.50'
                }}
              >
                Nous contacter
              </Button>
            </HStack>
          </VStack>
          {/* Main Steps */}
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center" maxW="2xl" mx="auto">
              <Heading size="xl">Le processus de commande</Heading>
              <Text color="gray.600" fontSize="lg">
                De la sélection à la livraison, tout est pensé pour votre confort
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              <StepCard
                number="1"
                icon={FiSearch}
                title="Parcourez la carte"
                description="Découvrez notre sélection de plats frais, préparés chaque jour par nos chefs."
                details={[
                  'Filtres par catégorie et préférences alimentaires',
                  'Photos et descriptions détaillées',
                  'Informations nutritionnelles'
                ]}
              />
              <StepCard
                number="2"
                icon={FiShoppingCart}
                title="Composez votre panier"
                description="Sélectionnez vos plats préférés et ajoutez-les à votre panier en un clic."
                details={[
                  'Choix des quantités',
                  'Codes promo disponibles',
                  'Calcul automatique du total'
                ]}
              />
              <StepCard
                number="3"
                icon={FiClock}
                title="Choisissez votre créneau"
                description="Sélectionnez la date de livraison qui vous convient."
                details={[
                  'Livraison du lundi au vendredi uniquement',
                  'Créneau de livraison entre 7h et 9h',
                  'Commandez avant minuit pour le lendemain'
                ]}
                badge={{ text: 'Bientôt', info: 'Créneaux de 30 min de 7h à 13h30' }}
              />
              <StepCard
                number="4"
                icon={FiTruck}
                title="Recevez votre commande"
                description="Votre repas arrive frais et prêt à déguster, à l'heure choisie."
                details={[
                  'Suivi en temps réel',
                  'Emballage isotherme',
                  'Livraison contactless disponible'
                ]}
              />
            </SimpleGrid>
          </VStack>

          {/* Features Section */}
          <Box bg={useColorModeValue('white', 'gray.800')} p={12} borderRadius="xl">
            <VStack spacing={8}>
              <VStack spacing={4} textAlign="center" maxW="2xl" mx="auto">
                <Heading size="xl">Pourquoi choisir Pause Dej' ?</Heading>
                <Text color="gray.600" fontSize="lg">
                  Une expérience culinaire pensée pour vous
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
                <FeatureCard
                  icon={FiStar}
                  title="Qualité Premium"
                  description="Ingrédients frais et locaux, cuisinés par des chefs passionnés"
                />
                <FeatureCard
                  icon={FiHeart}
                  title="Préférences Alimentaires"
                  description="Options végétariennes, vegan, sans gluten et sans lactose"
                />
                <FeatureCard
                  icon={FiRefreshCw}
                  title="Menu Renouvelé"
                  description="Nouveaux plats chaque semaine pour varier les plaisirs"
                />
                <FeatureCard
                  icon={FiCheck}
                  title="Satisfaction Garantie"
                  description="Service client réactif et remboursement si problème"
                />
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Zones de livraison */}
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center" maxW="2xl" mx="auto">
              <Heading size="xl">Zones de livraison</Heading>
              <Text color="gray.600" fontSize="lg">
                Nous livrons actuellement dans les zones suivantes
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
              <Card>
                <CardBody textAlign="center">
                  <VStack spacing={3}>
                    <Heading size="md" color="brand.600">
                      Annecy
                    </Heading>
                    <Text color="gray.600">74000</Text>
                    <Badge colorScheme="green">Livraison 3.50€</Badge>
                    <Text fontSize="sm" color="gray.500">
                      Gratuite dès 30€
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody textAlign="center">
                  <VStack spacing={3}>
                    <Heading size="md" color="brand.600">
                      Annecy-le-Vieux
                    </Heading>
                    <Text color="gray.600">74940</Text>
                    <Badge colorScheme="green">Livraison 3.50€</Badge>
                    <Text fontSize="sm" color="gray.500">
                      Gratuite dès 30€
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody textAlign="center">
                  <VStack spacing={3}>
                    <Heading size="md" color="brand.600">
                      Argonay
                    </Heading>
                    <Text color="gray.600">74370</Text>
                    <Badge colorScheme="blue">Livraison 4.00€</Badge>
                    <Text fontSize="sm" color="gray.500">
                      Gratuite dès 30€
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Text textAlign="center" color="gray.600">
              D'autres zones seront bientôt disponibles. Contactez-nous pour plus d'informations.
            </Text>
          </VStack>

          {/* CTA Section */}
          <Card bg="brand.50" borderColor="brand.200" borderWidth={2}>
            <CardBody>
              <VStack spacing={6} textAlign="center">
                <Heading as="h3" size="md">Prêt à commander ?</Heading>
                <Text fontSize="lg" color="gray.700">
                  Découvrez notre carte de plats frais et passez votre première commande
                </Text>
                <Button
                  as={RouterLink}
                  to="/catalogue"
                  colorScheme="brand"
                  size="lg"
                >
                  Voir la carte
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}
