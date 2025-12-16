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
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select
} from '@chakra-ui/react'
import {
  FiFileText,
  FiDownload,
  FiRefreshCw,
  FiPlus,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useBusinessInvoices } from '../hooks/useB2B'
import { supabase } from '../supabaseClient'

const GenerateInvoiceModal = ({ isOpen, onClose, onGenerate }) => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    await onGenerate(year, month)
    setGenerating(false)
    onClose()
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Générer une facture mensuelle</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Alert status="info" rounded="md" fontSize="sm">
              <AlertIcon />
              La facture regroupera toutes les commandes B2B de la période sélectionnée.
            </Alert>

            <SimpleGrid columns={2} spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Année</FormLabel>
                <Select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Mois</FormLabel>
                <Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleGenerate}
            isLoading={generating}
            leftIcon={<FiPlus />}
          >
            Générer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function MonthlyInvoices() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()

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
  const { invoices, loading, error, refresh, generateMonthlyInvoice } = useBusinessInvoices(businessId)

  const handleGenerate = async (year, month) => {
    const { error } = await generateMonthlyInvoice(year, month)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Facture générée',
        description: 'La facture mensuelle a été créée avec succès',
        status: 'success',
        duration: 3000
      })
      refresh()
    }
  }

  const handleDownload = (invoice) => {
    // In a real implementation, this would download the PDF
    // For now, we'll just show a toast
    toast({
      title: 'Téléchargement',
      description: 'Fonctionnalité en cours de développement',
      status: 'info',
      duration: 3000
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Brouillon', colorScheme: 'gray', icon: FiFileText },
      sent: { label: 'Envoyée', colorScheme: 'blue', icon: FiFileText },
      paid: { label: 'Payée', colorScheme: 'green', icon: FiCheckCircle },
      overdue: { label: 'En retard', colorScheme: 'red', icon: FiAlertCircle },
      cancelled: { label: 'Annulée', colorScheme: 'gray', icon: null }
    }

    const config = statusConfig[status] || { label: status, colorScheme: 'gray', icon: null }

    return (
      <HStack>
        {config.icon && <Icon as={config.icon} boxSize={3} />}
        <Badge colorScheme={config.colorScheme} fontSize="xs">
          {config.label}
        </Badge>
      </HStack>
    )
  }

  // Calculate stats
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    unpaid: invoices.filter(inv => ['draft', 'sent'].includes(inv.status)).length
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
            <Heading size="lg">Factures mensuelles</Heading>
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
              onClick={onOpen}
            >
              Générer une facture
            </Button>
          </HStack>
        </HStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={bgColor}>
            <CardBody>
              <HStack>
                <Icon as={FiFileText} boxSize={5} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">Total factures</Text>
                  <Heading size="lg">{stats.total}</Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor}>
            <CardBody>
              <HStack>
                <Icon as={FiDollarSign} boxSize={5} color="orange.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">Montant total</Text>
                  <Heading size="lg">{stats.totalAmount.toFixed(2)}€</Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor}>
            <CardBody>
              <HStack>
                <Icon as={FiCheckCircle} boxSize={5} color="green.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">Payées</Text>
                  <Heading size="lg" color="green.500">{stats.paid}</Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor}>
            <CardBody>
              <HStack>
                <Icon as={FiAlertCircle} boxSize={5} color="red.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">En retard</Text>
                  <Heading size="lg" color="red.500">{stats.overdue}</Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Error Alert */}
        {error && (
          <Alert status="error" rounded="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Invoices Table */}
        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Historique des factures ({invoices.length})</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="brand.500" />
              </Box>
            ) : invoices.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Icon as={FiFileText} boxSize={16} color="gray.300" mb={4} />
                <Text color="gray.500" mb={4}>Aucune facture générée</Text>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="brand"
                  onClick={onOpen}
                >
                  Générer la première facture
                </Button>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Numéro</Th>
                      <Th>Période</Th>
                      <Th>Commandes</Th>
                      <Th>Sous-total</Th>
                      <Th>TVA</Th>
                      <Th>Total TTC</Th>
                      <Th>Date d'échéance</Th>
                      <Th>Statut</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {invoices.map((invoice) => {
                      const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid'

                      return (
                        <Tr key={invoice.id} bg={isOverdue ? 'red.50' : undefined}>
                          <Td>
                            <Text fontSize="sm" fontWeight="bold">
                              {invoice.invoice_number}
                            </Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {new Date(invoice.period_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {new Date(invoice.period_start).toLocaleDateString('fr-FR')} - {new Date(invoice.period_end).toLocaleDateString('fr-FR')}
                              </Text>
                            </VStack>
                          </Td>
                          <Td fontSize="sm">{invoice.order_count || 0}</Td>
                          <Td fontSize="sm">{parseFloat(invoice.subtotal || 0).toFixed(2)}€</Td>
                          <Td fontSize="sm">{parseFloat(invoice.tax_amount || 0).toFixed(2)}€</Td>
                          <Td fontSize="sm" fontWeight="bold">
                            {parseFloat(invoice.total_amount || 0).toFixed(2)}€
                          </Td>
                          <Td>
                            {invoice.due_date ? (
                              <Text
                                fontSize="sm"
                                color={isOverdue ? 'red.500' : undefined}
                                fontWeight={isOverdue ? 'bold' : 'normal'}
                              >
                                {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="gray.500">-</Text>
                            )}
                          </Td>
                          <Td>{getStatusBadge(invoice.status)}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="xs"
                                leftIcon={<FiDownload />}
                                variant="ghost"
                                colorScheme="brand"
                                onClick={() => handleDownload(invoice)}
                              >
                                PDF
                              </Button>
                            </HStack>
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

        {/* Company Billing Info */}
        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Informations de facturation</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack align="start" spacing={3}>
                <Box>
                  <Text fontSize="sm" color="gray.600">Entreprise</Text>
                  <Text fontWeight="medium">{business.company_name}</Text>
                </Box>
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
              </VStack>
              <VStack align="start" spacing={3}>
                <Box>
                  <Text fontSize="sm" color="gray.600">Email de facturation</Text>
                  <Text fontWeight="medium">{business.billing_email}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">Adresse de facturation</Text>
                  <Text fontWeight="medium">{business.billing_address_street}</Text>
                  <Text>{business.billing_address_postal_code} {business.billing_address_city}</Text>
                </Box>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Generate Invoice Modal */}
        <GenerateInvoiceModal
          isOpen={isOpen}
          onClose={onClose}
          onGenerate={handleGenerate}
        />
      </VStack>
    </Container>
  )
}
