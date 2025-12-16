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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Textarea
} from '@chakra-ui/react'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUpload,
  FiRefreshCw,
  FiMoreVertical,
  FiMail,
  FiCheck,
  FiX
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useBusinessEmployees } from '../hooks/useB2B'
import { supabase } from '../supabaseClient'

const EmployeeFormModal = ({ isOpen, onClose, employee, onSubmit }) => {
  const isEdit = !!employee
  const [formData, setFormData] = useState(employee || {
    email: '',
    first_name: '',
    last_name: '',
    department: '',
    job_title: '',
    role: 'employee',
    individual_budget_monthly: 0,
    status: 'invited'
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
          {isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Prénom</FormLabel>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Jean"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nom</FormLabel>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Dupont"
                />
              </FormControl>

              <FormControl isRequired gridColumn={{ base: 'span 1', md: 'span 2' }}>
                <FormLabel>Email professionnel</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean.dupont@entreprise.fr"
                  isDisabled={isEdit}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Département</FormLabel>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Commercial, IT, RH..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Poste</FormLabel>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Responsable commercial..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Rôle</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="employee">Employé</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrateur</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Budget mensuel (€)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.individual_budget_monthly}
                  onChange={(e) => setFormData({ ...formData, individual_budget_monthly: parseFloat(e.target.value) || 0 })}
                  placeholder="100.00"
                />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit} isLoading={saving}>
            {isEdit ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const CSVImportModal = ({ isOpen, onClose, onImport }) => {
  const [csvContent, setCsvContent] = useState('')
  const [importing, setImporting] = useState(false)
  const toast = useToast()

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCsvContent(event.target.result)
      }
      reader.readAsText(file)
    }
  }

  const handleImport = async () => {
    if (!csvContent.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier CSV',
        status: 'error',
        duration: 3000
      })
      return
    }

    setImporting(true)

    try {
      const lines = csvContent.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim())

      const employees = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const employee = {}
        headers.forEach((header, idx) => {
          employee[header] = values[idx]
        })
        return employee
      })

      await onImport(employees)
      onClose()
      setCsvContent('')
    } catch (err) {
      toast({
        title: 'Erreur d\'import',
        description: err.message,
        status: 'error',
        duration: 5000
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Importer des employés (CSV)</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" rounded="md">
              <AlertIcon />
              <VStack align="start" spacing={1} fontSize="sm">
                <Text fontWeight="bold">Format CSV attendu :</Text>
                <Text>email, first_name, last_name, department, job_title, budget</Text>
                <Text fontSize="xs" color="gray.600">
                  Exemple: jean@entreprise.fr, Jean, Dupont, IT, Développeur, 100
                </Text>
              </VStack>
            </Alert>

            <FormControl>
              <FormLabel>Sélectionner un fichier CSV</FormLabel>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                p={1}
              />
            </FormControl>

            {csvContent && (
              <FormControl>
                <FormLabel>Aperçu du contenu</FormLabel>
                <Textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  rows={10}
                  fontFamily="mono"
                  fontSize="sm"
                />
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleImport}
            isLoading={importing}
            isDisabled={!csvContent}
          >
            Importer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function EmployeeManagement() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loadingBusiness, setLoadingBusiness] = useState(true)
  const toast = useToast()

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure()
  const { isOpen: isCSVOpen, onOpen: onCSVOpen, onClose: onCSVClose } = useDisclosure()

  const [selectedEmployee, setSelectedEmployee] = useState(null)

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
  const { employees, loading, error, refresh, addEmployee, updateEmployee, removeEmployee, importEmployeesCSV } = useBusinessEmployees(businessId)

  const handleAdd = () => {
    setSelectedEmployee(null)
    onFormOpen()
  }

  const handleEdit = (employee) => {
    setSelectedEmployee(employee)
    onFormOpen()
  }

  const handleSubmit = async (formData) => {
    let result
    if (selectedEmployee) {
      result = await updateEmployee(selectedEmployee.id, formData)
    } else {
      result = await addEmployee(formData)
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
        title: selectedEmployee ? 'Employé mis à jour' : 'Employé ajouté',
        description: selectedEmployee ? 'Les informations ont été mises à jour' : 'Une invitation sera envoyée par email',
        status: 'success',
        duration: 3000
      })
      onFormClose()
      refresh()
    }
  }

  const handleRemove = async (employeeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet employé ?')) return

    const { error } = await removeEmployee(employeeId)

    if (error) {
      toast({
        title: 'Erreur',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Employé retiré',
        status: 'success',
        duration: 3000
      })
    }
  }

  const handleCSVImport = async (csvData) => {
    const { error } = await importEmployeesCSV(csvData)

    if (error) {
      toast({
        title: 'Erreur d\'import',
        description: error,
        status: 'error',
        duration: 5000
      })
    } else {
      toast({
        title: 'Import réussi',
        description: `${csvData.length} employés ont été ajoutés`,
        status: 'success',
        duration: 3000
      })
      refresh()
    }
  }

  const handleStatusChange = async (employeeId, newStatus) => {
    const { error } = await updateEmployee(employeeId, { status: newStatus })

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
      invited: { label: 'Invité', colorScheme: 'blue' },
      active: { label: 'Actif', colorScheme: 'green' },
      suspended: { label: 'Suspendu', colorScheme: 'orange' },
      removed: { label: 'Retiré', colorScheme: 'red' }
    }

    const config = statusConfig[status] || { label: status, colorScheme: 'gray' }

    return (
      <Badge colorScheme={config.colorScheme} fontSize="xs">
        {config.label}
      </Badge>
    )
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      employee: { label: 'Employé', colorScheme: 'gray' },
      manager: { label: 'Manager', colorScheme: 'purple' },
      admin: { label: 'Administrateur', colorScheme: 'red' }
    }

    const config = roleConfig[role] || { label: role, colorScheme: 'gray' }

    return (
      <Badge colorScheme={config.colorScheme} fontSize="xs">
        {config.label}
      </Badge>
    )
  }

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    invited: employees.filter(e => e.status === 'invited').length,
    totalBudget: employees.reduce((sum, e) => sum + (e.individual_budget_monthly || 0), 0)
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
            <Heading size="lg">Gestion des employés</Heading>
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
              leftIcon={<FiUpload />}
              onClick={onCSVOpen}
              variant="outline"
              colorScheme="brand"
            >
              Import CSV
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={handleAdd}
            >
              Ajouter un employé
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
              <Text fontSize="sm" color="gray.600">Invités</Text>
              <Heading size="lg" color="blue.500">{stats.invited}</Heading>
            </CardBody>
          </Card>
          <Card bg={bgColor}>
            <CardBody>
              <Text fontSize="sm" color="gray.600">Budget total</Text>
              <Heading size="lg">{stats.totalBudget.toFixed(0)}€</Heading>
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

        {/* Employees Table */}
        <Card bg={bgColor}>
          <CardHeader>
            <Heading size="md">Employés ({employees.length})</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="brand.500" />
              </Box>
            ) : employees.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text color="gray.500" mb={4}>Aucun employé pour le moment</Text>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="brand"
                  onClick={handleAdd}
                >
                  Ajouter le premier employé
                </Button>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nom</Th>
                      <Th>Email</Th>
                      <Th>Département</Th>
                      <Th>Poste</Th>
                      <Th>Rôle</Th>
                      <Th>Budget mensuel</Th>
                      <Th>Statut</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {employees.map((employee) => (
                      <Tr key={employee.id}>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium">
                            {employee.first_name} {employee.last_name}
                          </Text>
                        </Td>
                        <Td fontSize="sm">{employee.email}</Td>
                        <Td fontSize="sm">{employee.department || '-'}</Td>
                        <Td fontSize="sm">{employee.job_title || '-'}</Td>
                        <Td>{getRoleBadge(employee.role)}</Td>
                        <Td fontSize="sm">{employee.individual_budget_monthly?.toFixed(2) || 0}€</Td>
                        <Td>{getStatusBadge(employee.status)}</Td>
                        <Td>
                          <HStack spacing={1}>
                            <IconButton
                              icon={<FiEdit />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(employee)}
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
                                {employee.status === 'invited' && (
                                  <MenuItem
                                    icon={<FiMail />}
                                    onClick={() => {
                                      toast({
                                        title: 'Invitation envoyée',
                                        status: 'success',
                                        duration: 3000
                                      })
                                    }}
                                  >
                                    Renvoyer l'invitation
                                  </MenuItem>
                                )}
                                {employee.status === 'active' && (
                                  <MenuItem
                                    icon={<FiX />}
                                    onClick={() => handleStatusChange(employee.id, 'suspended')}
                                  >
                                    Suspendre
                                  </MenuItem>
                                )}
                                {employee.status === 'suspended' && (
                                  <MenuItem
                                    icon={<FiCheck />}
                                    onClick={() => handleStatusChange(employee.id, 'active')}
                                  >
                                    Réactiver
                                  </MenuItem>
                                )}
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  color="red.500"
                                  onClick={() => handleRemove(employee.id)}
                                >
                                  Retirer définitivement
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
        <EmployeeFormModal
          isOpen={isFormOpen}
          onClose={onFormClose}
          employee={selectedEmployee}
          onSubmit={handleSubmit}
        />

        {/* CSV Import Modal */}
        <CSVImportModal
          isOpen={isCSVOpen}
          onClose={onCSVClose}
          onImport={handleCSVImport}
        />
      </VStack>
    </Container>
  )
}
