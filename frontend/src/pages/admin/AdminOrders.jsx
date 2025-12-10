import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Icon,
  IconButton,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  Divider,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react'
import {
  FiClock,
  FiCheck,
  FiTruck,
  FiX,
  FiRefreshCw,
  FiEye
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAdminOrders } from '../../hooks/useAdminOrders'
import { useEmail } from '../../hooks/useEmail'

const ORDER_STATUSES = {
  pending: { label: 'En attente', color: 'yellow', next: 'preparing' },
  confirmed: { label: 'Confirmée', color: 'blue', next: 'preparing' },
  preparing: { label: 'En préparation', color: 'purple', next: 'ready' },
  ready: { label: 'Prête', color: 'cyan', next: 'in_transit' },
  in_transit: { label: 'En livraison', color: 'orange', next: 'delivered' },
  delivered: { label: 'Livrée', color: 'green', next: null },
  cancelled: { label: 'Annulée', color: 'red', next: null }
}

const OrderCard = ({ order, onStatusChange, onCancel, onViewDetails }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const statusConfig = ORDER_STATUSES[order.status]

  const handleNextStatus = () => {
    if (statusConfig.next) {
      onStatusChange(order.id, statusConfig.next)
    }
  }

  // Group items by dish for kitchen view
  const groupedItems = order.order_items?.reduce((acc, item) => {
    const key = item.dish_id
    if (!acc[key]) {
      acc[key] = {
        dish_name: item.dishes?.name || item.dish_name,
        quantity: 0,
        image_url: item.dishes?.image_url
      }
    }
    acc[key].quantity += item.quantity
    return acc
  }, {})

  return (
    <Card bg={bgColor} shadow="md" _hover={{ shadow: 'lg' }} transition="all 0.2s">
      <CardBody>
        <VStack align="stretch" spacing={4}>
          {/* Header */}
          <HStack justify="space-between">
            <Box>
              <Text fontFamily="mono" fontWeight="bold" fontSize="lg">
                {order.order_number}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </Box>
            <Badge colorScheme={statusConfig.color} fontSize="md" px={3} py={1}>
              {statusConfig.label}
            </Badge>
          </HStack>

          <Divider />

          {/* Items grouped for kitchen */}
          <VStack align="stretch" spacing={2}>
            {Object.values(groupedItems || {}).map((item, idx) => (
              <HStack key={idx} justify="space-between">
                <HStack>
                  <Badge colorScheme="brand" fontSize="lg" px={3} py={1}>
                    {item.quantity}×
                  </Badge>
                  <Text fontWeight="medium">{item.dish_name}</Text>
                </HStack>
              </HStack>
            ))}
          </VStack>

          <Divider />

          {/* Delivery Info */}
          <Box>
            <Text fontSize="sm" color="gray.600">
              Livraison : {order.delivery_date} à {order.delivery_time}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {order.delivery_street}, {order.delivery_city}
            </Text>
            {order.delivery_additional_info && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                {order.delivery_additional_info}
              </Text>
            )}
          </Box>

          <Divider />

          {/* Actions */}
          <HStack spacing={2}>
            {statusConfig.next && order.status !== 'cancelled' && (
              <Button
                leftIcon={<FiCheck />}
                colorScheme="green"
                size="sm"
                flex={1}
                onClick={handleNextStatus}
              >
                {ORDER_STATUSES[statusConfig.next].label}
              </Button>
            )}
            <IconButton
              icon={<FiEye />}
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(order.id)}
              aria-label="View details"
            />
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <IconButton
                icon={<FiX />}
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={() => onCancel(order)}
                aria-label="Cancel"
              />
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

