import { useState, useEffect } from 'react'
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react'
import {
  FiPlus,
  FiEdit,
  FiRefreshCw,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useBusinessBudgets } from '../hooks/useB2B'
import { supabase } from '../supabaseClient'

const BudgetFormModal = ({ isOpen, onClose, budget, onSubmit }) => {
  const isEdit = !!budget
  const [formData, setFormData] = useState(budget || {
    period_start: '',
    period_end: '',
    total_budget: 0,
    department: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    await onSubmit(formData)
    setSaving(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEdit ? 'Modifier le budget' : 'Nouveau budget'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Date de début</FormLabel>
                <Input
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date de fin</FormLabel>
                <Input
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel>Budget total (€)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_budget}
                  onChange={(e) => setFormData({ ...formData, total_budget: parseFloat(e.target.value) || 0 })}
                  placeholder="5000.00"
                />
              </FormControl>

              <FormControl gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel>Département (optionnel)</FormLabel>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Laissez vide pour tous les départements"
                />
              </FormControl>

              <FormControl gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <HStack>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <FormLabel mb={0}>Budget actif</FormLabel>
                </HStack>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Seuls les budgets actifs sont pris en compte pour les commandes
                </Text>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit} isLoading={saving}>
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function BudgetManagement() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedBudget, setSelectedBudget] = useState(null)

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
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les informations de l\'entreprise',
          status: 'error',
          duration: 5000
        })
      } finally {
        setLoadingBusiness(false)
      }
    }

    if (user) {
      fetchBusiness()
    }
  }, [user])

  const businessId = business?.id
  const { budgets, loading, error, refresh, createBudget, updateBudget } = useBusinessBudgets(businessId)

  const handleAdd = () => {
    setSelectedBudget(null)
    onOpen()
  }

  const handleEdit = (budget) => {
    setSelectedBudget(budget)
    onOpen()
  }

  const handleSubmit = async (formData) => {
    let result
    if (selectedBudget) {
      result = await updateBudget(selectedBudget.id, formData)
    } else {
      result = await createBudget(formData)
    }

    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: selectedBudget ? 'Budget mis à jour' : 'Budget créé',
        status: 'success',
        duration: 3000
      })
      onClose()
      refresh()
    }
  }

  // Find current budget
  const currentBudget = budgets.find(b => {
    const now = new Date()
    const start = new Date(b.period_start)
    const end = new Date(b.period_end)
    return now >= start && now <= end && b.is_active
  })

  const budgetUsagePercent = currentBudget
    ? (currentBudget.used_amount / currentBudget.total_budget) * 100
    : 0

  // Calculate stats
  const stats = {
    total: budgets.reduce((sum, b) => sum + b.total_budget, 0),
    used: budgets.reduce((sum, b) => sum + b.used_amount, 0),
    active: budgets.filter(b => b.is_active).length,
    current: currentBudget?.remaining_amount || 0
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
            <Heading size="lg">Gestion des budgets</Heading>
            <Text color="gray.600" mt={1}>
              {business.company_name}
            </Text>
          </Box>
          <HStack>
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={refresh}
              variant="outline"
              isLoading={loading}
            >
              Actualiser
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={handleAdd}
            >
              Nouveau budget
            </Button>
          </HStack>
        </HStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card bg={bgColor}>
            <CardBody>
              <Stat>
                <StatLabel>Budget total configuré</StatLabel>
                <StatNumber fontSize="2xl">{stats.total.toFixed(0)}€</StatNumber>
                <StatHelpText>Tous les budgets</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor}>
            <CardBody>
              <Stat>
                <StatLabel>Utilisé</StatLabel>
                <StatNumber fontSize="2xl" color="orange.500">{stats.used.toFixed(0)}€</StatNumber>
                <StatHelpText>Total dépensé</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor}>
            <CardBody>
              <Stat>
                <StatLabel>Budgets actifs</StatLabel>
                <StatNumber fontSize="2xl" color="green.500">{stats.active}</StatNumber>
                <StatHelpText>En cours d'utilisation</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor}>
            <CardBody>
              <Stat>
                <StatLabel>Disponible ce mois</StatLabel>
                <StatNumber fontSize="2xl" color="blue.500">{stats.current.toFixed(0)}€</StatNumber>
                <StatHelpText>Budget restant</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Current Budget Alert */}
        {currentBudget && (
          <Card bg={bgColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Budget du mois en cours</Heading>
                <IconButton
                  icon={<FiEdit />}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(currentBudget)}
                  aria-label="Edit current budget"
                />
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Période: {new Date(currentBudget.period_start).toLocaleDateString('fr-FR')} - {new Date(currentBudget.period_end).toLocaleDateString('fr-FR')}
                  </Text>
                  {currentBudget.department && (
                    <Badge colorScheme="purple">{currentBudget.department}</Badge>
                  )}
                </HStack>

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Utilisé</Text>
                    <Text fontSize="lg" fontWeight="bold" color="orange.500">
                      {currentBudget.used_amount.toFixed(2)}€
                    </Text>
                  </VStack>
                  <VStack align="center" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Total</Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {currentBudget.total_budget.toFixed(2)}€
                    </Text>
                  </VStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Disponible</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.500">
                      {currentBudget.remaining_amount.toFixed(2)}€
                    </Text>
                  </VStack>
                </HStack>

                <Progress
                  value={budgetUsagePercent}
                  colorScheme={budgetUsagePercent > 90 ? 'red' : budgetUsagePercent > 75 ? 'orange' : 'green'}
                  size="lg"
                  borderRadius="full"
                />

                <HStack>
                  <Text fontSize="sm" color="gray.600">
                    {budgetUsagePercent.toFixed(1)}% utilisé
                  </Text>
                </HStack>

                {budgetUsagePercent > 75 && (
                  <Alert status={budgetUsagePercent > 90 ? 'error' : 'warning'} rounded="md">
                    <AlertIcon as={FiAlertCircle} />
                    <VStack align="start" spacing={0} fontSize="sm">
                      <Text fontWeight="bold">
                        {budgetUsagePercent > 90 ? 'Budget presque épuisé' : 'Attention au budget'}
                      </Text>
                      <Text>
                        {budgetUsagePercent > 90
                          ? 'Moins de 10% du budget disponible'
                          : 'Plus de 75% du budget utilisé'}
                      </Text>
                    </VStack>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {!currentBudget && (
          <Alert status="warning" rounded="lg">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Aucun budget actif pour le mois en cours</Text>
              <Text fontSize="sm">
                Créez un budget pour permettre aux employés de passer des commandes
              </Text>
            </VStack>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert status="error" rounded="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Budgets Table */}
        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Historique des budgets ({budgets.length})</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="brand.500" />
              </Box>
            ) : budgets.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text color="gray.500" mb={4}>Aucun budget configuré</Text>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="brand"
                  onClick={handleAdd}
                >
                  Créer le premier budget
                </Button>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Période</Th>
                      <Th>Département</Th>
                      <Th>Budget total</Th>
                      <Th>Utilisé</Th>
                      <Th>Disponible</Th>
                      <Th>Utilisation</Th>
                      <Th>Statut</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {budgets.map((budget) => {
                      const usagePercent = (budget.used_amount / budget.total_budget) * 100
                      const isCurrentPeriod = budget.id === currentBudget?.id

                      return (
                        <Tr key={budget.id} bg={isCurrentPeriod ? 'blue.50' : undefined}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {new Date(budget.period_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {new Date(budget.period_start).toLocaleDateString('fr-FR')} - {new Date(budget.period_end).toLocaleDateString('fr-FR')}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            {budget.department ? (
                              <Badge colorScheme="purple">{budget.department}</Badge>
                            ) : (
                              <Text fontSize="sm" color="gray.500">Tous</Text>
                            )}
                          </Td>
                          <Td fontSize="sm" fontWeight="medium">{budget.total_budget.toFixed(2)}€</Td>
                          <Td fontSize="sm" color="orange.500">{budget.used_amount.toFixed(2)}€</Td>
                          <Td fontSize="sm" color="green.500">{budget.remaining_amount.toFixed(2)}€</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Progress
                                value={usagePercent}
                                colorScheme={usagePercent > 90 ? 'red' : usagePercent > 75 ? 'orange' : 'green'}
                                size="sm"
                                borderRadius="full"
                                w="60px"
                              />
                              <Text fontSize="xs" color="gray.600">
                                {usagePercent.toFixed(0)}%
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={budget.is_active ? 'green' : 'gray'}>
                              {budget.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </Td>
                          <Td>
                            <IconButton
                              icon={<FiEdit />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(budget)}
                              aria-label="Edit"
                            />
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

        {/* Form Modal */}
        <BudgetFormModal
          isOpen={isOpen}
          onClose={onClose}
          budget={selectedBudget}
          onSubmit={handleSubmit}
        />
      </VStack>
    </Container>
  )
}
