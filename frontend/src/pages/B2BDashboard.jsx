import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Progress,
  Divider
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import {
  FiUsers,
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiFileText,
  FiSettings,
  FiBarChart2,
  FiCreditCard
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useBusinessEmployees, useBusinessBudgets, useB2BAnalytics } from '../hooks/useB2B'
import { supabase } from '../supabaseClient'

const StatCard = ({ icon, label, value, subValue, colorScheme = 'brand', onClick }) => {
  const bg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Card
      bg={bg}
      cursor={onClick ? 'pointer' : 'default'}
      _hover={onClick ? { bg: hoverBg, transform: 'translateY(-2px)', shadow: 'md' } : {}}
      transition="all 0.2s"
      onClick={onClick}
    >
      <CardBody>
        <HStack spacing={4}>
          <Box p={3} bg={`${colorScheme}.100`} borderRadius="lg">
            <Icon as={icon} boxSize={6} color={`${colorScheme}.500`} />
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="sm" color="gray.600">{label}</Text>
            <Heading size="lg">{value}</Heading>
            {subValue && (
              <Text fontSize="xs" color="gray.500">{subValue}</Text>
            )}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}

const QuickActionCard = ({ icon, title, description, onClick, colorScheme = 'brand' }) => {
  const bg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Card
      bg={bg}
      cursor="pointer"
      _hover={{ bg: hoverBg, transform: 'translateY(-2px)', shadow: 'md' }}
      transition="all 0.2s"
      onClick={onClick}
    >
      <CardBody>
        <VStack spacing={3}>
          <Box p={4} bg={`${colorScheme}.100`} borderRadius="full">
            <Icon as={icon} boxSize={8} color={`${colorScheme}.500`} />
          </Box>
          <VStack spacing={1}>
            <Text fontWeight="bold" textAlign="center">{title}</Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">{description}</Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default function B2BDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const bgColor = useColorModeValue('gray.50', 'gray.900')

  // Fetch business info
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true)
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
        setError('Impossible de charger les informations de l\'entreprise')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchBusiness()
    }
  }, [user])

  const businessId = business?.id

  // Use hooks to fetch data
  const { employees } = useBusinessEmployees(businessId)
  const { budgets } = useBusinessBudgets(businessId)
  const { analytics } = useB2BAnalytics(businessId)

  // Calculate current budget info
  const currentBudget = budgets.find(b => {
    const now = new Date()
    const start = new Date(b.period_start)
    const end = new Date(b.period_end)
    return now >= start && now <= end && b.is_active
  })

  const budgetUsagePercent = currentBudget
    ? (currentBudget.used_amount / currentBudget.total_budget) * 100
    : 0

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={20}>
          <Spinner size="xl" color="brand.500" />
          <Text mt={4} color="gray.600">Chargement du tableau de bord...</Text>
        </Box>
      </Container>
    )
  }

  if (error || !business) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Erreur</Text>
            <Text fontSize="sm">
              {error || 'Aucun compte B2B actif trouvé pour votre compte utilisateur.'}
            </Text>
          </VStack>
        </Alert>
      </Container>
    )
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Heading size="xl">{business.company_name}</Heading>
              <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                Compte Actif
              </Badge>
            </HStack>
            <Text color="gray.600">
              Tableau de bord de gestion B2B
            </Text>
          </Box>

          {/* Key Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <StatCard
              icon={FiUsers}
              label="Employés actifs"
              value={employees.filter(e => e.status === 'active').length}
              subValue={`${employees.length} total`}
              colorScheme="blue"
              onClick={() => navigate('/b2b/employees')}
            />
            <StatCard
              icon={FiDollarSign}
              label="Budget du mois"
              value={currentBudget ? `${currentBudget.total_budget.toFixed(0)}€` : 'N/A'}
              subValue={currentBudget ? `${currentBudget.remaining_amount.toFixed(0)}€ restant` : 'Aucun budget actif'}
              colorScheme="green"
              onClick={() => navigate('/b2b/budgets')}
            />
            <StatCard
              icon={FiShoppingBag}
              label="Commandes ce mois"
              value={analytics?.summary?.total_orders || 0}
              subValue={`${analytics?.summary?.total_spent?.toFixed(2) || 0}€ dépensés`}
              colorScheme="orange"
              onClick={() => navigate('/b2b/analytics')}
            />
            <StatCard
              icon={FiTrendingUp}
              label="Panier moyen"
              value={analytics?.summary?.avg_order_value ? `${analytics.summary.avg_order_value.toFixed(2)}€` : '0€'}
              subValue="Par commande"
              colorScheme="purple"
            />
          </SimpleGrid>

          {/* Budget Progress */}
          {currentBudget && (
            <Card bg={useColorModeValue('white', 'gray.800')}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Budget du mois en cours</Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate('/b2b/budgets')}
                  >
                    Gérer les budgets
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Période: {new Date(currentBudget.period_start).toLocaleDateString('fr-FR')} - {new Date(currentBudget.period_end).toLocaleDateString('fr-FR')}
                    </Text>
                    <Text fontWeight="bold">
                      {currentBudget.used_amount.toFixed(2)}€ / {currentBudget.total_budget.toFixed(2)}€
                    </Text>
                  </HStack>
                  <Progress
                    value={budgetUsagePercent}
                    colorScheme={budgetUsagePercent > 90 ? 'red' : budgetUsagePercent > 75 ? 'orange' : 'green'}
                    size="lg"
                    borderRadius="full"
                  />
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      {budgetUsagePercent.toFixed(1)}% utilisé
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="green.500">
                      {currentBudget.remaining_amount.toFixed(2)}€ disponible
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}

          <Divider />

          {/* Quick Actions */}
          <Box>
            <Heading size="md" mb={6}>Actions rapides</Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <QuickActionCard
                icon={FiUsers}
                title="Gérer les employés"
                description="Ajouter, modifier ou supprimer des employés"
                onClick={() => navigate('/b2b/employees')}
                colorScheme="blue"
              />
              <QuickActionCard
                icon={FiCreditCard}
                title="Budgets"
                description="Configurer les budgets mensuels"
                onClick={() => navigate('/b2b/budgets')}
                colorScheme="green"
              />
              <QuickActionCard
                icon={FiBarChart2}
                title="Statistiques"
                description="Voir les analyses et rapports"
                onClick={() => navigate('/b2b/analytics')}
                colorScheme="purple"
              />
              <QuickActionCard
                icon={FiFileText}
                title="Factures"
                description="Consulter les factures mensuelles"
                onClick={() => navigate('/b2b/invoices')}
                colorScheme="orange"
              />
            </SimpleGrid>
          </Box>

          {/* Recent Activity */}
          <Card bg={useColorModeValue('white', 'gray.800')}>
            <CardHeader>
              <Heading size="md">Activité récente</Heading>
            </CardHeader>
            <CardBody>
              {analytics?.employeeSpending && analytics.employeeSpending.length > 0 ? (
                <VStack align="stretch" spacing={3}>
                  {analytics.employeeSpending.slice(0, 5).map((emp, idx) => (
                    <HStack key={idx} justify="space-between" p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{emp.first_name} {emp.last_name}</Text>
                        <Text fontSize="sm" color="gray.600">{emp.email}</Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Text fontWeight="bold">{emp.total_spent?.toFixed(2) || 0}€</Text>
                        <Text fontSize="sm" color="gray.600">{emp.order_count || 0} commandes</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500" textAlign="center" py={8}>
                  Aucune activité récente
                </Text>
              )}
            </CardBody>
          </Card>

          {/* Company Info */}
          <Card bg={useColorModeValue('white', 'gray.800')}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Informations de l'entreprise</Heading>
                <Button
                  size="sm"
                  leftIcon={<FiSettings />}
                  variant="ghost"
                  onClick={() => navigate('/b2b/settings')}
                >
                  Paramètres
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="start" spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">SIRET</Text>
                    <Text fontWeight="medium">{business.siret}</Text>
                  </Box>
                  {business.vat_number && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">N° TVA</Text>
                      <Text fontWeight="medium">{business.vat_number}</Text>
                    </Box>
                  )}
                  <Box>
                    <Text fontSize="sm" color="gray.600">Contact principal</Text>
                    <Text fontWeight="medium">{business.contact_name}</Text>
                    <Text fontSize="sm">{business.contact_email}</Text>
                  </Box>
                </VStack>
                <VStack align="start" spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Adresse de facturation</Text>
                    <Text fontWeight="medium">{business.billing_address_street}</Text>
                    <Text>{business.billing_address_postal_code} {business.billing_address_city}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Email de facturation</Text>
                    <Text fontWeight="medium">{business.billing_email}</Text>
                  </Box>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}