const CancelModal = ({ isOpen, onClose, order, onConfirm }) => {
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const handleConfirm = async () => {
    setCancelling(true)
    await onConfirm(order.id, reason)
    setCancelling(false)
    onClose()
    setReason('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Annuler la commande</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Êtes-vous sûr de vouloir annuler la commande{' '}
              <Text as="span" fontWeight="bold">
                {order?.order_number}
              </Text>
              ?
            </Text>
            <FormControl>
              <FormLabel>Raison de l'annulation</FormLabel>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Ingrédients manquants, problème de livraison..."
                rows={3}
              />
            </FormControl>
            <Alert status="warning" fontSize="sm">
              <AlertIcon />
              Le client sera notifié de l'annulation
            </Alert>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Retour
          </Button>
          <Button
            colorScheme="red"
            onClick={handleConfirm}
            isLoading={cancelling}
          >
            Confirmer l'annulation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function AdminOrders() {
  const { orders, loading, error, refresh, updateOrderStatus, cancelOrder } = useAdminOrders()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()
  const {
    sendOrderPreparing,
    sendOrderInTransit,
    sendOrderDelivered,
    sendOrderCancelled
  } = useEmail()

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await updateOrderStatus(orderId, newStatus)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Statut mis à jour',
        description: `Commande passée à "${ORDER_STATUSES[newStatus].label}"`,
        status: 'success',
        duration: 3000
      })

      // Send email based on new status
      const order = orders.find(o => o.id === orderId)
      if (order && order.users?.email) {
        try {
          if (newStatus === 'preparing') {
            await sendOrderPreparing(order, order.users.email)
          } else if (newStatus === 'in_transit') {
            await sendOrderInTransit(order, order.users.email)
          } else if (newStatus === 'delivered') {
            await sendOrderDelivered(order, order.users.email)
          }
        } catch (emailError) {
          console.error('Failed to send email:', emailError)
          // Don't show error to admin - email is secondary
        }
      }
    }
  }

  const handleCancelClick = (order) => {
    setSelectedOrder(order)
    onOpen()
  }

  const handleCancelConfirm = async (orderId, reason) => {
    const { error } = await cancelOrder(orderId, reason)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Commande annulée',
        status: 'success',
        duration: 3000
      })

      // Send cancellation email
      const order = orders.find(o => o.id === orderId)
      if (order && order.users?.email) {
        try {
          await sendOrderCancelled(order, order.users.email, reason)
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError)
        }
      }
    }
  }

  const handleViewDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`)
  }

  // Filter orders by status
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed')
  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const readyOrders = orders.filter(o => o.status === 'ready')
  const inTransitOrders = orders.filter(o => o.status === 'in_transit')
  const completedOrders = orders.filter(o => o.status === 'delivered')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">Gestion des commandes</Heading>
          <Text color="gray.600" mt={1}>
            Vue cuisine optimisée pour la préparation
          </Text>
        </Box>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={refresh}
          variant="outline"
          isLoading={loading}
        >
          Actualiser
        </Button>
      </HStack>

      {/* Error Alert */}
      {error && (
        <Alert status="error" rounded="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="brand.500" />
        </Box>
      ) : (
        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>
              En attente
              {pendingOrders.length > 0 && (
                <Badge ml={2} colorScheme="yellow">
                  {pendingOrders.length}
                </Badge>
              )}
            </Tab>
            <Tab>
              En préparation
              {preparingOrders.length > 0 && (
                <Badge ml={2} colorScheme="purple">
                  {preparingOrders.length}
                </Badge>
              )}
            </Tab>
            <Tab>
              Prêtes
              {readyOrders.length > 0 && (
                <Badge ml={2} colorScheme="cyan">
                  {readyOrders.length}
                </Badge>
              )}
            </Tab>
            <Tab>
              En livraison
              {inTransitOrders.length > 0 && (
                <Badge ml={2} colorScheme="orange">
                  {inTransitOrders.length}
                </Badge>
              )}
            </Tab>
            <Tab>Livrées ({completedOrders.length})</Tab>
            <Tab>Annulées ({cancelledOrders.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {pendingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onCancel={handleCancelClick}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </SimpleGrid>
              {pendingOrders.length === 0 && (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">Aucune commande en attente</Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {preparingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onCancel={handleCancelClick}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </SimpleGrid>
              {preparingOrders.length === 0 && (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">Aucune commande en préparation</Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {readyOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onCancel={handleCancelClick}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </SimpleGrid>
              {readyOrders.length === 0 && (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">Aucune commande prête</Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {inTransitOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onCancel={handleCancelClick}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </SimpleGrid>
              {inTransitOrders.length === 0 && (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">Aucune commande en livraison</Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {completedOrders.slice(0, 20).map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onCancel={handleCancelClick}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {cancelledOrders.slice(0, 20).map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onCancel={handleCancelClick}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      {/* Cancel Modal */}
      <CancelModal
        isOpen={isOpen}
        onClose={onClose}
        order={selectedOrder}
        onConfirm={handleCancelConfirm}
      />
    </VStack>
  )
}
