import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  Divider,
  SimpleGrid,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Icon,
  Wrap,
  WrapItem,
  useToast
} from '@chakra-ui/react'
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiPackage,
  FiTag,
  FiTruck,
  FiStar
} from 'react-icons/fi'
import { useOrderDetails } from '../../hooks/useOrderDetails'
import { useEmail } from '../../hooks/useEmail'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const ORDER_STATUSES = {
  pending: { label: 'En attente', color: 'yellow' },
  confirmed: { label: 'Confirmée', color: 'blue' },
  preparing: { label: 'En préparation', color: 'purple' },
  ready: { label: 'Prête', color: 'cyan' },
  in_transit: { label: 'En livraison', color: 'orange' },
  delivered: { label: 'Livrée', color: 'green' },
  cancelled: { label: 'Annulée', color: 'red' }
}

export default function AdminOrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { order, loading, error } = useOrderDetails(orderId)
  const { sendReviewRequest, sending } = useEmail()
  const toast = useToast()
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  const handleSendReviewRequest = async () => {
    if (!order?.user_email) {
      toast({
        title: 'Erreur',
        description: 'Email utilisateur non trouvé',
        status: 'error',
        duration: 3000
      })
      return
    }

    const result = await sendReviewRequest(order, order.user_email)

    if (result.success) {
      toast({
        title: 'Email envoyé !',
        description: 'La demande d\'avis a été envoyée au client',
        status: 'success',
        duration: 4000,
        position: 'bottom-right'
      })
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible d\'envoyer l\'email',
        status: 'error',
        duration: 4000
      })
    }
  }

  if (loading) {
    return <LoadingSpinner message="Chargement des détails de la commande..." />
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            Erreur lors du chargement : {error}
          </Alert>
          <Button leftIcon={<FiArrowLeft />} onClick={() => navigate('/admin/orders')}>
            Retour aux commandes
          </Button>
        </VStack>
      </Container>
    )
  }

  if (!order) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            Commande non trouvée
          </Alert>
          <Button leftIcon={<FiArrowLeft />} onClick={() => navigate('/admin/orders')}>
            Retour aux commandes
          </Button>
        </VStack>
      </Container>
    )
  }

  const statusConfig = ORDER_STATUSES[order.status]

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack spacing={4}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => navigate('/admin/orders')}
              >
                Retour
              </Button>
              <Box>
                <Heading size="lg">Commande #{order.order_number}</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Créée le{' '}
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </Box>
            </HStack>
            <Badge colorScheme={statusConfig.color} fontSize="lg" px={4} py={2}>
              {statusConfig.label}
            </Badge>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
            {/* Left Column - Order Summary */}
            <VStack spacing={6} align="stretch" gridColumn={{ lg: 'span 2' }}>
              {/* Items */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    <HStack spacing={2}>
                      <Icon as={FiPackage} />
                      <Text>Articles commandés</Text>
                    </HStack>
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    {order.order_items?.map((item) => (
                      <HStack key={item.id} spacing={4} align="start">
                        {item.dishes?.image_url && (
                          <Image
                            src={item.dishes.image_url}
                            alt={item.dish_name}
                            boxSize="80px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        )}
                        <VStack align="start" flex={1} spacing={1}>
                          <Text fontWeight="600" fontSize="lg">
                            {item.dish_name}
                          </Text>
                          {item.dishes?.description && (
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {item.dishes.description}
                            </Text>
                          )}
                          {item.dishes?.dietary_tags && item.dishes.dietary_tags.length > 0 && (
                            <Wrap spacing={1}>
                              {item.dishes.dietary_tags.map((tag) => (
                                <WrapItem key={tag}>
                                  <Badge size="sm" colorScheme="green">
                                    {tag}
                                  </Badge>
                                </WrapItem>
                              ))}
                            </Wrap>
                          )}
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text fontSize="sm" color="gray.600">
                            Qté: {item.quantity}
                          </Text>
                          <Text fontWeight="600">{item.dish_price.toFixed(2)}€</Text>
                          <Text fontSize="sm" color="gray.600">
                            Total: {item.subtotal.toFixed(2)}€
                          </Text>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>

                  <Divider my={4} />

                  {/* Price Breakdown */}
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text>Sous-total</Text>
                      <Text fontWeight="600">{order.subtotal.toFixed(2)}€</Text>
                    </HStack>

                    {order.discount_amount > 0 && (
                      <HStack justify="space-between" color="green.600">
                        <HStack>
                          <Icon as={FiTag} />
                          <Text>
                            Remise
                            {order.promo_codes && ` (${order.promo_codes.code})`}
                          </Text>
                        </HStack>
                        <Text fontWeight="600">-{order.discount_amount.toFixed(2)}€</Text>
                      </HStack>
                    )}

                    {order.delivery_fee > 0 && (
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiTruck} />
                          <Text>Frais de livraison</Text>
                        </HStack>
                        <Text fontWeight="600">{order.delivery_fee.toFixed(2)}€</Text>
                      </HStack>
                    )}

                    <Divider />

                    <HStack justify="space-between" fontSize="xl">
                      <Text fontWeight="bold">Total</Text>
                      <Text fontWeight="bold" color="brand.600">
                        {order.total.toFixed(2)}€
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    <HStack spacing={2}>
                      <Icon as={FiMapPin} />
                      <Text>Informations de livraison</Text>
                    </HStack>
                  </Heading>
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} color="gray.500" />
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Date de livraison
                        </Text>
                        <Text fontWeight="600">
                          {new Date(order.delivery_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack spacing={2}>
                      <Icon as={FiClock} color="gray.500" />
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Créneau horaire
                        </Text>
                        <Text fontWeight="600">{order.delivery_time}</Text>
                      </Box>
                    </HStack>

                    <Divider />

                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Adresse de livraison
                      </Text>
                      <Text fontWeight="600">{order.delivery_street}</Text>
                      <Text>
                        {order.delivery_postal_code} {order.delivery_city}
                      </Text>
                      {order.delivery_additional_info && (
                        <Text fontSize="sm" color="gray.600" mt={2}>
                          Info: {order.delivery_additional_info}
                        </Text>
                      )}
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Notes */}
              {order.notes && (
                <Card>
                  <CardBody>
                    <Heading size="md" mb={3}>
                      Notes de commande
                    </Heading>
                    <Text color="gray.700">{order.notes}</Text>
                  </CardBody>
                </Card>
              )}

              {/* Cancellation Reason */}
              {order.status === 'cancelled' && order.admin_notes && (
                <Card bg="red.50" borderColor="red.200" borderWidth={1}>
                  <CardBody>
                    <Heading size="md" mb={3} color="red.700">
                      Motif d'annulation
                    </Heading>
                    <Text color="red.800">{order.admin_notes}</Text>
                  </CardBody>
                </Card>
              )}
            </VStack>

            {/* Right Column - Customer Info */}
            <VStack spacing={6} align="stretch">
              {/* Customer Info */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    <HStack spacing={2}>
                      <Icon as={FiUser} />
                      <Text>Client</Text>
                    </HStack>
                  </Heading>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontSize="sm" color="gray.600">
                        Nom
                      </Text>
                      <Text fontWeight="600">
                        {order.user?.full_name || 'Non renseigné'}
                      </Text>
                    </Box>

                    {order.user?.email && (
                      <HStack spacing={2}>
                        <Icon as={FiMail} color="gray.500" />
                        <Box flex={1}>
                          <Text fontSize="sm" color="gray.600">
                            Email
                          </Text>
                          <Text fontWeight="600" fontSize="sm" wordBreak="break-all">
                            {order.user.email}
                          </Text>
                        </Box>
                      </HStack>
                    )}

                    {order.user?.phone && (
                      <HStack spacing={2}>
                        <Icon as={FiPhone} color="gray.500" />
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Téléphone
                          </Text>
                          <Text fontWeight="600">{order.user.phone}</Text>
                        </Box>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Order Statistics */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Statistiques
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    <Stat>
                      <StatLabel>Articles</StatLabel>
                      <StatNumber>{order.order_items?.length || 0}</StatNumber>
                      <StatHelpText>
                        {order.order_items?.reduce((sum, item) => sum + item.quantity, 0)} unités
                        au total
                      </StatHelpText>
                    </Stat>

                    <Divider />

                    <Stat>
                      <StatLabel>Montant</StatLabel>
                      <StatNumber color="brand.600">{order.total.toFixed(2)}€</StatNumber>
                      {order.discount_amount > 0 && (
                        <StatHelpText color="green.600">
                          Économie de {order.discount_amount.toFixed(2)}€
                        </StatHelpText>
                      )}
                    </Stat>

                    <Divider />

                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Méthode de paiement
                      </Text>
                      <Badge colorScheme="blue">{order.payment_method || 'Carte bancaire'}</Badge>
                    </Box>

                    {order.stripe_payment_id && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          ID Stripe
                        </Text>
                        <Text fontSize="xs" fontFamily="mono">
                          {order.stripe_payment_id}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>
                    Actions rapides
                  </Heading>
                  <VStack align="stretch" spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/customers`)}
                    >
                      Voir profil client
                    </Button>
                    <Button size="sm" variant="outline" isDisabled>
                      Imprimer bon de commande
                    </Button>
                    <Button size="sm" variant="outline" isDisabled>
                      Envoyer email client
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon as={FiStar} />}
                      colorScheme="purple"
                      onClick={handleSendReviewRequest}
                      isLoading={sending}
                      isDisabled={order?.status !== 'delivered'}
                    >
                      Demander un avis
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
