import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Badge,
  useColorModeValue,
  Alert,
  AlertIcon,
  Icon,
  Divider
} from '@chakra-ui/react'
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiPackage,
  FiMapPin,
  FiClock,
  FiCalendar
} from 'react-icons/fi'
import { useAdminAnalytics } from '../../hooks/useAdminAnalytics'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const StatCard = ({ title, value, subtitle, icon, growth, colorScheme = 'blue' }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const iconBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`)
  const iconColor = useColorModeValue(`${colorScheme}.600`, `${colorScheme}.200`)

  return (
    <Card bg={bgColor}>
      <CardBody>
        <HStack spacing={4}>
          <Box p={3} bg={iconBg} borderRadius="lg">
            <Icon as={icon} boxSize={6} color={iconColor} />
          </Box>
          <Stat flex={1}>
            <StatLabel fontSize="sm" color="gray.600">
              {title}
            </StatLabel>
            <StatNumber fontSize="2xl">{value}</StatNumber>
            {subtitle && (
              <StatHelpText mb={0}>
                {growth !== undefined && growth !== null && (
                  <StatArrow type={growth >= 0 ? 'increase' : 'decrease'} />
                )}
                {subtitle}
              </StatHelpText>
            )}
          </Stat>
        </HStack>
      </CardBody>
    </Card>
  )
}

const MiniBarChart = ({ data, maxValue }) => {
  return (
    <HStack spacing={1} align="flex-end" h="60px">
      {data.map((value, index) => {
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0
        return (
          <Box
            key={index}
            flex={1}
            bg="brand.500"
            height={`${height}%`}
            borderRadius="sm"
            minH="2px"
          />
        )
      })}
    </HStack>
  )
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30days')
  const { analytics, loading, error } = useAdminAnalytics(period)
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  if (loading) {
    return <LoadingSpinner message="Chargement des analytics..." />
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Erreur lors du chargement des analytics: {error}
        </Alert>
      </Container>
    )
  }

  if (!analytics) {
    return null
  }

  const { summary, ordersByStatus, revenueTimeSeries, topDishes, revenueByCategory, topZones, ordersByHour, ordersByDay } = analytics

  // Calculate max values for charts
  const maxRevenueInDay = Math.max(...revenueTimeSeries.map(d => d.revenue), 1)
  const maxOrdersInDay = Math.max(...revenueTimeSeries.map(d => d.orders), 1)

  // Prepare data for hour chart (0-23 hours)
  const hourData = Array.from({ length: 24 }, (_, i) => ordersByHour[i] || 0)
  const maxOrdersInHour = Math.max(...hourData, 1)

  // Status translations
  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    ready: 'Prête',
    in_transit: 'En livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }

  const statusColors = {
    pending: 'yellow',
    confirmed: 'blue',
    preparing: 'purple',
    ready: 'cyan',
    in_transit: 'orange',
    delivered: 'green',
    cancelled: 'red'
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="lg">Analytics</Heading>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            maxW="200px"
            bg={useColorModeValue('white', 'gray.800')}
          >
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="90days">90 derniers jours</option>
            <option value="1year">1 an</option>
          </Select>
        </HStack>

        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <StatCard
            title="Revenu Total"
            value={`${summary.totalRevenue.toFixed(2)}€`}
            subtitle={summary.revenueGrowth >= 0
              ? `+${summary.revenueGrowth.toFixed(1)}% vs période précédente`
              : `${summary.revenueGrowth.toFixed(1)}% vs période précédente`
            }
            growth={summary.revenueGrowth}
            icon={FiDollarSign}
            colorScheme="green"
          />
          <StatCard
            title="Commandes"
            value={summary.totalOrders}
            subtitle={summary.ordersGrowth >= 0
              ? `+${summary.ordersGrowth.toFixed(1)}% vs période précédente`
              : `${summary.ordersGrowth.toFixed(1)}% vs période précédente`
            }
            growth={summary.ordersGrowth}
            icon={FiShoppingBag}
            colorScheme="blue"
          />
          <StatCard
            title="Panier Moyen"
            value={`${summary.averageOrderValue.toFixed(2)}€`}
            subtitle={`${summary.totalCustomers} clients uniques`}
            icon={FiTrendingUp}
            colorScheme="purple"
          />
          <StatCard
            title="Clients Fidèles"
            value={`${summary.repeatCustomerRate.toFixed(1)}%`}
            subtitle="Taux de clients répétés"
            icon={FiUsers}
            colorScheme="orange"
          />
        </SimpleGrid>

        {/* Revenue & Orders Timeline */}
        <Card>
          <CardHeader>
            <Heading size="md">Évolution du Chiffre d'Affaires</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Revenu par jour (max: {maxRevenueInDay.toFixed(2)}€)
                </Text>
                <MiniBarChart
                  data={revenueTimeSeries.map(d => d.revenue)}
                  maxValue={maxRevenueInDay}
                />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Commandes par jour (max: {maxOrdersInDay})
                </Text>
                <MiniBarChart
                  data={revenueTimeSeries.map(d => d.orders)}
                  maxValue={maxOrdersInDay}
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Orders by Status */}
          <Card>
            <CardHeader>
              <Heading size="md">Commandes par Statut</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {Object.entries(ordersByStatus).map(([status, count]) => (
                  <Box key={status}>
                    <HStack justify="space-between" mb={1}>
                      <HStack>
                        <Badge colorScheme={statusColors[status] || 'gray'}>
                          {statusLabels[status] || status}
                        </Badge>
                      </HStack>
                      <Text fontWeight="600">{count}</Text>
                    </HStack>
                    <Progress
                      value={(count / summary.totalOrders) * 100}
                      colorScheme={statusColors[status] || 'gray'}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <Heading size="md">Revenu par Catégorie</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {Object.entries(revenueByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, revenue]) => {
                    const percentage = (revenue / summary.totalRevenue) * 100
                    return (
                      <Box key={category}>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight="500">
                            {category}
                          </Text>
                          <Text fontWeight="600">{revenue.toFixed(2)}€</Text>
                        </HStack>
                        <Progress
                          value={percentage}
                          colorScheme="brand"
                          size="sm"
                          borderRadius="full"
                        />
                      </Box>
                    )
                  })}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top Selling Dishes */}
        <Card>
          <CardHeader>
            <Heading size="md">
              <HStack spacing={2}>
                <Icon as={FiPackage} />
                <Text>Top 10 Plats les Plus Vendus</Text>
              </HStack>
            </Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Rang</Th>
                  <Th>Plat</Th>
                  <Th>Catégorie</Th>
                  <Th isNumeric>Quantité</Th>
                  <Th isNumeric>Revenu</Th>
                </Tr>
              </Thead>
              <Tbody>
                {topDishes.map((dish, index) => (
                  <Tr key={dish.name}>
                    <Td fontWeight="600">{index + 1}</Td>
                    <Td>{dish.name}</Td>
                    <Td>
                      <Badge colorScheme="green" size="sm">
                        {dish.category}
                      </Badge>
                    </Td>
                    <Td isNumeric>{dish.quantity}</Td>
                    <Td isNumeric fontWeight="600">{dish.revenue.toFixed(2)}€</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack spacing={2}>
                  <Icon as={FiClock} />
                  <Text>Heures de Pointe</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <Box mb={4}>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Commandes par heure (0-23h)
                </Text>
                <MiniBarChart data={hourData} maxValue={maxOrdersInHour} />
              </Box>
              <Divider mb={4} />
              <VStack spacing={2} align="stretch">
                {Object.entries(ordersByHour)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([hour, count]) => (
                    <HStack key={hour} justify="space-between">
                      <Text fontSize="sm">{hour}h00 - {hour}h59</Text>
                      <Badge colorScheme="blue">{count} commandes</Badge>
                    </HStack>
                  ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Peak Days */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack spacing={2}>
                  <Icon as={FiCalendar} />
                  <Text>Jours de la Semaine</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => {
                  const count = ordersByDay[day] || 0
                  const maxDayOrders = Math.max(...Object.values(ordersByDay), 1)
                  const percentage = (count / maxDayOrders) * 100

                  return (
                    <Box key={day}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="500">
                          {day}
                        </Text>
                        <Text fontWeight="600">{count} commandes</Text>
                      </HStack>
                      <Progress
                        value={percentage}
                        colorScheme="purple"
                        size="sm"
                        borderRadius="full"
                      />
                    </Box>
                  )
                })}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top Delivery Zones */}
        {topZones.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">
                <HStack spacing={2}>
                  <Icon as={FiMapPin} />
                  <Text>Top Zones de Livraison</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Code Postal</Th>
                    <Th isNumeric>Commandes</Th>
                    <Th isNumeric>Revenu</Th>
                    <Th isNumeric>Panier Moyen</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {topZones.map((zone) => (
                    <Tr key={zone.postalCode}>
                      <Td fontWeight="600">{zone.postalCode}</Td>
                      <Td isNumeric>{zone.orders}</Td>
                      <Td isNumeric>{zone.revenue.toFixed(2)}€</Td>
                      <Td isNumeric>{(zone.revenue / zone.orders).toFixed(2)}€</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  )
}
