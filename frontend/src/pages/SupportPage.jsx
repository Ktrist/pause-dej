import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  Link as ChakraLink
} from '@chakra-ui/react'
import {
  FiMessageCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiHelpCircle,
  FiPlus
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  useSupportTickets,
  getCategoryLabel,
  getStatusLabel,
  getStatusColor
} from '../hooks/useSupportTickets'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function SupportPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { tickets, loading, createTicket } = useSupportTickets()
  const toast = useToast()
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    message: '',
    email: user?.email || '',
    phone: ''
  })

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await createTicket(ticketForm)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Ticket créé',
        description: 'Votre demande a été envoyée. Nous vous répondrons dans les plus brefs délais.',
        status: 'success',
        duration: 5000
      })
      setTicketForm({
        subject: '',
        category: 'general',
        message: '',
        email: user?.email || '',
        phone: ''
      })
      setShowNewTicketForm(false)
    }

    setSubmitting(false)
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" mb={3}>
              Centre d'aide & Support
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Nous sommes là pour vous aider
            </Text>
          </Box>

          <Tabs colorScheme="brand">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiHelpCircle} />
                  <Text>FAQ</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiMessageCircle} />
                  <Text>Mes tickets</Text>
                  {tickets.length > 0 && (
                    <Badge colorScheme="brand">{tickets.length}</Badge>
                  )}
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiMail} />
                  <Text>Contact</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* FAQ Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Text fontSize="lg" fontWeight="600">
                    Questions fréquentes
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Card>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Heading size="sm">Comment passer commande ?</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Parcourez notre catalogue, ajoutez vos plats préférés au panier,
                            choisissez votre créneau de livraison et finalisez votre commande.
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Heading size="sm">Quels sont les délais de livraison ?</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Nous proposons des créneaux de livraison le midi (11h30-13h30) et le
                            soir (18h30-20h30) du lundi au vendredi.
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Heading size="sm">Comment modifier ma commande ?</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Vous pouvez modifier votre commande jusqu'à 2h avant le créneau de
                            livraison en nous contactant via le support.
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Heading size="sm">Quels modes de paiement acceptez-vous ?</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Nous acceptons les cartes bancaires (Visa, Mastercard, American
                            Express) via notre plateforme sécurisée Stripe.
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Heading size="sm">Livrez-vous dans ma zone ?</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Nous livrons actuellement à Paris et proche banlieue. Vérifiez lors du
                            checkout si votre code postal est couvert.
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Heading size="sm">Comment suivre ma commande ?</Heading>
                          <Text fontSize="sm" color="gray.600">
                            Rendez-vous dans "Mon Compte" → "Commandes" pour suivre l'état de
                            votre commande en temps réel.
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Mes tickets Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="600">
                      Mes demandes de support
                    </Text>
                    {!showNewTicketForm && (
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="brand"
                        onClick={() => setShowNewTicketForm(true)}
                      >
                        Nouveau ticket
                      </Button>
                    )}
                  </HStack>

                  {showNewTicketForm && (
                    <Card>
                      <CardBody>
                        <form onSubmit={handleSubmitTicket}>
                          <VStack spacing={4}>
                            <Heading size="md">Créer un ticket de support</Heading>

                            <FormControl isRequired>
                              <FormLabel>Catégorie</FormLabel>
                              <Select
                                value={ticketForm.category}
                                onChange={(e) =>
                                  setTicketForm({ ...ticketForm, category: e.target.value })
                                }
                              >
                                <option value="general">Général</option>
                                <option value="order">Commande</option>
                                <option value="delivery">Livraison</option>
                                <option value="payment">Paiement</option>
                                <option value="product">Produit</option>
                                <option value="account">Compte</option>
                                <option value="other">Autre</option>
                              </Select>
                            </FormControl>

                            <FormControl isRequired>
                              <FormLabel>Sujet</FormLabel>
                              <Input
                                value={ticketForm.subject}
                                onChange={(e) =>
                                  setTicketForm({ ...ticketForm, subject: e.target.value })
                                }
                                placeholder="Résumez votre demande en quelques mots"
                              />
                            </FormControl>

                            <FormControl isRequired>
                              <FormLabel>Message</FormLabel>
                              <Textarea
                                value={ticketForm.message}
                                onChange={(e) =>
                                  setTicketForm({ ...ticketForm, message: e.target.value })
                                }
                                placeholder="Décrivez votre problème ou question en détail..."
                                rows={6}
                              />
                            </FormControl>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                              <FormControl isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input
                                  type="email"
                                  value={ticketForm.email}
                                  onChange={(e) =>
                                    setTicketForm({ ...ticketForm, email: e.target.value })
                                  }
                                  placeholder="votre@email.com"
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel>Téléphone (optionnel)</FormLabel>
                                <Input
                                  value={ticketForm.phone}
                                  onChange={(e) =>
                                    setTicketForm({ ...ticketForm, phone: e.target.value })
                                  }
                                  placeholder="06 12 34 56 78"
                                />
                              </FormControl>
                            </SimpleGrid>

                            <HStack w="full" justify="flex-end" spacing={3}>
                              <Button
                                variant="ghost"
                                onClick={() => setShowNewTicketForm(false)}
                              >
                                Annuler
                              </Button>
                              <Button
                                type="submit"
                                colorScheme="brand"
                                isLoading={submitting}
                                leftIcon={<FiMessageCircle />}
                              >
                                Envoyer
                              </Button>
                            </HStack>
                          </VStack>
                        </form>
                      </CardBody>
                    </Card>
                  )}

                  {!user && (
                    <Alert status="info">
                      <AlertIcon />
                      Connectez-vous pour voir vos tickets de support
                    </Alert>
                  )}

                  {loading ? (
                    <LoadingSpinner message="Chargement de vos tickets..." />
                  ) : tickets.length === 0 && !showNewTicketForm ? (
                    <Card>
                      <CardBody textAlign="center" py={12}>
                        <VStack spacing={4}>
                          <Icon as={FiMessageCircle} boxSize={12} color="gray.400" />
                          <Text color="gray.500">Aucun ticket de support pour le moment</Text>
                          <Button
                            colorScheme="brand"
                            leftIcon={<FiPlus />}
                            onClick={() => setShowNewTicketForm(true)}
                          >
                            Créer un ticket
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {tickets.map((ticket) => (
                        <Card
                          key={ticket.id}
                          cursor="pointer"
                          _hover={{ shadow: 'md' }}
                          onClick={() => navigate(`/support/${ticket.id}`)}
                        >
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <HStack>
                                    <Badge colorScheme="purple">
                                      {getCategoryLabel(ticket.category)}
                                    </Badge>
                                    <Badge colorScheme={getStatusColor(ticket.status)}>
                                      {getStatusLabel(ticket.status)}
                                    </Badge>
                                  </HStack>
                                  <Heading size="sm">{ticket.subject}</Heading>
                                </VStack>
                                <Text fontSize="sm" color="gray.600">
                                  {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                {ticket.message}
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </TabPanel>

              {/* Contact Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Text fontSize="lg" fontWeight="600">
                    Nous contacter
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Card>
                      <CardBody textAlign="center">
                        <VStack spacing={4}>
                          <Icon as={FiMail} boxSize={10} color="brand.500" />
                          <Box>
                            <Text fontWeight="600" mb={1}>
                              Email
                            </Text>
                            <ChakraLink
                              href="mailto:support@pause-dej.fr"
                              color="brand.600"
                              fontSize="sm"
                            >
                              support@pause-dej.fr
                            </ChakraLink>
                          </Box>
                          <Text fontSize="sm" color="gray.600">
                            Réponse sous 24h
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody textAlign="center">
                        <VStack spacing={4}>
                          <Icon as={FiPhone} boxSize={10} color="brand.500" />
                          <Box>
                            <Text fontWeight="600" mb={1}>
                              Téléphone
                            </Text>
                            <ChakraLink href="tel:+33123456789" color="brand.600" fontSize="sm">
                              01 23 45 67 89
                            </ChakraLink>
                          </Box>
                          <Text fontSize="sm" color="gray.600">
                            Lun-Ven 9h-18h
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody textAlign="center">
                        <VStack spacing={4}>
                          <Icon as={FiClock} boxSize={10} color="brand.500" />
                          <Box>
                            <Text fontWeight="600" mb={1}>
                              Horaires
                            </Text>
                            <Text fontSize="sm">Lundi - Vendredi</Text>
                            <Text fontSize="sm" color="brand.600">
                              9h00 - 18h00
                            </Text>
                          </Box>
                          <Text fontSize="sm" color="gray.600">
                            Hors jours fériés
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  <Divider />

                  <Card bg="brand.50" borderColor="brand.200" borderWidth={1}>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Icon as={FiMapPin} color="brand.600" />
                          <Text fontWeight="600">Notre adresse</Text>
                        </HStack>
                        <Text>
                          Pause Dej'
                          <br />
                          123 Rue de la République
                          <br />
                          75001 Paris, France
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  )
}
