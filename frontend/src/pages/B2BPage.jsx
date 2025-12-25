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
  useDisclosure,
  Skeleton,
  SkeletonText,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react'
import logo from '../assets/logo.jpg'
import {
  FiCheck,
  FiUsers,
  FiTrendingDown,
  FiCalendar,
  FiPackage,
  FiClock,
  FiArrowRight
} from 'react-icons/fi'
import { TbCurrencyEuro } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { useB2BQuotes, useB2BPackages } from '../hooks/useB2BQuotes'
import SEO from '../components/common/SEO'

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
  const navigate = useNavigate()

  return (
    <Card bg={bgColor} borderWidth={2} borderColor="brand.200" _hover={{ shadow: 'lg', transform: 'translateY(-4px)', transition: 'all 0.2s' }}>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Heading size="md">{pkg.tier_name || pkg.name}</Heading>
          <Text color="gray.600">{pkg.tier_description || pkg.description}</Text>
          <HStack>
            <Text fontSize="3xl" fontWeight="bold" color="brand.600">
              {pkg.price_per_person ? pkg.price_per_person.toFixed(2) : '0.00'}€
            </Text>
            <Text color="gray.600">/personne</Text>
          </HStack>
          {pkg.min_employees && (
            <Text fontSize="sm" color="gray.600">
              Min. {pkg.min_employees} employés
              {pkg.max_employees && ` - Max. ${pkg.max_employees} employés`}
            </Text>
          )}
          {pkg.features && pkg.features.length > 0 && (
            <List spacing={2}>
              {pkg.features.map((feature, index) => (
                <ListItem key={index} fontSize="sm">
                  <ListIcon as={FiCheck} color="green.500" />
                  {feature}
                </ListItem>
              ))}
            </List>
          )}

          {/* CTA Button */}
          <Button
            colorScheme="brand"
            rightIcon={<FiArrowRight />}
            onClick={() => navigate('/a-la-carte?b2b=true&package=' + pkg.tier_name)}
            mt={2}
          >
            Découvrir les plats
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default function B2BPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const toast = useToast()
  const { createQuote } = useB2BQuotes()
  const { packages, loading: packagesLoading } = useB2BPackages()
  const { isOpen, onOpen, onClose } = useDisclosure()

  console.log('📦 B2BPage - Packages loaded:', packages.length, packages)

  // Form 1: Contactez-nous
  const [contactForm, setContactForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    nombre_employes: '',
    solution_actuelle: '',
    ticket_restaurant: ''
  })

  // Form 2: Des questions ?
  const [questionForm, setQuestionForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    poste: '',
    nombre_employes: '',
    code_postal: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactChange = (e) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleQuestionChange = (e) => {
    const { name, value } = e.target
    setQuestionForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Convert to database schema format
    // Extract employee count from range (e.g., "1-10" -> 1, "500+" -> 500)
    const employeeCount = contactForm.nombre_employes.includes('+')
      ? parseInt(contactForm.nombre_employes.replace('+', ''))
      : parseInt(contactForm.nombre_employes.split('-')[0]) || 0

    const formData = {
      company_name: contactForm.entreprise,
      contact_name: `${contactForm.prenom} ${contactForm.nom}`,
      contact_email: contactForm.email,
      contact_phone: contactForm.telephone,
      employee_count: employeeCount,
      message: `Solution actuelle: ${contactForm.solution_actuelle}\nTicket restaurant: ${contactForm.ticket_restaurant}`
    }

    const { error } = await createQuote(formData)

    if (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer votre demande. Veuillez réessayer.",
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
      setContactForm({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        entreprise: '',
        nombre_employes: '',
        solution_actuelle: '',
        ticket_restaurant: ''
      })
      onClose()
    }

    setIsSubmitting(false)
  }

  const handleQuestionSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Convert to database schema format
    // Extract employee count from range (e.g., "1-10" -> 1, "500+" -> 500)
    const employeeCount = questionForm.nombre_employes.includes('+')
      ? parseInt(questionForm.nombre_employes.replace('+', ''))
      : parseInt(questionForm.nombre_employes.split('-')[0]) || 0

    const formData = {
      company_name: questionForm.entreprise,
      contact_name: `${questionForm.prenom} ${questionForm.nom}`,
      contact_email: questionForm.email,
      contact_phone: questionForm.telephone,
      employee_count: employeeCount,
      message: `Poste: ${questionForm.poste}\nCode postal: ${questionForm.code_postal}\nMessage: ${questionForm.message}`
    }

    const { error } = await createQuote(formData)

    if (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer votre message. Veuillez réessayer.",
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } else {
      toast({
        title: 'Message envoyé !',
        description: 'Nous vous répondrons dans les plus brefs délais.',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      setQuestionForm({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        entreprise: '',
        poste: '',
        nombre_employes: '',
        code_postal: '',
        message: ''
      })
      onClose()
    }

    setIsSubmitting(false)
  }

  return (
    <>
      <SEO
        title="Pause Dej' At Work - Solution restauration entreprise à Annecy"
        description="Offrez des repas frais et de qualité à vos employés. Forfaits entreprise personnalisés, gestion d'équipe, budgets flexibles. Demandez un devis gratuit."
        keywords="restauration entreprise Annecy, repas entreprise, forfait B2B, cantine entreprise, ticket restaurant"
        url="/pause-dej-at-work"
      />
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
                Discutons de vos besoins
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
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('packages')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  })
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
          <Box id="packages">
            <VStack spacing={8}>
              <Heading size="xl" textAlign="center">
                Nos Formules Entreprise
              </Heading>

              {packagesLoading ? (
                // Loading skeleton
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} borderWidth={2} borderColor="gray.200">
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Skeleton height="30px" width="60%" />
                          <SkeletonText noOfLines={2} spacing={2} />
                          <Skeleton height="40px" width="40%" />
                          <SkeletonText noOfLines={4} spacing={2} />
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : packages.length > 0 ? (
                // Actual packages
                <>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
                    {packages.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                  </SimpleGrid>
                  <Text textAlign="center" color="gray.600">
                    Toutes nos formules sont personnalisables selon vos besoins
                  </Text>
                </>
              ) : (
                // No packages
                <Text textAlign="center" color="gray.500">
                  Aucune formule disponible pour le moment
                </Text>
              )}
            </VStack>
          </Box>

          {/* CTA Section */}
          <Card bg="brand.50" borderColor="brand.200" borderWidth={2}>
            <CardBody>
              <VStack spacing={6} textAlign="center">
                <Heading as="h3" size="md">Prêt à améliorer l'expérience repas de votre équipe ?</Heading>
                <Text fontSize="lg" color="gray.700">
                  Contactez-nous pour une étude personnalisée et un devis gratuit
                </Text>
                <Button colorScheme="brand" size="lg" onClick={onOpen}>
                  Discutons de vos besoins
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
          <ModalHeader>
            <VStack align="start" spacing={4}>
              <HStack spacing={3} align="center">
                <Image
                  src={logo}
                  alt="Pause Dej'"
                  h="50px"
                  objectFit="contain"
                />
                <Text fontSize="lg" color="gray.700" fontWeight="medium">
                  dans votre entreprise
                </Text>
              </HStack>
              <Box
                bg="purple.500"
                px={5}
                py={2}
                borderRadius="md"
                transform="rotate(-3deg)"
                boxShadow="lg"
                display="inline-block"
                w="fit-content"
              >
                <Text
                  fontSize="lg"
                  fontWeight="extrabold"
                  color="white"
                  fontFamily="Agrandir, Circular, Helvetica, Arial, sans-serif"
                  letterSpacing="wider"
                  textTransform="lowercase"
                >
                  c'est pour bientôt !
                </Text>
              </Box>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs variant="unstyled" colorScheme="gray">
              <TabList borderBottom="2px solid" borderColor="gray.200" mb={6}>
                <Tab
                  _selected={{ borderBottom: '3px solid black', fontWeight: 'bold' }}
                  _hover={{ color: 'gray.700' }}
                  pb={3}
                  px={6}
                  fontSize="md"
                >
                  <HStack spacing={2}>
                    <Icon as={FiUsers} />
                    <Text>Contactez-nous</Text>
                  </HStack>
                </Tab>
                <Tab
                  _selected={{ borderBottom: '3px solid black', fontWeight: 'bold' }}
                  _hover={{ color: 'gray.700' }}
                  pb={3}
                  px={6}
                  fontSize="md"
                >
                  <HStack spacing={2}>
                    <Text>❓</Text>
                    <Text>Des questions ?</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Tab 1: Contactez-nous */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <Text color="gray.700" fontSize="sm" fontWeight="bold">
                      On vous envoie un e-mail avec les infos à transférer à votre RH ou CSE.
                    </Text>

                    <form onSubmit={handleContactSubmit}>
                      <VStack spacing={4}>
                        <SimpleGrid columns={2} spacing={4} w="full">
                          <FormControl isRequired>
                            <Input
                              name="prenom"
                              value={contactForm.prenom}
                              onChange={handleContactChange}
                              placeholder="Prénom *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <Input
                              name="nom"
                              value={contactForm.nom}
                              onChange={handleContactChange}
                              placeholder="Nom *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={2} spacing={4} w="full">
                          <FormControl isRequired>
                            <Input
                              name="email"
                              type="email"
                              value={contactForm.email}
                              onChange={handleContactChange}
                              placeholder="Email *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <Text fontSize="lg">🇫🇷</Text>
                              </InputLeftElement>
                              <Input
                                name="telephone"
                                type="tel"
                                value={contactForm.telephone}
                                onChange={handleContactChange}
                                placeholder="Numéro de téléphone *"
                                pl={10}
                                borderColor="gray.300"
                                _hover={{ borderColor: 'gray.400' }}
                                _focus={{ borderColor: 'black', boxShadow: 'none' }}
                              />
                            </InputGroup>
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={2} spacing={4} w="full">
                          <FormControl isRequired>
                            <Input
                              name="entreprise"
                              value={contactForm.entreprise}
                              onChange={handleContactChange}
                              placeholder="Nom de l'entreprise *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <Select
                              name="nombre_employes"
                              value={contactForm.nombre_employes}
                              onChange={handleContactChange}
                              placeholder="Nombre d'employés *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            >
                              <option value="1-10">1-10 employés</option>
                              <option value="11-50">11-50 employés</option>
                              <option value="51-200">51-200 employés</option>
                              <option value="201-500">201-500 employés</option>
                              <option value="500+">500+ employés</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>

                        <FormControl isRequired>
                          <Input
                            name="solution_actuelle"
                            value={contactForm.solution_actuelle}
                            onChange={handleContactChange}
                            placeholder="Solution actuelle dans l'entreprise *"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'gray.400' }}
                            _focus={{ borderColor: 'black', boxShadow: 'none' }}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <Input
                            name="ticket_restaurant"
                            value={contactForm.ticket_restaurant}
                            onChange={handleContactChange}
                            placeholder="Ticket restaurant *"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'gray.400' }}
                            _focus={{ borderColor: 'black', boxShadow: 'none' }}
                          />
                        </FormControl>

                        <Button
                          type="submit"
                          bg="#E85D04"
                          color="white"
                          size="lg"
                          borderRadius="full"
                          px={12}
                          mt={4}
                          _hover={{ bg: '#C74E03' }}
                          isLoading={isSubmitting}
                        >
                          Envoyer
                        </Button>
                      </VStack>
                    </form>
                  </VStack>
                </TabPanel>

                {/* Tab 2: Des questions ? */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <Text color="gray.700" fontSize="sm" fontWeight="bold">
                      Encore des questions sur nos offres ? N'hésitez pas à nous laisser un message.
                    </Text>

                    <form onSubmit={handleQuestionSubmit}>
                      <VStack spacing={4}>
                        <SimpleGrid columns={2} spacing={4} w="full">
                          <FormControl isRequired>
                            <Input
                              name="prenom"
                              value={questionForm.prenom}
                              onChange={handleQuestionChange}
                              placeholder="Prénom *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <Input
                              name="nom"
                              value={questionForm.nom}
                              onChange={handleQuestionChange}
                              placeholder="Nom *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={2} spacing={4} w="full">
                          <FormControl isRequired>
                            <Input
                              name="email"
                              type="email"
                              value={questionForm.email}
                              onChange={handleQuestionChange}
                              placeholder="Email *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none">
                                <Text fontSize="lg">🇫🇷</Text>
                              </InputLeftElement>
                              <Input
                                name="telephone"
                                type="tel"
                                value={questionForm.telephone}
                                onChange={handleQuestionChange}
                                placeholder="Numéro de téléphone *"
                                pl={10}
                                borderColor="gray.300"
                                _hover={{ borderColor: 'gray.400' }}
                                _focus={{ borderColor: 'black', boxShadow: 'none' }}
                              />
                            </InputGroup>
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={2} spacing={4} w="full">
                          <FormControl isRequired>
                            <Input
                              name="entreprise"
                              value={questionForm.entreprise}
                              onChange={handleQuestionChange}
                              placeholder="Nom de l'entreprise *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <Input
                              name="poste"
                              value={questionForm.poste}
                              onChange={handleQuestionChange}
                              placeholder="Poste *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={2} spacing={4} w="full">
                          <FormControl isRequired>
                            <Select
                              name="nombre_employes"
                              value={questionForm.nombre_employes}
                              onChange={handleQuestionChange}
                              placeholder="Nombre d'employés *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            >
                              <option value="1-10">1-10 employés</option>
                              <option value="11-50">11-50 employés</option>
                              <option value="51-200">51-200 employés</option>
                              <option value="201-500">201-500 employés</option>
                              <option value="500+">500+ employés</option>
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <Input
                              name="code_postal"
                              value={questionForm.code_postal}
                              onChange={handleQuestionChange}
                              placeholder="Code postal de l'entreprise *"
                              borderColor="gray.300"
                              _hover={{ borderColor: 'gray.400' }}
                              _focus={{ borderColor: 'black', boxShadow: 'none' }}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <FormControl isRequired>
                          <Textarea
                            name="message"
                            value={questionForm.message}
                            onChange={handleQuestionChange}
                            placeholder="Pouvez-vous nous en dire plus sur votre besoin ? *"
                            rows={6}
                            borderColor="gray.300"
                            _hover={{ borderColor: 'gray.400' }}
                            _focus={{ borderColor: 'black', boxShadow: 'none' }}
                          />
                        </FormControl>

                        <Button
                          type="submit"
                          bg="#E85D04"
                          color="white"
                          size="lg"
                          borderRadius="full"
                          px={12}
                          mt={4}
                          _hover={{ bg: '#C74E03' }}
                          isLoading={isSubmitting}
                        >
                          Envoyer
                        </Button>
                      </VStack>
                    </form>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
      </Box>
    </>
  )
}
