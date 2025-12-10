import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { FiSearch, FiUsers, FiShoppingBag, FiDollarSign, FiEye } from 'react-icons/fi'
import { useAdminCustomers, useCustomerDetails } from '../../hooks/useAdminCustomers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminCustomers() {
  const { customers, loading, error, refetch } = useAdminCustomers()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        customer.full_name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.includes(query)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '')
        case 'orders':
          return b.order_count - a.order_count
        case 'spent':
          return b.total_spent - a.total_spent
        case 'created_at':
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })

  // Calculate overview stats
  const totalCustomers = customers.length
  const totalOrders = customers.reduce((sum, c) => sum + c.order_count, 0)
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const handleViewCustomer = (customerId) => {
    setSelectedCustomerId(customerId)
    onOpen()
  }

  const handleCloseModal = () => {
    setSelectedCustomerId(null)
    onClose()
  }

  if (loading) {
    return <LoadingSpinner message="Chargement des clients..." />
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Erreur lors du chargement des clients : {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <Heading size="lg">
              <HStack spacing={3}>
                <FiUsers />
                <Text>Gestion des Clients</Text>
              </HStack>
            </Heading>
            <Button onClick={refetch} size="sm">
              Actualiser
            </Button>
          </HStack>

          {/* Overview Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Clients</StatLabel>
                  <StatNumber>{totalCustomers}</StatNumber>
                  <StatHelpText>
                    <FiUsers style={{ display: 'inline', marginRight: '4px' }} />
                    Clients inscrits
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Commandes</StatLabel>
                  <StatNumber>{totalOrders}</StatNumber>
                  <StatHelpText>
                    <FiShoppingBag style={{ display: 'inline', marginRight: '4px' }} />
                    Toutes les commandes
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Chiffre d'Affaires</StatLabel>
                  <StatNumber>{totalRevenue.toFixed(2)}€</StatNumber>
                  <StatHelpText>
                    <FiDollarSign style={{ display: 'inline', marginRight: '4px' }} />
                    CA total
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Panier Moyen</StatLabel>
                  <StatNumber>{averageOrderValue.toFixed(2)}€</StatNumber>
                  <StatHelpText>
                    <FiDollarSign style={{ display: 'inline', marginRight: '4px' }} />
                    Par commande
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters */}
          <Card>
            <CardBody>
              <HStack spacing={4}>
                <InputGroup flex={1}>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>

                <Select
                  w="200px"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="created_at">Plus récents</option>
                  <option value="name">Nom (A-Z)</option>
                  <option value="orders">Nb. commandes</option>
                  <option value="spent">Montant dépensé</option>
                </Select>
              </HStack>
            </CardBody>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardBody p={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Client</Th>
                      <Th>Email</Th>
                      <Th>Téléphone</Th>
                      <Th isNumeric>Commandes</Th>
                      <Th isNumeric>Total Dépensé</Th>
                      <Th isNumeric>Panier Moyen</Th>
                      <Th>Dernière Commande</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCustomers.length === 0 ? (
                      <Tr>
                        <Td colSpan={8} textAlign="center" py={8}>
                          <VStack spacing={2}>
                            <Text color="gray.500">Aucun client trouvé</Text>
                            {searchQuery && (
                              <Button
                                size="sm"
                                variant="link"
                                onClick={() => setSearchQuery('')}
                              >
                                Effacer la recherche
                              </Button>
                            )}
                          </VStack>
                        </Td>
                      </Tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <Tr key={customer.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="600">
                                {customer.full_name || 'Sans nom'}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                ID: {customer.id.slice(0, 8)}...
                              </Text>
                            </VStack>
                          </Td>
                          <Td>{customer.email}</Td>
                          <Td>{customer.phone || '-'}</Td>
                          <Td isNumeric>
                            <Badge colorScheme="blue">{customer.order_count}</Badge>
                          </Td>
                          <Td isNumeric fontWeight="600">
                            {customer.total_spent.toFixed(2)}€
                          </Td>
                          <Td isNumeric>
                            {customer.average_order.toFixed(2)}€
                          </Td>
                          <Td>
                            {customer.last_order_date ? (
                              <Text fontSize="sm">
                                {new Date(customer.last_order_date).toLocaleDateString('fr-FR')}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="gray.400">
                                Jamais
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              leftIcon={<FiEye />}
                              colorScheme="brand"
                              variant="ghost"
                              onClick={() => handleViewCustomer(customer.id)}
                            >
                              Détails
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        customerId={selectedCustomerId}
      />
    </Box>
  )
}

/**
 * Modal pour afficher les détails d'un client - A5.2
 */
function CustomerDetailsModal({ isOpen, onClose, customerId }) {
  const { customer, loading, error } = useCustomerDetails(customerId)

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Détails du Client</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <LoadingSpinner message="Chargement des détails..." />
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              Erreur : {error}
            </Alert>
          ) : customer ? (
            <VStack spacing={6} align="stretch">
              {/* Customer Info */}
              <Box>
                <Heading size="sm" mb={3}>
                  Informations
                </Heading>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Nom complet
                    </Text>
                    <Text fontWeight="600">{customer.full_name || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Email
                    </Text>
                    <Text fontWeight="600">{customer.email}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Téléphone
                    </Text>
                    <Text fontWeight="600">{customer.phone || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Inscrit le
                    </Text>
                    <Text fontWeight="600">
                      {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Statistics */}
              <Box>
                <Heading size="sm" mb={3}>
                  Statistiques
                </Heading>
                <SimpleGrid columns={2} spacing={4}>
                  <Card bg="blue.50">
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Commandes</StatLabel>
                        <StatNumber color="blue.600">
                          {customer.stats.order_count}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card bg="green.50">
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Dépensé</StatLabel>
                        <StatNumber color="green.600">
                          {customer.stats.total_spent.toFixed(2)}€
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card bg="purple.50">
                    <CardBody>
                      <Stat>
                        <StatLabel>Panier Moyen</StatLabel>
                        <StatNumber color="purple.600">
                          {customer.stats.average_order.toFixed(2)}€
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card bg="orange.50">
                    <CardBody>
                      <Stat>
                        <StatLabel>Dernière Commande</StatLabel>
                        <StatNumber color="orange.600" fontSize="md">
                          {customer.stats.last_order_date
                            ? new Date(customer.stats.last_order_date).toLocaleDateString('fr-FR')
                            : 'Jamais'}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Addresses */}
              <Box>
                <Heading size="sm" mb={3}>
                  Adresses ({customer.addresses.length})
                </Heading>
                {customer.addresses.length === 0 ? (
                  <Text color="gray.500" fontSize="sm">
                    Aucune adresse enregistrée
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {customer.addresses.map((address) => (
                      <Card key={address.id} size="sm">
                        <CardBody>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Text fontWeight="600">{address.label}</Text>
                                {address.is_default && (
                                  <Badge colorScheme="brand" size="sm">
                                    Par défaut
                                  </Badge>
                                )}
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {address.street_address}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {address.postal_code} {address.city}
                              </Text>
                            </VStack>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </Box>

              <Divider />

              {/* Recent Orders */}
              <Box>
                <Heading size="sm" mb={3}>
                  Commandes Récentes ({customer.orders.length})
                </Heading>
                {customer.orders.length === 0 ? (
                  <Text color="gray.500" fontSize="sm">
                    Aucune commande
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
                    {customer.orders.slice(0, 10).map((order) => (
                      <Card key={order.id} size="sm">
                        <CardBody>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <HStack>
                                <Text fontWeight="600" fontSize="sm">
                                  #{order.order_number}
                                </Text>
                                <Badge
                                  colorScheme={
                                    order.status === 'delivered'
                                      ? 'green'
                                      : order.status === 'cancelled'
                                      ? 'red'
                                      : 'blue'
                                  }
                                  size="sm"
                                >
                                  {order.status}
                                </Badge>
                              </HStack>
                              <Text fontWeight="600" color="brand.600">
                                {order.total.toFixed(2)}€
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">
                              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {order.order_items?.length || 0} article(s)
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </Box>
            </VStack>
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
