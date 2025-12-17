import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Stack,
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
  Checkbox,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiUser, FiMapPin, FiShoppingBag, FiEdit2, FiTrash2, FiPlus, FiTruck, FiHeart, FiAward, FiMessageSquare, FiMail, FiBell, FiUsers, FiDownload } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { printInvoice } from '../../utils/invoice'
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from '../../hooks/useAddresses'
import { useOrders } from '../../hooks/useOrders'
import { useFavorites } from '../../hooks/useFavorites'
import { useProfile, DIETARY_PREFERENCES } from '../../hooks/useProfile'
import { useLoyalty, useLoyaltyRewards, useLoyaltyRedemptions, useLoyaltyTransactions } from '../../hooks/useLoyalty'
import { useUserReviews, useDeleteReview } from '../../hooks/useReviews'
import { useNewsletterSubscription } from '../../hooks/useNewsletter'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import DishCard from '../../components/catalogue/DishCard'
import { StarRating } from '../../components/reviews/StarRating'
import NotificationSettings from '../../components/notifications/NotificationSettings'
import ReferralDashboard from '../../components/referral/ReferralDashboard'

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

  // Supabase hook for dietary preferences
  const {
    dietaryPreferences,
    toggleDietaryPreference,
    loading: loadingProfile
  } = useProfile()

  // Loyalty hooks
  const { loyaltyData, tiers, loading: loadingLoyalty, nextTierProgress } = useLoyalty()
  const { rewards, loading: loadingRewards, redeemReward } = useLoyaltyRewards()
  const { redemptions, loading: loadingRedemptions } = useLoyaltyRedemptions()
  const { transactions, loading: loadingTransactions } = useLoyaltyTransactions(20)

  // Reviews hooks
  const { reviews: userReviews, loading: loadingReviews, refresh: refreshReviews } = useUserReviews()
  const { deleteReview, loading: deletingReview } = useDeleteReview()

  // Newsletter hooks
  const {
    subscription,
    isSubscribed,
    loading: loadingNewsletter,
    subscribe: subscribeNewsletter,
    unsubscribe: unsubscribeNewsletter,
    updatePreferences
  } = useNewsletterSubscription()

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
    if (tab === 'loyalty') setTabIndex(2)
    if (tab === 'addresses') setTabIndex(3)
    if (tab === 'favorites') setTabIndex(4)
    if (tab === 'reviews') setTabIndex(5)
    if (tab === 'newsletter') setTabIndex(6)
    if (tab === 'notifications') setTabIndex(7)
    if (tab === 'referral') setTabIndex(8)
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
                  <FiAward />
                  <Text>Fidélité</Text>
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
              <Tab>
                <HStack spacing={2}>
                  <FiMessageSquare />
                  <Text>Avis</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiMail />
                  <Text>Newsletter</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiBell />
                  <Text>Notifications</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiUsers />
                  <Text>Parrainage</Text>
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

                    <Divider my={4} />

                    {/* Dietary Preferences Section - M9.2 */}
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md">Préférences alimentaires</Heading>
                      <Text fontSize="sm" color="gray.600">
                        Sélectionnez vos restrictions et préférences alimentaires pour personnaliser votre expérience
                      </Text>

                      {loadingProfile ? (
                        <LoadingSpinner message="Chargement..." />
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          {DIETARY_PREFERENCES.map((pref) => {
                            const isSelected = dietaryPreferences.includes(pref.value)
                            return (
                              <Card
                                key={pref.value}
                                variant="outline"
                                borderWidth={2}
                                borderColor={isSelected ? 'brand.500' : 'gray.200'}
                                bg={isSelected ? 'brand.50' : 'white'}
                                cursor="pointer"
                                onClick={() => {
                                  toggleDietaryPreference(pref.value)
                                  toast({
                                    title: isSelected ? 'Préférence retirée' : 'Préférence ajoutée',
                                    description: pref.label,
                                    status: 'success',
                                    duration: 2000,
                                    isClosable: true
                                  })
                                }}
                                _hover={{
                                  transform: 'translateY(-2px)',
                                  boxShadow: 'md',
                                  borderColor: 'brand.500'
                                }}
                                transition="all 0.2s"
                              >
                                <CardBody>
                                  <HStack spacing={3}>
                                    <Text fontSize="2xl">{pref.icon}</Text>
                                    <VStack align="start" spacing={0} flex={1}>
                                      <HStack>
                                        <Text fontWeight="600">{pref.label}</Text>
                                        {isSelected && (
                                          <Badge colorScheme="brand" size="sm">✓</Badge>
                                        )}
                                      </HStack>
                                      <Text fontSize="xs" color="gray.600">
                                        {pref.description}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </CardBody>
                              </Card>
                            )
                          })}
                        </SimpleGrid>
                      )}

                      {dietaryPreferences.length > 0 && (
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600">Vos préférences sont actives</Text>
                            <Text fontSize="sm">
                              La carte filtrera automatiquement les plats compatibles avec vos choix
                            </Text>
                          </VStack>
                        </Alert>
                      )}
                    </VStack>
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
                          Voir la carte
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
                              <HStack spacing={2} flexWrap="wrap">
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="green"
                                  leftIcon={<FiDownload />}
                                  onClick={() => printInvoice(order, {
                                    full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
                                    email: user?.email,
                                    phone: user?.user_metadata?.phone
                                  })}
                                >
                                  Facture
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

              {/* Loyalty Tab - M10 */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {loadingLoyalty ? (
                    <LoadingSpinner message="Chargement du programme de fidélité..." />
                  ) : !loyaltyData ? (
                    <Box bg="white" p={12} borderRadius="xl" boxShadow="md" textAlign="center">
                      <VStack spacing={4}>
                        <Text fontSize="4xl">🏆</Text>
                        <Heading size="md" color="gray.600">
                          Programme de Fidélité
                        </Heading>
                        <Text color="gray.500">
                          Passez votre première commande pour commencer à gagner des points
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <>
                      {/* Loyalty Status Card */}
                      <Card bg="gradient.brand" borderWidth={2} borderColor="brand.200">
                        <CardBody>
                          <VStack align="stretch" spacing={6}>
                            {/* Tier Badge and Points */}
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={2}>
                                <HStack spacing={3}>
                                  <Text fontSize="4xl">{loyaltyData.tier?.icon || '⭐'}</Text>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" color="gray.600">Niveau actuel</Text>
                                    <Heading size="lg" color={`${loyaltyData.tier?.color}.600`}>
                                      {loyaltyData.tier?.name || 'Bronze'}
                                    </Heading>
                                  </VStack>
                                </HStack>
                                {loyaltyData.tier?.discount_percentage > 0 && (
                                  <Badge colorScheme="green" fontSize="sm" p={2}>
                                    {loyaltyData.tier.discount_percentage}% de réduction sur toutes vos commandes
                                  </Badge>
                                )}
                              </VStack>
                              <VStack align="end" spacing={0}>
                                <Text fontSize="sm" color="gray.600">Points disponibles</Text>
                                <Heading size="2xl" color="brand.600">
                                  {loyaltyData.points_balance}
                                </Heading>
                                <Text fontSize="xs" color="gray.500">
                                  {loyaltyData.lifetime_points} points gagnés au total
                                </Text>
                              </VStack>
                            </HStack>

                            {/* Progress to Next Tier */}
                            {nextTierProgress && !nextTierProgress.isMaxTier && (
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between" fontSize="sm">
                                  <Text color="gray.600">Progression vers {nextTierProgress.nextTier?.name}</Text>
                                  <Text fontWeight="600" color="brand.600">
                                    {nextTierProgress.pointsNeeded} points restants
                                  </Text>
                                </HStack>
                                <Box
                                  bg="gray.200"
                                  h="8px"
                                  borderRadius="full"
                                  overflow="hidden"
                                >
                                  <Box
                                    bg="brand.500"
                                    h="full"
                                    w={`${nextTierProgress.progress}%`}
                                    transition="width 0.3s"
                                  />
                                </Box>
                              </VStack>
                            )}

                            {/* Tier Benefits */}
                            {loyaltyData.tier?.benefits && loyaltyData.tier.benefits.length > 0 && (
                              <VStack align="stretch" spacing={2}>
                                <Text fontSize="sm" fontWeight="600" color="gray.700">
                                  Vos avantages actuels:
                                </Text>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                  {loyaltyData.tier.benefits.map((benefit, idx) => (
                                    <HStack key={idx} spacing={2} fontSize="sm" color="gray.600">
                                      <Text>✓</Text>
                                      <Text>{benefit}</Text>
                                    </HStack>
                                  ))}
                                </SimpleGrid>
                              </VStack>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Available Rewards */}
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Récompenses disponibles</Heading>
                        {loadingRewards ? (
                          <LoadingSpinner message="Chargement des récompenses..." />
                        ) : rewards.length === 0 ? (
                          <Text color="gray.500">Aucune récompense disponible pour le moment</Text>
                        ) : (
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {rewards.map((reward) => {
                              const canAfford = loyaltyData.points_balance >= reward.points_cost
                              return (
                                <Card
                                  key={reward.id}
                                  variant="outline"
                                  borderWidth={2}
                                  borderColor={canAfford ? 'brand.200' : 'gray.200'}
                                  opacity={canAfford ? 1 : 0.6}
                                >
                                  <CardBody>
                                    <VStack align="stretch" spacing={3}>
                                      <HStack justify="space-between">
                                        <Heading size="sm">{reward.name}</Heading>
                                        <Badge colorScheme="brand" fontSize="md" p={2}>
                                          {reward.points_cost} pts
                                        </Badge>
                                      </HStack>
                                      <Text fontSize="sm" color="gray.600">
                                        {reward.description}
                                      </Text>
                                      <Button
                                        colorScheme="brand"
                                        size="sm"
                                        isDisabled={!canAfford}
                                        onClick={async () => {
                                          try {
                                            await redeemReward(reward.id)
                                            toast({
                                              title: 'Récompense échangée !',
                                              description: `Vous avez échangé ${reward.points_cost} points pour ${reward.name}`,
                                              status: 'success',
                                              duration: 4000
                                            })
                                          } catch (err) {
                                            toast({
                                              title: 'Erreur',
                                              description: err.message,
                                              status: 'error',
                                              duration: 4000
                                            })
                                          }
                                        }}
                                      >
                                        {canAfford ? 'Échanger' : `Besoin de ${reward.points_cost - loyaltyData.points_balance} pts`}
                                      </Button>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              )
                            })}
                          </SimpleGrid>
                        )}
                      </VStack>

                      {/* My Redemptions */}
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Mes récompenses actives</Heading>
                        {loadingRedemptions ? (
                          <LoadingSpinner message="Chargement..." />
                        ) : redemptions.filter(r => r.status === 'active').length === 0 ? (
                          <Text color="gray.500" fontSize="sm">
                            Aucune récompense active. Échangez vos points ci-dessus !
                          </Text>
                        ) : (
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {redemptions
                              .filter(r => r.status === 'active')
                              .map((redemption) => (
                                <Card key={redemption.id} variant="outline">
                                  <CardBody>
                                    <VStack align="stretch" spacing={2}>
                                      <HStack justify="space-between">
                                        <Text fontWeight="600">{redemption.reward?.name}</Text>
                                        <Badge colorScheme="green">Active</Badge>
                                      </HStack>
                                      <Text fontSize="sm" color="gray.600">
                                        {redemption.reward?.description}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500">
                                        Expire le {new Date(redemption.expires_at).toLocaleDateString('fr-FR')}
                                      </Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              ))}
                          </SimpleGrid>
                        )}
                      </VStack>

                      {/* Transaction History */}
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Historique des points</Heading>
                        {loadingTransactions ? (
                          <LoadingSpinner message="Chargement..." />
                        ) : transactions.length === 0 ? (
                          <Text color="gray.500" fontSize="sm">Aucune transaction</Text>
                        ) : (
                          <Card>
                            <CardBody>
                              <VStack align="stretch" spacing={3} divider={<Divider />}>
                                {transactions.map((transaction) => (
                                  <HStack key={transaction.id} justify="space-between">
                                    <VStack align="start" spacing={0} flex={1}>
                                      <Text fontSize="sm" fontWeight="500">
                                        {transaction.reason}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500">
                                        {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </Text>
                                    </VStack>
                                    <Text
                                      fontSize="md"
                                      fontWeight="600"
                                      color={transaction.points > 0 ? 'green.600' : 'red.600'}
                                    >
                                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                                    </Text>
                                  </HStack>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>
                        )}
                      </VStack>
                    </>
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
                          Voir la carte
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

              {/* Reviews Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="600">
                    Mes avis
                  </Text>

                  {loadingReviews ? (
                    <LoadingSpinner message="Chargement des avis..." />
                  ) : userReviews.length === 0 ? (
                    <Box bg="white" p={12} borderRadius="xl" boxShadow="md" textAlign="center">
                      <VStack spacing={4}>
                        <Text fontSize="4xl">⭐</Text>
                        <Heading size="md" color="gray.600">
                          Aucun avis
                        </Heading>
                        <Text color="gray.500">
                          Commandez et recevez des plats pour laisser des avis
                        </Text>
                        <Button
                          as="a"
                          href="/catalogue"
                          colorScheme="brand"
                          size="lg"
                        >
                          Voir la carte
                        </Button>
                      </VStack>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {userReviews.map((review) => (
                        <Card key={review.id}>
                          <CardBody>
                            <VStack align="stretch" spacing={4}>
                              {/* Header with dish info */}
                              <HStack justify="space-between" align="start">
                                <HStack spacing={3}>
                                  {review.dish?.image_url && (
                                    <Box
                                      w="60px"
                                      h="60px"
                                      bgImage={`url(${review.dish.image_url})`}
                                      bgSize="cover"
                                      bgPosition="center"
                                      borderRadius="md"
                                    />
                                  )}
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="600" fontSize="md">
                                      {review.dish?.name}
                                    </Text>
                                    <StarRating rating={review.rating} size="sm" />
                                    <Text fontSize="xs" color="gray.500">
                                      {new Date(review.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={async () => {
                                    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
                                      const { error } = await deleteReview(review.id)
                                      if (error) {
                                        toast({
                                          title: 'Erreur',
                                          description: error,
                                          status: 'error',
                                          duration: 3000
                                        })
                                      } else {
                                        toast({
                                          title: 'Avis supprimé',
                                          status: 'info',
                                          duration: 2000
                                        })
                                        refreshReviews()
                                      }
                                    }
                                  }}
                                  isLoading={deletingReview}
                                  aria-label="Supprimer"
                                />
                              </HStack>

                              {/* Review content */}
                              {review.title && (
                                <Text fontWeight="600" fontSize="md">
                                  {review.title}
                                </Text>
                              )}
                              {review.comment && (
                                <Text fontSize="sm" color="gray.700">
                                  {review.comment}
                                </Text>
                              )}

                              {/* Status badges */}
                              <HStack spacing={2}>
                                {review.is_verified_purchase && (
                                  <Badge colorScheme="green" fontSize="xs">
                                    ✓ Achat vérifié
                                  </Badge>
                                )}
                                {review.is_approved ? (
                                  <Badge colorScheme="green" fontSize="xs">
                                    Publié
                                  </Badge>
                                ) : (
                                  <Badge colorScheme="orange" fontSize="xs">
                                    En attente de modération
                                  </Badge>
                                )}
                                <Badge fontSize="xs">
                                  {review.helpful_count} 👍
                                </Badge>
                              </HStack>

                              <Divider />

                              <Button
                                as="a"
                                href={`/catalogue?dish=${review.dish_id}`}
                                size="sm"
                                variant="outline"
                                colorScheme="brand"
                              >
                                Voir le plat
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </TabPanel>

              {/* Newsletter Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Newsletter</Heading>

                  {loadingNewsletter ? (
                    <LoadingSpinner message="Chargement..." />
                  ) : (
                    <Card>
                      <CardBody>
                        <VStack align="stretch" spacing={6}>
                          <VStack align="start" spacing={3}>
                            <HStack justify="space-between" w="full">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="600" fontSize="lg">
                                  Abonnement newsletter
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  Gérez vos préférences d'emails marketing
                                </Text>
                              </VStack>
                              <Badge
                                colorScheme={isSubscribed ? 'green' : 'gray'}
                                fontSize="md"
                                px={3}
                                py={1}
                              >
                                {isSubscribed ? 'Actif' : 'Inactif'}
                              </Badge>
                            </HStack>

                            <Divider />

                            {isSubscribed ? (
                              <>
                                <VStack align="start" spacing={3} w="full">
                                  <Text fontWeight="600">Je souhaite recevoir :</Text>
                                  <Stack spacing={3}>
                                    <Checkbox
                                      isChecked={subscription?.preferences?.weekly_newsletter}
                                      onChange={async (e) => {
                                        const newPrefs = {
                                          ...subscription.preferences,
                                          weekly_newsletter: e.target.checked
                                        }
                                        const { error } = await updatePreferences(newPrefs)
                                        if (error) {
                                          toast({
                                            title: 'Erreur',
                                            description: error,
                                            status: 'error',
                                            duration: 3000
                                          })
                                        } else {
                                          toast({
                                            title: 'Préférences mises à jour',
                                            status: 'success',
                                            duration: 2000
                                          })
                                        }
                                      }}
                                      colorScheme="brand"
                                    >
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="500">Newsletter hebdomadaire</Text>
                                        <Text fontSize="xs" color="gray.600">
                                          Nouveaux plats et actualités chaque semaine
                                        </Text>
                                      </VStack>
                                    </Checkbox>

                                    <Checkbox
                                      isChecked={subscription?.preferences?.promotions}
                                      onChange={async (e) => {
                                        const newPrefs = {
                                          ...subscription.preferences,
                                          promotions: e.target.checked
                                        }
                                        const { error } = await updatePreferences(newPrefs)
                                        if (error) {
                                          toast({
                                            title: 'Erreur',
                                            description: error,
                                            status: 'error',
                                            duration: 3000
                                          })
                                        } else {
                                          toast({
                                            title: 'Préférences mises à jour',
                                            status: 'success',
                                            duration: 2000
                                          })
                                        }
                                      }}
                                      colorScheme="brand"
                                    >
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="500">Offres promotionnelles</Text>
                                        <Text fontSize="xs" color="gray.600">
                                          Codes promo et offres spéciales
                                        </Text>
                                      </VStack>
                                    </Checkbox>

                                    <Checkbox
                                      isChecked={subscription?.preferences?.product_updates}
                                      onChange={async (e) => {
                                        const newPrefs = {
                                          ...subscription.preferences,
                                          product_updates: e.target.checked
                                        }
                                        const { error } = await updatePreferences(newPrefs)
                                        if (error) {
                                          toast({
                                            title: 'Erreur',
                                            description: error,
                                            status: 'error',
                                            duration: 3000
                                          })
                                        } else {
                                          toast({
                                            title: 'Préférences mises à jour',
                                            status: 'success',
                                            duration: 2000
                                          })
                                        }
                                      }}
                                      colorScheme="brand"
                                    >
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="500">Nouveaux plats et mises à jour</Text>
                                        <Text fontSize="xs" color="gray.600">
                                          Soyez informé de nos nouvelles créations
                                        </Text>
                                      </VStack>
                                    </Checkbox>
                                  </Stack>
                                </VStack>

                                <Divider />

                                <Button
                                  variant="ghost"
                                  colorScheme="red"
                                  size="sm"
                                  onClick={async () => {
                                    if (confirm('Êtes-vous sûr de vouloir vous désabonner ?')) {
                                      const { error } = await unsubscribeNewsletter()
                                      if (error) {
                                        toast({
                                          title: 'Erreur',
                                          description: error,
                                          status: 'error',
                                          duration: 3000
                                        })
                                      } else {
                                        toast({
                                          title: 'Vous êtes désabonné',
                                          description: 'Vous ne recevrez plus nos emails',
                                          status: 'info',
                                          duration: 3000
                                        })
                                      }
                                    }
                                  }}
                                >
                                  Se désabonner
                                </Button>
                              </>
                            ) : (
                              <VStack spacing={4} py={8}>
                                <Text color="gray.600" textAlign="center">
                                  Vous n'êtes pas abonné à notre newsletter
                                </Text>
                                <Button
                                  colorScheme="brand"
                                  onClick={async () => {
                                    const { error } = await subscribeNewsletter(user.email, 'account')
                                    if (error) {
                                      toast({
                                        title: 'Erreur',
                                        description: error,
                                        status: 'error',
                                        duration: 3000
                                      })
                                    } else {
                                      toast({
                                        title: 'Inscription confirmée !',
                                        description: 'Vous recevrez nos prochaines newsletters',
                                        status: 'success',
                                        duration: 3000
                                      })
                                    }
                                  }}
                                >
                                  S'abonner à la newsletter
                                </Button>
                              </VStack>
                            )}
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Notifications Push</Heading>
                  <Card>
                    <CardBody>
                      <NotificationSettings />
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Referral Tab */}
              <TabPanel>
                <ReferralDashboard />
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
