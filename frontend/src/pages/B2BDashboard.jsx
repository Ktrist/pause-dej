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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  Alert,
  AlertIcon,
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
  Select,
  useDisclosure,
  Icon
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import {
  FiUsers,
  FiDollarSign,
  FiShoppingBag,
  FiEdit,
  FiTrash2,
  FiUserPlus,
  FiTrendingUp,
  FiCalendar
} from 'react-icons/fi'
import { useB2BAccount, useB2BTeam } from '../hooks/useB2BQuotes'
import { useB2BInvoices } from '../hooks/useB2BInvoices'
import { useB2BContracts } from '../hooks/useB2BContracts'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function B2BDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { account, loading: accountLoading, isB2BCustomer } = useB2BAccount()
  const { teamMembers, loading: teamLoading, addTeamMember, updateTeamMember, removeTeamMember } = useB2BTeam(account?.id)
  const { invoices, loading: invoicesLoading, stats: invoiceStats } = useB2BInvoices(account?.id)
  const { contracts, loading: contractsLoading, stats: contractStats } = useB2BContracts(account?.id)
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    monthly_budget: '',
    role: 'member'
  })
  const [editingMember, setEditingMember] = useState(null)

  // Redirect if not B2B customer
  if (!accountLoading && !isB2BCustomer) {
    return (
      <Container maxW="container.xl" py={16}>
        <VStack spacing={6}>
          <Alert status="warning">
            <AlertIcon />
            Vous n'avez pas de compte B2B. Contactez-nous pour créer un compte entreprise.
          </Alert>
          <Button colorScheme="brand" onClick={() => navigate('/b2b')}>
            En savoir plus sur l'offre B2B
          </Button>
        </VStack>
      </Container>
    )
  }

  if (accountLoading || teamLoading || invoicesLoading || contractsLoading) {
    return <LoadingSpinner message="Chargement de votre compte B2B..." />
  }

  const handleAddMember = async (e) => {
    e.preventDefault()

    const { error } = await addTeamMember({
      email: formData.email,
      full_name: formData.full_name,
      monthly_budget: parseFloat(formData.monthly_budget) || 0,
      role: formData.role
    })

    if (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter le membre.",
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Membre ajouté',
        description: 'Le membre a été ajouté avec succès.',
        status: 'success',
        duration: 3000
      })
      setFormData({ email: '', full_name: '', monthly_budget: '', role: 'member' })
      onClose()
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return

    const { error } = await removeTeamMember(memberId)

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le membre.',
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Membre retiré',
        description: 'Le membre a été retiré avec succès.',
        status: 'success',
        duration: 3000
      })
    }
  }

  const handleToggleActive = async (member) => {
    const { error } = await updateTeamMember(member.id, {
      is_active: !member.is_active
    })

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut.',
        status: 'error',
        duration: 3000
      })
    } else {
      toast({
        title: 'Statut modifié',
        description: `Le membre a été ${member.is_active ? 'désactivé' : 'activé'}.`,
        status: 'success',
        duration: 3000
      })
    }
  }

  const activeMembers = teamMembers.filter(m => m.is_active).length
  const totalBudget = teamMembers.reduce((sum, m) => sum + (m.monthly_budget || 0), 0)

  const statusBadgeColors = {
    draft: 'gray',
    sent: 'blue',
    paid: 'green',
    overdue: 'red',
    cancelled: 'gray'
  }

  const statusLabels = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée'
  }

  const statusColors = {
    active: 'green',
    suspended: 'orange',
    closed: 'red'
  }

  const roleLabels = {
    admin: 'Administrateur',
    manager: 'Manager',
    member: 'Membre'
  }

  const documentTypeLabels = {
    contract: 'Contrat',
    amendment: 'Avenant',
    terms: 'Conditions',
    nda: 'NDA',
    other: 'Autre'
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="lg">{account.company_name}</Heading>
              <HStack>
                <Badge colorScheme={statusColors[account.status]}>
                  {account.status === 'active' ? 'Actif' : account.status}
                </Badge>
                {account.payment_terms && (
                  <Badge>{account.payment_terms.toUpperCase()}</Badge>
                )}
              </HStack>
            </VStack>
            <Button leftIcon={<FiUserPlus />} colorScheme="brand" onClick={onOpen}>
              Ajouter un membre
            </Button>
          </HStack>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiUsers} />
                      <Text>Membres</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{teamMembers.length}</StatNumber>
                  <StatHelpText>{activeMembers} actifs</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiDollarSign} />
                      <Text>Budget Total</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{totalBudget.toFixed(2)}€</StatNumber>
                  <StatHelpText>Par mois</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiShoppingBag} />
                      <Text>Commandes</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>0</StatNumber>
                  <StatHelpText>Ce mois-ci</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiTrendingUp} />
                      <Text>Limite Crédit</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{account.credit_limit?.toFixed(2) || 0}€</StatNumber>
                  {account.discount_rate > 0 && (
                    <StatHelpText>-{account.discount_rate}% remise</StatHelpText>
                  )}
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Tabs */}
          <Tabs colorScheme="brand">
            <TabList>
              <Tab>
                <HStack>
                  <Icon as={FiUsers} />
                  <Text>Équipe</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiShoppingBag} />
                  <Text>Commandes</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiDollarSign} />
                  <Text>Facturation</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiCalendar} />
                  <Text>Contrat</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Team Tab */}
              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">Membres de l'équipe</Heading>
                  </CardHeader>
                  <CardBody>
                    {teamMembers.length === 0 ? (
                      <VStack py={8} spacing={4}>
                        <Text color="gray.500">Aucun membre dans l'équipe</Text>
                        <Button leftIcon={<FiUserPlus />} colorScheme="brand" onClick={onOpen}>
                          Ajouter le premier membre
                        </Button>
                      </VStack>
                    ) : (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Nom</Th>
                            <Th>Email</Th>
                            <Th>Rôle</Th>
                            <Th>Budget Mensuel</Th>
                            <Th>Statut</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {teamMembers.map((member) => (
                            <Tr key={member.id}>
                              <Td>{member.full_name || '-'}</Td>
                              <Td>{member.email}</Td>
                              <Td>
                                <Badge>{roleLabels[member.role]}</Badge>
                              </Td>
                              <Td>{member.monthly_budget?.toFixed(2) || 0}€</Td>
                              <Td>
                                <Badge colorScheme={member.is_active ? 'green' : 'gray'}>
                                  {member.is_active ? 'Actif' : 'Inactif'}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<FiEdit />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleToggleActive(member)}
                                    aria-label="Toggle status"
                                  />
                                  <IconButton
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleRemoveMember(member.id)}
                                    aria-label="Remove member"
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

              {/* Orders Tab */}
              <TabPanel>
                <Card>
                  <CardBody>
                    <VStack py={8} spacing={4}>
                      <Text color="gray.500">Aucune commande pour le moment</Text>
                      <HStack spacing={4}>
                        <Button colorScheme="brand" onClick={() => navigate('/catalogue')}>
                          Commander maintenant
                        </Button>
                        <Button variant="outline" colorScheme="brand" onClick={() => navigate('/b2b/bulk-order')}>
                          Commande groupée
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Billing Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Billing Info Card */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Informations de facturation</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Email de facturation</Text>
                          <Text fontWeight="600">{account.billing_email}</Text>
                        </Box>
                        {account.vat_number && (
                          <Box>
                            <Text fontSize="sm" color="gray.600">Numéro TVA</Text>
                            <Text fontWeight="600">{account.vat_number}</Text>
                          </Box>
                        )}
                        {account.company_registration && (
                          <Box>
                            <Text fontSize="sm" color="gray.600">SIRET</Text>
                            <Text fontWeight="600">{account.company_registration}</Text>
                          </Box>
                        )}
                        <Box>
                          <Text fontSize="sm" color="gray.600">Conditions de paiement</Text>
                          <Text fontWeight="600">{account.payment_terms.toUpperCase()}</Text>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Invoice Stats */}
                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Total</StatLabel>
                          <StatNumber fontSize="lg">{invoiceStats.total.toFixed(2)}€</StatNumber>
                          <StatHelpText>{invoices.length} factures</StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Payées</StatLabel>
                          <StatNumber fontSize="lg" color="green.500">{invoiceStats.paid}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>En attente</StatLabel>
                          <StatNumber fontSize="lg" color="blue.500">{invoiceStats.pending}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>En retard</StatLabel>
                          <StatNumber fontSize="lg" color="red.500">{invoiceStats.overdue}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Invoices Table */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Factures</Heading>
                    </CardHeader>
                    <CardBody>
                      {invoices.length === 0 ? (
                        <VStack py={8}>
                          <Text color="gray.500">Aucune facture disponible</Text>
                        </VStack>
                      ) : (
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Numéro</Th>
                              <Th>Période</Th>
                              <Th>Montant</Th>
                              <Th>Date d'échéance</Th>
                              <Th>Statut</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {invoices.map((invoice) => (
                              <Tr key={invoice.id}>
                                <Td fontWeight="600">{invoice.invoice_number}</Td>
                                <Td>
                                  <Text fontSize="sm">
                                    {new Date(invoice.period_start).toLocaleDateString('fr-FR')} -{' '}
                                    {new Date(invoice.period_end).toLocaleDateString('fr-FR')}
                                  </Text>
                                </Td>
                                <Td fontWeight="600">{parseFloat(invoice.total).toFixed(2)}€</Td>
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
                                  <Badge colorScheme={statusBadgeColors[invoice.status]}>
                                    {statusLabels[invoice.status] || invoice.status}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button size="sm" variant="ghost" colorScheme="brand">
                                    Télécharger
                                  </Button>
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

              {/* Contract Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Contract Info Card */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Informations contractuelles</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        {account.contract_start_date && (
                          <Box>
                            <Text fontSize="sm" color="gray.600">Date de début</Text>
                            <Text fontWeight="600">
                              {new Date(account.contract_start_date).toLocaleDateString('fr-FR')}
                            </Text>
                          </Box>
                        )}
                        {account.contract_end_date && (
                          <Box>
                            <Text fontSize="sm" color="gray.600">Date de fin</Text>
                            <Text fontWeight="600">
                              {new Date(account.contract_end_date).toLocaleDateString('fr-FR')}
                            </Text>
                          </Box>
                        )}
                        {account.contract_start_date && account.contract_end_date && (
                          <Box>
                            <Text fontSize="sm" color="gray.600">Durée</Text>
                            <Text fontWeight="600">
                              {Math.ceil(
                                (new Date(account.contract_end_date) - new Date(account.contract_start_date)) /
                                (1000 * 60 * 60 * 24 * 30)
                              )}{' '}
                              mois
                            </Text>
                          </Box>
                        )}
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Contract Stats */}
                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Total Documents</StatLabel>
                          <StatNumber fontSize="lg">{contractStats.total}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Actifs</StatLabel>
                          <StatNumber fontSize="lg" color="green.500">{contractStats.active}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>À renouveler</StatLabel>
                          <StatNumber fontSize="lg" color="orange.500">{contractStats.expiring}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Expirés</StatLabel>
                          <StatNumber fontSize="lg" color="red.500">{contractStats.expired}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Documents Table */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Documents contractuels</Heading>
                    </CardHeader>
                    <CardBody>
                      {contracts.length === 0 ? (
                        <VStack py={8}>
                          <Text color="gray.500">Aucun document disponible</Text>
                        </VStack>
                      ) : (
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Document</Th>
                              <Th>Type</Th>
                              <Th>Version</Th>
                              <Th>Date de signature</Th>
                              <Th>Expiration</Th>
                              <Th>Statut</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {contracts.map((contract) => (
                              <Tr key={contract.id}>
                                <Td fontWeight="600">{contract.document_name}</Td>
                                <Td>
                                  <Badge>{documentTypeLabels[contract.document_type]}</Badge>
                                </Td>
                                <Td>{contract.version || '-'}</Td>
                                <Td>
                                  {contract.signed_date
                                    ? new Date(contract.signed_date).toLocaleDateString('fr-FR')
                                    : '-'}
                                </Td>
                                <Td>
                                  {contract.expiry_date ? (
                                    <Text
                                      fontSize="sm"
                                      color={
                                        new Date(contract.expiry_date) < new Date()
                                          ? 'red.500'
                                          : Math.ceil((new Date(contract.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) <= 30
                                          ? 'orange.500'
                                          : 'inherit'
                                      }
                                    >
                                      {new Date(contract.expiry_date).toLocaleDateString('fr-FR')}
                                    </Text>
                                  ) : (
                                    '-'
                                  )}
                                </Td>
                                <Td>
                                  <Badge colorScheme={contract.is_active ? 'green' : 'gray'}>
                                    {contract.is_active ? 'Actif' : 'Inactif'}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="brand"
                                    as="a"
                                    href={contract.document_url}
                                    target="_blank"
                                  >
                                    Télécharger
                                  </Button>
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
      </Container>

      {/* Add Member Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ajouter un membre</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleAddMember}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="membre@entreprise.com"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Nom complet</FormLabel>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Budget mensuel (€)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.monthly_budget}
                    onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
                    placeholder="100"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Rôle</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="member">Membre</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrateur</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" colorScheme="brand">
                Ajouter
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}
