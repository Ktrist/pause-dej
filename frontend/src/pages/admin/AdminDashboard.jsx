import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Icon,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react'
import {
  FiDollarSign,
  FiShoppingCart,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAdminStats, useLiveOrders } from '../../hooks/useAdminStats'

const StatCard = ({ title, value, icon, helpText, colorScheme = 'brand' }) => {
  const bgColor = useColorModeValue('white', 'gray.800')

  return (
    <Card bg={bgColor}>
      <CardBody>
        <Stat>
          <HStack justify="space-between" mb={2}>
            <StatLabel fontSize="sm" fontWeight="medium" color="gray.600">
              {title}
            </StatLabel>
            <Icon as={icon} boxSize={5} color={`${colorScheme}.500`} />
          </HStack>
          <StatNumber fontSize="3xl" fontWeight="bold" color={`${colorScheme}.600`}>
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" color="gray.500">
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  )
}

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { label: 'En attente', colorScheme: 'yellow' },
    confirmed: { label: 'Confirmée', colorScheme: 'blue' },
    preparing: { label: 'En préparation', colorScheme: 'purple' },
    ready: { label: 'Prête', colorScheme: 'cyan' },
    in_transit: { label: 'En livraison', colorScheme: 'orange' },
    delivered: { label: 'Livrée', colorScheme: 'green' },
    cancelled: { label: 'Annulée', colorScheme: 'red' }
  }

  const config = statusConfig[status] || { label: status, colorScheme: 'gray' }

  return (
    <Badge colorScheme={config.colorScheme} fontSize="xs">
      {config.label}
    </Badge>
  )
}

export default function AdminDashboard() {
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useAdminStats()
  const { orders, loading: ordersLoading, error: ordersError, refresh: refreshOrders } = useLiveOrders()
  const navigate = useNavigate()
  const bgColor = useColorModeValue('white', 'gray.800')

  const handleRefresh = () => {
    refreshStats()
    refreshOrders()
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">Dashboard</Heading>
          <Text color="gray.600" mt={1}>
            Vue d'ensemble des opérations en temps réel
          </Text>
        </Box>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={handleRefresh}
          variant="outline"
          isLoading={statsLoading || ordersLoading}
        >
          Actualiser
        </Button>
      </HStack>

      {/* Stats Error */}
      {statsError && (
        <Alert status="error" rounded="lg">
          <AlertIcon />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>{statsError}</AlertDescription>
        </Alert>
      )}

      {/* Low Stock Alerts */}
      {stats?.lowStockAlerts > 0 && (
        <Alert status="warning" rounded="lg">
          <AlertIcon />
          <AlertTitle>Alertes de stock</AlertTitle>
          <AlertDescription>
            {stats.lowStockAlerts} plat(s) en rupture ou stock faible
          </AlertDescription>
          <Button
            ml="auto"
            size="sm"
            colorScheme="orange"
            onClick={() => navigate('/admin/dishes')}
          >
            Gérer les stocks
          </Button>
        </Alert>
      )}

      {/* KPI Cards (A1.1) */}
      {statsLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="brand.500" />
        </Box>
      ) : stats ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard
            title="Chiffre d'affaires du jour"
            value={`${stats.totalRevenue.toFixed(2)}€`}
            icon={FiDollarSign}
            helpText="Aujourd'hui"
            colorScheme="green"
          />
          <StatCard
            title="Commandes totales"
            value={stats.totalOrders}
            icon={FiShoppingCart}
            helpText={`${stats.deliveredOrders} livrées`}
            colorScheme="blue"
          />
          <StatCard
            title="En préparation"
            value={stats.preparingOrders}
            icon={FiClock}
            helpText={`${stats.pendingOrders} en attente`}
            colorScheme="purple"
          />
          <StatCard
            title="En livraison"
            value={stats.inTransitOrders}
            icon={FiTruck}
            helpText="Livreurs actifs"
            colorScheme="orange"
          />
        </SimpleGrid>
      ) : null}

      {/* Live Orders (A1.2) */}
      <Card bg={bgColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Box>
              <Heading size="md">Commandes en direct</Heading>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Dernières commandes et statuts en temps réel
              </Text>
            </Box>
            <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
              Auto-refresh
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          {ordersError ? (
            <Alert status="error">
              <AlertIcon />
              {ordersError}
            </Alert>
          ) : ordersLoading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="lg" color="brand.500" />
            </Box>
          ) : orders.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">Aucune commande pour le moment</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>N° Commande</Th>
                    <Th>Client</Th>
                    <Th>Articles</Th>
                    <Th>Total</Th>
                    <Th>Statut</Th>
                    <Th>Livraison</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orders.slice(0, 20).map((order) => (
                    <Tr key={order.id}>
                      <Td fontFamily="mono" fontWeight="semibold" fontSize="sm">
                        {order.order_number}
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {order.user?.full_name || 'N/A'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {order.user?.phone || order.user?.email}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {order.order_items?.length || 0} article(s)
                        </Text>
                      </Td>
                      <Td fontWeight="semibold" fontSize="sm">
                        {parseFloat(order.total).toFixed(2)}€
                      </Td>
                      <Td>{getStatusBadge(order.status)}</Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="medium">
                            {order.delivery_date}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {order.delivery_time}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Button
                          size="xs"
                          colorScheme="brand"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          Détails
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card bg={bgColor} cursor="pointer" onClick={() => navigate('/admin/dishes')} _hover={{ shadow: 'lg' }}>
          <CardBody textAlign="center">
            <Icon as={FiShoppingCart} boxSize={8} color="brand.500" mb={3} />
            <Heading size="sm" mb={2}>Gérer les plats</Heading>
            <Text fontSize="sm" color="gray.600">
              Ajouter, modifier ou désactiver des plats
            </Text>
          </CardBody>
        </Card>

        <Card bg={bgColor} cursor="pointer" onClick={() => navigate('/admin/orders')} _hover={{ shadow: 'lg' }}>
          <CardBody textAlign="center">
            <Icon as={FiClock} boxSize={8} color="purple.500" mb={3} />
            <Heading size="sm" mb={2}>Vue cuisine</Heading>
            <Text fontSize="sm" color="gray.600">
              Interface optimisée pour la cuisine
            </Text>
          </CardBody>
        </Card>

        <Card bg={bgColor} cursor="pointer" onClick={() => navigate('/admin/customers')} _hover={{ shadow: 'lg' }}>
          <CardBody textAlign="center">
            <Icon as={FiCheckCircle} boxSize={8} color="green.500" mb={3} />
            <Heading size="sm" mb={2}>Gestion clients</Heading>
            <Text fontSize="sm" color="gray.600">
              Voir les clients et leurs commandes
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  )
}
