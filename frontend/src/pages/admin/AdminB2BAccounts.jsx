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
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'
import {
  FiRefreshCw,
  FiPlus,
  FiEdit,
  FiMoreVertical,
  FiCheck,
  FiX,
  FiPause,
  FiTrash2
} from 'react-icons/fi'
import { useBusinessAccounts } from '../../hooks/useB2B'
import { useAuth } from '../../context/AuthContext'

const BusinessFormModal = ({ isOpen, onClose, business, onSubmit }) => {
  const isEdit = !!business
  const [formData, setFormData] = useState(business || {
    company_name: '',
    siret: '',
    vat_number: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    billing_email: '',
    billing_address_street: '',
    billing_address_postal_code: '',
    billing_address_city: '',
    status: 'pending'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    await onSubmit(formData)
    setSaving(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEdit ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Nom de l'entreprise</FormLabel>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>SIRET</FormLabel>
                <Input
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  placeholder="12345678901234"
                  maxLength={14}
                />
              </FormControl>

              <FormControl>
                <FormLabel>N° TVA Intracommunautaire</FormLabel>
                <Input
                  value={formData.vat_number}
                  onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                  placeholder="FR12345678901"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contact principal</FormLabel>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email de contact</FormLabel>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@entreprise.fr"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Téléphone</FormLabel>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </FormControl>

              <FormControl isRequired gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel>Email de facturation</FormLabel>
                <Input
                  type="email"
                  value={formData.billing_email}
                  onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                  placeholder="compta@entreprise.fr"
                />
              </FormControl>
            </SimpleGrid>

            <Box w="full">
              <Heading size="sm" mb={3}>Adresse de facturation</Heading>
              <VStack spacing={3}>
                <FormControl isRequired>
                  <FormLabel>Rue</FormLabel>
                  <Input
                    value={formData.billing_address_street}
                    onChange={(e) => setFormData({ ...formData, billing_address_street: e.target.value })}
                    placeholder="123 rue de la Paix"
                  />
                </FormControl>

                <SimpleGrid columns={2} spacing={3} w="full">
                  <FormControl isRequired>
                    <FormLabel>Code postal</FormLabel>
                    <Input
                      value={formData.billing_address_postal_code}
                      onChange={(e) => setFormData({ ...formData, billing_address_postal_code: e.target.value })}
                      placeholder="75001"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Ville</FormLabel>
                    <Input
                      value={formData.billing_address_city}
                      onChange={(e) => setFormData({ ...formData, billing_address_city: e.target.value })}
                      placeholder="Paris"
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>

            <FormControl>
              <FormLabel>Statut</FormLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="cancelled">Annulé</option>
              </Select>
            </FormControl>
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

export default function AdminB2BAccounts() {
  const { businesses, loading, error, refresh, createBusiness, updateBusiness, approveBusiness } = useBusinessAccounts()
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')

  const handleCreate = () => {
    setSelectedBusiness(null)
    onOpen()
  }

  const handleEdit = (business) => {
    setSelectedBusiness(business)
    onOpen()
  }

  const handleSubmit = async (formData) => {
    let result
    if (selectedBusiness) {
      result = await updateBusiness(selectedBusiness.id, formData)
    } else {
      result = await createBusiness(formData)
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
        title: selectedBusiness ? 'Entreprise mise à jour' : 'Entreprise créée',
        status: 'success',
        duration: 3000
      })
      refresh()
    }
  }

  const handleApprove = async (businessId) => {
    const { error } = await approveBusiness(businessId, user.id)
    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Entreprise approuvée',
        description: 'Le compte est maintenant actif',
        status: 'success',
        duration: 3000
      })
    }
  }

  const handleStatusChange = async (businessId, newStatus) => {
    const { error } = await updateBusiness(businessId, { status: newStatus })
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
        status: 'success',
        duration: 3000
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'En attente', colorScheme: 'yellow' },
      approved: { label: 'Approuvé', colorScheme: 'blue' },
      active: { label: 'Actif', colorScheme: 'green' },
      suspended: { label: 'Suspendu', colorScheme: 'orange' },
      cancelled: { label: 'Annulé', colorScheme: 'red' }
    }

    const config = statusConfig[status] || { label: status, colorScheme: 'gray' }

    return (
      <Badge colorScheme={config.colorScheme} fontSize="xs">
        {config.label}
      </Badge>
    )
  }

  const stats = {
    total: businesses.length,
    active: businesses.filter(b => b.status === 'active').length,
    pending: businesses.filter(b => b.status === 'pending').length,
    suspended: businesses.filter(b => b.status === 'suspended').length
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">Comptes B2B</Heading>
          <Text color="gray.600" mt={1}>
            Gérer les entreprises clientes
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
            onClick={handleCreate}
          >
            Nouvelle entreprise
          </Button>
        </HStack>
      </HStack>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card bg={bgColor}>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Total</Text>
            <Heading size="lg">{stats.total}</Heading>
          </CardBody>
        </Card>
        <Card bg={bgColor}>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Actifs</Text>
            <Heading size="lg" color="green.500">{stats.active}</Heading>
          </CardBody>
        </Card>
        <Card bg={bgColor}>
          <CardBody>
            <Text fontSize="sm" color="gray.600">En attente</Text>
            <Heading size="lg" color="yellow.500">{stats.pending}</Heading>
          </CardBody>
        </Card>
        <Card bg={bgColor}>
          <CardBody>
            <Text fontSize="sm" color="gray.600">Suspendus</Text>
            <Heading size="lg" color="orange.500">{stats.suspended}</Heading>
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

      {/* Businesses Table */}
      <Card bg={bgColor}>
        <CardHeader>
          <Heading size="md">Entreprises ({businesses.length})</Heading>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="brand.500" />
            </Box>
          ) : businesses.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">Aucune entreprise pour le moment</Text>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="brand"
                mt={4}
                onClick={handleCreate}
              >
                Créer la première entreprise
              </Button>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Entreprise</Th>
                    <Th>Contact</Th>
                    <Th>SIRET</Th>
                    <Th>Email facturation</Th>
                    <Th>Statut</Th>
                    <Th>Créé le</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {businesses.map((business) => (
                    <Tr key={business.id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {business.company_name}
                          </Text>
                          {business.vat_number && (
                            <Text fontSize="xs" color="gray.500">
                              TVA: {business.vat_number}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{business.contact_name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {business.contact_phone}
                          </Text>
                        </VStack>
                      </Td>
                      <Td fontSize="sm">{business.siret}</Td>
                      <Td fontSize="sm">{business.billing_email}</Td>
                      <Td>{getStatusBadge(business.status)}</Td>
                      <Td fontSize="sm">
                        {new Date(business.created_at).toLocaleDateString('fr-FR')}
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <IconButton
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(business)}
                            aria-label="Edit"
                          />
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              size="sm"
                              variant="ghost"
                              aria-label="More options"
                            />
                            <MenuList>
                              {business.status === 'pending' && (
                                <MenuItem
                                  icon={<FiCheck />}
                                  onClick={() => handleApprove(business.id)}
                                >
                                  Approuver
                                </MenuItem>
                              )}
                              {business.status === 'active' && (
                                <MenuItem
                                  icon={<FiPause />}
                                  onClick={() => handleStatusChange(business.id, 'suspended')}
                                >
                                  Suspendre
                                </MenuItem>
                              )}
                              {business.status === 'suspended' && (
                                <MenuItem
                                  icon={<FiCheck />}
                                  onClick={() => handleStatusChange(business.id, 'active')}
                                >
                                  Réactiver
                                </MenuItem>
                              )}
                              <MenuItem
                                icon={<FiX />}
                                color="red.500"
                                onClick={() => handleStatusChange(business.id, 'cancelled')}
                              >
                                Annuler
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Form Modal */}
      <BusinessFormModal
        isOpen={isOpen}
        onClose={onClose}
        business={selectedBusiness}
        onSubmit={handleSubmit}
      />
    </VStack>
  )
}
