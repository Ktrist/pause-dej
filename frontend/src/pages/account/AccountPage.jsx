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
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Switch,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiUser, FiMapPin, FiShoppingBag, FiEdit2, FiTrash2, FiPlus, FiTruck, FiHeart } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from '../../hooks/useAddresses'
import { useOrders } from '../../hooks/useOrders'
import { useFavorites } from '../../hooks/useFavorites'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DishCard from '../../components/catalogue/DishCard'

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

  // Supabase hooks for addresses
  const { addresses, loading: loadingAddresses, error: errorAddresses, refetch: refetchAddresses } = useAddresses()
  const { createAddress, loading: creatingAddress } = useCreateAddress()
  const { updateAddress, loading: updatingAddress } = useUpdateAddress()
  const { deleteAddress, loading: deletingAddress } = useDeleteAddress()

  // Supabase hooks for orders
  const { orders, loading: loadingOrders, error: errorOrders } = useOrders()

  // Supabase hooks for favorites
  const { favorites, loading: loadingFavorites, error: errorFavorites } = useFavorites()

  // Modal for add/edit address
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    label: '',
    street_address: '',
    city: '',
    postal_code: '',
    additional_info: '',
    is_default: false
  })

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'orders') setTabIndex(1)
    if (tab === 'addresses') setTabIndex(2)
    if (tab === 'favorites') setTabIndex(3)
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

  const handleOpenAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address)
      setAddressForm({
        label: address.label || '',
        street_address: address.street_address || '',
        city: address.city || '',
        postal_code: address.postal_code || '',
        additional_info: address.additional_info || '',
        is_default: address.is_default || false
      })
    } else {
      setEditingAddress(null)
      setAddressForm({
        label: '',
        street_address: '',
        city: '',
        postal_code: '',
        additional_info: '',
        is_default: false
      })
    }
    onOpen()
  }

  const handleSaveAddress = async () => {
    if (editingAddress) {
      // Update existing address
      const { error } = await updateAddress(editingAddress.id, addressForm)
      if (error) {
        toast({
          title: 'Erreur',
          description: error,
          status: 'error',
          duration: 3000
        })
      } else {
        toast({
          title: 'Adresse mise à jour',
          status: 'success',
          duration: 2000
        })
        refetchAddresses()
        onClose()
      }
    } else {
      // Create new address
      const { error } = await createAddress(addressForm)
      if (error) {
        toast({
          title: 'Erreur',
          description: error,
          status: 'error',
          duration: 3000
        })
      } else {
        toast({
          title: 'Adresse créée',
          status: 'success',
          duration: 2000
        })
        refetchAddresses()
        onClose()
      }
    }
  }

  const handleDeleteAddress = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      const { error } = await deleteAddress(id)
      if (error) {
        toast({
          title: 'Erreur',
          description: error,
          status: 'error',
          duration: 3000
        })
      } else {
        toast({
          title: 'Adresse supprimée',
          status: 'info',
          duration: 2000
        })
        refetchAddresses()
      }
    }
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
              <Tab>
                <HStack spacing={2}>
                  <FiHeart />
                  <Text>Favoris</Text>
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

                  {loadingOrders ? (
                    <LoadingSpinner message="Chargement des commandes..." />
                  ) : errorOrders ? (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      Erreur de chargement des commandes
                    </Alert>
                  ) : orders.length === 0 ? (
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
                  ) : (
                    <VStack spacing={4}>
                      {orders.map((order) => (
                        <Card key={order.id} w="full">
                          <CardBody>
                            <VStack align="stretch" spacing={4}>
                              {/* Order Header */}
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <HStack>
                                    <Text fontWeight="600" fontSize="lg">
                                      Commande #{order.order_number}
                                    </Text>
                                    <Badge
                                      colorScheme={
                                        order.status === 'delivered' ? 'green' :
                                        order.status === 'cancelled' ? 'red' :
                                        order.status === 'in_delivery' ? 'blue' :
                                        'orange'
                                      }
                                    >
                                      {order.status === 'pending' && 'En attente'}
                                      {order.status === 'confirmed' && 'Confirmée'}
                                      {order.status === 'preparing' && 'En préparation'}
                                      {order.status === 'ready' && 'Prête'}
                                      {order.status === 'in_delivery' && 'En livraison'}
                                      {order.status === 'delivered' && 'Livrée'}
                                      {order.status === 'cancelled' && 'Annulée'}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.600">
                                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Text>
                                </VStack>
                                <VStack align="end" spacing={0}>
                                  <Text fontWeight="bold" fontSize="xl" color="brand.600">
                                    {order.total.toFixed(2)}€
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {order.order_items?.length || 0} article{order.order_items?.length > 1 ? 's' : ''}
                                  </Text>
                                </VStack>
                              </HStack>

                              <Divider />

                              {/* Order Items */}
                              <VStack align="stretch" spacing={2}>
                                {order.order_items?.slice(0, 3).map((item) => (
                                  <HStack key={item.id} spacing={3}>
                                    <Text fontSize="sm" color="gray.600" minW="30px">
                                      x{item.quantity}
                                    </Text>
                                    <Text fontSize="sm" flex={1}>
                                      {item.dish_name}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="500">
                                      {item.subtotal.toFixed(2)}€
                                    </Text>
                                  </HStack>
                                ))}
                                {order.order_items?.length > 3 && (
                                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                    + {order.order_items.length - 3} autre{order.order_items.length - 3 > 1 ? 's' : ''} article{order.order_items.length - 3 > 1 ? 's' : ''}
                                  </Text>
                                )}
                              </VStack>

                              {/* Delivery Info */}
                              <HStack spacing={2} fontSize="sm" color="gray.600">
                                <FiMapPin />
                                <Text>
                                  Livraison le {new Date(order.delivery_date).toLocaleDateString('fr-FR')} à {order.delivery_time}
                                </Text>
                              </HStack>

                              {/* Actions */}
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  colorScheme="brand"
                                  leftIcon={<FiTruck />}
                                  as="a"
                                  href={`/track/${order.order_number}`}
                                >
                                  Suivre
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="gray"
                                  as="a"
                                  href={`/confirmation/${order.order_number}`}
                                >
                                  Voir détails
                                </Button>
                                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                  >
                                    Annuler
                                  </Button>
                                )}
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
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
                      onClick={() => handleOpenAddressModal()}
                    >
                      Nouvelle adresse
                    </Button>
                  </HStack>

                  {loadingAddresses ? (
                    <LoadingSpinner message="Chargement des adresses..." />
                  ) : errorAddresses ? (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      Erreur de chargement des adresses
                    </Alert>
                  ) : addresses.length === 0 ? (
                    <Box bg="white" p={12} borderRadius="xl" boxShadow="md" textAlign="center">
                      <VStack spacing={4}>
                        <Text fontSize="4xl">📍</Text>
                        <Heading size="md" color="gray.600">
                          Aucune adresse
                        </Heading>
                        <Text color="gray.500">
                          Ajoutez votre première adresse de livraison
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {addresses.map((address) => (
                        <Card key={address.id}>
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <HStack spacing={2}>
                                  <Text fontWeight="600">{address.label}</Text>
                                  {address.is_default && (
                                    <Badge colorScheme="brand">Par défaut</Badge>
                                  )}
                                </HStack>
                                <HStack spacing={1}>
                                  <IconButton
                                    icon={<FiEdit2 />}
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Modifier"
                                    onClick={() => handleOpenAddressModal(address)}
                                  />
                                  <IconButton
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteAddress(address.id)}
                                    aria-label="Supprimer"
                                    isLoading={deletingAddress}
                                  />
                                </HStack>
                              </HStack>
                              <Divider />
                              <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                                <Text>{address.street_address}</Text>
                                <Text>
                                  {address.postal_code} {address.city}
                                </Text>
                                {address.additional_info && (
                                  <Text fontStyle="italic">{address.additional_info}</Text>
                                )}
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </TabPanel>

              {/* Favorites Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="600">
                    Mes plats favoris
                  </Text>

                  {loadingFavorites ? (
                    <LoadingSpinner message="Chargement des favoris..." />
                  ) : errorFavorites ? (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      Erreur de chargement des favoris
                    </Alert>
                  ) : favorites.length === 0 ? (
                    <Box bg="white" p={12} borderRadius="xl" boxShadow="md" textAlign="center">
                      <VStack spacing={4}>
                        <Text fontSize="4xl">❤️</Text>
                        <Heading size="md" color="gray.600">
                          Aucun favori
                        </Heading>
                        <Text color="gray.500">
                          Ajoutez vos plats préférés en cliquant sur le cœur
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
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {favorites.map((favorite) => (
                        <DishCard
                          key={favorite.dish_id}
                          dish={favorite.dishes}
                          onViewDetails={() => navigate(`/catalogue?dish=${favorite.dish_id}`)}
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Address Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Label</FormLabel>
                <Input
                  placeholder="Domicile, Bureau, etc."
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Adresse</FormLabel>
                <Input
                  placeholder="12 Rue de la République"
                  value={addressForm.street_address}
                  onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Code postal</FormLabel>
                  <Input
                    placeholder="75001"
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Ville</FormLabel>
                  <Input
                    placeholder="Paris"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Complément d'adresse</FormLabel>
                <Textarea
                  placeholder="Appartement, étage, code d'accès..."
                  value={addressForm.additional_info}
                  onChange={(e) => setAddressForm({ ...addressForm, additional_info: e.target.value })}
                  rows={3}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Adresse par défaut</FormLabel>
                <Switch
                  isChecked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  colorScheme="brand"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSaveAddress}
              isLoading={creatingAddress || updatingAddress}
            >
              {editingAddress ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
