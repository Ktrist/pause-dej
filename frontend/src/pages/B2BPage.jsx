import { useState } from 'react'
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
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useColorModeValue,
  Icon,
  List,
  ListItem,
  ListIcon,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import {
  FiCheck,
  FiUsers,
  FiTrendingDown,
  FiCalendar,
  FiPackage,
  FiClock
} from 'react-icons/fi'
import { TbCurrencyEuro } from 'react-icons/tb'
import { useB2BQuotes, useB2BPackages } from '../hooks/useB2BQuotes'

const FeatureCard = ({ icon, title, description }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const iconBg = useColorModeValue('brand.50', 'brand.900')

  return (
    <Card bg={bgColor} h="full">
      <CardBody>
        <VStack align="start" spacing={4}>
          <Box p={3} bg={iconBg} borderRadius="lg">
            <Icon as={icon} boxSize={8} color="brand.600" />
          </Box>
          <Heading size="md">{title}</Heading>
          <Text color="gray.600">{description}</Text>
        </VStack>
      </CardBody>
    </Card>
  )
}

const PackageCard = ({ pkg }) => {
  const bgColor = useColorModeValue('white', 'gray.800')

  return (
    <Card bg={bgColor} borderWidth={2} borderColor="brand.200">
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Heading size="md">{pkg.name}</Heading>
          <Text color="gray.600">{pkg.description}</Text>
          <HStack>
            <Text fontSize="3xl" fontWeight="bold" color="brand.600">
              {pkg.price_per_person.toFixed(2)}€
            </Text>
            <Text color="gray.600">/personne</Text>
          </HStack>
          {pkg.min_people && (
            <Text fontSize="sm" color="gray.600">
              Min. {pkg.min_people} personnes
              {pkg.max_people && ` - Max. ${pkg.max_people} personnes`}
            </Text>
          )}
          {pkg.items_included && (
            <List spacing={2}>
              {Object.values(pkg.items_included).map((item, index) => (
                <ListItem key={index} fontSize="sm">
                  <ListIcon as={FiCheck} color="green.500" />
                  {item}
                </ListItem>
              ))}
            </List>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}

export default function B2BPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const toast = useToast()
  const { createQuote } = useB2BQuotes()
  const { packages } = useB2BPackages()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company_size: '',
    estimated_monthly_orders: '',
    budget_range: '',
    delivery_frequency: '',
    special_requirements: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await createQuote(formData)

    if (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer la demande de devis. Veuillez réessayer.",
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } else {
      toast({
        title: 'Demande envoyée !',
        description: 'Nous vous contacterons sous 24h pour discuter de vos besoins.',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      setFormData({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        company_size: '',
        estimated_monthly_orders: '',
        budget_range: '',
        delivery_frequency: '',
        special_requirements: ''
      })
      onClose()
    }

    setIsSubmitting(false)
  }

  return (
    <Box bg={bgColor} minH="100vh" py={16}>
      <Container maxW="container.xl">
        <VStack spacing={16} align="stretch">
          {/* Hero Section */}
          <VStack spacing={6} textAlign="center" maxW="3xl" mx="auto">
            <Badge colorScheme="brand" fontSize="md" px={3} py={1}>
              Solutions B2B
            </Badge>
            <Heading size="2xl">
              Des repas de qualité pour votre équipe, livrés chaque jour
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Simplifiez la gestion des repas de votre entreprise avec nos solutions sur mesure.
              Économisez du temps et de l'argent tout en offrant une expérience culinaire
              exceptionnelle à vos collaborateurs.
            </Text>
            <HStack spacing={4}>
              <Button
                colorScheme="brand"
                size="lg"
                onClick={onOpen}
                borderRadius="12px"
              >
                Demander un devis
              </Button>
              <Button
                variant="outline"
                size="lg"
                as="a"
                href="#packages"
                borderColor="primary.500"
                color="primary.500"
                borderWidth="1px"
                borderRadius="12px"
                _hover={{
                  bg: 'primary.50'
                }}
              >
                Voir nos formules
              </Button>
            </HStack>
          </VStack>

          {/* Features */}
          <Box>
            <VStack spacing={8}>
              <Heading size="xl" textAlign="center">
                Pourquoi choisir Pause Dej' pour votre entreprise ?
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <FeatureCard
                  icon={TbCurrencyEuro}
                  title="Tarifs Préférentiels"
                  description="Bénéficiez de remises volume et de tarifs négociés pour votre entreprise."
                />
                <FeatureCard
                  icon={FiUsers}
                  title="Gestion d'Équipe"
                  description="Gérez facilement les commandes et budgets de tous vos collaborateurs."
                />
                <FeatureCard
                  icon={FiCalendar}
                  title="Livraisons Planifiées"
                  description="Programmez vos livraisons à l'avance selon votre planning d'équipe."
                />
                <FeatureCard
                  icon={FiPackage}
                  title="Formules Personnalisées"
                  description="Des offres sur mesure adaptées aux besoins de votre entreprise."
                />
                <FeatureCard
                  icon={FiTrendingDown}
                  title="Facturation Simplifiée"
                  description="Une seule facture mensuelle, paiement différé possible (NET 30)."
                />
                <FeatureCard
                  icon={FiClock}
                  title="Gain de Temps"
                  description="Plus de gestion de tickets restaurant ou de notes de frais individuelles."
                />
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Benefits List */}
          <Card>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Avantages pour votre entreprise</Heading>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={FiCheck} color="green.500" />
                      Réduction des coûts de restauration jusqu'à 20%
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="green.500" />
                      Augmentation de la productivité (pas de déplacements)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="green.500" />
                      Amélioration de la satisfaction des employés
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="green.500" />
                      Dashboard analytics pour suivre les dépenses
                    </ListItem>
                  </List>
                </VStack>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Avantages pour vos collaborateurs</Heading>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={FiCheck} color="green.500" />
                      Choix variés de plats frais et sains chaque jour
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="green.500" />
                      Livraison directement au bureau à l'heure choisie
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="green.500" />
                      Options végétariennes, vegan et sans allergènes
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheck} color="green.500" />
                      Interface simple pour commander en 2 clics
                    </ListItem>
                  </List>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Packages */}
          {packages.length > 0 && (
            <Box>
              <VStack spacing={8}>
                <Heading size="xl" textAlign="center" id="packages">
                  Nos Formules Entreprise
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
                  {packages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </SimpleGrid>
                <Text textAlign="center" color="gray.600">
                  Toutes nos formules sont personnalisables selon vos besoins
                </Text>
              </VStack>
            </Box>
          )}

          {/* CTA Section */}
          <Card bg="brand.50" borderColor="brand.200" borderWidth={2}>
            <CardBody>
              <VStack spacing={6} textAlign="center">
                <Heading as="h3" size="md">Prêt à améliorer l'expérience repas de votre équipe ?</Heading>
                <Text fontSize="lg" color="gray.700">
                  Contactez-nous pour une étude personnalisée et un devis gratuit
                </Text>
                <Button colorScheme="brand" size="lg" onClick={onOpen}>
                  Demander un devis gratuit
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Quote Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Demande de Devis B2B</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nom de l'entreprise</FormLabel>
                  <Input
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                  />
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Nom du contact</FormLabel>
                    <Input
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      placeholder="Jean Dupont"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      placeholder="jean@acme.com"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Téléphone</FormLabel>
                  <Input
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="+33 6 12 34 56 78"
                  />
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Taille de l'entreprise</FormLabel>
                    <Select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      placeholder="Sélectionner"
                    >
                      <option value="1-10">1-10 employés</option>
                      <option value="11-50">11-50 employés</option>
                      <option value="51-200">51-200 employés</option>
                      <option value="201-500">201-500 employés</option>
                      <option value="500+">500+ employés</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Commandes mensuelles estimées</FormLabel>
                    <Input
                      name="estimated_monthly_orders"
                      type="number"
                      value={formData.estimated_monthly_orders}
                      onChange={handleChange}
                      placeholder="100"
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Budget mensuel</FormLabel>
                    <Input
                      name="budget_range"
                      value={formData.budget_range}
                      onChange={handleChange}
                      placeholder="1000-2000€"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Fréquence de livraison</FormLabel>
                    <Select
                      name="delivery_frequency"
                      value={formData.delivery_frequency}
                      onChange={handleChange}
                      placeholder="Sélectionner"
                    >
                      <option value="daily">Quotidienne</option>
                      <option value="2-3-week">2-3 fois/semaine</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="occasional">Ponctuelle</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Besoins particuliers</FormLabel>
                  <Textarea
                    name="special_requirements"
                    value={formData.special_requirements}
                    onChange={handleChange}
                    placeholder="Régimes alimentaires spécifiques, allergies, préférences..."
                    rows={4}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  isLoading={isSubmitting}
                >
                  Envoyer ma demande
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
