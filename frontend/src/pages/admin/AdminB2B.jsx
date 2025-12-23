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
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  Switch,
  useDisclosure,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiUsers,
  FiFileText,
  FiCheck,
  FiX
} from 'react-icons/fi'
import { useAdminB2BPackages, useAdminB2BQuotes, useAdminB2BAccounts } from '../../hooks/useAdminB2B'
import { useAdminB2BInvoices } from '../../hooks/useB2BInvoices'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const PackageModal = ({ isOpen, onClose, onSave, editingPackage }) => {
  const [formData, setFormData] = useState(
    editingPackage || {
      name: '',
      description: '',
      price_per_person: '',
      min_people: '',
      max_people: '',
      items_included: {},
      is_active: true
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editingPackage ? 'Modifier' : 'Créer'} une formule</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nom de la formule</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Formule Standard"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la formule..."
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={3} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Prix/personne (€)</FormLabel>
                  <NumberInput
                    value={formData.price_per_person}
                    onChange={(value) => setFormData({ ...formData, price_per_person: value })}
                    min={0}
                    step={0.01}
                  >
                    <NumberInputField placeholder="12.50" />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Min. personnes</FormLabel>
                  <NumberInput
                    value={formData.min_people}
                    onChange={(value) => setFormData({ ...formData, min_people: value })}
                    min={1}
                  >
                    <NumberInputField placeholder="10" />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Max. personnes</FormLabel>
                  <NumberInput
                    value={formData.max_people}
                    onChange={(value) => setFormData({ ...formData, max_people: value })}
                    min={1}
                  >
                    <NumberInputField placeholder="50" />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Formule active</FormLabel>
                <Switch
                  isChecked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" colorScheme="brand">
              {editingPackage ? 'Modifier' : 'Créer'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default function AdminB2B() {
  console.log('🔵 AdminB2B component loaded')

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingPackage, setEditingPackage] = useState(null)

  const { packages, loading: packagesLoading, createPackage, updatePackage, deletePackage, togglePackageActive } = useAdminB2BPackages()
  const { quotes, loading: quotesLoading, updateQuoteStatus } = useAdminB2BQuotes()
  const { accounts, loading: accountsLoading, updateAccountStatus } = useAdminB2BAccounts()
  const { invoices, loading: invoicesLoading, updateInvoiceStatus, generateInvoiceFromOrders, stats: invoiceStats } = useAdminB2BInvoices()

  const handleSavePackage = async (formData) => {
    const data = {
      ...formData,
      price_per_person: parseFloat(formData.price_per_person),
      min_people: formData.min_people ? parseInt(formData.min_people) : null,
      max_people: formData.max_people ? parseInt(formData.max_people) : null
    }

    let result
    if (editingPackage) {
      result = await updatePackage(editingPackage.id, data)
    } else {
      result = await createPackage(data)
    }

    if (result.error) {
      toast({
        title: 'Erreur',
        description: result.error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Succès',
        description: `Formule ${editingPackage ? 'modifiée' : 'créée'} avec succès`,
        status: 'success',
        duration: 3000
      })
      onClose()
      setEditingPackage(null)
    }
  }

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette formule ?')) return

    const { error } = await deletePackage(packageId)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Formule supprimée',
        status: 'success',
        duration: 3000
      })
    }
  }

  const handleTogglePackage = async (pkg) => {
    const { error } = await togglePackageActive(pkg.id, pkg.is_active)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: `Formule ${pkg.is_active ? 'désactivée' : 'activée'}`,
        status: 'success',
        duration: 3000
      })
    }
  }

  const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
    const { error } = await updateQuoteStatus(quoteId, newStatus)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Statut mis à jour',
        status: 'success',
        duration: 3000
      })
    }
  }

  const handleUpdateInvoiceStatus = async (invoiceId, newStatus) => {
    const paidDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
    const { error } = await updateInvoiceStatus(invoiceId, newStatus, paidDate)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Statut mis à jour',
        status: 'success',
        duration: 3000
      })
    }
  }

  const statusColors = {
    pending: 'yellow',
    contacted: 'blue',
    negotiating: 'purple',
    accepted: 'green',
    rejected: 'red',
    active: 'green',
    suspended: 'orange',
    closed: 'red',
    draft: 'gray',
    sent: 'blue',
    paid: 'green',
    overdue: 'red',
    cancelled: 'gray'
  }

  const statusLabels = {
    pending: 'En attente',
    contacted: 'Contacté',
    negotiating: 'En négociation',
    accepted: 'Accepté',
    rejected: 'Refusé',
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée'
  }

  if (packagesLoading || quotesLoading || accountsLoading || invoicesLoading) {
    return <LoadingSpinner message="Chargement B2B..." />
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Heading size="lg">Gestion B2B</Heading>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiPackage} />
                    <Text>Formules</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{packages.length}</StatNumber>
                <StatHelpText>{packages.filter(p => p.is_active).length} actifs</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiFileText} />
                    <Text>Demandes Devis</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{quotes.length}</StatNumber>
                <StatHelpText>{quotes.filter(q => q.status === 'pending').length} en attente</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiUsers} />
                    <Text>Comptes B2B</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{accounts.length}</StatNumber>
                <StatHelpText>{accounts.filter(a => a.status === 'active').length} actifs</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>CA B2B</StatLabel>
                <StatNumber>{invoiceStats.paidAmount.toFixed(2)}€</StatNumber>
                <StatHelpText>{invoiceStats.paidCount} factures payées</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <Tabs colorScheme="brand">
          <TabList>
            <Tab>Formules</Tab>
            <Tab>Demandes de Devis</Tab>
            <Tab>Comptes B2B</Tab>
            <Tab>Factures</Tab>
          </TabList>

          <TabPanels>
            {/* Packages Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Formules Corporatives</Heading>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="brand"
                      onClick={() => {
                        setEditingPackage(null)
                        onOpen()
                      }}
                    >
                      Nouvelle formule
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {packages.length === 0 ? (
                    <VStack py={8}>
                      <Text color="gray.500">Aucune formule créée</Text>
                    </VStack>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Nom</Th>
                          <Th>Prix/pers.</Th>
                          <Th>Min-Max</Th>
                          <Th>Statut</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {packages.map((pkg) => (
                          <Tr key={pkg.id}>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="600">{pkg.name}</Text>
                                {pkg.description && (
                                  <Text fontSize="sm" color="gray.600">
                                    {pkg.description}
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td fontWeight="600">{pkg.price_per_person.toFixed(2)}€</Td>
                            <Td>
                              {pkg.min_people || '-'} - {pkg.max_people || '∞'}
                            </Td>
                            <Td>
                              <Badge colorScheme={pkg.is_active ? 'green' : 'gray'}>
                                {pkg.is_active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  icon={pkg.is_active ? <FiX /> : <FiCheck />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleTogglePackage(pkg)}
                                  aria-label="Toggle active"
                                />
                                <IconButton
                                  icon={<FiEdit />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingPackage(pkg)
                                    onOpen()
                                  }}
                                  aria-label="Edit"
                                />
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeletePackage(pkg.id)}
                                  aria-label="Delete"
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Quotes Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Demandes de Devis</Heading>
                </CardHeader>
                <CardBody>
                  {quotes.length === 0 ? (
                    <VStack py={8}>
                      <Text color="gray.500">Aucune demande de devis</Text>
                    </VStack>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Entreprise</Th>
                          <Th>Contact</Th>
                          <Th>Taille</Th>
                          <Th>Budget</Th>
                          <Th>Statut</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {quotes.map((quote) => (
                          <Tr key={quote.id}>
                            <Td fontWeight="600">{quote.company_name}</Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm">{quote.contact_name}</Text>
                                <Text fontSize="xs" color="gray.600">
                                  {quote.contact_email}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>{quote.company_size}</Td>
                            <Td>{quote.budget_range || '-'}</Td>
                            <Td>
                              <Badge colorScheme={statusColors[quote.status]}>
                                {statusLabels[quote.status] || quote.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Select
                                size="sm"
                                value={quote.status}
                                onChange={(e) => handleUpdateQuoteStatus(quote.id, e.target.value)}
                              >
                                <option value="pending">En attente</option>
                                <option value="contacted">Contacté</option>
                                <option value="negotiating">En négociation</option>
                                <option value="accepted">Accepté</option>
                                <option value="rejected">Refusé</option>
                              </Select>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Accounts Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Comptes B2B</Heading>
                </CardHeader>
                <CardBody>
                  {accounts.length === 0 ? (
                    <VStack py={8}>
                      <Text color="gray.500">Aucun compte B2B</Text>
                    </VStack>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Entreprise</Th>
                          <Th>Contact</Th>
                          <Th>Conditions</Th>
                          <Th>Crédit</Th>
                          <Th>Remise</Th>
                          <Th>Statut</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {accounts.map((account) => (
                          <Tr key={account.id}>
                            <Td fontWeight="600">{account.company_name}</Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm">{account.user?.full_name || '-'}</Text>
                                <Text fontSize="xs" color="gray.600">
                                  {account.user?.email || '-'}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Badge>{account.payment_terms.toUpperCase()}</Badge>
                            </Td>
                            <Td>{account.credit_limit?.toFixed(2) || 0}€</Td>
                            <Td>{account.discount_rate || 0}%</Td>
                            <Td>
                              <Badge colorScheme={statusColors[account.status]}>
                                {account.status}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Invoices Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {/* Invoice Stats */}
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Factures</StatLabel>
                        <StatNumber>{invoiceStats.totalAmount.toFixed(2)}€</StatNumber>
                        <StatHelpText>{invoiceStats.totalCount} factures</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Payées</StatLabel>
                        <StatNumber color="green.500">{invoiceStats.paidAmount.toFixed(2)}€</StatNumber>
                        <StatHelpText>{invoiceStats.paidCount} factures</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>En attente</StatLabel>
                        <StatNumber color="blue.500">{invoiceStats.pendingAmount.toFixed(2)}€</StatNumber>
                        <StatHelpText>{invoiceStats.pendingCount} factures</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>En retard</StatLabel>
                        <StatNumber color="red.500">{invoiceStats.overdueAmount.toFixed(2)}€</StatNumber>
                        <StatHelpText>{invoiceStats.overdueCount} factures</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Invoices Table */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Toutes les Factures</Heading>
                  </CardHeader>
                  <CardBody>
                    {invoices.length === 0 ? (
                      <VStack py={8}>
                        <Text color="gray.500">Aucune facture créée</Text>
                      </VStack>
                    ) : (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Numéro</Th>
                            <Th>Entreprise</Th>
                            <Th>Période</Th>
                            <Th>Montant</Th>
                            <Th>Échéance</Th>
                            <Th>Statut</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {invoices.map((invoice) => (
                            <Tr key={invoice.id}>
                              <Td fontWeight="600">{invoice.invoice_number}</Td>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="600">{invoice.account?.company_name || '-'}</Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {invoice.account?.billing_email || '-'}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <Text fontSize="sm">
                                  {new Date(invoice.period_start).toLocaleDateString('fr-FR')} -{' '}
                                  {new Date(invoice.period_end).toLocaleDateString('fr-FR')}
                                </Text>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="600">{parseFloat(invoice.total).toFixed(2)}€</Text>
                                  {invoice.discount_amount > 0 && (
                                    <Text fontSize="xs" color="gray.600">
                                      -{parseFloat(invoice.discount_amount).toFixed(2)}€ remise
                                    </Text>
                                  )}
                                </VStack>
                              </Td>
                              <Td>
                                {invoice.due_date ? (
                                  <Text
                                    fontSize="sm"
                                    color={
                                      invoice.status === 'overdue'
                                        ? 'red.500'
                                        : new Date(invoice.due_date) < new Date()
                                        ? 'orange.500'
                                        : 'inherit'
                                    }
                                  >
                                    {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                                  </Text>
                                ) : (
                                  '-'
                                )}
                              </Td>
                              <Td>
                                <Badge colorScheme={statusColors[invoice.status]}>
                                  {statusLabels[invoice.status] || invoice.status}
                                </Badge>
                              </Td>
                              <Td>
                                <Select
                                  size="sm"
                                  value={invoice.status}
                                  onChange={(e) => handleUpdateInvoiceStatus(invoice.id, e.target.value)}
                                >
                                  <option value="draft">Brouillon</option>
                                  <option value="sent">Envoyée</option>
                                  <option value="paid">Payée</option>
                                  <option value="overdue">En retard</option>
                                  <option value="cancelled">Annulée</option>
                                </Select>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Package Modal */}
      <PackageModal
        isOpen={isOpen}
        onClose={() => {
          onClose()
          setEditingPackage(null)
        }}
        onSave={handleSavePackage}
        editingPackage={editingPackage}
      />
    </Box>
  )
}
