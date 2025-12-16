import { useState, useEffect } from 'react'
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
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Select,
  Icon
} from '@chakra-ui/react'
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiDownload
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useB2BAnalytics } from '../hooks/useB2B'
import { supabase } from '../supabaseClient'

export default function B2BAnalytics() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const [period, setPeriod] = useState('current_month')

  const bgColor = useColorModeValue('white', 'gray.800')

  // Fetch business info
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data, error } = await supabase
          .from('business_accounts')
          .select('*')
          .eq('manager_user_id', user.id)
          .eq('status', 'active')
          .single()

        if (error) throw error
        setBusiness(data)
      } catch (err) {
        console.error('Error fetching business:', err)
      } finally {
        setLoadingBusiness(false)
      }
    }

    if (user) {
      fetchBusiness()
    }
  }, [user])

  const businessId = business?.id
  const { analytics, loading, error, refresh } = useB2BAnalytics(businessId)

  const handleExport = () => {
    if (!analytics?.employeeSpending) return

    // Generate CSV content
    const headers = ['Nom', 'Email', 'Département', 'Commandes', 'Dépenses totales', 'Panier moyen']
    const rows = analytics.employeeSpending.map(emp => [
      `${emp.first_name} ${emp.last_name}`,
      emp.email,
      emp.department || '-',
      emp.order_count || 0,
      `${emp.total_spent?.toFixed(2) || 0}€`,
      `${emp.avg_order_value?.toFixed(2) || 0}€`
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics_${business.company_name}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loadingBusiness) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={20}>
          <Spinner size="xl" color="brand.500" />
        </Box>
      </Container>
    )
  }

  if (!business) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          Aucun compte B2B actif trouvé
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Statistiques & Analyses</Heading>
            <Text color="gray.600" mt={1}>
              {business.company_name}
            </Text>
          </Box>
          <HStack>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              w="200px"
              size="sm"
            >
              <option value="current_month">Mois en cours</option>
              <option value="last_month">Mois dernier</option>
              <option value="last_3_months">3 derniers mois</option>
              <option value="last_6_months">6 derniers mois</option>
              <option value="current_year">Année en cours</option>
            </Select>
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={refresh}
              variant="outline"
              size="sm"
              isLoading={loading}
            >
              Actualiser
            </Button>
            <Button
              leftIcon={<FiDownload />}
              onClick={handleExport}
              colorScheme="brand"
              size="sm"
              isDisabled={!analytics?.employeeSpending?.length}
            >
              Exporter CSV
            </Button>
          </HStack>
        </HStack>

        {/* Error Alert */}
        {error && (
          <Alert status="error" rounded="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Overview Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card bg={bgColor}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiShoppingBag} />
                    <Text>Total Commandes</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{analytics?.summary?.total_orders || 0}</StatNumber>
                <StatHelpText>Commandes passées</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiDollarSign} />
                    <Text>Dépenses totales</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{analytics?.summary?.total_spent?.toFixed(2) || 0}€</StatNumber>
                <StatHelpText>Montant total dépensé</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiTrendingUp} />
                    <Text>Panier moyen</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{analytics?.summary?.avg_order_value?.toFixed(2) || 0}€</StatNumber>
                <StatHelpText>Par commande</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiUsers} />
                    <Text>Employés actifs</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{analytics?.summary?.active_employees || 0}</StatNumber>
                <StatHelpText>Ont passé au moins 1 commande</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top Employees */}
        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Dépenses par employé</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="brand.500" />
              </Box>
            ) : !analytics?.employeeSpending || analytics.employeeSpending.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text color="gray.500">Aucune donnée disponible</Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Rang</Th>
                      <Th>Employé</Th>
                      <Th>Département</Th>
                      <Th>Commandes</Th>
                      <Th>Total dépensé</Th>
                      <Th>Panier moyen</Th>
                      <Th>Budget utilisé</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analytics.employeeSpending
                      .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
                      .map((emp, idx) => {
                        const budgetUsage = emp.individual_budget_monthly
                          ? ((emp.total_spent || 0) / emp.individual_budget_monthly) * 100
                          : 0

                        return (
                          <Tr key={emp.email}>
                            <Td>
                              <Text fontWeight="bold" color="gray.600">
                                #{idx + 1}
                              </Text>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {emp.first_name} {emp.last_name}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {emp.email}
                                </Text>
                              </VStack>
                            </Td>
                            <Td fontSize="sm">{emp.department || '-'}</Td>
                            <Td fontSize="sm" fontWeight="medium">
                              {emp.order_count || 0}
                            </Td>
                            <Td fontSize="sm" fontWeight="bold" color="orange.500">
                              {emp.total_spent?.toFixed(2) || 0}€
                            </Td>
                            <Td fontSize="sm">
                              {emp.avg_order_value?.toFixed(2) || 0}€
                            </Td>
                            <Td>
                              {emp.individual_budget_monthly ? (
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="xs" color="gray.600">
                                    {budgetUsage.toFixed(0)}%
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    sur {emp.individual_budget_monthly?.toFixed(0)}€
                                  </Text>
                                </VStack>
                              ) : (
                                <Text fontSize="xs" color="gray.500">
                                  N/A
                                </Text>
                              )}
                            </Td>
                          </Tr>
                        )
                      })}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Department Breakdown */}
        {analytics?.employeeSpending && (
          <Card bg={bgColor}>
            <CardHeader>
              <Heading size="md">Dépenses par département</Heading>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Département</Th>
                      <Th>Employés</Th>
                      <Th>Commandes</Th>
                      <Th>Total dépensé</Th>
                      <Th>Moyenne par employé</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(
                      analytics.employeeSpending.reduce((acc, emp) => {
                        const dept = emp.department || 'Non spécifié'
                        if (!acc[dept]) {
                          acc[dept] = {
                            employees: 0,
                            orders: 0,
                            spent: 0
                          }
                        }
                        acc[dept].employees++
                        acc[dept].orders += emp.order_count || 0
                        acc[dept].spent += emp.total_spent || 0
                        return acc
                      }, {})
                    )
                      .sort((a, b) => b[1].spent - a[1].spent)
                      .map(([dept, stats]) => (
                        <Tr key={dept}>
                          <Td fontWeight="medium">{dept}</Td>
                          <Td>{stats.employees}</Td>
                          <Td>{stats.orders}</Td>
                          <Td fontWeight="bold" color="orange.500">
                            {stats.spent.toFixed(2)}€
                          </Td>
                          <Td>
                            {(stats.spent / stats.employees).toFixed(2)}€
                          </Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
}
