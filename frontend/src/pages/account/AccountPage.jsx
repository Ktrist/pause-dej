import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Text,
  FormControl,
  FormLabel,
  Input,
  useToast,
  SimpleGrid,
  Badge,
  Card,
  CardBody,
  IconButton,
  Divider
} from '@chakra-ui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiUser, FiMapPin, FiShoppingBag, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

export default function AccountPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [tabIndex, setTabIndex] = useState(0)
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: ''
  })
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Domicile',
      street: '12 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      isDefault: true
    }
  ])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'orders') setTabIndex(1)
    if (tab === 'addresses') setTabIndex(2)
  }, [searchParams])

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || ''
      })
    }
  }, [user])

  const handleProfileUpdate = () => {
    toast({
      title: 'Profil mis à jour',
      description: 'Vos informations ont été enregistrées',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter((addr) => addr.id !== id))
    toast({
      title: 'Adresse supprimée',
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  if (loading || !user) {
    return null
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Heading size="xl" color="gray.800">
            Mon Compte
          </Heading>

          <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="brand">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <FiUser />
                  <Text>Profil</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiShoppingBag />
                  <Text>Commandes</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiMapPin />
                  <Text>Adresses</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Profile Tab */}
              <TabPanel>
                <Box bg="white" p={8} borderRadius="xl" boxShadow="md">
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Informations personnelles</Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Nom complet</FormLabel>
                        <Input
                          value={profile.fullName}
                          onChange={(e) =>
                            setProfile({ ...profile, fullName: e.target.value })
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input value={profile.email} isReadOnly bg="gray.50" />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Téléphone</FormLabel>
                        <Input
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                        />
                      </FormControl>
                    </SimpleGrid>

                    <Button
                      colorScheme="brand"
                      onClick={handleProfileUpdate}
                      w={{ base: 'full', md: 'auto' }}
                    >
                      Enregistrer les modifications
                    </Button>
                  </VStack>
                </Box>
              </TabPanel>

              {/* Orders Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="600">
                    Historique de vos commandes
                  </Text>
                  <Box bg="white" p={12} borderRadius="xl" boxShadow="md" textAlign="center">
                    <VStack spacing={4}>
                      <Text fontSize="4xl">📦</Text>
                      <Heading size="md" color="gray.600">
                        Aucune commande
                      </Heading>
                      <Text color="gray.500">
                        Vous n'avez pas encore passé de commande
                      </Text>
                      <Button
                        as="a"
                        href="/catalogue"
                        colorScheme="brand"
                        size="lg"
                      >
                        Voir le catalogue
                      </Button>
                    </VStack>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Addresses Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="600">
                      Mes adresses de livraison
                    </Text>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="brand"
                      size="sm"
                    >
                      Nouvelle adresse
                    </Button>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {addresses.map((address) => (
                      <Card key={address.id}>
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Text fontWeight="600">{address.label}</Text>
                                {address.isDefault && (
                                  <Badge colorScheme="brand">Par défaut</Badge>
                                )}
                              </HStack>
                              <HStack spacing={1}>
                                <IconButton
                                  icon={<FiEdit2 />}
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Modifier"
                                />
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteAddress(address.id)}
                                  aria-label="Supprimer"
                                />
                              </HStack>
                            </HStack>
                            <Divider />
                            <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                              <Text>{address.street}</Text>
                              <Text>
                                {address.postalCode} {address.city}
                              </Text>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  )
}
